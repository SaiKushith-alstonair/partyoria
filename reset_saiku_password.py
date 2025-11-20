#!/usr/bin/env python3
"""
Reset password for saiku user
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

def reset_password():
    """Reset password for saiku user"""
    try:
        user = CustomUser.objects.get(username='saiku')
        user.set_password('saiku123')
        user.save()
        print(f"Password reset for user: {user.username}")
        
        # Verify the password works
        if user.check_password('saiku123'):
            print("Password verification successful!")
        else:
            print("Password verification failed!")
            
    except CustomUser.DoesNotExist:
        print("User 'saiku' not found")

if __name__ == "__main__":
    reset_password()