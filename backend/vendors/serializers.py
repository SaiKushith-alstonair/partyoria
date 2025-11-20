from rest_framework import serializers
from .models import Venue, EventCategory, EventType, VendorService, EventVendorMapping, SpecialRequirement

class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = '__all__'

class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = '__all__'

class EventCategorySerializer(serializers.ModelSerializer):
    event_types = EventTypeSerializer(many=True, read_only=True)
    
    class Meta:
        model = EventCategory
        fields = '__all__'

class VendorServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorService
        fields = '__all__'

class EventVendorMappingSerializer(serializers.ModelSerializer):
    vendor_service = VendorServiceSerializer(read_only=True)
    
    class Meta:
        model = EventVendorMapping
        fields = '__all__'

class SpecialRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecialRequirement
        fields = '__all__'