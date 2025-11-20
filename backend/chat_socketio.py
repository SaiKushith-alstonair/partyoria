import os
import django
import socketio
import eventlet
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from app.chat.models import Conversation, Message
from authentication.models import CustomUser

# Create Socket.IO server
sio = socketio.Server(cors_allowed_origins="*", logger=True, engineio_logger=True)

@sio.event
def connect(sid, environ):
    print(f'Client {sid} connected')
    sio.emit('connected', {'status': 'Connected to chat server'}, room=sid)

@sio.event
def join_conversation(sid, data):
    try:
        conversation_id = data['conversation_id']
        user_id = data['user_id']
        
        # Verify user is part of conversation
        conversation = Conversation.objects.get(id=conversation_id)
        user = CustomUser.objects.get(id=user_id)
        
        if user in [conversation.vendor, conversation.customer]:
            sio.enter_room(sid, f'conv_{conversation_id}')
            print(f'User {user.username} joined conversation {conversation_id}')
            sio.emit('joined_conversation', {
                'conversation_id': conversation_id,
                'status': 'success'
            }, room=sid)
        else:
            sio.emit('error', {'message': 'Not authorized for this conversation'}, room=sid)
            
    except Exception as e:
        print(f'Error joining conversation: {e}')
        sio.emit('error', {'message': str(e)}, room=sid)

@sio.event
def send_message(sid, data):
    try:
        conversation_id = data['conversation_id']
        sender_id = data['sender_id']
        content = data['content']
        
        # Get conversation and sender
        conversation = Conversation.objects.get(id=conversation_id)
        sender = CustomUser.objects.get(id=sender_id)
        
        # Verify sender is part of conversation
        if sender not in [conversation.vendor, conversation.customer]:
            sio.emit('error', {'message': 'Not authorized to send messages'}, room=sid)
            return
        
        # Create message
        message = Message.objects.create(
            conversation=conversation,
            sender=sender,
            content=content,
            message_type='text'
        )
        
        # Update conversation timestamp
        conversation.save()
        
        # Broadcast message to conversation room
        message_data = {
            'id': message.id,
            'conversation_id': conversation_id,
            'sender_id': sender.id,
            'sender_username': sender.username,
            'content': message.content,
            'message_type': message.message_type,
            'created_at': message.created_at.isoformat(),
            'delivered': message.delivered,
            'read': message.read
        }
        
        sio.emit('new_message', message_data, room=f'conv_{conversation_id}')
        print(f'Message sent in conversation {conversation_id} by {sender.username}')
        
    except Exception as e:
        print(f'Error sending message: {e}')
        sio.emit('error', {'message': str(e)}, room=sid)

@sio.event
def mark_messages_read(sid, data):
    try:
        conversation_id = data['conversation_id']
        user_id = data['user_id']
        
        # Mark all messages as read for this user
        conversation = Conversation.objects.get(id=conversation_id)
        user = CustomUser.objects.get(id=user_id)
        
        if user in [conversation.vendor, conversation.customer]:
            # Mark messages from other user as read
            other_user = conversation.customer if user == conversation.vendor else conversation.vendor
            Message.objects.filter(
                conversation=conversation,
                sender=other_user,
                read=False
            ).update(read=True)
            
            sio.emit('messages_marked_read', {
                'conversation_id': conversation_id,
                'status': 'success'
            }, room=f'conv_{conversation_id}')
            
    except Exception as e:
        print(f'Error marking messages as read: {e}')
        sio.emit('error', {'message': str(e)}, room=sid)

@sio.event
def get_conversation_messages(sid, data):
    try:
        conversation_id = data['conversation_id']
        user_id = data['user_id']
        
        conversation = Conversation.objects.get(id=conversation_id)
        user = CustomUser.objects.get(id=user_id)
        
        if user in [conversation.vendor, conversation.customer]:
            messages = Message.objects.filter(conversation=conversation).order_by('created_at')
            
            messages_data = []
            for message in messages:
                messages_data.append({
                    'id': message.id,
                    'sender_id': message.sender.id,
                    'sender_username': message.sender.username,
                    'content': message.content,
                    'message_type': message.message_type,
                    'created_at': message.created_at.isoformat(),
                    'delivered': message.delivered,
                    'read': message.read
                })
            
            sio.emit('conversation_messages', {
                'conversation_id': conversation_id,
                'messages': messages_data
            }, room=sid)
            
    except Exception as e:
        print(f'Error getting messages: {e}')
        sio.emit('error', {'message': str(e)}, room=sid)

@sio.event
def disconnect(sid):
    print(f'Client {sid} disconnected')

# Create WSGI app (available for import)
app = socketio.WSGIApp(sio)

if __name__ == '__main__':
    # Start server
    print('Starting Socket.IO server on port 8001...')
    eventlet.wsgi.server(eventlet.listen(('', 8001)), app)