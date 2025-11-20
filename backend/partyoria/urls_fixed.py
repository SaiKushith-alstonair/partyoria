from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .health_checks import health_check, readiness_check, liveness_check

# FIXED: Proper URL routing with no conflicts
urlpatterns = [
    # Admin (protected by Django's built-in auth)
    path('admin/', admin.site.urls),
    
    # Authentication endpoints (public)
    path('api/auth/', include('authentication.urls')),
    
    # Events API (protected)
    path('api/events/', include('events.urls')),
    
    # Vendor API (protected) - FIXED: More specific path first
    path('api/vendor/', include('vendor_app.urls')),
    
    # Legacy vendor support (protected)
    path('api/vendors/', include('vendors.urls')),
    
    # Chat API (protected)
    path('api/chat/', include('app.chat.urls')),
    
    # Health checks (public)
    path('health/', health_check, name='health_check'),
    path('health/ready/', readiness_check, name='readiness_check'),
    path('health/live/', liveness_check, name='liveness_check'),
]

# Static files only in DEBUG mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)