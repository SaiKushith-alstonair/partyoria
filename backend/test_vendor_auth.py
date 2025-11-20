import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from vendors.models import VendorAuth
from authentication.models import CustomUser

# Check if we can find the vendor by email
test_email = "saikushith@alstonair.com"

try:
    # Check if vendor exists
    vendor = VendorAuth.objects.get(email=test_email)
    print(f"Found vendor: {vendor.email} (ID: {vendor.id})")
    print(f"Vendor name: {vendor.full_name}")
    print(f"Vendor business: {vendor.business}")
    
    # Check if there's a corresponding CustomUser
    try:
        custom_user = CustomUser.objects.get(email=test_email, user_type='vendor')
        print(f"Found CustomUser: {custom_user.email} (ID: {custom_user.id})")
        print(f"User type: {custom_user.user_type}")
    except CustomUser.DoesNotExist:
        print("No corresponding CustomUser found")
        
        # Create one for testing
        custom_user = CustomUser.objects.create(
            username=f"vendor_{vendor.id}",
            email=vendor.email,
            user_type='vendor',
            phone=vendor.mobile,
            is_verified=vendor.is_verified
        )
        custom_user.set_unusable_password()
        custom_user.save()
        print(f"Created CustomUser: {custom_user.email}")
        
except VendorAuth.DoesNotExist:
    print(f"Vendor with email {test_email} not found")
    
    # List all vendors
    vendors = VendorAuth.objects.all()
    print(f"Available vendors:")
    for v in vendors:
        print(f"  - {v.email} ({v.full_name})")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()