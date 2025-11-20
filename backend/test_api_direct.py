import requests
import json

BASE_URL = 'http://127.0.0.1:8000'

print("=" * 70)
print("RUTHLESS API TEST - DIRECT HTTP CALLS")
print("=" * 70)

# Test 1: Login
print("\n[TEST 1] Customer Login")
login_data = {
    'username': 'customer@test.com',
    'password': 'test123'
}

try:
    response = requests.post(f'{BASE_URL}/api/auth/login/', json=login_data)
    print(f"  Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('access')
        print(f"  [OK] Login successful")
        print(f"  Token: {token[:50]}...")
    else:
        print(f"  [FAIL] Login failed")
        print(f"  Response: {response.text}")
        exit(1)
except Exception as e:
    print(f"  [FAIL] Error: {e}")
    exit(1)

# Test 2: Get Quote Requests
print("\n[TEST 2] Get Quote Requests")
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

try:
    response = requests.get(f'{BASE_URL}/api/quote-requests/', headers=headers)
    print(f"  Status: {response.status_code}")
    
    if response.status_code == 200:
        quotes = response.json()
        print(f"  [OK] Found {len(quotes)} quote requests")
        
        if quotes:
            quote = quotes[0]
            quote_id = quote['id']
            print(f"  Quote ID: {quote_id}")
            print(f"  Event: {quote.get('event_name')}")
            print(f"  Responses: {len(quote.get('vendor_responses', {}))}")
            
            if quote.get('vendor_responses'):
                vendor_name = list(quote['vendor_responses'].keys())[0]
                vendor_data = quote['vendor_responses'][vendor_name]
                print(f"  Vendor: {vendor_name}")
                print(f"  Vendor ID: {vendor_data.get('vendor_id')}")
                print(f"  Amount: Rs.{vendor_data.get('quote_amount')}")
    else:
        print(f"  [FAIL] Failed to get quotes")
        print(f"  Response: {response.text}")
        exit(1)
except Exception as e:
    print(f"  [FAIL] Error: {e}")
    exit(1)

# Test 3: Create Booking
print("\n[TEST 3] Create Booking from Quote")
if quotes and quote.get('vendor_responses'):
    booking_data = {
        'quote_id': quote_id,
        'vendor_name': vendor_name
    }
    
    try:
        response = requests.post(
            f'{BASE_URL}/api/vendor/bookings/create/',
            json=booking_data,
            headers=headers
        )
        
        print(f"  Status: {response.status_code}")
        print(f"  Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            result = response.json()
            booking_id = result.get('booking_id')
            print(f"  [OK] Booking created: #{booking_id}")
        else:
            print(f"  [FAIL] Booking creation failed")
    except Exception as e:
        print(f"  [FAIL] Error: {e}")
        exit(1)
else:
    print("  [SKIP] No quotes with responses")

# Test 4: Get Customer Bookings
print("\n[TEST 4] Get Customer Bookings")
try:
    response = requests.get(f'{BASE_URL}/api/vendor/bookings/customer/', headers=headers)
    print(f"  Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        bookings = data.get('bookings', [])
        print(f"  [OK] Found {len(bookings)} bookings")
        
        for booking in bookings:
            print(f"    Booking #{booking['id']}: {booking['vendor_name']} - Rs.{booking['amount']} - {booking['status']}")
    else:
        print(f"  [FAIL] Failed to get bookings")
        print(f"  Response: {response.text}")
except Exception as e:
    print(f"  [FAIL] Error: {e}")

# Test 5: Vendor Login and Confirm
print("\n[TEST 5] Vendor Workflow")
vendor_login = {
    'email': 'saikushith@alstona.com',
    'password': 'test123'
}

try:
    response = requests.post(f'{BASE_URL}/api/vendor/auth/login/', json=vendor_login)
    print(f"  Vendor Login Status: {response.status_code}")
    
    if response.status_code == 200:
        vendor_token = response.json().get('access')
        print(f"  [OK] Vendor logged in")
        
        vendor_headers = {
            'Authorization': f'Bearer {vendor_token}',
            'Content-Type': 'application/json'
        }
        
        # Get vendor bookings
        response = requests.get(f'{BASE_URL}/api/vendor/bookings/vendor/', headers=vendor_headers)
        print(f"  Get Bookings Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            vendor_bookings = data.get('bookings', [])
            print(f"  [OK] Vendor has {len(vendor_bookings)} bookings")
            
            if vendor_bookings:
                booking = vendor_bookings[0]
                booking_id = booking['id']
                print(f"    Booking #{booking_id}: {booking['customer_name']} - Rs.{booking['amount']} - {booking['status']}")
                
                # Confirm booking
                if booking['status'] == 'pending_vendor':
                    response = requests.post(
                        f'{BASE_URL}/api/vendor/bookings/{booking_id}/confirm/',
                        headers=vendor_headers
                    )
                    print(f"  Confirm Status: {response.status_code}")
                    
                    if response.status_code == 200:
                        print(f"  [OK] Booking confirmed")
                    else:
                        print(f"  [FAIL] Confirmation failed: {response.text}")
    else:
        print(f"  [SKIP] Vendor login failed (use actual password)")
except Exception as e:
    print(f"  [FAIL] Error: {e}")

print("\n" + "=" * 70)
print("API TEST COMPLETE")
print("=" * 70)
