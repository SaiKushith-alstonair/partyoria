import logging
import os
from datetime import datetime

class SecurityLogFilter(logging.Filter):
    """Filter to identify security-related log entries"""
    
    def filter(self, record):
        security_keywords = [
            'authentication', 'authorization', 'permission', 'csrf', 'xss', 
            'sql injection', 'validation error', 'security', 'login', 'logout'
        ]
        
        message = record.getMessage().lower()
        record.is_security = any(keyword in message for keyword in security_keywords)
        return True

class PerformanceLogFilter(logging.Filter):
    """Filter to identify performance-related log entries"""
    
    def filter(self, record):
        performance_keywords = [
            'slow query', 'timeout', 'performance', 'cache', 'database', 
            'memory', 'cpu', 'response time'
        ]
        
        message = record.getMessage().lower()
        record.is_performance = any(keyword in message for keyword in performance_keywords)
        return True

class ErrorLogFilter(logging.Filter):
    """Filter to identify error-related log entries"""
    
    def filter(self, record):
        record.is_error = record.levelno >= logging.ERROR
        return True

def setup_logging(base_dir):
    """Setup comprehensive logging configuration"""
    
    # Create logs directory
    logs_dir = os.path.join(base_dir, 'logs')
    os.makedirs(logs_dir, exist_ok=True)
    
    # Create log files
    log_files = {
        'django': os.path.join(logs_dir, 'django.log'),
        'security': os.path.join(logs_dir, 'security.log'),
        'performance': os.path.join(logs_dir, 'performance.log'),
        'errors': os.path.join(logs_dir, 'errors.log'),
        'api': os.path.join(logs_dir, 'api.log'),
    }
    
    return {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'verbose': {
                'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
                'style': '{',
            },
            'simple': {
                'format': '{levelname} {asctime} {message}',
                'style': '{',
            },
            'security': {
                'format': 'SECURITY {levelname} {asctime} {module} {message}',
                'style': '{',
            },
            'performance': {
                'format': 'PERF {levelname} {asctime} {module} {message}',
                'style': '{',
            },
            'api': {
                'format': 'API {levelname} {asctime} {module} {funcName} {message}',
                'style': '{',
            },
        },
        'filters': {
            'security_filter': {
                '()': SecurityLogFilter,
            },
            'performance_filter': {
                '()': PerformanceLogFilter,
            },
            'error_filter': {
                '()': ErrorLogFilter,
            },
        },
        'handlers': {
            'console': {
                'level': 'INFO',
                'class': 'logging.StreamHandler',
                'formatter': 'simple',
            },
            'django_file': {
                'level': 'INFO',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': log_files['django'],
                'maxBytes': 10 * 1024 * 1024,  # 10MB
                'backupCount': 5,
                'formatter': 'verbose',
            },
            'security_file': {
                'level': 'WARNING',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': log_files['security'],
                'maxBytes': 5 * 1024 * 1024,  # 5MB
                'backupCount': 10,
                'formatter': 'security',
                'filters': ['security_filter'],
            },
            'performance_file': {
                'level': 'INFO',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': log_files['performance'],
                'maxBytes': 5 * 1024 * 1024,  # 5MB
                'backupCount': 5,
                'formatter': 'performance',
                'filters': ['performance_filter'],
            },
            'error_file': {
                'level': 'ERROR',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': log_files['errors'],
                'maxBytes': 10 * 1024 * 1024,  # 10MB
                'backupCount': 10,
                'formatter': 'verbose',
                'filters': ['error_filter'],
            },
            'api_file': {
                'level': 'INFO',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': log_files['api'],
                'maxBytes': 10 * 1024 * 1024,  # 10MB
                'backupCount': 5,
                'formatter': 'api',
            },
        },
        'root': {
            'handlers': ['console', 'django_file', 'error_file'],
            'level': 'INFO',
        },
        'loggers': {
            'django': {
                'handlers': ['console', 'django_file'],
                'level': 'INFO',
                'propagate': False,
            },
            'django.security': {
                'handlers': ['console', 'security_file', 'error_file'],
                'level': 'WARNING',
                'propagate': False,
            },
            'django.db.backends': {
                'handlers': ['performance_file'],
                'level': 'DEBUG',
                'propagate': False,
            },
            'events': {
                'handlers': ['console', 'api_file', 'error_file'],
                'level': 'INFO',
                'propagate': False,
            },
            'authentication': {
                'handlers': ['console', 'security_file', 'error_file'],
                'level': 'INFO',
                'propagate': False,
            },
            'vendor_app': {
                'handlers': ['console', 'api_file', 'error_file'],
                'level': 'INFO',
                'propagate': False,
            },
            'partyoria.error_handlers': {
                'handlers': ['console', 'error_file'],
                'level': 'WARNING',
                'propagate': False,
            },
            'partyoria.security_middleware': {
                'handlers': ['console', 'security_file'],
                'level': 'WARNING',
                'propagate': False,
            },
        },
    }