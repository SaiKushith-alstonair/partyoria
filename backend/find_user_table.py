import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection
from authentication.models import CustomUser

cursor = connection.cursor()
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%user%'")
print("User-related tables:")
for row in cursor.fetchall():
    print(f"  {row[0]}")

print(f"\nCustomUser table: {CustomUser._meta.db_table}")
