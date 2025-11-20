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

print("=== MIGRATING VENDOR TABLES TO USE CUSTOMUSER ===\n")

with connection.cursor() as cursor:
    # 1. Update profile_details table
    print("1. Updating profile_details table...")
    cursor.execute("""
        ALTER TABLE profile_details 
        DROP CONSTRAINT IF EXISTS profile_details_user_id_fkey;
    """)
    
    cursor.execute("""
        UPDATE profile_details 
        SET user_id = (
            SELECT au.id 
            FROM authentication_customuser au 
            JOIN user_details ud ON au.email = ud.email 
            WHERE ud.id = profile_details.user_id
        )
        WHERE EXISTS (
            SELECT 1 
            FROM authentication_customuser au 
            JOIN user_details ud ON au.email = ud.email 
            WHERE ud.id = profile_details.user_id
        );
    """)
    
    cursor.execute("""
        ALTER TABLE profile_details 
        ADD CONSTRAINT profile_details_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES authentication_customuser(id);
    """)
    print("   ✓ profile_details updated")
    
    # 2. Update verification_details table
    print("2. Updating verification_details table...")
    cursor.execute("""
        ALTER TABLE verification_details 
        DROP CONSTRAINT IF EXISTS verification_details_user_id_fkey;
    """)
    
    cursor.execute("""
        UPDATE verification_details 
        SET user_id = (
            SELECT au.id 
            FROM authentication_customuser au 
            JOIN user_details ud ON au.email = ud.email 
            WHERE ud.id = verification_details.user_id
        )
        WHERE EXISTS (
            SELECT 1 
            FROM authentication_customuser au 
            JOIN user_details ud ON au.email = ud.email 
            WHERE ud.id = verification_details.user_id
        );
    """)
    
    cursor.execute("""
        ALTER TABLE verification_details 
        ADD CONSTRAINT verification_details_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES authentication_customuser(id);
    """)
    print("   ✓ verification_details updated")
    
    # 3. Update booking_details table
    print("3. Updating booking_details table...")
    cursor.execute("""
        ALTER TABLE booking_details 
        DROP CONSTRAINT IF EXISTS booking_details_vendor_id_fkey;
    """)
    
    cursor.execute("""
        UPDATE booking_details 
        SET vendor_id = (
            SELECT au.id 
            FROM authentication_customuser au 
            JOIN user_details ud ON au.email = ud.email 
            WHERE ud.id = booking_details.vendor_id
        )
        WHERE EXISTS (
            SELECT 1 
            FROM authentication_customuser au 
            JOIN user_details ud ON au.email = ud.email 
            WHERE ud.id = booking_details.vendor_id
        );
    """)
    
    cursor.execute("""
        ALTER TABLE booking_details 
        ADD CONSTRAINT booking_details_vendor_id_fkey 
        FOREIGN KEY (vendor_id) REFERENCES authentication_customuser(id);
    """)
    print("   ✓ booking_details updated")
    
    # 4. Update vendors_vendorchat table
    print("4. Updating vendors_vendorchat table...")
    cursor.execute("""
        ALTER TABLE vendors_vendorchat 
        DROP CONSTRAINT IF EXISTS vendors_vendorchat_sender_id_fkey,
        DROP CONSTRAINT IF EXISTS vendors_vendorchat_receiver_id_fkey;
    """)
    
    cursor.execute("""
        UPDATE vendors_vendorchat 
        SET sender_id = (
            SELECT au.id 
            FROM authentication_customuser au 
            JOIN user_details ud ON au.email = ud.email 
            WHERE ud.id = vendors_vendorchat.sender_id
        )
        WHERE EXISTS (
            SELECT 1 
            FROM authentication_customuser au 
            JOIN user_details ud ON au.email = ud.email 
            WHERE ud.id = vendors_vendorchat.sender_id
        );
    """)
    
    cursor.execute("""
        UPDATE vendors_vendorchat 
        SET receiver_id = (
            SELECT au.id 
            FROM authentication_customuser au 
            JOIN user_details ud ON au.email = ud.email 
            WHERE ud.id = vendors_vendorchat.receiver_id
        )
        WHERE EXISTS (
            SELECT 1 
            FROM authentication_customuser au 
            JOIN user_details ud ON au.email = ud.email 
            WHERE ud.id = vendors_vendorchat.receiver_id
        );
    """)
    
    cursor.execute("""
        ALTER TABLE vendors_vendorchat 
        ADD CONSTRAINT vendors_vendorchat_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES authentication_customuser(id),
        ADD CONSTRAINT vendors_vendorchat_receiver_id_fkey 
        FOREIGN KEY (receiver_id) REFERENCES authentication_customuser(id);
    """)
    print("   ✓ vendors_vendorchat updated")
    
    # 5. Update vendors_calendarevent table
    print("5. Updating vendors_calendarevent table...")
    cursor.execute("""
        ALTER TABLE vendors_calendarevent 
        DROP CONSTRAINT IF EXISTS vendors_calendarevent_vendor_id_fkey;
    """)
    
    cursor.execute("""
        UPDATE vendors_calendarevent 
        SET vendor_id = (
            SELECT au.id 
            FROM authentication_customuser au 
            JOIN user_details ud ON au.email = ud.email 
            WHERE ud.id = vendors_calendarevent.vendor_id
        )
        WHERE EXISTS (
            SELECT 1 
            FROM authentication_customuser au 
            JOIN user_details ud ON au.email = ud.email 
            WHERE ud.id = vendors_calendarevent.vendor_id
        );
    """)
    
    cursor.execute("""
        ALTER TABLE vendors_calendarevent 
        ADD CONSTRAINT vendors_calendarevent_vendor_id_fkey 
        FOREIGN KEY (vendor_id) REFERENCES authentication_customuser(id);
    """)
    print("   ✓ vendors_calendarevent updated")
    
    # 6. Drop vendor_bridge table
    print("6. Dropping vendor_bridge table...")
    cursor.execute("DROP TABLE IF EXISTS vendor_bridge CASCADE;")
    print("   ✓ vendor_bridge dropped")
    
    # 7. Drop user_details table
    print("7. Dropping user_details table...")
    cursor.execute("DROP TABLE IF EXISTS user_details CASCADE;")
    print("   ✓ user_details dropped")

print("\n=== MIGRATION COMPLETE ===")
print("All vendor tables now use CustomUser as foreign key")
print("Legacy UserDetails and VendorBridge tables removed")