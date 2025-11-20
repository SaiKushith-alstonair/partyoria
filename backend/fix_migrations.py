#!/usr/bin/env python
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

def fix_migration_table():
    with connection.cursor() as cursor:
        # Check for duplicate entries
        cursor.execute("""
            SELECT app, name, COUNT(*) 
            FROM django_migrations 
            GROUP BY app, name 
            HAVING COUNT(*) > 1
        """)
        duplicates = cursor.fetchall()
        
        if duplicates:
            print("Found duplicates:", duplicates)
            
            # Remove duplicates, keeping only one entry per migration
            cursor.execute("""
                DELETE FROM django_migrations 
                WHERE id NOT IN (
                    SELECT MIN(id) 
                    FROM django_migrations 
                    GROUP BY app, name
                )
            """)
            print("Removed duplicate migration entries")
        
        # Reset the sequence to avoid future conflicts
        cursor.execute("""
            SELECT setval('django_migrations_id_seq', 
                         (SELECT MAX(id) FROM django_migrations) + 1)
        """)
        print("Reset migration ID sequence")

if __name__ == '__main__':
    fix_migration_table()
    print("Migration table fixed!")