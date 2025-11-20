#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from vendors.models import VendorService

# BUDGET TIER VENDORS (10K - 30K)
budget_vendors = [
    # Photography - Budget Tier
    {
        'username': 'photo_budget1', 'email': 'photobudget1@test.com', 'password': 'test123456',
        'first_name': 'Ravi', 'last_name': 'Kumar', 'business': 'Photography',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543301',
        'services': [
            {'name': 'Basic Photography Package', 'category': 'Photography', 'price': 12000},
            {'name': 'Event Coverage (4 hours)', 'category': 'Photography', 'price': 15000}
        ]
    },
    {
        'username': 'photo_budget2', 'email': 'photobudget2@test.com', 'password': 'test123456',
        'first_name': 'Sneha', 'last_name': 'Patel', 'business': 'Photography',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543302',
        'services': [
            {'name': 'Portrait Session', 'category': 'Photography', 'price': 8000},
            {'name': 'Birthday Party Coverage', 'category': 'Photography', 'price': 18000}
        ]
    },
    {
        'username': 'photo_budget3', 'email': 'photobudget3@test.com', 'password': 'test123456',
        'first_name': 'Amit', 'last_name': 'Sharma', 'business': 'Photography',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543303',
        'services': [
            {'name': 'Product Photography', 'category': 'Photography', 'price': 10000},
            {'name': 'Small Event Package', 'category': 'Photography', 'price': 20000}
        ]
    },
    {
        'username': 'photo_budget4', 'email': 'photobudget4@test.com', 'password': 'test123456',
        'first_name': 'Pooja', 'last_name': 'Reddy', 'business': 'Photography',
        'city': 'Pune', 'state': 'Maharashtra', 'phone': '9876543304',
        'services': [
            {'name': 'Family Portrait', 'category': 'Photography', 'price': 9000},
            {'name': 'Engagement Shoot', 'category': 'Photography', 'price': 22000}
        ]
    },
    {
        'username': 'photo_budget5', 'email': 'photobudget5@test.com', 'password': 'test123456',
        'first_name': 'Vikram', 'last_name': 'Singh', 'business': 'Photography',
        'city': 'Chennai', 'state': 'Tamil Nadu', 'phone': '9876543305',
        'services': [
            {'name': 'Corporate Headshots', 'category': 'Photography', 'price': 12000},
            {'name': 'Event Documentation', 'category': 'Photography', 'price': 16000}
        ]
    },
    
    # Catering - Budget Tier
    {
        'username': 'cater_budget1', 'email': 'caterbudget1@test.com', 'password': 'test123456',
        'first_name': 'Ramesh', 'last_name': 'Gupta', 'business': 'Catering',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543306',
        'services': [
            {'name': 'Basic Vegetarian Menu', 'category': 'Catering', 'price': 250, 'min': 50, 'max': 500},
            {'name': 'Snacks & Beverages', 'category': 'Catering', 'price': 150, 'min': 50, 'max': 500}
        ]
    },
    {
        'username': 'cater_budget2', 'email': 'caterbudget2@test.com', 'password': 'test123456',
        'first_name': 'Lakshmi', 'last_name': 'Iyer', 'business': 'Catering',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543307',
        'services': [
            {'name': 'Home-Style Catering', 'category': 'Catering', 'price': 280, 'min': 50, 'max': 500},
            {'name': 'South Indian Menu', 'category': 'Catering', 'price': 300, 'min': 50, 'max': 500}
        ]
    },
    {
        'username': 'cater_budget3', 'email': 'caterbudget3@test.com', 'password': 'test123456',
        'first_name': 'Suresh', 'last_name': 'Yadav', 'business': 'Catering',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543308',
        'services': [
            {'name': 'Simple Non-Veg Menu', 'category': 'Catering', 'price': 350, 'min': 50, 'max': 500},
            {'name': 'Breakfast Catering', 'category': 'Catering', 'price': 200, 'min': 50, 'max': 500}
        ]
    },
    {
        'username': 'cater_budget4', 'email': 'caterbudget4@test.com', 'password': 'test123456',
        'first_name': 'Meena', 'last_name': 'Devi', 'business': 'Catering',
        'city': 'Pune', 'state': 'Maharashtra', 'phone': '9876543309',
        'services': [
            {'name': 'North Indian Thali', 'category': 'Catering', 'price': 320, 'min': 50, 'max': 500},
            {'name': 'Tea & Snacks', 'category': 'Catering', 'price': 180, 'min': 50, 'max': 500}
        ]
    },
    {
        'username': 'cater_budget5', 'email': 'caterbudget5@test.com', 'password': 'test123456',
        'first_name': 'Rajesh', 'last_name': 'Verma', 'business': 'Catering',
        'city': 'Chennai', 'state': 'Tamil Nadu', 'phone': '9876543310',
        'services': [
            {'name': 'Budget Buffet', 'category': 'Catering', 'price': 380, 'min': 50, 'max': 500},
            {'name': 'Lunch Box Catering', 'category': 'Catering', 'price': 220, 'min': 50, 'max': 500}
        ]
    },
    {
        'username': 'cater_budget6', 'email': 'caterbudget6@test.com', 'password': 'test123456',
        'first_name': 'Anita', 'last_name': 'Joshi', 'business': 'Catering',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543311',
        'services': [
            {'name': 'Party Snacks Menu', 'category': 'Catering', 'price': 240, 'min': 50, 'max': 500},
            {'name': 'Simple Veg Buffet', 'category': 'Catering', 'price': 290, 'min': 50, 'max': 500}
        ]
    },
    
    # DJ - Budget Tier
    {
        'username': 'dj_budget1', 'email': 'djbudget1@test.com', 'password': 'test123456',
        'first_name': 'DJ', 'last_name': 'Rahul', 'business': 'DJ',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543312',
        'services': [
            {'name': 'Basic DJ Setup (4 hours)', 'category': 'DJ', 'price': 10000},
            {'name': 'Sound System Rental', 'category': 'DJ', 'price': 8000}
        ]
    },
    {
        'username': 'dj_budget2', 'email': 'djbudget2@test.com', 'password': 'test123456',
        'first_name': 'DJ', 'last_name': 'Karan', 'business': 'DJ',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543313',
        'services': [
            {'name': 'Birthday Party DJ', 'category': 'DJ', 'price': 12000},
            {'name': 'Small Event Music', 'category': 'DJ', 'price': 9000}
        ]
    },
    {
        'username': 'dj_budget3', 'email': 'djbudget3@test.com', 'password': 'test123456',
        'first_name': 'DJ', 'last_name': 'Vishal', 'business': 'DJ',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543314',
        'services': [
            {'name': 'House Party DJ', 'category': 'DJ', 'price': 15000},
            {'name': 'Basic Lighting Setup', 'category': 'DJ', 'price': 7000}
        ]
    },
    {
        'username': 'dj_budget4', 'email': 'djbudget4@test.com', 'password': 'test123456',
        'first_name': 'DJ', 'last_name': 'Anil', 'business': 'DJ',
        'city': 'Pune', 'state': 'Maharashtra', 'phone': '9876543315',
        'services': [
            {'name': 'College Event DJ', 'category': 'DJ', 'price': 18000},
            {'name': 'Karaoke System', 'category': 'DJ', 'price': 6000}
        ]
    },
    
    # Decoration - Budget Tier
    {
        'username': 'decor_budget1', 'email': 'decorbudget1@test.com', 'password': 'test123456',
        'first_name': 'Nisha', 'last_name': 'Kapoor', 'business': 'Decoration',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543316',
        'services': [
            {'name': 'Balloon Decoration', 'category': 'Decoration', 'price': 10000},
            {'name': 'Birthday Decoration', 'category': 'Decoration', 'price': 12000}
        ]
    },
    {
        'username': 'decor_budget2', 'email': 'decorbudget2@test.com', 'password': 'test123456',
        'first_name': 'Priya', 'last_name': 'Malhotra', 'business': 'Decoration',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543317',
        'services': [
            {'name': 'Simple Stage Setup', 'category': 'Decoration', 'price': 15000},
            {'name': 'Paper Decoration', 'category': 'Decoration', 'price': 8000}
        ]
    },
    {
        'username': 'decor_budget3', 'email': 'decorbudget3@test.com', 'password': 'test123456',
        'first_name': 'Kavita', 'last_name': 'Rao', 'business': 'Decoration',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543318',
        'services': [
            {'name': 'Basic Floral Arrangement', 'category': 'Decoration', 'price': 18000},
            {'name': 'Backdrop Setup', 'category': 'Decoration', 'price': 14000}
        ]
    },
    {
        'username': 'decor_budget4', 'email': 'decorbudget4@test.com', 'password': 'test123456',
        'first_name': 'Anjali', 'last_name': 'Desai', 'business': 'Decoration',
        'city': 'Pune', 'state': 'Maharashtra', 'phone': '9876543319',
        'services': [
            {'name': 'Party Hall Decoration', 'category': 'Decoration', 'price': 20000},
            {'name': 'Entrance Decoration', 'category': 'Decoration', 'price': 11000}
        ]
    },
    {
        'username': 'decor_budget5', 'email': 'decorbudget5@test.com', 'password': 'test123456',
        'first_name': 'Rekha', 'last_name': 'Nair', 'business': 'Decoration',
        'city': 'Chennai', 'state': 'Tamil Nadu', 'phone': '9876543320',
        'services': [
            {'name': 'Simple Theme Decoration', 'category': 'Decoration', 'price': 22000},
            {'name': 'Table Decoration', 'category': 'Decoration', 'price': 9000}
        ]
    },
    
    # Makeup Artist - Budget Tier
    {
        'username': 'makeup_budget1', 'email': 'makeupbudget1@test.com', 'password': 'test123456',
        'first_name': 'Sonia', 'last_name': 'Mehta', 'business': 'Makeup Artist',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543321',
        'services': [
            {'name': 'Party Makeup', 'category': 'Makeup Artist', 'price': 6000},
            {'name': 'Engagement Makeup', 'category': 'Makeup Artist', 'price': 8000}
        ]
    },
    {
        'username': 'makeup_budget2', 'email': 'makeupbudget2@test.com', 'password': 'test123456',
        'first_name': 'Ritu', 'last_name': 'Sharma', 'business': 'Makeup Artist',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543322',
        'services': [
            {'name': 'Basic Bridal Makeup', 'category': 'Makeup Artist', 'price': 10000},
            {'name': 'Groom Grooming', 'category': 'Makeup Artist', 'price': 5000}
        ]
    },
    {
        'username': 'makeup_budget3', 'email': 'makeupbudget3@test.com', 'password': 'test123456',
        'first_name': 'Neha', 'last_name': 'Gupta', 'business': 'Makeup Artist',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543323',
        'services': [
            {'name': 'Simple Hair Styling', 'category': 'Makeup Artist', 'price': 4000},
            {'name': 'Reception Makeup', 'category': 'Makeup Artist', 'price': 9000}
        ]
    },
    {
        'username': 'makeup_budget4', 'email': 'makeupbudget4@test.com', 'password': 'test123456',
        'first_name': 'Divya', 'last_name': 'Patel', 'business': 'Makeup Artist',
        'city': 'Pune', 'state': 'Maharashtra', 'phone': '9876543324',
        'services': [
            {'name': 'Mehendi Makeup', 'category': 'Makeup Artist', 'price': 7000},
            {'name': 'Family Makeup Package', 'category': 'Makeup Artist', 'price': 12000}
        ]
    },
    
    # Event Manager - Budget Tier
    {
        'username': 'event_budget1', 'email': 'eventbudget1@test.com', 'password': 'test123456',
        'first_name': 'Rohit', 'last_name': 'Khanna', 'business': 'Event Manager',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543325',
        'services': [
            {'name': 'Birthday Party Planning', 'category': 'Event Manager', 'price': 20000},
            {'name': 'Consultation Service', 'category': 'Event Manager', 'price': 15000}
        ]
    },
    {
        'username': 'event_budget2', 'email': 'eventbudget2@test.com', 'password': 'test123456',
        'first_name': 'Simran', 'last_name': 'Kaur', 'business': 'Event Manager',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543326',
        'services': [
            {'name': 'Small Event Coordination', 'category': 'Event Manager', 'price': 25000},
            {'name': 'Vendor Booking Service', 'category': 'Event Manager', 'price': 18000}
        ]
    },
    {
        'username': 'event_budget3', 'email': 'eventbudget3@test.com', 'password': 'test123456',
        'first_name': 'Arjun', 'last_name': 'Reddy', 'business': 'Event Manager',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543327',
        'services': [
            {'name': 'House Party Planning', 'category': 'Event Manager', 'price': 22000},
            {'name': 'Day Coordination', 'category': 'Event Manager', 'price': 28000}
        ]
    },
    
    # Videography - Budget Tier
    {
        'username': 'video_budget1', 'email': 'videobudget1@test.com', 'password': 'test123456',
        'first_name': 'Manish', 'last_name': 'Kumar', 'business': 'Videography',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543328',
        'services': [
            {'name': 'Basic Video Coverage', 'category': 'Videography', 'price': 15000},
            {'name': 'Highlight Reel', 'category': 'Videography', 'price': 12000}
        ]
    },
    {
        'username': 'video_budget2', 'email': 'videobudget2@test.com', 'password': 'test123456',
        'first_name': 'Deepak', 'last_name': 'Singh', 'business': 'Videography',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543329',
        'services': [
            {'name': 'Event Documentation', 'category': 'Videography', 'price': 18000},
            {'name': 'Short Video Package', 'category': 'Videography', 'price': 14000}
        ]
    },
    {
        'username': 'video_budget3', 'email': 'videobudget3@test.com', 'password': 'test123456',
        'first_name': 'Arun', 'last_name': 'Nair', 'business': 'Videography',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543330',
        'services': [
            {'name': 'Birthday Video', 'category': 'Videography', 'price': 16000},
            {'name': 'Social Media Reel', 'category': 'Videography', 'price': 10000}
        ]
    },
    {
        'username': 'video_budget4', 'email': 'videobudget4@test.com', 'password': 'test123456',
        'first_name': 'Sunil', 'last_name': 'Yadav', 'business': 'Videography',
        'city': 'Pune', 'state': 'Maharashtra', 'phone': '9876543331',
        'services': [
            {'name': 'Simple Wedding Video', 'category': 'Videography', 'price': 25000},
            {'name': 'Event Highlights', 'category': 'Videography', 'price': 20000}
        ]
    },
    
    # Florist - Budget Tier
    {
        'username': 'florist_budget1', 'email': 'floristbudget1@test.com', 'password': 'test123456',
        'first_name': 'Sunita', 'last_name': 'Devi', 'business': 'Florist',
        'city': 'Delhi', 'state': 'Delhi', 'phone': '9876543332',
        'services': [
            {'name': 'Simple Bouquets', 'category': 'Florist', 'price': 5000},
            {'name': 'Table Centerpieces', 'category': 'Florist', 'price': 8000}
        ]
    },
    {
        'username': 'florist_budget2', 'email': 'floristbudget2@test.com', 'password': 'test123456',
        'first_name': 'Geeta', 'last_name': 'Sharma', 'business': 'Florist',
        'city': 'Mumbai', 'state': 'Maharashtra', 'phone': '9876543333',
        'services': [
            {'name': 'Basic Floral Decor', 'category': 'Florist', 'price': 12000},
            {'name': 'Garlands & Bouquets', 'category': 'Florist', 'price': 7000}
        ]
    },
    {
        'username': 'florist_budget3', 'email': 'floristbudget3@test.com', 'password': 'test123456',
        'first_name': 'Radha', 'last_name': 'Krishna', 'business': 'Florist',
        'city': 'Bangalore', 'state': 'Karnataka', 'phone': '9876543334',
        'services': [
            {'name': 'Fresh Flower Arrangement', 'category': 'Florist', 'price': 10000},
            {'name': 'Car Decoration', 'category': 'Florist', 'price': 6000}
        ]
    },
]

print("Creating BUDGET TIER vendors (10K-30K)...\n")

created = 0
skipped = 0

for data in budget_vendors:
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

print(f"\n=== BUDGET TIER SUMMARY ===")
print(f"Created: {created} vendors")
print(f"Skipped: {skipped} vendors")
print(f"Total vendors in DB: {CustomUser.objects.filter(user_type='vendor').count()}")
print(f"Total services in DB: {VendorService.objects.count()}")
