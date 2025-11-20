from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Venue, EventCategory, EventType, VendorService, EventVendorMapping, SpecialRequirement
from .serializers import VenueSerializer, EventCategorySerializer, EventTypeSerializer, VendorServiceSerializer, EventVendorMappingSerializer, SpecialRequirementSerializer

class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all().order_by('state', 'city')
    serializer_class = VenueSerializer

    @action(detail=False, methods=['get'])
    def by_location(self, request):
        state = request.query_params.get('state', '')
        city = request.query_params.get('city', '')
        
        venues = self.queryset
        
        if state:
            venues = venues.filter(state__icontains=state)
        
        if city:
            venues = venues.filter(city__icontains=city)
        
        serializer = self.get_serializer(venues, many=True)
        return Response(serializer.data)

class EventCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EventCategory.objects.all().order_by('name')
    serializer_class = EventCategorySerializer

class EventTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EventType.objects.all().order_by('category__name', 'name')
    serializer_class = EventTypeSerializer

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category_id = request.query_params.get('category_id')
        if category_id:
            event_types = self.queryset.filter(category_id=category_id)
        else:
            event_types = self.queryset
        
        serializer = self.get_serializer(event_types, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def special_requirements(self, request, pk=None):
        event_type = self.get_object()
        requirements = SpecialRequirement.objects.filter(event_type=event_type).order_by('category_name')
        
        # Group by category
        grouped_requirements = {}
        for req in requirements:
            if req.category_name not in grouped_requirements:
                grouped_requirements[req.category_name] = []
            grouped_requirements[req.category_name].append({
                'id': req.requirement_id,
                'label': req.requirement_label,
                'category': req.vendor_category,
                'unit': req.unit,
                'placeholder': req.placeholder
            })
        
        return Response(grouped_requirements)

class VendorServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VendorService.objects.all().order_by('service_name')
    serializer_class = VendorServiceSerializer

    @action(detail=False, methods=['get'])
    def for_event(self, request):
        event_type_id = request.query_params.get('event_type_id')
        if event_type_id:
            mappings = EventVendorMapping.objects.filter(event_type_id=event_type_id)
            services = [mapping.vendor_service for mapping in mappings]
            serializer = self.get_serializer(services, many=True)
            return Response(serializer.data)
        
        return Response([])

class SpecialRequirementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SpecialRequirement.objects.all().order_by('event_type__name', 'category_name')
    serializer_class = SpecialRequirementSerializer

    @action(detail=False, methods=['get'])
    def for_event(self, request):
        event_type_id = request.query_params.get('event_type_id')
        if event_type_id:
            requirements = self.queryset.filter(event_type_id=event_type_id)
            serializer = self.get_serializer(requirements, many=True)
            return Response(serializer.data)
        
        return Response([])