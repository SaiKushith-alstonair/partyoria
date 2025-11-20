from django.db import models
from django.utils import timezone
from authentication.models import CustomUser
import uuid

class Notification(models.Model):
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    TYPE_CHOICES = [
        # Customer notifications
        ('quote_received', 'Quote Received'),
        ('quote_accepted', 'Quote Accepted'),
        ('quote_rejected', 'Quote Rejected'),
        ('booking_confirmed', 'Booking Confirmed'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('payment_due', 'Payment Due'),
        ('payment_overdue', 'Payment Overdue'),
        ('event_reminder', 'Event Reminder'),
        ('vendor_assigned', 'Vendor Assigned'),
        ('event_completed', 'Event Completed'),
        ('new_message', 'New Message'),
        ('vendor_portfolio', 'Vendor Portfolio'),
        ('vendor_availability', 'Vendor Availability'),
        ('account_verified', 'Account Verified'),
        ('password_changed', 'Password Changed'),
        ('vendor_recommendation', 'Vendor Recommendation'),
        
        # Vendor notifications
        ('new_quote_request', 'New Quote Request'),
        ('profile_viewed', 'Profile Viewed'),
        ('seasonal_alert', 'Seasonal Alert'),
        ('price_suggestion', 'Price Suggestion'),
        ('new_booking', 'New Booking'),
        ('payment_received', 'Payment Received'),
        ('customer_cancelled', 'Customer Cancelled'),
        ('review_received', 'Review Received'),
        ('customer_message', 'Customer Message'),
        ('quote_response', 'Quote Response'),
        ('event_changes', 'Event Changes'),
        ('rsvp_update', 'RSVP Update'),
        ('performance_summary', 'Performance Summary'),
        ('revenue_milestone', 'Revenue Milestone'),
        ('profile_views_up', 'Profile Views Increased'),
        
        # System notifications
        ('system_maintenance', 'System Maintenance'),
        ('security_alert', 'Security Alert'),
        ('platform_update', 'Platform Update'),
        
        # Marketing notifications
        ('promotion', 'Promotion'),
        ('referral_reward', 'Referral Reward'),
        ('loyalty_reward', 'Loyalty Reward'),
        ('event_tips', 'Event Tips'),
        ('trend_alert', 'Trend Alert'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    # Status tracking
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Action data
    action_url = models.URLField(blank=True, null=True)
    action_data = models.JSONField(default=dict, blank=True)
    
    # Metadata
    related_object_type = models.CharField(max_length=50, blank=True, null=True)
    related_object_id = models.CharField(max_length=100, blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Delivery tracking
    delivered_at = models.DateTimeField(null=True, blank=True)
    delivery_attempts = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['priority']),
        ]
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def mark_as_delivered(self):
        if not self.delivered_at:
            self.delivered_at = timezone.now()
            self.save(update_fields=['delivered_at'])
    
    def __str__(self):
        return f"{self.title} - {self.recipient.username}"

class NotificationPreference(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # In-app notifications
    enable_in_app = models.BooleanField(default=True)
    
    # Notification type preferences
    quote_notifications = models.BooleanField(default=True)
    booking_notifications = models.BooleanField(default=True)
    payment_notifications = models.BooleanField(default=True)
    message_notifications = models.BooleanField(default=True)
    marketing_notifications = models.BooleanField(default=True)
    system_notifications = models.BooleanField(default=True)
    
    # Quiet hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_start_time = models.TimeField(default='22:00')
    quiet_end_time = models.TimeField(default='08:00')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferences for {self.user.username}"

class NotificationTemplate(models.Model):
    notification_type = models.CharField(max_length=50, unique=True)
    title_template = models.CharField(max_length=200)
    message_template = models.TextField()
    action_url_template = models.CharField(max_length=500, blank=True)
    
    # Template variables documentation
    variables = models.JSONField(default=dict, help_text="Available template variables")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def render(self, context):
        title = self.title_template.format(**context)
        message = self.message_template.format(**context)
        action_url = self.action_url_template.format(**context) if self.action_url_template else None
        return title, message, action_url
    
    def __str__(self):
        return f"Template: {self.notification_type}"