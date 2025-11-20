from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Event, QuoteRequest
from authentication.models import CustomUser
from notifications.services import VendorNotifications, CustomerNotifications

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_quote_status(request, event_id):
    """Get quote status for customer - shows all quotes sent for their event"""
    try:
        # Check if event exists and belongs to user
        try:
            event = Event.objects.get(id=event_id, user=request.user)
        except Event.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Event not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get all quote requests for this event
        quote_requests = QuoteRequest.objects.filter(
            source_event_id=event_id,
            user=request.user
        ).order_by('-created_at')
        
        quotes_data = []
        for qr in quote_requests:
            # Count vendor responses
            response_count = len(qr.vendor_responses) if qr.vendor_responses else 0
            vendor_count = len(qr.selected_vendors) if qr.selected_vendors else 0
            
            quotes_data.append({
                'id': qr.id,
                'event_name': qr.event_name,
                'status': qr.status,
                'services': qr.services,
                'vendors_contacted': vendor_count,
                'responses_received': response_count,
                'created_at': qr.created_at,
                'urgency': qr.urgency,
                'quote_type': qr.quote_type
            })
        
        return Response({
            'success': True,
            'event_name': event.event_name,
            'quotes': quotes_data,
            'total_quotes_sent': len(quotes_data),
            'total_responses': sum(q['responses_received'] for q in quotes_data),
            'message': 'Quotes sent to real vendors. Responses will appear when vendors submit their quotes.' if len(quotes_data) > 0 else 'No quotes sent yet.'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_pending_quotes(request):
    """Get pending quote requests for vendor"""
    try:
        vendor = request.user
        if vendor.user_type != 'vendor':
            return Response({'success': False, 'error': 'Vendor access required'}, status=status.HTTP_403_FORBIDDEN)
        
        vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()

        # Find quote requests where this vendor is selected
        quote_requests = QuoteRequest.objects.filter(
            selected_vendors__contains=[vendor_name],
            status__in=['pending', 'vendors_notified', 'responses_received']
        ).order_by('-created_at')
        
        pending_quotes = []
        for qr in quote_requests:
            # Check if vendor has already responded
            has_responded = (qr.vendor_responses and 
                           vendor_name in qr.vendor_responses)
            
            if not has_responded:
                pending_quotes.append({
                    'id': qr.id,
                    'event_name': qr.event_name,
                    'event_type': qr.event_type,
                    'client_name': qr.client_name,
                    'event_date': qr.event_date,
                    'location': qr.location,
                    'guest_count': qr.guest_count,
                    'budget_range': qr.budget_range,
                    'services': qr.services,
                    'urgency': qr.urgency,
                    'created_at': qr.created_at,
                    'description': qr.description
                })
        
        return Response({
            'success': True,
            'vendor_name': vendor_name,
            'pending_quotes': pending_quotes,
            'count': len(pending_quotes)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vendor_submit_quote_response(request, quote_id):
    """Vendor submits quote response"""
    try:
        vendor = request.user
        if vendor.user_type != 'vendor':
            return Response({'success': False, 'error': 'Vendor access required'}, status=status.HTTP_403_FORBIDDEN)
        
        vendor_name = f"{vendor.first_name} {vendor.last_name}".strip()
        quote_request = get_object_or_404(QuoteRequest, id=quote_id)
        
        # Verify vendor is authorized
        if vendor_name not in quote_request.selected_vendors:
            return Response({
                'success': False,
                'error': 'Not authorized for this quote'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get quote data
        quote_amount = request.data.get('quote_amount')
        message = request.data.get('message', '')
        includes = request.data.get('includes', [])
        excludes = request.data.get('excludes', [])
        
        if not quote_amount or float(quote_amount) <= 0:
            return Response({
                'success': False,
                'error': 'Valid quote amount required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Store vendor response
        vendor_responses = quote_request.vendor_responses or {}
        vendor_responses[vendor_name] = {
            'quote_amount': float(quote_amount),
            'message': message,
            'includes': includes,
            'excludes': excludes,
            'submitted_at': timezone.now().isoformat(),
            'vendor_id': vendor.id,
            'vendor_business': vendor.business or '',
            'vendor_location': vendor.location or '',
            'vendor_phone': vendor.phone or '',
            'vendor_email': vendor.email
        }
        
        quote_request.vendor_responses = vendor_responses
        quote_request.status = 'responses_received'
        quote_request.save()
        
        # Notify customer
        if quote_request.user:
            CustomerNotifications.quote_received(
                quote_request.user,
                vendor_name,
                float(quote_amount),
                quote_request.event_type,
                quote_request.id
            )
        
        return Response({
            'success': True,
            'message': 'Quote submitted successfully',
            'quote_id': quote_request.id
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quote_responses_for_event(request, event_id):
    """Get all quote responses for a specific event (customer view)"""
    try:
        # Check if event exists and belongs to user
        try:
            event = Event.objects.get(id=event_id, user=request.user)
        except Event.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Event not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        quote_requests = QuoteRequest.objects.filter(
            source_event_id=event_id,
            user=request.user
        )
        
        all_responses = []
        for qr in quote_requests:
            if qr.vendor_responses:
                for vendor_name, response in qr.vendor_responses.items():
                    all_responses.append({
                        'quote_request_id': qr.id,
                        'vendor_name': vendor_name,
                        'vendor_business': response.get('vendor_business', ''),
                        'vendor_location': response.get('vendor_location', ''),
                        'vendor_phone': response.get('vendor_phone', ''),
                        'vendor_email': response.get('vendor_email', ''),
                        'quote_amount': response.get('quote_amount', 0),
                        'message': response.get('message', ''),
                        'includes': response.get('includes', []),
                        'excludes': response.get('excludes', []),
                        'submitted_at': response.get('submitted_at', ''),
                        'services': qr.services,
                        'urgency': qr.urgency
                    })
        
        return Response({
            'success': True,
            'event_name': event.event_name,
            'responses': all_responses,
            'total_responses': len(all_responses)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)