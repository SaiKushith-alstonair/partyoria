import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from vendors.models import VendorProfile, VendorService
from decimal import Decimal

# Test vendors data
test_vendors = [
    {
        'email': 'photographer1@test.com',
        'username': 'photographer1',
        'password': 'Test@1234',
        'first_name': 'Rajesh',
        'last_name': 'Kumar',
        'business': 'Photography',
        'city': 'Mumbai',
        'state': 'Maharashtra',
        'phone': '9876543210',
        'services': [
            {'name': 'Wedding Photography', 'price': 45000, 'desc': 'Complete wedding coverage with 500+ edited photos'},
            {'name': 'Pre-Wedding Shoot', 'price': 25000, 'desc': 'Outdoor pre-wedding photoshoot'},
        ]
    },
    {
        'email': 'caterer1@test.com',
        'username': 'caterer1',
        'password': 'Test@1234',
        'first_name': 'Priya',
        'last_name': 'Sharma',
        'business': 'Catering',
        'city': 'Delhi',
        'state': 'Delhi',
        'phone': '9876543211',
        'services': [
            {'name': 'Vegetarian Buffet', 'price': 500, 'desc': 'Pure veg buffet with 8 dishes', 'min': 50, 'max': 500},
            {'name': 'Non-Veg Buffet', 'price': 650, 'desc': 'Mixed buffet with veg and non-veg', 'min': 50, 'max': 500},
        ]
    },
    {
        'email': 'dj1@test.com',
        'username': 'dj1',
        'password': 'Test@1234',
        'first_name': 'Amit',
        'last_name': 'Patel',
        'business': 'DJ',
        'city': 'Bangalore',
        'state': 'Karnataka',
        'phone': '9876543212',
        'services': [
            {'name': 'Wedding DJ', 'price': 35000, 'desc': 'Professional DJ with sound system and lighting'},
            {'name': 'Corporate DJ', 'price': 25000, 'desc': 'Corporate event DJ services'},
        ]
    },
    {
        'email': 'decorator1@test.com',
        'username': 'decorator1',
        'password': 'Test@1234',
        'first_name': 'Neha',
        'last_name': 'Singh',
        'business': 'Decoration',
        'city': 'Pune',
        'state': 'Maharashtra',
        'phone': '9876543213',
        'services': [
            {'name': 'Stage Decoration', 'price': 55000, 'desc': 'Complete stage and mandap decoration'},
            {'name': 'Floral Decoration', 'price': 35000, 'desc': 'Fresh flower decorations'},
        ]
    },
    {
        'email': 'makeup1@test.com',
        'username': 'makeup1',
        'password': 'Test@1234',
        'first_name': 'Kavita',
        'last_name': 'Reddy',
        'business': 'Makeup Artist',
        'city': 'Chennai',
        'state': 'Tamil Nadu',
        'phone': '9876543214',
        'services': [
            {'name': 'Bridal Makeup', 'price': 15000, 'desc': 'HD bridal makeup with hair styling'},
            {'name': 'Party Makeup', 'price': 8000, 'desc': 'Party makeup for guests'},
        ]
    },
]

print("Creating test vendors for marketplace...")

for vendor_data in test_vendors:
    # Check if vendor exists
    if CustomUser.objects.filter(email=vendor_data['email']).exists():
        print(f"[OK] Vendor {vendor_data['email']} already exists")
        vendor = CustomUser.objects.get(email=vendor_data['email'])
    else:
        # Create vendor user
        vendor = CustomUser.objects.create_user(
            username=vendor_data['username'],
            email=vendor_data['email'],
            password=vendor_data['password'],
            first_name=vendor_data['first_name'],
            last_name=vendor_data['last_name'],
            user_type='vendor',
            business=vendor_data['business'],
            city=vendor_data['city'],
            state=vendor_data['state'],
            phone=vendor_data['phone'],
            location=f"{vendor_data['city']}, {vendor_data['state']}",
            is_verified=True  # Auto-verify for testing
        )
        print(f"[OK] Created vendor: {vendor.first_name} {vendor.last_name} ({vendor.business})")
    
    # Create or update vendor profile
    profile, created = VendorProfile.objects.get_or_create(
        user=vendor,
        defaults={
            'profile_data': {
                'business': vendor_data['business'],
                'city': vendor_data['city'],
                'state': vendor_data['state'],
                'mobile': vendor_data['phone'],
                'services': [s['name'] for s in vendor_data['services']]
            },
            'is_completed': True
        }
    )
    
    if not created:
        profile.profile_data = {
            'business': vendor_data['business'],
            'city': vendor_data['city'],
            'state': vendor_data['state'],
            'mobile': vendor_data['phone'],
            'services': [s['name'] for s in vendor_data['services']]
        }
        profile.is_completed = True
        profile.save()
    
    # Create services
    for service_data in vendor_data['services']:
        service, created = VendorService.objects.get_or_create(
            user=vendor,
            service_name=service_data['name'],
            defaults={
                'category': vendor_data['business'],
                'service_price': Decimal(str(service_data['price'])),
                'description': service_data['desc'],
                'minimum_people': service_data.get('min'),
                'maximum_people': service_data.get('max'),
                'is_active': True
            }
        )
        
        if not created:
            service.service_price = Decimal(str(service_data['price']))
            service.description = service_data['desc']
            service.minimum_people = service_data.get('min')
            service.maximum_people = service_data.get('max')
            service.is_active = True
            service.save()
        
        print(f"  [OK] Service: {service.service_name} - Rs.{service.service_price}")

print("\n[SUCCESS] Test vendors created successfully!")
print(f"Total vendors: {CustomUser.objects.filter(user_type='vendor').count()}")
print(f"Total services: {VendorService.objects.count()}")
