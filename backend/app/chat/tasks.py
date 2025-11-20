try:
    from celery import shared_task
except ImportError:
    def shared_task(func):
        return func
from django.contrib.auth import get_user_model
from .models import Message
import logging
try:
    import redis
except ImportError:
    redis = None

logger = logging.getLogger(__name__)
User = get_user_model()
redis_client = redis.Redis(host='localhost', port=6379, db=1) if redis else None

@shared_task
def send_push_notification(message_id):
    """Send push notification for offline recipients"""
    try:
        message = Message.objects.select_related('conversation', 'sender').get(id=message_id)
        conversation = message.conversation

        # Determine recipient
        if message.sender == conversation.vendor:
            recipient = conversation.customer
        else:
            recipient = conversation.vendor

        # Check if recipient is online via Redis presence
        is_online = redis_client.exists(f"presence:{recipient.id}")
        
        if not is_online:
            # Send push notification only if user is offline
            logger.info(f"Sending push notification to {recipient.username} for message {message.id}")
            
            # Store notification in Redis for delivery when user comes online
            notification_data = {
                'message_id': message.id,
                'sender_username': message.sender.username,
                'content': message.content[:100],
                'conversation_id': conversation.id,
                'created_at': message.created_at.isoformat(),
            }
            
            redis_client.lpush(f"notifications:{recipient.id}", str(notification_data))
            redis_client.expire(f"notifications:{recipient.id}", 86400)  # 24 hours
            
            # Example: integrate with FCM, APNs, etc.
            # from firebase_admin import messaging
            # push_message = messaging.Message(
            #     notification=messaging.Notification(
            #         title=f"New message from {message.sender.username}",
            #         body=message.content[:100],
            #     ),
            #     token=recipient.fcm_token,  # Assuming user has fcm_token field
            # )
            # messaging.send(push_message)
        else:
            logger.debug(f"User {recipient.username} is online, skipping push notification")

    except Message.DoesNotExist:
        logger.error(f"Message {message_id} not found")
    except Exception as e:
        logger.error(f"Error sending push notification: {e}")

@shared_task
def cleanup_old_messages():
    """Clean up old messages and notifications"""
    from django.utils import timezone
    from datetime import timedelta
    
    # Archive messages older than 1 year
    cutoff_date = timezone.now() - timedelta(days=365)
    old_messages = Message.objects.filter(created_at__lt=cutoff_date)
    count = old_messages.count()
    
    if count > 0:
        logger.info(f"Archiving {count} old messages")
        # In production, move to archive table instead of delete
        # old_messages.delete()
    
    return f"Processed {count} old messages"