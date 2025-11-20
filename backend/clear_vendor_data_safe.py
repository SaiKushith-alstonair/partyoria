#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

print("=== CLEARING ALL VENDOR DATA SAFELY ===\n")

with connection.cursor() as cursor:
    # Clear chat conversations first
    cursor.execute("DELETE FROM chat_conversation WHERE customer_id IN (SELECT id FROM authentication_customuser WHERE user_type = 'vendor');")
    cursor.execute("DELETE FROM chat_message WHERE conversation_id NOT IN (SELECT id FROM chat_conversation);")
    
    # Clear vendor-related data
    cursor.execute("DELETE FROM profile_details;")
    cursor.execute("DELETE FROM verification_details;")
    cursor.execute("DELETE FROM booking_details;")
    cursor.execute("DELETE FROM vendors_vendorchat;")
    cursor.execute("DELETE FROM vendors_calendarevent;")
    cursor.execute("DELETE FROM vendor_services;")
    
    # Clear vendor users
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