#!/usr/bin/env python3
import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from vendors.models import VendorAuth

def find_saiku_user():
    print("=== Finding Saiku User ===")
    
    # Search in CustomUser
    saiku_users = CustomUser.objects.filter(username__icontains='saiku')
    if saiku_users.exists():
        for user in saiku_users:
            print(f"CustomUser: {user.username} - {user.email}")
            print(f"  Password hash: {user.password[:50]}...")
    
    # Search in VendorAuth
    saiku_vendors = VendorAuth.objects.filter(full_name__icontains='saiku')
    if saiku_vendors.exists():
        for vendor in saiku_vendors:
            print(f"VendorAuth: {vendor.full_name} - {vendor.email}")
            print(f"  Password hash: {vendor.password[:50]}...")
    
    # Search by email
    saiku_email_users = CustomUser.objects.filter(email__icontains='saiku')
    if saiku_email_users.exists():
        for user in saiku_email_users:
            print(f"Email match: {user.username} - {user.email}")
    
    saiku_email_vendors = VendorAuth.objects.filter(email__icontains='saiku')
    if saiku_email_vendors.exists():
        for vendor in saiku_email_vendors:
            print(f"Vendor email match: {vendor.full_name} - {vendor.email}")
    
    # If no matches, show all users
    if not (saiku_users.exists() or saiku_vendors.exists() or saiku_email_users.exists() or saiku_email_vendors.exists()):
        print("No 'saiku' users found. All users:")
        for user in CustomUser.objects.all():
            print(f"  {user.username} - {user.email}")

if __name__ == '__main__':
    find_saiku_user()