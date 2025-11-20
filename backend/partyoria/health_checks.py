from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.conf import settings
import logging
import time
from datetime import datetime

logger = logging.getLogger(__name__)

def health_check(request):
    """
    Comprehensive health check endpoint
    """
    start_time = time.time()
    health_status = {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'checks': {}
    }
    
    # Database connectivity check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        health_status['checks']['database'] = {
            'status': 'healthy',
            'message': 'Database connection successful'
        }
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        health_status['checks']['database'] = {
            'status': 'unhealthy',
            'message': f'Database connection failed: {str(e)}'
        }
        health_status['status'] = 'unhealthy'
    
    # Cache connectivity check
    try:
        cache_key = 'health_check_test'
        cache.set(cache_key, 'test_value', 30)
        cached_value = cache.get(cache_key)
        if cached_value == 'test_value':
            health_status['checks']['cache'] = {
                'status': 'healthy',
                'message': 'Cache is working'
            }
        else:
            raise Exception('Cache value mismatch')
    except Exception as e:
        logger.warning(f"Cache health check failed: {str(e)}")
        health_status['checks']['cache'] = {
            'status': 'degraded',
            'message': f'Cache issues: {str(e)}'
        }
    
    # Application checks
    try:
        from events.models import Event
        event_count = Event.objects.count()
        health_status['checks']['application'] = {
            'status': 'healthy',
            'message': f'Application running, {event_count} events in database'
        }
    except Exception as e:
        logger.error(f"Application health check failed: {str(e)}")
        health_status['checks']['application'] = {
            'status': 'unhealthy',
            'message': f'Application error: {str(e)}'
        }
        health_status['status'] = 'unhealthy'
    
    # Performance metrics
    response_time = (time.time() - start_time) * 1000  # Convert to milliseconds
    health_status['performance'] = {
        'response_time_ms': round(response_time, 2),
        'debug_mode': settings.DEBUG
    }
    
    # Determine overall status
    if health_status['status'] == 'healthy':
        status_code = 200
    else:
        status_code = 503
    
    return JsonResponse(health_status, status=status_code)

def readiness_check(request):
    """
    Readiness check for deployment
    """
    try:
        # Check if all critical services are ready
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM events")
            
        return JsonResponse({
            'status': 'ready',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        return JsonResponse({
            'status': 'not_ready',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=503)

def liveness_check(request):
    """
    Liveness check for container orchestration
    """
    return JsonResponse({
        'status': 'alive',
        'timestamp': datetime.now().isoformat()
    })