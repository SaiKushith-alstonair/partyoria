#!/usr/bin/env python
"""
Test category-specific filtering for vendors
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_category_filtering():
    """Test that vendors only see their category data"""
    print("Testing Category-Specific Filtering")
    print("=" * 50)
    
    # Create a comprehensive quote with multiple services
    quote_data = {
        "event_type": "wedding",
        "event_name": "Wedding Celebration",
        "client_name": "M Sai Kushith",
        "client_email": "sai@example.com",
        "client_phone": "+91-9876543210",
        "event_date": "2025-11-20",
        "location": "Amaravati, Andhra Pradesh",
        "guest_count": 100,
        "budget_range": "₹200000.00",
        "services": ["Venues", "Catering Services", "Videography Services", "Entertainment", "Decoration & Setup", "Photography Services"],
        "description": "Wedding with multiple service requirements",
        "urgency": "medium",
        "quote_type": "targeted"
    }
    
    try:
        print("1. Creating comprehensive quote request...")
        response = requests.post(f"{BASE_URL}/quote-requests/", json=quote_data)
        
        if response.status_code == 201:
            quote_id = response.json()['id']
            print(f"   ✓ Quote created with ID: {quote_id}")
            
            # Test different vendor categories
            categories = ['catering', 'photography', 'venues', 'entertainment']
            
            for category in categories:
                print(f"\n2. Testing {category.upper()} vendor view...")
                
                # Get category-specific data
                cat_response = requests.get(f"{BASE_URL}/quote-requests/{quote_id}/category-data/?category={category}")
                
                if cat_response.status_code == 200:
                    cat_data = cat_response.json()
                    print(f"   ✓ {category.title()} vendor sees:")
                    print(f"     - Event: {cat_data.get('event_name')}")
                    print(f"     - Category: {cat_data.get('category')}")
                    print(f"     - Services: {cat_data.get('services', [])}")
                    print(f"     - Budget: ₹{cat_data.get('allocated_budget', 0):,}")
                    print(f"     - Requirements: {len(cat_data.get('requirements', {}))}")
                    print(f"     - Note: {cat_data.get('note', 'N/A')}")
                    
                    # Verify only category-specific services
                    services = cat_data.get('services', [])
                    if len(services) == 1 and services[0] == category:
                        print(f"     ✓ Correctly filtered to {category} only")
                    else:
                        print(f"     ✗ Still showing all services: {services}")
                        
                elif cat_response.status_code == 404:
                    print(f"   ℹ No specific data for {category} (expected if no requirements)")
                else:
                    print(f"   ✗ Error getting {category} data: {cat_response.status_code}")
            
            # Test vendor-specific quotes endpoint
            print(f"\n3. Testing vendor-specific quotes endpoint...")
            vendor_response = requests.get(f"{BASE_URL}/quote-requests/vendor-specific/?category=catering")
            
            if vendor_response.status_code == 200:
                vendor_data = vendor_response.json()
                print(f"   ✓ Catering vendors see {len(vendor_data.get('quotes', []))} relevant quotes")
                
                for quote in vendor_data.get('quotes', [])[:1]:  # Show first quote
                    print(f"     - Quote ID: {quote.get('quote_id')}")
                    print(f"     - Budget: ₹{quote.get('allocated_budget', 0):,}")
                    print(f"     - Requirements: {quote.get('requirements_count', 0)}")
            else:
                print(f"   ✗ Error getting vendor-specific quotes: {vendor_response.status_code}")
                
        else:
            print(f"   ✗ Failed to create quote: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("   ✗ Connection failed - make sure backend server is running")
    except Exception as e:
        print(f"   ✗ Error: {str(e)}")

def main():
    print("🧪 TESTING CATEGORY-SPECIFIC FILTERING")
    print("=" * 60)
    
    test_category_filtering()
    
    print("\n" + "=" * 60)
    print("✅ FILTERING TEST COMPLETED")
    print("\nExpected Results:")
    print("• Catering vendors see only catering requirements & budget")
    print("• Photography vendors see only photography requirements & budget")
    print("• Each vendor sees services: [their_category] only")
    print("• No vendor sees the full list of all services")

if __name__ == '__main__':
    main()