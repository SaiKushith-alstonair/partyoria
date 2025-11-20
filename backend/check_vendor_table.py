import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    # Check vendor_auth table structure
    cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vendor_auth' ORDER BY ordinal_position;")
    vendor_columns = cursor.fetchall()
    print("vendor_auth table structure:")
    for col in vendor_columns:
        print(f"  {col[0]}: {col[1]}")
    
    print("\n" + "="*50 + "\n")
    
    # Check vendor_services table structure
    cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vendor_services' ORDER BY ordinal_position;")
    service_columns = cursor.fetchall()
    print("vendor_services table structure:")
    for col in service_columns:
        print(f"  {col[0]}: {col[1]}")
    
    print("\n" + "="*50 + "\n")
    
    # Check if there are any vendor_auth records
    cursor.execute("SELECT id, email, full_name FROM vendor_auth LIMIT 5;")
    vendors = cursor.fetchall()
    print("Sample vendor_auth records:")
    for vendor in vendors:
        print(f"  ID: {vendor[0]}, Email: {vendor[1]}, Name: {vendor[2]}")
    
    print("\n" + "="*50 + "\n")
    
    # Check if there are any vendor_services records
    cursor.execute("SELECT id, service_name, category, user_id FROM vendor_services LIMIT 5;")
    services = cursor.fetchall()
    print("Sample vendor_services records:")
    for service in services:
        print(f"  ID: {service[0]}, Name: {service[1]}, Category: {service[2]}, User ID: {service[3]}")