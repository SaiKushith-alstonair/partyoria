from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .booking_models import Booking
from events.models import QuoteRequest
from authentication.models import CustomUser
from datetime import datetime

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking_from_quote(request):
    """Customer accepts vendor quote and creates booking"""
    try:
        quote_id = request.data.get('quote_id')
        vendor_name = request.data.get('vendor_name')
        
        if not quote_id or not vendor_name:
            return Response({'error': 'quote_id and vendor_name required'}, status=400)
        
        # Get quote request with authorization check
        try:
            quote_request = QuoteRequest.objects.get(id=quote_id, user=request.user)
        except QuoteRequest.DoesNotExist:
            return Response({'error': 'Quote request not found or unauthorized'}, status=404)
        
        # Get vendor response from quote
        vendor_responses = quote_request.vendor_responses or {}
        vendor_response = vendor_responses.get(vendor_name)
        
        if not vendor_response:
            return Response({'error': 'Vendor response not found'}, status=404)
        
        # Get vendor by ID from response (more reliable than name)
        vendor_id = vendor_response.get('vendor_id')
        if not vendor_id:
            return Response({'error': 'Vendor ID missing in quote response'}, status=400)
        
        try:
            vendor = CustomUser.objects.get(id=vendor_id, user_type='vendor')
        except CustomUser.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=404)
        
        # Check for duplicate booking
        existing = Booking.objects.filter(
            quote_request=quote_request,
            vendor=vendor
        ).exclude(status='cancelled').first()
        
        if existing:
            return Response({
                'error': 'Booking already exists for this vendor',
                'booking_id': existing.id
            }, status=400)
        
        # Create booking with transaction
        with transaction.atomic():
            booking = Booking.objects.create(
                vendor=vendor,
                customer=request.user,
                customer_name=quote_request.client_name,
                service_type=vendor_response.get('vendor_business', 'Service'),
                event_date=quote_request.event_date,
                amount=vendor_response.get('quote_amount', 0),
                status='pending_vendor',
                description=vendor_response.get('message', ''),
                location=quote_request.location,
                event=quote_request.source_event,
                quote_request=quote_request,
                vendor_quote_data=vendor_response
            )
            
            quote_request.status = 'in_progress'
            quote_request.save()
        
        return Response({
            'success': True,
            'booking_id': booking.id,
            'message': 'Booking created successfully. Waiting for vendor confirmation.',
            'booking': {
                'id': booking.id,
                'vendor_name': vendor.get_full_name(),
                'amount': float(booking.amount),
                'status': booking.status,
                'event_date': booking.event_date.isoformat()
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_customer_bookings(request):
    """Get all bookings for customer"""
    try:
        bookings = Booking.objects.filter(customer=request.user).select_related('vendor', 'event')
        
        bookings_data = [{
            'id': b.id,
            'vendor_id': b.vendor.id,
            'vendor_name': b.vendor.get_full_name(),
            'vendor_username': b.vendor.username,
            'vendor_business': b.service_type,
            'vendor_email': b.vendor.email,
            'vendor_phone': b.vendor.phone,
            'vendor_profile_picture': b.vendor.profile_picture.url if b.vendor.profile_picture else None,
            'amount': float(b.amount),
            'status': b.status,
            'event_date': b.event_date.isoformat(),
            'location': b.location,
            'description': b.description,
            'created_at': b.created_at.isoformat(),
            'event_name': b.event.event_name if b.event else None,
            'quote_data': b.vendor_quote_data
        } for b in bookings]
        
        return Response({
            'success': True,
            'bookings': bookings_data,
            'count': len(bookings_data)
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_vendor_bookings(request):
    """Get all bookings for vendor"""
    try:
        if request.user.user_type != 'vendor':
            return Response({'error': 'Only vendors can access this'}, status=403)
        
        bookings = Booking.objects.filter(vendor=request.user).select_related('customer', 'event')
        
        bookings_data = [{
            'id': b.id,
            'customer_name': b.customer_name,
            'customer_email': b.customer.email if b.customer else None,
            'customer_phone': b.customer.phone if b.customer else None,
            'service_type': b.service_type,
            'amount': float(b.amount),
            'status': b.status,
            'event_date': b.event_date.isoformat(),
            'location': b.location,
            'description': b.description,
            'created_at': b.created_at.isoformat(),
            'event_name': b.event.event_name if b.event else None
        } for b in bookings]
        
        return Response({
            'success': True,
            'bookings': bookings_data,
            'count': len(bookings_data)
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_booking(request, booking_id):
    """Vendor confirms booking"""
    try:
        if request.user.user_type != 'vendor':
            return Response({'error': 'Only vendors can confirm bookings'}, status=403)
        
        booking = Booking.objects.get(id=booking_id, vendor=request.user)
        
        if booking.status != 'pending_vendor':
            return Response({'error': 'Booking already processed'}, status=400)
        
        booking.status = 'confirmed'
        booking.save()
        
        return Response({
            'success': True,
            'message': 'Booking confirmed successfully',
            'booking': {
                'id': booking.id,
                'status': booking.status
            }
        })
        
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    """Cancel booking (customer or vendor)"""
    try:
        booking = Booking.objects.get(id=booking_id)
        
        # Check permission
        if booking.customer != request.user and booking.vendor != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        
        if booking.status == 'completed':
            return Response({'error': 'Cannot cancel completed booking'}, status=400)
        
        reason = request.data.get('reason', '')
        booking.status = 'cancelled'
        booking.description = f"{booking.description}\n\nCancellation reason: {reason}"
        booking.save()
        
        return Response({
            'success': True,
            'message': 'Booking cancelled successfully'
        })
        
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_booking_detail(request, booking_id):
    """Get detailed booking information"""
    try:
        booking = Booking.objects.select_related('vendor', 'customer', 'event').get(id=booking_id)
        
        # Check permission
        if booking.customer != request.user and booking.vendor != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        
        data = {
            'id': booking.id,
            'vendor': {
                'id': booking.vendor.id,
                'name': booking.vendor.get_full_name(),
                'email': booking.vendor.email,
                'phone': booking.vendor.phone,
                'business': booking.service_type
            },
            'customer': {
                'name': booking.customer_name,
                'email': booking.customer.email if booking.customer else None,
                'phone': booking.customer.phone if booking.customer else None
            },
            'amount': float(booking.amount),
            'status': booking.status,
            'event_date': booking.event_date.isoformat(),
            'location': booking.location,
            'description': booking.description,
            'created_at': booking.created_at.isoformat(),
            'event': {
                'id': booking.event.id,
                'name': booking.event.event_name
            } if booking.event else None,
            'quote_data': booking.vendor_quote_data
        }
        
        return Response({'success': True, 'booking': data})
        
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
