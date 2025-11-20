#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

print("=== CLEANING ORPHANED RECORDS ===\n")

with connection.cursor() as cursor:
    # 1. Clean profile_details - remove records not linked to vendor CustomUsers
    print("1. Cleaning profile_details...")
    cursor.execute("""
        DELETE FROM profile_details 
        WHERE user_id NOT IN (
            SELECT id FROM authentication_customuser WHERE user_type = 'vendor'
        );
    """)
    print(f"   Removed orphaned profile records")
    
    # 2. Clean verification_details
    print("2. Cleaning verification_details...")
    cursor.execute("""
        DELETE FROM verification_details 
        WHERE user_id NOT IN (
            SELECT id FROM authentication_customuser WHERE user_type = 'vendor'
        );
    """)
    print(f"   Removed orphaned verification records")
    
    # 3. Clean booking_details
    print("3. Cleaning booking_details...")
    cursor.execute("""
        DELETE FROM booking_details 
        WHERE vendor_id NOT IN (
            SELECT id FROM authentication_customuser WHERE user_type = 'vendor'
        );
    """)
    print(f"   Removed orphaned booking records")
    
    # 4. Clean vendors_vendorchat
    print("4. Cleaning vendors_vendorchat...")
    cursor.execute("""
        DELETE FROM vendors_vendorchat 
        WHERE sender_id NOT IN (
            SELECT id FROM authentication_customuser WHERE user_type = 'vendor'
        ) OR receiver_id NOT IN (
            SELECT id FROM authentication_customuser WHERE user_type = 'vendor'
        );
    """)
    print(f"   Removed orphaned chat records")
    
    # 5. Clean vendors_calendarevent
    print("5. Cleaning vendors_calendarevent...")
    cursor.execute("""
        DELETE FROM vendors_calendarevent 
        WHERE vendor_id NOT IN (
            SELECT id FROM authentication_customuser WHERE user_type = 'vendor'
        );
    """)
    print(f"   Removed orphaned calendar records")
    
    # 6. Clean vendor_services
    print("6. Cleaning vendor_services...")
    cursor.execute("""
        DELETE FROM vendor_services 
        WHERE user_id NOT IN (
            SELECT id FROM authentication_customuser WHERE user_type = 'vendor'
        );
    """)
    print(f"   Removed orphaned service records")
    
    # Verify final counts
    print("\nFinal counts:")
    
    cursor.execute("SELECT COUNT(*) FROM profile_details")
    print(f"   profile_details: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM verification_details")
    print(f"   verification_details: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM vendor_services")
    print(f"   vendor_services: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM authentication_customuser WHERE user_type = 'vendor'")
    print(f"   vendor users: {cursor.fetchone()[0]}")

print("\n=== CLEANUP COMPLETE ===")
print("All orphaned records removed")
print("All tables now only reference valid CustomUser vendor IDs")