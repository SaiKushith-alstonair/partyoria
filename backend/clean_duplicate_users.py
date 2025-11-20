#!/usr/bin/env python3
import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken

def clean_and_fix():
    print("=== Cleaning Duplicate Users ===")
    
    # Find duplicate test users
    test_users = CustomUser.objects.filter(email='test@example.com')
    print(f"Found {test_users.count()} test users")
    
    # Keep the first one, delete the rest
    if test_users.count() > 1:
        first_user = test_users.first()
        duplicate_users = test_users.exclude(id=first_user.id)
        count = duplicate_users.count()
        duplicate_users.delete()
        print(f"Deleted {count} duplicate users")
    
    # Get or create the test user
    user, created = CustomUser.objects.get_or_create(
        email='test@example.com',
        defaults={
            'username': 'testuser_clean',
            'user_type': 'customer',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    
    # Set password
    user.set_password('testpass123')
    user.save()
    
    print(f"Test user ready: {user.email} (ID: {user.id})")
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    
    print(f"Access token: {access_token[:50]}...")
    
    # Test the token
    try:
        from rest_framework_simplejwt.authentication import JWTAuthentication
        jwt_auth = JWTAuthentication()
        validated_token = jwt_auth.get_validated_token(access_token)
        validated_user = jwt_auth.get_user(validated_token)
        print(f"Token validation: SUCCESS for {validated_user.username}")
        
        print("\n=== SOLUTION ===")
        print("1. Clear all browser storage (localStorage, sessionStorage)")
        print("2. Login with: test@example.com / testpass123")
        print("3. The 401 errors should be resolved")
        
        return True
    except Exception as e:
        print(f"Token validation: FAILED - {e}")
        return False

if __name__ == '__main__':
    clean_and_fix()