from authentication.models import CustomUser
from events.models import QuoteRequest

# Test as Photography vendor
vendor = CustomUser.objects.get(id=21)  # Sai Kusith M
vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()

print(f"Testing as: {vendor_name}")
print(f"Business: {vendor.business}\n")

# Get quote requests (simulating API call)
quote_requests = QuoteRequest.objects.filter(
    selected_vendors__contains=vendor_name,
    status__in=['pending', 'vendors_notified']
).order_by('-created_at')

print(f"Found {quote_requests.count()} quote requests\n")

for qr in quote_requests:
    # Get vendor-specific budget
    vendor_data = qr.category_specific_data.get(vendor_name, {})
    vendor_budget = vendor_data.get('budget', 0)
    vendor_category = vendor_data.get('category', 'general')
    vendor_percentage = vendor_data.get('percentage', 0)
    
    print(f"Quote #{qr.id}: {qr.event_name}")
    print(f"  Total Event Budget: {qr.budget_range}")
    print(f"  YOUR Category: {vendor_category}")
    print(f"  YOUR Budget: ₹{vendor_budget:.2f}")
    print(f"  YOUR Percentage: {vendor_percentage}%")
    print(f"  Services: {qr.services}")

print("\n" + "="*60)

# Test as Catering vendor
vendor2 = CustomUser.objects.get(id=19)  # New Vendor
vendor_name2 = f"{vendor2.first_name} {vendor2.last_name}".strip()

print(f"\nTesting as: {vendor_name2}")
print(f"Business: {vendor2.business}\n")

quote_requests2 = QuoteRequest.objects.filter(
    selected_vendors__contains=vendor_name2,
    status__in=['pending', 'vendors_notified']
).order_by('-created_at')

for qr in quote_requests2:
    vendor_data = qr.category_specific_data.get(vendor_name2, {})
    vendor_budget = vendor_data.get('budget', 0)
    vendor_category = vendor_data.get('category', 'general')
    vendor_percentage = vendor_data.get('percentage', 0)
    
    print(f"Quote #{qr.id}: {qr.event_name}")
    print(f"  Total Event Budget: {qr.budget_range}")
    print(f"  YOUR Category: {vendor_category}")
    print(f"  YOUR Budget: ₹{vendor_budget:.2f}")
    print(f"  YOUR Percentage: {vendor_percentage}%")
