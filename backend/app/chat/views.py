from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import TokenAuthentication, BaseAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from django.core.paginator import Paginator
from django.utils import timezone
from authentication.models import CustomUser
from .models import Conversation, Message, MessageAttachment, ConversationContext
from .serializers import ConversationSerializer, MessageSerializer, ConversationCreateSerializer, UserSerializer, MessageAttachmentSerializer
import jwt
from django.conf import settings
import mimetypes
import os

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication, TokenAuthentication]
    
    def get_queryset(self):
        user = self.request.user
        query = Q(vendor=user) | Q(customer=user)
        return Conversation.objects.filter(query).select_related(
            'vendor', 'customer'
        ).prefetch_related('messages').order_by('-last_message_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ConversationCreateSerializer
        return ConversationSerializer
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        page = int(request.GET.get('page', 1))
        page_size = 50
        
        messages = conversation.messages.select_related('sender').order_by('-created_at')
        paginator = Paginator(messages, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = MessageSerializer(list(reversed(page_obj.object_list)), many=True)
        return Response({
            'results': serializer.data,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'total_pages': paginator.num_pages
        })
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        conversation = self.get_object()
        user = request.user
        
        # Mark messages from other user as read
        other_user = conversation.get_other_user(user)
        messages = Message.objects.filter(
            conversation=conversation,
            sender=other_user,
            status__in=['sent', 'delivered']
        )
        
        updated_count = 0
        for message in messages:
            message.mark_read()
            updated_count += 1
        
        return Response({
            'status': 'success',
            'marked_read': updated_count
        })
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search messages across all conversations"""
        query = request.GET.get('q', '').strip()
        if not query:
            return Response({'results': []})
        
        user = request.user
        conversations = self.get_queryset()
        
        messages = Message.objects.filter(
            conversation__in=conversations,
            content__icontains=query
        ).select_related('sender', 'conversation').order_by('-created_at')[:50]
        
        results = []
        for message in messages:
            results.append({
                'message': MessageSerializer(message).data,
                'conversation': {
                    'id': message.conversation.id,
                    'other_user': UserSerializer(message.conversation.get_other_user(user)).data
                }
            })
        
        return Response({'results': results})
    
    @action(detail=True, methods=['post'])
    def update_context(self, request, pk=None):
        """Update conversation context"""
        conversation = self.get_object()
        context, created = ConversationContext.objects.get_or_create(conversation=conversation)
        
        for field in ['event_id', 'event_title', 'event_date', 'event_budget', 
                     'booking_status', 'service_category', 'requirements', 'metadata']:
            if field in request.data:
                setattr(context, field, request.data[field])
        
        context.save()
        return Response({'status': 'success'})
    
    @action(detail=True, methods=['post'])
    def quick_action(self, request, pk=None):
        """Handle quick actions like quotes, booking updates"""
        conversation = self.get_object()
        action_type = request.data.get('action_type')
        
        if action_type == 'send_quote':
            message = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=f"Quote: ${request.data.get('amount', 0)}",
                message_type='quote',
                metadata=request.data.get('quote_data', {})
            )
        elif action_type == 'update_booking':
            message = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=f"Booking updated: {request.data.get('status', '')}",
                message_type='booking_update',
                metadata=request.data.get('booking_data', {})
            )
        else:
            return Response({'error': 'Invalid action type'}, status=400)
        
        return Response(MessageSerializer(message).data)
    
    @action(detail=True, methods=['delete'])
    def clear_my_messages(self, request, pk=None):
        """Clear only messages sent by the current user"""
        conversation = self.get_object()
        user_messages = conversation.messages.filter(sender=request.user)
        deleted_count = user_messages.count()
        user_messages.delete()
        
        # Update last_message_at if there are remaining messages
        remaining_messages = conversation.messages.order_by('-created_at')
        if remaining_messages.exists():
            conversation.last_message_at = remaining_messages.first().created_at
        else:
            conversation.last_message_at = timezone.now()
        conversation.save()
        
        return Response({
            'status': 'success',
            'deleted_count': deleted_count
        })
    
    @action(detail=False, methods=['get'])
    def available_users(self, request):
        """Get users available to chat with based on current user type"""
        if request.user.is_authenticated:
            current_user = request.user
            if current_user.user_type == 'customer':
                users = CustomUser.objects.filter(user_type='vendor', is_active=True).distinct()
                serializer = UserSerializer(users, many=True)
                return Response(serializer.data)
                
            elif current_user.user_type == 'vendor':
                # Get customers (no duplicates here)
                users = CustomUser.objects.filter(user_type='customer').distinct()
                serializer = UserSerializer(users, many=True)
                return Response(serializer.data)
            else:
                return Response([])
        else:
            return Response([])

class MessageAttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = MessageAttachmentSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication, TokenAuthentication]
    
    def get_queryset(self):
        user = self.request.user
        return MessageAttachment.objects.filter(
            message__conversation__in=Conversation.objects.filter(
                Q(vendor=user) | Q(customer=user)
            )
        ).select_related('message')

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication, TokenAuthentication]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        user = self.request.user
        query = Q(vendor=user) | Q(customer=user)
        accessible_conversations = Conversation.objects.filter(query)
        
        return Message.objects.filter(
            conversation__in=accessible_conversations
        ).select_related('sender', 'conversation').prefetch_related('attachments').order_by('-created_at')
    
    def perform_create(self, serializer):
        message = serializer.save(sender=self.request.user, status='sent')
        
        # Handle file attachments
        files = self.request.FILES.getlist('files')
        for file in files:
            file_type = self.get_file_type(file.content_type)
            MessageAttachment.objects.create(
                message=message,
                file=file,
                file_name=file.name,
                file_size=file.size,
                file_type=file_type,
                mime_type=file.content_type
            )
    
    def get_file_type(self, mime_type):
        if mime_type.startswith('image/'):
            return 'image'
        elif mime_type.startswith('video/'):
            return 'video'
        elif mime_type.startswith('audio/'):
            return 'audio'
        else:
            return 'document'
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update message status"""
        message = self.get_object()
        new_status = request.data.get('status')
        
        if new_status == 'delivered':
            message.mark_delivered()
        elif new_status == 'read':
            message.mark_read()
        elif new_status == 'failed':
            message.status = 'failed'
            message.save()
        
        return Response(MessageSerializer(message).data)
    
    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """Retry failed message"""
        message = self.get_object()
        if message.status == 'failed' and message.retry_count < 3:
            message.status = 'sending'
            message.retry_count += 1
            message.save()
            return Response({'status': 'retrying'})
        return Response({'error': 'Cannot retry'}, status=400)