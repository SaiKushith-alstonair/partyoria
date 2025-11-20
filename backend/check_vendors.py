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
from vendor_app.models import UserDetails, VendorBridge, ProfileDetails, VerificationDetails
from vendors.models import VendorService

print("=== CHECKING VENDOR DATA IN DATABASE ===\n")

# Check CustomUser table for vendors
print("1. CUSTOMUSER TABLE (Main Auth):")
vendors = CustomUser.objects.filter(user_type='vendor')
print(f"Total vendors in CustomUser: {vendors.count()}")
for v in vendors:
    print(f"  - ID: {v.id}, Email: {v.email}, Name: {v.full_name}, Business: {v.business}")
    print(f"    Location: {v.location}, City: {v.city}, State: {v.state}")
    print(f"    Mobile: {v.mobile}, Experience: {v.experience_level}")
    print(f"    Created: {v.created_at}, Verified: {v.is_verified}")
    print()

# Check UserDetails table (legacy vendor table)
print("\n2. USERDETAILS TABLE (Legacy Vendor):")
user_details = UserDetails.objects.all()
print(f"Total entries in UserDetails: {user_details.count()}")
for ud in user_details:
    print(f"  - Email: {ud.email}, Name: {ud.full_name}, Business: {ud.business}")
    print()

# Check VendorBridge table
print("\n3. VENDORBRIDGE TABLE (Links CustomUser to UserDetails):")
bridges = VendorBridge.objects.all()
print(f"Total bridges: {bridges.count()}")
for bridge in bridges:
    print(f"  - CustomUser: {bridge.user.email} -> UserDetails: {bridge.vendor_details.email}")
    print()

# Check ProfileDetails table
print("\n4. PROFILEDETAILS TABLE:")
profiles = ProfileDetails.objects.all()
print(f"Total profiles: {profiles.count()}")
for profile in profiles:
    print(f"  - User: {profile.user.full_name}, Location: {profile.location}")
    print()

# Check VerificationDetails table
print("\n5. VERIFICATIONDETAILS TABLE:")
verifications = VerificationDetails.objects.all()
print(f"Total verifications: {verifications.count()}")
for ver in verifications:
    print(f"  - User: {ver.user.full_name}, Status: {ver.status}, Verified: {ver.is_verified}")
    print()

# Check VendorService table
print("\n6. VENDORSERVICE TABLE:")
services = VendorService.objects.all()
print(f"Total services: {services.count()}")
for service in services:
    print(f"  - Service: {service.name}, Icon: {service.icon}")
    print()

print("=== DATABASE CHECK COMPLETE ===")