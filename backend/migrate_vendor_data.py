#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection
from authentication.models import CustomUser

def migrate_vendor_data():
    """Migrate data from user_details to authentication_customuser"""
    
    cursor = connection.cursor()
    
    # Get all vendor data from user_details
    cursor.execute("""
        SELECT username, email, password, first_name, last_name, is_active, date_joined,
               full_name, mobile, business, experience_level, is_online, created_at, updated_at
        FROM user_details
    """)
    
    vendor_data = cursor.fetchall()
    print(f"Found {len(vendor_data)} vendors to migrate")
    
    migrated_count = 0
    
    for row in vendor_data:
        username, email, password, first_name, last_name, is_active, date_joined, \
        full_name, mobile, business, experience_level, is_online, created_at, updated_at = row
        
        # Check if user already exists in CustomUser
        existing_user = CustomUser.objects.filter(email=email).first()
        
        if existing_user:
            # Update existing user with vendor data
            existing_user.user_type = 'vendor'
            existing_user.full_name = full_name
            existing_user.mobile = mobile
            existing_user.business = business
            existing_user.experience_level = experience_level
            existing_user.is_online = is_online
            existing_user.is_verified = True  # Set vendors as verified
            existing_user.save()
            print(f"Updated existing user: {email}")
            migrated_count += 1
        else:
            # Create new vendor user
            try:
                new_user = CustomUser.objects.create(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=is_active,
                    date_joined=date_joined,
                    user_type='vendor',
                    full_name=full_name,
                    mobile=mobile,
                    business=business,
                    experience_level=experience_level,
                    is_online=is_online,
                    is_verified=True,
                    created_at=created_at,
                    updated_at=updated_at
                )
                print(f"Created new vendor user: {email}")
                migrated_count += 1
            except Exception as e:
                print(f"Error creating user {email}: {e}")
    
    print(f"Migration completed. {migrated_count} vendors migrated.")

if __name__ == "__main__":
    migrate_vendor_data()