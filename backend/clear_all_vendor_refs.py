#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

print("=== CLEARING ALL VENDOR REFERENCES ===\n")

with connection.cursor() as cursor:
    # Clear all chat data that references vendors
    cursor.execute("DELETE FROM chat_conversation WHERE customer_id IN (SELECT id FROM authentication_customuser WHERE user_type = 'vendor') OR vendor_id IN (SELECT id FROM authentication_customuser WHERE user_type = 'vendor');")
    cursor.execute("DELETE FROM chat_message WHERE conversation_id NOT IN (SELECT id FROM chat_conversation);")
    
    # Clear events data
    cursor.execute("DELETE FROM events_event WHERE user_id IN (SELECT id FROM authentication_customuser WHERE user_type = 'vendor');")
    cursor.execute("DELETE FROM events_quoterequest WHERE user_id IN (SELECT id FROM authentication_customuser WHERE user_type = 'vendor');")
    cursor.execute("DELETE FROM events_budget WHERE user_id IN (SELECT id FROM authentication_customuser WHERE user_type = 'vendor');")
    cursor.execute("DELETE FROM events_rsvp WHERE user_id IN (SELECT id FROM authentication_customuser WHERE user_type = 'vendor');")
    
    # Clear vendor-specific data
    cursor.execute("DELETE FROM profile_details;")
    cursor.execute("DELETE FROM verification_details;")
    cursor.execute("DELETE FROM booking_details;")
    cursor.execute("DELETE FROM vendors_vendorchat;")
    cursor.execute("DELETE FROM vendors_calendarevent;")
    cursor.execute("DELETE FROM vendor_services;")
    
    # Clear vendor users
    cursor.execute("DELETE FROM authentication_customuser WHERE user_type = 'vendor';")
    
    print("All vendor data and references cleared")

print("\n=== CLEANUP COMPLETE ===")
print("Database reset - no vendor data remaining")