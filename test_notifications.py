#!/usr/bin/env python3
"""
Test script to verify notification system is working
"""
import requests
import json

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_USER_TOKEN = None  # Will be set after login

def test_customer_login():
    """Test customer login and get token"""
    global TEST_USER_TOKEN
    
    login_data = {
        "username": "testuser123",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
        if response.status_code == 200:
            data = response.json()
            TEST_USER_TOKEN = data.get('access_token') or data.get('access')
            print(f"Customer login successful. Token: {TEST_USER_TOKEN[:20]}...")
            return True
        else:
            print(f"Customer login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Customer login error: {e}")
        return False

def test_get_notifications():
    """Test getting notifications"""
    if not TEST_USER_TOKEN:
        print("No token available for notifications test")
        return False
    
    headers = {
        "Authorization": f"Bearer {TEST_USER_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        # Test unread count
        response = requests.get(f"{BASE_URL}/api/notifications/unread_count/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"Unread count: {data.get('unread_count', 0)}")
        else:
            print(f"Unread count failed: {response.status_code}")
        
        # Test recent notifications
        response = requests.get(f"{BASE_URL}/api/notifications/recent/", headers=headers)
        if response.status_code == 200:
            notifications = response.json()
            print(f"Recent notifications: {len(notifications)} found")
            
            # Show first few notifications
            for i, notif in enumerate(notifications[:3]):
                print(f"   {i+1}. {notif.get('title')} - {notif.get('notification_type')} - {'READ' if notif.get('is_read') else 'UNREAD'}")
            
            return True
        else:
            print(f"Recent notifications failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Notifications test error: {e}")
        return False

def test_mark_as_read():
    """Test marking notifications as read"""
    if not TEST_USER_TOKEN:
        print("No token available for mark as read test")
        return False
    
    headers = {
        "Authorization": f"Bearer {TEST_USER_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        # Get some notifications first
        response = requests.get(f"{BASE_URL}/api/notifications/recent/", headers=headers)
        if response.status_code == 200:
            notifications = response.json()
            unread_notifications = [n for n in notifications if not n.get('is_read')]
            
            if unread_notifications:
                # Mark first unread notification as read
                notification_id = unread_notifications[0]['id']
                mark_data = {
                    "notification_ids": [notification_id]
                }
                
                response = requests.post(f"{BASE_URL}/api/notifications/mark_as_read/", 
                                       json=mark_data, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    print(f"Marked {data.get('marked_count', 0)} notification(s) as read")
                    return True
                else:
                    print(f"Mark as read failed: {response.status_code}")
            else:
                print("No unread notifications to mark as read")
                return True
        
        return False
            
    except Exception as e:
        print(f"Mark as read test error: {e}")
        return False

def test_notification_preferences():
    """Test notification preferences"""
    if not TEST_USER_TOKEN:
        print("No token available for preferences test")
        return False
    
    headers = {
        "Authorization": f"Bearer {TEST_USER_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        # Get preferences
        response = requests.get(f"{BASE_URL}/api/preferences/my_preferences/", headers=headers)
        if response.status_code == 200:
            prefs = response.json()
            print(f"Preferences loaded: In-app enabled: {prefs.get('enable_in_app', False)}")
            return True
        else:
            print(f"Preferences failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Preferences test error: {e}")
        return False

def main():
    """Run all notification tests"""
    print("Testing PartyOria Notification System")
    print("=" * 50)
    
    # Test customer login
    if not test_customer_login():
        print("Cannot proceed without valid login")
        return
    
    # Test notifications
    test_get_notifications()
    test_mark_as_read()
    test_notification_preferences()
    
    print("\n" + "=" * 50)
    print("Notification system tests completed!")

if __name__ == "__main__":
    main()