import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from vendors.booking_models import Booking
from authentication.models import CustomUser
from events.models import Event, QuoteRequest
from django.db import connection

print("=" * 60)
print("RUTHLESS BOOKING SYSTEM TEST")
print("=" * 60)

# Test 1: Database Tables
print("\n[TEST 1] Database Tables Exist")
cursor = connection.cursor()
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='booking_details'")
result = cursor.fetchone()
print(f"[OK] booking_details table exists: {result is not None}")

# Test 2: Model Counts
print("\n[TEST 2] Data Counts")
print(f"Users: {CustomUser.objects.count()}")
print(f"Events: {Event.objects.count()}")
print(f"Vendors: {CustomUser.objects.filter(user_type='vendor').count()}")
print(f"QuoteRequests: {QuoteRequest.objects.count()}")
print(f"Bookings: {Booking.objects.count()}")

# Test 3: Booking Statuses
print("\n[TEST 3] Booking Status Distribution")
cursor.execute("SELECT status, COUNT(*) FROM booking_details GROUP BY status")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]}")

# Test 4: Sample Bookings
print("\n[TEST 4] Sample Bookings (Last 5)")
bookings = Booking.objects.select_related('vendor', 'customer', 'event').order_by('-created_at')[:5]
for b in bookings:
    vendor_name = b.vendor.business or b.vendor.username
    print(f"  ID: {b.id} | Vendor: {vendor_name} | Customer: {b.customer.username} | Status: {b.status} | Amount: Rs.{b.amount}")

# Test 5: Vendor Business Types
print("\n[TEST 5] Vendor Business Types")
cursor.execute("SELECT business, COUNT(*) FROM authentication_customuser WHERE user_type='vendor' GROUP BY business ORDER BY COUNT(*) DESC")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]}")

# Test 6: Quote Requests
print("\n[TEST 6] Quote Requests Status")
cursor.execute("SELECT status, COUNT(*) FROM quote_requests GROUP BY status")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]}")

# Test 7: Events with Bookings
print("\n[TEST 7] Events with Bookings")
cursor.execute("""
    SELECT e.event_name, COUNT(b.id) as booking_count
    FROM events e
    LEFT JOIN booking_details b ON e.id = b.event_id
    GROUP BY e.id, e.event_name
    HAVING COUNT(b.id) > 0
    ORDER BY booking_count DESC
    LIMIT 5
""")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} bookings")

# Test 8: Vendors with Bookings
print("\n[TEST 8] Vendors with Bookings")
cursor.execute("""
    SELECT u.business, u.username, COUNT(b.id) as booking_count
    FROM authentication_customuser u
    LEFT JOIN booking_details b ON u.id = b.vendor_id
    WHERE u.user_type = 'vendor'
    GROUP BY u.id, u.business, u.username
    HAVING COUNT(b.id) > 0
    ORDER BY booking_count DESC
    LIMIT 5
""")
for row in cursor.fetchall():
    vendor_name = row[0] or row[1]
    print(f"  {vendor_name}: {row[2]} bookings")

# Test 9: Pending Vendor Confirmations
print("\n[TEST 9] Pending Vendor Confirmations")
pending = Booking.objects.filter(status='pending_vendor').count()
print(f"  Bookings awaiting vendor confirmation: {pending}")

# Test 10: Revenue Analysis
print("\n[TEST 10] Revenue Analysis")
cursor.execute("SELECT SUM(amount) FROM booking_details WHERE status='confirmed'")
confirmed_revenue = cursor.fetchone()[0] or 0
cursor.execute("SELECT SUM(amount) FROM booking_details WHERE status='pending_vendor'")
pending_revenue = cursor.fetchone()[0] or 0
print(f"  Confirmed Revenue: Rs.{confirmed_revenue:,.2f}")
print(f"  Pending Revenue: Rs.{pending_revenue:,.2f}")
print(f"  Total Potential: Rs.{(confirmed_revenue + pending_revenue):,.2f}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
