#!/usr/bin/env python
"""
Test the updated quote management system
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

from events.models import Event
from django.contrib.auth import get_user_model

User = get_user_model()

def test_updated_quote_system():
    """Test the updated quote management system"""
    base_url = "http://127.0.0.1:8000/api"
    
    print("=== Testing Updated Quote Management System ===")
    
    try:
        # Get event ID 12 (Wedding event)
        event = Event.objects.get(id=12)
        print(f"Testing with event: {event.event_name} (ID: {event.id})")
        print(f"Event services: {event.services}")
        print(f"Selected services: {event.selected_services}")
        
        # Test sending quote requests
        print(f"\n1. Testing POST /events/{event.id}/send-quotes/")
        response = requests.post(f"{base_url}/events/{event.id}/send-quotes/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                print(f"\n✓ Successfully sent quotes to {data.get('vendor_count', 0)} vendors")
                print(f"✓ Categories matched: {data.get('categories_matched', [])}")
                
                # Test getting quote status
                print(f"\n2. Testing GET /events/{event.id}/quote-status/")
                status_response = requests.get(f"{base_url}/events/{event.id}/quote-status/")
                print(f"Status Code: {status_response.status_code}")
                
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    print(f"Quote Status: {json.dumps(status_data, indent=2)}")
                
                # Test getting quote responses
                print(f"\n3. Testing GET /events/{event.id}/quote-responses/")
                responses_response = requests.get(f"{base_url}/events/{event.id}/quote-responses/")
                print(f"Status Code: {responses_response.status_code}")
                
                if responses_response.status_code == 200:
                    responses_data = responses_response.json()
                    print(f"Quote Responses: {json.dumps(responses_data, indent=2)}")
                    
                    if responses_data.get('responses'):
                        print(f"\n✓ Found {len(responses_data['responses'])} vendor responses")
                        for response in responses_data['responses']:
                            print(f"  - {response['vendor_name']}: ₹{response['quote_amount']:,}")
            else:
                print(f"✗ {data.get('message', 'Unknown error')}")
        else:
            print(f"Error: {response.text}")
        
        print("\n=== Test Complete ===")
        
    except Exception as e:
        print(f"Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_updated_quote_system()