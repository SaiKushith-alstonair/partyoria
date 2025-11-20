from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConversationViewSet, MessageViewSet
from partyoria.security_core import require_auth

# FIXED: Secure router with authentication
router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageViewSet, basename='message')

# FIXED: All chat endpoints require authentication
urlpatterns = [
    path('', include(router.urls)),
]

# Apply authentication to all router URLs
for pattern in router.urls:
    if hasattr(pattern.callback, 'cls'):
        # Apply authentication to ViewSet methods
        pattern.callback.cls.permission_classes = [require_auth]