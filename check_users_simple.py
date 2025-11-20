#!/usr/bin/env python3
"""
Check what users exist in the database
"""
import os
import sys
import django

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser

def check_users():
    """Check what users exist"""
    print("=== Checking Users ===")
    
    users = CustomUser.objects.all()
    print(f"Total users: {users.count()}")
    
    for user in users:
        print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}, Type: {user.user_type}")
        
    # Try to find the saiku user
    try:
        saiku_user = CustomUser.objects.get(username='saiku')
        print(f"\nFound saiku user: ID {saiku_user.id}, Email: {saiku_user.email}")
        
        # Test password
        if saiku_user.check_password('saiku123'):
            print("Password 'saiku123' is correct")
        else:
            print("Password 'saiku123' is incorrect")
            
        # Try other common passwords
        for pwd in ['1234', 'password', 'saiku', 'admin']:
            if saiku_user.check_password(pwd):
                print(f"Password '{pwd}' is correct")
                break
        else:
            print("None of the common passwords work")
            
    except CustomUser.DoesNotExist:
        print("User 'saiku' not found")
        
        # Try to find by email
        try:
            user_by_email = CustomUser.objects.get(email='saikushith@alstonair.com')
            print(f"Found user by email: {user_by_email.username}")
        except CustomUser.DoesNotExist:
            print("No user found with email 'saikushith@alstonair.com'")

if __name__ == "__main__":
    check_users()