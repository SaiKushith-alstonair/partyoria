from decimal import Decimal
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class SmartBudgetAllocator:
    """
    Smart budget allocation algorithm with weighted distribution system
    """
    
    # Base weights for each category - more balanced distribution
    BASE_WEIGHTS = {
        'catering': Decimal('35.0'),      # 35%
        'venue': Decimal('25.0'),         # 25%
        'decorations': Decimal('15.0'),   # 15%
        'entertainment': Decimal('10.0'), # 10%
        'photography': Decimal('10.0'),   # 10%
        'other_services': Decimal('5.0')  # 5%
    }
    
    # Event type adjustments (percentage points)
    EVENT_TYPE_MULTIPLIERS = {
        'wedding': {
            'photography': Decimal('5.0'),   # +5% for weddings
            'decorations': Decimal('5.0'),   # +5% for weddings
            'catering': Decimal('-5.0'),     # -5% from catering
            'venue': Decimal('-5.0'),        # -5% from venue
        },
        'corporate': {
            'venue': Decimal('10.0'),        # +10% for corporate
            'catering': Decimal('5.0'),      # +5% for corporate
            'entertainment': Decimal('-10.0'), # -10% entertainment
            'decorations': Decimal('-5.0'),   # -5% decorations
        },
        'birthday': {
            'entertainment': Decimal('10.0'), # +10% for birthdays
            'decorations': Decimal('5.0'),    # +5% decorations
            'catering': Decimal('-10.0'),     # -10% catering
            'venue': Decimal('-5.0'),         # -5% venue
        },
        'festival': {
            'entertainment': Decimal('15.0'), # +15% for festivals
            'decorations': Decimal('10.0'),   # +10% decorations
            'catering': Decimal('-15.0'),     # -15% catering
            'venue': Decimal('-10.0'),        # -10% venue
        }
    }
    
    # Venue type adjustments (percentage points)
    VENUE_TYPE_ADJUSTMENTS = {
        'outdoor': {
            'decorations': Decimal('3.0'),    # +3% decorations
            'other_services': Decimal('2.0'), # +2% other services
            'venue': Decimal('-5.0'),         # -5% venue
        },
        'indoor': {
            'venue': Decimal('2.0'),          # +2% venue costs
            'other_services': Decimal('-2.0'), # -2% other services
        },
        'hybrid': {
            'venue': Decimal('3.0'),          # +3% venue
            'decorations': Decimal('2.0'),    # +2% decorations
            'other_services': Decimal('1.0'), # +1% other services
            'catering': Decimal('-6.0'),      # -6% catering
        }
    }
    
    # Category display name mapping
    CATEGORY_DISPLAY_NAMES = {
        'catering': 'Catering',
        'venue': 'Venue',
        'decorations': 'Decorations',
        'entertainment': 'Entertainment',
        'photography': 'Photography',
        'audio_visual': 'Audio Visual Equipment',
        'lighting': 'Lighting',
        'event_management': 'Event Management'
    }
    
    @classmethod
    def calculate_smart_allocation(cls, event_type: str, venue_type: str, 
                                 attendees: int, duration: int, 
                                 total_budget: Decimal, special_requirements: Dict = None, 
                                 selected_services_list: List[str] = None) -> Dict[str, Dict[str, Decimal]]:
        """
        Calculate smart budget allocation ONLY for selected services/requirements
        
        Returns:
            Dict with display_name -> {percentage, amount, per_guest_cost, per_hour_cost} mapping
        """
        try:
            # Get ALL selected services from both sources
            selected_services = cls._get_selected_services(special_requirements, selected_services_list)
            
            # Debug logging
            logger.info(f"Event type: {event_type}")
            logger.info(f"Special requirements: {special_requirements}")
            logger.info(f"Selected services found: {selected_services}")
            
            # Force extraction from special_requirements keys even if not marked as selected
            if not selected_services and special_requirements:
                # Extract all requirement keys as potential services
                selected_services = list(special_requirements.keys())
                logger.info(f"Using all requirement keys as services: {selected_services}")
            
            if not selected_services:
                # If still no services, check the event data structure
                logger.warning(f"No selected services found for event. Special requirements: {special_requirements}")
                # Force some basic services based on event type to avoid empty allocation
                if event_type == 'corporate':
                    selected_services = ['venue', 'catering', 'audio-visual-equipment']
                elif event_type == 'wedding':
                    selected_services = ['catering', 'venue', 'photography', 'decoration']
                else:
                    selected_services = ['catering', 'venue', 'entertainment']
                logger.info(f"Forced services based on event type: {selected_services}")
            
            # Smart service mapping - matches ANY keyword
            def map_service_to_category(service_name):
                service_lower = service_name.lower()
                
                # Photography & Video
                if any(word in service_lower for word in ['photo', 'video', 'bridal', 'camera', 'shoot']):
                    return 'photography'
                
                # Catering & Food
                if any(word in service_lower for word in ['catering', 'food', 'menu', 'cake', 'cuisine', 'buffet']):
                    return 'catering'
                
                # Decorations & Setup
                if any(word in service_lower for word in ['decoration', 'decor', 'setup', 'flower', 'balloon', 'mandap']):
                    return 'decorations'
                
                # Venue & Location
                if any(word in service_lower for word in ['venue', 'hall', 'location', 'space']):
                    return 'venue'
                
                # Entertainment & Music
                if any(word in service_lower for word in ['entertainment', 'music', 'dj', 'band', 'dance', 'magic', 'show', 'clown', 'games']):
                    return 'entertainment'
                
                # Audio Visual
                if any(word in service_lower for word in ['audio', 'visual', 'sound', 'microphone', 'projection']):
                    return 'audio_visual'
                
                # Lighting
                if any(word in service_lower for word in ['lighting', 'light', 'led', 'disco']):
                    return 'lighting'
                
                # Transport
                if any(word in service_lower for word in ['transport', 'car', 'vehicle', 'travel']):
                    return 'transport'
                
                # Security
                if any(word in service_lower for word in ['security', 'guard', 'safety']):
                    return 'security'
                
                return None
            
            # Map all services to categories
            selected_categories = set()
            for service in selected_services:
                category = map_service_to_category(service)
                if category:
                    selected_categories.add(category)
                    logger.info(f"Mapped '{service}' -> '{category}'")
                else:
                    logger.warning(f"No mapping for service: {service}")
            
            logger.info(f"Selected categories after mapping: {selected_categories}")
            
            # Ensure we have all services mapped
            if len(selected_categories) < len(selected_services):
                logger.warning(f"Only {len(selected_categories)} categories mapped from {len(selected_services)} services")
            
            # Force categories if none found
            if not selected_categories:
                if event_type == 'corporate':
                    selected_categories = {'venue', 'catering', 'audio_visual', 'photography', 'event_management'}
                elif event_type == 'wedding':
                    selected_categories = {'catering', 'venue', 'photography', 'decorations'}
                else:
                    selected_categories = {'catering', 'venue', 'entertainment'}
                logger.info(f"Forced categories: {selected_categories}")
            
            # Base weights for selected categories only
            category_base_weights = {
                'catering': Decimal('30.0'),
                'venue': Decimal('25.0'),
                'decorations': Decimal('20.0'),
                'entertainment': Decimal('15.0'),
                'photography': Decimal('20.0'),
                'audio_visual': Decimal('25.0'),
                'lighting': Decimal('15.0'),
                'event_management': Decimal('15.0')
            }
            
            # Start with weights only for selected categories
            weights = {}
            for category in selected_categories:
                weights[category] = category_base_weights.get(category, Decimal('20.0'))
            
            # Apply dynamic adjustments based on requirement answers
            if special_requirements:
                weights = cls._apply_requirement_adjustments(weights, special_requirements)
            
            # Apply attendee and duration adjustments only to relevant selected categories
            attendee_adjustment = cls._get_attendee_adjustment(attendees)
            duration_adjustment = cls._get_duration_adjustment(duration)
            
            if 'catering' in weights:
                weights['catering'] += attendee_adjustment + duration_adjustment
            if 'venue' in weights:
                weights['venue'] += attendee_adjustment
            if 'entertainment' in weights:
                weights['entertainment'] += duration_adjustment
            
            # Ensure minimum allocation per selected service
            if len(weights) > 0:
                min_percentage = Decimal('100.0') / len(weights) * Decimal('0.2')  # At least 20% of equal share
                for category in weights:
                    if weights[category] < min_percentage:
                        weights[category] = min_percentage
            
            # Normalize to 100%
            if not weights:
                return {}
                
            total_weight = sum(weights.values())
            if total_weight == 0:
                return {}
                
            percentages = {}
            for category, weight in weights.items():
                percentage = (weight / total_weight) * 100
                percentages[category] = percentage.quantize(Decimal('0.1'))
            
            # Ensure total is exactly 100%
            percentages = cls._normalize_percentages(percentages)
            
            # Calculate amounts with original service names and additional metrics
            allocation = {}
            
            # Create reverse mapping
            category_to_services = {}
            for service in selected_services:
                category = map_service_to_category(service)
                if category and category in percentages:
                    if category not in category_to_services:
                        category_to_services[category] = []
                    category_to_services[category].append(service)
            
            for category, percentage in percentages.items():
                amount = (total_budget * percentage / 100).quantize(Decimal('0.01'))
                
                # Use original service name if available, otherwise use display name
                if category in category_to_services and category_to_services[category]:
                    display_name = category_to_services[category][0]  # Use first original service name
                else:
                    display_name = cls.CATEGORY_DISPLAY_NAMES.get(category, category.replace('_', ' ').title())
                
                allocation[display_name] = {
                    'percentage': percentage,
                    'amount': amount,
                    'per_guest_cost': (amount / attendees).quantize(Decimal('0.01')) if attendees > 0 else Decimal('0'),
                    'per_hour_cost': (amount / duration).quantize(Decimal('0.01')) if duration > 0 else Decimal('0')
                }
            
            return allocation
            
        except Exception as e:
            logger.error(f"Error in smart allocation: {str(e)}")
            return cls._get_basic_allocation_by_event_type(event_type, total_budget)
    
    @classmethod
    def _get_attendee_adjustment(cls, attendees: int) -> Decimal:
        """Calculate percentage adjustment based on number of attendees"""
        if attendees <= 25:
            return Decimal('-2.0')  # -2% for small events
        elif attendees <= 50:
            return Decimal('0.0')   # No adjustment
        elif attendees <= 100:
            return Decimal('2.0')   # +2% for medium events
        elif attendees <= 200:
            return Decimal('4.0')   # +4% for large events
        else:
            return Decimal('6.0')   # +6% for very large events
    
    @classmethod
    def _get_duration_adjustment(cls, duration: int) -> Decimal:
        """Calculate percentage adjustment based on event duration"""
        if duration <= 2:
            return Decimal('-3.0')  # -3% for short events
        elif duration <= 4:
            return Decimal('0.0')   # No adjustment
        elif duration <= 8:
            return Decimal('3.0')   # +3% for long events
        else:
            return Decimal('5.0')   # +5% for very long events
    
    @classmethod
    def _normalize_percentages(cls, percentages: Dict[str, Decimal]) -> Dict[str, Decimal]:
        """Ensure percentages sum to exactly 100%"""
        if not percentages:
            return percentages
            
        total = sum(percentages.values())
        
        if total == 100:
            return percentages
        
        # Adjust the largest category to make total 100%
        largest_category = max(percentages.keys(), key=lambda k: percentages[k])
        adjustment = Decimal('100.00') - total
        percentages[largest_category] += adjustment
        
        return percentages
    
    @classmethod
    def _get_basic_allocation_by_event_type(cls, event_type: str, total_budget: Decimal) -> Dict[str, Dict[str, Decimal]]:
        """Basic allocation based on event type when no specific services selected"""
        if event_type == 'corporate':
            percentages = {
                'venue': Decimal('40.00'),
                'catering': Decimal('35.00'),
                'audio_visual': Decimal('25.00')
            }
        elif event_type == 'wedding':
            percentages = {
                'catering': Decimal('35.00'),
                'venue': Decimal('25.00'),
                'photography': Decimal('20.00'),
                'decorations': Decimal('20.00')
            }
        else:
            percentages = {
                'catering': Decimal('40.00'),
                'venue': Decimal('35.00'),
                'entertainment': Decimal('25.00')
            }
        
        allocation = {}
        for category, percentage in percentages.items():
            amount = (total_budget * percentage / 100).quantize(Decimal('0.01'))
            display_name = cls.CATEGORY_DISPLAY_NAMES.get(category, category.replace('_', ' ').title())
            
            allocation[display_name] = {
                'percentage': percentage,
                'amount': amount,
                'per_guest_cost': Decimal('0'),
                'per_hour_cost': Decimal('0')
            }
        
        return allocation
    
    @classmethod
    def _get_fallback_allocation(cls, total_budget: Decimal) -> Dict[str, Dict[str, Decimal]]:
        """Fallback allocation if calculation fails"""
        fallback_percentages = {
            'catering': Decimal('35.00'),
            'venue': Decimal('25.00'),
            'decorations': Decimal('15.00'),
            'entertainment': Decimal('10.00'),
            'photography': Decimal('10.00'),
            'other_services': Decimal('5.00')
        }
        
        allocation = {}
        for category, percentage in fallback_percentages.items():
            amount = (total_budget * percentage / 100).quantize(Decimal('0.01'))
            display_name = cls.CATEGORY_DISPLAY_NAMES.get(category, category.replace('_', ' ').title())
            
            allocation[display_name] = {
                'percentage': percentage,
                'amount': amount,
                'per_guest_cost': Decimal('0'),
                'per_hour_cost': Decimal('0')
            }
        
        return allocation
    
    @classmethod
    def _get_selected_services(cls, special_requirements: Dict, selected_services_list: List[str] = None) -> List[str]:
        """
        Extract ALL selected services from both special_requirements and selected_services list
        """
        all_services = []
        
        # Add from special_requirements
        if special_requirements:
            for req_id, req_data in special_requirements.items():
                if isinstance(req_data, dict) and req_data.get('selected', False):
                    all_services.append(req_id)
                elif req_data is True:  # Handle boolean values
                    all_services.append(req_id)
        
        # Add from selected_services list
        if selected_services_list:
            all_services.extend(selected_services_list)
        
        # Remove duplicates while preserving order
        return list(dict.fromkeys(all_services))
    
    @classmethod
    def _apply_requirement_adjustments(cls, weights: Dict[str, Decimal], 
                                     special_requirements: Dict) -> Dict[str, Decimal]:
        """
        Apply dynamic weight adjustments based on requirement answers
        """
        # Requirement to category mapping
        REQUIREMENT_CATEGORY_MAP = {
            'cake': 'catering', 'catering': 'catering', 'food': 'catering', 'menu-planning-design': 'catering',
            'decoration': 'decorations', 'balloon': 'decorations', 'flower': 'decorations',
            'photography': 'photography', 'videography': 'photography',
            'band': 'entertainment', 'dj': 'entertainment', 'music': 'entertainment',
            'venue': 'venue', 'hall': 'venue', 'location': 'venue', 'venues': 'venue',
            'audio-visual-equipment': 'audio_visual', 'audio': 'audio_visual', 'visual': 'audio_visual',
            'lighting-setup': 'lighting', 'lighting': 'lighting', 'light': 'lighting'
        }
        
        # Answer-based multipliers - more comprehensive and accurate
        ANSWER_MULTIPLIERS = {
            # Audio Visual Equipment - Sound Systems
            'basic pa system': Decimal('0.8'),
            'professional sound system': Decimal('1.4'),
            'concert-level audio': Decimal('1.8'),
            'wireless microphone system': Decimal('1.6'),
            # Audio Visual Equipment - Microphones
            '1-2 mics': Decimal('0.9'),
            '3-5 mics': Decimal('1.2'),
            '6-10 mics': Decimal('1.5'),
            '10+ mics': Decimal('1.8'),
            # Audio Visual Equipment - Projection
            'yes, projector only': Decimal('1.1'),
            'yes, led screen': Decimal('1.3'),
            'yes, both projector and screen': Decimal('1.5'),
            'no projection needed': Decimal('0.8'),
            # Lighting Setup - Mood
            'bright & energetic': Decimal('1.2'),
            'warm & cozy': Decimal('1.0'),
            'dramatic & moody': Decimal('1.4'),
            'colorful & dynamic': Decimal('1.5'),
            'elegant & subtle': Decimal('1.1'),
            # Lighting Setup - Effects
            'yes, disco lights': Decimal('1.3'),
            'yes, led effects': Decimal('1.4'),
            'yes, spotlights': Decimal('1.2'),
            'yes, uplighting': Decimal('1.3'),
            'no special effects': Decimal('0.8'),
            # Lighting Setup - Control
            'automated lighting': Decimal('1.5'),
            'manual control': Decimal('0.9'),
            'pre-programmed scenes': Decimal('1.3'),
            'live operator control': Decimal('1.6'),
            # Menu Planning - Cuisine
            'north indian': Decimal('1.1'),
            'south indian': Decimal('1.0'),
            'continental': Decimal('1.3'),
            'chinese': Decimal('1.2'),
            'italian': Decimal('1.4'),
            'multi-cuisine': Decimal('1.6'),
            'regional specialty': Decimal('1.3'),
            # Menu Planning - Courses
            '2 course meal': Decimal('1.0'),
            '3 course meal': Decimal('1.3'),
            '4 course meal': Decimal('1.6'),
            '5+ course meal': Decimal('2.0'),
            'buffet style': Decimal('1.4'),
            # Menu Planning - Timing
            'breakfast/brunch': Decimal('0.8'),
            'lunch': Decimal('1.0'),
            'high tea': Decimal('0.9'),
            'dinner': Decimal('1.2'),
            'late night snacks': Decimal('0.7'),
            # Menu Planning - Live Cooking
            'yes, multiple stations': Decimal('1.8'),
            'yes, 1-2 stations': Decimal('1.4'),
            'maybe, if budget allows': Decimal('1.1'),
            'no live cooking': Decimal('0.8'),
            # Venues - Atmosphere
            'elegant & formal': Decimal('1.4'),
            'casual & relaxed': Decimal('0.9'),
            'modern & trendy': Decimal('1.3'),
            'traditional & classic': Decimal('1.1'),
            'rustic & natural': Decimal('1.0'),
            # Venues - Capacity
            '50-100 guests': Decimal('1.0'),
            '100-200 guests': Decimal('1.2'),
            '200-500 guests': Decimal('1.5'),
            '500-1000 guests': Decimal('1.8'),
            '1000+ guests': Decimal('2.2'),
            # Venues - Outdoor Space
            'yes, essential': Decimal('1.4'),
            'yes, preferred': Decimal('1.2'),
            'no preference': Decimal('1.0'),
            'indoor only': Decimal('0.9')
        }
        
        for req_id, req_data in special_requirements.items():
            if not req_data.get('selected') or 'answers' not in req_data:
                continue
                
            # Find category for this requirement
            category = None
            req_id_lower = req_id.lower().replace(' ', '-')
            for keyword, cat in REQUIREMENT_CATEGORY_MAP.items():
                if keyword in req_id_lower or req_id_lower in keyword:
                    category = cat
                    break
            
            if not category or category not in weights:
                continue
                
            # Apply multipliers based on answers
            total_multiplier = Decimal('1.0')
            for answer in req_data['answers'].values():
                answer_lower = str(answer).lower()
                for key, multiplier in ANSWER_MULTIPLIERS.items():
                    if key == answer_lower:  # Exact match for better accuracy
                        total_multiplier *= multiplier
                        break
            
            # Apply the combined multiplier
            weights[category] *= total_multiplier
        
        return weights
    
    @classmethod
    def validate_manual_allocation(cls, allocations: Dict[str, Decimal], 
                                 total_budget: Decimal, attendees: int = 50, duration: int = 4) -> Tuple[bool, str, Dict[str, Dict[str, Decimal]]]:
        """
        Validate and auto-redistribute manual budget allocation
        
        Returns:
            (is_valid, error_message, normalized_allocation)
        """
        try:
            # Check for negative values
            for category, percentage in allocations.items():
                if percentage < 0:
                    return False, f"Negative allocation not allowed for {category}", {}
                if percentage > 100:
                    return False, f"Allocation cannot exceed 100% for {category}", {}
            
            total_percentage = sum(allocations.values())
            
            # Auto-redistribute if total is not 100%
            if abs(total_percentage - 100) > Decimal('0.01'):
                difference = Decimal('100') - total_percentage
                
                # Find categories with non-zero allocations to redistribute to
                redistributable_categories = [cat for cat, pct in allocations.items() if pct > 0]
                
                if redistributable_categories:
                    # Distribute the difference proportionally among existing allocations
                    redistribution_per_category = difference / len(redistributable_categories)
                    
                    for category in redistributable_categories:
                        allocations[category] += redistribution_per_category
                        # Ensure no category goes below 0 after redistribution
                        if allocations[category] < 0:
                            allocations[category] = Decimal('0')
                    
                    # Final normalization to ensure exactly 100%
                    total_after_redistribution = sum(allocations.values())
                    if total_after_redistribution != 100:
                        # Adjust the largest category to make it exactly 100%
                        largest_category = max(allocations.keys(), key=lambda k: allocations[k])
                        allocations[largest_category] += Decimal('100') - total_after_redistribution
            
            # Calculate amounts with additional metrics
            result = {}
            for category, percentage in allocations.items():
                amount = (total_budget * percentage / 100).quantize(Decimal('0.01'))
                result[category] = {
                    'percentage': percentage.quantize(Decimal('0.1')),
                    'amount': amount,
                    'per_guest_cost': (amount / attendees).quantize(Decimal('0.01')) if attendees > 0 else Decimal('0'),
                    'per_hour_cost': (amount / duration).quantize(Decimal('0.01')) if duration > 0 else Decimal('0')
                }
            
            return True, "", result
            
        except Exception as e:
            return False, f"Validation error: {str(e)}", {}