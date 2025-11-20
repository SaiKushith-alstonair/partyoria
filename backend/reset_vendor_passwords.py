import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from django.contrib.auth.hashers import make_password

def reset_vendor_passwords():
    """Reset all vendor passwords to 'vendor123' for testing"""
    
    # Common password for all vendors
    test_password = 'vendor123'
    hashed_password = make_password(test_password)
    
    # Get all vendors
    vendors = CustomUser.objects.filter(user_type='vendor')
    
    print(f"Found {vendors.count()} vendors")
    print(f"Setting password to: {test_password}")
    print("-" * 50)
    
    updated_count = 0
    for vendor in vendors:
        vendor.password = hashed_password
        vendor.save()
        updated_count += 1
        print(f"[OK] Updated: {vendor.email} ({vendor.first_name} {vendor.last_name})")
    
    print("-" * 50)
    print(f"\n[SUCCESS] Updated {updated_count} vendor passwords!")
    print(f"\nTest Credentials:")
    print(f"  Email: [any vendor email]")
    print(f"  Password: {test_password}")
    print("\nSample Vendor Emails:")
    for vendor in vendors[:10]:  # Show first 10
        print(f"  - {vendor.email}")
    if vendors.count() > 10:
        print(f"  ... and {vendors.count() - 10} more vendors")

if __name__ == '__main__':
    reset_vendor_passwords()
