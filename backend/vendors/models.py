from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from authentication.models import CustomUser

class Venue(models.Model):
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    venue_details = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'venues'
        indexes = [
            models.Index(fields=['state', 'city']),
            models.Index(fields=['state']),
            models.Index(fields=['city']),
        ]

    def __str__(self):
        return f"{self.venue_details.get('name', 'Unknown')} - {self.city}, {self.state}"

class EventCategory(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'event_categories'
        verbose_name_plural = 'Event Categories'

    def __str__(self):
        return self.name

class EventType(models.Model):
    category = models.ForeignKey(EventCategory, on_delete=models.CASCADE, related_name='event_types')
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'event_types'

    def __str__(self):
        return f"{self.category.name} - {self.name}"

class VendorService(models.Model):
    service_name = models.CharField(max_length=200, default='Service')
    category = models.CharField(max_length=100, default='general')
    service_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(default='')
    image = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey('authentication.CustomUser', on_delete=models.CASCADE, related_name='vendor_services', db_column='user_id', null=True, blank=True)
    maximum_people = models.IntegerField(null=True, blank=True)
    minimum_people = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'vendor_services'

    def __str__(self):
        return self.service_name

class EventVendorMapping(models.Model):
    event_type = models.ForeignKey(EventType, on_delete=models.CASCADE, related_name='vendor_mappings')
    vendor_service = models.ForeignKey(VendorService, on_delete=models.CASCADE)
    is_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'event_vendor_mappings'
        unique_together = ['event_type', 'vendor_service']

    def __str__(self):
        return f"{self.event_type.name} - {self.vendor_service.name}"

class SpecialRequirement(models.Model):
    event_type = models.ForeignKey(EventType, on_delete=models.CASCADE, related_name='special_requirements')
    category_name = models.CharField(max_length=100)
    requirement_id = models.CharField(max_length=100)
    requirement_label = models.CharField(max_length=200)
    vendor_category = models.CharField(max_length=50)
    unit = models.CharField(max_length=50, blank=True, null=True)
    placeholder = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'special_requirements'
        unique_together = ['event_type', 'requirement_id']

    def __str__(self):
        return f"{self.event_type.name} - {self.requirement_label}"

class VendorProfile(models.Model):
    user = models.OneToOneField('authentication.CustomUser', on_delete=models.CASCADE, related_name='vendor_profile', db_column='user_id', null=True)
    profile_data = models.JSONField(default=dict)
    profile_image = models.ImageField(upload_to='vendor_profiles/', blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vendor_profiles'

    def __str__(self):
        return f"Profile for {self.user.email if self.user else 'Unknown'}"

class CalendarEvent(models.Model):
    # booking = models.ForeignKey('booking_models.Booking', on_delete=models.CASCADE, null=True, blank=True, db_column='booking_id')
    vendor = models.ForeignKey('authentication.CustomUser', on_delete=models.CASCADE, db_column='vendor_id')
    event_date = models.DateTimeField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vendors_calendarevent'
        ordering = ['event_date']
        indexes = [
            models.Index(fields=['vendor', 'event_date']),
            models.Index(fields=['event_date']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.event_date.date()}"