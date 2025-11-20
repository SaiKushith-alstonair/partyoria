#!/usr/bin/env python3
import os
import django
import sys

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from authentication.models import CustomUser

def test_token_generation():
    """Test JWT token generation and validation"""
    print("Testing JWT Token Generation...")
    
    # Get or create a test user
    user, created = CustomUser.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@example.com',
            'user_type': 'customer'
        }
    )
    
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"Created test user: {user.username}")
    else:
        print(f"Using existing test user: {user.username}")
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token
    
    print(f"Access Token: {str(access_token)[:50]}...")
    print(f"Refresh Token: {str(refresh)[:50]}...")
    
    # Test token validation
    try:
        from rest_framework_simplejwt.authentication import JWTAuthentication
        jwt_auth = JWTAuthentication()
        
        # Simulate token validation
        validated_token = jwt_auth.get_validated_token(str(access_token))
        validated_user = jwt_auth.get_user(validated_token)
        
        print(f"Token validation successful for user: {validated_user.username}")
        return True
    except Exception as e:
        print(f"Token validation failed: {e}")
        return False

def clear_invalid_tokens():
    """Clear any blacklisted tokens"""
    try:
        from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
        count = BlacklistedToken.objects.count()
        print(f"Found {count} blacklisted tokens")
        
        # Clear old blacklisted tokens (optional)
        # BlacklistedToken.objects.all().delete()
        # print("Cleared all blacklisted tokens")
    except ImportError:
        print("Token blacklist not available")

if __name__ == '__main__':
    print("=== JWT Token Validation Test ===")
    clear_invalid_tokens()
    success = test_token_generation()
    
    if success:
        print("✅ Token system is working correctly")
    else:
        print("❌ Token system has issues")