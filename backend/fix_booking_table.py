import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()

print("Adding missing columns to booking_details table...")

# Add customer_id
cursor.execute("ALTER TABLE booking_details ADD COLUMN IF NOT EXISTS customer_id BIGINT REFERENCES authentication_customuser(id)")
print("[OK] customer_id column added")

# Add event_id
cursor.execute("ALTER TABLE booking_details ADD COLUMN IF NOT EXISTS event_id BIGINT REFERENCES events(id)")
print("[OK] event_id column added")

# Add quote_request_id
cursor.execute("ALTER TABLE booking_details ADD COLUMN IF NOT EXISTS quote_request_id BIGINT REFERENCES quote_requests(id)")
print("[OK] quote_request_id column added")

# Add vendor_quote_data
cursor.execute("ALTER TABLE booking_details ADD COLUMN IF NOT EXISTS vendor_quote_data JSONB DEFAULT '{}'")
print("[OK] vendor_quote_data column added")

print("\nAll columns added successfully!")
