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

print("=== SIMPLE CLEANUP - REMOVING LEGACY TABLES ===\n")

with connection.cursor() as cursor:
    # Just drop the legacy tables since main tables already use CustomUser
    print("Dropping legacy tables...")
    
    cursor.execute("DROP TABLE IF EXISTS vendor_bridge CASCADE;")
    print("   vendor_bridge dropped")
    
    cursor.execute("DROP TABLE IF EXISTS user_details CASCADE;")
    print("   user_details dropped")

print("\n=== CLEANUP COMPLETE ===")
print("Legacy tables removed successfully")
print("All vendor functionality now uses CustomUser table")