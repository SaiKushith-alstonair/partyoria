#!/usr/bin/env python
import os
import sys
import django
from django.conf import settings

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
import json

def test_events_api():
    """Test the events API endpoint"""
    client = Client()
    
    print("Testing /api/events/ endpoint...")
    
    try:
        # Test GET request to events endpoint
        response = client.get('/api/events/')
        print(f"Status Code: {response.status_code}")
        print(f"Content Type: {response.get('Content-Type', 'Not set')}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2)}")
                print("SUCCESS: Events API is working!")
            except json.JSONDecodeError:
                print(f"Response content: {response.content}")
                print("WARNING: Response is not valid JSON")
        else:
            print(f"ERROR: Status {response.status_code}")
            print(f"Response content: {response.content.decode('utf-8', errors='ignore')[:500]}")
            
    except Exception as e:
        print(f"EXCEPTION occurred: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_events_api()