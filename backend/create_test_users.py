#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser

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
            print("[OK] Created test customer: testcustomer / test123")
        else:
            print("[OK] Test customer already exists: testcustomer / test123")
    except Exception as e:
        print(f"[ERROR] Error creating customer: {e}")
    
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
            print("[OK] Created test vendor: testvendor / test123")
        else:
            print("[OK] Test vendor already exists: testvendor / test123")
    except Exception as e:
        print(f"[ERROR] Error creating vendor: {e}")

if __name__ == "__main__":
    create_test_users()