#!/usr/bin/env python
"""
Check real vendors in database
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from vendors.models import VendorAuth

def check_real_vendors():
    """Check what real vendors exist"""
    print("=== Real Vendors in Database ===")
    
    vendors = VendorAuth.objects.all()
    print(f"Total vendors: {vendors.count()}")
    
    for vendor in vendors:
        print(f"ID: {vendor.id}")
        print(f"Name: {vendor.full_name}")
        print(f"Business: {vendor.business}")
        print(f"Location: {vendor.location}")
        print(f"City: {vendor.city}")
        print(f"Services: {vendor.services}")
        print(f"Active: {vendor.is_active}")
        print(f"Verified: {vendor.is_verified}")
        print("---")

if __name__ == "__main__":
    check_real_vendors()