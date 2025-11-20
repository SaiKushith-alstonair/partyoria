import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from vendors.models import VendorProfile

vendor_users = CustomUser.objects.filter(user_type='vendor')
for user in vendor_users:
    # Create empty profile for all vendor users
    VendorProfile.objects.get_or_create(
        user=user,
        defaults={'profile_data': {}, 'is_completed': False}
    )
    print(f'Created profile for {user.username}')

print("Data transfer completed!")