from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
import uuid
import os

class Conversation(models.Model):
    vendor = models.ForeignKey('authentication.CustomUser', on_delete=models.CASCADE, related_name='vendor_conversations')
    customer = models.ForeignKey('authentication.CustomUser', on_delete=models.CASCADE, related_name='customer_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    last_message_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('vendor', 'customer')
        indexes = [
            models.Index(fields=['-last_message_at']),
            models.Index(fields=['vendor', '-last_message_at']),
            models.Index(fields=['customer', '-last_message_at']),
        ]

    def get_other_user(self, user):
        return self.customer if user == self.vendor else self.vendor
    
    def get_unread_count(self, user):
        other_user = self.get_other_user(user)
        return self.messages.filter(sender=other_user, status__in=['sent', 'delivered']).count()

    def __str__(self):
        return f"Conv: {self.vendor.username} <-> {self.customer.username}"

class Message(models.Model):
    STATUS_CHOICES = [
        ('sending', 'Sending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('failed', 'Failed')
    ]
    
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('file', 'File'),
        ('quote', 'Quote'),
        ('booking_update', 'Booking Update'),
        ('system', 'System')
    ]
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey('authentication.CustomUser', on_delete=models.CASCADE)
    content = models.TextField(max_length=1000, blank=True)
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='sending')
    created_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    message_id = models.CharField(max_length=50, unique=True, default='')
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    retry_count = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['conversation', '-created_at']),
            models.Index(fields=['conversation', 'status']),
            models.Index(fields=['message_id']),
            models.Index(fields=['message_type']),
        ]

    def save(self, *args, **kwargs):
        if not self.message_id:
            self.message_id = str(uuid.uuid4())
        super().save(*args, **kwargs)
        self.conversation.last_message_at = self.created_at
        self.conversation.save(update_fields=['last_message_at'])

    def mark_delivered(self):
        if self.status == 'sent':
            self.status = 'delivered'
            self.delivered_at = timezone.now()
            self.save(update_fields=['status', 'delivered_at'])
    
    def mark_read(self):
        if self.status in ['sent', 'delivered']:
            self.status = 'read'
            self.read_at = timezone.now()
            self.save(update_fields=['status', 'read_at'])

    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}"

def upload_path(instance, filename):
    return f'chat_files/{instance.message.conversation.id}/{uuid.uuid4()}{os.path.splitext(filename)[1]}'

class MessageAttachment(models.Model):
    FILE_TYPES = [
        ('image', 'Image'),
        ('document', 'Document'),
        ('video', 'Video'),
        ('audio', 'Audio')
    ]
    
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to=upload_path)
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=20, choices=FILE_TYPES)
    mime_type = models.CharField(max_length=100)
    thumbnail = models.ImageField(upload_to='chat_thumbnails/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} - {self.message.id}"

class ConversationContext(models.Model):
    conversation = models.OneToOneField(Conversation, on_delete=models.CASCADE, related_name='context')
    event_id = models.IntegerField(null=True, blank=True)
    event_title = models.CharField(max_length=200, blank=True)
    event_date = models.DateTimeField(null=True, blank=True)
    event_budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    booking_status = models.CharField(max_length=50, default='inquiry')
    service_category = models.CharField(max_length=100, blank=True)
    requirements = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    def __str__(self):
        return f"Context for {self.conversation}"