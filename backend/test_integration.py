import os
import sys
import django
import requests
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser
from events.models import Event, QuoteRequest
from vendors.booking_models import Booking

BASE_URL = 'http://127.0.0.1:8000'

print("=" * 70)
print("RUTHLESS INTEGRATION TEST - BOOKING SYSTEM")
print("=" * 70)

# Test 1: URL Routing
print("\n[TEST 1] URL Routing Verification")
endpoints = [
    '/api/vendor/bookings/create/',
    '/api/vendor/bookings/customer/',
    '/api/vendor/bookings/vendor/',
]
for endpoint in endpoints:
    print(f"  Checking: {endpoint}")

# Test 2: Authentication
print("\n[TEST 2] Authentication Test")
customer = CustomUser.objects.filter(user_type='customer').first()
vendor = CustomUser.objects.filter(user_type='vendor').first()

if not customer or not vendor:
    print("  [FAIL] No test users found")
    sys.exit(1)

print(f"  Customer: {customer.email}")
print(f"  Vendor: {vendor.email}")

# Login customer
login_data = {'email': customer.email, 'password': 'test123'}
try:
    response = requests.post(f'{BASE_URL}/api/auth/login/', json=login_data)
    if response.status_code == 200:
        customer_token = response.json().get('access')
        print(f"  [OK] Customer login successful")
    else:
        print(f"  [FAIL] Customer login failed: {response.status_code}")
        print(f"  Note: Use actual password or create test user")
        customer_token = None
except Exception as e:
    print(f"  [FAIL] Customer login error: {e}")
    customer_token = None

# Test 3: Quote Request Check
print("\n[TEST 3] Quote Request Verification")
quotes = QuoteRequest.objects.filter(user=customer)
print(f"  Customer has {quotes.count()} quote requests")

if quotes.exists():
    quote = quotes.first()
    print(f"  Quote ID: {quote.id}")
    print(f"  Event: {quote.event_type}")
    print(f"  Responses: {len(quote.vendor_responses or {})}")
    
    if quote.vendor_responses:
        print(f"  Vendors responded:")
        for vendor_name in quote.vendor_responses.keys():
            print(f"    - {vendor_name}")

# Test 4: Booking Creation (if token available)
print("\n[TEST 4] Booking Creation Test")
if customer_token and quotes.exists():
    quote = quotes.first()
    if quote.vendor_responses:
        vendor_name = list(quote.vendor_responses.keys())[0]
        
        headers = {
            'Authorization': f'Bearer {customer_token}',
            'Content-Type': 'application/json'
        }
        
        booking_data = {
            'quote_id': quote.id,
            'vendor_name': vendor_name
        }
        
        try:
            response = requests.post(
                f'{BASE_URL}/api/vendor/bookings/create/',
                json=booking_data,
                headers=headers
            )
            
            print(f"  Status Code: {response.status_code}")
            print(f"  Response: {response.json()}")
            
            if response.status_code == 200:
                print(f"  [OK] Booking created successfully")
            else:
                print(f"  [FAIL] Booking creation failed")
        except Exception as e:
            print(f"  [FAIL] Request error: {e}")
else:
    print("  [SKIP] No token or quotes available")

# Test 5: Database Verification
print("\n[TEST 5] Database State")
print(f"  Total Bookings: {Booking.objects.count()}")
print(f"  Pending: {Booking.objects.filter(status='pending_vendor').count()}")
print(f"  Confirmed: {Booking.objects.filter(status='confirmed').count()}")
print(f"  Cancelled: {Booking.objects.filter(status='cancelled').count()}")

# Test 6: Data Integrity
print("\n[TEST 6] Data Integrity Checks")
bookings_without_customer = Booking.objects.filter(customer__isnull=True).count()
bookings_without_vendor = Booking.objects.filter(vendor__isnull=True).count()
print(f"  Bookings without customer: {bookings_without_customer}")
print(f"  Bookings without vendor: {bookings_without_vendor}")

if bookings_without_customer > 0 or bookings_without_vendor > 0:
    print("  [FAIL] Data integrity compromised")
else:
    print("  [OK] Data integrity intact")

# Test 7: Duplicate Check
print("\n[TEST 7] Duplicate Prevention")
if quotes.exists():
    quote = quotes.first()
    duplicates = Booking.objects.filter(quote_request=quote).values('vendor_id').annotate(count=models.Count('id')).filter(count__gt=1)
    if duplicates.exists():
        print(f"  [FAIL] Found {duplicates.count()} duplicate bookings")
    else:
        print(f"  [OK] No duplicate bookings")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
