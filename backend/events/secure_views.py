from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from partyoria.security_core import SecurityCore, require_auth, rate_limit
from partyoria.secure_views import SecureAPIView, validate_event_data, validate_search_params, validate_id_param
from .models import Event
import json
import logging

logger = logging.getLogger(__name__)

@require_http_methods(["GET"])
@rate_limit(max_attempts=200, window=3600)
def secure_events_list(request):
    """Secure events list endpoint"""
    def validate_params(params):
        return validate_search_params(params)
    
    def handle_request(request, validated_params):
        # Get user's events only
        events = Event.objects.filter(user=request.user)
        
        # Apply search filter if provided
        if 'q' in validated_params:
            events = events.filter(event_name__icontains=validated_params['q'])
        
        # Apply pagination
        limit = validated_params.get('limit', 20)
        offset = validated_params.get('offset', 0)
        events = events[offset:offset + limit]
        
        # Serialize safely
        events_data = []
        for event in events:
            events_data.append({
                'id': event.id,
                'event_name': SecurityCore.validate_input(event.event_name, 'name'),
                'created_at': event.created_at.isoformat() if event.created_at else None,
                'attendees': event.attendees,
                'total_budget': float(event.total_budget) if event.total_budget else 0,
            })
        
        return events_data
    
    return SecureAPIView.secure_get(request, validate_params, handle_request)

@require_http_methods(["POST"])
@csrf_protect
def secure_events_create(request):
    """Secure event creation endpoint"""
    def handle_request(request, validated_data):
        # Create event with validated data
        event = Event.objects.create(
            user=request.user,
            event_name=validated_data['event_name'],
            attendees=validated_data.get('attendees'),
            total_budget=validated_data.get('budget'),
            form_data={
                'client_name': validated_data.get('client_name', ''),
                'client_email': validated_data.get('client_email', ''),
                'client_phone': validated_data.get('client_phone', ''),
                'description': validated_data.get('description', ''),
            }
        )
        
        return {
            'id': event.id,
            'event_name': event.event_name,
            'created_at': event.created_at.isoformat(),
        }
    
    return SecureAPIView.secure_post(request, validate_event_data, handle_request)

@require_http_methods(["GET"])
@rate_limit(max_attempts=200, window=3600)
def secure_event_detail(request, event_id):
    """Secure event detail endpoint"""
    def validate_params(params):
        return {'id': SecurityCore.validate_id(event_id)}
    
    def handle_request(request, validated_params):
        try:
            event = Event.objects.get(
                id=validated_params['id'],
                user=request.user  # Ensure user owns the event
            )
        except Event.DoesNotExist:
            raise ValidationError("Event not found")
        
        return {
            'id': event.id,
            'event_name': SecurityCore.validate_input(event.event_name, 'name'),
            'attendees': event.attendees,
            'total_budget': float(event.total_budget) if event.total_budget else 0,
            'created_at': event.created_at.isoformat() if event.created_at else None,
            'form_data': event.form_data or {},
        }
    
    return SecureAPIView.secure_get(request, validate_params, handle_request)

@require_http_methods(["PUT"])
@csrf_protect
def secure_event_update(request, event_id):
    """Secure event update endpoint"""
    def handle_request(request, validated_data):
        try:
            event = Event.objects.get(
                id=SecurityCore.validate_id(event_id),
                user=request.user  # Ensure user owns the event
            )
        except Event.DoesNotExist:
            raise ValidationError("Event not found")
        
        # Update with validated data
        if 'event_name' in validated_data:
            event.event_name = validated_data['event_name']
        if 'attendees' in validated_data:
            event.attendees = validated_data['attendees']
        if 'budget' in validated_data:
            event.total_budget = validated_data['budget']
        
        # Update form_data safely
        if event.form_data is None:
            event.form_data = {}
        
        for field in ['client_name', 'client_email', 'client_phone', 'description']:
            if field in validated_data:
                event.form_data[field] = validated_data[field]
        
        event.save()
        
        return {
            'id': event.id,
            'event_name': event.event_name,
            'updated_at': event.updated_at.isoformat() if event.updated_at else None,
        }
    
    return SecureAPIView.secure_post(request, validate_event_data, handle_request)

@require_http_methods(["DELETE"])
@csrf_protect
def secure_event_delete(request, event_id):
    """Secure event deletion endpoint"""
    def validate_params(params):
        return {'id': SecurityCore.validate_id(event_id)}
    
    def handle_request(request, validated_params):
        try:
            event = Event.objects.get(
                id=validated_params['id'],
                user=request.user  # Ensure user owns the event
            )
        except Event.DoesNotExist:
            raise ValidationError("Event not found")
        
        event.delete()
        return {'deleted': True}
    
    return SecureAPIView.secure_get(request, validate_params, handle_request)