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
from authentication.models import CustomUser

print("=== COMPREHENSIVE VENDOR DATA CHECK ===\n")

# 1. Check CustomUser table for vendors
print("1. CUSTOMUSER TABLE (Main Auth):")
vendors = CustomUser.objects.filter(user_type='vendor')
print(f"Total vendors in CustomUser: {vendors.count()}")

# Show sample vendor data
if vendors.count() > 0:
    print("Sample vendor data:")
    for v in vendors[:3]:  # Show first 3 vendors
        print(f"  - {v.email}: {v.full_name} ({v.business}) - {v.location}")

print()

# 2. Check vendor_services table directly
print("2. VENDOR_SERVICES TABLE:")
with connection.cursor() as cursor:
    cursor.execute("SELECT COUNT(*) FROM vendor_services")
    service_count = cursor.fetchone()[0]
    print(f"Total services: {service_count}")
    
    if service_count > 0:
        cursor.execute("""
            SELECT vs.service_name, vs.category, vs.service_price, au.email 
            FROM vendor_services vs 
            JOIN authentication_customuser au ON vs.user_id = au.id 
            LIMIT 5
        """)
        services = cursor.fetchall()
        print("Sample services:")
        for service in services:
            print(f"  - {service[0]} ({service[1]}) - Rs.{service[2]} by {service[3]}")

print()

# 3. Check user_details table
print("3. USER_DETAILS TABLE (Legacy):")
with connection.cursor() as cursor:
    cursor.execute("SELECT COUNT(*) FROM user_details")
    user_details_count = cursor.fetchone()[0]
    print(f"Total entries in user_details: {user_details_count}")
    
    if user_details_count > 0:
        cursor.execute("SELECT email, full_name, business FROM user_details LIMIT 5")
        user_details = cursor.fetchall()
        print("Sample user details:")
        for ud in user_details:
            print(f"  - {ud[0]}: {ud[1]} ({ud[2]})")

print()

# 4. Check other vendor-related tables
print("4. OTHER VENDOR TABLES:")

# Check vendor_categories
with connection.cursor() as cursor:
    cursor.execute("SELECT COUNT(*) FROM vendor_categories")
    cat_count = cursor.fetchone()[0]
    print(f"Vendor categories: {cat_count}")

# Check vendors_calendarevent
with connection.cursor() as cursor:
    cursor.execute("SELECT COUNT(*) FROM vendors_calendarevent")
    cal_count = cursor.fetchone()[0]
    print(f"Calendar events: {cal_count}")

# Check vendors_vendorchat
with connection.cursor() as cursor:
    cursor.execute("SELECT COUNT(*) FROM vendors_vendorchat")
    chat_count = cursor.fetchone()[0]
    print(f"Vendor chats: {chat_count}")

print()

# 5. Check data relationships
print("5. DATA RELATIONSHIPS:")
with connection.cursor() as cursor:
    # Check how many vendors have services
    cursor.execute("""
        SELECT COUNT(DISTINCT vs.user_id) 
        FROM vendor_services vs 
        JOIN authentication_customuser au ON vs.user_id = au.id 
        WHERE au.user_type = 'vendor'
    """)
    vendors_with_services = cursor.fetchone()[0]
    print(f"Vendors with services: {vendors_with_services} out of {vendors.count()}")
    
    # Check average services per vendor
    if vendors_with_services > 0:
        cursor.execute("""
            SELECT AVG(service_count) 
            FROM (
                SELECT COUNT(*) as service_count 
                FROM vendor_services vs 
                JOIN authentication_customuser au ON vs.user_id = au.id 
                WHERE au.user_type = 'vendor' 
                GROUP BY vs.user_id
            ) as subquery
        """)
        avg_services = cursor.fetchone()[0]
        print(f"Average services per vendor: {float(avg_services):.1f}")

print("\n=== VENDOR DATA CHECK COMPLETE ===")

# Summary
print("\n=== SUMMARY ===")
print(f"Vendor authentication data: {vendors.count()} vendors in CustomUser table")
print(f"Vendor services data: {service_count} services in vendor_services table")
print(f"Legacy vendor data: {user_details_count} entries in user_details table")
print(f"Vendor categories: {cat_count} categories")
print(f"Calendar events: {cal_count} events")
print(f"Chat messages: {chat_count} messages")

if vendors.count() > 0 and service_count > 0:
    print("\nVENDOR DATA IS PROPERLY STORED IN DATABASE")
else:
    print("\nSOME VENDOR DATA IS MISSING")