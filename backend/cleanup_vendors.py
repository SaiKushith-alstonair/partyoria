import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection
from authentication.models import CustomUser
from vendors.models import VendorProfile

# Delete all vendor users and their profiles
vendor_users = CustomUser.objects.filter(user_type='vendor')
print(f"Deleting {vendor_users.count()} vendor users...")

for user in vendor_users:
    print(f"Deleting user: {user.username}")
    user.delete()

# Delete any remaining vendor profiles
VendorProfile.objects.all().delete()
print("Deleted all vendor profiles")

# Reset the ID sequence for CustomUser table
cursor = connection.cursor()
cursor.execute("SELECT setval('authentication_customuser_id_seq', (SELECT COALESCE(MAX(id), 0) FROM authentication_customuser));")
print("Reset CustomUser ID sequence")

print("Cleanup completed!")