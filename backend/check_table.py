import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()
cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'booking_details'
    ORDER BY ordinal_position
""")

print("booking_details table structure:")
print("-" * 50)
for row in cursor.fetchall():
    print(f"{row[0]}: {row[1]}")
