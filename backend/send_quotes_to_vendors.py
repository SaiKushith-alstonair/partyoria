from events.models import Event, QuoteRequest
from events.quote_views import match_vendors_to_event, get_budget_allocations, get_vendor_category

# Get the event for quote request #45
qr = QuoteRequest.objects.get(id=45)
event = qr.source_event

if not event:
    print("No source event found!")
else:
    print(f"Event: {event.event_name} (ID: {event.id})")
    
    # Match vendors
    matched_vendors, categories = match_vendors_to_event(event)
    print(f"Matched {len(matched_vendors)} vendors")
    
    # Get budget allocations
    budget_allocations = get_budget_allocations(event)
    
    # Map vendors to categories and budgets
    vendor_category_map = {}
    vendor_names = []
    
    for vendor in matched_vendors:
        vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()
        vendor_category = get_vendor_category(vendor)
        vendor_budget = budget_allocations.get(vendor_category, {}).get('amount', 0)
        vendor_percentage = budget_allocations.get(vendor_category, {}).get('percentage', 0)
        
        vendor_names.append(vendor_name)
        vendor_category_map[vendor_name] = {
            'category': vendor_category,
            'budget': vendor_budget,
            'percentage': vendor_percentage
        }
        
        print(f"  {vendor_name}: {vendor_category} - ₹{vendor_budget:.2f} ({vendor_percentage}%)")
    
    # Update quote request
    qr.selected_vendors = vendor_names
    qr.category_specific_data = vendor_category_map
    qr.status = 'vendors_notified'
    qr.save()
    
    print(f"\n✅ Quote Request #{qr.id} updated!")
    print(f"Status: {qr.status}")
    print(f"Vendors: {qr.selected_vendors}")
