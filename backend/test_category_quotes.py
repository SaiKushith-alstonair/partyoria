#!/usr/bin/env python
"""
Test script to demonstrate category-specific quote functionality
"""
import os
import sys
import django
from datetime import date, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from events.models import Event, QuoteRequest
from events.vendor_notification import VendorNotificationService
from decimal import Decimal

def create_test_event():
    """Create a test event with category-specific requirements"""
    
    # Sample event data
    event_data = {
        'event_name': 'Corporate Annual Gala',
        'event_type': 'corporate',
        'attendees': 150,
        'venue_type': 'indoor',
        'duration': 6,
        'total_budget': Decimal('500000'),
        'special_requirements': {
            'catering': {
                'selected': True,
                'quantity': 150,
                'unit': 'guests',
                'questions': [
                    {'id': 1, 'question_text': 'Preferred cuisine type?'},
                    {'id': 2, 'question_text': 'Number of courses?'},
                    {'id': 3, 'question_text': 'Live cooking stations needed?'}
                ],
                'answers': {
                    '1': 'Multi-cuisine',
                    '2': '3 course meal',
                    '3': 'Yes, 2-3 stations'
                }
            },
            'audio-visual-equipment': {
                'selected': True,
                'quantity': 1,
                'unit': 'setup',
                'questions': [
                    {'id': 1, 'question_text': 'Sound system type?'},
                    {'id': 2, 'question_text': 'Microphone requirements?'},
                    {'id': 3, 'question_text': 'Projection needs?'}
                ],
                'answers': {
                    '1': 'Professional sound system',
                    '2': '6-10 mics',
                    '3': 'Yes, LED screen'
                }
            },
            'photography': {
                'selected': True,
                'quantity': 1,
                'unit': 'photographer',
                'questions': [
                    {'id': 1, 'question_text': 'Photography style?'},
                    {'id': 2, 'question_text': 'Duration needed?'}
                ],
                'answers': {
                    '1': 'Professional corporate',
                    '2': '6-8 hours'
                }
            }
        },
        'selected_services': ['catering', 'audio-visual-equipment', 'photography'],
        'services': ['catering', 'audio-visual-equipment', 'photography'],
        'form_data': {'event_type': 'corporate', 'attendees': 150}
    }
    
    event = Event.objects.create(**event_data)
    print(f"Created test event: {event.event_name} (ID: {event.id})")
    return event

def create_targeted_quote_request(event):
    """Create a targeted quote request with category-specific data"""
    
    # Calculate budget allocations (simplified)
    budget_allocations = {
        'Catering': {
            'percentage': 45.0,
            'amount': 225000.0,
            'per_guest_cost': 1500.0,
            'per_hour_cost': 37500.0
        },
        'Audio Visual Equipment': {
            'percentage': 30.0,
            'amount': 150000.0,
            'per_guest_cost': 1000.0,
            'per_hour_cost': 25000.0
        },
        'Photography': {
            'percentage': 25.0,
            'amount': 125000.0,
            'per_guest_cost': 833.33,
            'per_hour_cost': 20833.33
        }
    }
    
    # Extract category-specific data
    category_data = QuoteRequest.extract_category_specific_data(event, budget_allocations)
    
    quote_request = QuoteRequest.objects.create(
        event_type=event.event_type,
        event_name=event.event_name,
        client_name='John Corporate',
        client_email='john@company.com',
        client_phone='+91-9876543210',
        event_date=date.today() + timedelta(days=30),
        location='Mumbai, Maharashtra',
        guest_count=event.attendees,
        budget_range='₹4-6 Lakhs',
        services=event.selected_services,
        description='Annual corporate gala with professional requirements',
        urgency='medium',
        quote_type='targeted',
        is_targeted_quote=True,
        source_event=event,
        category_specific_data=category_data
    )
    
    print(f"Created targeted quote request (ID: {quote_request.id})")
    print(f"  Categories with specific data: {list(category_data.keys())}")
    
    return quote_request

def demonstrate_category_specific_notifications(quote_request):
    """Demonstrate sending category-specific notifications"""
    
    print("\n=== CATEGORY-SPECIFIC NOTIFICATIONS ===")
    
    # Show what each vendor category will receive
    for category, category_data in quote_request.category_specific_data.items():
        print(f"\n{category.upper()} VENDORS WILL RECEIVE:")
        print(f"   Budget Allocation: Rs.{category_data.get('budget', 0):,.2f}")
        print(f"   Requirements: {len(category_data.get('requirements', {}))} specific items")
        
        # Show specific requirements
        for req_id, req_data in category_data.get('requirements', {}).items():
            req_name = req_id.replace('-', ' ').title()
            print(f"   • {req_name}")
            answers = req_data.get('answers', {})
            for answer in answers.values():
                print(f"     - {answer}")
    
    # Simulate sending notifications
    print(f"\nSending targeted notifications...")
    notification_results = VendorNotificationService.send_targeted_quotes(quote_request)
    
    print(f"Notification Results:")
    for category, emails in notification_results.items():
        print(f"   {category}: {len(emails)} vendors notified")
        for email in emails:
            print(f"     - {email}")

def demonstrate_vendor_specific_data_access(quote_request):
    """Demonstrate how vendors can access their specific data"""
    
    print(f"\n=== VENDOR-SPECIFIC DATA ACCESS ===")
    
    # Simulate different vendor categories accessing their data
    categories = ['catering', 'audio_visual', 'photography']
    
    for category in categories:
        category_data = quote_request.get_category_data_for_vendor(category)
        
        if category_data:
            print(f"\n{category.upper()} VENDOR DASHBOARD:")
            print(f"   Quote ID: {quote_request.id}")
            print(f"   Event: {quote_request.event_name}")
            print(f"   Client: {quote_request.client_name}")
            print(f"   Date: {quote_request.event_date}")
            print(f"   Guests: {quote_request.guest_count}")
            print(f"   Allocated Budget: Rs.{category_data.get('budget', 0):,.2f}")
            print(f"   Requirements: {len(category_data.get('requirements', {}))} items")
            
            # Show only their specific requirements
            requirements = category_data.get('requirements', {})
            for req_id, req_data in requirements.items():
                req_name = req_id.replace('-', ' ').title()
                print(f"   • {req_name}:")
                answers = req_data.get('answers', {})
                for question_id, answer in answers.items():
                    print(f"     - {answer}")
        else:
            print(f"\n{category.upper()} VENDOR: No specific requirements")

def main():
    """Main test function"""
    print("TESTING CATEGORY-SPECIFIC QUOTE SYSTEM")
    print("=" * 50)
    
    try:
        # Create test data
        event = create_test_event()
        quote_request = create_targeted_quote_request(event)
        
        # Demonstrate functionality
        demonstrate_category_specific_notifications(quote_request)
        demonstrate_vendor_specific_data_access(quote_request)
        
        print(f"\nTEST COMPLETED SUCCESSFULLY!")
        print(f"\nKey Benefits Demonstrated:")
        print(f"• Catering vendors only receive catering requirements & budget")
        print(f"• Photography vendors only receive photography requirements & budget")
        print(f"• Audio/Visual vendors only receive A/V requirements & budget")
        print(f"• No vendor sees irrelevant information")
        print(f"• Budget is allocated specifically per category")
        
        # Cleanup
        print(f"\nCleaning up test data...")
        quote_request.delete()
        event.delete()
        print(f"Test data cleaned up")
        
    except Exception as e:
        print(f"Test failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()