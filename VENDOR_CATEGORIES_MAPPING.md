# Vendor Categories Mapping - Complete Reference

## Database Status: ✓ ALL CATEGORIES COVERED

**Total Vendors: 100**

---

## Vendor Business Types in Database

| Business Type | Vendor Count | Services Offered |
|--------------|--------------|------------------|
| **Baker** | 2 | Wedding Cake, Cupcakes, Dessert Table, Custom Desserts, Cookies & Pastries |
| **Catering** | 15 | Vegetarian, Non-Vegetarian, Buffet, Live Stalls, Desserts, Beverages, Plated Service, Themed Cuisine, International Menu, BBQ & Grill |
| **Decoration** | 12 | Stage & Mandap, Theme-based, Floral, Balloon & Neon, Drapery, Entrance Gate, Lighting Setup, Backdrop, Furniture Rental, Props, Table Centerpieces, Selfie Corners, Tent/Canopy, Greenery & Garden |
| **DJ** | 10 | Club DJ, Wedding DJ, Corporate DJ, Live Band, Sound & Lighting Setup, Emcee & Host, Karaoke Setup, DJ Night Party Setup |
| **Entertainment** | 3 | Live Band Performance, Stand-up Comedy, Magic Show, Dance Troupe, Celebrity Performance, Kids Entertainment, Game Stalls |
| **Event Manager** | 8 | Wedding Management, Corporate Event, Birthday/Private Party |
| **Fashion Designer** | 2 | Bridal Wear, Custom Designs, Party Wear, Ethnic & Traditional Outfits, Mens Designer Wear |
| **Florist** | 6 | Wedding Flowers, Bouquets, Stage Floral Decoration, Garlands & Floral Jewelry, Floral Centerpieces |
| **Gift Services** | 2 | Return Gifts, Gift Hampers, Corporate Gifts, Custom Gifts, Gift Wrapping & Packaging |
| **Hair Stylist** | 2 | Bridal Hairstyle, Party Hairstyle, Fashion Hairstyle, Hair Extensions, Hair Spa & Treatment |
| **Lighting** | 3 | Stage Lighting, Ambient Lighting, DJ Lighting, Fairy & Decorative Lights, Outdoor Flood Lighting, LED Wall Setup, Laser Show |
| **Makeup Artist** | 10 | Bridal Makeup, Party Makeup, Airbrush Makeup, HD Makeup, Groom Makeup |
| **Photography** | 13 | Wedding Photography, Candid Photography, Drone Photography, Album/Book Design, Photo Retouching, Baby/Maternity Shoot, Corporate Photography, Product Photography, Fashion/Portfolio Photography |
| **Transportation** | 3 | Luxury Car Rental, Vintage Car Rental, Bridal Car Rental, Guest Shuttle Bus, Valet Parking, Airport Pickup/Drop, Bus/Tempo Traveller |
| **Videography** | 9 | Traditional Videography, Cinematic Videography, Drone Videography, Highlight Films, Event Live Streaming, Video Editing, Wedding Teaser & Trailer, Short Reels & Social Media Edits |

---

## Budget Category to Vendor Business Type Mapping

### Food & Beverage
- `catering` → **Catering**
- `beverages` → **Catering**
- `special_dietary` → **Catering**

### Venue & Location
- `venue_rental` → **Event Manager**
- `venue_setup` → **Event Manager**
- `venue` → **Event Manager**

### Technical & Equipment
- `audio_visual` → **DJ**
- `lighting` → **Lighting**
- `stage_setup` → **Event Manager**
- `recording_equipment` → **Videography**

### Entertainment & Activities
- `entertainment` → **Entertainment**
- `music_dj` → **DJ**
- `special_performances` → **Entertainment**

### Visual & Documentation
- `photography` → **Photography**
- `videography` → **Videography**

### Decoration & Styling
- `decorations` → **Decoration**
- `flowers` → **Florist**
- `special_themes` → **Decoration**

### Coordination & Management
- `event_coordination` → **Event Manager**
- `staff_management` → **Event Manager**

### Support Services
- `transportation` → **Transportation**
- `transport` → **Transportation**
- `security` → **Event Manager**
- `beauty_services` → **Makeup Artist**
- `guest_services` → **Event Manager**

### Additional Services
- `baker` → **Baker**
- `hair_stylist` → **Hair Stylist**
- `fashion_designer` → **Fashion Designer**
- `gift_services` → **Gift Services**

### Miscellaneous
- `other_services` → **Event Manager**
- `contingency` → **Event Manager**

---

## How It Works

1. **Budget Allocation**: User allocates budget to categories like "entertainment", "lighting", "transportation"
2. **Category Mapping**: Backend maps budget category to vendor business type
3. **Vendor Filtering**: Marketplace shows only vendors matching the business type
4. **Price Filtering**: Further filters by allocated budget amount

### Example Flow:
```
Budget: entertainment = ₹26,400
  ↓
Mapping: entertainment → Entertainment
  ↓
Filter: business_type = "Entertainment" AND total_price ≤ ₹26,400
  ↓
Result: Shows 1 vendor (Fun Fiesta Entertainment with ₹20,000 total)
```

---

## API Usage

### Get Vendors by Budget Category
```bash
GET /api/vendor/marketplace/?category=entertainment&price_range=0-26400
```

### Response
```json
{
  "success": true,
  "results": [
    {
      "id": 101,
      "full_name": "Fun Fiesta Entertainment",
      "business": "Entertainment",
      "services": [
        {"service_name": "Kids Entertainment", "service_price": 12000},
        {"service_name": "Game Stalls", "service_price": 8000}
      ]
    }
  ],
  "count": 1
}
```

---

## Vendor Credentials

All new vendors created with:
- **Password**: `vendor123`
- **Status**: Verified & Active
- **Locations**: Mumbai, Delhi, Bangalore

---

## Files Modified

1. `backend/vendors/marketplace_views.py` - Added complete category mapping
2. `backend/add_missing_vendors.py` - Script to add 14 new vendors
3. `frontend/src/services/secureApi.ts` - Removed sanitization blocking
4. `frontend/src/components/BudgetControl.tsx` - Added per-category vendor buttons
5. `frontend/src/components/marketplace/VendorMarketplace.tsx` - Enhanced filtering UI

---

## Testing

✓ Entertainment category: 3 vendors
✓ Lighting category: 3 vendors  
✓ Transportation category: 3 vendors
✓ Baker category: 2 vendors
✓ Hair Stylist category: 2 vendors
✓ Fashion Designer category: 2 vendors
✓ Gift Services category: 2 vendors

**All budget categories now have matching vendors!**
