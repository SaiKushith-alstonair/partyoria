from django.core.management.base import BaseCommand
from authentication.models import CustomUser
from notifications.services import CustomerNotifications, VendorNotifications

class Command(BaseCommand):
    help = 'Create test notifications for development'

    def handle(self, *args, **options):
        # Get test users
        customers = CustomUser.objects.filter(user_type='customer')[:3]
        vendors = CustomUser.objects.filter(user_type='vendor')[:3]
        
        if not customers.exists():
            self.stdout.write(self.style.ERROR('No customers found'))
            return
            
        if not vendors.exists():
            self.stdout.write(self.style.ERROR('No vendors found'))
            return

        # Create test notifications for customers
        for customer in customers:
            CustomerNotifications.quote_received(
                customer=customer,
                vendor_name="Elite Catering",
                amount=2500.00,
                event_type="Wedding",
                quote_id=1
            )
            
            CustomerNotifications.booking_confirmed(
                customer=customer,
                vendor_name="Perfect Photography",
                event_type="Birthday Party",
                event_date="2024-02-15",
                booking_id=1
            )
            
            CustomerNotifications.payment_due(
                customer=customer,
                amount=1200.00,
                event_type="Corporate Event",
                payment_id=1
            )
            
            CustomerNotifications.event_reminder(
                customer=customer,
                event_type="Anniversary Celebration",
                time_until="2 days",
                event_id=1
            )

        # Create test notifications for vendors
        for vendor in vendors:
            VendorNotifications.new_quote_request(
                vendor=vendor,
                customer_name="John Smith",
                event_type="Wedding Reception",
                event_date="2024-03-20",
                quote_id=2
            )
            
            VendorNotifications.quote_accepted(
                vendor=vendor,
                customer_name="Sarah Johnson",
                amount=3500.00,
                event_type="Corporate Gala",
                booking_id=2
            )
            
            VendorNotifications.payment_received(
                vendor=vendor,
                amount=1800.00,
                customer_name="Mike Davis",
                booking_id=3
            )
            
            VendorNotifications.review_received(
                vendor=vendor,
                customer_name="Lisa Wilson",
                rating=5,
                review_id=1
            )
            
            VendorNotifications.performance_summary(
                vendor=vendor,
                bookings_count=12,
                revenue=15600.00
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created test notifications for {customers.count()} customers and {vendors.count()} vendors'
            )
        )