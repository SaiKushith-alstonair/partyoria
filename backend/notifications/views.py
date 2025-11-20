from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import TokenAuthentication
from django.db.models import Q
from .models import Notification, NotificationPreference
from .serializers import NotificationSerializer, NotificationPreferenceSerializer, MarkAsReadSerializer
from .services import NotificationService

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = []
    authentication_classes = [JWTAuthentication, TokenAuthentication]
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Notification.objects.filter(recipient=self.request.user)
        return Notification.objects.none()
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get unread notification count"""
        if not request.user.is_authenticated:
            return Response({'unread_count': 0})
        count = NotificationService.get_unread_count(request.user)
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['post'])
    def mark_as_read(self, request):
        """Mark notifications as read"""
        serializer = MarkAsReadSerializer(data=request.data)
        if serializer.is_valid():
            notification_ids = serializer.validated_data['notification_ids']
            count = NotificationService.mark_as_read(notification_ids, request.user)
            return Response({
                'status': 'success',
                'marked_count': count
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        notifications = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        )
        count = notifications.count()
        notifications.update(is_read=True)
        
        return Response({
            'status': 'success',
            'marked_count': count
        })
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent notifications (last 50)"""
        if not request.user.is_authenticated:
            return Response([])
        notifications = self.get_queryset()[:50]
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get notifications by type"""
        notification_type = request.query_params.get('type')
        if not notification_type:
            return Response({'error': 'Type parameter required'}, status=400)
        
        notifications = self.get_queryset().filter(notification_type=notification_type)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def priority(self, request):
        """Get notifications by priority"""
        priority = request.query_params.get('priority', 'high')
        notifications = self.get_queryset().filter(priority=priority)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationPreferenceSerializer
    permission_classes = []
    authentication_classes = [JWTAuthentication, TokenAuthentication]
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return NotificationPreference.objects.filter(user=self.request.user)
        return NotificationPreference.objects.none()
    
    def get_object(self):
        """Get or create user preferences"""
        obj, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return obj
    
    @action(detail=False, methods=['get'])
    def my_preferences(self, request):
        """Get current user preferences"""
        if not request.user.is_authenticated:
            return Response({'email_notifications': True, 'push_notifications': True})
        preferences = self.get_object()
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_preferences(self, request):
        """Update user preferences"""
        preferences = self.get_object()
        serializer = self.get_serializer(preferences, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)