from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework import serializers
import re
from decimal import Decimal
from datetime import datetime, date
import json

class ValidationLayer:
    """
    Centralized validation layer for all data inputs
    """
    
    @staticmethod
    def validate_email_field(email):
        """Validate email format"""
        if not email:
            raise ValidationError("Email is required")
        try:
            validate_email(email)
        except ValidationError:
            raise ValidationError("Invalid email format")
        return email.lower().strip()
    
    @staticmethod
    def validate_phone_number(phone):
        """Validate phone number format"""
        if not phone:
            return phone
        
        # Remove all non-digit characters
        cleaned = re.sub(r'[^\d]', '', phone)
        
        # Check if it's a valid length (10-15 digits)
        if len(cleaned) < 10 or len(cleaned) > 15:
            raise ValidationError("Phone number must be between 10-15 digits")
        
        return cleaned
    
    @staticmethod
    def validate_name(name, field_name="Name"):
        """Validate name fields"""
        if not name or not name.strip():
            raise ValidationError(f"{field_name} is required")
        
        # Check for minimum length
        if len(name.strip()) < 2:
            raise ValidationError(f"{field_name} must be at least 2 characters")
        
        # Check for maximum length
        if len(name.strip()) > 100:
            raise ValidationError(f"{field_name} must be less than 100 characters")
        
        # Check for valid characters (letters, spaces, hyphens, apostrophes)
        if not re.match(r"^[a-zA-Z\s\-'\.]+$", name.strip()):
            raise ValidationError(f"{field_name} contains invalid characters")
        
        return name.strip()
    
    @staticmethod
    def validate_budget(budget):
        """Validate budget amount"""
        if budget is None:
            raise ValidationError("Budget is required")
        
        try:
            budget_decimal = Decimal(str(budget))
        except (ValueError, TypeError):
            raise ValidationError("Budget must be a valid number")
        
        if budget_decimal <= 0:
            raise ValidationError("Budget must be greater than 0")
        
        if budget_decimal > Decimal('10000000'):  # 10 million limit
            raise ValidationError("Budget cannot exceed 10,000,000")
        
        return budget_decimal
    
    @staticmethod
    def validate_attendees(attendees):
        """Validate attendee count"""
        if attendees is None:
            raise ValidationError("Attendee count is required")
        
        try:
            attendees_int = int(attendees)
        except (ValueError, TypeError):
            raise ValidationError("Attendee count must be a valid number")
        
        if attendees_int < 1:
            raise ValidationError("Must have at least 1 attendee")
        
        if attendees_int > 10000:
            raise ValidationError("Attendee count cannot exceed 10,000")
        
        return attendees_int
    
    @staticmethod
    def validate_event_date(event_date):
        """Validate event date"""
        if not event_date:
            raise ValidationError("Event date is required")
        
        # Handle string dates
        if isinstance(event_date, str):
            try:
                event_date = datetime.strptime(event_date, '%Y-%m-%d').date()
            except ValueError:
                try:
                    event_date = datetime.strptime(event_date, '%Y-%m-%dT%H:%M:%S').date()
                except ValueError:
                    raise ValidationError("Invalid date format. Use YYYY-MM-DD")
        
        # Check if date is in the future
        if event_date < date.today():
            raise ValidationError("Event date cannot be in the past")
        
        return event_date
    
    @staticmethod
    def validate_json_field(data, field_name="Data"):
        """Validate JSON field data"""
        if data is None:
            return {}
        
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                raise ValidationError(f"{field_name} must be valid JSON")
        
        if not isinstance(data, dict):
            raise ValidationError(f"{field_name} must be a JSON object")
        
        return data
    
    @staticmethod
    def validate_choice_field(value, choices, field_name="Field"):
        """Validate choice field values"""
        if not value:
            raise ValidationError(f"{field_name} is required")
        
        valid_choices = [choice[0] for choice in choices]
        if value not in valid_choices:
            raise ValidationError(f"Invalid {field_name}. Must be one of: {', '.join(valid_choices)}")
        
        return value
    
    @staticmethod
    def validate_text_field(text, min_length=0, max_length=1000, field_name="Text"):
        """Validate text fields"""
        if text is None:
            text = ""
        
        text = str(text).strip()
        
        if len(text) < min_length:
            raise ValidationError(f"{field_name} must be at least {min_length} characters")
        
        if len(text) > max_length:
            raise ValidationError(f"{field_name} must be less than {max_length} characters")
        
        return text

class EventValidationMixin:
    """
    Mixin for event-specific validations
    """
    
    def validate_event_data(self, data):
        """Validate complete event data"""
        errors = {}
        
        # Validate required fields
        try:
            data['event_name'] = ValidationLayer.validate_name(
                data.get('event_name'), 'Event name'
            )
        except ValidationError as e:
            errors['event_name'] = str(e)
        
        try:
            data['total_budget'] = ValidationLayer.validate_budget(
                data.get('total_budget')
            )
        except ValidationError as e:
            errors['total_budget'] = str(e)
        
        try:
            data['attendees'] = ValidationLayer.validate_attendees(
                data.get('attendees')
            )
        except ValidationError as e:
            errors['attendees'] = str(e)
        
        # Validate form data
        if 'form_data' in data:
            try:
                form_data = ValidationLayer.validate_json_field(
                    data['form_data'], 'Form data'
                )
                
                # Validate client information in form data
                if 'clientEmail' in form_data:
                    try:
                        form_data['clientEmail'] = ValidationLayer.validate_email_field(
                            form_data['clientEmail']
                        )
                    except ValidationError as e:
                        errors['client_email'] = str(e)
                
                if 'clientName' in form_data:
                    try:
                        form_data['clientName'] = ValidationLayer.validate_name(
                            form_data['clientName'], 'Client name'
                        )
                    except ValidationError as e:
                        errors['client_name'] = str(e)
                
                if 'clientPhone' in form_data:
                    try:
                        form_data['clientPhone'] = ValidationLayer.validate_phone_number(
                            form_data['clientPhone']
                        )
                    except ValidationError as e:
                        errors['client_phone'] = str(e)
                
                data['form_data'] = form_data
                
            except ValidationError as e:
                errors['form_data'] = str(e)
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data

class QuoteValidationMixin:
    """
    Mixin for quote request validations
    """
    
    def validate_quote_data(self, data):
        """Validate quote request data"""
        errors = {}
        
        # Validate required fields
        try:
            data['client_name'] = ValidationLayer.validate_name(
                data.get('client_name'), 'Client name'
            )
        except ValidationError as e:
            errors['client_name'] = str(e)
        
        try:
            data['client_email'] = ValidationLayer.validate_email_field(
                data.get('client_email')
            )
        except ValidationError as e:
            errors['client_email'] = str(e)
        
        try:
            data['event_date'] = ValidationLayer.validate_event_date(
                data.get('event_date')
            )
        except ValidationError as e:
            errors['event_date'] = str(e)
        
        try:
            data['guest_count'] = ValidationLayer.validate_attendees(
                data.get('guest_count')
            )
        except ValidationError as e:
            errors['guest_count'] = str(e)
        
        # Validate optional phone
        if data.get('client_phone'):
            try:
                data['client_phone'] = ValidationLayer.validate_phone_number(
                    data['client_phone']
                )
            except ValidationError as e:
                errors['client_phone'] = str(e)
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data