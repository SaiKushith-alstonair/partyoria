#!/usr/bin/env python3
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser

print("=== Checking Users ===")
users = CustomUser.objects.all()
print(f"Total users: {users.count()}")

for user in users:
    print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}, Type: {user.user_type}")

# Try to create a test user if none exist
if users.count() == 0:
    print("\nNo users found. Creating test user...")
    user = CustomUser.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        user_type='customer'
    )
    print(f"Created user: {user.username}")