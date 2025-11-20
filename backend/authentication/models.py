from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = [
        ('customer', 'Customer'),
        ('vendor', 'Vendor'),
    ]
    
    PROFESSION_CHOICES = [
        ('Photography', 'Photography'),
        ('Catering', 'Catering'),
        ('DJ', 'DJ'),
        ('Decoration', 'Decoration'),
        ('Event Manager', 'Event Manager'),
        ('Transportation', 'Transportation'),
        ('Florist', 'Florist'),
        ('Baker', 'Baker'),
        ('Videography', 'Videography'),
        ('Makeup Artist', 'Makeup Artist'),
        ('Hair Stylist', 'Hair Stylist'),
        ('Fashion Designer', 'Fashion Designer'),
        ('Gift Services', 'Gift Services'),
        ('Entertainment', 'Entertainment'),
        ('Lighting', 'Lighting'),
    ]
    
    EXPERIENCE_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Expert', 'Expert'),
    ]
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='customer')
    phone = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Vendor-specific fields
    business = models.CharField(max_length=100, blank=True, null=True)
    experience_level = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    onboarding_completed = models.BooleanField(default=False)
    


    def __str__(self):
        return f"{self.username} ({self.user_type})"

class UserSession(models.Model):
    ACTION_CHOICES = [
        ('signup', 'Signup'),
        ('login', 'Login'),
        ('logout', 'Logout'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sessions')
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    session_key = models.CharField(max_length=40, blank=True, null=True)
    timestamp = models.DateTimeField(default=timezone.now)
    is_successful = models.BooleanField(default=True)
    failure_reason = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'action']),
            models.Index(fields=['ip_address']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.ip_address} - {self.timestamp}"

class IPAddressLog(models.Model):
    ip_address = models.GenericIPAddressField(unique=True)
    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    total_requests = models.PositiveIntegerField(default=1)
    is_blocked = models.BooleanField(default=False)
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        ordering = ['-last_seen']
    
    def __str__(self):
        return f"{self.ip_address} - {self.total_requests} requests"