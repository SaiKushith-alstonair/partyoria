# PHASE 1 MVP QUOTE MANAGEMENT SYSTEM - SETUP GUIDE

## BACKEND SETUP

### 1. Run Database Migration
```bash
cd backend
python manage.py makemigrations events
python manage.py migrate
```

### 2. Update Vendor Services (Optional)
Add sample vendor services to test the system:
```python
# Run in Django shell: python manage.py shell
from vendors.models import VendorAuth

# Update existing vendors with service categories
vendors = VendorAuth.objects.all()
for vendor in vendors:
    if not vendor.services:
        vendor.services = ['catering', 'photography', 'decoration']  # Sample services
        vendor.save()
```

## FRONTEND INTEGRATION

### 1. Add Quote Dashboard to Customer Dashboard
In `frontend/src/components/dashboard/Dashboard.tsx`:
```tsx
import QuotesDashboard from './QuotesDashboard'

// Add to your dashboard navigation/routing
case 'quotes':
  return <QuotesDashboard eventId={selectedEventId} eventName={selectedEventName} />
```

### 2. Add Quote Requests to Vendor Dashboard
In `frontend/src/vendor/pages/dashboard/Home.tsx`:
```tsx
import QuoteRequests from '../../components/QuoteRequests'

// Add to vendor dashboard
<QuoteRequests />
```

### 3. Update Event Creation Flow
The BudgetManager component now automatically sends quotes after budget completion.

## TESTING THE SYSTEM

### 1. Complete Event Creation Flow
1. Create a new event with special requirements
2. Complete budget allocation
3. System automatically sends quote requests to matched vendors

### 2. Vendor Quote Response
1. Login as vendor
2. Check notifications for new quote requests
3. Submit quotes with amounts and details

### 3. Customer Quote Selection
1. Login as customer
2. View received quotes in dashboard
3. Compare and accept preferred quotes

## API ENDPOINTS SUMMARY

### Customer Endpoints
- `POST /api/events/{id}/send-quotes/` - Send quote requests
- `GET /api/events/{id}/quotes/` - Get event quotes
- `POST /api/events/quotes/{id}/accept/` - Accept quote

### Vendor Endpoints
- `GET /api/vendor/quote-requests/` - Get pending quotes
- `GET /api/vendor/quote-requests/{id}/` - Get quote details
- `POST /api/vendor/quotes/{id}/submit/` - Submit quote

## NOTIFICATION FLOW

1. **Budget Complete** → System sends quote requests to matched vendors
2. **Quote Request Sent** → Vendor receives notification
3. **Quote Submitted** → Customer receives notification
4. **Quote Accepted** → Vendor receives acceptance notification

## VENDOR MATCHING LOGIC (MVP)

Simple matching based on:
- Service category match (catering, photography, etc.)
- Same city as event location
- Active and verified vendors only
- Maximum 3 vendors per requirement

## SUCCESS METRICS

- ✅ End-to-end quote workflow works
- ✅ Notifications are sent and received
- ✅ Vendors can submit quotes
- ✅ Customers can compare and select quotes
- ✅ No broken functionality

## DEMO SCRIPT

### Setup Demo Data
1. Create 2-3 vendor accounts with different services
2. Create 1 customer account
3. Ensure vendors are in same city as test event

### Demo Flow
1. **Customer**: Create birthday event with catering + photography requirements
2. **Customer**: Complete budget allocation (triggers quote requests)
3. **Vendor 1**: Receive notification, submit catering quote
4. **Vendor 2**: Receive notification, submit photography quote
5. **Customer**: View and compare quotes
6. **Customer**: Accept preferred quotes
7. **Vendors**: Receive acceptance notifications

## TROUBLESHOOTING

### Common Issues
1. **No quotes sent**: Check vendor services match event requirements
2. **Vendors not found**: Ensure vendors are in same city as event
3. **Notifications not working**: Check notification preferences
4. **API errors**: Check authentication tokens and permissions

### Debug Commands
```bash
# Check vendor services
python manage.py shell
>>> from vendors.models import VendorAuth
>>> VendorAuth.objects.values('id', 'full_name', 'services', 'city')

# Check quote requests
>>> from events.models import QuoteRequest
>>> QuoteRequest.objects.all().values()
```

## NEXT PHASE ENHANCEMENTS

After MVP demo success:
- Smart vendor scoring algorithm
- Automated follow-up reminders
- Quote negotiation system
- Performance analytics
- ML-based recommendations

This MVP provides a complete working quote management system ready for demo and user testing.