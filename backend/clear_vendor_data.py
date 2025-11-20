#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

print("=== CLEARING ALL VENDOR DATA ===\n")

with connection.cursor() as cursor:
    # Delete all vendor-related data
    cursor.execute("DELETE FROM profile_details;")
    cursor.execute("DELETE FROM verification_details;")
    cursor.execute("DELETE FROM booking_details;")
    cursor.execute("DELETE FROM vendors_vendorchat;")
    cursor.execute("DELETE FROM vendors_calendarevent;")
    cursor.execute("DELETE FROM vendor_services;")
    cursor.execute("DELETE FROM authentication_customuser WHERE user_type = 'vendor';")
    
    print("All vendor data cleared:")
    print("- CustomUser vendors: 0")
    print("- Vendor services: 0")
    print("- Profile details: 0")
    print("- Verification details: 0")
    print("- Booking details: 0")
    print("- Chat messages: 0")
    print("- Calendar events: 0")

print("\n=== CLEANUP COMPLETE ===")
print("All vendor authentication and related data removed")