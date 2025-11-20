#!/usr/bin/env python3
"""
Test authentication fix
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_login():
    """Test login endpoint"""
    print("Testing login...")
    
    # Test with testuser123 user
    login_data = {
        "username": "testuser123",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
    print(f"Login status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("Login successful!")
        print(f"User: {data.get('user', {}).get('username')}")
        print(f"Access token: {data.get('access', 'Not found')[:50]}...")
        return data.get('access')
    else:
        print(f"Login failed: {response.text}")
        return None

def test_events_api(token):
    """Test events API with token"""
    print("\nTesting events API...")
    
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    response = requests.get(f"{BASE_URL}/api/events/", headers=headers)
    print(f"Events API status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Events retrieved: {len(data) if isinstance(data, list) else 'Unknown'}")
    else:
        print(f"Events API failed: {response.text}")

def test_notifications_api(token):
    """Test notifications API with token"""
    print("\nTesting notifications API...")
    
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    # Test unread count
    response = requests.get(f"{BASE_URL}/api/notifications/unread_count/", headers=headers)
    print(f"Notifications unread count status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Unread count: {data.get('unread_count', 0)}")
    else:
        print(f"Notifications API failed: {response.text}")

if __name__ == "__main__":
    print("=== Authentication Fix Test ===")
    
    # Test login
    token = test_login()
    
    # Test APIs with token
    test_events_api(token)
    test_notifications_api(token)
    
    print("\n=== Test Complete ===")