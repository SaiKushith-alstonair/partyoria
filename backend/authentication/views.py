from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login, logout, authenticate
from django.contrib.sessions.models import Session
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token
from django.core.exceptions import ValidationError
from django.utils.html import escape
import logging
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from .models import CustomUser
from .utils import log_user_session

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """User registration endpoint"""
        try:
            data = request.data
            
            if not data.get('username') or not data.get('password'):
                return Response({'error': 'Username and password are required'}, status=400)
            
            if not data.get('email'):
                return Response({'error': 'Email is required'}, status=400)
            
            # Check if user already exists
            if CustomUser.objects.filter(username=data['username']).exists():
                return Response({'error': 'Username already exists'}, status=400)
            
            if CustomUser.objects.filter(email=data['email']).exists():
                return Response({'error': 'Email already exists'}, status=400)
            
            user = CustomUser.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                user_type=data.get('user_type', 'customer')
            )
            
            return Response({
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'user_type': user.user_type
                }
            }, status=201)
            
        except Exception as e:
            logger.error(f"Registration error: {e}")
            return Response({'error': f'Registration failed: {str(e)}'}, status=500)

# Keep the function-based view as backup
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """User registration endpoint"""
    try:
        data = request.data
        
        if not data.get('username') or not data.get('password'):
            return Response({'error': 'Username and password are required'}, status=400)
        
        user = CustomUser.objects.create_user(
            username=data['username'],
            email=data.get('email', ''),
            password=data['password'],
            user_type=data.get('user_type', 'customer')
        )
        
        return Response({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type
            }
        }, status=201)
        
    except Exception as e:
        return Response({'error': 'Registration failed'}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """User login endpoint"""
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            
            if not username or not password:
                return Response({'error': 'Username and password are required'}, status=400)
            
            # Try to authenticate with username first
            user = authenticate(username=username, password=password)
            
            # If that fails, try to find user by email and authenticate
            if not user:
                user_obj = CustomUser.objects.filter(email=username).first()
                if user_obj:
                    user = authenticate(username=user_obj.username, password=password)
            
            if not user:
                return Response({'error': 'Invalid credentials'}, status=401)
            
            login(request, user)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            redirect_url = '/vendor/dashboard' if user.user_type == 'vendor' else '/dashboard'
            
            # Store user data for frontend compatibility
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
            
            response_data = {
                'message': 'Login successful',
                'user': user_data,
                'access': str(access_token),
                'refresh': str(refresh),
                'tokens': {
                    'access': str(access_token),
                    'refresh': str(refresh)
                },
                'redirect_url': redirect_url
            }
            
            return Response(response_data, status=200)
            
        except Exception as e:
            print(f"Customer login error: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': f'Login failed: {str(e)}'}, status=500)

# Keep the function-based view as backup
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """User login endpoint"""
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=400)
        
        # Try to authenticate with username first
        user = authenticate(username=username, password=password)
        
        # If that fails, try to find user by email and authenticate
        if not user:
            try:
                user_obj = CustomUser.objects.get(email=username)
                user = authenticate(username=user_obj.username, password=password)
            except CustomUser.DoesNotExist:
                pass
        
        if not user:
            return Response({'error': 'Invalid credentials'}, status=401)
        
        login(request, user)
        
        redirect_url = '/vendor/dashboard' if user.user_type == 'vendor' else '/dashboard'
        
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type
            },
            'redirect_url': redirect_url
        }, status=200)
        
    except Exception as e:
        return Response({'error': 'Login failed'}, status=500)

@api_view(['POST'])
def logout_user(request):
    """User logout endpoint"""
    try:
        if request.user.is_authenticated:
            # Log logout
            log_user_session(request.user, 'logout', request, is_successful=True)
            
            logout(request)
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'User not authenticated'
        }, status=status.HTTP_401_UNAUTHORIZED)
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return Response({
            'error': 'Logout failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_user_profile(request):
    """Get current user profile"""
    if request.user.is_authenticated:
        user_data = UserSerializer(request.user).data
        return Response(user_data, status=status.HTTP_200_OK)
    
    return Response({
        'error': 'User not authenticated'
    }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def get_user_sessions(request):
    """Get user session history"""
    if request.user.is_authenticated:
        sessions = request.user.sessions.all()[:20]  # Last 20 sessions
        session_data = []
        
        for session in sessions:
            session_data.append({
                'action': session.action,
                'ip_address': session.ip_address,
                'timestamp': session.timestamp,
                'is_successful': session.is_successful,
                'failure_reason': session.failure_reason
            })
        
        return Response({
            'sessions': session_data
        }, status=status.HTTP_200_OK)
    
    return Response({
        'error': 'User not authenticated'
    }, status=status.HTTP_401_UNAUTHORIZED)

@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """Get CSRF token"""
    return Response({
        'csrfToken': get_token(request)
    }, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """Refresh JWT token"""
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, status=400)
        
        refresh = RefreshToken(refresh_token)
        access_token = refresh.access_token
        
        return Response({
            'access': str(access_token)
        }, status=200)
        
    except Exception as e:
        return Response({'error': 'Invalid refresh token'}, status=401)