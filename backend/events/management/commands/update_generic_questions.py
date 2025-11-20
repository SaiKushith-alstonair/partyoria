from django.core.management.base import BaseCommand
from events.models import RequirementQuestion, EventRequirement

class Command(BaseCommand):
    help = 'Replace generic questions with requirement-specific questions'

    def handle(self, *args, **options):
        # Define requirement-specific questions
        def get_specific_questions(req_id, label):
            # Generate contextual questions based on requirement type
            if 'printing' in req_id or 'print' in label.lower():
                return [
                    {'question_text': f'What type of {label.lower()} do you need?', 'question_type': 'checkbox', 'options': ['Black & White', 'Color Printing', 'Premium Paper', 'Binding Service'], 'is_required': True, 'order': 1},
                    {'question_text': 'How many copies needed?', 'question_type': 'number', 'min_value': 1, 'max_value': 1000, 'is_required': True, 'order': 2}
                ]
            elif 'lighting' in req_id or 'light' in label.lower():
                return [
                    {'question_text': 'What lighting setup do you prefer?', 'question_type': 'dropdown', 'options': ['Basic Ambient', 'Mood Lighting', 'Stage Lighting', 'Full Production'], 'is_required': True, 'order': 1},
                    {'question_text': 'Venue size for lighting?', 'question_type': 'dropdown', 'options': ['Small (up to 50 people)', 'Medium (50-200)', 'Large (200+)'], 'is_required': True, 'order': 2}
                ]
            elif 'branding' in req_id or 'brand' in label.lower():
                return [
                    {'question_text': 'What branding elements do you need?', 'question_type': 'checkbox', 'options': ['Logo Display', 'Banners', 'Branded Materials', 'Digital Displays'], 'is_required': True, 'order': 1},
                    {'question_text': 'Brand visibility level?', 'question_type': 'dropdown', 'options': ['Subtle Integration', 'Moderate Presence', 'Prominent Display'], 'is_required': False, 'order': 2}
                ]
            elif 'stage' in req_id or 'stage' in label.lower():
                return [
                    {'question_text': 'What stage setup do you need?', 'question_type': 'dropdown', 'options': ['Simple Platform', 'Backdrop & Podium', 'Full Stage Production', 'Custom Design'], 'is_required': True, 'order': 1},
                    {'question_text': 'Expected audience size?', 'question_type': 'dropdown', 'options': ['Up to 100', '100-300', '300-500', '500+'], 'is_required': True, 'order': 2}
                ]
            elif 'badge' in req_id or 'badge' in label.lower():
                return [
                    {'question_text': 'What badge features do you need?', 'question_type': 'checkbox', 'options': ['Name & Title', 'Company Logo', 'QR Code', 'Color Coding', 'Lanyards'], 'is_required': True, 'order': 1},
                    {'question_text': 'How many badges needed?', 'question_type': 'number', 'min_value': 1, 'max_value': 1000, 'is_required': True, 'order': 2}
                ]
            elif 'catering' in req_id or 'food' in req_id or 'meal' in req_id:
                return [
                    {'question_text': f'What type of {label.lower()} service?', 'question_type': 'dropdown', 'options': ['Buffet Style', 'Plated Service', 'Cocktail Style', 'Food Stations'], 'is_required': True, 'order': 1},
                    {'question_text': 'How many people to serve?', 'question_type': 'number', 'min_value': 1, 'max_value': 1000, 'is_required': True, 'order': 2}
                ]
            elif 'photography' in req_id or 'photo' in label.lower():
                return [
                    {'question_text': 'What photography style do you prefer?', 'question_type': 'dropdown', 'options': ['Candid & Natural', 'Formal Portraits', 'Event Coverage', 'Mixed Style'], 'is_required': True, 'order': 1},
                    {'question_text': 'How long is your event?', 'question_type': 'dropdown', 'options': ['1-2 hours', '3-4 hours', '5-6 hours', 'Full day'], 'is_required': True, 'order': 2}
                ]
            elif 'music' in req_id or 'dj' in req_id or 'sound' in req_id:
                return [
                    {'question_text': 'What music setup do you need?', 'question_type': 'dropdown', 'options': ['Background Music', 'DJ with Mixing', 'Live Band Setup', 'Full Sound System'], 'is_required': True, 'order': 1},
                    {'question_text': 'Venue size for sound coverage?', 'question_type': 'dropdown', 'options': ['Small Room', 'Medium Hall', 'Large Venue', 'Outdoor Space'], 'is_required': True, 'order': 2}
                ]
            else:
                # Generic contextual questions based on label
                return [
                    {'question_text': f'What specific {label.lower()} do you need?', 'question_type': 'text', 'placeholder': f'Describe your {label.lower()} requirements', 'is_required': True, 'order': 1},
                    {'question_text': f'Service level for {label.lower()}?', 'question_type': 'dropdown', 'options': ['Basic', 'Standard', 'Premium'], 'is_required': False, 'order': 2}
                ]
        
        # Get all requirements with generic questions
        generic_questions = RequirementQuestion.objects.filter(question_text__icontains='Quantity or amount needed')
        requirements_to_update = set(q.requirement for q in generic_questions)
        
        updated_count = 0
        
        for requirement in requirements_to_update:
            req_id = requirement.requirement_id
            
            # Delete existing generic questions
            RequirementQuestion.objects.filter(requirement=requirement).delete()
            
            # Create new specific questions
            questions = get_specific_questions(req_id, requirement.label)
            for q_data in questions:
                RequirementQuestion.objects.create(
                    requirement=requirement,
                    **q_data
                )
            
            updated_count += 1
            self.stdout.write(f'Updated {requirement.event_id}/{req_id}: {requirement.label}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated_count} requirements with specific questions')
        )