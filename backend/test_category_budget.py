from events.models import Event, QuoteRequest, Budget
from authentication.models import CustomUser
from events.quote_views import match_vendors_to_event, get_budget_allocations, get_vendor_category
from decimal import Decimal

# Get test event
event = Event.objects.filter(event_type='wedding').first()

print(f"Event: {event.event_name} (ID: {event.id})")
print(f"Total Budget: ₹{event.total_budget}")

# Get budget allocations
print("\n--- Budget Allocations ---")
allocations = get_budget_allocations(event)
for category, data in allocations.items():
    print(f"{category}: ₹{data['amount']:.2f} ({data['percentage']}%)")

# Match vendors
print("\n--- Matched Vendors ---")
matched_vendors, categories = match_vendors_to_event(event)
print(f"Found {len(matched_vendors)} vendors")

# Show vendor categories and budgets
print("\n--- Vendor Category Mapping ---")
for vendor in matched_vendors:
    vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()
    vendor_category = get_vendor_category(vendor)
    vendor_budget = allocations.get(vendor_category, {}).get('amount', 0)
    vendor_percentage = allocations.get(vendor_category, {}).get('percentage', 0)
    
    print(f"\nVendor: {vendor_name}")
    print(f"  Business: {vendor.business}")
    print(f"  Category: {vendor_category}")
    print(f"  Budget: ₹{vendor_budget:.2f} ({vendor_percentage}%)")

# Check existing quote request
print("\n--- Quote Request Data ---")
qr = QuoteRequest.objects.filter(source_event=event).first()
if qr:
    print(f"Quote Request #{qr.id}")
    print(f"Category Specific Data: {qr.category_specific_data}")
    
    # Test vendor retrieval
    print("\n--- Vendor View Test ---")
    for vendor in matched_vendors[:2]:
        vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()
        vendor_data = qr.category_specific_data.get(vendor_name, {})
        
        print(f"\nVendor: {vendor_name}")
        print(f"  Category: {vendor_data.get('category', 'N/A')}")
        print(f"  Budget: ₹{vendor_data.get('budget', 0):.2f}")
        print(f"  Percentage: {vendor_data.get('percentage', 0)}%")
