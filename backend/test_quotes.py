#!/usr/bin/env python
"""
Simple script to test quote functionality
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from events.models import Event, QuoteRequest
from vendors.models import VendorAuth
from django.contrib.auth import get_user_model

User = get_user_model()

def test_quote_system():
    print("=== TESTING QUOTE SYSTEM ===")
    
    # Get test user
    try:
        user = User.objects.get(id=2)
        print(f"[OK] User found: {user.username}")
    except User.DoesNotExist:
        print("❌ User ID 2 not found")
        return
    
    # Get test event
    try:
        event = Event.objects.filter(user=user).first()
        if event:
            print(f"✅ Event found: {event.event_name} (ID: {event.id})")
        else:
            print("❌ No events found for user")
            return
    except Exception as e:
        print(f"❌ Error getting event: {e}")
        return
    
    # Check vendors
    vendors = VendorAuth.objects.filter(is_active=True, is_verified=True)
    print(f"✅ Active vendors: {vendors.count()}")
    
    # Create test quote request
    try:
        quote_request = QuoteRequest.objects.create(
            event_type=event.event_type,
            event_name=event.event_name,
            client_name="Test Client",
            client_email="test@example.com",
            event_date="2024-12-25",
            location="Test Location",
            guest_count=50,
            budget_range="₹50000",
            services=["catering", "photography"],
            description="Test quote request",
            user=user,
            prefilled_event_id=event.id,
            selected_vendors=["Test Vendor 1", "Test Vendor 2"],
            is_targeted_quote=True,
            quote_type='targeted'
        )
        print(f"✅ Quote request created: ID {quote_request.id}")
        
        # Test vendor response
        quote_request.vendor_responses = {
            "Test Vendor 1": {
                "quote_amount": 25000,
                "message": "We can provide excellent catering services",
                "includes": ["Food", "Service staff", "Setup"],
                "excludes": ["Decorations", "Music"],
                "submitted_at": "2024-01-15T10:00:00Z",
                "vendor_business": "Test Catering Co",
                "vendor_location": "Mumbai"
            }
        }
        quote_request.status = 'responses_received'
        quote_request.save()
        print("✅ Vendor response added")
        
        return quote_request
        
    except Exception as e:
        print(f"❌ Error creating quote request: {e}")
        return None

def test_quote_endpoints():
    print("\n=== TESTING QUOTE ENDPOINTS ===")
    
    import requests
    
    base_url = "http://127.0.0.1:8000/api/events"
    
    # Test quote status
    try:
        response = requests.get(f"{base_url}/1/quote-status/")
        print(f"Quote Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  - Total quotes: {data.get('total_quotes_sent', 0)}")
            print(f"  - Total responses: {data.get('total_responses', 0)}")
        else:
            print(f"  - Error: {response.text}")
    except Exception as e:
        print(f"❌ Quote status error: {e}")
    
    # Test quote responses
    try:
        response = requests.get(f"{base_url}/1/quote-responses/")
        print(f"Quote Responses: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  - Total responses: {data.get('total_responses', 0)}")
        else:
            print(f"  - Error: {response.text}")
    except Exception as e:
        print(f"❌ Quote responses error: {e}")

if __name__ == "__main__":
    quote_request = test_quote_system()
    test_quote_endpoints()
    
    if quote_request:
        print(f"\n✅ SUCCESS: Quote system is working!")
        print(f"   Quote Request ID: {quote_request.id}")
        print(f"   Status: {quote_request.status}")
        print(f"   Vendor Responses: {len(quote_request.vendor_responses or {})}")
    else:
        print("\n❌ FAILED: Quote system has issues")