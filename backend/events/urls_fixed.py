from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, QuoteRequestViewSet, RSVPViewSet, event_milestones
from .secure_views import (
    secure_events_list, secure_events_create, secure_event_detail, 
    secure_event_update, secure_event_delete
)

# FIXED: Secure router with authentication
router = DefaultRouter()
router.register(r'', EventViewSet, basename='event')  # /api/events/
router.register(r'quotes', QuoteRequestViewSet, basename='quote')  # /api/events/quotes/
router.register(r'rsvps', RSVPViewSet, basename='rsvp')  # /api/events/rsvps/

urlpatterns = [
    # Secure event endpoints (FIXED: Authentication required)
    path('', secure_events_list, name='events-list'),
    path('create/', secure_events_create, name='events-create'),
    path('<int:event_id>/', secure_event_detail, name='event-detail'),
    path('<int:event_id>/update/', secure_event_update, name='event-update'),
    path('<int:event_id>/delete/', secure_event_delete, name='event-delete'),
    
    # Milestones (FIXED: Authentication required)
    path('<int:event_id>/milestones/', event_milestones, name='event-milestones'),
    
    # Include router for additional endpoints
    path('api/', include(router.urls)),
]