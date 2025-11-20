from django.urls import path
from . import views
from partyoria.security_core import require_auth, rate_limit

# FIXED: Proper authentication endpoints with rate limiting
urlpatterns = [
    # Public authentication endpoints (with rate limiting)
    path('register/', 
         rate_limit(max_attempts=5, window=3600)(views.RegisterView.as_view()), 
         name='register'),
    path('login/', 
         rate_limit(max_attempts=10, window=3600)(views.LoginView.as_view()), 
         name='login'),
    
    # Protected endpoints (authentication required)
    path('logout/', require_auth(views.logout_user), name='logout'),
    path('profile/', require_auth(views.get_user_profile), name='profile'),
    path('sessions/', require_auth(views.get_user_sessions), name='sessions'),
    
    # CSRF token (public but rate limited)
    path('csrf/', 
         rate_limit(max_attempts=20, window=3600)(views.get_csrf_token), 
         name='csrf'),
]