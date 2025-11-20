from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.apps import apps
from .services import CustomerNotifications, VendorNotifications, MessageNotifications

@receiver(post_save, sender='chat.Message')
def create_message_notification(sender, instance, created, **kwargs):
    """Create notification when new message is sent"""
    if created and instance.message_type == 'text':
        conversation = instance.conversation
        recipient = conversation.get_other_user(instance.sender)
        
        # Get event type from conversation context
        event_type = "your event"
        if hasattr(conversation, 'context') and conversation.context:
            event_type = getattr(conversation.context, 'event_title', 'your event')
        
        MessageNotifications.new_message(
            recipient=recipient,
            sender_name=instance.sender.username,
            event_type=event_type,
            conversation_id=conversation.id
        )

@receiver(post_save, sender='events.QuoteRequest')
def create_quote_notifications(sender, instance, created, **kwargs):
    """Create notifications for quote requests"""
    if created:
        # Notify vendor of new quote request
        if hasattr(instance, 'vendor') and instance.vendor:
            VendorNotifications.new_quote_request(
                vendor=instance.vendor,
                customer_name=instance.customer.username,
                event_type=getattr(instance, 'event_type', 'Event'),
                event_date=str(getattr(instance, 'event_date', 'TBD')),
                quote_id=instance.id
            )
    
    elif instance.status == 'accepted':
        # Notify customer when quote is accepted
        CustomerNotifications.quote_received(
            customer=instance.customer,
            vendor_name=instance.vendor.username if hasattr(instance, 'vendor') else 'Vendor',
            amount=float(getattr(instance, 'quoted_amount', 0)),
            event_type=getattr(instance, 'event_type', 'Event'),
            quote_id=instance.id
        )