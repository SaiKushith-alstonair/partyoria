#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.test import RequestFactory
from vendors.auth_views import vendor_login
import json

# Create a test request
factory = RequestFactory()
data = {'username': 'test@example.com', 'password': 'testpass'}
request = factory.post('/api/vendor/auth/login/', 
                      data=json.dumps(data), 
                      content_type='application/json')

try:
    response = vendor_login(request)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.data}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()