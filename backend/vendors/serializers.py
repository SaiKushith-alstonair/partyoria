from rest_framework import serializers
from .models import CalendarEvent
from .booking_models import Booking

class CalendarEventSerializer(serializers.ModelSerializer):
    booking = serializers.SerializerMethodField()
    
    class Meta:
        model = CalendarEvent
        fields = ['id', 'title', 'event_date', 'description', 'location', 'booking', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_booking(self, obj):
        if obj.booking:
            return {
                'customer_name': obj.booking.customer_name,
                'amount': str(obj.booking.amount),
                'status': obj.booking.status,
                'service_type': obj.booking.service_type
            }
        return None

class CreateCalendarEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = ['title', 'event_date', 'description', 'location', 'booking']
        
    def create(self, validated_data):
        validated_data['vendor'] = self.context['request'].user
        return super().create(validated_data)