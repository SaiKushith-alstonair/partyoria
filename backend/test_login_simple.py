#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser

def test_endpoints():
    base_url = "http://localhost:8000"
    
    # Test customer login endpoint
    print("Testing customer login endpoint...")
    try:
        response = requests.post(f"{base_url}/api/auth/login/", 
                               json={"username": "test", "password": "test"},
                               headers={"Content-Type": "application/json"})
        print(f"Customer login status: {response.status_code}")
        print(f"Customer login response: {response.text}")
    except Exception as e:
        print(f"Customer login error: {e}")
    
    # Test vendor login endpoint
    print("\nTesting vendor login endpoint...")
    try:
        response = requests.post(f"{base_url}/api/vendor/auth/login/", 
                               json={"username": "test", "password": "test"},
                               headers={"Content-Type": "application/json"})
        print(f"Vendor login status: {response.status_code}")
        print(f"Vendor login response: {response.text}")
    except Exception as e:
        print(f"Vendor login error: {e}")

def create_test_users():
    """Create test users for testing"""
    print("Creating test users...")
    
    # Create customer user
    try:
        customer, created = CustomUser.objects.get_or_create(
            username='testcustomer',
            defaults={
                'email': 'customer@test.com',
                'user_type': 'customer'
            }
        )
        if created:
            customer.set_password('test123')
            customer.save()
            print("Created test customer")
        else:
            print("Test customer already exists")
    except Exception as e:
        print(f"Error creating customer: {e}")
    
    # Create vendor user
    try:
        vendor, created = CustomUser.objects.get_or_create(
            username='testvendor',
            defaults={
                'email': 'vendor@test.com',
                'user_type': 'vendor'
            }
        )
        if created:
            vendor.set_password('test123')
            vendor.save()
            print("Created test vendor")
        else:
            print("Test vendor already exists")
    except Exception as e:
        print(f"Error creating vendor: {e}")

if __name__ == "__main__":
    create_test_users()
    print("\n" + "="*50)
    test_endpoints()