from authentication.models import CustomUser
from events.models import QuoteRequest

vendor = CustomUser.objects.get(id=21)
vendor_name = f'{vendor.first_name} {vendor.last_name}'.strip()

qrs = QuoteRequest.objects.filter(
    selected_vendors__contains=vendor_name,
    status__in=['pending', 'vendors_notified']
)

print(f'Vendor: {vendor_name}')
print(f'Found {qrs.count()} quotes')

for q in qrs:
    vendor_data = q.category_specific_data.get(vendor_name, {})
    budget = vendor_data.get('budget', 0)
    category = vendor_data.get('category', 'N/A')
    percentage = vendor_data.get('percentage', 0)
    
    print(f'\nQuote #{q.id}: {q.event_name}')
    print(f'  Category: {category}')
    print(f'  Budget: Rs.{budget:.2f}')
    print(f'  Percentage: {percentage}%')
    print(f'  Status: {q.status}')
