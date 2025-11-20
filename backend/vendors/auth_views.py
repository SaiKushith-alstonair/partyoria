from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from authentication.models import CustomUser
from authentication.serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import VendorProfile
import jwt
from django.conf import settings

@method_decorator(csrf_exempt, name='dispatch')
class VendorRegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Register a new vendor using CustomUser"""
        try:
            data = request.data
            
            if CustomUser.objects.filter(email=data['email']).exists():
                return Response({'error': 'Email already exists'}, status=400)
            
            user = CustomUser.objects.create_user(
                username=data['email'],
                email=data['email'],
                password=data['password'],
                first_name=data.get('full_name', '').split()[0] if data.get('full_name') else '',
                last_name=' '.join(data.get('full_name', '').split()[1:]) if len(data.get('full_name', '').split()) > 1 else '',
                user_type='vendor',
                phone=data.get('mobile', ''),
                business=data.get('business', ''),
                experience_level=data.get('experience_level', ''),
                city=data.get('city', ''),
                state=data.get('state', ''),
                pincode=data.get('pincode', ''),
                location=data.get('location', ''),
                onboarding_completed=False
            )
            
            VendorProfile.objects.create(
                user=user,
                profile_data={'services': data.get('services', [])},
                is_completed=False
            )
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Vendor registered successfully',
                'vendor': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': f"{user.first_name} {user.last_name}".strip(),
                    'mobile': user.phone,
                    'business': user.business,
                    'experience_level': user.experience_level,
                    'city': user.city,
                    'state': user.state,
                    'pincode': user.pincode,
                    'location': user.location,
                    'is_verified': user.is_verified,
                    'onboarding_completed': user.onboarding_completed,
                    'user_type': 'vendor',
                    'access_token': str(refresh.access_token)
                },
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Keep function-based view as backup
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def vendor_register(request):
    """Register a new vendor"""
    try:
        data = request.data
        
        # Create user
        user = CustomUser.objects.create_user(
            username=data['email'],
            email=data['email'],
            password=data['password'],
            user_type='vendor'
        )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Return vendor data
        vendor_data = {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'user_type': user.user_type,
            'is_verified': user.is_verified
        }
        
        return Response({
            'vendor': vendor_data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class VendorLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Vendor login using CustomUser"""
        try:
            email = request.data.get('email') or request.data.get('username')
            password = request.data.get('password')
            
            if not email or not password:
                return Response({'non_field_errors': ['Email and password are required']}, status=400)
            
            user = authenticate(username=email, password=password)
            
            if not user:
                try:
                    user_obj = CustomUser.objects.filter(email=email, user_type='vendor').first()
                    if user_obj:
                        user = authenticate(username=user_obj.username, password=password)
                except Exception:
                    pass
            
            if not user or user.user_type != 'vendor':
                return Response({'non_field_errors': ['Invalid credentials']}, status=400)
            
            login(request, user)
            refresh = RefreshToken.for_user(user)
            
            profile = VendorProfile.objects.filter(user=user).first()
            services = profile.profile_data.get('services', []) if profile else []
            
            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': f"{user.first_name} {user.last_name}".strip(),
                    'mobile': user.phone,
                    'business': user.business,
                    'experience_level': user.experience_level,
                    'city': user.city,
                    'state': user.state,
                    'pincode': user.pincode,
                    'location': user.location,
                    'services': services,
                    'is_verified': user.is_verified,
                    'onboarding_completed': user.onboarding_completed,
                    'user_type': 'vendor',
                    'access_token': str(refresh.access_token)
                },
                'vendor': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': f"{user.first_name} {user.last_name}".strip(),
                    'mobile': user.phone,
                    'business': user.business,
                    'experience_level': user.experience_level,
                    'city': user.city,
                    'state': user.state,
                    'pincode': user.pincode,
                    'location': user.location,
                    'services': services,
                    'is_verified': user.is_verified,
                    'onboarding_completed': user.onboarding_completed,
                    'user_type': 'vendor',
                    'access_token': str(refresh.access_token)
                },
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=200)
            
        except Exception as e:
            import traceback
            print(f"Vendor login error: {str(e)}")
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=500)

# Keep function-based view as backup
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def vendor_login(request):
    """Vendor login using existing CustomUser authentication"""
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
        
        if user.user_type != 'vendor':
            return Response({'error': 'Access denied. Vendor account required.'}, status=403)
        
        login(request, user)
        
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type
            },
            'redirect_url': '/vendor/dashboard'
        }, status=200)
        
    except Exception as e:
        return Response({'error': 'Login failed'}, status=500)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def vendor_profile(request):
    """Get or update vendor profile"""
    try:
        if request.user.user_type != 'vendor':
            return Response({'error': 'Vendor access required'}, status=status.HTTP_403_FORBIDDEN)
        
        user = request.user
        profile, created = VendorProfile.objects.get_or_create(
            user=user,
            defaults={'profile_data': {}}
        )
        
        if request.method == 'GET':
            return Response({
                'id': user.id,
                'email': user.email,
                'full_name': f"{user.first_name} {user.last_name}".strip(),
                'mobile': user.phone,
                'business': user.business,
                'experience_level': user.experience_level,
                'city': user.city,
                'state': user.state,
                'pincode': user.pincode,
                'location': user.location,
                'services': profile.profile_data.get('services', []),
                'is_verified': user.is_verified,
                'onboarding_completed': user.onboarding_completed,
                'user_type': 'vendor',
                'profile_data': profile.profile_data,
                'profile_completed': profile.is_completed
            }, status=200)
        
        elif request.method == 'PUT':
            data = request.data
            
            if 'full_name' in data:
                parts = data['full_name'].split()
                user.first_name = parts[0] if parts else ''
                user.last_name = ' '.join(parts[1:]) if len(parts) > 1 else ''
            
            for field in ['phone', 'business', 'experience_level', 'city', 'state', 'pincode', 'location']:
                if field in data:
                    if field == 'phone':
                        user.phone = data[field]
                    else:
                        setattr(user, field, data[field])
            
            user.save()
            
            if 'services' in data:
                profile.profile_data['services'] = data['services']
            if 'profile_data' in data:
                profile.profile_data.update(data['profile_data'])
            if 'profile_completed' in data:
                profile.is_completed = data['profile_completed']
            profile.save()
            
            return Response({
                'message': 'Profile updated successfully',
                'vendor': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': f"{user.first_name} {user.last_name}".strip(),
                    'mobile': user.phone,
                    'business': user.business,
                    'experience_level': user.experience_level,
                    'city': user.city,
                    'state': user.state,
                    'pincode': user.pincode,
                    'location': user.location,
                    'services': profile.profile_data.get('services', []),
                    'is_verified': user.is_verified,
                    'onboarding_completed': user.onboarding_completed,
                    'user_type': 'vendor',
                    'profile_data': profile.profile_data,
                    'profile_completed': profile.is_completed
                }
            }, status=200)
            
    except Exception as e:
        return Response({'error': 'Profile operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
def vendor_dashboard_stats(request):
    """Get vendor dashboard statistics"""
    # Return mock data for now
    return Response({
        'total_revenue': 23800,
        'total_bookings': 45,
        'pending_bookings': 8,
        'in_progress_bookings': 12,
        'completed_bookings': 25
    }, status=200)

@csrf_exempt
@api_view(['POST'])
def vendor_token_refresh(request):
    """Refresh vendor JWT token"""
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'Refresh token required'}, status=400)
    
    try:
        import jwt
        from django.conf import settings
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=['HS256'])
        
        # Generate new access token
        import time
        now = int(time.time())
        
        new_payload = {
            'user_id': payload['vendor_id'],  # Django expects user_id
            'vendor_id': payload['vendor_id'],
            'email': payload['email'],
            'user_type': 'vendor',
            'token_type': 'access',
            'iat': now,
            'exp': now + 3600  # 1 hour
        }
        
        access_token = jwt.encode(new_payload, settings.SECRET_KEY, algorithm='HS256')
        
        return Response({
            'access': access_token
        }, status=200)
    except:
        return Response({'error': 'Invalid refresh token'}, status=401)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_onboarding(request):
    """Mark vendor onboarding as completed"""
    try:
        if request.user.user_type != 'vendor':
            return Response({'error': 'Vendor access required'}, status=403)
        
        request.user.onboarding_completed = True
        request.user.save()
        
        return Response({
            'message': 'Onboarding completed successfully',
            'vendor': {
                'id': request.user.id,
                'onboarding_completed': request.user.onboarding_completed
            }
        }, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=400)