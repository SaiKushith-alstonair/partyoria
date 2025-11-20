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

print("=== CHECKING DATABASE SCHEMA ===\n")

with connection.cursor() as cursor:
    # Check vendor_services table structure
    cursor.execute("""
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'vendor_services'
        ORDER BY ordinal_position;
    """)
    
    print("VENDOR_SERVICES TABLE COLUMNS:")
    columns = cursor.fetchall()
    if columns:
        for col in columns:
            print(f"  - {col[0]} ({col[1]}) - Nullable: {col[2]}")
    else:
        print("  Table not found or no columns")
    
    print()
    
    # Check if there are any tables with 'vendor' in the name
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%vendor%' 
        AND table_schema = 'public'
        ORDER BY table_name;
    """)
    
    print("TABLES WITH 'VENDOR' IN NAME:")
    tables = cursor.fetchall()
    for table in tables:
        print(f"  - {table[0]}")
    
    print()
    
    # Check user_details table if it exists
    cursor.execute("""
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'user_details'
        ORDER BY ordinal_position;
    """)
    
    print("USER_DETAILS TABLE COLUMNS:")
    columns = cursor.fetchall()
    if columns:
        for col in columns:
            print(f"  - {col[0]} ({col[1]}) - Nullable: {col[2]}")
    else:
        print("  Table not found")

print("\n=== SCHEMA CHECK COMPLETE ===")