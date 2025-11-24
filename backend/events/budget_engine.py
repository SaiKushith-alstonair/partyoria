from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import logging
import requests
import json
from datetime import datetime, timedelta
from django.core.cache import cache
from django.conf import settings
import math

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

class MarketIntelligence:
    """REAL-TIME MARKET DATA ENGINE"""
    
    # LOCATION COST MULTIPLIERS - Tier 1/2/3 cities
    LOCATION_MULTIPLIERS = {
        'mumbai': 1.8, 'delhi': 1.7, 'bangalore': 1.6, 'hyderabad': 1.4, 'chennai': 1.5,
        'pune': 1.3, 'kolkata': 1.2, 'ahmedabad': 1.1, 'jaipur': 1.0, 'lucknow': 0.9,
        'indore': 0.8, 'bhopal': 0.8, 'chandigarh': 1.2, 'kochi': 1.1, 'coimbatore': 0.9,
        'tier1': 1.6, 'tier2': 1.2, 'tier3': 0.9
    }
    
    # SEASONAL DEMAND MULTIPLIERS
    SEASONAL_MULTIPLIERS = {
        'wedding_season': {'oct': 1.4, 'nov': 1.6, 'dec': 1.8, 'jan': 1.5, 'feb': 1.3},
        'corporate_season': {'mar': 1.2, 'apr': 1.1, 'sep': 1.3, 'oct': 1.4, 'nov': 1.2},
        'festival_season': {'oct': 1.5, 'nov': 1.3, 'mar': 1.2, 'apr': 1.1}
    }
    
    # CATEGORY MARKET VOLATILITY
    VOLATILITY_FACTORS = {
        'catering': 0.3, 'venue': 0.2, 'decorations': 0.4, 'photography': 0.25,
        'entertainment': 0.35, 'audio_visual': 0.2, 'lighting': 0.3, 
        'transportation': 0.4, 'security': 0.15
    }
    
    @classmethod
    def get_location_multiplier(cls, location: str) -> Decimal:
        """Get location-based cost multiplier"""
        location_key = location.lower().strip() if location else 'tier3'
        multiplier = cls.LOCATION_MULTIPLIERS.get(location_key, 1.0)
        return Decimal(str(multiplier))
    
    @classmethod
    def get_seasonal_multiplier(cls, event_type: str, event_date: datetime = None) -> Decimal:
        """Calculate seasonal demand multiplier"""
        if not event_date:
            event_date = datetime.now()
        
        month_key = event_date.strftime('%b').lower()
        season_key = f"{event_type}_season"
        
        seasonal_data = cls.SEASONAL_MULTIPLIERS.get(season_key, {})
        multiplier = seasonal_data.get(month_key, 1.0)
        
        return Decimal(str(multiplier))
    
    @classmethod
    def get_supply_demand_factor(cls, category: str, location: str, attendees: int) -> Decimal:
        """Calculate supply-demand pricing factor"""
        cache_key = f"supply_demand_{category}_{location}_{attendees//50}"
        try:
            cached = cache.get(cache_key)
            if cached:
                return Decimal(str(cached))
        except Exception:
            pass  # Skip caching if Redis unavailable
        
        # Base demand calculation
        base_demand = 1.0
        
        # Attendee impact
        if attendees > 500:
            base_demand *= 1.3  # High demand for large events
        elif attendees > 200:
            base_demand *= 1.15
        elif attendees < 50:
            base_demand *= 0.95
        
        # Category-specific supply constraints
        if category in ['venue', 'photography']:
            base_demand *= 1.1  # Limited supply
        elif category in ['catering', 'decorations']:
            base_demand *= 1.05  # Moderate supply
        
        # Location impact
        location_mult = cls.get_location_multiplier(location)
        final_factor = base_demand * float(location_mult) * 0.5  # Normalize
        
        # Cache for 1 hour
        try:
            cache.set(cache_key, final_factor, 3600)
        except Exception:
            pass  # Skip caching if Redis unavailable
        return Decimal(str(final_factor))
    
    @classmethod
    def get_market_rates(cls, category: str, location: str) -> Dict[str, Decimal]:
        """Fetch real-time market rates (simulated with intelligent defaults)"""
        cache_key = f"market_rates_{category}_{location}"
        try:
            cached = cache.get(cache_key)
            if cached:
                return cached
        except Exception:
            pass  # Skip caching if Redis unavailable
        
        # BASE MARKET RATES PER GUEST (INR)
        base_rates = {
            'catering': {'min': 800, 'avg': 1200, 'max': 2500},
            'venue': {'min': 300, 'avg': 600, 'max': 1500},
            'decorations': {'min': 200, 'avg': 400, 'max': 1000},
            'photography': {'min': 150, 'avg': 300, 'max': 800},
            'entertainment': {'min': 100, 'avg': 250, 'max': 600},
            'audio_visual': {'min': 80, 'avg': 150, 'max': 400},
            'lighting': {'min': 50, 'avg': 120, 'max': 300},
            'transportation': {'min': 30, 'avg': 80, 'max': 200},
            'security': {'min': 25, 'avg': 60, 'max': 150}
        }
        
        category_rates = base_rates.get(category, {'min': 50, 'avg': 100, 'max': 250})
        location_mult = cls.get_location_multiplier(location)
        
        # Apply location multiplier
        market_rates = {
            'min_rate': Decimal(str(category_rates['min'])) * location_mult,
            'avg_rate': Decimal(str(category_rates['avg'])) * location_mult,
            'max_rate': Decimal(str(category_rates['max'])) * location_mult,
            'volatility': Decimal(str(cls.VOLATILITY_FACTORS.get(category, 0.2)))
        }
        
        # Cache for 30 minutes
        try:
            cache.set(cache_key, market_rates, 1800)
        except Exception:
            pass  # Skip caching if Redis unavailable
        return market_rates

class BudgetEngine:
    """INTELLIGENT MARKET-DRIVEN BUDGET ENGINE"""
    
    # DYNAMIC CATEGORY RULES - Market-adjusted
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
        'contingency': BudgetRule(Decimal('5'), Decimal('25'), 10, True, 'Contingency')
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
        'catering': ['catering', 'food', 'menu', 'cake', 'cuisine', 'meal', 'buffet', 'dining', 'services'],
        'venue': ['venue', 'hall', 'location', 'space', 'facility', 'room', 'venues'],
        'decorations': ['decoration', 'decor', 'styling', 'theme', 'flower', 'balloon', 'mandap', 'event'],
        'photography': ['photo', 'video', 'camera', 'shoot', 'cinematography', 'photography'],
        'entertainment': ['entertainment', 'music', 'dj', 'band', 'dance', 'magic', 'show'],
        'audio_visual': ['audio', 'visual', 'sound', 'microphone', 'projection', 'speaker'],
        'lighting': ['lighting', 'light', 'led', 'illumination', 'spotlight'],
        'transportation': ['transport', 'travel', 'vehicle', 'car'],
        'security': ['security', 'guard', 'safety', 'protection']
    }
    
    @classmethod
    def smart_allocate(cls, event_type: str, selected_services: List[str], 
                      total_budget: Decimal, attendees: int, duration: int,
                      special_requirements: Dict = None, location: str = None,
                      event_date: datetime = None) -> Dict[str, BudgetItem]:
        """INTELLIGENT MARKET-DRIVEN ALLOCATION"""
        try:
            # Get market-adjusted base allocation
            base_allocation = cls._get_market_adjusted_preset(event_type, location, event_date)
            
            # Map services to categories
            mapped_categories = cls._map_services_to_categories(selected_services)
            
            # Filter allocation to only selected categories
            if mapped_categories:
                filtered_allocation = {cat: base_allocation.get(cat, Decimal('10')) 
                                     for cat in mapped_categories}
                # Always include contingency
                if 'contingency' not in filtered_allocation:
                    filtered_allocation['contingency'] = cls._calculate_dynamic_contingency(
                        event_type, location, attendees, duration
                    )
            else:
                # If no services mapped, use full preset but ensure minimum categories
                filtered_allocation = base_allocation.copy()
            
            # Always ensure we have essential categories for any event
            essential_categories = {
                'catering': Decimal('30'),
                'venue': Decimal('25'), 
                'decorations': Decimal('15'),
                'photography': Decimal('10'),
                'entertainment': Decimal('10'),
                'contingency': Decimal('10')
            }
            
            for category, default_percentage in essential_categories.items():
                if category not in filtered_allocation:
                    filtered_allocation[category] = default_percentage
            
            # Apply market intelligence
            filtered_allocation = cls._apply_market_intelligence(
                filtered_allocation, location, attendees, event_date
            )
            
            # Apply requirement adjustments
            if special_requirements:
                filtered_allocation = cls._apply_requirement_adjustments(
                    filtered_allocation, special_requirements
                )
            
            # Apply scale adjustments
            filtered_allocation = cls._apply_scale_adjustments(
                filtered_allocation, attendees, duration
            )
            
            # Apply supply-demand optimization
            filtered_allocation = cls._optimize_supply_demand(
                filtered_allocation, location, attendees, total_budget
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
        
        # Direct service name mappings
        direct_mappings = {
            'photography services': 'photography',
            'catering services': 'catering',
            'decoration': 'decorations',
            'event decoration': 'decorations',
            'venues': 'venue',
            'entertainment': 'entertainment',
            'music': 'entertainment',
            'dj': 'entertainment'
        }
        
        for service in services:
            service_lower = service.lower().strip()
            
            # Check direct mappings first
            if service_lower in direct_mappings:
                categories.add(direct_mappings[service_lower])
                continue
            
            # Check keyword mappings
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
    def _get_market_adjusted_preset(cls, event_type: str, location: str = None, 
                                  event_date: datetime = None) -> Dict[str, Decimal]:
        """Get market-adjusted event presets"""
        base_preset = cls.EVENT_PRESETS.get(event_type, cls.EVENT_PRESETS['corporate']).copy()
        
        if not location:
            return base_preset
        
        # Apply location adjustments
        location_mult = MarketIntelligence.get_location_multiplier(location)
        seasonal_mult = MarketIntelligence.get_seasonal_multiplier(event_type, event_date)
        
        # Adjust high-impact categories based on location
        if location_mult > Decimal('1.3'):  # Expensive cities
            base_preset['venue'] = min(base_preset['venue'] * Decimal('1.1'), Decimal('45'))
            base_preset['catering'] = min(base_preset['catering'] * Decimal('1.05'), Decimal('45'))
        
        # Seasonal adjustments
        if seasonal_mult > Decimal('1.2'):  # Peak season
            base_preset['contingency'] = min(base_preset.get('contingency', Decimal('7')) * Decimal('1.3'), Decimal('20'))
        
        return base_preset
    
    @classmethod
    def _calculate_dynamic_contingency(cls, event_type: str, location: str, 
                                     attendees: int, duration: int) -> Decimal:
        """Calculate intelligent contingency based on risk factors"""
        base_contingency = Decimal('7')
        
        # Event size risk
        if attendees > 500:
            base_contingency += Decimal('3')
        elif attendees > 200:
            base_contingency += Decimal('1')
        
        # Duration risk
        if duration > 8:
            base_contingency += Decimal('2')
        
        # Location risk
        location_mult = MarketIntelligence.get_location_multiplier(location or 'tier3')
        if location_mult > Decimal('1.5'):
            base_contingency += Decimal('2')
        
        # Event type risk
        if event_type == 'wedding':
            base_contingency += Decimal('2')  # Higher complexity
        elif event_type == 'corporate':
            base_contingency += Decimal('1')  # Professional standards
        
        return min(base_contingency, Decimal('25'))
    
    @classmethod
    def _apply_market_intelligence(cls, allocation: Dict[str, Decimal], location: str,
                                 attendees: int, event_date: datetime = None) -> Dict[str, Decimal]:
        """Apply real-time market intelligence"""
        if not location:
            return allocation
        
        market_adjusted = allocation.copy()
        
        for category in allocation.keys():
            if category == 'contingency':
                continue
                
            # Get market rates
            market_rates = MarketIntelligence.get_market_rates(category, location)
            supply_demand = MarketIntelligence.get_supply_demand_factor(category, location, attendees)
            
            # Calculate market pressure adjustment
            volatility = market_rates['volatility']
            market_pressure = supply_demand * volatility
            
            # Apply adjustment (max 20% increase/decrease)
            adjustment = min(max(market_pressure - Decimal('1'), Decimal('-0.2')), Decimal('0.2'))
            market_adjusted[category] *= (Decimal('1') + adjustment)
        
        return market_adjusted
    
    @classmethod
    def _optimize_supply_demand(cls, allocation: Dict[str, Decimal], location: str,
                              attendees: int, total_budget: Decimal) -> Dict[str, Decimal]:
        """Optimize allocation based on supply-demand dynamics"""
        if not location:
            return allocation
        
        optimized = allocation.copy()
        
        # Calculate per-guest budget for validation
        per_guest_budget = total_budget / attendees if attendees > 0 else total_budget
        
        # Skip optimization if no attendees
        if attendees <= 0:
            return allocation
            
        for category in allocation.keys():
            if category == 'contingency':
                continue
                
            # Check if category exists in rules
            if category not in cls.CATEGORY_RULES:
                continue
                
            market_rates = MarketIntelligence.get_market_rates(category, location)
            category_budget_per_guest = (total_budget * allocation[category] / Decimal('100')) / attendees
            
            # Check if allocation is realistic against market rates
            if category_budget_per_guest < market_rates['min_rate']:
                # Increase allocation to meet minimum market rate
                required_percentage = (market_rates['min_rate'] * attendees * Decimal('100')) / total_budget
                optimized[category] = min(required_percentage, cls.CATEGORY_RULES[category].max_percentage)
            elif category_budget_per_guest > market_rates['max_rate'] * Decimal('1.2'):
                # Reduce over-allocation
                optimal_percentage = (market_rates['avg_rate'] * attendees * Decimal('100')) / total_budget
                optimized[category] = max(optimal_percentage, cls.CATEGORY_RULES[category].min_percentage)
        
        return optimized
    
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
    
    @classmethod
    def get_market_insights(cls, event_type: str, location: str, attendees: int, 
                          total_budget: Decimal, event_date: datetime = None) -> Dict[str, Any]:
        """Get comprehensive market insights for budget planning"""
        insights = {
            'location_factor': float(MarketIntelligence.get_location_multiplier(location)),
            'seasonal_factor': float(MarketIntelligence.get_seasonal_multiplier(event_type, event_date)),
            'market_comparison': {},
            'recommendations': [],
            'risk_factors': []
        }
        
        per_guest_budget = total_budget / attendees if attendees > 0 else total_budget
        
        # Market comparison for each category
        for category in cls.CATEGORY_RULES.keys():
            if category == 'contingency':
                continue
                
            market_rates = MarketIntelligence.get_market_rates(category, location)
            insights['market_comparison'][category] = {
                'market_min': float(market_rates['min_rate']),
                'market_avg': float(market_rates['avg_rate']),
                'market_max': float(market_rates['max_rate']),
                'volatility': float(market_rates['volatility'])
            }
            
            # Generate recommendations (only if attendees > 0)
            if attendees > 0 and per_guest_budget < market_rates['min_rate'] * Decimal('0.8'):
                insights['recommendations'].append(
                    f"Consider increasing budget for {cls.CATEGORY_RULES[category].display_name} - below market minimum"
                )
        
        # Risk factors
        if insights['location_factor'] > 1.5:
            insights['risk_factors'].append("High-cost location - expect premium pricing")
        
        if insights['seasonal_factor'] > 1.3:
            insights['risk_factors'].append("Peak season - limited vendor availability")
        
        if attendees > 300:
            insights['risk_factors'].append("Large event - requires specialized vendors")
        
        return insights
    
    @classmethod
    def get_competitor_analysis(cls, event_type: str, location: str, budget_range: str) -> Dict[str, Any]:
        """Analyze competitor pricing and positioning"""
        cache_key = f"competitor_analysis_{event_type}_{location}_{budget_range}"
        try:
            cached = cache.get(cache_key)
            if cached:
                return cached
        except Exception:
            pass  # Skip caching if Redis unavailable
        
        # Simulated competitor analysis (in real implementation, this would fetch from external APIs)
        budget_ranges = {
            'budget': (50000, 150000),
            'mid_range': (150000, 400000),
            'premium': (400000, 1000000),
            'luxury': (1000000, float('inf'))
        }
        
        min_budget, max_budget = budget_ranges.get(budget_range, (100000, 300000))
        location_mult = MarketIntelligence.get_location_multiplier(location)
        
        analysis = {
            'market_position': budget_range,
            'competitor_count': {
                'budget': max(5, int(15 * location_mult * 0.8)),
                'mid_range': max(3, int(8 * location_mult * 0.9)),
                'premium': max(2, int(4 * location_mult)),
                'luxury': max(1, int(2 * location_mult * 1.2))
            },
            'pricing_pressure': 'high' if location_mult > 1.4 else 'medium' if location_mult > 1.1 else 'low',
            'market_saturation': 'high' if location in ['mumbai', 'delhi', 'bangalore'] else 'medium'
        }
        
        # Cache for 2 hours
        try:
            cache.set(cache_key, analysis, 7200)
        except Exception:
            pass  # Skip caching if Redis unavailable
        return analysis
    
    @classmethod
    def _calculate_efficiency_score(cls, breakdown: dict, location: str, attendees: int) -> float:
        """Calculate budget efficiency score"""
        try:
            total_score = 0
            category_count = 0
            
            for category, alloc in breakdown.items():
                if category == 'contingency' or category not in cls.CATEGORY_RULES:
                    continue
                    
                market_rates = MarketIntelligence.get_market_rates(category, location)
                per_guest_allocation = float(alloc.get('amount', 0)) / attendees if attendees > 0 else 0
                
                # Skip efficiency calculation if no attendees
                if attendees <= 0:
                    continue
                    
                avg_rate = float(market_rates['avg_rate'])
                if avg_rate > 0:
                    efficiency = min(100, (per_guest_allocation / avg_rate) * 100)
                    if 80 <= efficiency <= 120:
                        score = 100
                    elif efficiency < 80:
                        score = max(50, efficiency * 1.25)
                    else:
                        score = max(60, 100 - (efficiency - 120) * 0.5)
                    
                    total_score += score
                    category_count += 1
            
            return round(total_score / category_count if category_count > 0 else 85.0, 1)
        except Exception as e:
            logger.error(f"Efficiency calculation failed: {e}")
            return 85.0