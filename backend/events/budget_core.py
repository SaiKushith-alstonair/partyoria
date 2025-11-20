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
    """Bulletproof budget allocation engine"""
    
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
            'catering': Decimal('35'), 'venue': Decimal('25'), 'decorations': Decimal('15'),
            'photography': Decimal('10'), 'entertainment': Decimal('8'), 'contingency': Decimal('7')
        },
        'corporate': {
            'venue': Decimal('30'), 'catering': Decimal('25'), 'audio_visual': Decimal('15'),
            'entertainment': Decimal('10'), 'decorations': Decimal('8'), 'transport': Decimal('7'), 'contingency': Decimal('5')
        },
        'birthday': {
            'catering': Decimal('30'), 'venue': Decimal('20'), 'entertainment': Decimal('20'),
            'decorations': Decimal('15'), 'photography': Decimal('8'), 'contingency': Decimal('7')
        }
    }
    
    @classmethod
    def validate_allocation(cls, allocations: Dict[str, Decimal], total_budget: Decimal) -> Tuple[bool, List[str]]:
        """Validate budget allocation with strict rules"""
        errors = []
        total_percentage = sum(allocations.values())
        
        # Check total is 100%
        if abs(total_percentage - Decimal('100')) > Decimal('0.01'):
            errors.append(f"Total must be 100%, got {total_percentage}%")
        
        # Check category rules
        for category, percentage in allocations.items():
            if category in cls.CATEGORY_RULES:
                rule = cls.CATEGORY_RULES[category]
                if percentage < rule.min_percentage:
                    errors.append(f"{category}: minimum {rule.min_percentage}%, got {percentage}%")
                if percentage > rule.max_percentage:
                    errors.append(f"{category}: maximum {rule.max_percentage}%, got {percentage}%")
        
        # Check required categories
        required_categories = [cat for cat, rule in cls.CATEGORY_RULES.items() if rule.required]
        for category in required_categories:
            if category not in allocations or allocations[category] == 0:
                errors.append(f"Required category missing: {category}")
        
        return len(errors) == 0, errors
    
    @classmethod
    def auto_allocate(cls, event_type: str, selected_services: List[str], 
                     total_budget: Decimal, attendees: int, special_requirements: Dict = None) -> Dict[str, BudgetItem]:
        """Generate smart allocation based on event type and services"""
        
        # Start with preset
        base_allocation = cls.EVENT_PRESETS.get(event_type, cls.EVENT_PRESETS['corporate']).copy()
        
        # Adjust for selected services
        service_weights = cls._calculate_service_weights(selected_services)
        
        # Apply service adjustments
        for category, weight in service_weights.items():
            if category in base_allocation:
                base_allocation[category] *= weight
        
        # Apply tradition/food adjustments
        if 'traditional' in ' '.join(selected_services).lower():
            base_allocation['decorations'] = base_allocation.get('decorations', Decimal('15')) * Decimal('1.3')
            base_allocation['catering'] = base_allocation.get('catering', Decimal('30')) * Decimal('1.1')
        
        if any('vegetarian' in s.lower() or 'non-vegetarian' in s.lower() for s in selected_services):
            base_allocation['catering'] = base_allocation.get('catering', Decimal('30')) * Decimal('1.2')
        
        # Apply answer-based adjustments
        if special_requirements:
            answer_adjustments = cls._calculate_answer_adjustments(special_requirements)
            for category, multiplier in answer_adjustments.items():
                if category in base_allocation:
                    base_allocation[category] *= multiplier
        
        # Normalize to 100%
        total = sum(base_allocation.values())
        for category in base_allocation:
            base_allocation[category] = (base_allocation[category] / total * Decimal('100')).quantize(Decimal('0.1'))
        
        # Create budget items
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
    def rebalance_allocation(cls, allocations: Dict[str, Decimal], 
                           locked_categories: List[str] = None) -> Dict[str, Decimal]:
        """Rebalance allocation while respecting locked categories"""
        locked_categories = locked_categories or []
        
        # Calculate locked total
        locked_total = sum(allocations[cat] for cat in locked_categories if cat in allocations)
        remaining_percentage = Decimal('100') - locked_total
        
        # Get unlocked categories
        unlocked_categories = [cat for cat in allocations.keys() if cat not in locked_categories]
        
        if not unlocked_categories or remaining_percentage <= 0:
            return allocations
        
        # Distribute remaining percentage proportionally
        unlocked_total = sum(allocations[cat] for cat in unlocked_categories)
        
        if unlocked_total > 0:
            for category in unlocked_categories:
                proportion = allocations[category] / unlocked_total
                allocations[category] = (remaining_percentage * proportion).quantize(Decimal('0.1'))
        else:
            # Equal distribution
            equal_share = (remaining_percentage / len(unlocked_categories)).quantize(Decimal('0.1'))
            for category in unlocked_categories:
                allocations[category] = equal_share
        
        return allocations
    
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