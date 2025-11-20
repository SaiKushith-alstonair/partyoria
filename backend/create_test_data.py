import os
import sys
import django
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from events.models import Event, QuoteRequest
from django.contrib.auth.hashers import make_password

print("Creating test data for booking system...")

# Create test customer
customer, created = CustomUser.objects.get_or_create(
    email='customer@test.com',
    defaults={
        'username': 'customer_test',
        'first_name': 'Test',
        'last_name': 'Customer',
        'user_type': 'customer',
        'password': make_password('test123'),
        'is_active': True
    }
)
if created:
    print(f"[OK] Created customer: {customer.email}")
else:
    print(f"[OK] Customer exists: {customer.email}")

# Get a vendor
vendor = CustomUser.objects.filter(user_type='vendor').first()
if not vendor:
    print("[FAIL] No vendors found")
    sys.exit(1)
print(f"[OK] Using vendor: {vendor.email} ({vendor.business})")

# Create test event
event, created = Event.objects.get_or_create(
    user=customer,
    event_name='Test Wedding Event',
    defaults={
        'event_type': 'wedding',
        'attendees': 200,
        'total_budget': 500000,
        'venue_type': 'indoor',
        'duration': 8
    }
)
if created:
    print(f"[OK] Created event: {event.event_name}")
else:
    print(f"[OK] Event exists: {event.event_name}")

# Create quote request with vendor response
event_date = datetime.now() + timedelta(days=60)
quote, created = QuoteRequest.objects.get_or_create(
    user=customer,
    source_event=event,
    defaults={
        'event_type': 'wedding',
        'event_name': event.event_name,
        'event_date': event_date,
        'location': 'Mumbai, Maharashtra',
        'guest_count': event.attendees,
        'budget_range': '400000-600000',
        'client_name': f'{customer.first_name} {customer.last_name}',
        'client_email': customer.email,
        'client_phone': customer.phone or '9876543210',
        'status': 'responses_received',
        'services': ['catering', 'photography', 'decoration'],
        'vendor_responses': {
            f'{vendor.first_name} {vendor.last_name}': {
                'vendor_id': vendor.id,
                'vendor_name': f'{vendor.first_name} {vendor.last_name}',
                'vendor_business': vendor.business or 'Event Services',
                'vendor_location': f'{vendor.city}, {vendor.state}',
                'vendor_email': vendor.email,
                'vendor_phone': vendor.phone or '9876543210',
                'quote_amount': 150000,
                'message': 'We would love to work with you on your special day!',
                'includes': ['Full setup', 'Professional team', '8 hours service'],
                'excludes': ['Transportation', 'Accommodation'],
                'terms': 'Payment: 50% advance, 50% on completion',
                'submitted_at': datetime.now().isoformat(),
                'status': 'submitted'
            }
        }
    }
)

if created:
    print(f"[OK] Created quote request with vendor response")
else:
    # Update existing quote with vendor response
    if not quote.vendor_responses:
        quote.vendor_responses = {
            f'{vendor.first_name} {vendor.last_name}': {
                'vendor_id': vendor.id,
                'vendor_name': f'{vendor.first_name} {vendor.last_name}',
                'vendor_business': vendor.business or 'Event Services',
                'vendor_location': f'{vendor.city}, {vendor.state}',
                'vendor_email': vendor.email,
                'vendor_phone': vendor.phone or '9876543210',
                'quote_amount': 150000,
                'message': 'We would love to work with you on your special day!',
                'includes': ['Full setup', 'Professional team', '8 hours service'],
                'excludes': ['Transportation', 'Accommodation'],
                'terms': 'Payment: 50% advance, 50% on completion',
                'submitted_at': datetime.now().isoformat(),
                'status': 'submitted'
            }
        }
        quote.status = 'responses_received'
        quote.save()
        print(f"[OK] Updated quote with vendor response")
    else:
        print(f"[OK] Quote exists with responses")

print("\n" + "=" * 60)
print("TEST DATA READY")
print("=" * 60)
print(f"\nLogin Credentials:")
print(f"  Email: customer@test.com")
print(f"  Password: test123")
print(f"\nQuote ID: {quote.id}")
print(f"Vendor: {vendor.first_name} {vendor.last_name}")
print(f"Event: {event.event_name}")
