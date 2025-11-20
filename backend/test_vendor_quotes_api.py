import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from events.models import QuoteRequest

# Get vendor
vendor = CustomUser.objects.get(email='saikushi@gmail.com')
vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()

print(f"Vendor: {vendor_name}")
print(f"Business: {vendor.business}")
print()

# Get quote requests
quote_requests = QuoteRequest.objects.filter(
    selected_vendors__contains=vendor_name,
    status__in=['pending', 'vendors_notified']
).order_by('-created_at')

print(f"Found {quote_requests.count()} quote requests")
print()

for qr in quote_requests:
    vendor_data = qr.category_specific_data.get(vendor_name, {})
    print(f"Quote #{qr.id}:")
    print(f"  Event: {qr.event_name}")
    print(f"  Status: {qr.status}")
    print(f"  Vendor Data: {vendor_data}")
    print(f"  Budget: {vendor_data.get('budget', 0)}")
    print(f"  Category: {vendor_data.get('category', 'N/A')}")
    print(f"  Percentage: {vendor_data.get('percentage', 0)}%")
    print()
