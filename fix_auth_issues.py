#!/usr/bin/env python3
"""
Quick fix for authentication issues
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.partyoria.settings')

# Change to backend directory
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

django.setup()

from authentication.models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken

def fix_auth_issues():
    print("=== Fixing Authentication Issues ===")
    
    # 1. Ensure test user exists with proper credentials
    test_email = "test@example.com"
    test_password = "testpass123"
    
    user, created = CustomUser.objects.get_or_create(
        email=test_email,
        defaults={
            'username': 'testuser',
            'user_type': 'customer',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    
    if created or not user.check_password(test_password):
        user.set_password(test_password)
        user.save()
        print(f"✓ Updated test user: {test_email} / {test_password}")
    else:
        print(f"✓ Test user exists: {test_email}")
    
    # 2. Generate fresh tokens for testing
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    print(f"✓ Generated fresh tokens:")
    print(f"  Access: {access_token[:50]}...")
    print(f"  Refresh: {refresh_token[:50]}...")
    
    # 3. Test token validation
    try:
        from rest_framework_simplejwt.authentication import JWTAuthentication
        jwt_auth = JWTAuthentication()
        validated_token = jwt_auth.get_validated_token(access_token)
        validated_user = jwt_auth.get_user(validated_token)
        print(f"✓ Token validation successful for: {validated_user.username}")
    except Exception as e:
        print(f"✗ Token validation failed: {e}")
        return False
    
    # 4. Create a simple test script
    test_script = f'''
// Test these credentials in your frontend:
const testCredentials = {{
    email: "{test_email}",
    password: "{test_password}",
    access_token: "{access_token}",
    refresh_token: "{refresh_token}"
}};

// Test login
fetch('http://localhost:8000/api/auth/login/', {{
    method: 'POST',
    headers: {{ 'Content-Type': 'application/json' }},
    body: JSON.stringify({{
        username: testCredentials.email,
        password: testCredentials.password
    }})
}})
.then(r => r.json())
.then(data => console.log('Login result:', data));

// Test API with token
fetch('http://localhost:8000/api/events/', {{
    headers: {{ 'Authorization': `Bearer ${{testCredentials.access_token}}` }}
}})
.then(r => r.json())
.then(data => console.log('Events result:', data));
'''
    
    with open('test_auth.js', 'w') as f:
        f.write(test_script)
    
    print("✓ Created test_auth.js with working credentials")
    print("\n=== Quick Fix Complete ===")
    print("1. Use the test credentials above")
    print("2. Clear browser localStorage/sessionStorage")
    print("3. Try logging in with test@example.com / testpass123")
    
    return True

if __name__ == '__main__':
    fix_auth_issues()