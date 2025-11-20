# Category-Specific Quote System

## Overview

The enhanced quote system now sends **category-specific requirements and budgets** to vendors instead of sending all event information to everyone. This ensures vendors only receive relevant information for their services.

## Key Features

### 🎯 Targeted Quotes
- **Catering vendors** receive only catering requirements and catering budget
- **Photography vendors** receive only photography requirements and photography budget  
- **Decoration vendors** receive only decoration requirements and decoration budget
- **Entertainment vendors** receive only entertainment requirements and entertainment budget
- And so on for all service categories

### 💰 Category-Specific Budget Allocation
- Each vendor category gets their allocated budget amount
- Budget includes percentage of total, per-guest cost, per-hour cost
- No vendor sees the total event budget or other categories' allocations

### 📋 Filtered Requirements
- Vendors only see requirements relevant to their category
- Includes specific questions and answers for their services
- Quantity, unit, and detailed specifications included

## How It Works

### 1. Event Creation with Requirements
```json
{
  "special_requirements": {
    "catering": {
      "selected": true,
      "quantity": 150,
      "questions": [...],
      "answers": {
        "1": "Multi-cuisine",
        "2": "3 course meal"
      }
    },
    "photography": {
      "selected": true,
      "questions": [...],
      "answers": {
        "1": "Professional style",
        "2": "6-8 hours"
      }
    }
  }
}
```

### 2. Budget Allocation by Category
```json
{
  "catering": {
    "budget": 225000,
    "percentage": 45.0,
    "per_guest_cost": 1500
  },
  "photography": {
    "budget": 125000,
    "percentage": 25.0,
    "per_guest_cost": 833
  }
}
```

### 3. Targeted Quote Creation
When creating a targeted quote, the system:
- Extracts category-specific requirements
- Maps budget allocations to categories
- Stores category-specific data in `QuoteRequest.category_specific_data`

### 4. Vendor Notifications
Each vendor category receives:
```
CATERING VENDORS GET:
- Event basic info (date, location, guests)
- Catering requirements only
- Catering budget allocation only
- Catering-specific questions & answers

PHOTOGRAPHY VENDORS GET:
- Event basic info (date, location, guests)  
- Photography requirements only
- Photography budget allocation only
- Photography-specific questions & answers
```

## API Endpoints

### Create Targeted Quote
```http
POST /api/quote-requests/
{
  "quote_type": "targeted",
  "prefilled_event_id": 123,
  // ... other fields
}
```

### Get Category-Specific Data
```http
GET /api/quote-requests/{id}/category-data/?category=catering
```

### Get Vendor-Specific Quotes
```http
GET /api/quote-requests/vendor-specific/?category=photography
```

### Send Vendor Notifications
```http
POST /api/quote-requests/{id}/notify-vendors/
```

## Database Schema

### QuoteRequest Model Enhancement
```python
class QuoteRequest(models.Model):
    # ... existing fields ...
    
    category_specific_data = models.JSONField(
        default=dict,
        help_text='Category-specific requirements and budget allocation'
    )
```

### Category Data Structure
```json
{
  "catering": {
    "requirements": {
      "catering": {
        "selected": true,
        "quantity": 150,
        "questions": [...],
        "answers": {...}
      }
    },
    "budget": 225000.0,
    "details": {
      "percentage": 45.0,
      "per_guest_cost": 1500.0,
      "per_hour_cost": 37500.0
    }
  }
}
```

## Service Category Mapping

The system automatically maps services to categories:

| Category | Keywords |
|----------|----------|
| **Catering** | catering, food, menu, cake, cuisine, buffet |
| **Photography** | photography, videography, photo, video, camera |
| **Decorations** | decoration, decor, setup, flower, balloon, mandap |
| **Entertainment** | entertainment, music, dj, band, dance, magic |
| **Venues** | venue, hall, location, space |
| **Audio Visual** | audio, visual, sound, microphone, projection |
| **Lighting** | lighting, light, led, disco |

## Benefits

### For Vendors
- ✅ Receive only relevant requirements
- ✅ See appropriate budget allocation
- ✅ Faster quote preparation
- ✅ No information overload
- ✅ Better conversion rates

### For Clients
- ✅ More accurate quotes
- ✅ Faster vendor responses
- ✅ Better budget utilization
- ✅ Targeted vendor selection

### For Platform
- ✅ Higher vendor engagement
- ✅ Better quote quality
- ✅ Reduced vendor confusion
- ✅ Improved success rates

## Usage Examples

### Example 1: Catering Vendor Email
```
Subject: Quote Request - Catering Services for Corporate Event

EVENT DETAILS:
- Event Type: Corporate
- Date: 2024-02-15
- Location: Mumbai
- Guest Count: 150

CATERING REQUIREMENTS:
• Catering: Quantity: 150 guests
  Details:
    - Multi-cuisine
    - 3 course meal
    - Yes, 2-3 live cooking stations

BUDGET ALLOCATION:
Allocated Budget: ₹2,25,000.00 (45.0% of total budget)
Per Guest Cost: ₹1,500.00
```

### Example 2: Photography Vendor Email
```
Subject: Quote Request - Photography Services for Corporate Event

EVENT DETAILS:
- Event Type: Corporate
- Date: 2024-02-15
- Location: Mumbai
- Guest Count: 150

PHOTOGRAPHY REQUIREMENTS:
• Photography: Quantity: 1 photographer
  Details:
    - Professional corporate style
    - 6-8 hours duration

BUDGET ALLOCATION:
Allocated Budget: ₹1,25,000.00 (25.0% of total budget)
Per Guest Cost: ₹833.33
```

## Testing

Run the test script to see the functionality in action:

```bash
cd backend
python test_category_quotes.py
```

This will demonstrate:
- Event creation with category-specific requirements
- Budget allocation by category
- Targeted quote request creation
- Category-specific vendor notifications
- Vendor-specific data access

## Migration

To apply the database changes:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

## Configuration

Update your email settings in `settings.py` for vendor notifications:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'your-smtp-host'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email'
EMAIL_HOST_PASSWORD = 'your-password'
DEFAULT_FROM_EMAIL = 'noreply@partyoria.com'
```