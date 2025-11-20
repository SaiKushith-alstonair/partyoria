#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser

print("=== CHECKING VENDOR DATA IN DATABASE ===\n")

# Check CustomUser table for vendors
print("1. CUSTOMUSER TABLE (Main Auth):")
vendors = CustomUser.objects.filter(user_type='vendor')
print(f"Total vendors in CustomUser: {vendors.count()}")

if vendors.count() > 0:
    for v in vendors:
        print(f"  - ID: {v.id}")
        print(f"    Email: {v.email}")
        print(f"    Username: {v.username}")
        print(f"    Full Name: {v.full_name}")
        print(f"    Business: {v.business}")
        print(f"    Experience: {v.experience_level}")
        print(f"    Mobile: {v.mobile}")
        print(f"    Location: {v.location}")
        print(f"    City: {v.city}")
        print(f"    State: {v.state}")
        print(f"    Pincode: {v.pincode}")
        print(f"    Is Verified: {v.is_verified}")
        print(f"    Is Online: {v.is_online}")
        print(f"    Created: {v.created_at}")
        print(f"    Updated: {v.updated_at}")
        print()
else:
    print("  No vendors found in database!")

# Check all users
print("\n2. ALL USERS IN DATABASE:")
all_users = CustomUser.objects.all()
print(f"Total users: {all_users.count()}")
for user in all_users:
    print(f"  - {user.username} ({user.email}) - Type: {user.user_type}")

print("\n=== DATABASE CHECK COMPLETE ===")