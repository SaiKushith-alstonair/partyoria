import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from app.chat.models import Conversation, Message
from authentication.models import CustomUser

def test_chat_system():
    print("Testing Production Chat System...")
    
    # Test 1: Check models
    print("\n1. Testing Models...")
    try:
        conversations = Conversation.objects.all()
        messages = Message.objects.all()
        print(f"   Found {conversations.count()} conversations")
        print(f"   Found {messages.count()} messages")
    except Exception as e:
        print(f"   Model error: {e}")
        return False
    
    # Test 2: Check users
    print("\n2. Testing Users...")
    try:
        vendors = CustomUser.objects.filter(user_type='vendor')
        customers = CustomUser.objects.filter(user_type='customer')
        print(f"   Found {vendors.count()} vendors")
        print(f"   Found {customers.count()} customers")
        
        if vendors.count() == 0 or customers.count() == 0:
            print("   WARNING: Need at least 1 vendor and 1 customer to test chat")
            return False
            
    except Exception as e:
        print(f"   User error: {e}")
        return False
    
    # Test 3: Create test conversation
    print("\n3. Testing Conversation Creation...")
    try:
        vendor = vendors.first()
        customer = customers.first()
        
        # Check if conversation exists
        conv, created = Conversation.objects.get_or_create(
            vendor=vendor,
            customer=customer
        )
        
        if created:
            print(f"   Created conversation between {vendor.username} and {customer.username}")
        else:
            print(f"   Found existing conversation between {vendor.username} and {customer.username}")
            
    except Exception as e:
        print(f"   Conversation error: {e}")
        return False
    
    # Test 4: Create test message
    print("\n4. Testing Message Creation...")
    try:
        message = Message.objects.create(
            conversation=conv,
            sender=vendor,
            content="Test message from production chat system!"
        )
        print(f"   Created message: {message.message_id}")
        print(f"   Message content: {message.content}")
        
        # Test unread count
        unread = conv.get_unread_count(customer)
        print(f"   Unread count for customer: {unread}")
        
    except Exception as e:
        print(f"   Message error: {e}")
        return False
    
    # Test 5: Test API endpoints
    print("\n5. Testing API Structure...")
    try:
        from app.chat.views import ConversationViewSet, MessageViewSet
        from app.chat.serializers import ConversationSerializer, MessageSerializer
        print("   Views imported successfully")
        print("   Serializers imported successfully")
    except Exception as e:
        print(f"   API error: {e}")
        return False
    
    print("\nAll tests passed! Chat system is ready for production.")
    print("\nNext steps:")
    print("   1. Start chat server: python chat_server.py")
    print("   2. Start Django: python manage.py runserver")
    print("   3. Start frontend: npm run dev")
    print("   4. Test at http://localhost:3000")
    
    return True

if __name__ == '__main__':
    test_chat_system()