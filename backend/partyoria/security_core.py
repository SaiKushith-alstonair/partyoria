import re
import html
import hashlib
import secrets
from typing import Any, Dict, List, Optional, Union
from django.core.exceptions import ValidationError
from django.db import connection
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from functools import wraps
import logging

logger = logging.getLogger(__name__)

class SecurityCore:
    """Bulletproof security validation and sanitization"""
    
    # SQL injection prevention patterns
    SQL_INJECTION_PATTERNS = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)",
        r"(--|#|/\*|\*/)",
        r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
        r"(\bUNION\s+SELECT\b)",
        r"(\b(EXEC|EXECUTE)\s*\()",
    ]
    
    # XSS prevention patterns
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe[^>]*>",
        r"<object[^>]*>",
        r"<embed[^>]*>",
    ]
    
    @staticmethod
    def validate_input(data: Any, field_type: str = "text") -> str:
        """Bulletproof input validation"""
        if data is None:
            return ""
        
        # Convert to string
        clean_data = str(data).strip()
        
        # Length limits
        MAX_LENGTHS = {
            "text": 1000,
            "name": 100,
            "email": 254,
            "phone": 20,
            "id": 50,
            "url": 2048
        }
        
        max_len = MAX_LENGTHS.get(field_type, 1000)
        if len(clean_data) > max_len:
            raise ValidationError(f"Input too long (max {max_len} chars)")
        
        # SQL injection detection
        for pattern in SecurityCore.SQL_INJECTION_PATTERNS:
            if re.search(pattern, clean_data, re.IGNORECASE):
                logger.warning(f"SQL injection attempt blocked: {clean_data[:50]}")
                raise ValidationError("Invalid input detected")
        
        # XSS detection
        for pattern in SecurityCore.XSS_PATTERNS:
            if re.search(pattern, clean_data, re.IGNORECASE):
                logger.warning(f"XSS attempt blocked: {clean_data[:50]}")
                raise ValidationError("Invalid input detected")
        
        # HTML escape
        clean_data = html.escape(clean_data)
        
        return clean_data
    
    @staticmethod
    def validate_email(email: str) -> str:
        """Validate email format"""
        email = SecurityCore.validate_input(email, "email")
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            raise ValidationError("Invalid email format")
        return email.lower()
    
    @staticmethod
    def validate_phone(phone: str) -> str:
        """Validate phone number"""
        phone = SecurityCore.validate_input(phone, "phone")
        # Remove all non-digits
        digits_only = re.sub(r'[^\d]', '', phone)
        if len(digits_only) < 10 or len(digits_only) > 15:
            raise ValidationError("Invalid phone number")
        return digits_only
    
    @staticmethod
    def validate_id(id_value: Union[str, int]) -> int:
        """Validate ID fields"""
        try:
            id_int = int(id_value)
            if id_int <= 0:
                raise ValidationError("Invalid ID")
            return id_int
        except (ValueError, TypeError):
            raise ValidationError("Invalid ID format")
    
    @staticmethod
    def safe_query(query: str, params: List[Any]) -> List[Dict]:
        """Execute parameterized queries safely"""
        if not params:
            params = []
        
        # Validate query doesn't contain string formatting
        if '{' in query or '%s' in query.replace('%s', ''):
            raise ValidationError("Unsafe query detected")
        
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                columns = [col[0] for col in cursor.description] if cursor.description else []
                return [dict(zip(columns, row)) for row in cursor.fetchall()]
        except Exception as e:
            logger.error(f"Database query failed: {str(e)}")
            raise ValidationError("Database operation failed")

def require_auth(view_func):
    """Authentication decorator for API endpoints"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper

def validate_request_data(required_fields: List[str], optional_fields: List[str] = None):
    """Decorator to validate request data"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            try:
                import json
                data = json.loads(request.body) if request.body else {}
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON'}, status=400)
            
            # Validate required fields
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'error': f'Missing field: {field}'}, status=400)
                data[field] = SecurityCore.validate_input(data[field])
            
            # Validate optional fields
            if optional_fields:
                for field in optional_fields:
                    if field in data:
                        data[field] = SecurityCore.validate_input(data[field])
            
            request.validated_data = data
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

class RateLimiter:
    """Simple rate limiting"""
    _attempts = {}
    
    @classmethod
    def check_rate_limit(cls, identifier: str, max_attempts: int = 100, window: int = 3600) -> bool:
        """Check if request is within rate limit"""
        import time
        now = time.time()
        
        if identifier not in cls._attempts:
            cls._attempts[identifier] = []
        
        # Clean old attempts
        cls._attempts[identifier] = [
            attempt for attempt in cls._attempts[identifier] 
            if now - attempt < window
        ]
        
        # Check limit
        if len(cls._attempts[identifier]) >= max_attempts:
            logger.warning(f"Rate limit exceeded for {identifier}")
            return False
        
        cls._attempts[identifier].append(now)
        return True

def rate_limit(max_attempts: int = 100, window: int = 3600):
    """Rate limiting decorator"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            identifier = request.META.get('REMOTE_ADDR', 'unknown')
            if not RateLimiter.check_rate_limit(identifier, max_attempts, window):
                return JsonResponse({'error': 'Rate limit exceeded'}, status=429)
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator