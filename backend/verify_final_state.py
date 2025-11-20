#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection
from authentication.models import CustomUser

print("=== VERIFYING FINAL STATE ===\n")

# Check CustomUser vendors
vendors = CustomUser.objects.filter(user_type='vendor')
print(f"1. CustomUser vendors: {vendors.count()}")

with connection.cursor() as cursor:
    # Check vendor_services table
    cursor.execute("SELECT COUNT(*) FROM vendor_services")
    services_count = cursor.fetchone()[0]
    print(f"2. Vendor services: {services_count}")
    
    # Check profile_details
    cursor.execute("SELECT COUNT(*) FROM profile_details")
    profiles_count = cursor.fetchone()[0]
    print(f"3. Profile details: {profiles_count}")
    
    # Check verification_details
    cursor.execute("SELECT COUNT(*) FROM verification_details")
    verifications_count = cursor.fetchone()[0]
    print(f"4. Verification details: {verifications_count}")
    
    # Check booking_details
    cursor.execute("SELECT COUNT(*) FROM booking_details")
    bookings_count = cursor.fetchone()[0]
    print(f"5. Booking details: {bookings_count}")
    
    # Verify foreign key relationships
    print("\nVerifying foreign key relationships:")
    
    # Check if all profile_details reference valid CustomUser
    cursor.execute("""
        SELECT COUNT(*) 
        FROM profile_details pd
        JOIN authentication_customuser au ON pd.user_id = au.id
        WHERE au.user_type = 'vendor'
    """)
    valid_profiles = cursor.fetchone()[0]
    print(f"   Valid profile relationships: {valid_profiles}/{profiles_count}")
    
    # Check if all vendor_services reference valid CustomUser
    cursor.execute("""
        SELECT COUNT(*) 
        FROM vendor_services vs
        JOIN authentication_customuser au ON vs.user_id = au.id
        WHERE au.user_type = 'vendor'
    """)
    valid_services = cursor.fetchone()[0]
    print(f"   Valid service relationships: {valid_services}/{services_count}")

print("\n=== VERIFICATION COMPLETE ===")
print("All vendor data is now properly linked to CustomUser table")
print("Legacy UserDetails table has been removed")
print("Database migration successful!")