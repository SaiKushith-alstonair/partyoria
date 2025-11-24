from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class BudgetRule:
    min_percentage: Decimal
    max_percentage: Decimal
    priority: int
    required: bool = False
    display_name: str = ""

@dataclass
class BudgetItem:
    category: str
    percentage: Decimal
    amount: Decimal
    per_guest: Decimal = Decimal('0')
    per_hour: Decimal = Decimal('0')
    locked: bool = False

class BudgetEngine:
    """THE ONLY BUDGET ENGINE - All others are DELETED"""
    
    # UNIFIED CATEGORY RULES - One source of truth
    CATEGORY_RULES = {
        'catering': BudgetRule(Decimal('20'), Decimal('50'), 1, True, 'Catering & Food'),
        'venue': BudgetRule(Decimal('15'), Decimal('40'), 2, True, 'Venue & Location'),
        'decorations': BudgetRule(Decimal('5'), Decimal('25'), 3, False, 'Decorations'),
        'photography': BudgetRule(Decimal('5'), Decimal('20'), 4, False, 'Photography/Video'),
        'entertainment': BudgetRule(Decimal('5'), Decimal('20'), 5, False, 'Entertainment'),
        'audio_visual': BudgetRule(Decimal('3'), Decimal('15'), 6, False, 'Audio Visual'),
        'lighting': BudgetRule(Decimal('2'), Decimal('12'), 7, False, 'Lighting'),
        'transportation': BudgetRule(Decimal('2'), Decimal('15'), 8, False, 'Transportation'),
        'security': BudgetRule(Decimal('1'), Decimal('10'), 9, False, 'Security'),
        'contingency': BudgetRule(Decimal('5'), Decimal('15'), 10, True, 'Contingency')
    }
    
    # EVENT TYPE PRESETS - Market-tested allocations
    EVENT_PRESETS = {
        'wedding': {
            'catering': Decimal('30'), 'venue': Decimal('25'), 'decorations': Decimal('15'),
            'photography': Decimal('12'), 'entertainment': Decimal('8'), 'lighting': Decimal('3'),
            'contingency': Decimal('7')
        },
        'corporate': {
            'venue': Decimal('35'), 'catering': Decimal('25'), 'audio_visual': Decimal('15'),
            'entertainment': Decimal('8'), 'photography': Decimal('5'), 'transportation': Decimal('7'),
            'contingency': Decimal('5')
        },
        'birthday': {
            'catering': Decimal('35'), 'venue': Decimal('20'), 'entertainment': Decimal('20'),
            'decorations': Decimal('12'), 'photography': Decimal('6'), 'contingency': Decimal('7')
        }
    }
    
    # SERVICE TO CATEGORY MAPPING - Intelligent categorization
    SERVICE_MAPPING = {
        'catering': ['catering', 'food', 'menu', 'cake', 'cuisine', 'meal', 'buffet', 'dining'],
        'venue': ['venue', 'hall', 'location', 'space', 'facility', 'room'],
        'decorations': ['decoration', 'decor', 'styling', 'theme', 'flower', 'balloon', 'mandap'],
        'photography': ['photo', 'video', 'camera', 'shoot', 'cinematography'],
        'entertainment': ['entertainment', 'music', 'dj', 'band', 'dance', 'magic', 'show'],
        'audio_visual': ['audio', 'visual', 'sound', 'microphone', 'projection', 'speaker'],
        'lighting': ['lighting', 'light', 'led', 'illumination', 'spotlight'],
        'transportation': ['transport', 'travel', 'vehicle', 'car'],
        'security': ['security', 'guard', 'safety', 'protection']
    }
    
    @classmethod
    def smart_allocate(cls, event_type: str, selected_services: List[str], 
                      total_budget: Decimal, attendees: int, duration: int,
                      special_requirements: Dict = None) -> Dict[str, BudgetItem]:
        """Generate smart budget allocation - THE ONLY METHOD THAT MATTERS"""
        try:
            # Get base preset
            base_allocation = cls.EVENT_PRESETS.get(event_type, cls.EVENT_PRESETS['corporate']).copy()
            
            # Map services to categories
            mapped_categories = cls._map_services_to_categories(selected_services)
            
            # Filter allocation to only selected categories
            if mapped_categories:
                filtered_allocation = {cat: base_allocation.get(cat, Decimal('10')) 
                                     for cat in mapped_categories}
                # Always include contingency
                if 'contingency' not in filtered_allocation:
                    filtered_allocation['contingency'] = Decimal('5')
            else:
                filtered_allocation = base_allocation
            
            # Apply requirement adjustments
            if special_requirements:
                filtered_allocation = cls._apply_requirement_adjustments(
                    filtered_allocation, special_requirements
                )
            
            # Apply scale adjustments
            filtered_allocation = cls._apply_scale_adjustments(
                filtered_allocation, attendees, duration
            )
            
            # Normalize to 100%
            total = sum(filtered_allocation.values())
            if total > 0:
                for category in filtered_allocation:
                    filtered_allocation[category] = (
                        filtered_allocation[category] / total * Decimal('100')
                    ).quantize(Decimal('0.1'))
            
            # Create budget items
            budget_items = {}
            for category, percentage in filtered_allocation.items():
                amount = (total_budget * percentage / Decimal('100')).quantize(Decimal('0.01'))
                per_guest = (amount / attendees).quantize(Decimal('0.01')) if attendees > 0 else Decimal('0')
                per_hour = (amount / duration).quantize(Decimal('0.01')) if duration > 0 else Decimal('0')
                
                budget_items[category] = BudgetItem(
                    category=category,
                    percentage=percentage,
                    amount=amount,
                    per_guest=per_guest,
                    per_hour=per_hour
                )
            
            return budget_items
            
        except Exception as e:
            logger.error(f"Smart allocation failed: {e}")
            return cls._fallback_allocation(total_budget, attendees, duration)
    
    @classmethod
    def validate_allocation(cls, allocations: Dict[str, Decimal], 
                          total_budget: Decimal) -> Tuple[bool, List[str]]:
        """Validate budget allocation with iron-fist rules"""
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
                    errors.append(f"{rule.display_name}: minimum {rule.min_percentage}%")
                if percentage > rule.max_percentage:
                    errors.append(f"{rule.display_name}: maximum {rule.max_percentage}%")
        
        # Check required categories
        for category, rule in cls.CATEGORY_RULES.items():
            if rule.required and (category not in allocations or allocations[category] == 0):
                errors.append(f"Required: {rule.display_name}")
        
        return len(errors) == 0, errors
    
    @classmethod
    def rebalance_allocation(cls, allocations: Dict[str, Decimal], 
                           locked_categories: List[str] = None) -> Dict[str, Decimal]:
        """Rebalance allocation while respecting locks"""
        locked_categories = locked_categories or []
        
        # Calculate locked total
        locked_total = sum(allocations.get(cat, Decimal('0')) for cat in locked_categories)
        remaining = Decimal('100') - locked_total
        
        # Get unlocked categories
        unlocked = [cat for cat in allocations.keys() if cat not in locked_categories]
        
        if unlocked and remaining > 0:
            # Distribute remaining proportionally
            unlocked_total = sum(allocations.get(cat, Decimal('0')) for cat in unlocked)
            
            if unlocked_total > 0:
                for category in unlocked:
                    proportion = allocations[category] / unlocked_total
                    allocations[category] = (remaining * proportion).quantize(Decimal('0.1'))
            else:
                # Equal distribution
                equal_share = (remaining / len(unlocked)).quantize(Decimal('0.1'))
                for category in unlocked:
                    allocations[category] = equal_share
        
        return allocations
    
    @classmethod
    def calculate_breakdown(cls, budget_items: Dict[str, BudgetItem]) -> Dict[str, Dict]:
        """Calculate detailed breakdown for API response"""
        breakdown = {}
        for category, item in budget_items.items():
            rule = cls.CATEGORY_RULES.get(category)
            breakdown[category] = {
                'category': category,
                'display_name': rule.display_name if rule else category.replace('_', ' ').title(),
                'percentage': float(item.percentage),
                'amount': float(item.amount),
                'per_guest': float(item.per_guest),
                'per_hour': float(item.per_hour),
                'locked': item.locked,
                'required': rule.required if rule else False
            }
        return breakdown
    
    @classmethod
    def _map_services_to_categories(cls, services: List[str]) -> List[str]:
        """Map service names to budget categories"""
        categories = set()
        
        for service in services:
            service_lower = service.lower()
            for category, keywords in cls.SERVICE_MAPPING.items():
                if any(keyword in service_lower for keyword in keywords):
                    categories.add(category)
                    break
        
        return list(categories)
    
    @classmethod
    def _apply_requirement_adjustments(cls, allocation: Dict[str, Decimal], 
                                     requirements: Dict) -> Dict[str, Decimal]:
        """Apply adjustments based on special requirements"""
        multipliers = {
            'premium': Decimal('1.3'),
            'luxury': Decimal('1.5'),
            'professional': Decimal('1.2'),
            'basic': Decimal('0.9'),
            'multiple': Decimal('1.2'),
            'advanced': Decimal('1.3')
        }
        
        for req_id, req_data in requirements.items():
            if not req_data.get('selected'):
                continue
                
            # Find matching category
            category = None
            for cat, keywords in cls.SERVICE_MAPPING.items():
                if any(keyword in req_id.lower() for keyword in keywords):
                    category = cat
                    break
            
            if category and category in allocation:
                # Apply multipliers based on answers
                answers = req_data.get('answers', {})
                multiplier = Decimal('1.0')
                
                for answer in answers.values():
                    answer_lower = str(answer).lower()
                    for keyword, mult in multipliers.items():
                        if keyword in answer_lower:
                            multiplier *= mult
                            break
                
                allocation[category] *= multiplier
        
        return allocation
    
    @classmethod
    def _apply_scale_adjustments(cls, allocation: Dict[str, Decimal], 
                               attendees: int, duration: int) -> Dict[str, Decimal]:
        """Apply adjustments based on event scale"""
        # Attendee adjustments
        if attendees > 200:
            if 'catering' in allocation:
                allocation['catering'] *= Decimal('1.1')
            if 'security' in allocation:
                allocation['security'] *= Decimal('1.3')
        elif attendees < 25:
            if 'venue' in allocation:
                allocation['venue'] *= Decimal('0.9')
        
        # Duration adjustments
        if duration > 8:
            if 'entertainment' in allocation:
                allocation['entertainment'] *= Decimal('1.2')
            if 'catering' in allocation:
                allocation['catering'] *= Decimal('1.1')
        elif duration < 3:
            if 'entertainment' in allocation:
                allocation['entertainment'] *= Decimal('0.8')
        
        return allocation
    
    @classmethod
    def _fallback_allocation(cls, total_budget: Decimal, attendees: int, 
                           duration: int) -> Dict[str, BudgetItem]:
        """Fallback allocation when smart allocation fails"""
        fallback = {
            'catering': Decimal('35'),
            'venue': Decimal('25'),
            'decorations': Decimal('15'),
            'entertainment': Decimal('10'),
            'photography': Decimal('8'),
            'contingency': Decimal('7')
        }
        
        budget_items = {}
        for category, percentage in fallback.items():
            amount = (total_budget * percentage / Decimal('100')).quantize(Decimal('0.01'))
            per_guest = (amount / attendees).quantize(Decimal('0.01')) if attendees > 0 else Decimal('0')
            per_hour = (amount / duration).quantize(Decimal('0.01')) if duration > 0 else Decimal('0')
            
            budget_items[category] = BudgetItem(
                category=category,
                percentage=percentage,
                amount=amount,
                per_guest=per_guest,
                per_hour=per_hour
            )
        
        return budget_items