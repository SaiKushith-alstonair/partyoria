#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

def test_vendor_notifications():
    """Test vendor notification authentication"""
    
    # Test vendor login first
    login_data = {
        'email': 'vendor@test.com',
        'password': 'testpass123'
    }
    
    print("Testing vendor login...")
    login_response = requests.post('http://localhost:8000/api/vendor/auth/login/', json=login_data)
    print(f"Login status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        login_result = login_response.json()
        access_token = login_result.get('access')
        print(f"Login successful, got token: {access_token[:20]}...")
        
        # Test notification endpoints
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        print("\nTesting notification endpoints...")
        
        # Test unread count
        print("Testing unread count...")
        response = requests.get('http://localhost:8000/api/notifications/unread_count/', headers=headers)
        print(f"Unread count status: {response.status_code}")
        if response.status_code == 200:
            print(f"Unread count: {response.json()}")
        else:
            print(f"Error: {response.text}")
        
        # Test recent notifications
        print("\nTesting recent notifications...")
        response = requests.get('http://localhost:8000/api/notifications/recent/', headers=headers)
        print(f"Recent notifications status: {response.status_code}")
        if response.status_code == 200:
            print(f"Recent notifications: {response.json()}")
        else:
            print(f"Error: {response.text}")
        
        # Test preferences
        print("\nTesting preferences...")
        response = requests.get('http://localhost:8000/api/preferences/my_preferences/', headers=headers)
        print(f"Preferences status: {response.status_code}")
        if response.status_code == 200:
            print(f"Preferences: {response.json()}")
        else:
            print(f"Error: {response.text}")
    else:
        print(f"Login failed: {login_response.text}")

if __name__ == '__main__':
    test_vendor_notifications()