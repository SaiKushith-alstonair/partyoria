#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

print("=== SIMPLE VENDOR CLEANUP ===\n")

with connection.cursor() as cursor:
    # Clear only existing tables
    cursor.execute("DELETE FROM chat_message WHERE conversation_id IN (SELECT id FROM chat_conversation WHERE vendor_id IN (SELECT id FROM authentication_customuser WHERE user_type = 'vendor') OR customer_id IN (SELECT id FROM authentication_customuser WHERE user_type = 'vendor'));")
    cursor.execute("DELETE FROM chat_conversation WHERE vendor_id IN (SELECT id FROM authentication_customuser WHERE user_type = 'vendor') OR customer_id IN (SELECT id FROM authentication_customuser WHERE user_type = 'vendor');")
    cursor.execute("DELETE FROM authentication_usersession WHERE user_id IN (SELECT id FROM authentication_customuser WHERE user_type = 'vendor');")
    
    # Clear vendor tables
    cursor.execute("DELETE FROM vendor_services;")
    cursor.execute("DELETE FROM profile_details;") 
    cursor.execute("DELETE FROM verification_details;")
    cursor.execute("DELETE FROM booking_details;")
    
    # Clear vendor users
    cursor.execute("DELETE FROM authentication_customuser WHERE user_type = 'vendor';")
    
    print("All vendor data cleared")

print("\n=== CLEANUP COMPLETE ===")