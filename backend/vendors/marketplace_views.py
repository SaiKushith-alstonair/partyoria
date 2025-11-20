from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Avg, Count
from authentication.models import CustomUser
from .models import VendorService

@api_view(['GET'])
def vendor_marketplace(request):
    """Customer-facing vendor marketplace API"""
    try:
        # Category mapping from budget categories to vendor business types
        CATEGORY_MAP = {
            # Food & Beverage
            'catering': 'Catering',
            'beverages': 'Catering',
            'special_dietary': 'Catering',
            
            # Venue & Location
            'venue_rental': 'Event Manager',
            'venue_setup': 'Event Manager',
            'venue': 'Event Manager',
            
            # Technical & Equipment
            'audio_visual': 'DJ',
            'lighting': 'Lighting',
            'stage_setup': 'Event Manager',
            'recording_equipment': 'Videography',
            
            # Entertainment & Activities
            'entertainment': 'Entertainment',
            'music_dj': 'DJ',
            'special_performances': 'Entertainment',
            
            # Visual & Documentation
            'photography': 'Photography',
            'videography': 'Videography',
            
            # Decoration & Styling
            'decorations': 'Decoration',
            'flowers': 'Florist',
            'special_themes': 'Decoration',
            
            # Coordination & Management
            'event_coordination': 'Event Manager',
            'staff_management': 'Event Manager',
            
            # Support Services
            'transportation': 'Transportation',
            'transport': 'Transportation',
            'security': 'Event Manager',
            'beauty_services': 'Makeup Artist',
            'guest_services': 'Event Manager',
            
            # Additional Services
            'baker': 'Baker',
            'hair_stylist': 'Hair Stylist',
            'fashion_designer': 'Fashion Designer',
            'gift_services': 'Gift Services',
            
            # Miscellaneous
            'other_services': 'Event Manager',
            'contingency': 'Event Manager',
        }
        
        # Get filter parameters
        category = request.GET.get('category')
        location_filter = request.GET.get('location')
        search = request.GET.get('search')
        price_range = request.GET.get('price_range')
        limit = int(request.GET.get('limit', 50))
        
        # Map budget category to vendor business type
        if category and category in CATEGORY_MAP:
            category = CATEGORY_MAP[category]
        
        # Base query: all vendors (remove is_verified filter for now)
        vendors = CustomUser.objects.filter(user_type='vendor')
        
        # Get all vendors first, then filter by profile data
        all_vendors = vendors[:limit * 2]  # Get more to account for filtering
        
        # Build response with services and profile data
        vendor_list = []
        for vendor in all_vendors:
            # Get vendor profile
            try:
                from .models import VendorProfile
                profile = VendorProfile.objects.get(user=vendor)
                profile_data = profile.profile_data or {}
            except:
                profile_data = {}
            
            # Get business from profile_data or CustomUser
            business = vendor.business or profile_data.get('business', 'General')
            city = vendor.city or profile_data.get('city', '')
            state = vendor.state or profile_data.get('state', '')
            location = vendor.location or profile_data.get('location', '') or f"{city}, {state}"
            
            # Apply category filter (case-insensitive, handle underscores)
            if category and category != 'All':
                category_normalized = category.lower().replace('_', ' ').strip()
                business_normalized = business.lower().replace('_', ' ').strip()
                if category_normalized not in business_normalized and business_normalized not in category_normalized:
                    continue
            
            # Apply location filter
            if location_filter and location_filter != 'All':
                if location_filter.lower() not in city.lower() and location_filter.lower() not in state.lower():
                    continue
            
            # Apply search filter - NULL safe
            if search and search.strip():
                search_lower = search.lower().strip()
                first_name = (vendor.first_name or '').lower()
                last_name = (vendor.last_name or '').lower()
                business_lower = (business or '').lower()
                email_lower = (vendor.email or '').lower()
                
                if (search_lower not in first_name and 
                    search_lower not in last_name and 
                    search_lower not in business_lower and
                    search_lower not in email_lower):
                    continue
            
            # Get services
            services = VendorService.objects.filter(user=vendor, is_active=True)
            
            # Skip vendors with no services
            if not services.exists():
                continue
            
            # Calculate total price
            total_price = sum(float(s.service_price or 0) for s in services)
            
            # Apply price filter
            if price_range and price_range != 'all':
                try:
                    min_price, max_price = map(int, price_range.split('-'))
                    if total_price > 0 and (total_price < min_price or total_price > max_price):
                        continue
                except:
                    pass
            
            vendor_data = {
                'id': vendor.id,
                'full_name': f"{vendor.first_name} {vendor.last_name}".strip() or vendor.username,
                'business': business,
                'email': vendor.email,
                'mobile': vendor.phone or profile_data.get('mobile', ''),
                'city': city,
                'state': state,
                'location': location,
                'is_verified': vendor.is_verified,
                'profile_image': vendor.profile_picture.url if vendor.profile_picture else None,
                'rating': 4.5,
                'total_reviews': 50,
                'services': [
                    {
                        'id': s.id,
                        'service_name': s.service_name,
                        'category': s.category,
                        'service_price': float(s.service_price or 0),
                        'minimum_people': s.minimum_people,
                        'maximum_people': s.maximum_people,
                        'description': s.description,
                    }
                    for s in services
                ]
            }
            vendor_list.append(vendor_data)
            
            # Stop if we have enough vendors
            if len(vendor_list) >= limit:
                break
        
        return Response({
            'success': True,
            'results': vendor_list,
            'count': len(vendor_list)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
