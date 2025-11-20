import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from vendors.models import VendorAuth, VendorProfile
from authentication.models import CustomUser

# Test the profile API logic
test_email = "saikushith@alstonair.com"

try:
    # Check if vendor exists
    vendor = VendorAuth.objects.get(email=test_email)
    print(f"Found vendor: {vendor.full_name}")
    
    # Try to get or create profile
    profile, created = VendorProfile.objects.get_or_create(
        user=vendor,
        defaults={'profile_data': {}}
    )
    
    if created:
        print("Created new profile")
    else:
        print("Profile already exists")
        
    print(f"Profile ID: {profile.id}")
    print(f"Profile data: {profile.profile_data}")
    print(f"Profile completed: {profile.is_completed}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()