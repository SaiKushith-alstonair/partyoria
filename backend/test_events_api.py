#!/usr/bin/env python
import os
import sys
import django
from django.conf import settings

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

def test_events_api():
    try:
        from events.models import Event
        from events.serializers import EventSerializer
        from events.views import EventViewSet
        
        print("[OK] All imports successful")
        
        # Test model query
        events = Event.objects.all()
        print(f"[OK] Found {events.count()} events in database")
        
        # Test serializer
        if events.exists():
            event = events.first()
            serializer = EventSerializer(event)
            print(f"[OK] Serializer works: {event.event_name}")
        
        # Test viewset instantiation
        viewset = EventViewSet()
        print("[OK] ViewSet instantiation successful")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_events_api()