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

def reset_vendor_password():
    """Reset vendor password"""
    
    try:
        vendor = VendorAuth.objects.get(email='vendor@test.com')
        vendor.set_password('testpass123')
        vendor.save()
        print(f"Password reset for vendor: {vendor.email}")
        
        # Test password
        if vendor.check_password('testpass123'):
            print("Password verification successful")
        else:
            print("Password verification failed")
            
    except VendorAuth.DoesNotExist:
        print("Vendor not found")

if __name__ == '__main__':
    reset_vendor_password()