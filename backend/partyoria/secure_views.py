from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from .security_core import SecurityCore, require_auth, validate_request_data, rate_limit
import json
import logging

logger = logging.getLogger(__name__)

class SecureAPIView:
    """Base class for secure API views"""
    
    @staticmethod
    @csrf_protect
    @require_auth
    @rate_limit(max_attempts=100, window=3600)
    def secure_post(request, validator_func, handler_func):
        """Secure POST endpoint wrapper"""
        try:
            # Validate JSON
            data = json.loads(request.body)
            
            # Apply custom validation
            validated_data = validator_func(data)
            
            # Execute handler
            result = handler_func(request, validated_data)
            
            return JsonResponse({'success': True, 'data': result})
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except ValidationError as e:
            logger.warning(f"Validation error: {str(e)}")
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return JsonResponse({'error': 'Internal server error'}, status=500)
    
    @staticmethod
    @require_auth
    @rate_limit(max_attempts=200, window=3600)
    def secure_get(request, validator_func, handler_func):
        """Secure GET endpoint wrapper"""
        try:
            # Validate query parameters
            validated_params = validator_func(request.GET)
            
            # Execute handler
            result = handler_func(request, validated_params)
            
            return JsonResponse({'success': True, 'data': result})
            
        except ValidationError as e:
            logger.warning(f"Validation error: {str(e)}")
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return JsonResponse({'error': 'Internal server error'}, status=500)

# Validation functions for different endpoints
def validate_event_data(data):
    """Validate event creation/update data"""
    validated = {}
    
    # Required fields
    validated['event_name'] = SecurityCore.validate_input(data.get('event_name', ''), 'name')
    if not validated['event_name']:
        raise ValidationError("Event name is required")
    
    # Optional fields with validation
    if 'client_name' in data:
        validated['client_name'] = SecurityCore.validate_input(data['client_name'], 'name')
    
    if 'client_email' in data:
        validated['client_email'] = SecurityCore.validate_email(data['client_email'])
    
    if 'client_phone' in data:
        validated['client_phone'] = SecurityCore.validate_phone(data['client_phone'])
    
    if 'attendees' in data:
        try:
            attendees = int(data['attendees'])
            if attendees < 1 or attendees > 100000:
                raise ValidationError("Invalid attendee count")
            validated['attendees'] = attendees
        except (ValueError, TypeError):
            raise ValidationError("Invalid attendee count")
    
    if 'budget' in data:
        try:
            budget = float(data['budget'])
            if budget < 0 or budget > 10000000:
                raise ValidationError("Invalid budget amount")
            validated['budget'] = budget
        except (ValueError, TypeError):
            raise ValidationError("Invalid budget amount")
    
    if 'description' in data:
        validated['description'] = SecurityCore.validate_input(data['description'], 'text')
    
    return validated

def validate_vendor_data(data):
    """Validate vendor data"""
    validated = {}
    
    # Required fields
    validated['name'] = SecurityCore.validate_input(data.get('name', ''), 'name')
    if not validated['name']:
        raise ValidationError("Vendor name is required")
    
    validated['category'] = SecurityCore.validate_input(data.get('category', ''), 'name')
    if not validated['category']:
        raise ValidationError("Category is required")
    
    # Email validation
    if 'email' in data:
        validated['email'] = SecurityCore.validate_email(data['email'])
    
    # Phone validation
    if 'phone' in data:
        validated['phone'] = SecurityCore.validate_phone(data['phone'])
    
    # Price range validation
    if 'price_min' in data:
        try:
            price_min = float(data['price_min'])
            if price_min < 0:
                raise ValidationError("Invalid minimum price")
            validated['price_min'] = price_min
        except (ValueError, TypeError):
            raise ValidationError("Invalid minimum price")
    
    if 'price_max' in data:
        try:
            price_max = float(data['price_max'])
            if price_max < 0:
                raise ValidationError("Invalid maximum price")
            validated['price_max'] = price_max
        except (ValueError, TypeError):
            raise ValidationError("Invalid maximum price")
    
    return validated

def validate_search_params(params):
    """Validate search parameters"""
    validated = {}
    
    if 'q' in params:
        query = SecurityCore.validate_input(params['q'], 'text')
        if len(query) > 100:
            raise ValidationError("Search query too long")
        validated['q'] = query
    
    if 'category' in params:
        validated['category'] = SecurityCore.validate_input(params['category'], 'name')
    
    if 'limit' in params:
        try:
            limit = int(params['limit'])
            if limit < 1 or limit > 100:
                raise ValidationError("Invalid limit")
            validated['limit'] = limit
        except (ValueError, TypeError):
            raise ValidationError("Invalid limit")
    
    if 'offset' in params:
        try:
            offset = int(params['offset'])
            if offset < 0:
                raise ValidationError("Invalid offset")
            validated['offset'] = offset
        except (ValueError, TypeError):
            raise ValidationError("Invalid offset")
    
    return validated

def validate_id_param(params):
    """Validate ID parameter"""
    if 'id' in params:
        return {'id': SecurityCore.validate_id(params['id'])}
    raise ValidationError("ID parameter required")