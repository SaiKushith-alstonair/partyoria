from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
import logging

from .models import CustomUser, UserSession
from .serializers import UserRegistrationSerializer, UserProfileSerializer
from partyoria.error_handlers import ErrorHandler, safe_execute
from partyoria.validation_layers import ValidationLayer

logger = logging.getLogger(__name__)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Enhanced JWT token serializer with user data"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['user_type'] = user.user_type
        token['email'] = user.email
        token['full_name'] = user.get_full_name()
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user profile data
        user = self.user
        data['user'] = UserProfileSerializer(user).data
        
        # Log successful login
        UserSession.objects.create(
            user=user,
            action='login',
            ip_address=self.context['request'].META.get('REMOTE_ADDR'),
            user_agent=self.context['request'].META.get('HTTP_USER_AGENT', ''),
            is_successful=True
        )
        
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    """Enhanced login view with security logging"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        try:
            # Validate input
            email = request.data.get('email', '').strip().lower()
            password = request.data.get('password', '')
            
            if not email or not password:
                return Response({
                    'error': 'Email and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate email format
            try:
                ValidationLayer.validate_email_field(email)
            except ValidationError:
                return Response({
                    'error': 'Invalid email format'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check rate limiting (simple implementation)
            recent_attempts = UserSession.objects.filter(
                ip_address=request.META.get('REMOTE_ADDR'),
                action='login',
                is_successful=False,
                timestamp__gte=timezone.now() - timedelta(minutes=15)
            ).count()
            
            if recent_attempts >= 5:
                return Response({
                    'error': 'Too many failed login attempts. Please try again later.'
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            return super().post(request, *args, **kwargs)
            
        except Exception as e:
            # Log failed attempt
            UserSession.objects.create(
                ip_address=request.META.get('REMOTE_ADDR'),
                action='login',
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                is_successful=False,
                failure_reason=str(e)
            )
            
            error_response = ErrorHandler.handle_generic_error(e, 'login')
            return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """Enhanced user registration with validation"""
    try:
        # Validate input data
        validated_data, validation_error = safe_execute(
            _validate_registration_data, request.data
        )
        
        if validation_error:
            return Response(validation_error, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        serializer = UserRegistrationSerializer(data=validated_data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            # Log successful registration
            UserSession.objects.create(
                user=user,
                action='register',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                is_successful=True
            )
            
            return Response({
                'message': 'Registration successful',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        error_response = ErrorHandler.handle_generic_error(e, 'register')
        return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
    """Enhanced logout with token blacklisting"""
    try:
        refresh_token = request.data.get('refresh_token')
        
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        # Log logout
        UserSession.objects.create(
            user=request.user,
            action='logout',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            is_successful=True
        )
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        error_response = ErrorHandler.handle_generic_error(e, 'logout')
        return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_profile(request):
    """Get current user profile"""
    try:
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    except Exception as e:
        error_response = ErrorHandler.handle_generic_error(e, 'get_profile')
        return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_user_profile(request):
    """Update user profile with validation"""
    try:
        # Validate input data
        validated_data, validation_error = safe_execute(
            _validate_profile_data, request.data
        )
        
        if validation_error:
            return Response(validation_error, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = UserProfileSerializer(
            request.user, 
            data=validated_data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        error_response = ErrorHandler.handle_generic_error(e, 'update_profile')
        return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def _validate_registration_data(data):
    """Validate registration data"""
    validated = {}
    
    # Validate required fields
    validated['email'] = ValidationLayer.validate_email_field(data.get('email'))
    validated['username'] = ValidationLayer.validate_name(data.get('username'), 'Username')
    validated['first_name'] = ValidationLayer.validate_name(data.get('first_name'), 'First name')
    validated['last_name'] = ValidationLayer.validate_name(data.get('last_name'), 'Last name')
    
    # Validate password
    password = data.get('password', '')
    if len(password) < 8:
        raise ValidationError('Password must be at least 8 characters')
    validated['password'] = password
    
    # Validate user type
    user_type = data.get('user_type', 'customer')
    validated['user_type'] = ValidationLayer.validate_choice_field(
        user_type, 
        [('customer', 'Customer'), ('vendor', 'Vendor')], 
        'User type'
    )
    
    # Optional fields
    if data.get('phone'):
        validated['phone'] = ValidationLayer.validate_phone_number(data['phone'])
    
    return validated

def _validate_profile_data(data):
    """Validate profile update data"""
    validated = {}
    
    # Only validate provided fields
    if 'first_name' in data:
        validated['first_name'] = ValidationLayer.validate_name(data['first_name'], 'First name')
    
    if 'last_name' in data:
        validated['last_name'] = ValidationLayer.validate_name(data['last_name'], 'Last name')
    
    if 'phone' in data:
        validated['phone'] = ValidationLayer.validate_phone_number(data['phone'])
    
    if 'bio' in data:
        validated['bio'] = ValidationLayer.validate_text_field(
            data['bio'], max_length=500, field_name='Bio'
        )
    
    return validated