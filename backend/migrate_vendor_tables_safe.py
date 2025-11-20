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

print("=== SAFELY MIGRATING VENDOR TABLES TO USE CUSTOMUSER ===\n")

with connection.cursor() as cursor:
    # First, let's check what tables exist and their current structure
    print("Checking existing tables...")
    
    # Check if tables exist
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name IN ('profile_details', 'verification_details', 'booking_details', 'vendors_vendorchat', 'vendors_calendarevent', 'user_details', 'vendor_bridge')
        AND table_schema = 'public'
    """)
    existing_tables = [row[0] for row in cursor.fetchall()]
    print(f"Existing tables: {existing_tables}")
    
    # 1. Clean up profile_details table
    if 'profile_details' in existing_tables:
        print("\n1. Cleaning profile_details table...")
        
        # Remove duplicates - keep only the first occurrence
        cursor.execute("""
            DELETE FROM profile_details 
            WHERE id NOT IN (
                SELECT MIN(id) 
                FROM profile_details 
                GROUP BY user_id
            );
        """)
        
        # Drop existing constraint
        cursor.execute("""
            ALTER TABLE profile_details 
            DROP CONSTRAINT IF EXISTS profile_details_user_id_fkey;
        """)
        
        # Create temporary mapping table
        cursor.execute("""
            CREATE TEMP TABLE user_mapping AS
            SELECT ud.id as old_id, au.id as new_id
            FROM user_details ud
            JOIN authentication_customuser au ON ud.email = au.email
            WHERE au.user_type = 'vendor';
        """)
        
        # Update profile_details to use CustomUser IDs
        cursor.execute("""
            UPDATE profile_details 
            SET user_id = um.new_id
            FROM user_mapping um
            WHERE profile_details.user_id = um.old_id;
        """)
        
        # Add new constraint
        cursor.execute("""
            ALTER TABLE profile_details 
            ADD CONSTRAINT profile_details_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES authentication_customuser(id);
        """)
        print("   ✓ profile_details updated")
    
    # 2. Clean up verification_details table
    if 'verification_details' in existing_tables:
        print("2. Cleaning verification_details table...")
        
        # Remove duplicates
        cursor.execute("""
            DELETE FROM verification_details 
            WHERE id NOT IN (
                SELECT MIN(id) 
                FROM verification_details 
                GROUP BY user_id
            );
        """)
        
        cursor.execute("""
            ALTER TABLE verification_details 
            DROP CONSTRAINT IF EXISTS verification_details_user_id_fkey;
        """)
        
        cursor.execute("""
            UPDATE verification_details 
            SET user_id = um.new_id
            FROM user_mapping um
            WHERE verification_details.user_id = um.old_id;
        """)
        
        cursor.execute("""
            ALTER TABLE verification_details 
            ADD CONSTRAINT verification_details_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES authentication_customuser(id);
        """)
        print("   ✓ verification_details updated")
    
    # 3. Clean up booking_details table
    if 'booking_details' in existing_tables:
        print("3. Cleaning booking_details table...")
        
        cursor.execute("""
            ALTER TABLE booking_details 
            DROP CONSTRAINT IF EXISTS booking_details_vendor_id_fkey;
        """)
        
        cursor.execute("""
            UPDATE booking_details 
            SET vendor_id = um.new_id
            FROM user_mapping um
            WHERE booking_details.vendor_id = um.old_id;
        """)
        
        cursor.execute("""
            ALTER TABLE booking_details 
            ADD CONSTRAINT booking_details_vendor_id_fkey 
            FOREIGN KEY (vendor_id) REFERENCES authentication_customuser(id);
        """)
        print("   ✓ booking_details updated")
    
    # 4. Clean up vendors_vendorchat table
    if 'vendors_vendorchat' in existing_tables:
        print("4. Cleaning vendors_vendorchat table...")
        
        cursor.execute("""
            ALTER TABLE vendors_vendorchat 
            DROP CONSTRAINT IF EXISTS vendors_vendorchat_sender_id_fkey,
            DROP CONSTRAINT IF EXISTS vendors_vendorchat_receiver_id_fkey;
        """)
        
        cursor.execute("""
            UPDATE vendors_vendorchat 
            SET sender_id = um.new_id
            FROM user_mapping um
            WHERE vendors_vendorchat.sender_id = um.old_id;
        """)
        
        cursor.execute("""
            UPDATE vendors_vendorchat 
            SET receiver_id = um.new_id
            FROM user_mapping um
            WHERE vendors_vendorchat.receiver_id = um.old_id;
        """)
        
        cursor.execute("""
            ALTER TABLE vendors_vendorchat 
            ADD CONSTRAINT vendors_vendorchat_sender_id_fkey 
            FOREIGN KEY (sender_id) REFERENCES authentication_customuser(id),
            ADD CONSTRAINT vendors_vendorchat_receiver_id_fkey 
            FOREIGN KEY (receiver_id) REFERENCES authentication_customuser(id);
        """)
        print("   ✓ vendors_vendorchat updated")
    
    # 5. Clean up vendors_calendarevent table
    if 'vendors_calendarevent' in existing_tables:
        print("5. Cleaning vendors_calendarevent table...")
        
        cursor.execute("""
            ALTER TABLE vendors_calendarevent 
            DROP CONSTRAINT IF EXISTS vendors_calendarevent_vendor_id_fkey;
        """)
        
        cursor.execute("""
            UPDATE vendors_calendarevent 
            SET vendor_id = um.new_id
            FROM user_mapping um
            WHERE vendors_calendarevent.vendor_id = um.old_id;
        """)
        
        cursor.execute("""
            ALTER TABLE vendors_calendarevent 
            ADD CONSTRAINT vendors_calendarevent_vendor_id_fkey 
            FOREIGN KEY (vendor_id) REFERENCES authentication_customuser(id);
        """)
        print("   ✓ vendors_calendarevent updated")
    
    # 6. Drop legacy tables
    if 'vendor_bridge' in existing_tables:
        print("6. Dropping vendor_bridge table...")
        cursor.execute("DROP TABLE vendor_bridge CASCADE;")
        print("   ✓ vendor_bridge dropped")
    
    if 'user_details' in existing_tables:
        print("7. Dropping user_details table...")
        cursor.execute("DROP TABLE user_details CASCADE;")
        print("   ✓ user_details dropped")

print("\n=== MIGRATION COMPLETE ===")
print("All vendor tables now use CustomUser as foreign key")
print("Legacy UserDetails and VendorBridge tables removed")