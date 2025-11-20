#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from vendors.models import VendorService

print("=== EXISTING VENDORS ===\n")

vendors = CustomUser.objects.filter(user_type='vendor')
print(f"Total vendors: {vendors.count()}\n")

for v in vendors:
    print(f"ID: {v.id} | {v.username} | {v.email}")
    print(f"  Business: {v.business}")
    print(f"  Location: {v.city}, {v.state}")
    
    services = VendorService.objects.filter(user=v)
    print(f"  Services: {services.count()}")
    for s in services:
        print(f"    - {s.service_name} ({s.category}) - Rs.{s.service_price}")
    print()
