#!/usr/bin/env python
import os
import sys

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')

import django
from django.conf import settings
django.setup()

from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser

def test_api_request():
    try:
        from events.views import EventViewSet
        from rest_framework.test import APIRequestFactory
        
        print("[OK] Imports successful")
        
        # Create a request factory
        factory = APIRequestFactory()
        
        # Create a GET request to /api/events/
        request = factory.get('/api/events/')
        request.user = AnonymousUser()
        
        print("[OK] Request created")
        
        # Create viewset instance
        viewset = EventViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        print("[OK] ViewSet configured")
        
        # Test the list method
        response = viewset.list(request)
        
        print(f"[OK] Response status: {response.status_code}")
        print(f"[OK] Response data length: {len(response.data) if hasattr(response, 'data') else 'No data'}")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_api_request()