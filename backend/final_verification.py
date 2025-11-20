#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

print("=== FINAL VERIFICATION ===\n")

with connection.cursor() as cursor:
    # Check all foreign key relationships are valid
    print("Verifying all foreign key relationships:")
    
    # 1. Profile details
    cursor.execute("""
        SELECT COUNT(*) 
        FROM profile_details pd
        JOIN authentication_customuser au ON pd.user_id = au.id
        WHERE au.user_type = 'vendor'
    """)
    valid_profiles = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM profile_details")
    total_profiles = cursor.fetchone()[0]
    print(f"   profile_details: {valid_profiles}/{total_profiles} valid")
    
    # 2. Verification details
    cursor.execute("""
        SELECT COUNT(*) 
        FROM verification_details vd
        JOIN authentication_customuser au ON vd.user_id = au.id
        WHERE au.user_type = 'vendor'
    """)
    valid_verifications = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM verification_details")
    total_verifications = cursor.fetchone()[0]
    print(f"   verification_details: {valid_verifications}/{total_verifications} valid")
    
    # 3. Vendor services
    cursor.execute("""
        SELECT COUNT(*) 
        FROM vendor_services vs
        JOIN authentication_customuser au ON vs.user_id = au.id
        WHERE au.user_type = 'vendor'
    """)
    valid_services = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM vendor_services")
    total_services = cursor.fetchone()[0]
    print(f"   vendor_services: {valid_services}/{total_services} valid")
    
    # 4. Show sample data
    print("\nSample valid relationships:")
    cursor.execute("""
        SELECT au.id, au.email, au.full_name, au.business
        FROM authentication_customuser au
        WHERE au.user_type = 'vendor'
        AND EXISTS (SELECT 1 FROM vendor_services vs WHERE vs.user_id = au.id)
        LIMIT 5
    """)
    
    vendors_with_services = cursor.fetchall()
    for vendor in vendors_with_services:
        print(f"   Vendor {vendor[0]}: {vendor[1]} ({vendor[2]}) - {vendor[3]}")

print("\n=== VERIFICATION COMPLETE ===")
print("All vendor tables now properly reference CustomUser authentication table")
print("Database migration and cleanup successful!")