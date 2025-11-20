import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from vendors.models import VendorAuth, VendorService
from authentication.models import CustomUser

# Test vendor lookup
try:
    # Get a test vendor
    vendor = VendorAuth.objects.first()
    print(f"Found vendor: {vendor.email} (ID: {vendor.id})")
    
    # Try to get services for this vendor
    services = VendorService.objects.filter(user=vendor)
    print(f"Services for vendor: {services.count()}")
    
    # Try to create a test service
    test_service = VendorService.objects.create(
        user=vendor,
        service_name="Test Service",
        category="Test Category", 
        service_price=1000,
        description="Test description"
    )
    print(f"Created test service: {test_service.id}")
    
    # Check if it was created
    services_after = VendorService.objects.filter(user=vendor)
    print(f"Services after creation: {services_after.count()}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()