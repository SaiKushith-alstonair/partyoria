from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from decimal import Decimal
import logging

from .models import Event, Budget
from .budget_engine import BudgetEngine

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def allocate_budget(request, event_id):
    """Generate smart budget allocation - UNIFIED API"""
    try:
        event = get_object_or_404(Event, id=event_id, user=request.user)
        
        # Extract event data safely
        form_data = event.form_data or {}
        event_type = form_data.get('event_type') or event.event_type or 'corporate'
        total_budget = Decimal(str(form_data.get('budget') or event.total_budget or 200000))
        attendees = int(form_data.get('attendees') or event.attendees or 50)
        
        # Parse duration safely
        duration_raw = form_data.get('duration') or event.duration or 4
        if isinstance(duration_raw, str) and '-' in duration_raw:
            duration = int(duration_raw.split('-')[0])
        else:
            duration = int(duration_raw)
        
        # Extract location and date for market intelligence
        location = form_data.get('location') or form_data.get('city') or 'tier3'
        event_date = None
        if form_data.get('event_date'):
            try:
                from datetime import datetime
                event_date = datetime.fromisoformat(form_data['event_date'].replace('Z', '+00:00'))
            except:
                event_date = None
        
        # Get selected services
        selected_services = []
        if event.special_requirements:
            for req_id, req_data in event.special_requirements.items():
                if isinstance(req_data, dict) and req_data.get('selected'):
                    selected_services.append(req_id)
        
        if event.selected_services:
            selected_services.extend(event.selected_services)
        
        # Generate INTELLIGENT MARKET-DRIVEN allocation
        budget_items = BudgetEngine.smart_allocate(
            event_type=event_type,
            selected_services=selected_services,
            total_budget=total_budget,
            attendees=attendees,
            duration=duration,
            special_requirements=event.special_requirements,
            location=location,
            event_date=event_date
        )
        
        # Calculate breakdown
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
            budget.allocation_method = 'market_intelligent'
            budget.efficiency_score = BudgetEngine._calculate_efficiency_score(breakdown, location, attendees)
            budget.save()
        
        return Response({
            'success': True,
            'allocations': breakdown,
            'total_budget': float(total_budget),
            'event_type': event_type,
            'attendees': attendees,
            'duration': duration
        })
        
    except Exception as e:
        logger.error(f"Budget allocation failed: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_budget(request, event_id):
    """Update manual budget allocation"""
    try:
        event = get_object_or_404(Event, id=event_id, user=request.user)
        allocations_data = request.data.get('allocations', {})
        
        # Convert to Decimal
        allocations = {}
        for category, percentage in allocations_data.items():
            allocations[category] = Decimal(str(percentage))
        
        # Validate using THE ONLY ENGINE
        is_valid, errors = BudgetEngine.validate_allocation(allocations, event.total_budget)
        
        if not is_valid:
            return Response({
                'success': False,
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create budget items for breakdown
        budget_items = {}
        for category, percentage in allocations.items():
            amount = (event.total_budget * percentage / Decimal('100')).quantize(Decimal('0.01'))
            per_guest = (amount / event.attendees).quantize(Decimal('0.01')) if event.attendees > 0 else Decimal('0')
            per_hour = (amount / event.duration).quantize(Decimal('0.01')) if event.duration > 0 else Decimal('0')
            
            budget_items[category] = type('BudgetItem', (), {
                'category': category,
                'percentage': percentage,
                'amount': amount,
                'per_guest': per_guest,
                'per_hour': per_hour,
                'locked': False
            })()
        
        breakdown = BudgetEngine.calculate_breakdown(budget_items)
        
        # Save to database
        budget, created = Budget.objects.get_or_create(
            event=event,
            defaults={
                'user': event.user,
                'total_budget': event.total_budget,
                'allocation_method': 'manual'
            }
        )
        
        budget.allocations = breakdown
        budget.allocation_method = 'manual'
        budget.save()
        
        return Response({
            'success': True,
            'allocations': breakdown
        })
        
    except Exception as e:
        logger.error(f"Budget update failed: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_budget(request):
    """Real-time budget validation"""
    try:
        allocations_data = request.data.get('allocations', {})
        total_budget = Decimal(str(request.data.get('total_budget', 200000)))
        
        # Convert to Decimal
        allocations = {}
        for category, percentage in allocations_data.items():
            allocations[category] = Decimal(str(percentage))
        
        is_valid, errors = BudgetEngine.validate_allocation(allocations, total_budget)
        
        return Response({
            'valid': is_valid,
            'errors': errors,
            'total_percentage': float(sum(allocations.values()))
        })
        
    except Exception as e:
        return Response({
            'valid': False,
            'errors': [str(e)]
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rebalance_budget(request, event_id):
    """Rebalance budget allocation"""
    try:
        event = get_object_or_404(Event, id=event_id, user=request.user)
        allocations_data = request.data.get('allocations', {})
        locked_categories = request.data.get('locked_categories', [])
        
        # Convert to Decimal
        allocations = {}
        for category, percentage in allocations_data.items():
            allocations[category] = Decimal(str(percentage))
        
        # Rebalance using THE ONLY ENGINE
        rebalanced = BudgetEngine.rebalance_allocation(allocations, locked_categories)
        
        return Response({
            'success': True,
            'allocations': {k: float(v) for k, v in rebalanced.items()}
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_budget_summary(request, event_id):
    """Get comprehensive budget summary"""
    try:
        event = get_object_or_404(Event, id=event_id, user=request.user)
        
        # Try to get existing budget
        try:
            budget = Budget.objects.get(event=event)
            allocations = budget.allocations or {}
        except Budget.DoesNotExist:
            # Generate new allocation
            form_data = event.form_data or {}
            event_type = form_data.get('event_type') or event.event_type or 'corporate'
            total_budget = Decimal(str(form_data.get('budget') or event.total_budget or 200000))
            attendees = int(form_data.get('attendees') or event.attendees or 50)
            
            duration_raw = form_data.get('duration') or event.duration or 4
            if isinstance(duration_raw, str) and '-' in duration_raw:
                duration = int(duration_raw.split('-')[0])
            else:
                duration = int(duration_raw)
            
            selected_services = []
            if event.special_requirements:
                for req_id, req_data in event.special_requirements.items():
                    if isinstance(req_data, dict) and req_data.get('selected'):
                        selected_services.append(req_id)
            
            # Extract location for market intelligence
            location = form_data.get('location') or form_data.get('city') or 'tier3'
            event_date = None
            if form_data.get('event_date'):
                try:
                    from datetime import datetime
                    event_date = datetime.fromisoformat(form_data['event_date'].replace('Z', '+00:00'))
                except:
                    event_date = None
            
            budget_items = BudgetEngine.smart_allocate(
                event_type=event_type,
                selected_services=selected_services,
                total_budget=total_budget,
                attendees=attendees,
                duration=duration,
                special_requirements=event.special_requirements,
                location=location,
                event_date=event_date
            )
            
            allocations = BudgetEngine.calculate_breakdown(budget_items)
        
        total_allocated = sum(float(alloc.get('amount', 0)) for alloc in allocations.values())
        remaining = float(event.total_budget) - total_allocated
        
        return Response({
            'event': {
                'id': event.id,
                'name': event.event_name,
                'type': event.event_type,
                'attendees': event.attendees,
                'venue_type': event.venue_type or 'indoor',
                'duration': event.duration,
                'total_budget': str(event.total_budget)
            },
            'allocations': [
                {
                    'category': category,
                    'display_name': alloc.get('display_name', category),
                    'percentage': alloc.get('percentage', 0),
                    'amount': str(alloc.get('amount', 0)),
                    'per_guest': alloc.get('per_guest', 0),
                    'per_hour': alloc.get('per_hour', 0),
                    'required': alloc.get('required', False)
                }
                for category, alloc in allocations.items()
            ],
            'summary': {
                'total_allocated': str(total_allocated),
                'remaining_budget': str(remaining),
                'efficiency_score': 90,
                'allocation_count': len(allocations)
            },
            'has_allocation': len(allocations) > 0
        })
        
    except Exception as e:
        logger.error(f"Budget summary failed: {e}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_market_insights(request, event_id):
    """Get real-time market intelligence for budget planning"""
    try:
        event = get_object_or_404(Event, id=event_id, user=request.user)
        form_data = event.form_data or {}
        
        event_type = form_data.get('event_type') or event.event_type or 'corporate'
        location = form_data.get('location') or form_data.get('city') or 'tier3'
        attendees = int(form_data.get('attendees') or event.attendees or 50)
        total_budget = Decimal(str(form_data.get('budget') or event.total_budget or 200000))
        
        event_date = None
        if form_data.get('event_date'):
            try:
                from datetime import datetime
                event_date = datetime.fromisoformat(form_data['event_date'].replace('Z', '+00:00'))
            except:
                event_date = None
        
        insights = BudgetEngine.get_market_insights(
            event_type=event_type,
            location=location,
            attendees=attendees,
            total_budget=total_budget,
            event_date=event_date
        )
        
        return Response({
            'success': True,
            'insights': insights
        })
        
    except Exception as e:
        logger.error(f"Market insights failed: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_competitor_analysis(request):
    """Get competitor analysis for market positioning"""
    try:
        event_type = request.GET.get('event_type', 'corporate')
        location = request.GET.get('location', 'tier3')
        budget_range = request.GET.get('budget_range', 'mid_range')
        
        analysis = BudgetEngine.get_competitor_analysis(
            event_type=event_type,
            location=location,
            budget_range=budget_range
        )
        
        return Response({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        logger.error(f"Competitor analysis failed: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

