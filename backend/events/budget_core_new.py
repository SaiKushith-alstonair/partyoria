from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import json

@dataclass
class BudgetRule:
    min_percentage: Decimal
    max_percentage: Decimal
    priority: int
    required: bool = False

@dataclass
class BudgetItem:
    category: str
    percentage: Decimal
    amount: Decimal
    locked: bool = False

class BudgetEngine:
    """Bulletproof budget allocation engine with 25 detailed categories"""
    
    CATEGORY_RULES = {
        # Food & Beverage
        'catering': BudgetRule(Decimal('15'), Decimal('45'), 1, True),
        'beverages': BudgetRule(Decimal('3'), Decimal('15'), 2),
        'special_dietary': BudgetRule(Decimal('2'), Decimal('10'), 3),
        
        # Venue & Location
        'venue_rental': BudgetRule(Decimal('10'), Decimal('35'), 4, True),
        'venue_setup': BudgetRule(Decimal('3'), Decimal('12'), 5),
        
        # Technical & Equipment
        'audio_visual': BudgetRule(Decimal('3'), Decimal('15'), 6),
        'lighting': BudgetRule(Decimal('2'), Decimal('12'), 7),
        'stage_setup': BudgetRule(Decimal('2'), Decimal('10'), 8),
        'recording_equipment': BudgetRule(Decimal('1'), Decimal('8'), 9),
        
        # Entertainment & Activities
        'entertainment': BudgetRule(Decimal('5'), Decimal('20'), 10),
        'music_dj': BudgetRule(Decimal('2'), Decimal('12'), 11),
        'special_performances': BudgetRule(Decimal('2'), Decimal('15'), 12),
        
        # Visual & Documentation
        'photography': BudgetRule(Decimal('3'), Decimal('15'), 13),
        'videography': BudgetRule(Decimal('2'), Decimal('12'), 14),
        
        # Decoration & Styling
        'decorations': BudgetRule(Decimal('5'), Decimal('20'), 15),
        'flowers': BudgetRule(Decimal('2'), Decimal('10'), 16),
        'special_themes': BudgetRule(Decimal('2'), Decimal('12'), 17),
        
        # Coordination & Management
        'event_coordination': BudgetRule(Decimal('3'), Decimal('15'), 18),
        'staff_management': BudgetRule(Decimal('2'), Decimal('10'), 19),
        
        # Support Services
        'transportation': BudgetRule(Decimal('1'), Decimal('12'), 20),
        'security': BudgetRule(Decimal('1'), Decimal('8'), 21),
        'beauty_services': BudgetRule(Decimal('1'), Decimal('8'), 22),
        'guest_services': BudgetRule(Decimal('1'), Decimal('8'), 23),
        
        # Miscellaneous
        'other_services': BudgetRule(Decimal('2'), Decimal('10'), 24),
        'contingency': BudgetRule(Decimal('5'), Decimal('15'), 25, True)
    }
    
    EVENT_PRESETS = {
        'wedding': {
            'catering': Decimal('25'), 'venue_rental': Decimal('20'), 'decorations': Decimal('12'),
            'photography': Decimal('8'), 'videography': Decimal('6'), 'flowers': Decimal('6'),
            'music_dj': Decimal('5'), 'beauty_services': Decimal('4'), 'transportation': Decimal('3'),
            'event_coordination': Decimal('4'), 'contingency': Decimal('7')
        },
        'corporate': {
            'venue_rental': Decimal('25'), 'catering': Decimal('20'), 'audio_visual': Decimal('12'),
            'stage_setup': Decimal('8'), 'event_coordination': Decimal('8'), 'beverages': Decimal('6'),
            'photography': Decimal('5'), 'transportation': Decimal('6'), 'security': Decimal('3'),
            'other_services': Decimal('2'), 'contingency': Decimal('5')
        },
        'birthday': {
            'catering': Decimal('25'), 'venue_rental': Decimal('18'), 'entertainment': Decimal('15'),
            'decorations': Decimal('12'), 'special_performances': Decimal('8'), 'photography': Decimal('6'),
            'beverages': Decimal('5'), 'guest_services': Decimal('4'), 'contingency': Decimal('7')
        }
    }
    
    @classmethod
    def validate_allocation(cls, allocations: Dict[str, Decimal], total_budget: Decimal) -> Tuple[bool, List[str]]:
        """Validate budget allocation with strict rules"""
        errors = []
        total_percentage = sum(allocations.values())
        
        if abs(total_percentage - Decimal('100')) > Decimal('0.01'):
            errors.append(f"Total must be 100%, got {total_percentage}%")
        
        for category, percentage in allocations.items():
            if category in cls.CATEGORY_RULES:
                rule = cls.CATEGORY_RULES[category]
                if percentage < rule.min_percentage:
                    errors.append(f"{category}: minimum {rule.min_percentage}%, got {percentage}%")
                if percentage > rule.max_percentage:
                    errors.append(f"{category}: maximum {rule.max_percentage}%, got {percentage}%")
        
        required_categories = [cat for cat, rule in cls.CATEGORY_RULES.items() if rule.required]
        for category in required_categories:
            if category not in allocations or allocations[category] == 0:
                errors.append(f"Required category missing: {category}")
        
        return len(errors) == 0, errors
    
    @classmethod
    def auto_allocate(cls, event_type: str, selected_services: List[str], 
                     total_budget: Decimal, attendees: int, special_requirements: Dict = None) -> Dict[str, BudgetItem]:
        """Generate smart allocation based on event type and services"""
        
        base_allocation = cls.EVENT_PRESETS.get(event_type, cls.EVENT_PRESETS['corporate']).copy()
        
        service_weights = cls._calculate_service_weights(selected_services)
        
        for category, weight in service_weights.items():
            if category in base_allocation:
                base_allocation[category] *= weight
        
        if special_requirements:
            answer_adjustments = cls._calculate_answer_adjustments(special_requirements)
            for category, multiplier in answer_adjustments.items():
                if category in base_allocation:
                    base_allocation[category] *= multiplier
        
        total = sum(base_allocation.values())
        for category in base_allocation:
            base_allocation[category] = (base_allocation[category] / total * Decimal('100')).quantize(Decimal('0.1'))
        
        budget_items = {}
        for category, percentage in base_allocation.items():
            amount = (total_budget * percentage / Decimal('100')).quantize(Decimal('0.01'))
            budget_items[category] = BudgetItem(category, percentage, amount)
        
        return budget_items
    
    @classmethod
    def _calculate_service_weights(cls, services: List[str]) -> Dict[str, Decimal]:
        """Calculate category weights based on selected services"""
        weights = {cat: Decimal('1.0') for cat in cls.CATEGORY_RULES.keys()}
        
        service_map = {
            'catering': ['catering', 'food', 'menu', 'cake', 'cuisine', 'meal'],
            'beverages': ['beverage', 'drink', 'juice', 'bar', 'cocktail'],
            'venue_rental': ['venue', 'hall', 'location', 'space', 'facility'],
            'venue_setup': ['setup', 'arrangement', 'seating', 'layout'],
            'decorations': ['decoration', 'decor', 'styling', 'theme'],
            'flowers': ['flower', 'floral', 'bouquet', 'garland'],
            'entertainment': ['entertainment', 'show', 'performance', 'activity'],
            'music_dj': ['dj', 'band', 'music', 'orchestra', 'singer'],
            'special_performances': ['magic', 'dance', 'artist', 'performer'],
            'photography': ['photo', 'photographer', 'picture'],
            'videography': ['video', 'filming', 'cinematography'],
            'audio_visual': ['sound', 'audio', 'microphone', 'projection'],
            'lighting': ['lights', 'led', 'illumination', 'spotlight'],
            'stage_setup': ['stage', 'platform', 'podium', 'backdrop'],
            'event_coordination': ['coordination', 'management', 'planning'],
            'transportation': ['transport', 'travel', 'vehicle', 'car'],
            'security': ['security', 'guard', 'safety'],
            'beauty_services': ['beauty', 'makeup', 'hair', 'styling']
        }
        
        for service in services:
            service_lower = service.lower()
            for category, keywords in service_map.items():
                if any(keyword in service_lower for keyword in keywords):
                    weights[category] *= Decimal('1.2')
        
        return weights
    
    @classmethod
    def _map_requirement_to_category(cls, req_id: str) -> str:
        """Map requirement ID to detailed budget category"""
        req_lower = req_id.lower().replace('-', ' ')
        
        # Food & Beverage
        if any(word in req_lower for word in ['catering', 'food', 'menu', 'meal', 'cuisine', 'buffet', 'dining']):
            return 'catering'
        elif any(word in req_lower for word in ['beverage', 'drink', 'juice', 'tea', 'coffee', 'bar']):
            return 'beverages'
        elif any(word in req_lower for word in ['dietary', 'vegan', 'halal', 'kosher', 'allergy']):
            return 'special_dietary'
        
        # Venue & Location
        elif any(word in req_lower for word in ['venue', 'hall', 'location', 'space', 'room', 'facility']):
            return 'venue_rental'
        elif any(word in req_lower for word in ['setup', 'arrangement', 'layout', 'seating']):
            return 'venue_setup'
        
        # Technical & Equipment
        elif any(word in req_lower for word in ['audio', 'visual', 'sound', 'microphone', 'speaker', 'projection']):
            return 'audio_visual'
        elif any(word in req_lower for word in ['lighting', 'light', 'led', 'illumination', 'spotlight']):
            return 'lighting'
        elif any(word in req_lower for word in ['stage', 'platform', 'podium', 'backdrop']):
            return 'stage_setup'
        elif any(word in req_lower for word in ['recording', 'equipment', 'camera', 'technical']):
            return 'recording_equipment'
        
        # Entertainment & Activities
        elif any(word in req_lower for word in ['entertainment', 'show', 'performance', 'activity', 'game']):
            return 'entertainment'
        elif any(word in req_lower for word in ['music', 'dj', 'band', 'orchestra', 'singer']):
            return 'music_dj'
        elif any(word in req_lower for word in ['magic', 'dance', 'artist', 'performer', 'act']):
            return 'special_performances'
        
        # Visual & Documentation
        elif any(word in req_lower for word in ['photography', 'photo', 'photographer', 'picture']):
            return 'photography'
        elif any(word in req_lower for word in ['videography', 'video', 'filming', 'cinematography']):
            return 'videography'
        
        # Decoration & Styling
        elif any(word in req_lower for word in ['decoration', 'decor', 'styling', 'theme', 'design']):
            return 'decorations'
        elif any(word in req_lower for word in ['flower', 'floral', 'bouquet', 'garland', 'rangoli']):
            return 'flowers'
        elif any(word in req_lower for word in ['special', 'custom', 'unique', 'personalized']):
            return 'special_themes'
        
        # Coordination & Management
        elif any(word in req_lower for word in ['coordination', 'management', 'planning', 'organizing']):
            return 'event_coordination'
        elif any(word in req_lower for word in ['staff', 'crew', 'team', 'personnel', 'helper']):
            return 'staff_management'
        
        # Support Services
        elif any(word in req_lower for word in ['transportation', 'transport', 'travel', 'vehicle', 'car']):
            return 'transportation'
        elif any(word in req_lower for word in ['security', 'guard', 'safety', 'protection']):
            return 'security'
        elif any(word in req_lower for word in ['beauty', 'makeup', 'hair', 'styling', 'grooming']):
            return 'beauty_services'
        elif any(word in req_lower for word in ['guest', 'hospitality', 'service', 'assistance']):
            return 'guest_services'
        
        # Default
        else:
            return 'other_services'
    
    @classmethod
    def _calculate_answer_adjustments(cls, special_requirements: Dict) -> Dict[str, Decimal]:
        """Calculate budget adjustments based on requirement answers"""
        adjustments = {}
        
        for req_id, req_data in special_requirements.items():
            if not req_data.get('selected') or 'answers' not in req_data:
                continue
            
            category = cls._map_requirement_to_category(req_id)
            if not category:
                continue
            
            multiplier = Decimal('1.0')
            answers = req_data['answers']
            
            for answer in answers.values():
                answer_lower = str(answer).lower()
                
                # Quality adjustments
                if 'basic' in answer_lower or 'standard' in answer_lower:
                    multiplier *= Decimal('1.0')
                elif 'premium' in answer_lower or 'professional' in answer_lower:
                    multiplier *= Decimal('1.4')
                elif 'luxury' in answer_lower or 'high-end' in answer_lower:
                    multiplier *= Decimal('1.8')
                
                # Scope adjustments
                if 'small scope' in answer_lower:
                    multiplier *= Decimal('0.8')
                elif 'medium scope' in answer_lower:
                    multiplier *= Decimal('1.0')
                elif 'large scope' in answer_lower or 'comprehensive' in answer_lower:
                    multiplier *= Decimal('1.3')
                
                # Duration adjustments
                if 'few hours' in answer_lower or 'half day' in answer_lower:
                    multiplier *= Decimal('0.7')
                elif 'full day' in answer_lower:
                    multiplier *= Decimal('1.2')
                elif 'multi-day' in answer_lower:
                    multiplier *= Decimal('1.8')
                
                # Feature adjustments
                if any(word in answer_lower for word in ['led', 'effects', 'multiple', 'advanced']):
                    multiplier *= Decimal('1.2')
            
            adjustments[category] = adjustments.get(category, Decimal('1.0')) * multiplier
        
        return adjustments
    
    @classmethod
    def calculate_cost_breakdown(cls, budget_items: Dict[str, BudgetItem], 
                               attendees: int, duration: int) -> Dict[str, Dict]:
        """Calculate detailed cost breakdown"""
        breakdown = {}
        
        for category, item in budget_items.items():
            breakdown[category] = {
                'percentage': float(item.percentage),
                'amount': float(item.amount),
                'per_guest': float(item.amount / attendees) if attendees > 0 else 0,
                'per_hour': float(item.amount / duration) if duration > 0 else 0,
                'locked': item.locked
            }
        
        return breakdown