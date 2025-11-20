"""
Vendor notification system for category-specific quote requests
"""
import logging
from typing import Dict, List
from django.core.mail import send_mail
from django.conf import settings
from .models import QuoteRequest

logger = logging.getLogger(__name__)

class VendorNotificationService:
    """
    Service to handle vendor notifications with category-specific data
    """
    
    # Vendor category to email mapping (example - replace with actual vendor data)
    VENDOR_CATEGORIES = {
        'catering': [
            {'name': 'Premium Catering Co.', 'email': 'quotes@premiumcatering.com'},
            {'name': 'Delicious Delights', 'email': 'info@deliciousdelights.com'},
        ],
        'photography': [
            {'name': 'Perfect Moments Photography', 'email': 'bookings@perfectmoments.com'},
            {'name': 'Creative Lens Studio', 'email': 'quotes@creativelens.com'},
        ],
        'decorations': [
            {'name': 'Elegant Decorations', 'email': 'orders@elegantdecor.com'},
            {'name': 'Floral Fantasy', 'email': 'quotes@floralfantasy.com'},
        ],
        'entertainment': [
            {'name': 'Party Entertainment Pro', 'email': 'bookings@partyentertainment.com'},
            {'name': 'Music & More', 'email': 'quotes@musicandmore.com'},
        ],
        'venues': [
            {'name': 'Grand Event Halls', 'email': 'reservations@grandeventhalls.com'},
            {'name': 'Luxury Venues Ltd', 'email': 'quotes@luxuryvenues.com'},
        ],
        'audio_visual': [
            {'name': 'AV Solutions Pro', 'email': 'quotes@avsolutions.com'},
            {'name': 'Sound & Vision Tech', 'email': 'bookings@soundvision.com'},
        ],
        'lighting': [
            {'name': 'Brilliant Lighting', 'email': 'quotes@brilliantlighting.com'},
            {'name': 'LED Magic', 'email': 'info@ledmagic.com'},
        ]
    }
    
    @classmethod
    def send_targeted_quotes(cls, quote_request: QuoteRequest) -> Dict[str, List[str]]:
        """
        Send category-specific quote requests to relevant vendors
        
        Returns:
            Dict with category -> list of notified vendor emails
        """
        if quote_request.quote_type != 'targeted':
            logger.warning(f"Quote {quote_request.id} is not targeted, skipping category-specific notifications")
            return {}
        
        notification_results = {}
        
        # Send to each category that has specific data
        for category, category_data in quote_request.category_specific_data.items():
            if not category_data or not category_data.get('requirements'):
                continue
                
            vendors = cls.VENDOR_CATEGORIES.get(category, [])
            if not vendors:
                logger.warning(f"No vendors found for category: {category}")
                continue
            
            notified_emails = []
            
            for vendor in vendors:
                try:
                    success = cls._send_category_specific_email(
                        quote_request, 
                        category, 
                        category_data, 
                        vendor
                    )
                    if success:
                        notified_emails.append(vendor['email'])
                except Exception as e:
                    logger.error(f"Failed to notify {vendor['name']}: {str(e)}")
            
            notification_results[category] = notified_emails
            logger.info(f"Notified {len(notified_emails)} vendors for {category}")
        
        return notification_results
    
    @classmethod
    def get_vendor_specific_quote_data(cls, quote_request: QuoteRequest, vendor_category: str) -> Dict:
        """
        Get only the data relevant to a specific vendor category
        """
        category_data = quote_request.category_specific_data.get(vendor_category, {})
        
        if not category_data:
            return {}
        
        return {
            'quote_id': quote_request.id,
            'event_type': quote_request.event_type,
            'event_name': quote_request.event_name,
            'client_name': quote_request.client_name,
            'client_email': quote_request.client_email,
            'client_phone': quote_request.client_phone,
            'event_date': quote_request.event_date,
            'location': quote_request.location,
            'guest_count': quote_request.guest_count,
            'urgency': quote_request.urgency,
            'category': vendor_category,
            'allocated_budget': category_data.get('budget', 0),
            'budget_details': category_data.get('details', {}),
            'requirements': category_data.get('requirements', {}),
            'services': [vendor_category]  # Only this category's service
        }
    
    @classmethod
    def _send_category_specific_email(cls, quote_request: QuoteRequest, category: str, 
                                    category_data: Dict, vendor: Dict) -> bool:
        """
        Send category-specific email to a single vendor
        """
        try:
            # Format requirements for email
            requirements_text = cls._format_requirements_for_email(category_data.get('requirements', {}))
            
            # Format budget information
            budget_info = cls._format_budget_for_email(category_data)
            
            subject = f"Quote Request - {category.title()} Services for {quote_request.event_type.title()} Event"
            
            message = f"""
Dear {vendor['name']},

We have a TARGETED quote request specifically for {category.title()} services only:

EVENT DETAILS:
- Event Type: {quote_request.event_type.title()}
- Event Name: {quote_request.event_name or 'Not specified'}
- Client: {quote_request.client_name}
- Date: {quote_request.event_date}
- Location: {quote_request.location or 'To be confirmed'}
- Guest Count: {quote_request.guest_count}
- Urgency: {quote_request.urgency.title()}

YOUR CATEGORY: {category.upper()} ONLY
{requirements_text}

YOUR ALLOCATED BUDGET:
{budget_info}

IMPORTANT: This is a targeted quote for {category.title()} services only. 
You are NOT required to provide other services like venues, photography, etc.
Focus only on your {category.title()} expertise.

To respond to this quote request, please contact:
Email: {quote_request.client_email}
Phone: {quote_request.client_phone or 'Not provided'}

Quote ID: {quote_request.id}
Category: {category.title()}
Response needed by: {quote_request.estimated_response_time}

Best regards,
PartyOria Event Management Team
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[vendor['email']],
                fail_silently=False,
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Email sending failed for {vendor['name']}: {str(e)}")
            return False
    
    @classmethod
    def _format_requirements_for_email(cls, requirements: Dict) -> str:
        """Format requirements data for email display"""
        if not requirements:
            return "No specific requirements provided"
        
        formatted_text = ""
        for req_id, req_data in requirements.items():
            req_name = req_id.replace('-', ' ').title()
            formatted_text += f"\n• {req_name}:"
            
            if req_data.get('quantity'):
                formatted_text += f" Quantity: {req_data['quantity']}"
                if req_data.get('unit'):
                    formatted_text += f" {req_data['unit']}"
            
            # Format answers
            answers = req_data.get('answers', {})
            if answers:
                formatted_text += "\n  Details:"
                for question_id, answer in answers.items():
                    if isinstance(answer, list):
                        answer_text = ', '.join(answer)
                    else:
                        answer_text = str(answer)
                    formatted_text += f"\n    - {answer_text}"
            
            formatted_text += "\n"
        
        return formatted_text
    
    @classmethod
    def _format_budget_for_email(cls, category_data: Dict) -> str:
        """Format budget information for email display"""
        budget = category_data.get('budget', 0)
        details = category_data.get('details', {})
        
        if not budget:
            return "Budget allocation not specified"
        
        budget_text = f"YOUR ALLOCATED BUDGET: ₹{budget:,.2f}"
        
        if details.get('percentage'):
            budget_text += f" ({details['percentage']:.1f}% of total event budget)"
        
        if details.get('per_guest_cost'):
            budget_text += f"\nPer Guest Budget: ₹{details['per_guest_cost']:,.2f}"
        
        if details.get('per_hour_cost'):
            budget_text += f"\nPer Hour Budget: ₹{details['per_hour_cost']:,.2f}"
        
        budget_text += "\n\nNOTE: This budget is specifically allocated for your service category only."
        
        return budget_text
    
    @classmethod
    def send_comprehensive_quote(cls, quote_request: QuoteRequest) -> List[str]:
        """
        Send comprehensive quote request to all vendor categories
        (Original functionality for comprehensive quotes)
        """
        if quote_request.quote_type != 'comprehensive':
            logger.warning(f"Quote {quote_request.id} is not comprehensive")
            return []
        
        # Implementation for comprehensive quotes (existing functionality)
        # This would send all requirements and full budget to all vendors
        notified_emails = []
        
        # Get all vendors from all categories
        all_vendors = []
        for vendors in cls.VENDOR_CATEGORIES.values():
            all_vendors.extend(vendors)
        
        for vendor in all_vendors:
            try:
                success = cls._send_comprehensive_email(quote_request, vendor)
                if success:
                    notified_emails.append(vendor['email'])
            except Exception as e:
                logger.error(f"Failed to notify {vendor['name']}: {str(e)}")
        
        return notified_emails
    
    @classmethod
    def _send_comprehensive_email(cls, quote_request: QuoteRequest, vendor: Dict) -> bool:
        """Send comprehensive quote email with all event details"""
        try:
            subject = f"Comprehensive Quote Request - {quote_request.event_type.title()} Event"
            
            message = f"""
Dear {vendor['name']},

We have a comprehensive quote request for all event services:

EVENT DETAILS:
- Event Type: {quote_request.event_type.title()}
- Event Name: {quote_request.event_name or 'Not specified'}
- Client: {quote_request.client_name}
- Date: {quote_request.event_date}
- Location: {quote_request.location or 'To be confirmed'}
- Guest Count: {quote_request.guest_count}
- Budget Range: {quote_request.budget_range or 'Not specified'}
- Services Needed: {', '.join(quote_request.services) if quote_request.services else 'All services'}

DESCRIPTION:
{quote_request.description or 'No additional details provided'}

Please provide quotes for any services you can offer for this event.

Contact Information:
Email: {quote_request.client_email}
Phone: {quote_request.client_phone or 'Not provided'}

Quote ID: {quote_request.id}
Response needed by: {quote_request.estimated_response_time}

Best regards,
PartyOria Event Management Team
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[vendor['email']],
                fail_silently=False,
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Comprehensive email sending failed for {vendor['name']}: {str(e)}")
            return False