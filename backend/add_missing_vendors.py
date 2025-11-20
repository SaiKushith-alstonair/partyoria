import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from vendors.models import VendorService, VendorProfile
from decimal import Decimal

# Missing vendor categories data
MISSING_VENDORS = {
    'Entertainment': [
        {'name': 'StarLight Entertainment', 'email': 'contact@starlight.com', 'phone': '9876543210', 'city': 'Mumbai', 'state': 'Maharashtra',
         'services': [
             {'name': 'Live Band Performance', 'category': 'Entertainment', 'price': 50000, 'min': 50, 'max': 500},
             {'name': 'Stand-up Comedy', 'category': 'Entertainment', 'price': 25000, 'min': 50, 'max': 300},
             {'name': 'Magic Show', 'category': 'Entertainment', 'price': 15000, 'min': 20, 'max': 200},
         ]},
        {'name': 'Royal Events Entertainment', 'email': 'info@royalevents.com', 'phone': '9876543211', 'city': 'Delhi', 'state': 'Delhi',
         'services': [
             {'name': 'Dance Troupe', 'category': 'Entertainment', 'price': 40000, 'min': 50, 'max': 500},
             {'name': 'Celebrity Performance', 'category': 'Entertainment', 'price': 150000, 'min': 100, 'max': 1000},
         ]},
        {'name': 'Fun Fiesta Entertainment', 'email': 'hello@funfiesta.com', 'phone': '9876543212', 'city': 'Bangalore', 'state': 'Karnataka',
         'services': [
             {'name': 'Kids Entertainment', 'category': 'Entertainment', 'price': 12000, 'min': 20, 'max': 100},
             {'name': 'Game Stalls', 'category': 'Entertainment', 'price': 8000, 'min': 50, 'max': 200},
         ]},
    ],
    'Lighting': [
        {'name': 'Bright Lights Studio', 'email': 'contact@brightlights.com', 'phone': '9876543220', 'city': 'Mumbai', 'state': 'Maharashtra',
         'services': [
             {'name': 'Stage Lighting', 'category': 'Lighting', 'price': 25000, 'min': 50, 'max': 500},
             {'name': 'Ambient Lighting', 'category': 'Lighting', 'price': 15000, 'min': 50, 'max': 300},
             {'name': 'LED Wall Setup', 'category': 'Lighting', 'price': 40000, 'min': 100, 'max': 1000},
         ]},
        {'name': 'Lumina Lighting Solutions', 'email': 'info@lumina.com', 'phone': '9876543221', 'city': 'Delhi', 'state': 'Delhi',
         'services': [
             {'name': 'DJ Lighting', 'category': 'Lighting', 'price': 20000, 'min': 50, 'max': 500},
             {'name': 'Fairy & Decorative Lights', 'category': 'Lighting', 'price': 10000, 'min': 50, 'max': 300},
         ]},
        {'name': 'Glow Events Lighting', 'email': 'hello@glowevents.com', 'phone': '9876543222', 'city': 'Bangalore', 'state': 'Karnataka',
         'services': [
             {'name': 'Outdoor Flood Lighting', 'category': 'Lighting', 'price': 18000, 'min': 100, 'max': 500},
             {'name': 'Laser Show', 'category': 'Lighting', 'price': 35000, 'min': 100, 'max': 1000},
         ]},
    ],
    'Transportation': [
        {'name': 'Royal Rides Transport', 'email': 'contact@royalrides.com', 'phone': '9876543230', 'city': 'Mumbai', 'state': 'Maharashtra',
         'services': [
             {'name': 'Luxury Car Rental', 'category': 'Transportation', 'price': 15000, 'min': 1, 'max': 10},
             {'name': 'Vintage Car Rental', 'category': 'Transportation', 'price': 25000, 'min': 1, 'max': 5},
             {'name': 'Guest Shuttle Bus', 'category': 'Transportation', 'price': 20000, 'min': 20, 'max': 50},
         ]},
        {'name': 'Elite Transport Services', 'email': 'info@elitetransport.com', 'phone': '9876543231', 'city': 'Delhi', 'state': 'Delhi',
         'services': [
             {'name': 'Bridal Car Rental', 'category': 'Transportation', 'price': 18000, 'min': 1, 'max': 5},
             {'name': 'Valet Parking', 'category': 'Transportation', 'price': 12000, 'min': 50, 'max': 200},
         ]},
        {'name': 'Swift Wheels Transport', 'email': 'hello@swiftwheels.com', 'phone': '9876543232', 'city': 'Bangalore', 'state': 'Karnataka',
         'services': [
             {'name': 'Airport Pickup/Drop', 'category': 'Transportation', 'price': 5000, 'min': 1, 'max': 10},
             {'name': 'Bus/Tempo Traveller', 'category': 'Transportation', 'price': 15000, 'min': 10, 'max': 30},
         ]},
    ],
    'Baker': [
        {'name': 'Sweet Dreams Bakery', 'email': 'contact@sweetdreams.com', 'phone': '9876543240', 'city': 'Mumbai', 'state': 'Maharashtra',
         'services': [
             {'name': 'Wedding Cake', 'category': 'Baker', 'price': 15000, 'min': 50, 'max': 500},
             {'name': 'Cupcakes', 'category': 'Baker', 'price': 5000, 'min': 50, 'max': 200},
             {'name': 'Dessert Table Setup', 'category': 'Baker', 'price': 25000, 'min': 50, 'max': 300},
         ]},
        {'name': 'Cake Studio Delights', 'email': 'info@cakestudio.com', 'phone': '9876543241', 'city': 'Delhi', 'state': 'Delhi',
         'services': [
             {'name': 'Custom Desserts', 'category': 'Baker', 'price': 12000, 'min': 50, 'max': 200},
             {'name': 'Cookies & Pastries', 'category': 'Baker', 'price': 8000, 'min': 50, 'max': 200},
         ]},
    ],
    'Hair Stylist': [
        {'name': 'Glamour Hair Studio', 'email': 'contact@glamourhair.com', 'phone': '9876543250', 'city': 'Mumbai', 'state': 'Maharashtra',
         'services': [
             {'name': 'Bridal Hairstyle', 'category': 'Hair Stylist', 'price': 8000, 'min': 1, 'max': 10},
             {'name': 'Party Hairstyle', 'category': 'Hair Stylist', 'price': 3000, 'min': 1, 'max': 10},
             {'name': 'Hair Extensions', 'category': 'Hair Stylist', 'price': 5000, 'min': 1, 'max': 5},
         ]},
        {'name': 'Tresses Hair Salon', 'email': 'info@tresses.com', 'phone': '9876543251', 'city': 'Delhi', 'state': 'Delhi',
         'services': [
             {'name': 'Fashion Hairstyle', 'category': 'Hair Stylist', 'price': 4000, 'min': 1, 'max': 10},
             {'name': 'Hair Spa & Treatment', 'category': 'Hair Stylist', 'price': 6000, 'min': 1, 'max': 5},
         ]},
    ],
    'Fashion Designer': [
        {'name': 'Couture Creations', 'email': 'contact@couturecreations.com', 'phone': '9876543260', 'city': 'Mumbai', 'state': 'Maharashtra',
         'services': [
             {'name': 'Bridal Wear', 'category': 'Fashion Designer', 'price': 50000, 'min': 1, 'max': 5},
             {'name': 'Custom Designs', 'category': 'Fashion Designer', 'price': 35000, 'min': 1, 'max': 10},
             {'name': 'Party Wear', 'category': 'Fashion Designer', 'price': 25000, 'min': 1, 'max': 10},
         ]},
        {'name': 'Designer Threads', 'email': 'info@designerthreads.com', 'phone': '9876543261', 'city': 'Delhi', 'state': 'Delhi',
         'services': [
             {'name': 'Ethnic & Traditional Outfits', 'category': 'Fashion Designer', 'price': 30000, 'min': 1, 'max': 10},
             {'name': 'Mens Designer Wear', 'category': 'Fashion Designer', 'price': 40000, 'min': 1, 'max': 5},
         ]},
    ],
    'Gift Services': [
        {'name': 'Perfect Gifts Co', 'email': 'contact@perfectgifts.com', 'phone': '9876543270', 'city': 'Mumbai', 'state': 'Maharashtra',
         'services': [
             {'name': 'Return Gifts', 'category': 'Gift Services', 'price': 10000, 'min': 50, 'max': 500},
             {'name': 'Gift Hampers', 'category': 'Gift Services', 'price': 15000, 'min': 20, 'max': 200},
             {'name': 'Corporate Gifts', 'category': 'Gift Services', 'price': 20000, 'min': 50, 'max': 500},
         ]},
        {'name': 'Gift Gallery', 'email': 'info@giftgallery.com', 'phone': '9876543271', 'city': 'Delhi', 'state': 'Delhi',
         'services': [
             {'name': 'Custom Gifts', 'category': 'Gift Services', 'price': 12000, 'min': 20, 'max': 200},
             {'name': 'Gift Wrapping & Packaging', 'category': 'Gift Services', 'price': 5000, 'min': 50, 'max': 300},
         ]},
    ],
}

def create_vendors():
    created_count = 0
    
    for business_type, vendors in MISSING_VENDORS.items():
        print(f"\n{'='*60}")
        print(f"Creating {business_type} vendors...")
        print(f"{'='*60}")
        
        for vendor_data in vendors:
            # Check if vendor already exists
            if CustomUser.objects.filter(email=vendor_data['email']).exists():
                print(f"[SKIP] Vendor {vendor_data['name']} already exists")
                continue
            
            # Create vendor user with unique username
            base_username = vendor_data['email'].split('@')[0]
            username = base_username
            counter = 1
            while CustomUser.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            vendor = CustomUser.objects.create(
                username=username,
                email=vendor_data['email'],
                first_name=vendor_data['name'].split()[0],
                last_name=' '.join(vendor_data['name'].split()[1:]),
                phone=vendor_data['phone'],
                user_type='vendor',
                business=business_type,
                city=vendor_data['city'],
                state=vendor_data['state'],
                is_verified=True,
                is_active=True
            )
            vendor.set_password('vendor123')
            vendor.save()
            
            # Create vendor profile
            VendorProfile.objects.create(
                user=vendor,
                profile_data={
                    'business': business_type,
                    'city': vendor_data['city'],
                    'state': vendor_data['state'],
                    'mobile': vendor_data['phone']
                }
            )
            
            # Create services
            for service in vendor_data['services']:
                VendorService.objects.create(
                    user=vendor,
                    service_name=service['name'],
                    category=service['category'],
                    service_price=Decimal(str(service['price'])),
                    minimum_people=service['min'],
                    maximum_people=service['max'],
                    is_active=True
                )
            
            created_count += 1
            print(f"[OK] Created {vendor_data['name']} with {len(vendor_data['services'])} services")
    
    print(f"\n{'='*60}")
    print(f"[SUCCESS] Created {created_count} vendors!")
    print(f"{'='*60}")

if __name__ == '__main__':
    create_vendors()
