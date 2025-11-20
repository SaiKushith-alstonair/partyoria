from django.core.management.base import BaseCommand
from events.models import RequirementQuestion, EventRequirement

class Command(BaseCommand):
    help = 'Fix remaining generic questions with specific contextual ones'

    def handle(self, *args, **options):
        # Get all requirements with generic fallback questions
        generic_questions = RequirementQuestion.objects.filter(
            question_text__icontains='What specific'
        )
        
        requirements_to_fix = set(q.requirement for q in generic_questions)
        
        updated_count = 0
        
        for requirement in requirements_to_fix:
            req_id = requirement.requirement_id
            label = requirement.label
            
            # Delete existing generic questions
            RequirementQuestion.objects.filter(requirement=requirement).delete()
            
            # Create specific questions based on requirement type
            questions = self.get_contextual_questions(req_id, label)
            
            for q_data in questions:
                RequirementQuestion.objects.create(
                    requirement=requirement,
                    **q_data
                )
            
            updated_count += 1
            self.stdout.write(f'Fixed {requirement.event_id}/{req_id}: {label}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Fixed {updated_count} requirements with contextual questions')
        )
    
    def get_contextual_questions(self, req_id, label):
        """Generate contextual questions based on requirement type"""
        
        # Environmental/Tree Planting
        if 'environmental' in req_id or 'environmental' in label.lower():
            return [
                {'question_text': 'What environmental topics should be covered?', 'question_type': 'checkbox', 'options': ['Tree Planting Benefits', 'Climate Change', 'Biodiversity', 'Sustainability', 'Conservation'], 'is_required': True, 'order': 1},
                {'question_text': 'What age group will participate?', 'question_type': 'dropdown', 'options': ['Children (5-12)', 'Teenagers (13-18)', 'Adults (18+)', 'Mixed Ages'], 'is_required': True, 'order': 2}
            ]
        
        # Educators/Instructors
        elif 'instructor' in req_id or 'instructor' in label.lower() or 'educator' in req_id:
            return [
                {'question_text': f'What level of {label.lower()} expertise needed?', 'question_type': 'dropdown', 'options': ['Beginner Level', 'Intermediate Level', 'Advanced Level', 'Expert Level'], 'is_required': True, 'order': 1},
                {'question_text': 'How many participants will they teach?', 'question_type': 'dropdown', 'options': ['1-10 people', '11-25 people', '26-50 people', '50+ people'], 'is_required': True, 'order': 2}
            ]
        
        # Coordination/Planning
        elif 'coordination' in req_id or 'planning' in req_id or 'coordinator' in label.lower():
            return [
                {'question_text': f'What {label.lower()} services do you need?', 'question_type': 'checkbox', 'options': ['Event Planning', 'Vendor Management', 'Timeline Coordination', 'Day-of Coordination'], 'is_required': True, 'order': 1},
                {'question_text': 'Event complexity level?', 'question_type': 'dropdown', 'options': ['Simple Event', 'Moderate Complexity', 'Complex Event', 'Multi-day Event'], 'is_required': True, 'order': 2}
            ]
        
        # Transportation
        elif 'transportation' in req_id or 'transport' in label.lower():
            return [
                {'question_text': 'What type of transportation needed?', 'question_type': 'dropdown', 'options': ['Bus/Coach', 'Private Cars', 'Trucks for Equipment', 'Mixed Transportation'], 'is_required': True, 'order': 1},
                {'question_text': 'How many people/items to transport?', 'question_type': 'number', 'min_value': 1, 'max_value': 500, 'is_required': True, 'order': 2}
            ]
        
        # Site/Venue related
        elif 'site' in req_id or 'venue' in req_id or 'preparation' in req_id:
            return [
                {'question_text': f'What {label.lower()} work is needed?', 'question_type': 'checkbox', 'options': ['Site Cleaning', 'Setup Preparation', 'Safety Measures', 'Equipment Installation'], 'is_required': True, 'order': 1},
                {'question_text': 'Site size/area?', 'question_type': 'dropdown', 'options': ['Small Area', 'Medium Area', 'Large Area', 'Multiple Locations'], 'is_required': True, 'order': 2}
            ]
        
        # Documentation/Recording
        elif 'documentation' in req_id or 'recording' in req_id or 'progress' in req_id:
            return [
                {'question_text': f'What type of {label.lower()} do you need?', 'question_type': 'checkbox', 'options': ['Photo Documentation', 'Video Recording', 'Written Reports', 'Progress Tracking'], 'is_required': True, 'order': 1},
                {'question_text': 'Documentation frequency?', 'question_type': 'dropdown', 'options': ['Real-time', 'Hourly Updates', 'Daily Summary', 'Final Report Only'], 'is_required': False, 'order': 2}
            ]
        
        # Soil/Fertilizer
        elif 'soil' in req_id or 'fertilizer' in req_id:
            return [
                {'question_text': 'What soil preparation is needed?', 'question_type': 'checkbox', 'options': ['Soil Testing', 'Organic Compost', 'Fertilizer Mix', 'Mulch Application'], 'is_required': True, 'order': 1},
                {'question_text': 'Area size for soil treatment?', 'question_type': 'dropdown', 'options': ['Small (up to 100 sq ft)', 'Medium (100-500 sq ft)', 'Large (500+ sq ft)'], 'is_required': True, 'order': 2}
            ]
        
        # Photography/Videography
        elif 'photography' in req_id or 'photo' in label.lower() or 'video' in req_id:
            return [
                {'question_text': f'What {label.lower()} coverage do you need?', 'question_type': 'checkbox', 'options': ['Event Highlights', 'Participant Activities', 'Behind-the-Scenes', 'Formal Group Photos'], 'is_required': True, 'order': 1},
                {'question_text': 'Delivery timeline for photos/videos?', 'question_type': 'dropdown', 'options': ['Same Day', 'Within 3 Days', 'Within 1 Week', 'Within 2 Weeks'], 'is_required': False, 'order': 2}
            ]
        
        # Default contextual questions
        else:
            # Extract key words from label for better context
            if 'cake' in label.lower():
                return [
                    {'question_text': f'What size {label.lower()} do you need?', 'question_type': 'dropdown', 'options': ['Small (serves 10-20)', 'Medium (serves 20-40)', 'Large (serves 40+)'], 'is_required': True, 'order': 1},
                    {'question_text': 'Any dietary restrictions?', 'question_type': 'checkbox', 'options': ['Vegetarian', 'Vegan', 'Gluten-Free', 'Sugar-Free', 'No Restrictions'], 'is_required': False, 'order': 2}
                ]
            elif 'music' in label.lower() or 'sound' in label.lower():
                return [
                    {'question_text': f'What {label.lower()} setup do you prefer?', 'question_type': 'dropdown', 'options': ['Background Music', 'Live Performance', 'DJ Setup', 'Full Band'], 'is_required': True, 'order': 1},
                    {'question_text': 'Music genre preference?', 'question_type': 'text', 'placeholder': 'Specify preferred music style', 'is_required': False, 'order': 2}
                ]
            elif 'decoration' in label.lower() or 'design' in label.lower():
                return [
                    {'question_text': f'What {label.lower()} style do you prefer?', 'question_type': 'dropdown', 'options': ['Traditional', 'Modern', 'Elegant', 'Festive', 'Custom Theme'], 'is_required': True, 'order': 1},
                    {'question_text': 'Color scheme preference?', 'question_type': 'text', 'placeholder': 'Specify preferred colors', 'is_required': False, 'order': 2}
                ]
            else:
                return [
                    {'question_text': f'What type of {label.lower()} service do you need?', 'question_type': 'text', 'placeholder': f'Describe your {label.lower()} requirements', 'is_required': True, 'order': 1},
                    {'question_text': f'Experience level preferred for {label.lower()}?', 'question_type': 'dropdown', 'options': ['Entry Level', 'Experienced', 'Expert Level'], 'is_required': False, 'order': 2}
                ]