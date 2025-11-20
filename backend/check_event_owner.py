#!/usr/bin/env python
"""
Check event ownership
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from events.models import Event
from django.contrib.auth import get_user_model

User = get_user_model()

def check_event_owner():
    """Check who owns event ID 1"""
    try:
        event = Event.objects.get(id=1)
        print(f"Event ID 1: {event.event_name}")
        print(f"Owner: {event.user}")
        print(f"Owner ID: {event.user.id if event.user else 'None'}")
        print(f"Owner username: {event.user.username if event.user else 'None'}")
        
        # Check all events and their owners
        print("\nAll events:")
        for event in Event.objects.all()[:5]:
            print(f"  Event {event.id}: {event.event_name} - Owner: {event.user.username if event.user else 'None'} (ID: {event.user.id if event.user else 'None'})")
            
    except Event.DoesNotExist:
        print("Event ID 1 does not exist")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    check_event_owner()