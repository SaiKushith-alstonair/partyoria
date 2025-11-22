import os
import django
import socketio
import jwt
from datetime import datetime
import logging
import redis
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from app.chat.models import Conversation, Message
from authentication.models import CustomUser
from django.conf import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Redis connection
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()
    logger.info("Redis connected successfully")
except:
    redis_client = None
    logger.warning("Redis not available - running without caching")

# Socket.IO server
sio = socketio.Server(
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
    ping_timeout=60,
    ping_interval=25
)

# Store user connections
user_connections = {}

def authenticate_user(token):
    """Authenticate user from JWT token"""
    try:
        if not token:
            return None
        
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        # Decode JWT to check payload first
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            logger.info(f"JWT payload: {payload}")
            
            # Get user_id from JWT
            user_id = payload.get('user_id')
            if user_id:
                try:
                    user = CustomUser.objects.get(id=user_id)
                    logger.info(f"JWT auth successful for user {user.username} (ID: {user.id}, Type: {user.user_type})")
                    return user
                except CustomUser.DoesNotExist:
                    logger.warning(f"User not found for user_id: {user_id}")
            
            logger.warning(f"No valid user found in JWT payload: {payload}")
                
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token expired")
        except jwt.InvalidTokenError as e:
            logger.warning(f"JWT invalid: {e}")
        except Exception as e:
            logger.warning(f"JWT decode error: {e}")
        

        
        # Fallback to token auth
        from rest_framework.authtoken.models import Token
        try:
            token_obj = Token.objects.get(key=token)
            logger.info(f"Token auth successful for user {token_obj.user.username} (ID: {token_obj.user.id})")
            return token_obj.user
        except Token.DoesNotExist:
            logger.warning("Token not found in database")
        except Exception as e:
            logger.warning(f"Token auth error: {e}")
            
        return None
    except Exception as e:
        logger.error(f"Auth error: {e}")
        return None

@sio.event
def connect(sid, environ, auth):
    """Handle client connection"""
    try:
        # Get token from auth parameter or query params
        token = None
        
        if auth and isinstance(auth, dict):
            token = auth.get('token')
        
        if not token:
            query_string = environ.get('QUERY_STRING', '')
            if 'token=' in query_string:
                token = query_string.split('token=')[1].split('&')[0]
        
        if not token:
            headers = environ.get('HTTP_AUTHORIZATION', '')
            if headers:
                token = headers
        
        user = authenticate_user(token)
        if not user:
            logger.warning(f"Unauthorized connection attempt: {sid}")
            return False
        
        # Check if user already has active connections
        existing_connections = [s for s, u_id in user_connections.items() if u_id == user.id]
        if len(existing_connections) >= 2:  # Allow max 2 connections per user
            logger.warning(f"User {user.username} already has {len(existing_connections)} connections, rejecting")
            return False
        
        # Store user connection
        user_connections[sid] = user.id
        
        # Join user to their personal room
        sio.enter_room(sid, f'user_{user.id}')
        
        # Update online status in Redis
        if redis_client:
            redis_client.setex(f'online_{user.id}', 300, '1')  # 5 min expiry
        
        logger.info(f"User {user.username} ({user.user_type}) connected: {sid} [Total connections: {len(existing_connections) + 1}]")
        sio.emit('connected', {'status': 'success', 'user_id': user.id}, room=sid)
        
    except Exception as e:
        logger.error(f"Connection error: {e}")
        return False

@sio.event
def join_conversation(sid, data):
    """Join a conversation room"""
    try:
        user_id = user_connections.get(sid)
        if not user_id:
            sio.emit('error', {'message': 'Not authenticated'}, room=sid)
            return
        
        conversation_id = data.get('conversation_id')
        if not conversation_id:
            sio.emit('error', {'message': 'Missing conversation_id'}, room=sid)
            return
        
        # Verify user is part of conversation
        conversation = Conversation.objects.select_related('vendor', 'customer').get(id=conversation_id)
        user = CustomUser.objects.get(id=user_id)
        
        if user not in [conversation.vendor, conversation.customer]:
            sio.emit('error', {'message': 'Not authorized'}, room=sid)
            return
        
        # Join conversation room
        room_name = f'conv_{conversation_id}'
        sio.enter_room(sid, room_name)
        
        # Mark messages as read
        other_user = conversation.get_other_user(user)
        messages = Message.objects.filter(
            conversation=conversation,
            sender=other_user,
            status__in=['sent', 'delivered']
        )
        for message in messages:
            message.mark_read()
        
        logger.info(f"User {user.username} joined conversation {conversation_id}")
        sio.emit('joined_conversation', {
            'conversation_id': conversation_id,
            'status': 'success'
        }, room=sid)
        
    except Exception as e:
        logger.error(f"Join conversation error: {e}")
        sio.emit('error', {'message': str(e)}, room=sid)

@sio.event
def send_message(sid, data):
    """Send a message"""
    try:
        user_id = user_connections.get(sid)
        if not user_id:
            sio.emit('error', {'message': 'Not authenticated'}, room=sid)
            return
        
        conversation_id = data.get('conversation_id')
        content = data.get('content', '').strip()
        temp_id = data.get('temp_id')
        
        if not conversation_id or not content:
            sio.emit('error', {'message': 'Missing data'}, room=sid)
            return
        
        if len(content) > 1000:
            sio.emit('error', {'message': 'Message too long'}, room=sid)
            return
        
        # Rate limiting check
        if redis_client:
            rate_key = f'rate_{user_id}'
            current_count = redis_client.get(rate_key) or 0
            if int(current_count) >= 10:  # 10 messages per minute
                sio.emit('error', {'message': 'Rate limit exceeded'}, room=sid)
                return
            redis_client.incr(rate_key)
            redis_client.expire(rate_key, 60)
        
        # Get conversation and user
        conversation = Conversation.objects.select_related('vendor', 'customer').get(id=conversation_id)
        user = CustomUser.objects.get(id=user_id)
        
        if user not in [conversation.vendor, conversation.customer]:
            sio.emit('error', {'message': 'Not authorized'}, room=sid)
            return
        
        # Create message
        message = Message.objects.create(
            conversation=conversation,
            sender=user,
            content=content,
            status='sent'
        )
        
        # Prepare message data
        message_data = {
            'id': message.id,
            'message_id': message.message_id,
            'conversation_id': conversation_id,
            'sender_id': user.id,
            'sender_username': user.username,
            'sender_type': user.user_type,
            'content': message.content,
            'created_at': message.created_at.isoformat(),
            'status': message.status,
            'temp_id': temp_id
        }
        
        # Broadcast to conversation room
        room_name = f'conv_{conversation_id}'
        sio.emit('new_message', message_data, room=room_name)
        
        # Send push notification to offline users
        other_user = conversation.get_other_user(user)
        if redis_client and not redis_client.get(f'online_{other_user.id}'):
            # Queue for push notification
            redis_client.lpush('push_queue', json.dumps({
                'user_id': other_user.id,
                'message': f"New message from {user.username}",
                'conversation_id': conversation_id
            }))
        
        logger.info(f"Message sent by {user.username} in conversation {conversation_id}")
        
    except Exception as e:
        logger.error(f"Send message error: {e}")
        sio.emit('error', {'message': str(e)}, room=sid)

@sio.event
def typing(sid, data):
    """Handle typing indicator"""
    try:
        user_id = user_connections.get(sid)
        if not user_id:
            return
        
        conversation_id = data.get('conversation_id')
        is_typing = data.get('is_typing', False)
        
        if not conversation_id:
            return
        
        user = CustomUser.objects.get(id=user_id)
        room_name = f'conv_{conversation_id}'
        
        sio.emit('user_typing', {
            'user_id': user_id,
            'username': user.username,
            'is_typing': is_typing
        }, room=room_name, skip_sid=sid)
        
    except Exception as e:
        logger.error(f"Typing error: {e}")

@sio.event
def disconnect(sid):
    """Handle client disconnect"""
    try:
        user_id = user_connections.get(sid)
        if user_id:
            # Remove connection
            del user_connections[sid]
            
            # Check if user has other active connections
            remaining_connections = [s for s, u_id in user_connections.items() if u_id == user_id]
            
            # Only mark offline if no other connections
            if not remaining_connections and redis_client:
                redis_client.delete(f'online_{user_id}')
            
            logger.info(f"User {user_id} disconnected: {sid} [Remaining connections: {len(remaining_connections)}]")
    except Exception as e:
        logger.error(f"Disconnect error: {e}")

# Create WSGI app
app = socketio.WSGIApp(sio)

if __name__ == '__main__':
    import eventlet
    print('Starting production chat server on port 8001...')
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 8001)), app)