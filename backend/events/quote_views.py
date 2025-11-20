from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models
from datetime import timedelta, datetime
from decimal import Decimal
from .models import Event, QuoteRequest
from authentication.models import CustomUser
from vendors.models import VendorProfile
from notifications.services import VendorNotifications, CustomerNotifications

def parse_event_date(date_string):
    """Parse event date from various formats"""
    if not date_string:
        return timezone.now().date()
    
    try:
        # Try parsing different date formats
        if 'T' in date_string:
            # ISO format with time
            return datetime.fromisoformat(date_string.replace('Z', '+00:00')).date()
        elif '-' in date_string and len(date_string) == 10:
            # YYYY-MM-DD format
            return datetime.strptime(date_string, '%Y-%m-%d').date()
        else:
            # Fallback to current date
            return timezone.now().date()
    except:
        return timezone.now().date()

@api_view(['POST'])
@permission_classes([])
def send_quote_requests(request, event_id):
    """Send quote requests to matched vendors after budget completion"""
    try:
        # Get event regardless of user for development
        event = get_object_or_404(Event, id=event_id)
        
        # Check if specific vendor IDs are provided (for marketplace targeted quotes)
        vendor_ids = request.data.get('vendor_ids', [])
        additional_message = request.data.get('additional_message', '')
        
        if vendor_ids:
            # Targeted quote request from marketplace
            matched_vendors = CustomUser.objects.filter(id__in=vendor_ids, user_type='vendor', is_active=True)
            categories = set()
        else:
            # Get matched vendors based on event requirements
            matched_vendors, categories = match_vendors_to_event(event)
        
        if not matched_vendors:
            return Response({
                'success': False,
                'message': 'No matching vendors found for this event. Please check if vendors are available in your area or try expanding your service requirements.',
                'vendors_searched': 0,
                'categories_searched': list(categories) if categories else []
            }, status=status.HTTP_200_OK)
        
        # Get user for quote request
        if request.user.is_authenticated:
            quote_user = request.user
        else:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                quote_user = User.objects.get(id=2)  # saiku user
            except User.DoesNotExist:
                quote_user = None
        
        # Get services for quote
        services = event.services or []
        if event.selected_services:
            services.extend(event.selected_services)
        if event.form_data and event.form_data.get('selectedServices'):
            services.extend(event.form_data['selectedServices'])
        services = list(set(services))  # Remove duplicates
        
        # Get budget allocations from event
        budget_allocations = get_budget_allocations(event)
        
        # Map vendors to their categories and budgets
        vendor_category_map = {}
        for vendor in matched_vendors:
            vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()
            vendor_category = get_vendor_category(vendor)
            vendor_category_map[vendor_name] = {
                'category': vendor_category,
                'budget': budget_allocations.get(vendor_category, {}).get('amount', 0),
                'percentage': budget_allocations.get(vendor_category, {}).get('percentage', 0)
            }
        
        # Create quote request
        description = event.form_data.get('description', '') if event.form_data else ''
        if additional_message:
            description = f"{description}\n\nAdditional Message: {additional_message}" if description else additional_message
        
        quote_request = QuoteRequest.objects.create(
            event_type=event.event_type,
            event_name=event.event_name,
            client_name=event.form_data.get('clientName', 'Customer') if event.form_data else 'Customer',
            client_email=event.form_data.get('clientEmail', '') if event.form_data else '',
            client_phone=event.form_data.get('clientPhone', '') if event.form_data else '',
            event_date=parse_event_date(event.form_data.get('dateTime') if event.form_data else None),
            location=f"{event.form_data.get('city', '')}, {event.form_data.get('state', '')}" if event.form_data else '',
            guest_count=event.attendees or 0,
            budget_range=f"₹{event.total_budget}",
            services=services,
            description=description,
            urgency='medium',
            user=quote_user,
            source_event=event,
            selected_vendors=[f"{v.first_name} {v.last_name}".strip() for v in matched_vendors],
            category_specific_data=vendor_category_map,
            quote_type='targeted' if vendor_ids else 'comprehensive'
        )
        
        # Send notifications to real vendors
        notifications_sent = 0
        
        for vendor in matched_vendors:
            try:
                VendorNotifications.new_quote_request(
                    vendor,
                    event.form_data.get('clientName', 'Customer') if event.form_data else 'Customer',
                    event.event_type,
                    event.form_data.get('dateTime', 'TBD') if event.form_data else 'TBD',
                    quote_request.id
                )
                notifications_sent += 1
            except Exception as e:
                print(f"Failed to send notification to {vendor.first_name} {vendor.last_name}: {e}")
        
        # Set status to vendors_notified (real vendors will respond later)
        quote_request.status = 'vendors_notified'
        quote_request.save()
        
        return Response({
            'success': True,
            'message': f'Quote requests sent to {len(matched_vendors)} vendors successfully',
            'quote_request_id': quote_request.id,
            'vendor_count': len(matched_vendors),
            'vendors_contacted': [{
                'name': f"{v.first_name} {v.last_name}".strip(),
                'business': v.business or 'General',
                'category': map_service_to_category(v.business or 'general'),
                'location': v.location or 'Not specified'
            } for v in matched_vendors],
            'notifications_sent': notifications_sent,
            'categories_matched': list(categories)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_quote_requests(request):
    """Get pending quote requests for vendor"""
    try:
        print(f"[VENDOR QUOTES] Authenticated user: {request.user.email}, ID: {request.user.id}, Type: {request.user.user_type}")
        vendor = request.user
        if vendor.user_type != 'vendor':
            return Response({'success': False, 'error': 'Vendor access required'}, status=status.HTTP_403_FORBIDDEN)
        
        vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()
        print(f"[VENDOR QUOTES] Found vendor: {vendor_name}, ID: {vendor.id}, Business: {vendor.business}")
        
        quote_requests = QuoteRequest.objects.filter(
            selected_vendors__contains=vendor_name,
            status__in=['pending', 'vendors_notified']
        ).order_by('-created_at')
        print(f"[VENDOR QUOTES] Found {quote_requests.count()} quote requests for vendor {vendor_name}")
        
        data = []
        for qr in quote_requests:
            # Get vendor-specific budget
            vendor_data = qr.category_specific_data.get(vendor_name, {})
            vendor_budget = vendor_data.get('budget', 0)
            vendor_category = vendor_data.get('category', 'general')
            vendor_percentage = vendor_data.get('percentage', 0)
            
            data.append({
                'id': qr.id,
                'event_name': qr.event_name,
                'event_type': qr.event_type,
                'client_name': qr.client_name,
                'client_email': qr.client_email,
                'client_phone': qr.client_phone,
                'event_date': qr.event_date,
                'location': qr.location,
                'guest_count': qr.guest_count,
                'budget_range': qr.budget_range,
                'vendor_budget': vendor_budget,
                'vendor_category': vendor_category,
                'budget_percentage': vendor_percentage,
                'services': qr.services,
                'description': qr.description,
                'urgency': qr.urgency,
                'status': qr.status,
                'created_at': qr.created_at
            })
        
        return Response({
            'success': True,
            'quote_requests': data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quote_request_detail(request, quote_id):
    """Get detailed quote request information"""
    try:
        vendor = request.user
        if vendor.user_type != 'vendor':
            return Response({'success': False, 'error': 'Vendor access required'}, status=status.HTTP_403_FORBIDDEN)
        
        vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()
        quote_request = get_object_or_404(QuoteRequest, id=quote_id)
        
        # Check if vendor is in selected vendors
        if vendor_name not in quote_request.selected_vendors:
            return Response({
                'success': False,
                'error': 'Not authorized for this quote'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get vendor-specific data
        vendor_data = quote_request.category_specific_data.get(vendor_name, {})
        vendor_budget = vendor_data.get('budget', 0)
        vendor_category = vendor_data.get('category', 'general')
        vendor_percentage = vendor_data.get('percentage', 0)
        
        # Check if vendor has already responded
        has_responded = vendor_name in (quote_request.vendor_responses or {})
        
        return Response({
            'success': True,
            'quote_request': {
                'id': quote_request.id,
                'event': {
                    'name': quote_request.event_name,
                    'type': quote_request.event_type,
                    'date': quote_request.event_date.isoformat() if quote_request.event_date else None,
                    'duration': '4 hours',
                    'location': quote_request.location,
                    'attendees': quote_request.guest_count,
                    'description': quote_request.description,
                    'special_requirements': {}
                },
                'client': {
                    'name': quote_request.client_name,
                    'email': quote_request.client_email,
                    'phone': quote_request.client_phone
                },
                'vendor_category': vendor_category,
                'vendor_budget': vendor_budget,
                'budget_percentage': vendor_percentage,
                'has_responded': has_responded
            }
        })
        
    except QuoteRequest.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Quote request not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quote(request, quote_id):
    """Submit quote response"""
    try:
        vendor = request.user
        if vendor.user_type != 'vendor':
            return Response({'success': False, 'error': 'Vendor access required'}, status=status.HTTP_403_FORBIDDEN)
        
        vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()
        quote_request = get_object_or_404(QuoteRequest, id=quote_id)
        
        # Check if vendor is in selected vendors
        if vendor_name not in quote_request.selected_vendors:
            return Response({
                'success': False,
                'error': 'Not authorized for this quote'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Validate input
        quote_amount = request.data.get('quote_amount')
        if not quote_amount or float(quote_amount) <= 0:
            return Response({
                'success': False,
                'error': 'Valid quote amount required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Store quote response in quote request
        vendor_responses = quote_request.vendor_responses or {}
        vendor_responses[vendor_name] = {
            'quote_amount': float(quote_amount),
            'message': request.data.get('message', ''),
            'includes': request.data.get('includes', []),
            'excludes': request.data.get('excludes', []),
            'terms': request.data.get('terms', ''),
            'submitted_at': timezone.now().isoformat(),
            'vendor_id': vendor.id,
            'vendor_business': vendor.business,
            'vendor_location': vendor.location
        }
        
        quote_request.vendor_responses = vendor_responses
        quote_request.status = 'responses_received'
        quote_request.save()
        
        # Notify customer
        if quote_request.user:
            CustomerNotifications.quote_received(
                quote_request.user,
                vendor_name,
                float(quote_amount),
                quote_request.event_type,
                quote_request.id
            )
        
        return Response({
            'success': True,
            'message': 'Quote submitted successfully'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_quotes(request, event_id):
    """Get all quotes for an event (customer view)"""
    try:
        # Find quote requests for this user's events
        quote_requests = QuoteRequest.objects.filter(
            user=request.user,
            source_event_id=event_id,
            status__in=['responses_received', 'completed']
        )
        
        data = []
        for qr in quote_requests:
            if qr.vendor_responses:
                for vendor_name, response in qr.vendor_responses.items():
                    data.append({
                        'id': f"{qr.id}_{vendor_name}",
                        'quote_request_id': qr.id,
                        'vendor': {
                            'name': vendor_name,
                            'business': response.get('vendor_business', ''),
                            'location': response.get('vendor_location', ''),
                            'experience': 'Professional'
                        },
                        'service_type': ', '.join(qr.services),
                        'quote_amount': response.get('quote_amount', 0),
                        'message': response.get('message', ''),
                        'includes': response.get('includes', []),
                        'excludes': response.get('excludes', []),
                        'terms': response.get('terms', ''),
                        'submitted_at': response.get('submitted_at', qr.created_at)
                    })
        
        return Response({
            'success': True,
            'quotes': data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_quote(request, quote_id):
    """Accept a vendor quote"""
    try:
        quote_request = get_object_or_404(QuoteRequest, id=quote_id, user=request.user)
        vendor_name = request.data.get('vendor_name')
        
        if not vendor_name or vendor_name not in quote_request.vendor_responses:
            return Response({'success': False, 'error': 'Vendor not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update vendor response status
        quote_request.vendor_responses[vendor_name]['status'] = 'accepted'
        quote_request.status = 'completed'
        quote_request.save()
        
        return Response({'success': True, 'message': 'Quote accepted successfully'})
        
    except QuoteRequest.DoesNotExist:
        return Response({'success': False, 'error': 'Quote not found'}, status=status.HTTP_404_NOT_FOUND)

# Helper functions
def match_vendors_to_event(event):
    """Match real vendors based on event services and location"""
    matched_vendors = []
    
    # Get services from multiple sources
    services = event.services or []
    selected_services = event.selected_services or []
    form_services = event.form_data.get('selectedServices', []) if event.form_data else []
    
    # Also check special requirements for additional services
    special_req_services = []
    if event.special_requirements:
        for req_id, req_data in event.special_requirements.items():
            if req_data.get('selected'):
                category = map_service_to_category(req_id)
                special_req_services.append(category)
    
    # Combine all service sources
    all_services = list(set(services + selected_services + form_services + special_req_services))
    
    if not all_services:
        event_type_services = get_default_services_for_event_type(event.event_type)
        all_services = event_type_services
    
    # Map services to vendor categories
    categories = set()
    for service in all_services:
        category = map_service_to_category(service)
        categories.add(category)
    
    # Get location from event
    location = event.form_data.get('city', '') if event.form_data else ''
    
    try:
        # Get all active vendors first
        vendors_query = CustomUser.objects.filter(user_type='vendor', is_active=True)
        
        # Filter by location if available
        if location:
            location_vendors = vendors_query.filter(
                models.Q(city__icontains=location) | 
                models.Q(location__icontains=location)
            )
            if location_vendors.exists():
                vendors_query = location_vendors
        
        # Match vendors by multiple criteria
        for category in categories:
            # 1. Match by business field in CustomUser
            business_vendors = vendors_query.filter(business__icontains=category)
            matched_vendors.extend(business_vendors)
            
            # 2. Match by services in VendorProfile.profile_data (handles both string and array)
            profile_vendors = vendors_query.filter(
                vendor_profile__profile_data__services__icontains=category
            )
            matched_vendors.extend(profile_vendors)
            
            # 3. Match by VendorService.category
            service_vendors = vendors_query.filter(
                vendor_services__category__icontains=category
            )
            matched_vendors.extend(service_vendors)
            
            # 4. Match by name (first_name or last_name)
            name_vendors = vendors_query.filter(
                models.Q(first_name__icontains=category) | 
                models.Q(last_name__icontains=category)
            )
            matched_vendors.extend(name_vendors)
        
        # If no category matches, get all available vendors
        if not matched_vendors:
            matched_vendors = list(vendors_query.all())
        
        # Remove duplicates
        seen = set()
        unique_vendors = []
        for vendor in matched_vendors:
            if vendor.id not in seen:
                seen.add(vendor.id)
                unique_vendors.append(vendor)
        
        return unique_vendors, categories
            
    except Exception as e:
        print(f"Error finding vendors: {e}")
        return [], categories

def get_default_services_for_event_type(event_type):
    """Get default services based on event type"""
    defaults = {
        'wedding': ['photography', 'videography', 'catering', 'decoration', 'flowers', 'venue'],
        'birthday': ['catering', 'decoration', 'entertainment', 'photography'],
        'corporate': ['catering', 'venue', 'entertainment', 'photography'],
        'festival': ['entertainment', 'decoration', 'security', 'catering'],
        'other': ['catering', 'photography', 'venue']
    }
    return defaults.get(event_type, ['catering', 'photography', 'venue'])

def map_service_to_category(service):
    """Map service name to vendor category"""
    service_lower = service.lower()
    
    # Catering Services
    if any(word in service_lower for word in ['catering', 'food', 'menu', 'chef', 'kitchen', 'meal', 'buffet', 'dining']):
        return 'catering'
    
    # Photography Services
    elif any(word in service_lower for word in ['photography', 'photo', 'camera', 'photographer', 'portrait', 'candid']):
        return 'photography'
    
    # Videography Services
    elif any(word in service_lower for word in ['videography', 'video', 'film', 'cinematography', 'recording']):
        return 'videography'
    
    # Entertainment Services
    elif any(word in service_lower for word in ['entertainment', 'music', 'dj', 'band', 'singer', 'performer', 'artist']):
        return 'entertainment'
    
    # Decoration Services
    elif any(word in service_lower for word in ['decoration', 'decor', 'setup', 'design', 'styling', 'theme']):
        return 'decoration'  # Changed from 'decorations' to match budget key
    
    # Venue Services
    elif any(word in service_lower for word in ['venue', 'hall', 'location', 'banquet', 'resort', 'hotel']):
        return 'venue'
    
    # Floral Services
    elif any(word in service_lower for word in ['flower', 'floral', 'bouquet', 'garland', 'arrangement']):
        return 'flowers'
    
    # Transportation Services
    elif any(word in service_lower for word in ['transport', 'vehicle', 'car', 'bus', 'travel']):
        return 'transportation'
    
    # Makeup & Beauty Services
    elif any(word in service_lower for word in ['makeup', 'beauty', 'hair', 'styling', 'mehendi', 'spa']):
        return 'beauty'
    
    # Security Services
    elif any(word in service_lower for word in ['security', 'guard', 'safety', 'protection']):
        return 'security'
    
    # Event Planning Services
    elif any(word in service_lower for word in ['planning', 'coordinator', 'management', 'organizer']):
        return 'planning'
    
    else:
        return 'general'



def get_budget_allocations(event):
    """Get budget allocations from event's Budget model"""
    try:
        budget = event.budget
        allocations = budget.allocations if budget.allocations else {}
        
        # Normalize keys to match vendor categories
        normalized = {}
        for key, value in allocations.items():
            # Map budget keys to vendor categories
            category = map_budget_key_to_category(key)
            normalized[category] = value
        
        return normalized
    except:
        # Fallback: calculate default allocations
        total = float(event.total_budget)
        return {
            'photography': {'amount': total * 0.20, 'percentage': 20},
            'videography': {'amount': total * 0.15, 'percentage': 15},
            'catering': {'amount': total * 0.40, 'percentage': 40},
            'decoration': {'amount': total * 0.15, 'percentage': 15},
            'entertainment': {'amount': total * 0.10, 'percentage': 10}
        }

def map_budget_key_to_category(budget_key):
    """Map budget allocation keys to vendor categories"""
    key_lower = budget_key.lower()
    
    # Direct matches
    if 'photography' in key_lower or 'photo' in key_lower:
        return 'photography'
    elif 'videography' in key_lower or 'video' in key_lower:
        return 'videography'
    elif 'catering' in key_lower or 'food' in key_lower:
        return 'catering'
    elif 'decoration' in key_lower or 'decor' in key_lower:
        return 'decoration'
    elif 'entertainment' in key_lower or 'music' in key_lower:
        return 'entertainment'
    elif 'venue' in key_lower or 'hall' in key_lower:
        return 'venue'
    elif 'flower' in key_lower or 'floral' in key_lower:
        return 'flowers'
    elif 'transport' in key_lower:
        return 'transportation'
    elif 'security' in key_lower:
        return 'security'
    else:
        return budget_key.lower()

def get_vendor_category(vendor):
    """Get primary category for vendor"""
    # Check business field first
    if vendor.business:
        category = map_service_to_category(vendor.business)
        # Normalize to match budget keys
        if category == 'decorations':
            return 'decoration'
        return category
    
    # Check VendorProfile services
    try:
        if hasattr(vendor, 'vendor_profile') and vendor.vendor_profile:
            services = vendor.vendor_profile.profile_data.get('services', [])
            if services:
                if isinstance(services, list) and services:
                    category = map_service_to_category(services[0])
                elif isinstance(services, str) and services:
                    category = map_service_to_category(services.split(',')[0])
                else:
                    category = 'general'
                
                # Normalize
                if category == 'decorations':
                    return 'decoration'
                return category
    except:
        pass
    
    # Check VendorService
    try:
        service = vendor.vendor_services.first()
        if service:
            category = map_service_to_category(service.category)
            if category == 'decorations':
                return 'decoration'
            return category
    except:
        pass
    
    return 'general'