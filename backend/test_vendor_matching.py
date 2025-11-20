from authentication.models import CustomUser
from django.db import models

# Test the fixed query
vendors_query = CustomUser.objects.filter(user_type='vendor', is_active=True)
print(f'Total active vendors: {vendors_query.count()}\n')

category = 'photography'
print(f'Testing matches for category: {category}')

# 1. Match by business
business_vendors = vendors_query.filter(business__icontains=category)
print(f'  Business matches: {business_vendors.count()}')
for v in business_vendors:
    print(f'    - {v.first_name} {v.last_name} (Business: {v.business})')

# 2. Match by VendorProfile services
profile_vendors = vendors_query.filter(
    vendor_profile__profile_data__services__icontains=category
)
print(f'  Profile services matches: {profile_vendors.count()}')
for v in profile_vendors:
    print(f'    - {v.first_name} {v.last_name}')

# 3. Match by VendorService category
service_vendors = vendors_query.filter(
    vendor_services__category__icontains=category
)
print(f'  VendorService matches: {service_vendors.count()}')
for v in service_vendors:
    print(f'    - {v.first_name} {v.last_name}')

# 4. Match by name
name_vendors = vendors_query.filter(
    models.Q(first_name__icontains=category) | 
    models.Q(last_name__icontains=category)
)
print(f'  Name matches: {name_vendors.count()}')
for v in name_vendors:
    print(f'    - {v.first_name} {v.last_name}')

# Test catering
print(f'\nTesting matches for category: catering')
category = 'catering'

business_vendors = vendors_query.filter(business__icontains=category)
print(f'  Business matches: {business_vendors.count()}')
for v in business_vendors:
    print(f'    - {v.first_name} {v.last_name} (Business: {v.business})')

profile_vendors = vendors_query.filter(
    vendor_profile__profile_data__services__icontains=category
)
print(f'  Profile services matches: {profile_vendors.count()}')
for v in profile_vendors:
    services = v.vendor_profile.profile_data.get('services', 'N/A')
    print(f'    - {v.first_name} {v.last_name} (Services: {services})')

service_vendors = vendors_query.filter(
    vendor_services__category__icontains=category
)
print(f'  VendorService matches: {service_vendors.count()}')
for v in service_vendors:
    print(f'    - {v.first_name} {v.last_name}')
