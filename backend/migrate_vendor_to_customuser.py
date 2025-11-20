"""
Migration script to consolidate VendorAuth into CustomUser
"""
from vendors.models import VendorAuth, VendorProfile, VendorService
from authentication.models import CustomUser
from django.db import transaction

print("=" * 80)
print("MIGRATING VENDORAUTH TO CUSTOMUSER")
print("=" * 80)

with transaction.atomic():
    vendors = VendorAuth.objects.all()
    
    for vendor in vendors:
        print(f"\nProcessing: {vendor.email}")
        
        # Get or create CustomUser
        if vendor.chat_user:
            # Use existing chat_user
            user = vendor.chat_user
            print(f"  Using existing CustomUser ID: {user.id}")
        else:
            # Create new CustomUser
            user, created = CustomUser.objects.get_or_create(
                email=vendor.email,
                defaults={
                    'username': vendor.email,
                    'user_type': 'vendor',
                    'first_name': vendor.full_name.split()[0] if vendor.full_name else '',
                    'last_name': ' '.join(vendor.full_name.split()[1:]) if len(vendor.full_name.split()) > 1 else '',
                    'phone': vendor.mobile,
                    'is_verified': vendor.is_verified,
                    'is_active': vendor.is_active,
                }
            )
            if created:
                user.set_password(vendor.password)  # Copy hashed password
                user.save()
                print(f"  Created new CustomUser ID: {user.id}")
            else:
                print(f"  Found existing CustomUser ID: {user.id}")
        
        # Update user with vendor data
        user.user_type = 'vendor'
        user.phone = vendor.mobile
        user.is_verified = vendor.is_verified
        user.is_active = vendor.is_active
        if not user.first_name:
            user.first_name = vendor.full_name.split()[0] if vendor.full_name else ''
        if not user.last_name and len(vendor.full_name.split()) > 1:
            user.last_name = ' '.join(vendor.full_name.split()[1:])
        user.save()
        
        # Get or create VendorProfile
        profile, created = VendorProfile.objects.get_or_create(
            user=user,
            defaults={
                'profile_data': {
                    'business': vendor.business,
                    'experience_level': vendor.experience_level,
                    'city': vendor.city,
                    'state': vendor.state,
                    'pincode': vendor.pincode,
                    'location': vendor.location,
                    'services': vendor.services,
                    'onboarding_completed': vendor.onboarding_completed,
                },
                'is_completed': vendor.onboarding_completed,
            }
        )
        
        if not created:
            # Update existing profile
            profile.profile_data.update({
                'business': vendor.business,
                'experience_level': vendor.experience_level,
                'city': vendor.city,
                'state': vendor.state,
                'pincode': vendor.pincode,
                'location': vendor.location,
                'services': vendor.services,
                'onboarding_completed': vendor.onboarding_completed,
            })
            profile.is_completed = vendor.onboarding_completed
            profile.save()
        
        print(f"  VendorProfile ID: {profile.id}")
        
        # Store mapping for later
        print(f"  Mapping: VendorAuth({vendor.id}) -> CustomUser({user.id})")
        vendor.chat_user = user
        vendor.save()

print("\n" + "=" * 80)
print("MIGRATION COMPLETE - DO NOT DELETE VENDORAUTH YET")
print("=" * 80)
