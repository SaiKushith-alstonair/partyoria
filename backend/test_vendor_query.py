from authentication.models import CustomUser
from django.db import models

vendors = CustomUser.objects.filter(user_type='vendor', is_active=True)
print(f'Active vendors: {vendors.count()}')

# Test the problematic query
try:
    result = vendors.filter(models.Q(services__icontains='photography'))
    print(f'Query with services field succeeded: {result.count()}')
except Exception as e:
    print(f'ERROR with services field: {e}')

# Test with full_name
try:
    result = vendors.filter(models.Q(full_name__icontains='photography'))
    print(f'Query with full_name field succeeded: {result.count()}')
except Exception as e:
    print(f'ERROR with full_name field: {e}')

# Test correct query
try:
    result = vendors.filter(models.Q(business__icontains='photography'))
    print(f'Query with business field succeeded: {result.count()}')
    for v in result:
        print(f'  - {v.first_name} {v.last_name}: {v.business}')
except Exception as e:
    print(f'ERROR with business field: {e}')
