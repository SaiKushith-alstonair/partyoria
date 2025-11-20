from events.models import Event, QuoteRequest
from authentication.models import CustomUser
from events.quote_views import match_vendors_to_event

# Get a test event
event = Event.objects.filter(event_type='wedding').first()

if not event:
    print("No wedding event found!")
else:
    print(f"Testing with event: {event.event_name} (ID: {event.id})")
    print(f"Event services: {event.services}")
    print(f"Selected services: {event.selected_services}")
    
    # Test vendor matching
    print("\n--- Testing Vendor Matching ---")
    matched_vendors, categories = match_vendors_to_event(event)
    
    print(f"Categories to match: {categories}")
    print(f"Matched vendors: {len(matched_vendors)}")
    
    for vendor in matched_vendors:
        print(f"  - {vendor.first_name} {vendor.last_name} (ID: {vendor.id}, Business: {vendor.business})")
    
    # Test creating quote request
    if matched_vendors:
        print("\n--- Creating Quote Request ---")
        vendor_names = [f"{v.first_name} {v.last_name}".strip() for v in matched_vendors]
        print(f"Vendor names to store: {vendor_names}")
        
        # Check if quote already exists
        existing = QuoteRequest.objects.filter(source_event=event).first()
        if existing:
            print(f"Updating existing quote request #{existing.id}")
            existing.selected_vendors = vendor_names
            existing.status = 'vendors_notified'
            existing.save()
            qr = existing
        else:
            print("Creating new quote request")
            qr = QuoteRequest.objects.create(
                event_type=event.event_type,
                event_name=event.event_name,
                client_name='Test Client',
                client_email='test@test.com',
                client_phone='1234567890',
                event_date='2025-12-31',
                location='Test City',
                guest_count=100,
                budget_range='100000',
                services=event.services or [],
                description='Test quote',
                urgency='medium',
                user_id=2,
                source_event=event,
                selected_vendors=vendor_names,
                quote_type='targeted',
                status='vendors_notified'
            )
        
        print(f"Quote request #{qr.id} created/updated")
        print(f"Selected vendors: {qr.selected_vendors}")
        
        # Test vendor retrieval
        print("\n--- Testing Vendor Quote Retrieval ---")
        for vendor in matched_vendors[:2]:  # Test first 2 vendors
            vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()
            print(f"\nVendor: {vendor_name}")
            
            quotes = QuoteRequest.objects.filter(
                selected_vendors__contains=vendor_name,
                status__in=['pending', 'vendors_notified']
            )
            print(f"  Found {quotes.count()} quote requests")
            for q in quotes:
                print(f"    - Quote #{q.id}: {q.event_name}")
