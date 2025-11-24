from rest_framework import viewsets, status
from django.db import models, transaction
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.db.models import Q
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.core.exceptions import ValidationError, ObjectDoesNotExist
import logging
import json
from typing import Dict, List, Any
from decimal import Decimal
import decimal

# Import error handling and validation
from partyoria.error_handlers import ErrorHandler, safe_execute
from partyoria.validation_layers import ValidationLayer, EventValidationMixin
from .models import Event, Budget, TraditionStyle, EventSection, EventSubsection, EventImage, EventRequirement, RequirementQuestion, EventRequirementImages, VendorCategory, HeroVideo, EventMilestone, QuoteRequest, RSVP
from .serializers import EventSerializer, TraditionStyleSerializer, EventSectionSerializer, EventImageSerializer, EventRequirementSerializer, RequirementQuestionSerializer, VendorCategorySerializer, HeroVideoSerializer, EventMilestoneSerializer, QuoteRequestSerializer, RSVPSerializer
from .budget_engine import BudgetEngine

logger = logging.getLogger(__name__)

class EventViewSet(viewsets.ModelViewSet, EventValidationMixin):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get_queryset(self):
        """Return events for authenticated user only"""
        return Event.objects.filter(user=self.request.user).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """List events for authenticated user with error handling"""
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            error_response = ErrorHandler.handle_generic_error(e, 'list_events')
            return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to handle event deletion with proper error handling"""
        try:
            instance = self.get_object()
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error deleting event: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def update(self, request, *args, **kwargs):
        """Override update with proper validation and error handling"""
        try:
            with transaction.atomic():
                instance = self.get_object()
                
                # Validate user permissions
                if instance.user and instance.user != request.user:
                    error_response = ErrorHandler.handle_permission_error(
                        "Cannot update another user's event", 'update_event'
                    )
                    return Response(error_response, status=status.HTTP_403_FORBIDDEN)
                
                # Validate input data if provided
                if request.data:
                    validated_data, validation_error = safe_execute(
                        self.validate_event_data, request.data.copy()
                    )
                    
                    if validation_error:
                        return Response(validation_error, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Update request data with validated data
                    request._full_data = validated_data
                
                return super().update(request, *args, **kwargs)
                
        except ObjectDoesNotExist:
            error_response = ErrorHandler.handle_not_found_error('Event', 'update_event')
            return Response(error_response, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            error_response = ErrorHandler.handle_validation_error(e, 'update_event')
            return Response(error_response, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            error_response = ErrorHandler.handle_generic_error(e, 'update_event')
            return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def partial_update(self, request, *args, **kwargs):
        """Override partial_update to handle form_data properly"""
        try:
            return super().partial_update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error updating event: {str(e)}")
            return Response(
                {'error': f'Failed to update event: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_permissions(self):
        """Override permissions for specific actions"""
        if self.action in ['get_hero_video', 'get_states', 'get_cities', 'get_traditions_by_event_type', 'get_event_sections', 'get_event_images', 'get_event_requirements', 'get_vendor_categories']:
            return []
        return super().get_permissions()
    
    def create(self, request, *args, **kwargs):
        """Create event with comprehensive validation and error handling"""
        try:
            with transaction.atomic():
                logger.info("Creating new event")
                
                # Validate and sanitize input data
                validated_data, validation_error = safe_execute(
                    self.validate_event_data, request.data.copy()
                )
                
                if validation_error:
                    return Response(validation_error, status=status.HTTP_400_BAD_REQUEST)
                
                # Filter out invalid fields that don't exist in Event model
                valid_fields = ['event_name', 'form_data', 'special_requirements', 'selected_services', 'user_id', 'created_by']
                filtered_data = {k: v for k, v in validated_data.items() if k in valid_fields}
                
                # Ensure required nested data structures
                filtered_data.setdefault('form_data', {})
                filtered_data.setdefault('special_requirements', {})
                filtered_data.setdefault('selected_services', [])
                
                # Replace request data with validated data
                request._full_data = filtered_data
                
                return super().create(request, *args, **kwargs)
        
        except ValidationError as e:
            error_response = ErrorHandler.handle_validation_error(e, 'create_event')
            return Response(error_response, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            error_response = ErrorHandler.handle_generic_error(e, 'create_event')
            return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def perform_create(self, serializer):
        """Automatically assign the authenticated user to the event"""
        form_data = self.request.data.get('form_data', {})
        
        event_type = self.request.data.get('event_type') or form_data.get('event_type', 'other')
        attendees = self.request.data.get('attendees') or form_data.get('attendees', 50)
        duration_str = form_data.get('duration', '4')
        
        try:
            if isinstance(duration_str, str) and '-' in duration_str:
                duration = int(duration_str.split('-')[0])
            else:
                duration = int(duration_str)
        except (ValueError, TypeError):
            duration = 4
        
        total_budget = self.request.data.get('total_budget') or form_data.get('budget', 10000)
        services = self.request.data.get('services', [])
        if not services or len(services) == 0:
            services = ['general']
        
        venue_type = 'indoor'
        
        serializer.save(
            user=self.request.user,
            created_by=f"{self.request.user.first_name} {self.request.user.last_name}".strip() or self.request.user.username,
            event_type=event_type,
            attendees=attendees,
            duration=duration,
            total_budget=total_budget,
            venue_type=venue_type,
            services=services
        )

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        
        events = self.queryset
        
        if query:
            events = events.filter(
                Q(event_name__icontains=query) |
                Q(form_data__icontains=query)
            )
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='states', permission_classes=[])
    def get_states(self, request):
        """Get all unique states from locations table with error handling"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT DISTINCT state FROM locations ORDER BY state")
                states = cursor.fetchall()
                states_list = [{"name": state[0]} for state in states if state[0]]
                return Response({"states": states_list})
        except Exception as e:
            logger.error(f"Error fetching states: {str(e)}")
            return Response({"states": [], "error": "Failed to fetch states"})

    @action(detail=False, methods=['get'], url_path='cities', permission_classes=[])
    def get_cities(self, request):
        """Get cities for a specific state from locations table with validation"""
        try:
            state_name = request.query_params.get('state')
            if not state_name:
                return Response({"cities": [], "error": "State parameter is required"})
            
            # Validate and sanitize state name
            state_name = ValidationLayer.validate_text_field(
                state_name, max_length=100, field_name="State"
            )
            
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT city FROM locations WHERE state = %s ORDER BY city", 
                    [state_name]
                )
                cities = cursor.fetchall()
                cities_list = [{"name": city[0]} for city in cities if city[0]]
                return Response({"cities": cities_list})
                
        except ValidationError as e:
            error_response = ErrorHandler.handle_validation_error(e, 'get_cities')
            return Response(error_response, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error fetching cities: {str(e)}")
            return Response({"cities": [], "error": "Failed to fetch cities"})

    @action(detail=False, methods=['get'], url_path='traditions/by_event_type', permission_classes=[])
    def get_traditions_by_event_type(self, request):
        """Get tradition styles for a specific event type"""
        event_type = request.query_params.get('event_type')
        if not event_type:
            return Response([])
        
        try:
            traditions = TraditionStyle.objects.filter(event_type=event_type)
            serializer = TraditionStyleSerializer(traditions, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response([])

    @action(detail=False, methods=['get'], url_path='sections')
    def get_event_sections(self, request):
        """Get all event sections with subsections"""
        try:
            sections = EventSection.objects.prefetch_related('subsections').all()
            serializer = EventSectionSerializer(sections, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response([])

    @action(detail=False, methods=['get'], url_path='images')
    def get_event_images(self, request):
        """Get event images"""
        try:
            images = EventImage.objects.all()
            serializer = EventImageSerializer(images, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response([])

    @action(detail=False, methods=['get'], url_path='requirements', permission_classes=[])
    def get_event_requirements(self, request):
        """Get event requirements by event_id, with fallback to all requirements"""
        event_id = request.query_params.get('event_id')
        if not event_id:
            return Response([])
        
        try:
            # First try to get event-specific requirements
            requirements = EventRequirement.objects.filter(event_id=event_id)
            
            # If no event-specific requirements found, return all requirements
            if not requirements.exists():
                requirements = EventRequirement.objects.all()
            
            serializer = EventRequirementSerializer(requirements, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response([])
    
    @action(detail=False, methods=['get'], url_path='dynamic-requirements')
    def get_dynamic_requirements(self, request):
        """Get dynamic requirements for an event type"""
        event_type = request.query_params.get('event_type')
        subsection_id = request.query_params.get('subsection_id')
        
        if not event_type and not subsection_id:
            return Response({})
        
        try:
            # Use subsection_id first, then event_type
            search_id = subsection_id or event_type
            
            # Get requirements for this specific event
            requirements = EventRequirement.objects.filter(event_id=search_id)
            
            # Group requirements by category
            grouped_requirements = {}
            for req in requirements:
                if req.category_name not in grouped_requirements:
                    grouped_requirements[req.category_name] = []
                
                req_data = {
                    'id': req.requirement_id,
                    'label': req.label,
                    'category': req.category
                }
                
                if req.unit:
                    req_data['unit'] = req.unit
                if req.placeholder:
                    req_data['placeholder'] = req.placeholder
                
                grouped_requirements[req.category_name].append(req_data)
            
            return Response(grouped_requirements)
        
        except Exception as e:
            return Response({})

    @action(detail=False, methods=['get'], url_path='vendor-categories')
    def get_vendor_categories(self, request):
        """Get vendor categories"""
        try:
            categories = VendorCategory.objects.all()
            serializer = VendorCategorySerializer(categories, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response([])

    @action(detail=False, methods=['get'], url_path='hero-video', permission_classes=[])
    def get_hero_video(self, request):
        """Get active hero video"""
        try:
            video = HeroVideo.objects.filter(is_active=True).first()
            if video:
                serializer = HeroVideoSerializer(video)
                return Response(serializer.data)
            return Response({'video_url': '/videos/party-hero.mp4'})
        except Exception as e:
            return Response({'video_url': '/videos/party-hero.mp4'})

    
    @action(detail=False, methods=['get'], url_path='requirement-questions', permission_classes=[])
    def get_requirement_questions(self, request):
        """Get dynamic questions for a specific requirement"""
        requirement_id = request.query_params.get('requirement_id')
        event_id = request.query_params.get('event_id')
        
        try:
            # Find requirement by requirement_id and event_id
            filters = {'requirement_id': requirement_id}
            if event_id:
                filters['event_id'] = event_id
            
            requirement = EventRequirement.objects.filter(**filters).first()
            
            if requirement:
                # Use the requirement object (foreign key) to find questions
                questions = RequirementQuestion.objects.filter(requirement=requirement)
                serializer = RequirementQuestionSerializer(questions, many=True)
                
                return Response({
                    'requirement': {
                        'id': requirement.requirement_id,
                        'label': requirement.label,
                        'category': requirement.category
                    },
                    'questions': serializer.data
                })
            
            return Response({'questions': []})
            
        except Exception as e:
            return Response({'questions': []}, status=200)
    
    @action(detail=False, methods=['get'], url_path='requirement-images', permission_classes=[])
    def get_requirement_images(self, request):
        """Get images for a specific requirement"""
        requirement_name = request.query_params.get('requirement_name')
        event_name = request.query_params.get('event_name')
        
        if not requirement_name:
            return Response({'error': 'requirement_name is required'}, status=400)
        
        try:
            # Match both event_name and requirement_name
            if event_name:
                images = EventRequirementImages.objects.filter(
                    event_name=event_name,
                    requirement_name=requirement_name
                ).order_by('image_number')
            else:
                images = EventRequirementImages.objects.filter(
                    requirement_name=requirement_name
                ).order_by('image_number')
            
            image_urls = [img.image_url for img in images]
            
            return Response({
                'requirement_name': requirement_name,
                'event_name': event_name,
                'images': image_urls
            })
            
        except Exception as e:
            return Response({'images': []}, status=200)
    
    @action(detail=True, methods=['post'], url_path='allocate-budget')
    def allocate_budget(self, request, pk=None):
        """Generate smart budget allocation using THE ONLY ENGINE"""
        try:
            with transaction.atomic():
                event = self.get_object()
                
                if event.user and event.user != request.user:
                    return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
                
                form_data = event.form_data or {}
                event_type = form_data.get('event_type') or getattr(event, 'event_type', 'corporate')
                
                attendees_raw = form_data.get('attendees') or getattr(event, 'attendees', 50)
                try:
                    attendees = int(attendees_raw)
                except (ValueError, TypeError):
                    attendees = 50
                
                duration_raw = form_data.get('duration') or getattr(event, 'duration', 4)
                try:
                    if isinstance(duration_raw, str):
                        duration = int(duration_raw.split('-')[0]) if '-' in duration_raw else 4
                    else:
                        duration = int(duration_raw)
                except (ValueError, TypeError):
                    duration = 4
                
                budget_raw = form_data.get('budget') or getattr(event, 'total_budget', 200000)
                try:
                    total_budget = Decimal(str(budget_raw))
                except (ValueError, TypeError, decimal.InvalidOperation):
                    total_budget = Decimal('200000')
                
                special_requirements = getattr(event, 'special_requirements', {}) or {}
                selected_services = getattr(event, 'selected_services', []) or []
                
                if selected_services:
                    for service in selected_services:
                        if service not in special_requirements:
                            special_requirements[service] = {'selected': True}
                
                # Generate allocation using THE ONLY ENGINE
                budget_items = BudgetEngine.smart_allocate(
                    event_type=event_type,
                    selected_services=selected_services,
                    total_budget=total_budget,
                    attendees=attendees,
                    duration=duration,
                    special_requirements=special_requirements
                )
                
                breakdown = BudgetEngine.calculate_breakdown(budget_items)
                
                # Save to database
                budget, created = Budget.objects.get_or_create(
                    event=event,
                    defaults={
                        'user': event.user,
                        'total_budget': total_budget,
                        'allocations': breakdown,
                        'allocation_method': 'smart',
                        'efficiency_score': 90.0,
                        'cost_per_guest': total_budget / attendees if attendees > 0 else None,
                        'cost_per_hour': total_budget / duration if duration > 0 else None
                    }
                )
                
                if not created:
                    budget.allocations = breakdown
                    budget.allocation_method = 'smart'
                    budget.efficiency_score = 90.0
                    budget.save()
                
                return Response({
                    'message': 'Budget allocated successfully',
                    'allocations': list(breakdown.values()),
                    'total_budget': str(total_budget),
                    'efficiency_score': 90.0
                })
                
        except Exception as e:
            logger.error(f"Budget allocation failed: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Milestone API endpoints
from rest_framework.decorators import api_view

@api_view(['GET', 'POST', 'PUT'])
def event_milestones(request, event_id=None):
    if request.method == 'GET':
        try:
            milestone = EventMilestone.objects.get(event_id=event_id)
            serializer = EventMilestoneSerializer(milestone)
            return Response(serializer.data)
        except EventMilestone.DoesNotExist:
            return Response({'milestones': {}}, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        try:
            event = Event.objects.get(id=event_id)
            milestone, created = EventMilestone.objects.get_or_create(
                event=event,
                defaults={'milestones': request.data.get('milestones', {})}
            )
            if not created:
                milestone.milestones = request.data.get('milestones', {})
                milestone.save()
            
            serializer = EventMilestoneSerializer(milestone)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Event.DoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'PUT':
        try:
            milestone = EventMilestone.objects.get(event_id=event_id)
            milestone.milestones = request.data.get('milestones', {})
            milestone.save()
            serializer = EventMilestoneSerializer(milestone)
            return Response(serializer.data)
        except EventMilestone.DoesNotExist:
            return Response({'error': 'Milestone not found'}, status=status.HTTP_404_NOT_FOUND)

class QuoteRequestViewSet(viewsets.ModelViewSet):
    queryset = QuoteRequest.objects.all().order_by('-created_at')
    serializer_class = QuoteRequestSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get_queryset(self):
        """Filter quote requests by authenticated user and event"""
        event_id = self.request.query_params.get('event_id')
        if event_id:
            return QuoteRequest.objects.filter(
                user=self.request.user, 
                source_event_id=event_id
            ).order_by('-created_at')
        return QuoteRequest.objects.filter(
            user=self.request.user, 
            source_event__isnull=False
        ).order_by('-created_at')

class RSVPViewSet(viewsets.ModelViewSet):
    queryset = RSVP.objects.all().order_by('-created_at')
    serializer_class = RSVPSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get_queryset(self):
        """Filter RSVPs by authenticated user only"""
        return RSVP.objects.filter(user=self.request.user).order_by('-created_at')