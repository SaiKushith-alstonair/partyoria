import pytest
import json
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from ..models import Conversation, Message
from ..serializers import ConversationSerializer, MessageSerializer

User = get_user_model()

@pytest.mark.django_db
class ChatAPITestCase(TestCase):
    def setUp(self):
        self.vendor = User.objects.create_user(username='vendor', password='pass', user_type='vendor')
        self.customer = User.objects.create_user(username='customer', password='pass', user_type='customer')
        self.other_user = User.objects.create_user(username='other', password='pass', user_type='customer')

        self.conversation = Conversation.objects.create(vendor=self.vendor, customer=self.customer)

        self.client = APIClient()

    def test_create_message_via_api(self):
        # Test creating message via REST API
        self.client.force_authenticate(user=self.vendor)
        
        data = {
            'conversation': self.conversation.id,
            'content': 'Hello customer',
            'message_type': 'text'
        }
        
        response = self.client.post('/chat/api/messages/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check message persisted
        message = Message.objects.get(conversation=self.conversation, sender=self.vendor)
        self.assertEqual(message.content, 'Hello customer')
        self.assertEqual(message.message_type, 'text')

    def test_conversation_permission_check(self):
        # Try to access conversation not belonging to user
        self.client.force_authenticate(user=self.other_user)
        
        response = self.client.get(f'/chat/api/conversations/{self.conversation.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_mark_messages_read(self):
        # Create a message
        message = Message.objects.create(
            conversation=self.conversation,
            sender=self.customer,
            content='Test message',
        )

        # Vendor marks messages as read via API
        self.client.force_authenticate(user=self.vendor)
        response = self.client.post(f'/chat/api/conversations/{self.conversation.id}/mark_read/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Message should be marked read
        message.refresh_from_db()
        self.assertTrue(message.read)

    def test_get_conversation_messages(self):
        # Create messages
        Message.objects.create(
            conversation=self.conversation,
            sender=self.vendor,
            content='Message 1',
        )
        Message.objects.create(
            conversation=self.conversation,
            sender=self.customer,
            content='Message 2',
        )

        # Get messages via API
        self.client.force_authenticate(user=self.vendor)
        response = self.client.get(f'/chat/api/conversations/{self.conversation.id}/messages/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_conversation_serializer(self):
        # Test conversation serialization
        serializer = ConversationSerializer(self.conversation, context={'request': type('obj', (object,), {'user': self.vendor})})
        data = serializer.data
        
        self.assertEqual(data['id'], self.conversation.id)
        self.assertEqual(data['vendor']['id'], self.vendor.id)
        self.assertEqual(data['customer']['id'], self.customer.id)

    def test_conversation_list_filtering(self):
        """Test conversations are filtered by user"""
        # Create another conversation with different users
        other_vendor = User.objects.create_user(username='vendor2', password='pass', user_type='vendor')
        other_customer = User.objects.create_user(username='customer2', password='pass', user_type='customer')
        other_conversation = Conversation.objects.create(vendor=other_vendor, customer=other_customer)
        
        # Vendor should only see their conversations
        self.client.force_authenticate(user=self.vendor)
        response = self.client.get('/chat/api/conversations/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        conversation_ids = [conv['id'] for conv in response.data.get('results', response.data)]
        self.assertIn(self.conversation.id, conversation_ids)
        self.assertNotIn(other_conversation.id, conversation_ids)

    def test_message_ordering(self):
        """Test messages maintain correct order"""
        # Create messages
        messages = []
        for i in range(5):
            msg = Message.objects.create(
                conversation=self.conversation,
                sender=self.vendor,
                content=f'Message {i}'
            )
            messages.append(msg)
        
        # Verify messages are in correct order
        ordered_messages = Message.objects.filter(conversation=self.conversation).order_by('created_at')
        for i, msg in enumerate(ordered_messages):
            self.assertEqual(msg.content, f'Message {i}')

    def test_message_validation(self):
        """Test message content validation"""
        self.client.force_authenticate(user=self.vendor)
        
        # Test empty content
        data = {
            'conversation': self.conversation.id,
            'content': '',
            'message_type': 'text'
        }
        
        response = self.client.post('/chat/api/messages/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_conversation_creation(self):
        """Test creating new conversation"""
        new_customer = User.objects.create_user(username='newcustomer', password='pass', user_type='customer')
        
        self.client.force_authenticate(user=self.vendor)
        data = {
            'vendor': self.vendor.id,
            'customer': new_customer.id
        }
        
        response = self.client.post('/chat/api/conversations/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify conversation was created
        conversation = Conversation.objects.get(vendor=self.vendor, customer=new_customer)
        self.assertIsNotNone(conversation)

    def test_duplicate_conversation_prevention(self):
        """Test prevention of duplicate conversations"""
        # Try to create duplicate conversation
        self.client.force_authenticate(user=self.vendor)
        data = {
            'vendor': self.vendor.id,
            'customer': self.customer.id
        }
        
        response = self.client.post('/chat/api/conversations/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Should still only have one conversation
        conversations = Conversation.objects.filter(vendor=self.vendor, customer=self.customer)
        self.assertEqual(conversations.count(), 1)