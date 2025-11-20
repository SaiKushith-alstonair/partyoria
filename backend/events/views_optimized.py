from django.core.cache import cache
from django.db.models import Prefetch, Q, Count
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Event
from .serializers import EventSerializer
import hashlib
import json

class FastPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'limit'
    max_page_size = 50

class OptimizedEventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    pagination_class = FastPagination
    
    def get_queryset(self):
        return Event.objects.select_related('user').prefetch_related(
            'budget', 'rsvps'
        ).filter(user=self.request.user)
    
    def get_cache_key(self, action_name, **kwargs):
        user_id = self.request.user.id
        params = {
            'user_id': user_id,
            'action': action_name,
            **kwargs,
            **dict(self.request.query_params)
        }
        key_data = json.dumps(params, sort_keys=True)
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        return f"events:{action_name}:{key_hash}"
    
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key('list')
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        response = super().list(request, *args, **kwargs)
        
        if response.status_code == 200:
            cache.set(cache_key, response.data, 300)  # 5 minutes
        
        return response
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        
        if response.status_code == 201:
            # Invalidate list cache
            cache.delete_many(cache.keys(f"events:list:*"))
        
        return response
    
    @action(detail=False, methods=['get'])
    def sections(self, request):
        cache_key = "events:sections:all"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Return minimal event sections for performance
        sections = [
            {"id": "corporate", "name": "Corporate Events", "icon": "Briefcase"},
            {"id": "social", "name": "Social Events", "icon": "Heart"},
            {"id": "cultural", "name": "Cultural Events", "icon": "Palette"},
            {"id": "festival", "name": "Festival Events", "icon": "Sparkles"},
        ]
        
        cache.set(cache_key, sections, 3600)  # 1 hour
        return Response(sections)