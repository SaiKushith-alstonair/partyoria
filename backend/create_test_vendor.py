#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from vendors.models import VendorAuth
from authentication.models import CustomUser

def create_test_vendor():
    """Create a test vendor for testing notifications"""
    
    email = 'vendor@test.com'
    
    # Check if vendor already exists
    if VendorAuth.objects.filter(email=email).exists():
        print(f"Test vendor {email} already exists")
        vendor = VendorAuth.objects.get(email=email)
    else:
        # Create test vendor
        vendor = VendorAuth.objects.create(
            email=email,
            full_name='Test Vendor',
            mobile='1234567890',
            business='Test Business',
            experience_level='intermediate',
            city='Test City',
            state='Test State',
            pincode='123456',
            location='Test Location',
            services=['catering', 'decoration'],
            onboarding_completed=True,
            is_verified=True
        )
        vendor.set_password('testpass123')
        vendor.save()
        print(f"Created test vendor: {vendor.email}")
    
    # Ensure corresponding CustomUser exists
    user, created = CustomUser.objects.get_or_create(
        email=vendor.email,
        user_type='vendor',
        defaults={
            'username': vendor.email,
            'password': None
        }
    )
    
    if created:
        print(f"Created corresponding CustomUser: {user.email}")
    else:
        print(f"CustomUser already exists: {user.email}")
    
    return vendor, user

if __name__ == '__main__':
    create_test_vendor()