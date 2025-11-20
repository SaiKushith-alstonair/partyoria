from rest_framework import serializers
from .models import Event, TraditionStyle, EventSection, EventSubsection, EventImage, EventRequirement, RequirementQuestion, VendorCategory, HeroVideo, EventMilestone, QuoteRequest, RSVP
import json
from decimal import Decimal

class TraditionStyleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TraditionStyle
        fields = ['id', 'event_type', 'style_name', 'description']

# BudgetAllocationSerializer removed - using in-memory data only

class EventSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Event
        fields = ['id', 'event_name', 'event_type', 'attendees', 'venue_type', 'duration', 'total_budget', 'services', 'form_data', 'special_requirements', 'selected_services', 'user', 'created_by', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Add empty budget_allocations for frontend compatibility
        data['budget_allocations'] = []
        
        # Ensure required fields have default values
        if not data.get('event_type'):
            data['event_type'] = 'other'
        if not data.get('attendees'):
            data['attendees'] = 50
        if not data.get('venue_type'):
            data['venue_type'] = 'indoor'
        if not data.get('duration'):
            data['duration'] = 4
        if not data.get('total_budget'):
            data['total_budget'] = '200000.00'
            
        return data
    
    def create(self, validated_data):
        # Ensure special_requirements is properly structured with quantity and Q&A support
        special_requirements = validated_data.get('special_requirements', {})
        
        # Validate and structure special_requirements data
        if special_requirements:
            for req_id, req_data in special_requirements.items():
                if isinstance(req_data, dict):
                    # Ensure proper structure: {selected: bool, quantity: int, unit: str, questions: list, answers: dict}
                    if 'selected' not in req_data:
                        req_data['selected'] = True
                    if 'quantity' in req_data:
                        try:
                            req_data['quantity'] = int(req_data['quantity']) if req_data['quantity'] else None
                        except (ValueError, TypeError):
                            req_data['quantity'] = None
                    # Keep questions and answers as-is if they exist
                    if 'questions' in req_data and not isinstance(req_data['questions'], list):
                        req_data['questions'] = []
                    if 'answers' in req_data and not isinstance(req_data['answers'], dict):
                        req_data['answers'] = {}
        
        validated_data['special_requirements'] = special_requirements
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Ensure special_requirements are properly updated
        special_requirements = validated_data.get('special_requirements')
        if special_requirements is not None:
            # Validate and structure special_requirements data
            for req_id, req_data in special_requirements.items():
                if isinstance(req_data, dict):
                    if 'selected' not in req_data:
                        req_data['selected'] = True
                    if 'quantity' in req_data:
                        try:
                            req_data['quantity'] = int(req_data['quantity']) if req_data['quantity'] else None
                        except (ValueError, TypeError):
                            req_data['quantity'] = None
                    # Keep questions and answers as-is if they exist
                    if 'questions' in req_data and not isinstance(req_data['questions'], list):
                        req_data['questions'] = []
                    if 'answers' in req_data and not isinstance(req_data['answers'], dict):
                        req_data['answers'] = {}
            instance.special_requirements = special_requirements
            
        return super().update(instance, validated_data)

class EventSubsectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSubsection
        fields = ['subsection_id', 'name']

class EventSectionSerializer(serializers.ModelSerializer):
    subsections = EventSubsectionSerializer(many=True, read_only=True)
    
    class Meta:
        model = EventSection
        fields = ['section_id', 'name', 'icon', 'subsections']

class EventImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventImage
        fields = ['event_id', 'image_url', 'description']

class RequirementQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequirementQuestion
        fields = '__all__'


class EventRequirementSerializer(serializers.ModelSerializer):
    dynamic_questions = RequirementQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = EventRequirement
        fields = ['event_id', 'category_name', 'requirement_id', 'label', 'category', 'unit', 'placeholder', 'dynamic_questions']

class VendorCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorCategory
        fields = ['category_id', 'name', 'vendors']

class HeroVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroVideo
        fields = ['id', 'name', 'video_url', 'is_active']

class EventMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventMilestone
        fields = '__all__'

class RSVPSerializer(serializers.ModelSerializer):
    guest_name = serializers.ReadOnlyField()
    guest_email = serializers.ReadOnlyField()
    total_attendees = serializers.ReadOnlyField()
    event_name = serializers.CharField(source='event.event_name', read_only=True)
    invitation_code = serializers.CharField(read_only=True)
    
    class Meta:
        model = RSVP
        fields = ['id', 'event', 'event_name', 'user', 'guest_data', 'invitation_code', 
                 'response_status', 'response_date', 'plus_ones', 'dietary_restrictions', 
                 'special_requests', 'guest_name', 'guest_email', 'total_attendees', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'invitation_code', 'guest_name', 'guest_email', 'total_attendees', 'created_at', 'updated_at']

class QuoteRequestSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = QuoteRequest
        fields = ['id', 'event_type', 'event_name', 'client_name', 'client_email', 'client_phone', 
                 'event_date', 'location', 'guest_count', 'budget_range', 'services', 'description', 
                 'urgency', 'status', 'quote_type', 'source_event', 'selected_vendors',
                 'category_specific_data', 'vendor_responses', 'user', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

