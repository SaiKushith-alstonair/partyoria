#!/usr/bin/env python
"""
Quick fix to ensure vendors see only their category quotes
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from events.models import QuoteRequest

def fix_vendor_categories():
    """Fix vendor category assignments"""
    print("Fixing vendor category assignments...")
    
    # Get all quote requests
    quotes = QuoteRequest.objects.all()
    
    for quote in quotes:
        print(f"Quote {quote.id}: {quote.event_name}")
        
        # If it's a targeted quote but no category data, create it
        if quote.quote_type == 'targeted' and not quote.category_specific_data:
            # Create category data based on services
            category_data = {}
            
            # Map services to categories
            service_mapping = {
                'catering': ['catering', 'food', 'cake'],
                'venues': ['venue', 'hall', 'location'],
                'photography': ['photography', 'photo', 'videography'],
                'entertainment': ['entertainment', 'music', 'dj', 'band'],
                'decorations': ['decoration', 'decor', 'flower', 'balloon']
            }
            
            for service in quote.services:
                service_lower = service.lower()
                
                for category, keywords in service_mapping.items():
                    if any(keyword in service_lower for keyword in keywords):
                        if category not in category_data:
                            category_data[category] = {
                                'requirements': {},
                                'budget': quote.guest_count * 1000,  # Estimate
                                'details': {
                                    'percentage': 20.0,
                                    'per_guest_cost': 1000.0
                                }
                            }
                        break
            
            if category_data:
                quote.category_specific_data = category_data
                quote.save()
                print(f"  ✓ Added category data: {list(category_data.keys())}")
            else:
                print(f"  ⚠ No categories mapped for services: {quote.services}")

if __name__ == '__main__':
    fix_vendor_categories()
    print("✅ Vendor category fix completed!")