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

print("=== CHECKING TABLE STATE ===\n")

with connection.cursor() as cursor:
    # Check profile_details table
    print("1. PROFILE_DETAILS TABLE:")
    cursor.execute("SELECT COUNT(*) FROM profile_details")
    count = cursor.fetchone()[0]
    print(f"Total records: {count}")
    
    cursor.execute("""
        SELECT user_id, COUNT(*) 
        FROM profile_details 
        GROUP BY user_id 
        HAVING COUNT(*) > 1
        ORDER BY COUNT(*) DESC
    """)
    duplicates = cursor.fetchall()
    print(f"Duplicate user_ids: {len(duplicates)}")
    if duplicates:
        for user_id, count in duplicates[:5]:
            print(f"  user_id {user_id}: {count} records")
    
    # Check if user_ids are already CustomUser IDs or UserDetails IDs
    cursor.execute("""
        SELECT pd.user_id, 
               CASE WHEN au.id IS NOT NULL THEN 'CustomUser' ELSE 'Unknown' END as type
        FROM profile_details pd
        LEFT JOIN authentication_customuser au ON pd.user_id = au.id
        LIMIT 5
    """)
    sample_data = cursor.fetchall()
    print("Sample data:")
    for user_id, type_name in sample_data:
        print(f"  user_id {user_id}: {type_name}")
    
    print()
    
    # Check user_details table
    print("2. USER_DETAILS TABLE:")
    cursor.execute("SELECT COUNT(*) FROM user_details")
    count = cursor.fetchone()[0]
    print(f"Total records: {count}")
    
    # Check mapping between user_details and CustomUser
    cursor.execute("""
        SELECT ud.id as ud_id, ud.email, au.id as au_id
        FROM user_details ud
        LEFT JOIN authentication_customuser au ON ud.email = au.email
        WHERE au.user_type = 'vendor'
        LIMIT 5
    """)
    mapping_data = cursor.fetchall()
    print("Sample mapping (UserDetails -> CustomUser):")
    for ud_id, email, au_id in mapping_data:
        print(f"  {ud_id} ({email}) -> {au_id}")

print("\n=== CHECK COMPLETE ===")