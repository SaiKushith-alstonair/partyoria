#!/usr/bin/env python
"""
Simulate a vendor response to test the quote system
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from events.models import QuoteRequest
from vendors.models import VendorAuth
from django.utils import timezone

def simulate_vendor_response():
    """Simulate a vendor responding to a quote request"""
    print("=== Simulating Vendor Response ===")
    
    try:
        # Get the latest quote request
        quote_request = QuoteRequest.objects.latest('created_at')
        print(f"Latest quote request ID: {quote_request.id}")
        print(f"Selected vendors: {quote_request.selected_vendors}")
        
        # Get a real vendor
        vendor = VendorAuth.objects.filter(business__icontains='catering').first()
        if not vendor:
            vendor = VendorAuth.objects.first()
        
        if vendor:
            print(f"Simulating response from: {vendor.full_name} ({vendor.business})")
            
            # Create vendor response
            vendor_responses = quote_request.vendor_responses or {}
            vendor_responses[vendor.full_name] = {
                'quote_amount': 25000,
                'message': f'Thank you for considering {vendor.business} for your event. We are excited to provide our services.',
                'includes': ['Professional service', 'Quality ingredients', 'Setup and cleanup', 'Serving staff'],
                'excludes': ['Transportation', 'Additional decorations'],
                'submitted_at': timezone.now().isoformat(),
                'vendor_id': vendor.id,
                'vendor_business': vendor.business,
                'vendor_location': vendor.location,
                'vendor_phone': getattr(vendor, 'mobile', '+91 98765 43210'),
                'vendor_email': getattr(vendor, 'email', f'{vendor.full_name.lower().replace(" ", "")}@example.com')
            }
            
            quote_request.vendor_responses = vendor_responses
            quote_request.status = 'responses_received'
            quote_request.save()
            
            print(f"✓ Vendor response added successfully")
            print(f"✓ Quote amount: ₹25,000")
            print(f"✓ Status updated to: {quote_request.status}")
        else:
            print("No vendors found to simulate response")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    simulate_vendor_response()