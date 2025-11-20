from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

@csrf_exempt
@require_http_methods(["GET"])
def test_minimal_events(request):
    """Minimal test endpoint to check if basic Django is working"""
    try:
        # Import here to catch any import errors
        from events.models import Event
        
        # Simple query
        events = Event.objects.all()
        count = events.count()
        
        # Get first event if exists
        first_event = None
        if events.exists():
            event = events.first()
            first_event = {
                'id': event.id,
                'name': event.event_name,
                'type': event.event_type,
                'created_at': event.created_at.isoformat() if event.created_at else None
            }
        
        return JsonResponse({
            'status': 'success',
            'count': count,
            'first_event': first_event,
            'message': 'Minimal test successful'
        })
        
    except Exception as e:
        import traceback
        return JsonResponse({
            'status': 'error',
            'error': str(e),
            'traceback': traceback.format_exc()
        }, status=500)