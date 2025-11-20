#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from vendors.models import VendorService

print("=== CHECKING VENDOR SERVICES IN DATABASE ===\n")

# Check VendorService table
print("VENDORSERVICE TABLE:")
services = VendorService.objects.all()
print(f"Total services: {services.count()}")

if services.count() > 0:
    for service in services:
        print(f"  - ID: {service.id}")
        print(f"    Name: {service.name}")
        print(f"    Icon: {service.icon}")
        print(f"    Description: {service.description}")
        print(f"    Created: {service.created_at}")
        print()
else:
    print("  No vendor services found in database!")

print("=== VENDOR SERVICES CHECK COMPLETE ===")