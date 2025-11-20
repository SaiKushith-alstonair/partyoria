#!/usr/bin/env python
"""Test authentication flow for both customers and vendors"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_customer_auth():
    print("=== Testing Customer Authentication ===")
    
    # Test customer login
    login_data = {
        "username": "testuser",  # Replace with actual customer username
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
        print(f"Customer Login Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"User Type: {data.get('user', {}).get('user_type')}")
            print(f"Redirect URL: {data.get('redirect_url')}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Connection Error: {e}")
        return False

def test_vendor_auth():
    print("\n=== Testing Vendor Authentication ===")
    
    # Test vendor login
    login_data = {
        "username": "faaran@mail.comf",  # Use migrated vendor email
        "password": "defaultPassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/vendor/auth/login/", json=login_data)
        print(f"Vendor Login Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"User Type: {data.get('user', {}).get('user_type')}")
            print(f"Business: {data.get('user', {}).get('business')}")
            print(f"Redirect URL: {data.get('redirect_url')}")
            
            # Test vendor dashboard
            session_key = data.get('session_key')
            if session_key:
                cookies = {'sessionid': session_key}
                dashboard_response = requests.get(f"{BASE_URL}/api/vendor/dashboard/stats/", cookies=cookies)
                print(f"Dashboard Access: {dashboard_response.status_code}")
            
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Connection Error: {e}")
        return False

def test_endpoints():
    print("\n=== Testing API Endpoints ===")
    
    endpoints = [
        "/api/auth/login/",
        "/api/vendor/auth/login/",
        "/api/vendor/dashboard/stats/",
        "/api/vendor/services/",
        "/api/vendor/bookings/"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            print(f"{endpoint}: {response.status_code}")
        except Exception as e:
            print(f"{endpoint}: Connection Error")

if __name__ == "__main__":
    print("🧪 Testing PartyOria Authentication Flow")
    print("=" * 50)
    
    # Test endpoints availability
    test_endpoints()
    
    # Test authentication flows
    customer_ok = test_customer_auth()
    vendor_ok = test_vendor_auth()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"Customer Auth: {'✅ PASS' if customer_ok else '❌ FAIL'}")
    print(f"Vendor Auth: {'✅ PASS' if vendor_ok else '❌ FAIL'}")
    
    if customer_ok and vendor_ok:
        print("🎉 All authentication flows working!")
    else:
        print("⚠️  Some issues detected. Check server logs.")