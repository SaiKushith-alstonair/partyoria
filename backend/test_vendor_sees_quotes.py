from authentication.models import CustomUser
from events.models import QuoteRequest

# Test as vendor "New Vendor" (ID: 19)
vendor = CustomUser.objects.get(id=19)
vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()

print(f"Testing as vendor: {vendor_name} (ID: {vendor.id})")
print(f"User type: {vendor.user_type}")
print(f"Business: {vendor.business}")

# Query quotes like the API does
quote_requests = QuoteRequest.objects.filter(
    selected_vendors__contains=vendor_name,
    status__in=['pending', 'vendors_notified']
).order_by('-created_at')

print(f"\nFound {quote_requests.count()} quote requests")

for qr in quote_requests:
    print(f"\nQuote #{qr.id}:")
    print(f"  Event: {qr.event_name}")
    print(f"  Type: {qr.event_type}")
    print(f"  Client: {qr.client_name}")
    print(f"  Status: {qr.status}")
    print(f"  Selected vendors: {qr.selected_vendors}")
    print(f"  Services: {qr.services}")

# Test another vendor
print("\n" + "="*50)
vendor2 = CustomUser.objects.get(id=21)
vendor_name2 = f"{vendor2.first_name} {vendor2.last_name}".strip()

print(f"Testing as vendor: {vendor_name2} (ID: {vendor2.id})")
print(f"Business: {vendor2.business}")

quote_requests2 = QuoteRequest.objects.filter(
    selected_vendors__contains=vendor_name2,
    status__in=['pending', 'vendors_notified']
).order_by('-created_at')

print(f"\nFound {quote_requests2.count()} quote requests")
for qr in quote_requests2:
    print(f"  - Quote #{qr.id}: {qr.event_name}")
