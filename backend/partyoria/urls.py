from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .health_checks import health_check, readiness_check, liveness_check
from events.contact_views import contact_inquiry

# FIXED: Proper URL routing with no conflicts
urlpatterns = [
    # Admin (protected by Django's built-in auth)
    path('admin/', admin.site.urls),
    
    # Authentication endpoints (public)
    path('api/auth/', include('authentication.urls')),
    
    # Events API (protected)
    path('api/', include('events.urls')),
    
    # Vendor API (protected)
    path('api/vendor/', include('vendors.urls')),
    
    # Chat API (protected)
    path('api/chat/', include('app.chat.urls')),
    
    # Notifications API (protected)
    path('api/', include('notifications.urls')),
    
    # Contact form (public)
    path('api/contact/', contact_inquiry, name='contact_inquiry'),
    
    # Health checks (public)
    path('health/', health_check, name='health_check'),
    path('health/ready/', readiness_check, name='readiness_check'),
    path('health/live/', liveness_check, name='liveness_check'),
]

# Static files only in DEBUG mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)