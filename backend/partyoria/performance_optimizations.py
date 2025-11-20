from django.core.cache import cache
from django.db import models
from django.db.models import Prefetch, Q, Count, Avg
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.response import Response
import hashlib
import json
from typing import Any, Dict, List
import logging

logger = logging.getLogger(__name__)

class CacheManager:
    """Centralized cache management"""
    
    @staticmethod
    def get_cache_key(prefix: str, **kwargs) -> str:
        """Generate consistent cache keys"""
        key_data = json.dumps(kwargs, sort_keys=True)
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        return f"{prefix}:{key_hash}"
    
    @staticmethod
    def cache_result(key: str, data: Any, timeout: int = 300) -> None:
        """Cache data with timeout"""
        try:
            cache.set(key, data, timeout)
        except Exception as e:
            logger.warning(f"Cache set failed: {str(e)}")
    
    @staticmethod
    def get_cached_result(key: str) -> Any:
        """Get cached data"""
        try:
            return cache.get(key)
        except Exception as e:
            logger.warning(f"Cache get failed: {str(e)}")
            return None
    
    @staticmethod
    def invalidate_pattern(pattern: str) -> None:
        """Invalidate cache keys matching pattern"""
        try:
            cache.delete_many(cache.keys(f"*{pattern}*"))
        except Exception as e:
            logger.warning(f"Cache invalidation failed: {str(e)}")

class QueryOptimizer:
    """Database query optimization utilities"""
    
    @staticmethod
    def optimize_event_queryset(queryset):
        """Optimize event queries with select_related and prefetch_related"""
        return queryset.select_related(
            'user'
        ).prefetch_related(
            'budget',
            'rsvps',
            'milestones_data'
        )
    
    @staticmethod
    def optimize_user_queryset(queryset):
        """Optimize user queries"""
        return queryset.select_related(
            'profile'
        ).prefetch_related(
            'events',
            'budgets'
        )
    
    @staticmethod
    def get_events_with_stats(user_id: int):
        """Get events with aggregated statistics"""
        from events.models import Event
        
        return Event.objects.filter(
            user_id=user_id
        ).annotate(
            rsvp_count=Count('rsvps'),
            accepted_rsvps=Count('rsvps', filter=Q(rsvps__response_status='accepted')),
            total_attendees=models.Sum('rsvps__plus_ones') + Count('rsvps', filter=Q(rsvps__response_status='accepted'))
        ).select_related('user').prefetch_related('budget')

class PerformanceMixin:
    """Mixin to add performance optimizations to views"""
    
    cache_timeout = 300  # 5 minutes default
    
    def get_cache_key(self, request, *args, **kwargs):
        """Generate cache key for view"""
        user_id = getattr(request.user, 'id', 'anonymous')
        view_name = self.__class__.__name__
        
        return CacheManager.get_cache_key(
            f"view:{view_name}",
            user_id=user_id,
            args=args,
            kwargs=kwargs,
            query_params=dict(request.query_params)
        )
    
    def get_cached_response(self, request, *args, **kwargs):
        """Get cached response if available"""
        if not getattr(self, 'enable_caching', True):
            return None
        
        cache_key = self.get_cache_key(request, *args, **kwargs)
        return CacheManager.get_cached_result(cache_key)
    
    def cache_response(self, request, response, *args, **kwargs):
        """Cache response data"""
        if not getattr(self, 'enable_caching', True):
            return
        
        if response.status_code == 200:
            cache_key = self.get_cache_key(request, *args, **kwargs)
            CacheManager.cache_result(cache_key, response.data, self.cache_timeout)
    
    def invalidate_cache(self, pattern: str = None):
        """Invalidate related cache entries"""
        if pattern:
            CacheManager.invalidate_pattern(pattern)
        else:
            # Invalidate view-specific cache
            view_name = self.__class__.__name__
            CacheManager.invalidate_pattern(f"view:{view_name}")

class DatabaseOptimizationMixin:
    """Mixin for database query optimizations"""
    
    def get_queryset(self):
        """Optimize queryset with proper relations"""
        queryset = super().get_queryset()
        
        # Apply model-specific optimizations
        model_name = queryset.model.__name__.lower()
        
        if model_name == 'event':
            return QueryOptimizer.optimize_event_queryset(queryset)
        elif model_name == 'customuser':
            return QueryOptimizer.optimize_user_queryset(queryset)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Optimized list view with pagination and caching"""
        # Check cache first
        cached_response = getattr(self, 'get_cached_response', lambda *a, **k: None)(request, *args, **kwargs)
        if cached_response is not None:
            return Response(cached_response)
        
        # Get optimized queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        # Apply pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
        else:
            serializer = self.get_serializer(queryset, many=True)
            response = Response(serializer.data)
        
        # Cache response
        if hasattr(self, 'cache_response'):
            self.cache_response(request, response, *args, **kwargs)
        
        return response

# Performance monitoring decorator
def monitor_performance(func):
    """Decorator to monitor function performance"""
    def wrapper(*args, **kwargs):
        import time
        start_time = time.time()
        
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            # Log slow operations
            if execution_time > 1.0:  # Log if takes more than 1 second
                logger.warning(
                    f"Slow operation: {func.__name__} took {execution_time:.2f}s"
                )
            
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(
                f"Operation failed: {func.__name__} failed after {execution_time:.2f}s: {str(e)}"
            )
            raise
    
    return wrapper

# Database connection optimization
class DatabaseRouter:
    """Database router for read/write splitting"""
    
    def db_for_read(self, model, **hints):
        """Suggest database for reads"""
        # Use read replica if available
        if hasattr(model._meta, 'app_label'):
            return 'default'  # For now, use default
        return None
    
    def db_for_write(self, model, **hints):
        """Suggest database for writes"""
        return 'default'
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """Allow migrations"""
        return True

# Bulk operations for performance
class BulkOperationsMixin:
    """Mixin for bulk database operations"""
    
    def bulk_create_objects(self, model_class, data_list, batch_size=100):
        """Bulk create objects efficiently"""
        objects = []
        for data in data_list:
            objects.append(model_class(**data))
            
            if len(objects) >= batch_size:
                model_class.objects.bulk_create(objects, ignore_conflicts=True)
                objects = []
        
        # Create remaining objects
        if objects:
            model_class.objects.bulk_create(objects, ignore_conflicts=True)
    
    def bulk_update_objects(self, objects, fields, batch_size=100):
        """Bulk update objects efficiently"""
        model_class = objects[0].__class__
        
        for i in range(0, len(objects), batch_size):
            batch = objects[i:i + batch_size]
            model_class.objects.bulk_update(batch, fields)

# Memory optimization
class MemoryOptimizedQuerySet(models.QuerySet):
    """QuerySet with memory optimizations"""
    
    def iterator_chunked(self, chunk_size=1000):
        """Iterate over queryset in chunks to save memory"""
        for chunk in self.chunked_iterator(chunk_size):
            yield from chunk
    
    def chunked_iterator(self, chunk_size=1000):
        """Yield queryset in chunks"""
        queryset = self.order_by('pk')
        last_pk = 0
        
        while True:
            chunk = list(
                queryset.filter(pk__gt=last_pk)[:chunk_size]
            )
            
            if not chunk:
                break
            
            yield chunk
            last_pk = chunk[-1].pk

# Response compression
class CompressionMixin:
    """Mixin to add response compression"""
    
    def finalize_response(self, request, response, *args, **kwargs):
        """Add compression headers"""
        response = super().finalize_response(request, response, *args, **kwargs)
        
        # Add compression hint for large responses
        if hasattr(response, 'data') and len(str(response.data)) > 1000:
            response['Content-Encoding-Hint'] = 'gzip'
        
        return response

# API response optimization
class OptimizedResponseMixin:
    """Mixin for optimized API responses"""
    
    def get_serializer_context(self):
        """Add optimization context to serializer"""
        context = super().get_serializer_context()
        
        # Add fields selection for partial responses
        fields = self.request.query_params.get('fields')
        if fields:
            context['fields'] = fields.split(',')
        
        return context
    
    def list(self, request, *args, **kwargs):
        """Optimized list with field selection"""
        response = super().list(request, *args, **kwargs)
        
        # Add metadata for client optimization
        if hasattr(response, 'data') and isinstance(response.data, dict):
            if 'results' in response.data:
                response.data['meta'] = {
                    'total_count': response.data.get('count', 0),
                    'page_size': len(response.data['results']),
                    'cached': hasattr(self, '_from_cache')
                }
        
        return response