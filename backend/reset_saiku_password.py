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

def reset_saiku_password():
    print("=== Resetting Saiku Password ===")
    
    new_password = "saiku123"
    
    # Reset CustomUser saiku
    try:
        user = CustomUser.objects.get(username='saiku')
        user.set_password(new_password)
        user.save()
        print(f"[OK] Reset password for CustomUser: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  New password: {new_password}")
    except CustomUser.DoesNotExist:
        print("[ERROR] CustomUser 'saiku' not found")
    
    # Reset VendorAuth saiku users
    saiku_vendors = VendorAuth.objects.filter(full_name__icontains='sai')
    for vendor in saiku_vendors:
        vendor.set_password(new_password)
        vendor.save()
        print(f"[OK] Reset password for VendorAuth: {vendor.full_name}")
        print(f"  Email: {vendor.email}")
        print(f"  New password: {new_password}")
    
    print(f"\n=== All Saiku passwords reset to: {new_password} ===")

if __name__ == '__main__':
    reset_saiku_password()