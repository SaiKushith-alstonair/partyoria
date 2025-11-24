from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CalendarEventViewSet
from . import auth_views, dashboard_views, marketplace_views, calendar_views
from events.quote_views import vendor_quote_requests, quote_request_detail, submit_quote

router = DefaultRouter()
router.register(r'calendar-events', CalendarEventViewSet, basename='calendar-event')

urlpatterns = [
    # Customer-facing marketplace
    path('marketplace/', marketplace_views.vendor_marketplace, name='vendor-marketplace'),
    
    # Vendor authentication
    path('auth/register/', auth_views.VendorRegisterView.as_view(), name='vendor-register'),
    path('auth/login/', auth_views.VendorLoginView.as_view(), name='vendor-login'),
    path('auth/profile/', auth_views.vendor_profile, name='vendor-profile'),
    path('auth/token/refresh/', auth_views.vendor_token_refresh, name='vendor-token-refresh'),
    path('auth/complete-onboarding/', auth_views.complete_onboarding, name='complete-onboarding'),
    
    # Vendor dashboard
    path('dashboard/stats/', auth_views.vendor_dashboard_stats, name='vendor-dashboard-stats'),
    path('bookings/', dashboard_views.vendor_bookings, name='vendor-bookings'),
    path('services/', dashboard_views.vendor_services, name='vendor-services'),
    path('services/<int:service_id>/', dashboard_views.vendor_services, name='vendor-service-detail'),
    
    # Quote Management
    path('quote-requests/', vendor_quote_requests, name='vendor-quote-requests'),
    path('quote-requests/<int:quote_id>/', quote_request_detail, name='quote-request-detail'),
    path('quotes/<int:quote_id>/submit/', submit_quote, name='submit-quote'),
    
    # Calendar Management
    path('calendar/events/', calendar_views.vendor_calendar_events, name='vendor-calendar-events'),
    path('calendar/events/create/', calendar_views.create_calendar_event, name='create-calendar-event'),
    path('calendar/events/<int:event_id>/', calendar_views.update_calendar_event, name='update-calendar-event'),
    path('calendar/events/<int:event_id>/delete/', calendar_views.delete_calendar_event, name='delete-calendar-event'),
    path('calendar/availability/', calendar_views.vendor_availability, name='vendor-availability'),
    
    # Booking Management
    path('bookings/', include('vendors.booking_urls')),
    
    # Existing vendor endpoints
    path('', include(router.urls)),
]