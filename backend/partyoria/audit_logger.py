import logging
import json
from datetime import datetime
from django.contrib.auth import get_user_model
from django.http import HttpRequest
from typing import Optional, Dict, Any

User = get_user_model()

# Security audit logger
security_logger = logging.getLogger('security')
audit_logger = logging.getLogger('audit')
performance_logger = logging.getLogger('performance')

class AuditLogger:
    """Comprehensive audit logging for security events"""
    
    @staticmethod
    def log_security_event(
        event_type: str,
        request: HttpRequest,
        user: Optional[User] = None,
        details: Optional[Dict[str, Any]] = None,
        severity: str = 'INFO'
    ):
        """Log security-related events"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'severity': severity,
            'ip_address': AuditLogger._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', 'Unknown')[:200],
            'path': request.path,
            'method': request.method,
            'user_id': user.id if user else None,
            'user_email': user.email if user else None,
            'details': details or {}
        }
        
        security_logger.info(json.dumps(log_data))
    
    @staticmethod
    def log_authentication_attempt(
        request: HttpRequest,
        email: str,
        success: bool,
        failure_reason: Optional[str] = None
    ):
        """Log authentication attempts"""
        AuditLogger.log_security_event(
            event_type='AUTH_ATTEMPT',
            request=request,
            details={
                'email': email,
                'success': success,
                'failure_reason': failure_reason
            },
            severity='WARNING' if not success else 'INFO'
        )
    
    @staticmethod
    def log_authorization_failure(
        request: HttpRequest,
        user: Optional[User],
        resource: str,
        action: str
    ):
        """Log authorization failures"""
        AuditLogger.log_security_event(
            event_type='AUTH_FAILURE',
            request=request,
            user=user,
            details={
                'resource': resource,
                'action': action
            },
            severity='WARNING'
        )
    
    @staticmethod
    def log_input_validation_failure(
        request: HttpRequest,
        field: str,
        value: str,
        validation_error: str
    ):
        """Log input validation failures"""
        AuditLogger.log_security_event(
            event_type='VALIDATION_FAILURE',
            request=request,
            details={
                'field': field,
                'value': value[:100],  # Limit logged value length
                'error': validation_error
            },
            severity='WARNING'
        )
    
    @staticmethod
    def log_rate_limit_exceeded(
        request: HttpRequest,
        endpoint: str,
        limit: int
    ):
        """Log rate limit violations"""
        AuditLogger.log_security_event(
            event_type='RATE_LIMIT_EXCEEDED',
            request=request,
            details={
                'endpoint': endpoint,
                'limit': limit
            },
            severity='WARNING'
        )
    
    @staticmethod
    def log_data_access(
        request: HttpRequest,
        user: User,
        resource_type: str,
        resource_id: str,
        action: str
    ):
        """Log data access events"""
        audit_logger.info(json.dumps({
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': 'DATA_ACCESS',
            'user_id': user.id,
            'user_email': user.email,
            'ip_address': AuditLogger._get_client_ip(request),
            'resource_type': resource_type,
            'resource_id': resource_id,
            'action': action,
            'path': request.path
        }))
    
    @staticmethod
    def log_performance_issue(
        request: HttpRequest,
        endpoint: str,
        duration_ms: float,
        threshold_ms: float = 1000
    ):
        """Log performance issues"""
        if duration_ms > threshold_ms:
            performance_logger.warning(json.dumps({
                'timestamp': datetime.utcnow().isoformat(),
                'event_type': 'SLOW_REQUEST',
                'endpoint': endpoint,
                'duration_ms': duration_ms,
                'threshold_ms': threshold_ms,
                'ip_address': AuditLogger._get_client_ip(request),
                'method': request.method
            }))
    
    @staticmethod
    def log_database_query(
        query: str,
        duration_ms: float,
        user: Optional[User] = None
    ):
        """Log slow database queries"""
        if duration_ms > 100:  # Log queries slower than 100ms
            performance_logger.warning(json.dumps({
                'timestamp': datetime.utcnow().isoformat(),
                'event_type': 'SLOW_QUERY',
                'query': query[:200],  # Limit query length
                'duration_ms': duration_ms,
                'user_id': user.id if user else None
            }))
    
    @staticmethod
    def _get_client_ip(request: HttpRequest) -> str:
        """Get real client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', 'unknown')
        return ip[:45]  # Limit IP length