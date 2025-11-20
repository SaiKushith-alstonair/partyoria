from authentication.models import CustomUser
from events.models import QuoteRequest

# Simulate API response for vendor
vendor = CustomUser.objects.get(id=21)  # Sai Kusith M - Photography
vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()

quote_requests = QuoteRequest.objects.filter(
    selected_vendors__contains=vendor_name,
    status__in=['pending', 'vendors_notified']
).order_by('-created_at')

print("API Response Structure:")
print("="*60)

for qr in quote_requests:
    # Get vendor-specific budget (this is what the API returns)
    vendor_data = qr.category_specific_data.get(vendor_name, {})
    vendor_budget = vendor_data.get('budget', 0)
    vendor_category = vendor_data.get('category', 'general')
    vendor_percentage = vendor_data.get('percentage', 0)
    
    response = {
        'id': qr.id,
        'event_name': qr.event_name,
        'event_type': qr.event_type,
        'client_name': qr.client_name,
        'client_email': qr.client_email,
        'client_phone': qr.client_phone,
        'event_date': str(qr.event_date),
        'location': qr.location,
        'guest_count': qr.guest_count,
        'budget_range': qr.budget_range,
        'vendor_budget': vendor_budget,
        'vendor_category': vendor_category,
        'budget_percentage': vendor_percentage,
        'services': qr.services,
        'description': qr.description,
        'urgency': qr.urgency,
        'status': qr.status,
        'created_at': str(qr.created_at)
    }
    
    print(f"\nQuote #{qr.id}:")
    print(f"  budget_range: {response['budget_range']} (total)")
    print(f"  vendor_budget: {response['vendor_budget']} (vendor-specific)")
    print(f"  vendor_category: {response['vendor_category']}")
    print(f"  budget_percentage: {response['budget_percentage']}%")
    
    import json
    print(f"\nFull JSON Response:")
    print(json.dumps(response, indent=2, default=str))
