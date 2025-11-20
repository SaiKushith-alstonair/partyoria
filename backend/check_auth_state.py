#!/usr/bin/env python3
import os
import django
import sys

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from vendors.models import VendorAuth

def check_users():
    """Check existing users and their authentication state"""
    print("=== Checking Authentication State ===")
    
    # Check CustomUser table
    customer_count = CustomUser.objects.filter(user_type='customer').count()
    vendor_count = CustomUser.objects.filter(user_type='vendor').count()
    
    print(f"CustomUser table:")
    print(f"  - Customers: {customer_count}")
    print(f"  - Vendors: {vendor_count}")
    
    # Check VendorAuth table
    vendor_auth_count = VendorAuth.objects.count()
    print(f"VendorAuth table: {vendor_auth_count} vendors")
    
    # Show recent users
    print("\nRecent CustomUsers:")
    for user in CustomUser.objects.order_by('-date_joined')[:5]:
        print(f"  - {user.username} ({user.user_type}) - {user.email}")
    
    print("\nRecent VendorAuth:")
    for vendor in VendorAuth.objects.order_by('-created_at')[:5]:
        print(f"  - {vendor.full_name} - {vendor.email}")

if __name__ == '__main__':
    check_users()