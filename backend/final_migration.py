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

print("=== FINAL VENDOR TABLE MIGRATION ===\n")

with connection.cursor() as cursor:
    # Create mapping table
    cursor.execute("""
        CREATE TEMP TABLE user_mapping AS
        SELECT ud.id as old_id, au.id as new_id
        FROM user_details ud
        JOIN authentication_customuser au ON ud.email = au.email
        WHERE au.user_type = 'vendor';
    """)
    
    cursor.execute("SELECT COUNT(*) FROM user_mapping")
    mapping_count = cursor.fetchone()[0]
    print(f"Created mapping for {mapping_count} users")
    
    # 1. Fix verification_details
    print("\n1. Updating verification_details...")
    cursor.execute("ALTER TABLE verification_details DROP CONSTRAINT IF EXISTS verification_details_user_id_720c2e9d_fk_user_details_id CASCADE;")
    cursor.execute("""
        UPDATE verification_details 
        SET user_id = um.new_id
        FROM user_mapping um
        WHERE verification_details.user_id = um.old_id;
    """)
    cursor.execute("ALTER TABLE verification_details ADD CONSTRAINT verification_details_user_id_fkey FOREIGN KEY (user_id) REFERENCES authentication_customuser(id);")
    print("   verification_details updated")
    
    # 2. Fix booking_details
    print("2. Updating booking_details...")
    cursor.execute("ALTER TABLE booking_details DROP CONSTRAINT IF EXISTS booking_details_vendor_id_fkey CASCADE;")
    cursor.execute("""
        UPDATE booking_details 
        SET vendor_id = um.new_id
        FROM user_mapping um
        WHERE booking_details.vendor_id = um.old_id;
    """)
    cursor.execute("ALTER TABLE booking_details ADD CONSTRAINT booking_details_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES authentication_customuser(id);")
    print("   booking_details updated")
    
    # 3. Fix vendors_calendarevent
    print("3. Updating vendors_calendarevent...")
    cursor.execute("ALTER TABLE vendors_calendarevent DROP CONSTRAINT IF EXISTS vendors_calendarevent_vendor_id_fkey CASCADE;")
    cursor.execute("""
        UPDATE vendors_calendarevent 
        SET vendor_id = um.new_id
        FROM user_mapping um
        WHERE vendors_calendarevent.vendor_id = um.old_id;
    """)
    cursor.execute("ALTER TABLE vendors_calendarevent ADD CONSTRAINT vendors_calendarevent_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES authentication_customuser(id);")
    print("   vendors_calendarevent updated")
    
    # 4. Fix vendors_vendorchat
    print("4. Updating vendors_vendorchat...")
    cursor.execute("ALTER TABLE vendors_vendorchat DROP CONSTRAINT IF EXISTS vendors_vendorchat_sender_id_fkey CASCADE;")
    cursor.execute("ALTER TABLE vendors_vendorchat DROP CONSTRAINT IF EXISTS vendors_vendorchat_receiver_id_fkey CASCADE;")
    
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
    
    cursor.execute("ALTER TABLE vendors_vendorchat ADD CONSTRAINT vendors_vendorchat_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES authentication_customuser(id);")
    cursor.execute("ALTER TABLE vendors_vendorchat ADD CONSTRAINT vendors_vendorchat_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES authentication_customuser(id);")
    print("   vendors_vendorchat updated")
    
    # 5. Drop legacy tables
    print("\n5. Dropping legacy tables...")
    cursor.execute("DROP TABLE IF EXISTS vendor_bridge CASCADE;")
    cursor.execute("DROP TABLE IF EXISTS user_details CASCADE;")
    print("   Legacy tables dropped")

print("\n=== MIGRATION COMPLETE ===")
print("All vendor tables now use CustomUser as foreign key")
print("Legacy UserDetails and VendorBridge tables removed")
print("Database schema updated successfully")