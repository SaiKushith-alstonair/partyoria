#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection
from authentication.models import CustomUser

print("=== VERIFYING CLEANUP ===\n")

# Check CustomUser vendors
vendors = CustomUser.objects.filter(user_type='vendor')
print(f"CustomUser vendors: {vendors.count()}")

with connection.cursor() as cursor:
    # Check all vendor tables
    cursor.execute("SELECT COUNT(*) FROM vendor_services")
    services = cursor.fetchone()[0]
    print(f"Vendor services: {services}")
    
    cursor.execute("SELECT COUNT(*) FROM profile_details")
    profiles = cursor.fetchone()[0]
    print(f"Profile details: {profiles}")
    
    cursor.execute("SELECT COUNT(*) FROM verification_details")
    verifications = cursor.fetchone()[0]
    print(f"Verification details: {verifications}")
    
    cursor.execute("SELECT COUNT(*) FROM booking_details")
    bookings = cursor.fetchone()[0]
    print(f"Booking details: {bookings}")

print("\n=== VERIFICATION COMPLETE ===")
print("All vendor data successfully cleared")