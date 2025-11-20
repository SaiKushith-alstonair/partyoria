#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from vendors.models import VendorService

# MID-RANGE TIER VENDORS (30K - 60K)
midrange_vendors = [
    # Photography - Mid-Range
    {
        'username': 'photo_mid1', 'email': 'photomid1@test.com', 'password': 'test123456',
        'first_name': 'Aryan', 'last_name': 'Kapoor', 'business': 'Photography',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543401',
        'services': [
            {'name': 'Wedding Photography Basic', 'category': 'Photography', 'price': 35000},
            {'name': 'Engagement Photography', 'category': 'Photography', 'price': 20000}
        ]
    },
    {
        'username': 'photo_mid2', 'email': 'photomid2@test.com', 'password': 'test123456',
        'first_name': 'Ishita', 'last_name': 'Malhotra', 'business': 'Photography',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543402',
        'services': [
            {'name': 'Candid Photography Pro', 'category': 'Photography', 'price': 40000},
            {'name': 'Photo Album Design', 'category': 'Photography', 'price': 18000}
        ]
    },
    {
        'username': 'photo_mid3', 'email': 'photomid3@test.com', 'password': 'test123456',
        'first_name': 'Karthik', 'last_name': 'Menon', 'business': 'Photography',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543403',
        'services': [
            {'name': 'Corporate Event Coverage', 'category': 'Photography', 'price': 45000},
            {'name': 'Professional Portraits', 'category': 'Photography', 'price': 22000}
        ]
    },
    {
        'username': 'photo_mid4', 'email': 'photomid4@test.com', 'password': 'test123456',
        'first_name': 'Tanvi', 'last_name': 'Joshi', 'business': 'Photography',
        'city': 'Pune', 'state': 'Maharashtra', 'phone': '9876543404',
        'services': [
            {'name': 'Destination Wedding Photography', 'category': 'Photography', 'price': 55000},
            {'name': 'Pre-Wedding Shoot Pro', 'category': 'Photography', 'price': 30000}
        ]
    },
    
    # Catering - Mid-Range
    {
        'username': 'cater_mid1', 'email': 'catermid1@test.com', 'password': 'test123456',
        'first_name': 'Harish', 'last_name': 'Chandra', 'business': 'Catering',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543405',
        'services': [
            {'name': 'Premium Veg Buffet', 'category': 'Catering', 'price': 500, 'min': 50, 'max': 500},
            {'name': 'Dessert Station', 'category': 'Catering', 'price': 180, 'min': 50, 'max': 500}
        ]
    },
    {
        'username': 'cater_mid2', 'email': 'catermid2@test.com', 'password': 'test123456',
        'first_name': 'Priyanka', 'last_name': 'Nair', 'business': 'Catering',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543406',
        'services': [
            {'name': 'Mixed Veg+Non-Veg Menu', 'category': 'Catering', 'price': 600, 'min': 50, 'max': 500},
            {'name': 'Welcome Drinks', 'category': 'Catering', 'price': 120, 'min': 50, 'max': 500}
        ]
    },
    {
        'username': 'cater_mid3', 'email': 'catermid3@test.com', 'password': 'test123456',
        'first_name': 'Sanjay', 'last_name': 'Pillai', 'business': 'Catering',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543407',
        'services': [
            {'name': 'Live Stalls + Buffet', 'category': 'Catering', 'price': 550, 'min': 50, 'max': 500},
            {'name': 'Beverage Package', 'category': 'Catering', 'price': 150, 'min': 50, 'max': 500}
        ]
    },
    {
        'username': 'cater_mid4', 'email': 'catermid4@test.com', 'password': 'test123456',
        'first_name': 'Kavya', 'last_name': 'Reddy', 'business': 'Catering',
        'city': 'Chennai', 'state': 'Tamil Nadu', 'phone': '9876543408',
        'services': [
            {'name': 'Multi-Cuisine Buffet', 'category': 'Catering', 'price': 650, 'min': 50, 'max': 500},
            {'name': 'Chaat Counter', 'category': 'Catering', 'price': 200, 'min': 50, 'max': 500}
        ]
    },
    {
        'username': 'cater_mid5', 'email': 'catermid5@test.com', 'password': 'test123456',
        'first_name': 'Aditya', 'last_name': 'Saxena', 'business': 'Catering',
        'city': 'Pune', 'state': 'Maharashtra', 'phone': '9876543409',
        'services': [
            {'name': 'Wedding Feast Menu', 'category': 'Catering', 'price': 580, 'min': 50, 'max': 500},
            {'name': 'Ice Cream Counter', 'category': 'Catering', 'price': 160, 'min': 50, 'max': 500}
        ]
    },
    
    # DJ - Mid-Range
    {
        'username': 'dj_mid1', 'email': 'djmid1@test.com', 'password': 'test123456',
        'first_name': 'DJ', 'last_name': 'Sameer', 'business': 'DJ',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543410',
        'services': [
            {'name': 'Wedding DJ Package', 'category': 'DJ', 'price': 35000},
            {'name': 'LED Lighting Setup', 'category': 'DJ', 'price': 18000}
        ]
    },
    {
        'username': 'dj_mid2', 'email': 'djmid2@test.com', 'password': 'test123456',
        'first_name': 'DJ', 'last_name': 'Nikhil', 'business': 'DJ',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543411',
        'services': [
            {'name': 'Corporate Event DJ', 'category': 'DJ', 'price': 30000},
            {'name': 'Professional Sound System', 'category': 'DJ', 'price': 20000}
        ]
    },
    {
        'username': 'dj_mid3', 'email': 'djmid3@test.com', 'password': 'test123456',
        'first_name': 'DJ', 'last_name': 'Aman', 'business': 'DJ',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543412',
        'services': [
            {'name': 'DJ + Lighting Combo', 'category': 'DJ', 'price': 40000},
            {'name': 'Fog Machine & Effects', 'category': 'DJ', 'price': 12000}
        ]
    },
    
    # Decoration - Mid-Range
    {
        'username': 'decor_mid1', 'email': 'decormid1@test.com', 'password': 'test123456',
        'first_name': 'Riya', 'last_name': 'Chopra', 'business': 'Decoration',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543413',
        'services': [
            {'name': 'Theme Decoration Pro', 'category': 'Decoration', 'price': 35000},
            {'name': 'Stage Backdrop', 'category': 'Decoration', 'price': 22000}
        ]
    },
    {
        'username': 'decor_mid2', 'email': 'decormid2@test.com', 'password': 'test123456',
        'first_name': 'Siddharth', 'last_name': 'Bhatia', 'business': 'Decoration',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543414',
        'services': [
            {'name': 'Wedding Stage Setup', 'category': 'Decoration', 'price': 40000},
            {'name': 'Floral Arrangements', 'category': 'Decoration', 'price': 25000}
        ]
    },
    {
        'username': 'decor_mid3', 'email': 'decormid3@test.com', 'password': 'test123456',
        'first_name': 'Meera', 'last_name': 'Iyer', 'business': 'Decoration',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543415',
        'services': [
            {'name': 'Lighting + Decor Package', 'category': 'Decoration', 'price': 45000},
            {'name': 'Entrance Gate Design', 'category': 'Decoration', 'price': 20000}
        ]
    },
    {
        'username': 'decor_mid4', 'email': 'decormid4@test.com', 'password': 'test123456',
        'first_name': 'Rohan', 'last_name': 'Khanna', 'business': 'Decoration',
        'city': 'Pune', 'state': 'Maharashtra', 'phone': '9876543416',
        'services': [
            {'name': 'Complete Venue Decoration', 'category': 'Decoration', 'price': 50000},
            {'name': 'Photo Booth Setup', 'category': 'Decoration', 'price': 15000}
        ]
    },
    
    # Makeup Artist - Mid-Range
    {
        'username': 'makeup_mid1', 'email': 'makeupmid1@test.com', 'password': 'test123456',
        'first_name': 'Shruti', 'last_name': 'Kapoor', 'business': 'Makeup Artist',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543417',
        'services': [
            {'name': 'HD Bridal Makeup', 'category': 'Makeup Artist', 'price': 18000},
            {'name': 'Hair Styling Pro', 'category': 'Makeup Artist', 'price': 8000}
        ]
    },
    {
        'username': 'makeup_mid2', 'email': 'makeupmid2@test.com', 'password': 'test123456',
        'first_name': 'Aditi', 'last_name': 'Sharma', 'business': 'Makeup Artist',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543418',
        'services': [
            {'name': 'Airbrush Makeup', 'category': 'Makeup Artist', 'price': 20000},
            {'name': 'Bridal Hair Package', 'category': 'Makeup Artist', 'price': 10000}
        ]
    },
    {
        'username': 'makeup_mid3', 'email': 'makeupmid3@test.com', 'password': 'test123456',
        'first_name': 'Tanya', 'last_name': 'Verma', 'business': 'Makeup Artist',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543419',
        'services': [
            {'name': 'Bridal + Family Package', 'category': 'Makeup Artist', 'price': 22000},
            {'name': 'Pre-Wedding Makeup', 'category': 'Makeup Artist', 'price': 12000}
        ]
    },
    
    # Event Manager - Mid-Range
    {
        'username': 'event_mid1', 'email': 'eventmid1@test.com', 'password': 'test123456',
        'first_name': 'Varun', 'last_name': 'Malhotra', 'business': 'Event Manager',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543420',
        'services': [
            {'name': 'Wedding Coordination', 'category': 'Event Manager', 'price': 50000},
            {'name': 'Vendor Management', 'category': 'Event Manager', 'price': 30000}
        ]
    },
    {
        'username': 'event_mid2', 'email': 'eventmid2@test.com', 'password': 'test123456',
        'first_name': 'Naina', 'last_name': 'Kapoor', 'business': 'Event Manager',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543421',
        'services': [
            {'name': 'Corporate Event Management', 'category': 'Event Manager', 'price': 60000},
            {'name': 'Full-Day Planning', 'category': 'Event Manager', 'price': 40000}
        ]
    },
    {
        'username': 'event_mid3', 'email': 'eventmid3@test.com', 'password': 'test123456',
        'first_name': 'Kabir', 'last_name': 'Singh', 'business': 'Event Manager',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543422',
        'services': [
            {'name': 'Complete Event Planning', 'category': 'Event Manager', 'price': 55000},
            {'name': 'Timeline Management', 'category': 'Event Manager', 'price': 35000}
        ]
    },
    
    # Videography - Mid-Range
    {
        'username': 'video_mid1', 'email': 'videomid1@test.com', 'password': 'test123456',
        'first_name': 'Rahul', 'last_name': 'Desai', 'business': 'Videography',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543423',
        'services': [
            {'name': 'Cinematic Wedding Video', 'category': 'Videography', 'price': 45000},
            {'name': 'Same Day Edit', 'category': 'Videography', 'price': 25000}
        ]
    },
    {
        'username': 'video_mid2', 'email': 'videomid2@test.com', 'password': 'test123456',
        'first_name': 'Ananya', 'last_name': 'Reddy', 'business': 'Videography',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543424',
        'services': [
            {'name': 'Traditional + Candid Video', 'category': 'Videography', 'price': 40000},
            {'name': 'Highlight Film', 'category': 'Videography', 'price': 22000}
        ]
    },
    {
        'username': 'video_mid3', 'email': 'videomid3@test.com', 'password': 'test123456',
        'first_name': 'Vivek', 'last_name': 'Nair', 'business': 'Videography',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543425',
        'services': [
            {'name': 'Corporate Video Production', 'category': 'Videography', 'price': 50000},
            {'name': 'Event Coverage Pro', 'category': 'Videography', 'price': 30000}
        ]
    },
    
    # Florist - Mid-Range
    {
        'username': 'florist_mid1', 'email': 'floristmid1@test.com', 'password': 'test123456',
        'first_name': 'Pallavi', 'last_name': 'Joshi', 'business': 'Florist',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543426',
        'services': [
            {'name': 'Wedding Flowers Package', 'category': 'Florist', 'price': 25000},
            {'name': 'Bridal Bouquet Premium', 'category': 'Florist', 'price': 8000}
        ]
    },
    {
        'username': 'florist_mid2', 'email': 'floristmid2@test.com', 'password': 'test123456',
        'first_name': 'Shalini', 'last_name': 'Gupta', 'business': 'Florist',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543427',
        'services': [
            {'name': 'Stage Floral Decoration', 'category': 'Florist', 'price': 30000},
            {'name': 'Table Arrangements', 'category': 'Florist', 'price': 12000}
        ]
    },
]

print("Creating MID-RANGE TIER vendors (30K-60K)...\n")

created = 0
skipped = 0

for data in midrange_vendors:
    try:
        if CustomUser.objects.filter(email=data['email']).exists():
            print(f"Skip: {data['email']}")
            skipped += 1
            continue
        
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
        
        print(f"[OK] {data['business']}: {data['first_name']} {data['last_name']}")
        created += 1
    
    except Exception as e:
        print(f"[ERROR] {data['email']}: {str(e)}")

print(f"\n=== MID-RANGE TIER SUMMARY ===")
print(f"Created: {created} vendors")
print(f"Skipped: {skipped} vendors")
print(f"Total vendors in DB: {CustomUser.objects.filter(user_type='vendor').count()}")
print(f"Total services in DB: {VendorService.objects.count()}")
