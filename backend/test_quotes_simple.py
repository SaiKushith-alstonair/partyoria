#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from events.models import Event, QuoteRequest
from vendors.models import VendorAuth
from django.contrib.auth import get_user_model

User = get_user_model()

def test_quote_system():
    print("=== TESTING QUOTE SYSTEM ===")
    
    try:
        user = User.objects.get(id=2)
        print(f"[OK] User found: {user.username}")
    except User.DoesNotExist:
        print("[ERROR] User ID 2 not found")
        return
    
    try:
        event = Event.objects.filter(user=user).first()
        if event:
            print(f"[OK] Event found: {event.event_name} (ID: {event.id})")
        else:
            print("[ERROR] No events found for user")
            return
    except Exception as e:
        print(f"[ERROR] Error getting event: {e}")
        return
    
    vendors = VendorAuth.objects.filter(is_active=True, is_verified=True)
    print(f"[OK] Active vendors: {vendors.count()}")
    
    try:
        quote_request = QuoteRequest.objects.create(
            event_type=event.event_type,
            event_name=event.event_name,
            client_name="Test Client",
            client_email="test@example.com",
            event_date="2024-12-25",
            location="Test Location",
            guest_count=50,
            budget_range="Rs50000",
            services=["catering", "photography"],
            description="Test quote request",
            user=user,
            prefilled_event_id=event.id,
            selected_vendors=["Test Vendor 1", "Test Vendor 2"],
            is_targeted_quote=True,
            quote_type='targeted'
        )
        print(f"[OK] Quote request created: ID {quote_request.id}")
        
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
        print("[OK] Vendor response added")
        
        return quote_request
        
    except Exception as e:
        print(f"[ERROR] Error creating quote request: {e}")
        return None

if __name__ == "__main__":
    quote_request = test_quote_system()
    
    if quote_request:
        print(f"\n[SUCCESS] Quote system is working!")
        print(f"   Quote Request ID: {quote_request.id}")
        print(f"   Status: {quote_request.status}")
        print(f"   Vendor Responses: {len(quote_request.vendor_responses or {})}")
    else:
        print("\n[FAILED] Quote system has issues")