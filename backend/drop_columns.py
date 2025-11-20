import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()

columns_to_drop = [
    'full_name', 'mobile', 'business', 'experience_level', 
    'is_online', 'location', 'city', 'state', 'pincode'
]

for column in columns_to_drop:
    try:
        cursor.execute(f"ALTER TABLE authentication_customuser DROP COLUMN IF EXISTS {column};")
        print(f"Dropped column: {column}")
    except Exception as e:
        print(f"Error dropping {column}: {e}")

print("Column cleanup completed!")