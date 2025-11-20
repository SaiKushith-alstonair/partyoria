#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from vendors.models import VendorAuth

def cleanup_duplicate_users():
    """Clean up duplicate CustomUser entries"""
    
    email = 'vendor@test.com'
    
    # Get all CustomUser entries with this email
    users = CustomUser.objects.filter(email=email, user_type='vendor')
    print(f"Found {users.count()} CustomUser entries for {email}")
    
    if users.count() > 1:
        # Keep the first one, delete the rest
        primary_user = users.first()
        duplicate_users = users.exclude(id=primary_user.id)
        
        print(f"Keeping user ID {primary_user.id}, deleting {duplicate_users.count()} duplicates")
        duplicate_users.delete()
        
        print(f"Cleanup complete. Remaining user: {primary_user.email} (ID: {primary_user.id})")
    else:
        print("No duplicates found")

if __name__ == '__main__':
    cleanup_duplicate_users()