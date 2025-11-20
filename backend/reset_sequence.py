import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

# Reset vendor_services sequence to start from 1
with connection.cursor() as cursor:
    # Reset the sequence to 1
    cursor.execute("ALTER SEQUENCE vendor_services_id_seq RESTART WITH 1;")
    print("Sequence reset to 1")
    
    # Check current sequence value
    cursor.execute("SELECT nextval('vendor_services_id_seq');")
    next_id = cursor.fetchone()[0]
    print(f"Next ID will be: {next_id}")
    
    # Reset back to 1 since we just consumed one
    cursor.execute("ALTER SEQUENCE vendor_services_id_seq RESTART WITH 1;")
    print("Sequence reset back to 1")