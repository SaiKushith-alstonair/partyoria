#!/usr/bin/env python
"""
Clean up mock vendor quotes and keep only real vendor quotes
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from events.models import QuoteRequest
from vendors.models import VendorAuth

def clean_mock_quotes():
    """Remove mock vendor responses and keep only real vendor responses"""
    print("=== Cleaning Mock Vendor Quotes ===")
    
    # Get all real vendor names
    real_vendors = list(VendorAuth.objects.values_list('full_name', flat=True))
    print(f"Real vendors: {real_vendors}")
    
    # Clean all quote requests
    quote_requests = QuoteRequest.objects.all()
    
    for qr in quote_requests:
        if qr.vendor_responses:
            # Keep only responses from real vendors
            cleaned_responses = {}
            for vendor_name, response in qr.vendor_responses.items():
                if vendor_name in real_vendors:
                    cleaned_responses[vendor_name] = response
                    print(f"Keeping response from real vendor: {vendor_name}")
                else:
                    print(f"Removing mock vendor: {vendor_name}")
            
            # Update the quote request
            qr.vendor_responses = cleaned_responses
            
            # Update status based on remaining responses
            if cleaned_responses:
                qr.status = 'responses_received'
            else:
                qr.status = 'vendors_notified'
            
            qr.save()
            print(f"Updated quote request {qr.id}: {len(cleaned_responses)} real responses")
    
    print("=== Cleanup Complete ===")

if __name__ == "__main__":
    clean_mock_quotes()