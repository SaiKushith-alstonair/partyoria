# Quote Management Workflow Test

## Complete Quote System Flow

### 1. Customer Side - Sending Quotes

**Step 1: Create Event & Budget**
1. Customer creates an event with requirements
2. Customer completes budget allocation
3. System automatically sends quote requests to matched vendors

**Step 2: Track Quote Status**
1. Navigate to Dashboard → Events → My Quotes
2. View quote status dashboard showing:
   - Total quotes sent
   - Vendors contacted
   - Responses received
   - Response rate

**API Endpoints Used:**
- `POST /api/events/{event_id}/send-quotes/` - Send quotes
- `GET /api/events/{event_id}/quote-status/` - Get quote status
- `GET /api/events/{event_id}/quote-responses/` - Get vendor responses

### 2. Vendor Side - Receiving & Responding

**Step 1: View Pending Quotes**
1. Vendor logs into vendor portal
2. Navigate to Quote Requests section
3. View all pending quote requests with:
   - Event details
   - Client information
   - Budget range
   - Required services
   - Urgency level

**Step 2: Submit Quote Response**
1. Click "Submit Quote" on any request
2. Fill out quote form:
   - Quote amount
   - Message to customer
   - What's included
   - What's not included
3. Submit quote

**API Endpoints Used:**
- `GET /api/events/vendor/pending-quotes/` - Get pending quotes
- `POST /api/events/vendor/quotes/{quote_id}/submit/` - Submit quote

### 3. Customer Side - Receiving Responses

**Step 1: View Quote Responses**
1. Customer receives notification when vendor responds
2. Navigate to Dashboard → Events → My Quotes
3. View all received quotes with:
   - Vendor details
   - Quote amount
   - Message
   - Included/excluded items
   - Contact information

**Step 2: Accept Quote**
1. Review quote details
2. Contact vendor if needed
3. Accept preferred quote

## Testing the Workflow

### Prerequisites
1. Backend server running on localhost:8000
2. Frontend running on localhost:3000
3. At least one customer account
4. At least one vendor account with services configured

### Test Steps

1. **Customer Creates Event:**
   ```
   - Login as customer
   - Create new event (e.g., Wedding)
   - Add special requirements (e.g., Photography, Catering)
   - Complete budget allocation
   - System sends quotes automatically
   ```

2. **Check Quote Status:**
   ```
   - Go to Dashboard → Events → My Quotes
   - Should see quote request with status "vendors_notified"
   - Should show number of vendors contacted
   ```

3. **Vendor Responds:**
   ```
   - Login as vendor
   - Go to Quote Requests
   - Should see pending quote request
   - Submit quote with amount and details
   ```

4. **Customer Views Response:**
   ```
   - Return to customer dashboard
   - Go to My Quotes
   - Should see vendor response
   - Can view details and contact vendor
   ```

## Key Features Implemented

### Customer Features
- ✅ Automatic quote sending after budget completion
- ✅ Quote status tracking dashboard
- ✅ Vendor response viewing
- ✅ Quote comparison interface
- ✅ Vendor contact information
- ✅ Real-time notifications

### Vendor Features
- ✅ Pending quote requests dashboard
- ✅ Detailed event information
- ✅ Quote submission form
- ✅ Include/exclude items management
- ✅ Customer notification on submission

### System Features
- ✅ Vendor matching based on services and location
- ✅ Quote request tracking
- ✅ Response rate calculation
- ✅ Notification system integration
- ✅ Data persistence in database

## Database Schema

### QuoteRequest Model
```python
- event_type: Event category
- client_name: Customer name
- event_date: Event date
- location: Event location
- services: Required services list
- selected_vendors: Matched vendors list
- vendor_responses: JSON field storing all responses
- status: pending/vendors_notified/responses_received/completed
```

### Vendor Response Format
```json
{
  "vendor_name": {
    "quote_amount": 50000,
    "message": "Professional service message",
    "includes": ["Service 1", "Service 2"],
    "excludes": ["Extra item 1"],
    "submitted_at": "2024-01-01T10:00:00Z",
    "vendor_contact": "contact details"
  }
}
```

## Troubleshooting

### Common Issues
1. **No vendors matched**: Check vendor services configuration
2. **Quotes not sending**: Verify vendor notification system
3. **Responses not showing**: Check API endpoints and data format
4. **Authentication errors**: Verify JWT tokens

### Debug Steps
1. Check browser console for API errors
2. Verify backend logs for quote processing
3. Check database for quote request records
4. Test notification system separately

## Next Steps

### Enhancements
1. Quote comparison tools
2. Vendor rating system
3. Quote negotiation features
4. Automated follow-ups
5. Quote expiration handling
6. Bulk quote operations