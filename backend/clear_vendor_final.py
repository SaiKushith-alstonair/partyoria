#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

print("=== CLEARING VENDOR DATA FINAL ===\n")

with connection.cursor() as cursor:
    # Clear chat references first
    cursor.execute("DELETE FROM chat_conversation WHERE vendor_id IN (SELECT id FROM authentication_customuser WHERE user_type = 'vendor');")
    cursor.execute("DELETE FROM chat_conversation WHERE customer_id IN (SELECT id FROM authentication_customuser WHERE user_type = 'vendor');")
    
    # Clear vendor tables
    cursor.execute("DELETE FROM vendor_services;")
    cursor.execute("DELETE FROM profile_details;") 
    cursor.execute("DELETE FROM verification_details;")
    cursor.execute("DELETE FROM booking_details;")
    
    # Clear vendor users
    cursor.execute("DELETE FROM authentication_customuser WHERE user_type = 'vendor';")
    
    print("Cleared all vendor data from:")
    print("- CustomUser table (vendors)")
    print("- vendor_services table")
    print("- profile_details table")
    print("- verification_details table") 
    print("- booking_details table")
    print("- chat_conversation references")

print("\n=== CLEANUP COMPLETE ===")
print("All vendor authentication and related data removed")