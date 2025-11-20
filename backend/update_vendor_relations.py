#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

# Update all vendor-related tables to use vendor_auth instead of auth_user
sql_commands = [
    # Drop existing foreign key constraints
    "ALTER TABLE IF EXISTS profile_details DROP CONSTRAINT IF EXISTS profile_details_user_id_fkey;",
    "ALTER TABLE IF EXISTS verification_details DROP CONSTRAINT IF EXISTS verification_details_user_id_fkey;", 
    "ALTER TABLE IF EXISTS booking_details DROP CONSTRAINT IF EXISTS booking_details_vendor_id_fkey;",
    "ALTER TABLE IF EXISTS vendor_profiles DROP CONSTRAINT IF EXISTS vendor_profiles_user_id_fkey;",
    
    # Update column names and add new foreign keys
    "ALTER TABLE IF EXISTS profile_details RENAME COLUMN user_id TO vendor_id;",
    "ALTER TABLE IF EXISTS verification_details RENAME COLUMN user_id TO vendor_id;", 
    "ALTER TABLE IF EXISTS vendor_profiles RENAME COLUMN user_id TO vendor_id;",
    
    # Add foreign key constraints to vendor_auth
    "ALTER TABLE IF EXISTS profile_details ADD CONSTRAINT profile_details_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendor_auth(id);",
    "ALTER TABLE IF EXISTS verification_details ADD CONSTRAINT verification_details_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendor_auth(id);",
    "ALTER TABLE IF EXISTS booking_details ADD CONSTRAINT booking_details_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendor_auth(id);",
    "ALTER TABLE IF EXISTS vendor_profiles ADD CONSTRAINT vendor_profiles_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendor_auth(id);",
]

with connection.cursor() as cursor:
    for sql in sql_commands:
        try:
            cursor.execute(sql)
            print(f"✓ Executed: {sql}")
        except Exception as e:
            print(f"✗ Error executing {sql}: {e}")

print("Vendor table relationships updated!")