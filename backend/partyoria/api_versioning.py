from rest_framework.versioning import URLPathVersioning
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

class CustomAPIVersioning(URLPathVersioning):
    """
    Custom API versioning with backward compatibility
    """
    allowed_versions = ['v1', 'v2']
    default_version = 'v2'
    version_param = 'version'
    
    def determine_version(self, request, *args, **kwargs):
        version = super().determine_version(request, *args, **kwargs)
        
        # Log API version usage
        logger.info(f"API {version} accessed: {request.path}")
        
        return version

class APIVersionMiddleware:
    """
    Middleware to handle API versioning and deprecation warnings
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Add version headers
        if hasattr(request, 'version'):
            response['API-Version'] = request.version
            
            # Add deprecation warnings for old versions
            if request.version == 'v1':
                response['API-Deprecation-Warning'] = 'API v1 is deprecated. Please migrate to v2.'
                response['API-Sunset-Date'] = '2024-12-31'
        
        return response

def api_version_not_supported(request, version=None):
    """
    Handle unsupported API versions
    """
    return JsonResponse({
        'error': 'API version not supported',
        'version': version,
        'supported_versions': ['v1', 'v2'],
        'current_version': 'v2'
    }, status=400)

# Version-specific serializers and views
class VersionedSerializerMixin:
    """
    Mixin to provide version-specific serializers
    """
    
    def get_serializer_class(self):
        """
        Return version-specific serializer
        """
        version = getattr(self.request, 'version', 'v2')
        
        # Try to get version-specific serializer
        version_serializer = getattr(self, f'serializer_class_{version}', None)
        if version_serializer:
            return version_serializer
        
        # Fall back to default
        return super().get_serializer_class()

class VersionedViewMixin:
    """
    Mixin to provide version-specific view behavior
    """
    
    def dispatch(self, request, *args, **kwargs):
        """
        Add version-specific behavior
        """
        version = getattr(request, 'version', 'v2')
        
        # Check if version is supported
        if version not in ['v1', 'v2']:
            return api_version_not_supported(request, version)
        
        return super().dispatch(request, *args, **kwargs)
    
    def get_queryset(self):
        """
        Version-specific queryset modifications
        """
        queryset = super().get_queryset()
        version = getattr(self.request, 'version', 'v2')
        
        # Apply version-specific filters
        if hasattr(self, f'filter_queryset_{version}'):
            filter_method = getattr(self, f'filter_queryset_{version}')
            queryset = filter_method(queryset)
        
        return queryset