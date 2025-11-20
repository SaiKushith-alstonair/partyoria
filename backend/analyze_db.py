from vendors.models import VendorProfile, VendorService
from authentication.models import CustomUser
from django.db import connection

print("=" * 80)
print("DATABASE ANALYSIS")
print("=" * 80)



# CustomUser data
print("\n2. CUSTOMUSER TABLE:")
print(f"   Total vendors: {CustomUser.objects.filter(user_type='vendor').count()}")
print(f"   Total customers: {CustomUser.objects.filter(user_type='customer').count()}")
vendor_users = CustomUser.objects.filter(user_type='vendor')
for u in vendor_users:
    print(f"   - ID: {u.id}, Email: {u.email}, Username: {u.username}")

# VendorProfile data
print("\n3. VENDOR_PROFILE TABLE:")
print(f"   Total records: {VendorProfile.objects.count()}")
profiles = VendorProfile.objects.all()
for p in profiles:
    print(f"   - ID: {p.id}, User: {p.user_id}, Completed: {p.is_completed}")

# VendorService data
print("\n4. VENDOR_SERVICE TABLE:")
print(f"   Total records: {VendorService.objects.count()}")
services = VendorService.objects.all()[:5]
for s in services:
    print(f"   - ID: {s.id}, Name: {s.service_name}, User: {s.user_id}")

# Check relationships
print("\n5. RELATIONSHIP ANALYSIS:")
cursor = connection.cursor()
cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'vendor_auth'
    ORDER BY ordinal_position
""")
print("   vendor_auth columns:")
for row in cursor.fetchall():
    print(f"   - {row[0]}: {row[1]}")

cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'vendor_profiles'
    ORDER BY ordinal_position
""")
print("\n   vendor_profiles columns:")
for row in cursor.fetchall():
    print(f"   - {row[0]}: {row[1]}")

cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'vendor_services'
    ORDER BY ordinal_position
""")
print("\n   vendor_services columns:")
for row in cursor.fetchall():
    print(f"   - {row[0]}: {row[1]}")

print("\n" + "=" * 80)
