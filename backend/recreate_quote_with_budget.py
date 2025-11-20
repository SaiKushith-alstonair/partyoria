from events.models import Event, QuoteRequest
from events.quote_views import match_vendors_to_event, get_budget_allocations, get_vendor_category

# Get event
event = Event.objects.get(id=15)

# Match vendors
matched_vendors, categories = match_vendors_to_event(event)

# Get budget allocations
budget_allocations = get_budget_allocations(event)

# Map vendors to categories and budgets
vendor_category_map = {}
for vendor in matched_vendors:
    vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()
    vendor_category = get_vendor_category(vendor)
    vendor_category_map[vendor_name] = {
        'category': vendor_category,
        'budget': budget_allocations.get(vendor_category, {}).get('amount', 0),
        'percentage': budget_allocations.get(vendor_category, {}).get('percentage', 0)
    }

print("Vendor Category Map:")
for name, data in vendor_category_map.items():
    print(f"  {name}: {data['category']} - ₹{data['budget']:.2f} ({data['percentage']}%)")

# Update existing quote request
qr = QuoteRequest.objects.get(id=44)
qr.category_specific_data = vendor_category_map
qr.save()

print(f"\nQuote Request #{qr.id} updated!")
print(f"Category Specific Data: {qr.category_specific_data}")
