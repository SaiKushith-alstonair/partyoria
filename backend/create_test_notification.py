#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from notifications.models import Notification
from authentication.models import CustomUser

def create_test_notification():
    """Create a test notification for the vendor"""
    
    try:
        # Get the vendor user
        vendor_user = CustomUser.objects.get(email='vendor@test.com', user_type='vendor')
        
        # Create a test notification
        notification = Notification.objects.create(
            recipient=vendor_user,
            title='Welcome to PartyOria!',
            message='Your vendor account has been successfully set up. You can now start receiving quote requests and managing your bookings.',
            notification_type='account_verified',
            priority='medium'
        )
        
        print(f"Created test notification: {notification.title}")
        print(f"Recipient: {notification.recipient.email}")
        print(f"Type: {notification.notification_type}")
        
    except CustomUser.DoesNotExist:
        print("Vendor user not found. Please run create_test_vendor.py first.")
    except Exception as e:
        print(f"Error creating notification: {e}")

if __name__ == '__main__':
    create_test_notification()