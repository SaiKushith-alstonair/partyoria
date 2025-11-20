from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get vendor dashboard statistics"""
    if request.user.user_type != 'vendor':
        return Response({'error': 'Vendor access required'}, status=status.HTTP_403_FORBIDDEN)
    
    # Mock data for now - replace with actual queries when booking system is connected
    stats = {
        'total_bookings': 25,
        'pending_bookings': 5,
        'in_progress_bookings': 8,
        'completed_bookings': 12,
        'total_revenue': 150000,
        'monthly_revenue': 45000,
        'rating': 4.5,
        'total_reviews': 18
    }
    
    return Response(stats, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_bookings(request):
    """Get vendor bookings"""
    if request.user.user_type != 'vendor':
        return Response({'error': 'Vendor access required'}, status=status.HTTP_403_FORBIDDEN)
    
    # Mock booking data
    bookings = [
        {
            'id': 1,
            'customer_name': 'John Doe',
            'service_type': 'Wedding Photography',
            'event_date': '2024-12-15',
            'amount': 25000,
            'status': 'pending',
            'location': 'Mumbai, Maharashtra',
            'created_at': '2024-11-10'
        },
        {
            'id': 2,
            'customer_name': 'Jane Smith',
            'service_type': 'Birthday Party Photography',
            'event_date': '2024-11-25',
            'amount': 15000,
            'status': 'in_progress',
            'location': 'Delhi, Delhi',
            'created_at': '2024-11-08'
        }
    ]
    
    return Response(bookings, status=status.HTTP_200_OK)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def vendor_services(request, service_id=None):
    """CRUD operations for vendor services"""
    try:
        print(f"Vendor services API called: {request.method} {service_id}")
        print(f"User: {request.user.email}, Type: {request.user.user_type}")
        
        if request.user.user_type != 'vendor':
            return Response({'error': 'Vendor access required'}, status=status.HTTP_403_FORBIDDEN)
        
        from .models import VendorService
        
        vendor = request.user
        print(f"Found vendor: {vendor.id} - {vendor.first_name} {vendor.last_name}")
        
        if request.method == 'GET':
            try:
                if service_id:
                    # Get single service
                    service = VendorService.objects.get(id=service_id, user=vendor)
                    return Response({
                        'id': service.id,
                        'service_name': service.service_name,
                        'category': service.category,
                        'service_price': float(service.service_price),
                        'minimum_people': service.minimum_people,
                        'maximum_people': service.maximum_people,
                        'description': service.description,
                        'is_active': service.is_active
                    }, status=status.HTTP_200_OK)
                else:
                    # Get all services for vendor
                    services = VendorService.objects.filter(user=vendor)
                    service_list = []
                    for service in services:
                        service_list.append({
                            'id': service.id,
                            'service_name': service.service_name,
                            'category': service.category,
                            'service_price': float(service.service_price),
                            'minimum_people': service.minimum_people,
                            'maximum_people': service.maximum_people,
                            'description': service.description,
                            'is_active': service.is_active
                        })
                    return Response(service_list, status=status.HTTP_200_OK)
            except VendorService.DoesNotExist:
                return Response({'error': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                print(f"Error getting services: {str(e)}")
                import traceback
                traceback.print_exc()
                return Response({'error': 'A database error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        elif request.method == 'POST':
            # Create new service
            try:
                data = request.data
                print(f"Creating service with data: {data}")
                
                service = VendorService.objects.create(
                    user=vendor,
                    service_name=data.get('service_name', ''),
                    category=data.get('category', ''),
                    service_price=data.get('service_price', 0),
                    minimum_people=data.get('minimum_people'),
                    maximum_people=data.get('maximum_people'),
                    description=data.get('description', ''),
                    is_active=data.get('is_active', True)
                )
                
                return Response({
                    'message': 'Service created successfully',
                    'service': {
                        'id': service.id,
                        'service_name': service.service_name,
                        'category': service.category,
                        'service_price': float(service.service_price),
                        'minimum_people': service.minimum_people,
                        'maximum_people': service.maximum_people,
                        'description': service.description,
                        'is_active': service.is_active
                    }
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(f"Error creating service: {str(e)}")
                import traceback
                traceback.print_exc()
                return Response({'error': 'A database error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        elif request.method == 'PUT':
            # Update service
            try:
                if not service_id:
                    return Response({'error': 'Service ID required'}, status=status.HTTP_400_BAD_REQUEST)
                
                service = VendorService.objects.get(id=service_id, user=vendor)
                data = request.data
                
                service.service_name = data.get('service_name', service.service_name)
                service.category = data.get('category', service.category)
                service.service_price = data.get('service_price', service.service_price)
                service.minimum_people = data.get('minimum_people', service.minimum_people)
                service.maximum_people = data.get('maximum_people', service.maximum_people)
                service.description = data.get('description', service.description)
                service.is_active = data.get('is_active', service.is_active)
                service.save()
                
                return Response({
                    'message': 'Service updated successfully',
                    'service': {
                        'id': service.id,
                        'service_name': service.service_name,
                        'category': service.category,
                        'service_price': float(service.service_price),
                        'minimum_people': service.minimum_people,
                        'maximum_people': service.maximum_people,
                        'description': service.description,
                        'is_active': service.is_active
                    }
                }, status=status.HTTP_200_OK)
            except VendorService.DoesNotExist:
                return Response({'error': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                print(f"Error updating service: {str(e)}")
                import traceback
                traceback.print_exc()
                return Response({'error': 'A database error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        elif request.method == 'DELETE':
            # Delete service
            try:
                if not service_id:
                    return Response({'error': 'Service ID required'}, status=status.HTTP_400_BAD_REQUEST)
                
                service = VendorService.objects.get(id=service_id, user=vendor)
                service.delete()
                
                # Reorder IDs for this vendor's services
                from django.db import connection
                services = VendorService.objects.filter(user=vendor).order_by('id')
                
                # Update IDs to be sequential starting from 1
                with connection.cursor() as cursor:
                    for index, svc in enumerate(services, 1):
                        cursor.execute(
                            "UPDATE vendor_services SET id = %s WHERE id = %s",
                            [index, svc.id]
                        )
                
                return Response({'message': 'Service deleted successfully'}, status=status.HTTP_200_OK)
            except VendorService.DoesNotExist:
                return Response({'error': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                print(f"Error deleting service: {str(e)}")
                import traceback
                traceback.print_exc()
                return Response({'error': 'A database error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
    except Exception as e:
        print(f"Error in vendor_services setup: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': 'A database error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)