from django.utils import timezone
from django.template import Template, Context
from .models import Notification, NotificationPreference, NotificationTemplate
from authentication.models import CustomUser
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    
    @staticmethod
    def create_notification(
        recipient: CustomUser,
        notification_type: str,
        context: Dict[str, Any] = None,
        priority: str = 'medium',
        action_url: str = None,
        related_object_type: str = None,
        related_object_id: str = None
    ) -> Optional[Notification]:
        """Create and send notification"""
        
        if context is None:
            context = {}
            
        # Check user preferences
        prefs = NotificationPreference.objects.filter(user=recipient).first()
        if prefs and not prefs.enable_in_app:
            return None
            
        # Check type-specific preferences
        if not NotificationService._should_send_notification(prefs, notification_type):
            return None
            
        # Get or create template
        template = NotificationTemplate.objects.filter(notification_type=notification_type).first()
        if not template:
            template = NotificationService._create_default_template(notification_type)
            
        # Render notification content
        try:
            title, message, template_action_url = template.render(context)
            final_action_url = action_url or template_action_url
        except Exception as e:
            logger.error(f"Error rendering notification template {notification_type}: {e}")
            return None
            
        # Create notification
        notification = Notification.objects.create(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            action_url=final_action_url,
            related_object_type=related_object_type,
            related_object_id=str(related_object_id) if related_object_id else None,
            metadata=context
        )
        
        # Mark as delivered (in-app)
        notification.mark_as_delivered()
        
        logger.info(f"Created notification {notification.id} for {recipient.username}")
        return notification
    
    @staticmethod
    def _should_send_notification(prefs: NotificationPreference, notification_type: str) -> bool:
        """Check if notification should be sent based on preferences"""
        if not prefs:
            return True
            
        type_mapping = {
            'quote_received': 'quote_notifications',
            'quote_accepted': 'quote_notifications',
            'quote_rejected': 'quote_notifications',
            'new_quote_request': 'quote_notifications',
            'booking_confirmed': 'booking_notifications',
            'booking_cancelled': 'booking_notifications',
            'new_booking': 'booking_notifications',
            'payment_due': 'payment_notifications',
            'payment_received': 'payment_notifications',
            'new_message': 'message_notifications',
            'customer_message': 'message_notifications',
            'promotion': 'marketing_notifications',
            'referral_reward': 'marketing_notifications',
            'system_maintenance': 'system_notifications',
            'security_alert': 'system_notifications',
        }
        
        pref_field = type_mapping.get(notification_type, 'system_notifications')
        return getattr(prefs, pref_field, True)
    
    @staticmethod
    def _create_default_template(notification_type: str) -> NotificationTemplate:
        """Create default template for notification type"""
        templates = {
            'quote_received': {
                'title': 'New Quote Received',
                'message': 'You received a quote of ${amount} from {vendor_name} for your {event_type} event.',
                'action_url': '/dashboard/quotes/{quote_id}'
            },
            'quote_accepted': {
                'title': 'Quote Accepted!',
                'message': '{customer_name} accepted your quote of ${amount} for {event_type}.',
                'action_url': '/vendor/bookings/{booking_id}'
            },
            'new_quote_request': {
                'title': 'New Quote Request',
                'message': '{customer_name} requested a quote for {event_type} on {event_date}.',
                'action_url': '/vendor/quotes/{quote_id}'
            },
            'booking_confirmed': {
                'title': 'Booking Confirmed',
                'message': 'Your booking with {vendor_name} for {event_type} is confirmed for {event_date}.',
                'action_url': '/dashboard/bookings/{booking_id}'
            },
            'payment_due': {
                'title': 'Payment Due',
                'message': 'Payment of ${amount} is due for your {event_type} booking.',
                'action_url': '/dashboard/payments/{payment_id}'
            },
            'new_message': {
                'title': 'New Message',
                'message': '{sender_name} sent you a message about {event_type}.',
                'action_url': '/chat/{conversation_id}'
            },
            'event_reminder': {
                'title': 'Event Reminder',
                'message': 'Your {event_type} event is {time_until} away!',
                'action_url': '/dashboard/events/{event_id}'
            },
            'review_received': {
                'title': 'New Review',
                'message': '{customer_name} left you a {rating}-star review.',
                'action_url': '/vendor/reviews'
            },
            'performance_summary': {
                'title': 'Weekly Performance',
                'message': 'You had {bookings_count} bookings and earned ${revenue} this week.',
                'action_url': '/vendor/analytics'
            }
        }
        
        template_data = templates.get(notification_type, {
            'title': 'Notification',
            'message': 'You have a new notification.',
            'action_url': '/dashboard'
        })
        
        return NotificationTemplate.objects.create(
            notification_type=notification_type,
            title_template=template_data['title'],
            message_template=template_data['message'],
            action_url_template=template_data.get('action_url', '')
        )
    
    @staticmethod
    def mark_as_read(notification_ids: List[str], user: CustomUser) -> int:
        """Mark notifications as read"""
        notifications = Notification.objects.filter(
            id__in=notification_ids,
            recipient=user,
            is_read=False
        )
        
        count = notifications.count()
        notifications.update(is_read=True, read_at=timezone.now())
        return count
    
    @staticmethod
    def get_unread_count(user: CustomUser) -> int:
        """Get unread notification count"""
        return Notification.objects.filter(recipient=user, is_read=False).count()
    
    @staticmethod
    def get_notifications(user: CustomUser, limit: int = 50, offset: int = 0) -> List[Notification]:
        """Get user notifications"""
        return list(Notification.objects.filter(recipient=user)[offset:offset+limit])

# Specific notification creators
class CustomerNotifications:
    
    @staticmethod
    def quote_received(customer: CustomUser, vendor_name: str, amount: float, event_type: str, quote_id: int):
        return NotificationService.create_notification(
            recipient=customer,
            notification_type='quote_received',
            context={
                'vendor_name': vendor_name,
                'amount': amount,
                'event_type': event_type,
                'quote_id': quote_id
            },
            priority='high',
            related_object_type='quote',
            related_object_id=quote_id
        )
    
    @staticmethod
    def booking_confirmed(customer: CustomUser, vendor_name: str, event_type: str, event_date: str, booking_id: int):
        return NotificationService.create_notification(
            recipient=customer,
            notification_type='booking_confirmed',
            context={
                'vendor_name': vendor_name,
                'event_type': event_type,
                'event_date': event_date,
                'booking_id': booking_id
            },
            priority='high',
            related_object_type='booking',
            related_object_id=booking_id
        )
    
    @staticmethod
    def payment_due(customer: CustomUser, amount: float, event_type: str, payment_id: int):
        return NotificationService.create_notification(
            recipient=customer,
            notification_type='payment_due',
            context={
                'amount': amount,
                'event_type': event_type,
                'payment_id': payment_id
            },
            priority='high',
            related_object_type='payment',
            related_object_id=payment_id
        )
    
    @staticmethod
    def event_reminder(customer: CustomUser, event_type: str, time_until: str, event_id: int):
        return NotificationService.create_notification(
            recipient=customer,
            notification_type='event_reminder',
            context={
                'event_type': event_type,
                'time_until': time_until,
                'event_id': event_id
            },
            priority='medium',
            related_object_type='event',
            related_object_id=event_id
        )

class VendorNotifications:
    
    @staticmethod
    def new_quote_request(vendor: CustomUser, customer_name: str, event_type: str, event_date: str, quote_id: int):
        return NotificationService.create_notification(
            recipient=vendor,
            notification_type='new_quote_request',
            context={
                'customer_name': customer_name,
                'event_type': event_type,
                'event_date': event_date,
                'quote_id': quote_id
            },
            priority='high',
            related_object_type='quote',
            related_object_id=quote_id
        )
    
    @staticmethod
    def quote_accepted(vendor: CustomUser, customer_name: str, amount: float, event_type: str, booking_id: int):
        return NotificationService.create_notification(
            recipient=vendor,
            notification_type='quote_accepted',
            context={
                'customer_name': customer_name,
                'amount': amount,
                'event_type': event_type,
                'booking_id': booking_id
            },
            priority='high',
            related_object_type='booking',
            related_object_id=booking_id
        )
    
    @staticmethod
    def payment_received(vendor: CustomUser, amount: float, customer_name: str, booking_id: int):
        return NotificationService.create_notification(
            recipient=vendor,
            notification_type='payment_received',
            context={
                'amount': amount,
                'customer_name': customer_name,
                'booking_id': booking_id
            },
            priority='medium',
            related_object_type='payment',
            related_object_id=booking_id
        )
    
    @staticmethod
    def review_received(vendor: CustomUser, customer_name: str, rating: int, review_id: int):
        return NotificationService.create_notification(
            recipient=vendor,
            notification_type='review_received',
            context={
                'customer_name': customer_name,
                'rating': rating,
                'review_id': review_id
            },
            priority='medium',
            related_object_type='review',
            related_object_id=review_id
        )
    
    @staticmethod
    def performance_summary(vendor: CustomUser, bookings_count: int, revenue: float):
        return NotificationService.create_notification(
            recipient=vendor,
            notification_type='performance_summary',
            context={
                'bookings_count': bookings_count,
                'revenue': revenue
            },
            priority='low'
        )

class MessageNotifications:
    
    @staticmethod
    def new_message(recipient: CustomUser, sender_name: str, event_type: str, conversation_id: int):
        return NotificationService.create_notification(
            recipient=recipient,
            notification_type='new_message',
            context={
                'sender_name': sender_name,
                'event_type': event_type,
                'conversation_id': conversation_id
            },
            priority='medium',
            related_object_type='conversation',
            related_object_id=conversation_id
        )