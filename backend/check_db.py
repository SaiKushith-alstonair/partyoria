import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vendor_services' ORDER BY ordinal_position;")
    columns = cursor.fetchall()
    print("Current vendor_services table structure:")
    for col in columns:
        print(f"  {col[0]}: {col[1]}")