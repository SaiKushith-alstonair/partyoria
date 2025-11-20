from django.middleware.security import SecurityMiddleware
from django.http import HttpResponseForbidden, JsonResponse
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
import re
import hashlib
import logging
from typing import Dict, List, Optional
import ipaddress

logger = logging.getLogger('django.security')

class SecurityHardeningMiddleware:
    """Enhanced security middleware"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Security patterns
        self.malicious_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'on\w+\s*=',
            r'<iframe[^>]*>',
            r'eval\s*\(',
            r'document\.',
            r'window\.',
            r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)',
            r'(--|#|/\*|\*/)',
        ]
        
        # Rate limiting
        self.rate_limits = {
            'login': {'requests': 5, 'window': 900},  # 5 requests per 15 minutes
            'register': {'requests': 3, 'window': 3600},  # 3 requests per hour
            'api': {'requests': 100, 'window': 60},  # 100 requests per minute
        }
        
        # Blocked IPs and user agents
        self.blocked_ips = set()
        self.blocked_user_agents = [
            r'.*bot.*', r'.*crawler.*', r'.*spider.*'
        ]
    
    def __call__(self, request):
        # Security checks
        if not self._security_check(request):
            return HttpResponseForbidden('Access denied')
        
        # Rate limiting
        if not self._rate_limit_check(request):
            return JsonResponse({'error': 'Rate limit exceeded'}, status=429)
        
        response = self.get_response(request)
        
        # Add security headers
        self._add_security_headers(response)
        
        return response
    
    def _security_check(self, request) -> bool:
        """Perform security checks"""
        
        # Check IP blocking
        client_ip = self._get_client_ip(request)
        if client_ip in self.blocked_ips:
            logger.warning(f"Blocked IP attempted access: {client_ip}")
            return False
        
        # Check user agent
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        for pattern in self.blocked_user_agents:
            if re.match(pattern, user_agent, re.IGNORECASE):
                logger.warning(f"Blocked user agent: {user_agent}")
                return False
        
        # Check for malicious patterns in request
        if self._contains_malicious_content(request):
            logger.warning(f"Malicious content detected from {client_ip}")
            return False
        
        return True
    
    def _rate_limit_check(self, request) -> bool:
        """Check rate limits - DISABLED for development"""
        return True
    
    def _contains_malicious_content(self, request) -> bool:
        """Check for malicious patterns"""
        
        # Check query parameters
        for key, value in request.GET.items():
            if self._is_malicious_string(value):
                return True
        
        # Check POST data
        if hasattr(request, 'body') and request.body:
            try:
                body_str = request.body.decode('utf-8')
                if self._is_malicious_string(body_str):
                    return True
            except UnicodeDecodeError:
                pass
        
        return False
    
    def _is_malicious_string(self, content: str) -> bool:
        """Check if string contains malicious patterns"""
        content_lower = content.lower()
        
        for pattern in self.malicious_patterns:
            if re.search(pattern, content_lower, re.IGNORECASE):
                return True
        
        return False
    
    def _get_client_ip(self, request) -> str:
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        
        return ip
    
    def _add_security_headers(self, response):
        """Add security headers to response"""
        
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none';"
        )
        response['Content-Security-Policy'] = csp
        
        # Other security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'

class InputSanitizer:
    """Input sanitization utilities"""
    
    @staticmethod
    def sanitize_html(content: str) -> str:
        """Remove HTML tags and dangerous content"""
        import html
        
        # Escape HTML entities
        content = html.escape(content)
        
        # Remove script tags
        content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.IGNORECASE | re.DOTALL)
        
        # Remove event handlers
        content = re.sub(r'on\w+\s*=\s*["\'][^"\']*["\']', '', content, flags=re.IGNORECASE)
        
        # Remove javascript: protocol
        content = re.sub(r'javascript:', '', content, flags=re.IGNORECASE)
        
        return content
    
    @staticmethod
    def sanitize_sql(content: str) -> str:
        """Remove SQL injection patterns"""
        
        # Remove SQL keywords
        sql_keywords = [
            'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
            'EXEC', 'UNION', 'SCRIPT', 'DECLARE', 'CAST', 'CONVERT'
        ]
        
        for keyword in sql_keywords:
            content = re.sub(rf'\b{keyword}\b', '', content, flags=re.IGNORECASE)
        
        # Remove SQL comments
        content = re.sub(r'(--|#|/\*|\*/)', '', content)
        
        return content
    
    @staticmethod
    def validate_file_upload(file) -> Dict[str, any]:
        """Validate uploaded files"""
        
        # Check file size (5MB limit)
        if file.size > 5 * 1024 * 1024:
            return {'valid': False, 'error': 'File too large'}
        
        # Check file extension
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx']
        file_ext = file.name.lower().split('.')[-1]
        
        if f'.{file_ext}' not in allowed_extensions:
            return {'valid': False, 'error': 'File type not allowed'}
        
        # Check MIME type
        import mimetypes
        mime_type, _ = mimetypes.guess_type(file.name)
        
        allowed_mimes = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        
        if mime_type not in allowed_mimes:
            return {'valid': False, 'error': 'Invalid file type'}
        
        return {'valid': True}

class PasswordValidator:
    """Enhanced password validation"""
    
    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, any]:
        """Validate password strength"""
        
        errors = []
        
        # Length check
        if len(password) < 8:
            errors.append('Password must be at least 8 characters long')
        
        # Complexity checks
        if not re.search(r'[A-Z]', password):
            errors.append('Password must contain at least one uppercase letter')
        
        if not re.search(r'[a-z]', password):
            errors.append('Password must contain at least one lowercase letter')
        
        if not re.search(r'\d', password):
            errors.append('Password must contain at least one digit')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append('Password must contain at least one special character')
        
        # Common password check
        common_passwords = [
            'password', '123456', 'password123', 'admin', 'qwerty',
            'letmein', 'welcome', 'monkey', '1234567890'
        ]
        
        if password.lower() in common_passwords:
            errors.append('Password is too common')
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'strength': 'strong' if len(errors) == 0 else 'weak'
        }

class SecurityAuditLogger:
    """Security event logging"""
    
    @staticmethod
    def log_security_event(event_type: str, user_id: Optional[int], ip_address: str, 
                          details: Dict = None):
        """Log security events"""
        
        log_data = {
            'event_type': event_type,
            'user_id': user_id,
            'ip_address': ip_address,
            'timestamp': timezone.now().isoformat(),
            'details': details or {}
        }
        
        logger.warning(f"SECURITY EVENT: {event_type}", extra=log_data)
    
    @staticmethod
    def log_failed_login(email: str, ip_address: str, reason: str):
        """Log failed login attempts"""
        SecurityAuditLogger.log_security_event(
            'failed_login',
            None,
            ip_address,
            {'email': email, 'reason': reason}
        )
    
    @staticmethod
    def log_suspicious_activity(user_id: int, ip_address: str, activity: str):
        """Log suspicious activities"""
        SecurityAuditLogger.log_security_event(
            'suspicious_activity',
            user_id,
            ip_address,
            {'activity': activity}
        )

class APIKeyManager:
    """API key management for external integrations"""
    
    @staticmethod
    def generate_api_key() -> str:
        """Generate secure API key"""
        import secrets
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_api_key(api_key: str) -> bool:
        """Validate API key format and existence"""
        
        # Check format
        if not api_key or len(api_key) != 43:  # Base64 URL-safe 32 bytes = 43 chars
            return False
        
        # Check if key exists in database (implement as needed)
        # For now, return True for valid format
        return True
    
    @staticmethod
    def hash_api_key(api_key: str) -> str:
        """Hash API key for storage"""
        return hashlib.sha256(api_key.encode()).hexdigest()

class SecurityConfig:
    """Security configuration constants"""
    
    # Session settings
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_AGE = 3600  # 1 hour
    
    # CSRF settings
    CSRF_COOKIE_SECURE = True
    CSRF_COOKIE_HTTPONLY = True
    CSRF_COOKIE_SAMESITE = 'Lax'
    
    # Security headers
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # File upload limits
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    ALLOWED_FILE_TYPES = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf', 'application/msword'
    ]
    
    # Rate limiting
    RATE_LIMIT_LOGIN = 5  # attempts per 15 minutes
    RATE_LIMIT_API = 100  # requests per minute
    
    # Password requirements
    MIN_PASSWORD_LENGTH = 8
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_DIGITS = True
    REQUIRE_SPECIAL_CHARS = True