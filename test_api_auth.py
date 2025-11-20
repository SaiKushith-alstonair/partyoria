#!/usr/bin/env python3
"""
Simple test script to verify API authentication
"""
import requests
import json

# Configuration
BASE_URL = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login/"
EVENTS_URL = f"{BASE_URL}/api/events/"

def test_login_and_events():
    """Test login and then fetch events"""
    
    # Test login
    print("=== Testing Login ===")
    login_data = {
        "username": "saiku",
        "password": "saiku123"
    }
    
    try:
        login_response = requests.post(LOGIN_URL, json=login_data)
        print(f"Login Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            print("Login successful!")
            print(f"User: {login_result.get('user', {}).get('username')}")
            
            access_token = login_result.get('access')
            if access_token:
                print(f"Access token received: {access_token[:50]}...")
                
                # Test events API with token
                print("\n=== Testing Events API with Token ===")
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
                
                events_response = requests.get(EVENTS_URL, headers=headers)
                print(f"Events API Status: {events_response.status_code}")
                
                if events_response.status_code == 200:
                    events_data = events_response.json()
                    print(f"Events retrieved: {len(events_data)}")
                    if events_data:
                        print(f"First event: {events_data[0].get('event_name', 'No name')}")
                else:
                    print(f"Events API Error: {events_response.text}")
            else:
                print("No access token in login response")
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")
    
    # Test events API without token
    print("\n=== Testing Events API without Token ===")
    try:
        events_response = requests.get(EVENTS_URL)
        print(f"Events API Status (no auth): {events_response.status_code}")
        
        if events_response.status_code == 200:
            events_data = events_response.json()
            print(f"Events retrieved (no auth): {len(events_data)}")
        else:
            print(f"Events API Error (no auth): {events_response.text}")
    except Exception as e:
        print(f"Error (no auth): {e}")

if __name__ == "__main__":
    test_login_and_events()