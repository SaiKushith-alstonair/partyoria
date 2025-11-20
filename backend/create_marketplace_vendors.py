#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from vendors.models import VendorService

# Standardized categories matching budget system
vendors_data = [
    {
        'username': 'photographer2', 'email': 'photographer2@test.com', 'password': 'test123456',
        'first_name': 'Rahul', 'last_name': 'Sharma', 'business': 'Photography',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543210',
        'services': [
            {'name': 'Candid Photography', 'category': 'Photography', 'price': 35000},
            {'name': 'Traditional Photography', 'category': 'Photography', 'price': 28000}
        ]
    },
    {
        'username': 'photographer3', 'email': 'photographer3@test.com', 'password': 'test123456',
        'first_name': 'Priya', 'last_name': 'Mehta', 'business': 'Photography',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543211',
        'services': [
            {'name': 'Drone Photography', 'category': 'Photography', 'price': 50000},
            {'name': 'Album Design', 'category': 'Photography', 'price': 15000}
        ]
    },
    {
        'username': 'caterer2', 'email': 'caterer2@test.com', 'password': 'test123456',
        'first_name': 'Amit', 'last_name': 'Kumar', 'business': 'Catering',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543212',
        'services': [
            {'name': 'Vegetarian Menu', 'category': 'Catering', 'price': 450, 'min': 50, 'max': 500},
            {'name': 'Live Stalls', 'category': 'Catering', 'price': 200, 'min': 50, 'max': 500}
        ]
    },
    {
        'username': 'caterer3', 'email': 'caterer3@test.com', 'password': 'test123456',
        'first_name': 'Sunita', 'last_name': 'Reddy', 'business': 'Catering',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543213',
        'services': [
            {'name': 'Non-Vegetarian Menu', 'category': 'Catering', 'price': 600, 'min': 50, 'max': 500},
            {'name': 'Desserts & Sweets', 'category': 'Catering', 'price': 150, 'min': 50, 'max': 500}
        ]
    },
    {
        'username': 'decorator2', 'email': 'decorator2@test.com', 'password': 'test123456',
        'first_name': 'Neha', 'last_name': 'Singh', 'business': 'Decoration',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543214',
        'services': [
            {'name': 'Theme Decoration', 'category': 'Decoration', 'price': 45000},
            {'name': 'Lighting Setup', 'category': 'Decoration', 'price': 25000}
        ]
    },
    {
        'username': 'decorator3', 'email': 'decorator3@test.com', 'password': 'test123456',
        'first_name': 'Vikram', 'last_name': 'Patel', 'business': 'Decoration',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543215',
        'services': [
            {'name': 'Balloon Decoration', 'category': 'Decoration', 'price': 20000},
            {'name': 'Entrance Gate', 'category': 'Decoration', 'price': 15000}
        ]
    },
    {
        'username': 'dj2', 'email': 'dj2@test.com', 'password': 'test123456',
        'first_name': 'DJ', 'last_name': 'Rohan', 'business': 'DJ',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543216',
        'services': [
            {'name': 'Club DJ', 'category': 'DJ', 'price': 30000},
            {'name': 'Sound System', 'category': 'DJ', 'price': 15000}
        ]
    },
    {
        'username': 'dj3', 'email': 'dj3@test.com', 'password': 'test123456',
        'first_name': 'DJ', 'last_name': 'Arjun', 'business': 'DJ',
        'city': 'Pune', 'state': 'Maharashtra', 'phone': '9876543217',
        'services': [
            {'name': 'Live Band', 'category': 'DJ', 'price': 50000},
            {'name': 'Karaoke Setup', 'category': 'DJ', 'price': 12000}
        ]
    },
    {
        'username': 'makeup2', 'email': 'makeup2@test.com', 'password': 'test123456',
        'first_name': 'Anjali', 'last_name': 'Verma', 'business': 'Makeup Artist',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543218',
        'services': [
            {'name': 'HD Makeup', 'category': 'Makeup Artist', 'price': 18000},
            {'name': 'Airbrush Makeup', 'category': 'Makeup Artist', 'price': 22000}
        ]
    },
    {
        'username': 'makeup3', 'email': 'makeup3@test.com', 'password': 'test123456',
        'first_name': 'Kavita', 'last_name': 'Nair', 'business': 'Makeup Artist',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543219',
        'services': [
            {'name': 'Groom Makeup', 'category': 'Makeup Artist', 'price': 8000},
            {'name': 'Hair Styling', 'category': 'Makeup Artist', 'price': 5000}
        ]
    },
    {
        'username': 'eventmgr1', 'email': 'eventmgr1@test.com', 'password': 'test123456',
        'first_name': 'Rajesh', 'last_name': 'Gupta', 'business': 'Event Manager',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543220',
        'services': [
            {'name': 'Wedding Management', 'category': 'Event Manager', 'price': 75000},
            {'name': 'Coordination', 'category': 'Event Manager', 'price': 35000}
        ]
    },
    {
        'username': 'eventmgr2', 'email': 'eventmgr2@test.com', 'password': 'test123456',
        'first_name': 'Meera', 'last_name': 'Joshi', 'business': 'Event Manager',
        'city': 'Pune', 'state': 'Maharashtra', 'phone': '9876543221',
        'services': [
            {'name': 'Corporate Event', 'category': 'Event Manager', 'price': 50000},
            {'name': 'Birthday Party', 'category': 'Event Manager', 'price': 25000}
        ]
    },
    {
        'username': 'videographer1', 'email': 'videographer1@test.com', 'password': 'test123456',
        'first_name': 'Karan', 'last_name': 'Malhotra', 'business': 'Videography',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543222',
        'services': [
            {'name': 'Cinematic Video', 'category': 'Videography', 'price': 55000},
            {'name': 'Drone Video', 'category': 'Videography', 'price': 35000}
        ]
    },
    {
        'username': 'videographer2', 'email': 'videographer2@test.com', 'password': 'test123456',
        'first_name': 'Sanjay', 'last_name': 'Rao', 'business': 'Videography',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543223',
        'services': [
            {'name': 'Traditional Video', 'category': 'Videography', 'price': 40000},
            {'name': 'Highlight Reel', 'category': 'Videography', 'price': 20000}
        ]
    },
    {
        'username': 'florist1', 'email': 'florist1@test.com', 'password': 'test123456',
        'first_name': 'Pooja', 'last_name': 'Desai', 'business': 'Florist',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543224',
        'services': [
            {'name': 'Wedding Flowers', 'category': 'Florist', 'price': 30000},
            {'name': 'Bouquets', 'category': 'Florist', 'price': 5000}
        ]
    },
]

print("Creating vendors...\n")

for data in vendors_data:
    try:
        # Check if vendor exists
        if CustomUser.objects.filter(email=data['email']).exists():
            print(f"Skipping {data['email']} - already exists")
            continue
        
        # Create vendor
        vendor = CustomUser.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            user_type='vendor',
            first_name=data['first_name'],
            last_name=data['last_name'],
            business=data['business'],
            city=data['city'],
            state=data['state'],
            phone=data['phone'],
            is_verified=True
        )
        
        # Create services
        for service in data['services']:
            VendorService.objects.create(
                user=vendor,
                service_name=service['name'],
                category=service['category'],
                service_price=service['price'],
                minimum_people=service.get('min'),
                maximum_people=service.get('max'),
                is_active=True
            )
        
        print(f"[OK] Created {data['business']}: {data['first_name']} {data['last_name']} with {len(data['services'])} services")
    
    except Exception as e:
        print(f"[ERROR] Error creating {data['email']}: {str(e)}")

print("\n=== SUMMARY ===")
total_vendors = CustomUser.objects.filter(user_type='vendor').count()
vendors_with_services = CustomUser.objects.filter(user_type='vendor', vendor_services__isnull=False).distinct().count()
total_services = VendorService.objects.count()

print(f"Total vendors: {total_vendors}")
print(f"Vendors with services: {vendors_with_services}")
print(f"Total services: {total_services}")
