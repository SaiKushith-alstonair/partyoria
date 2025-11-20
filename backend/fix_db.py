import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    # Fix content types
    cursor.execute("DELETE FROM django_content_type WHERE id NOT IN (SELECT MIN(id) FROM django_content_type GROUP BY app_label, model)")
    cursor.execute("SELECT setval('django_content_type_id_seq', (SELECT MAX(id) FROM django_content_type) + 1)")
    
    # Fix permissions
    cursor.execute("DELETE FROM auth_permission WHERE id NOT IN (SELECT MIN(id) FROM auth_permission GROUP BY content_type_id, codename)")
    cursor.execute("SELECT setval('auth_permission_id_seq', (SELECT MAX(id) FROM auth_permission) + 1)")
    
    # Fix migrations
    cursor.execute("DELETE FROM django_migrations WHERE id NOT IN (SELECT MIN(id) FROM django_migrations GROUP BY app, name)")
    cursor.execute("SELECT setval('django_migrations_id_seq', (SELECT MAX(id) FROM django_migrations) + 1)")
    
print("Database fixed!")