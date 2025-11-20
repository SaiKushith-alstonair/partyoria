#!/usr/bin/env python
"""
Test script for quote tracking functionality
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_quote_details():
    """Test the quote details endpoint"""
    print("Testing Quote Details Functionality")
    print("=" * 50)
    
    # Test data - create a quote request first
    quote_data = {
        "event_type": "corporate",
        "event_name": "Annual Company Meeting",
        "client_name": "John Doe",
        "client_email": "john@company.com",
        "event_date": "2024-12-25",
        "location": "Mumbai",
        "guest_count": 100,
        "budget_range": "2-3 Lakhs",
        "services": ["catering", "audio-visual"],
        "description": "Corporate annual meeting with catering and AV needs",
        "urgency": "medium",
        "quote_type": "targeted"
    }
    
    try:
        # Create quote request
        print("1. Creating quote request...")
        response = requests.post(f"{BASE_URL}/quote-requests/", json=quote_data)
        if response.status_code == 201:
            quote_id = response.json()['id']
            print(f"   ✓ Quote created with ID: {quote_id}")
            
            # Test quote details endpoint
            print("2. Testing quote details endpoint...")
            details_response = requests.get(f"{BASE_URL}/quote-requests/{quote_id}/quote-details/")
            if details_response.status_code == 200:
                details = details_response.json()
                print(f"   ✓ Quote details retrieved successfully")
                print(f"   Event: {details.get('event_name')}")
                print(f"   Status: {details.get('status')}")
                print(f"   Categories: {list(details.get('category_stats', {}).keys())}")
                
                # Display category stats
                for category, stats in details.get('category_stats', {}).items():
                    print(f"   {category.title()}:")
                    print(f"     - Budget: ₹{stats.get('budget_allocated', 0):,}")
                    print(f"     - Vendors contacted: {stats.get('vendors_contacted', 0)}")
                    print(f"     - Responses: {stats.get('responses_received', 0)}")
            else:
                print(f"   ✗ Failed to get quote details: {details_response.status_code}")
                
        else:
            print(f"   ✗ Failed to create quote: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("   ✗ Connection failed - make sure backend server is running")
    except Exception as e:
        print(f"   ✗ Error: {str(e)}")

def test_vendor_quote_submission():
    """Test vendor quote submission"""
    print("\nTesting Vendor Quote Submission")
    print("=" * 50)
    
    # Simulate vendor quote submission
    vendor_quote_data = {
        "vendor_name": "Premium Catering Co.",
        "category": "catering",
        "quote_amount": 150000,
        "message": "We're excited to cater your corporate event!",
        "includes": [
            "Multi-cuisine buffet for 100 guests",
            "Professional service staff",
            "Setup and cleanup"
        ],
        "excludes": [
            "Alcohol service",
            "Additional decorations"
        ],
        "terms": "50% advance required, balance on event day",
        "contact_info": {
            "phone": "+91-9876543210",
            "email": "quotes@premiumcatering.com"
        }
    }
    
    try:
        # First get a quote ID (assuming quote ID 1 exists)
        quote_id = 1
        print(f"1. Submitting vendor quote for quote ID: {quote_id}")
        
        response = requests.post(
            f"{BASE_URL}/quote-requests/{quote_id}/submit-vendor-quote/",
            json=vendor_quote_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✓ Vendor quote submitted successfully")
            print(f"   Vendor ID: {result.get('vendor_id')}")
            print(f"   Quote Amount: ₹{vendor_quote_data['quote_amount']:,}")
        else:
            print(f"   ✗ Failed to submit vendor quote: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("   ✗ Connection failed - make sure backend server is running")
    except Exception as e:
        print(f"   ✗ Error: {str(e)}")

def test_category_specific_data():
    """Test category-specific data retrieval"""
    print("\nTesting Category-Specific Data")
    print("=" * 50)
    
    try:
        quote_id = 1
        category = "catering"
        
        print(f"1. Getting category data for {category}...")
        response = requests.get(
            f"{BASE_URL}/quote-requests/{quote_id}/category-data/?category={category}"
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Category data retrieved successfully")
            print(f"   Event: {data.get('event_name')}")
            print(f"   Category: {data.get('category')}")
            print(f"   Budget: ₹{data.get('allocated_budget', 0):,}")
            print(f"   Requirements: {len(data.get('requirements', {}))}")
        elif response.status_code == 404:
            print(f"   ℹ No specific data found for {category} category")
        else:
            print(f"   ✗ Failed to get category data: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("   ✗ Connection failed - make sure backend server is running")
    except Exception as e:
        print(f"   ✗ Error: {str(e)}")

def main():
    print("🧪 TESTING QUOTE TRACKING FUNCTIONALITY")
    print("=" * 60)
    
    test_quote_details()
    test_vendor_quote_submission()
    test_category_specific_data()
    
    print("\n" + "=" * 60)
    print("✅ TESTING COMPLETED")
    print("\nKey Features Tested:")
    print("• Customer quote details with category breakdown")
    print("• Vendor quote submission with enhanced UI data")
    print("• Category-specific data retrieval for vendors")
    print("• Quote progress tracking (contacted/responded/submitted)")

if __name__ == '__main__':
    main()