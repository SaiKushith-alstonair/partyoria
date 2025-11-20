from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from decimal import Decimal
import json
from .models import Event
from .budget_core_new import BudgetEngine, BudgetItem

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def allocate_budget(request, event_id):
    """Generate smart budget allocation"""
    try:
        event = get_object_or_404(Event, id=event_id, user=request.user)
        
        # Extract event data
        form_data = event.form_data or {}
        event_type = form_data.get('event_type', 'corporate')
        total_budget = Decimal(str(form_data.get('budget', 200000)))
        attendees = int(form_data.get('attendees', 50))
        duration = int(form_data.get('duration', 4))
        
        # Get selected services
        selected_services = []
        if event.special_requirements:
            for req_id, req_data in event.special_requirements.items():
                if isinstance(req_data, dict) and req_data.get('selected'):
                    selected_services.append(req_id)
        
        # Generate allocation
        budget_items = BudgetEngine.auto_allocate(
            event_type, selected_services, total_budget, attendees, event.special_requirements
        )
        
        # Calculate breakdown
        breakdown = BudgetEngine.calculate_cost_breakdown(
            budget_items, attendees, duration
        )
        
        # Save to event
        event.budget_allocations = breakdown
        event.save()
        
        return Response({
            'success': True,
            'allocations': breakdown,
            'total_budget': float(total_budget),
            'event_type': event_type,
            'attendees': attendees,
            'duration': duration
        })
        
    except Exception as e:
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
        
        # Validate
        form_data = event.form_data or {}
        total_budget = Decimal(str(form_data.get('budget', 200000)))
        
        is_valid, errors = BudgetEngine.validate_allocation(allocations, total_budget)
        
        if not is_valid:
            return Response({
                'success': False,
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create budget items
        budget_items = {}
        for category, percentage in allocations.items():
            amount = (total_budget * percentage / Decimal('100')).quantize(Decimal('0.01'))
            budget_items[category] = BudgetItem(category, percentage, amount)
        
        # Calculate breakdown
        attendees = int(form_data.get('attendees', 50))
        duration = int(form_data.get('duration', 4))
        breakdown = BudgetEngine.calculate_cost_breakdown(budget_items, attendees, duration)
        
        # Save
        event.budget_allocations = breakdown
        event.save()
        
        return Response({
            'success': True,
            'allocations': breakdown
        })
        
    except Exception as e:
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
        
        # Rebalance
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
        form_data = event.form_data or {}
        
        # Calculate summary
        allocations = event.budget_allocations or {}
        total_budget = Decimal(str(form_data.get('budget', 200000)))
        
        total_allocated = sum(Decimal(str(alloc.get('amount', 0))) for alloc in allocations.values())
        remaining = total_budget - total_allocated
        
        # Calculate efficiency score
        efficiency_score = 85  # Base score
        if len(allocations) >= 5:
            efficiency_score += 10
        if remaining <= total_budget * Decimal('0.05'):
            efficiency_score += 5
        
        return Response({
            'event': {
                'id': event.id,
                'name': event.event_name,
                'type': form_data.get('event_type', 'corporate'),
                'attendees': int(form_data.get('attendees', 50)),
                'venue_type': event.venue_type or 'indoor',
                'duration': int(form_data.get('duration', 4)),
                'total_budget': str(total_budget)
            },
            'allocations': [
                {
                    'category': category,
                    'percentage': alloc.get('percentage', 0),
                    'amount': str(alloc.get('amount', 0))
                }
                for category, alloc in allocations.items()
            ],
            'summary': {
                'total_allocated': str(total_allocated),
                'remaining_budget': str(remaining),
                'efficiency_score': min(100, efficiency_score),
                'allocation_count': len(allocations)
            },
            'has_allocation': len(allocations) > 0
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)