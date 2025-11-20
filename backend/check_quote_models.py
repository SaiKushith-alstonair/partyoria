#!/usr/bin/env python
"""
Check if QuoteRequest model exists and is properly migrated
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection
from events.models import QuoteRequest, Event
from django.contrib.auth import get_user_model

User = get_user_model()

def check_quote_models():
    """Check if quote models exist and are working"""
    print("=== Checking Quote Models ===")
    
    try:
        # Check if QuoteRequest table exists (PostgreSQL)
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'quote_requests';
            """)
            result = cursor.fetchone()
            
            if result:
                print("quote_requests table exists")
                
                # Check table structure
                cursor.execute("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'quote_requests' 
                    ORDER BY ordinal_position;
                """)
                columns = cursor.fetchall()
                print(f"Table has {len(columns)} columns:")
                for col in columns:
                    print(f"  - {col[0]} ({col[1]})")
                
                # Check if we can create a QuoteRequest
                print("\n=== Testing QuoteRequest Model ===")
                
                # Get or create a user
                user, created = User.objects.get_or_create(
                    username='testuser',
                    defaults={'email': 'test@example.com'}
                )
                if created:
                    print("✓ Created test user")
                else:
                    print("✓ Using existing test user")
                
                # Get or create an event
                event, created = Event.objects.get_or_create(
                    event_name='Test Event for Quote',
                    defaults={
                        'event_type': 'birthday',
                        'attendees': 50,
                        'total_budget': 50000,
                        'services': ['catering'],
                        'user': user,
                        'form_data': {'clientName': 'Test Client'}
                    }
                )
                if created:
                    print("✓ Created test event")
                else:
                    print("✓ Using existing test event")
                
                # Try to create a QuoteRequest
                quote_request, created = QuoteRequest.objects.get_or_create(
                    event_type='birthday',
                    client_name='Test Client',
                    client_email='test@example.com',
                    event_date='2024-12-25',
                    defaults={
                        'event_name': 'Test Birthday Party',
                        'location': 'Mumbai',
                        'guest_count': 50,
                        'budget_range': '₹50,000',
                        'services': ['catering'],
                        'description': 'Test quote request',
                        'user': user,
                        'prefilled_event_id': event.id,
                        'selected_vendors': ['Test Vendor'],
                        'quote_type': 'targeted'
                    }
                )
                
                if created:
                    print("✓ Created test QuoteRequest")
                else:
                    print("✓ Using existing test QuoteRequest")
                
                print(f"✓ QuoteRequest ID: {quote_request.id}")
                print(f"✓ QuoteRequest status: {quote_request.status}")
                print(f"✓ QuoteRequest services: {quote_request.services}")
                
                # Count existing quote requests
                total_quotes = QuoteRequest.objects.count()
                print(f"✓ Total QuoteRequests in database: {total_quotes}")
                
                # Test filtering by event
                event_quotes = QuoteRequest.objects.filter(prefilled_event_id=event.id)
                print(f"✓ QuoteRequests for event {event.id}: {event_quotes.count()}")
                
                print("\n=== Model Check Complete ===")
                print("✓ All quote models are working correctly!")
                
            else:
                print("quote_requests table does not exist")
                print("Run: python manage.py makemigrations events")
                print("Then: python manage.py migrate")
                
    except Exception as e:
        print(f"Error checking models: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_quote_models()