#!/usr/bin/env python
"""
Test script to verify quote management endpoints are working
"""
import os
import sys
import django
import requests
import json

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from events.models import Event, QuoteRequest
from django.contrib.auth import get_user_model

User = get_user_model()

def test_quote_endpoints():
    """Test the quote management endpoints"""
    base_url = "http://127.0.0.1:8000/api"
    
    print("=== Testing Quote Management Endpoints ===")
    
    # First, check if we have any events
    try:
        events = Event.objects.all()
        print(f"Found {events.count()} events in database")
        
        if events.count() == 0:
            print("No events found. Creating a test event...")
            # Create a test event
            user = User.objects.get(id=2)  # saiku user
            event = Event.objects.create(
                event_name="Test Event for Quotes",
                event_type="birthday",
                attendees=50,
                total_budget=50000,
                services=["catering", "decoration"],
                user=user,
                form_data={
                    "clientName": "Test Client",
                    "clientEmail": "test@example.com",
                    "city": "Mumbai",
                    "state": "Maharashtra"
                }
            )
            print(f"Created test event with ID: {event.id}")
        else:
            event = events.first()
            print(f"Using existing event: {event.event_name} (ID: {event.id})")
        
        event_id = event.id
        
        # Test 1: Get quote status
        print(f"\n1. Testing GET /events/{event_id}/quote-status/")
        response = requests.get(f"{base_url}/events/{event_id}/quote-status/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"Error: {response.text}")
        
        # Test 2: Get quote responses
        print(f"\n2. Testing GET /events/{event_id}/quote-responses/")
        response = requests.get(f"{base_url}/events/{event_id}/quote-responses/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"Error: {response.text}")
        
        # Test 3: Create a test quote request
        print(f"\n3. Testing quote request creation...")
        quote_data = {
            "event_type": "birthday",
            "event_name": "Test Birthday Party",
            "client_name": "Test Client",
            "client_email": "test@example.com",
            "client_phone": "9876543210",
            "event_date": "2024-12-25",
            "location": "Mumbai, Maharashtra",
            "guest_count": 50,
            "budget_range": "₹50,000",
            "services": ["catering", "decoration"],
            "description": "Test birthday party",
            "urgency": "medium",
            "prefilled_event_id": event_id,
            "selected_vendors": ["Test Caterer", "Test Decorator"],
            "quote_type": "targeted"
        }
        
        response = requests.post(f"{base_url}/quote-requests/", json=quote_data)
        print(f"Status Code: {response.status_code}")
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"Quote request created: {json.dumps(data, indent=2)}")
            
            # Test the endpoints again after creating quote
            print(f"\n4. Re-testing GET /events/{event_id}/quote-status/ after creating quote")
            response = requests.get(f"{base_url}/events/{event_id}/quote-status/")
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2)}")
            else:
                print(f"Error: {response.text}")
        else:
            print(f"Error creating quote request: {response.text}")
        
        print("\n=== Quote Endpoints Test Complete ===")
        
    except Exception as e:
        print(f"Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_quote_endpoints()