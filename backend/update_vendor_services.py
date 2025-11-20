"""
Update VendorService to point to CustomUser instead of VendorAuth
"""
from vendors.models import VendorAuth, VendorService
from django.db import transaction

print("=" * 80)
print("UPDATING VENDOR_SERVICES")
print("=" * 80)

with transaction.atomic():
    services = VendorService.objects.all()
    
    for service in services:
        old_vendor_id = service.user_id
        print(f"\nService ID {service.id}: {service.service_name}")
        print(f"  Current user_id: {old_vendor_id}")
        
        # Find VendorAuth and get corresponding CustomUser
        try:
            vendor = VendorAuth.objects.get(id=old_vendor_id)
            if vendor.chat_user:
                service.user = vendor.chat_user
                service.save()
                print(f"  Updated to CustomUser ID: {vendor.chat_user.id}")
            else:
                print(f"  ERROR: VendorAuth {old_vendor_id} has no chat_user!")
        except VendorAuth.DoesNotExist:
            print(f"  ERROR: VendorAuth {old_vendor_id} not found!")

print("\n" + "=" * 80)
print("VENDOR_SERVICES UPDATE COMPLETE")
print("=" * 80)
