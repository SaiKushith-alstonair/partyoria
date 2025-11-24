from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from datetime import datetime, timedelta
from .models import CalendarEvent
from .booking_models import Booking
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_calendar_events(request):
    vendor = request.user
    
    # Get date range from query params
    start_date = request.GET.get('start')
    end_date = request.GET.get('end')
    
    queryset = CalendarEvent.objects.filter(vendor=vendor)
    
    if start_date:
        queryset = queryset.filter(event_date__gte=start_date)
    if end_date:
        queryset = queryset.filter(event_date__lte=end_date)
    
    events = []
    for event in queryset:
        booking_data = {}
        if event.booking:
            booking_data = {
                'customer_name': event.booking.customer_name,
                'amount': str(event.booking.amount),
                'status': event.booking.status,
                'service_type': event.booking.service_type
            }
        
        events.append({
            'id': event.id,
            'title': event.title,
            'date': event.event_date.isoformat(),
            'description': event.description,
            'location': event.location,
            'booking': booking_data
        })
    
    return Response(events)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_calendar_event(request):
    vendor = request.user
    data = request.data
    
    try:
        event = CalendarEvent.objects.create(
            vendor=vendor,
            title=data['title'],
            event_date=data['event_date'],
            description=data.get('description', ''),
            location=data.get('location', ''),
            booking_id=data.get('booking_id')
        )
        
        return Response({
            'id': event.id,
            'title': event.title,
            'date': event.event_date.isoformat(),
            'description': event.description,
            'location': event.location
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_calendar_event(request, event_id):
    try:
        event = CalendarEvent.objects.get(id=event_id, vendor=request.user)
        data = request.data
        
        event.title = data.get('title', event.title)
        event.event_date = data.get('event_date', event.event_date)
        event.description = data.get('description', event.description)
        event.location = data.get('location', event.location)
        event.save()
        
        return Response({
            'id': event.id,
            'title': event.title,
            'date': event.event_date.isoformat(),
            'description': event.description,
            'location': event.location
        })
        
    except CalendarEvent.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_calendar_event(request, event_id):
    try:
        event = CalendarEvent.objects.get(id=event_id, vendor=request.user)
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except CalendarEvent.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_availability(request):
    vendor = request.user
    date = request.GET.get('date')
    
    if not date:
        return Response({'error': 'Date parameter required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        target_date = datetime.fromisoformat(date).date()
        events = CalendarEvent.objects.filter(
            vendor=vendor,
            event_date__date=target_date
        ).count()
        
        return Response({
            'date': date,
            'available': events == 0,
            'event_count': events
        })
        
    except ValueError:
        return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)