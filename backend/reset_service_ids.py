import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from django.db import connection
from vendors.models import VendorService

# Reset vendor_services table IDs to start from 1
with connection.cursor() as cursor:
    # Get all services ordered by current ID
    services = list(VendorService.objects.all().order_by('id'))
    
    if services:
        print(f"Found {len(services)} services to reorder")
        
        # Delete all services temporarily
        VendorService.objects.all().delete()
        
        # Reset the sequence to 1
        cursor.execute("ALTER SEQUENCE vendor_services_id_seq RESTART WITH 1;")
        
        # Re-create services with new sequential IDs
        for service in services:
            VendorService.objects.create(
                user=service.user,
                service_name=service.service_name,
                category=service.category,
                service_price=service.service_price,
                minimum_people=service.minimum_people,
                maximum_people=service.maximum_people,
                description=service.description,
                is_active=service.is_active,
                image=service.image
            )
        
        print("Service IDs reset successfully")
        
        # Verify the new IDs
        new_services = VendorService.objects.all().order_by('id')
        for service in new_services:
            print(f"ID: {service.id}, Name: {service.service_name}")
    else:
        # Just reset the sequence if no services exist
        cursor.execute("ALTER SEQUENCE vendor_services_id_seq RESTART WITH 1;")
        print("Sequence reset to 1")