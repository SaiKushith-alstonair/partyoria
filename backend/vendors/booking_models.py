from django.db import models
from authentication.models import CustomUser
from events.models import Event, QuoteRequest

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending_vendor', 'Pending Vendor Confirmation'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    vendor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='vendor_bookings')
    customer_name = models.CharField(max_length=255)
    service_type = models.CharField(max_length=255)
    event_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_vendor')
    description = models.TextField(blank=True)
    location = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Additional fields for quote integration
    customer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='customer_bookings', null=True, blank=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='bookings', null=True, blank=True)
    quote_request = models.ForeignKey(QuoteRequest, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    vendor_quote_data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'booking_details'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'vendor']),
            models.Index(fields=['status', 'customer']),
            models.Index(fields=['event_date']),
        ]
    
    def __str__(self):
        return f"Booking #{self.id} - {self.customer_name} with {self.vendor.get_full_name()}"
