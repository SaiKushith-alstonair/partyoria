import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'partyoria.settings')
django.setup()

from authentication.models import CustomUser

def mark_all_vendors_onboarding_complete():
    """Mark all vendors as onboarding completed for testing"""
    
    # Get all vendors
    vendors = CustomUser.objects.filter(user_type='vendor')
    
    print(f"Found {vendors.count()} vendors")
    print("Marking onboarding as completed...")
    print("-" * 50)
    
    updated_count = 0
    for vendor in vendors:
        vendor.onboarding_completed = True
        vendor.save()
        updated_count += 1
        status = "[OK]" if vendor.onboarding_completed else "[FAIL]"
        print(f"{status} {vendor.email} - {vendor.first_name} {vendor.last_name} ({vendor.business or 'No business'})")
    
    print("-" * 50)
    print(f"\n[SUCCESS] Updated {updated_count} vendors!")
    print(f"\nAll vendors can now:")
    print("  - Login directly to dashboard")
    print("  - Skip onboarding process")
    print("  - Appear in marketplace with services")
    print("  - Receive quote requests")

if __name__ == '__main__':
    mark_all_vendors_onboarding_complete()
