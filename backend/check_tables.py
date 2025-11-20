import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'chat_%' OR table_name LIKE '%chat%';")
    tables = cursor.fetchall()
    print("Chat-related tables:")
    for table in tables:
        print(f"  {table[0]}")