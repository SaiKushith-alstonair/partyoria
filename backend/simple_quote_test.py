#!/usr/bin/env python
"""
Simple test to check if quote models work
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from events.models import QuoteRequest, Event
from django.contrib.auth import get_user_model

User = get_user_model()

def simple_test():
    """Simple test of quote functionality"""
    print("=== Simple Quote Test ===")
    
    try:
        # Count existing records
        quote_count = QuoteRequest.objects.count()
        event_count = Event.objects.count()
        user_count = User.objects.count()
        
        print(f"Existing QuoteRequests: {quote_count}")
        print(f"Existing Events: {event_count}")
        print(f"Existing Users: {user_count}")
        
        # Get user ID 2 (saiku)
        try:
            user = User.objects.get(id=2)
            print(f"Found user: {user.username}")
        except User.DoesNotExist:
            print("User ID 2 not found")
            return
        
        # Get or create an event
        if event_count > 0:
            event = Event.objects.first()
            print(f"Using existing event: {event.event_name} (ID: {event.id})")
        else:
            print("No events found")
            return
        
        # Try to create a quote request
        quote_data = {
            'event_type': 'birthday',
            'event_name': 'Test Quote',
            'client_name': 'Test Client',
            'client_email': 'test@example.com',
            'event_date': '2024-12-25',
            'location': 'Mumbai',
            'guest_count': 50,
            'budget_range': '50000',
            'services': ['catering'],
            'description': 'Test quote request',
            'user': user,
            'prefilled_event_id': event.id,
            'selected_vendors': ['Test Vendor'],
            'quote_type': 'targeted'
        }
        
        quote_request = QuoteRequest.objects.create(**quote_data)
        print(f"Created QuoteRequest with ID: {quote_request.id}")
        print(f"Quote status: {quote_request.status}")
        
        # Test filtering
        event_quotes = QuoteRequest.objects.filter(prefilled_event_id=event.id)
        print(f"Quotes for event {event.id}: {event_quotes.count()}")
        
        user_quotes = QuoteRequest.objects.filter(user=user)
        print(f"Quotes for user {user.username}: {user_quotes.count()}")
        
        print("=== Test Complete - Models Working ===")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    simple_test()