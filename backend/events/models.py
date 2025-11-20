from django.db import models
from decimal import Decimal
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class TraditionStyle(models.Model):
    event_type = models.CharField(max_length=100)
    style_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'events_traditionstyle'
    
    def __str__(self):
        return f"{self.event_type} - {self.style_name}"

class EventSection(models.Model):
    section_id = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    icon = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'event_sections'
        constraints = [
            models.UniqueConstraint(fields=['section_id'], name='unique_section_id')
        ]
    
    def clean(self):
        if not self.section_id:
            raise ValidationError('Section ID is required')
        if not self.name:
            raise ValidationError('Section name is required')
    
    def __str__(self):
        return self.name

class EventSubsection(models.Model):
    section = models.ForeignKey(
        EventSection, 
        on_delete=models.CASCADE, 
        related_name='subsections',
        db_index=True
    )
    subsection_id = models.CharField(max_length=50, db_index=True)
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'event_subsections'
        constraints = [
            models.UniqueConstraint(
                fields=['section', 'subsection_id'], 
                name='unique_subsection_per_section'
            )
        ]
        indexes = [
            models.Index(fields=['subsection_id']),
            models.Index(fields=['section', 'subsection_id']),
        ]
    
    def clean(self):
        if not self.subsection_id:
            raise ValidationError('Subsection ID is required')
        if not self.name:
            raise ValidationError('Subsection name is required')
    
    def __str__(self):
        return f"{self.section.name} - {self.name}"

class EventImage(models.Model):
    event_id = models.CharField(max_length=100, unique=True)
    image_url = models.URLField(max_length=500)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'event_images'
        indexes = [
            models.Index(fields=['event_id']),
        ]
    
    def __str__(self):
        return self.event_id

class EventRequirement(models.Model):
    event_id = models.CharField(max_length=100)
    category_name = models.CharField(max_length=200)
    requirement_id = models.CharField(max_length=100)
    label = models.CharField(max_length=200)
    category = models.CharField(max_length=50)
    unit = models.CharField(max_length=50, blank=True, null=True)
    placeholder = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'event_requirements'
        indexes = [
            models.Index(fields=['event_id']),
        ]
    
    def __str__(self):
        return f"{self.event_id} - {self.label}"

class VendorCategory(models.Model):
    category_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    vendors = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vendor_categories'
    
    def __str__(self):
        return self.name

class HeroVideo(models.Model):
    name = models.CharField(max_length=200)
    video_url = models.URLField(max_length=500)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'hero_videos'
    
    def __str__(self):
        return self.name

class RequirementQuestion(models.Model):
    QUESTION_TYPES = [
        ('text', 'Text Input'),
        ('number', 'Number Input'),
        ('dropdown', 'Dropdown'),
        ('checkbox', 'Checkbox'),
        ('radio', 'Radio Button'),
    ]
    
    requirement = models.ForeignKey(
        EventRequirement, 
        on_delete=models.CASCADE, 
        related_name='dynamic_questions',
        db_index=True
    )
    requirement_name = models.CharField(
        max_length=200, 
        blank=True, 
        help_text='Readable requirement name for easy identification'
    )
    question_text = models.CharField(max_length=255)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='text')
    options = models.JSONField(
        blank=True, 
        null=True, 
        help_text='Options for dropdown/radio/checkbox'
    )
    placeholder = models.CharField(max_length=100, blank=True)
    min_value = models.IntegerField(
        blank=True, 
        null=True,
        validators=[MinValueValidator(0)]
    )
    max_value = models.IntegerField(
        blank=True, 
        null=True,
        validators=[MinValueValidator(1)]
    )
    is_required = models.BooleanField(default=False)
    order = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    class Meta:
        db_table = 'requirement_questions'
        ordering = ['order', 'id']
        constraints = [
            models.CheckConstraint(
                check=models.Q(min_value__isnull=True) | models.Q(max_value__isnull=True) | models.Q(min_value__lt=models.F('max_value')),
                name='min_value_less_than_max_value'
            )
        ]
        indexes = [
            models.Index(fields=['requirement', 'order']),
        ]
    
    def clean(self):
        if not self.question_text:
            raise ValidationError('Question text is required')
        if self.min_value is not None and self.max_value is not None:
            if self.min_value >= self.max_value:
                raise ValidationError('Min value must be less than max value')
        if self.question_type in ['dropdown', 'radio', 'checkbox'] and not self.options:
            raise ValidationError(f'{self.question_type} questions must have options')
    
    def __str__(self):
        return f"{self.requirement_name or self.requirement.label} - {self.question_text}"

class EventRequirementImages(models.Model):
    event_name = models.CharField(max_length=100)
    requirement_name = models.CharField(max_length=100)
    image_number = models.IntegerField()
    image_url = models.URLField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'event_requirement_images'
        ordering = ['event_name', 'requirement_name', 'image_number']
    
    def __str__(self):
        return f"{self.event_name} - {self.requirement_name} {self.image_number}"

class Event(models.Model):
    EVENT_TYPES = [
        ('corporate', 'Corporate'),
        ('wedding', 'Wedding'),
        ('birthday', 'Birthday'),
        ('festival', 'Festival'),
        ('other', 'Other'),
    ]
    
    VENUE_TYPES = [
        ('indoor', 'Indoor'),
        ('outdoor', 'Outdoor'),
        ('hybrid', 'Hybrid'),
    ]
    
    event_name = models.CharField(max_length=255, default='Untitled Event')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='other', db_index=True)
    attendees = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(1), MaxValueValidator(10000)]
    )
    venue_type = models.CharField(max_length=20, choices=VENUE_TYPES, default='indoor')
    duration = models.PositiveIntegerField(
        default=4, 
        help_text="Duration in hours",
        validators=[MinValueValidator(1), MaxValueValidator(168)]
    )
    total_budget = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=10000.00,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    services = models.JSONField(default=list, help_text="List of selected services")
    form_data = models.JSONField(default=dict)
    special_requirements = models.JSONField(
        default=dict, 
        blank=True, 
        help_text="Format: {req_id: {selected: bool, quantity: int, unit: str, questions: list, answers: dict}}"
    )
    selected_services = models.JSONField(
        default=list, 
        blank=True, 
        help_text="List of selected service names"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='events', 
        null=True, 
        blank=True,
        db_index=True
    )
    created_by = models.CharField(
        max_length=255, 
        blank=True,
        default='',
        help_text="Name or identifier of event creator"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'events'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['event_type']),
            models.Index(fields=['created_at']),
        ]
    
    def clean(self):
        if self.attendees and self.attendees <= 0:
            raise ValidationError('Number of attendees must be positive')
        if self.total_budget and self.total_budget <= 0:
            raise ValidationError('Budget must be positive')
    
    def __str__(self):
        return f"{self.event_name} ({self.get_event_type_display()})"

class Budget(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name='budget')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    total_budget = models.DecimalField(max_digits=12, decimal_places=2)
    allocations = models.JSONField(default=dict)
    allocation_method = models.CharField(max_length=20, choices=[('smart', 'Smart'), ('manual', 'Manual')], default='smart')
    efficiency_score = models.FloatField(default=0.0)
    cost_per_guest = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cost_per_hour = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    insights = models.JSONField(default=dict)
    detailed_breakdown = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'budgets'
    
    def __str__(self):
        return f"Budget for {self.event.event_name}"

class EventMilestone(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name='milestone')
    milestones = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'event_milestones'
    
    def __str__(self):
        return f"Milestones for {self.event.event_name}"

class QuoteRequest(models.Model):
    QUOTE_TYPES = [
        ('comprehensive', 'Comprehensive'),
        ('targeted', 'Targeted'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('vendors_notified', 'Vendors Notified'),
        ('responses_received', 'Responses Received'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    event_type = models.CharField(max_length=50)
    event_name = models.CharField(max_length=255)
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=20)
    event_date = models.DateTimeField()
    location = models.CharField(max_length=500)
    guest_count = models.PositiveIntegerField()
    budget_range = models.CharField(max_length=50, default='50000-100000')
    services = models.JSONField(default=list)
    description = models.TextField(blank=True)
    urgency = models.CharField(max_length=20, default='normal')
    quote_type = models.CharField(max_length=20, choices=QUOTE_TYPES, default='comprehensive')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    expand_vendors = models.BooleanField(default=False)
    is_targeted_quote = models.BooleanField(default=False)
    prefilled_event_id = models.PositiveIntegerField(null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    source_event = models.ForeignKey(Event, on_delete=models.CASCADE, null=True, blank=True)
    selected_vendors = models.JSONField(default=list)
    selected_venues = models.JSONField(default=list)
    category_specific_data = models.JSONField(default=dict)
    vendor_responses = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'quote_requests'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Quote for {self.event_name}"
    
    @staticmethod
    def extract_category_specific_data(event, allocation):
        category_data = {}
        for category, data in allocation.items():
            category_data[category] = {
                'budget': float(data['amount']),
                'percentage': float(data['percentage']),
                'requirements': {},
                'details': data
            }
        return category_data
    
    def get_category_data_for_vendor(self, vendor_category):
        return self.category_specific_data.get(vendor_category)

class RSVP(models.Model):
    RESPONSE_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('maybe', 'Maybe'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='rsvps')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    guest_data = models.JSONField(default=dict)
    invitation_code = models.CharField(max_length=20, unique=True)
    response_status = models.CharField(max_length=20, choices=RESPONSE_CHOICES, default='pending')
    response_date = models.DateTimeField(null=True, blank=True)
    plus_ones = models.PositiveIntegerField(default=0)
    dietary_restrictions = models.TextField(blank=True)
    special_requests = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'event_rsvps'
        ordering = ['-created_at']
    
    @property
    def total_attendees(self):
        return 1 + self.plus_ones if self.response_status == 'accepted' else 0
    
    def __str__(self):
        return f"RSVP for {self.event.event_name}"


