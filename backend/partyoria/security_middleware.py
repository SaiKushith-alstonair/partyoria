import json
import logging
import time
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.core.exceptions import ValidationError
from .security_core import SecurityCore, RateLimiter
from .audit_logger import AuditLogger

logger = logging.getLogger(__name__)

class SecurityValidationMiddleware(MiddlewareMixin):
    """Validate all incoming requests for security threats"""
    
    def process_request(self, request):
        # Rate limiting
        client_ip = self.get_client_ip(request)
        if not RateLimiter.check_rate_limit(client_ip, max_attempts=1000, window=3600):
            AuditLogger.log_rate_limit_exceeded(request, request.path, 1000)
            return JsonResponse({'error': 'Rate limit exceeded'}, status=429)
        
        # Validate request headers
        if self.has_malicious_headers(request):
            AuditLogger.log_security_event(
                'MALICIOUS_HEADERS',
                request,
                severity='HIGH'
            )
            return JsonResponse({'error': 'Invalid request'}, status=400)
        
        # Validate request body for POST/PUT/PATCH
        if request.method in ['POST', 'PUT', 'PATCH'] and request.body:
            try:
                self.validate_request_body(request)
            except ValidationError as e:
                AuditLogger.log_input_validation_failure(
                    request, 'request_body', str(request.body)[:100], str(e)
                )
                return JsonResponse({'error': 'Invalid request data'}, status=400)
        
        return None
    
    def get_client_ip(self, request):
        """Get real client IP"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', 'unknown')
        return SecurityCore.validate_input(ip, "text")
    
    def has_malicious_headers(self, request):
        """Check for malicious headers"""
        dangerous_headers = [
            'HTTP_X_FORWARDED_HOST',
            'HTTP_X_ORIGINAL_URL', 
            'HTTP_X_REWRITE_URL'
        ]
        
        for header in dangerous_headers:
            if header in request.META:
                value = request.META[header]
                try:
                    SecurityCore.validate_input(value, "url")
                except ValidationError:
                    return True
        return False
    
    def validate_request_body(self, request):
        """Validate request body content"""
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                self.validate_json_data(data)
        except json.JSONDecodeError:
            raise ValidationError("Invalid JSON format")
    
    def validate_json_data(self, data, max_depth=5, current_depth=0):
        """Recursively validate JSON data"""
        if current_depth > max_depth:
            raise ValidationError("JSON too deeply nested")
        
        if isinstance(data, dict):
            if len(data) > 100:  # Limit object size
                raise ValidationError("JSON object too large")
            for key, value in data.items():
                SecurityCore.validate_input(str(key), "text")
                if isinstance(value, (dict, list)):
                    self.validate_json_data(value, max_depth, current_depth + 1)
                else:
                    SecurityCore.validate_input(str(value), "text")
        elif isinstance(data, list):
            if len(data) > 1000:  # Limit array size
                raise ValidationError("JSON array too large")
            for item in data:
                if isinstance(item, (dict, list)):
                    self.validate_json_data(item, max_depth, current_depth + 1)
                else:
                    SecurityCore.validate_input(str(item), "text")

class AuthenticationMiddleware(MiddlewareMixin):
    
    def process_request(self, request):
        # Store request start time for performance monitoring
        request._start_time = time.time()
        return super().process_request(request)
    
    def process_response(self, request, response):
        # Log performance metrics
        if hasattr(request, '_start_time'):
            duration_ms = (time.time() - request._start_time) * 1000
            AuditLogger.log_performance_issue(
                request, request.path, duration_ms
            )
        return response
    """Enhanced authentication middleware"""
    
    PROTECTED_PATHS = [
        '/api/events/',
        '/api/vendor/',
        '/api/auth/profile/',
        '/chat/',
    ]
    
    PUBLIC_PATHS = [
        '/api/auth/login/',
        '/api/auth/register/',
        '/api/events/sections/',
        '/api/events/images/',
        '/health/',
    ]
    
    def process_request(self, request):
        path = request.path_info
        
        # Skip authentication for public paths
        if any(path.startswith(public_path) for public_path in self.PUBLIC_PATHS):
            return None
        
        # Require authentication for protected paths
        if any(path.startswith(protected_path) for protected_path in self.PROTECTED_PATHS):
            if not request.user.is_authenticated:
                AuditLogger.log_authorization_failure(
                    request, None, path, 'access'
                )
                return JsonResponse({'error': 'Authentication required'}, status=401)
        
        return None