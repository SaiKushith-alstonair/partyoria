from django.http import JsonResponse
from django.core.exceptions import ValidationError, PermissionDenied
from django.db import IntegrityError, DatabaseError
from rest_framework.views import exception_handler
from rest_framework import status
import logging
import traceback

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Log the exception
    request = context.get('request')
    user = getattr(request, 'user', None)
    
    logger.error(
        f"Exception in {context.get('view', 'Unknown').__class__.__name__}: {str(exc)}",
        extra={
            'user_id': user.id if user and user.is_authenticated else None,
            'path': request.path if request else None,
            'method': request.method if request else None,
            'exception_type': exc.__class__.__name__
        }
    )
    
    # Handle specific exceptions
    if response is None:
        if isinstance(exc, ValidationError):
            return JsonResponse({
                'error': 'Validation failed',
                'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc)
            }, status=400)
        
        elif isinstance(exc, IntegrityError):
            return JsonResponse({
                'error': 'Data integrity error',
                'message': 'The operation violates data constraints'
            }, status=400)
        
        elif isinstance(exc, DatabaseError):
            return JsonResponse({
                'error': 'Database error',
                'message': 'A database error occurred'
            }, status=500)
        
        elif isinstance(exc, PermissionDenied):
            return JsonResponse({
                'error': 'Permission denied',
                'message': 'You do not have permission to perform this action'
            }, status=403)
        
        else:
            # Log unexpected errors with traceback
            logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
            return JsonResponse({
                'error': 'Internal server error',
                'message': 'An unexpected error occurred'
            }, status=500)
    
    return response

class ErrorHandler:
    """
    Centralized error handling utility
    """
    
    @staticmethod
    def handle_validation_error(error, context=""):
        """Handle validation errors consistently"""
        logger.warning(f"Validation error {context}: {str(error)}")
        if hasattr(error, 'message_dict'):
            return {'error': 'Validation failed', 'details': error.message_dict}
        return {'error': 'Validation failed', 'message': str(error)}
    
    @staticmethod
    def handle_database_error(error, context=""):
        """Handle database errors consistently"""
        logger.error(f"Database error {context}: {str(error)}")
        if isinstance(error, IntegrityError):
            return {'error': 'Data integrity error', 'message': 'Operation violates data constraints'}
        return {'error': 'Database error', 'message': 'A database operation failed'}
    
    @staticmethod
    def handle_permission_error(error, context=""):
        """Handle permission errors consistently"""
        logger.warning(f"Permission error {context}: {str(error)}")
        return {'error': 'Permission denied', 'message': 'Insufficient permissions'}
    
    @staticmethod
    def handle_not_found_error(resource="Resource", context=""):
        """Handle not found errors consistently"""
        logger.info(f"Not found error {context}: {resource}")
        return {'error': 'Not found', 'message': f'{resource} not found'}
    
    @staticmethod
    def handle_generic_error(error, context=""):
        """Handle generic errors consistently"""
        logger.error(f"Generic error {context}: {str(error)}", exc_info=True)
        return {'error': 'Internal error', 'message': 'An unexpected error occurred'}

def safe_execute(func, *args, **kwargs):
    """
    Safely execute a function with error handling
    """
    try:
        return func(*args, **kwargs), None
    except ValidationError as e:
        return None, ErrorHandler.handle_validation_error(e, func.__name__)
    except (IntegrityError, DatabaseError) as e:
        return None, ErrorHandler.handle_database_error(e, func.__name__)
    except PermissionDenied as e:
        return None, ErrorHandler.handle_permission_error(e, func.__name__)
    except Exception as e:
        return None, ErrorHandler.handle_generic_error(e, func.__name__)