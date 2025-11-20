import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from vendors.models import VendorService

print("=" * 60)
print("CATERING VENDORS CHECK")
print("=" * 60)

catering_vendors = CustomUser.objects.filter(user_type='vendor', business='Catering')
print(f"\nTotal Catering vendors: {catering_vendors.count()}")

for v in catering_vendors[:10]:
    services = VendorService.objects.filter(user=v)
    print(f"\n{v.first_name} {v.last_name} (ID: {v.id}):")
    print(f"  Email: {v.email}")
    print(f"  Services: {services.count()}")
    for s in services:
        print(f"    - {s.service_name}: Rs.{s.service_price}")

print("\n" + "=" * 60)
print("CHECKING API RESPONSE")
print("=" * 60)

# Test API call
import requests
try:
    response = requests.get('http://127.0.0.1:8000/api/vendor/marketplace/?category=Catering&price_range=0-56200&limit=10')
    print(f"\nAPI Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Results count: {data.get('count', 0)}")
        results = data.get('results', [])
        for vendor in results[:3]:
            print(f"\n  Vendor: {vendor.get('full_name')}")
            print(f"  Business: {vendor.get('business')}")
            print(f"  Services: {len(vendor.get('services', []))}")
            for service in vendor.get('services', []):
                print(f"    - {service.get('service_name')}: Rs.{service.get('service_price')}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"API Error: {e}")
