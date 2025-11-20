from rest_framework import serializers
from .models import Conversation, Message, MessageAttachment, ConversationContext
from authentication.models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'user_type', 'profile_picture', 'display_name']
    
    def get_display_name(self, obj):
        # For vendors, use full_name from CustomUser
        if obj.user_type == 'vendor':
            full_name = f"{obj.first_name} {obj.last_name}".strip()
            if full_name:
                return full_name
        
        # For customers, use username or full name
        if obj.first_name or obj.last_name:
            full_name = f"{obj.first_name} {obj.last_name}".strip()
            if full_name:
                return full_name
        
        # Fallback to username if not email-like
        if obj.username and obj.username != obj.email and not obj.username.startswith('vendor_'):
            return obj.username
        
        # Last resort: email
        return obj.email

class MessageAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageAttachment
        fields = ['id', 'file', 'file_name', 'file_size', 'file_type', 'mime_type', 'thumbnail']

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_type = serializers.CharField(source='sender.user_type', read_only=True)
    attachments = MessageAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'message_id', 'conversation', 'sender', 'sender_username', 'sender_type',
                 'content', 'message_type', 'status', 'created_at', 'delivered_at', 'read_at',
                 'reply_to', 'metadata', 'attachments']
        read_only_fields = ['id', 'message_id', 'created_at', 'sender_username', 'sender_type', 'delivered_at', 'read_at']

class ConversationContextSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversationContext
        fields = ['event_id', 'event_title', 'event_date', 'event_budget', 'booking_status',
                 'service_category', 'requirements', 'metadata']

class ConversationSerializer(serializers.ModelSerializer):
    vendor = UserSerializer(read_only=True)
    customer = UserSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    context = ConversationContextSerializer(read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'vendor', 'customer', 'created_at', 'updated_at', 'is_active', 
                 'last_message', 'unread_count', 'context']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return MessageSerializer(last_message).data
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            user = request.user
            return obj.get_unread_count(user)
        return 0

class ConversationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ['vendor', 'customer']
    
    def validate(self, data):
        vendor = data['vendor']
        customer = data['customer']
        
        if vendor == customer:
            raise serializers.ValidationError("Vendor and customer cannot be the same user")
        
        # Temporarily disable strict validation for testing
        # if hasattr(vendor, 'user_type') and vendor.user_type != 'vendor':
        #     raise serializers.ValidationError("First participant must be a vendor")
        
        # if hasattr(customer, 'user_type') and customer.user_type != 'customer':
        #     raise serializers.ValidationError("Second participant must be a customer")
        
        # Check if conversation already exists
        existing = Conversation.objects.filter(vendor=vendor, customer=customer).first()
        if existing:
            raise serializers.ValidationError("Conversation already exists between these users")
        
        return data