# 🔥 RUTHLESS FRONTEND FLOW TEST PLAN

## TEST ENVIRONMENT
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Database**: PostgreSQL (partyoria_db)
- **Test User**: Create fresh customer account
- **Test Vendors**: 5 vendors with services (already created)

---

## 🎯 TEST FLOW: Budget Allocation → Vendor Marketplace

### **STEP 1: USER REGISTRATION/LOGIN**
**Test Case 1.1: New User Signup**
- Navigate to http://localhost:3000
- Click "Sign Up" or "Get Started"
- Fill form: email, password, name
- **EXPECTED**: Redirect to dashboard
- **FAIL IF**: Error message, stuck on signup, no redirect

**Test Case 1.2: Existing User Login**
- Navigate to http://localhost:3000/login
- Enter credentials
- **EXPECTED**: Redirect to dashboard
- **FAIL IF**: Invalid credentials error, token not stored

---

### **STEP 2: EVENT CREATION**
**Test Case 2.1: Navigate to Event Creation**
- From dashboard, click "Create Event" or "Events" dropdown
- Select event category (e.g., Wedding)
- Select event type (e.g., Traditional Wedding)
- **EXPECTED**: Event creation form loads
- **FAIL IF**: 404 error, blank page, no form

**Test Case 2.2: Fill Event Form**
- Event Name: "Test Wedding Event"
- Date: Future date
- Location: "Mumbai, Maharashtra"
- Attendees: 200
- Budget: ₹3,50,000
- Duration: 8 hours
- Select requirements (catering, photography, decoration)
- **EXPECTED**: Form accepts all inputs
- **FAIL IF**: Validation errors, fields not saving

**Test Case 2.3: Submit Event**
- Click "Create Event" or "Save"
- **EXPECTED**: Success message, redirect to event list/dashboard
- **FAIL IF**: API error, event not created, stuck on form

---

### **STEP 3: BUDGET ALLOCATION**
**Test Case 3.1: Navigate to Budget Page**
- From dashboard, find created event
- Click event card or "View Budget"
- **EXPECTED**: Budget page loads with event details
- **FAIL IF**: 404, event not found, blank page

**Test Case 3.2: Smart Budget Allocation**
- Click "Smart Allocation" button
- **EXPECTED**: 
  - Loading indicator appears
  - Budget breakdown shows (Catering: X%, Photography: Y%, etc.)
  - Total allocated = ₹3,50,000
  - Efficiency score displayed
- **FAIL IF**: 
  - API error
  - No allocation shown
  - Total ≠ budget
  - Percentages don't add to 100%

**Test Case 3.3: Verify Budget Breakdown**
- Check each category has:
  - Category name
  - Percentage (%)
  - Amount (₹)
  - Per guest cost
  - Per hour cost
- **EXPECTED**: All fields populated with realistic values
- **FAIL IF**: NULL values, 0 amounts, NaN errors

---

### **STEP 4: FIND VENDORS BUTTON** ⭐ CRITICAL
**Test Case 4.1: Button Visibility**
- After budget allocation, look for "🎯 Find Vendors" button
- **EXPECTED**: Button visible in "Budget Actions" section
- **FAIL IF**: Button missing, hidden, disabled

**Test Case 4.2: Button Click**
- Click "🎯 Find Vendors" button
- **EXPECTED**: 
  - Redirect to `/vendors?budget=350000&eventId=123`
  - URL contains budget and eventId params
- **FAIL IF**: 
  - No redirect
  - Wrong URL
  - Missing params
  - 404 error

---

### **STEP 5: VENDOR MARKETPLACE** ⭐ CRITICAL
**Test Case 5.1: Marketplace Loads**
- Verify page loads at `/vendors`
- **EXPECTED**:
  - Page title: "Vendor Marketplace"
  - Subtitle: "Showing vendors within your budget: ₹3,50,000"
  - Filter section visible
  - Vendor cards displayed
- **FAIL IF**:
  - Blank page
  - No vendors shown
  - Budget message missing
  - API error in console

**Test Case 5.2: Vendor Cards Display**
- Count vendor cards on page
- **EXPECTED**: 5 vendors visible
  1. Rajesh Kumar - Photography (Mumbai)
  2. Priya Sharma - Catering (Delhi)
  3. Amit Patel - DJ (Bangalore)
  4. Neha Singh - Decoration (Pune)
  5. Kavita Reddy - Makeup Artist (Chennai)
- **FAIL IF**: 
  - 0 vendors
  - Less than 5 vendors
  - Duplicate vendors
  - Vendors with NULL data

**Test Case 5.3: Vendor Card Content**
For EACH vendor card, verify:
- ✅ Profile image (or placeholder)
- ✅ Vendor name
- ✅ Business type badge
- ✅ Rating (4.5★)
- ✅ Review count (50 reviews)
- ✅ Location (city, state)
- ✅ Services list (2 services)
- ✅ Total price
  - Photography: ₹70,000
  - Catering: ₹1,150/person ⚠️
  - DJ: ₹60,000
  - Decoration: ₹90,000
  - Makeup: ₹23,000
- ✅ "View Profile" button
- ✅ "Contact" button
- **FAIL IF**: Any field is NULL, undefined, or "0"

**Test Case 5.4: Budget Filter Applied**
- Verify all vendors shown are within ₹3,50,000 budget
- **EXPECTED**: All 5 vendors pass (highest is ₹90,000)
- **FAIL IF**: Vendors over budget shown

---

### **STEP 6: FILTERS & SEARCH**
**Test Case 6.1: Category Filter**
- Select "Photography" from category dropdown
- **EXPECTED**: Only 1 vendor (Rajesh Kumar)
- **FAIL IF**: Wrong vendors, no filter applied

**Test Case 6.2: Location Filter**
- Select "Mumbai" from location dropdown
- **EXPECTED**: Only 1 vendor (Rajesh Kumar)
- **FAIL IF**: Wrong vendors, no filter applied

**Test Case 6.3: Price Range Filter**
- Select "₹25,000 - ₹50,000"
- **EXPECTED**: DJ (₹60,000) hidden, others shown
- **FAIL IF**: Wrong filtering logic

**Test Case 6.4: Search**
- Type "Rajesh" in search box
- **EXPECTED**: Only photographer shown
- **FAIL IF**: No results, wrong results

**Test Case 6.5: Clear Filters**
- Reset all filters to "All"
- **EXPECTED**: All 5 vendors return
- **FAIL IF**: Vendors missing

---

### **STEP 7: VENDOR PROFILE DIALOG**
**Test Case 7.1: Open Profile**
- Click "View Profile" on any vendor
- **EXPECTED**: Modal/dialog opens with full profile
- **FAIL IF**: No dialog, blank dialog, error

**Test Case 7.2: Profile Content**
Verify dialog shows:
- ✅ Large profile image
- ✅ Vendor name
- ✅ Business type
- ✅ Rating & reviews
- ✅ Verified badge (if applicable)
- ✅ Services section with:
  - Service name
  - Category badge
  - Price
  - Description
  - Min/Max people (for catering)
- ✅ Total package price
- ✅ Contact information:
  - Email
  - Phone
  - Location
- ✅ "Contact Vendor" button
- ✅ "Send Message" button
- **FAIL IF**: Any section missing or NULL

**Test Case 7.3: Service Details**
For Photography vendor, verify:
- Service 1: Wedding Photography - ₹45,000
- Service 2: Pre-Wedding Shoot - ₹25,000
- Total: ₹70,000
- **FAIL IF**: Wrong prices, missing services

**Test Case 7.4: Close Profile**
- Click X or outside dialog
- **EXPECTED**: Dialog closes, returns to marketplace
- **FAIL IF**: Dialog stuck, page broken

---

### **STEP 8: CONTACT VENDOR**
**Test Case 8.1: Open Contact Form**
- Click "Contact" button on vendor card
- **EXPECTED**: Contact dialog opens
- **FAIL IF**: No dialog, error

**Test Case 8.2: Fill Contact Form**
- Name: "Test Customer"
- Email: "test@example.com"
- Phone: "9876543210"
- Message: "Interested in your services"
- **EXPECTED**: All fields accept input
- **FAIL IF**: Validation errors, fields disabled

**Test Case 8.3: Submit Contact**
- Click "Send Message"
- **EXPECTED**: 
  - Success toast/message
  - Dialog closes
  - (Backend: Email sent to vendor - not testable in frontend)
- **FAIL IF**: 
  - API error
  - No confirmation
  - Dialog stuck

---

### **STEP 9: BACK NAVIGATION**
**Test Case 9.1: Back Button**
- Click "← Back" button in marketplace
- **EXPECTED**: Return to budget page or dashboard
- **FAIL IF**: 404, wrong page, broken navigation

**Test Case 9.2: Browser Back**
- Use browser back button
- **EXPECTED**: Return to previous page with state preserved
- **FAIL IF**: Blank page, lost state

---

## 🚨 CRITICAL BUGS TO WATCH FOR

### **HIGH PRIORITY:**
1. ❌ **No vendors shown** → API not returning data
2. ❌ **Budget filter not working** → All vendors shown regardless of budget
3. ❌ **"Find Vendors" button missing** → Can't access marketplace
4. ❌ **Profile dialog blank** → Services not loading
5. ❌ **Contact form fails** → API error on submit

### **MEDIUM PRIORITY:**
6. ⚠️ **Catering price confusing** → Shows ₹1,150 instead of ₹1,150/person
7. ⚠️ **Filters don't work** → Category/location filter broken
8. ⚠️ **Search returns nothing** → Search logic broken
9. ⚠️ **Images missing** → All vendors show placeholder
10. ⚠️ **Wrong vendor count** → Less than 5 vendors

### **LOW PRIORITY:**
11. 🟡 **Styling issues** → Layout broken, overlapping text
12. 🟡 **Loading states missing** → No spinner during API calls
13. 🟡 **Error messages unclear** → Generic "Error" instead of specific message
14. 🟡 **Mobile responsive** → Broken on small screens

---

## 📊 SUCCESS CRITERIA

### **MUST PASS (100% required):**
- ✅ Event creation works
- ✅ Budget allocation works
- ✅ "Find Vendors" button appears and works
- ✅ Marketplace loads with vendors
- ✅ At least 3 vendors shown
- ✅ Vendor profiles open and show data
- ✅ Contact form submits successfully

### **SHOULD PASS (80% required):**
- ✅ Budget filter works correctly
- ✅ Category filter works
- ✅ Location filter works
- ✅ Search works
- ✅ All 5 vendors shown
- ✅ Prices displayed correctly
- ✅ Services listed for each vendor

### **NICE TO HAVE (50% required):**
- ✅ Profile images load
- ✅ Smooth animations
- ✅ Loading states
- ✅ Error handling
- ✅ Mobile responsive

---

## 🔧 DEBUGGING CHECKLIST

If test fails, check:
1. **Browser Console** → JavaScript errors?
2. **Network Tab** → API calls failing? 401/404/500?
3. **Backend Logs** → Django errors?
4. **Database** → Vendors exist? Services exist?
5. **LocalStorage** → Token stored? User data present?
6. **URL Params** → Budget and eventId in URL?

---

## 📝 TEST EXECUTION LOG

**Tester**: [Your Name]
**Date**: [Date]
**Environment**: Local Development
**Browser**: [Chrome/Firefox/Edge]

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1 Signup | ⬜ | |
| 1.2 Login | ⬜ | |
| 2.1 Navigate Event | ⬜ | |
| 2.2 Fill Form | ⬜ | |
| 2.3 Submit Event | ⬜ | |
| 3.1 Budget Page | ⬜ | |
| 3.2 Smart Allocation | ⬜ | |
| 3.3 Verify Breakdown | ⬜ | |
| 4.1 Button Visible | ⬜ | |
| 4.2 Button Click | ⬜ | |
| 5.1 Marketplace Loads | ⬜ | |
| 5.2 Vendor Cards | ⬜ | |
| 5.3 Card Content | ⬜ | |
| 5.4 Budget Filter | ⬜ | |
| 6.1 Category Filter | ⬜ | |
| 6.2 Location Filter | ⬜ | |
| 6.3 Price Filter | ⬜ | |
| 6.4 Search | ⬜ | |
| 7.1 Open Profile | ⬜ | |
| 7.2 Profile Content | ⬜ | |
| 7.3 Service Details | ⬜ | |
| 8.1 Contact Form | ⬜ | |
| 8.2 Fill Form | ⬜ | |
| 8.3 Submit Contact | ⬜ | |
| 9.1 Back Button | ⬜ | |

**Legend**: ✅ Pass | ❌ Fail | ⚠️ Partial | ⬜ Not Tested

---

## 🎯 FINAL VERDICT

**PASS**: All MUST PASS criteria met + 80% SHOULD PASS
**PARTIAL PASS**: All MUST PASS met + 50% SHOULD PASS
**FAIL**: Any MUST PASS criteria failed

**Overall Status**: [ ] PASS | [ ] PARTIAL | [ ] FAIL

**Critical Bugs Found**: _____
**Medium Bugs Found**: _____
**Low Bugs Found**: _____

**Ready for Production?**: [ ] YES | [ ] NO | [ ] WITH FIXES

---

## 🚀 NEXT STEPS AFTER TESTING

If PASS:
1. Add booking creation flow
2. Add payment integration
3. Add vendor notifications
4. Add review system

If FAIL:
1. Fix critical bugs first
2. Re-test failed cases
3. Document all issues
4. Prioritize fixes

---

**START TESTING NOW:**
1. Start backend: `cd backend && python manage.py runserver`
2. Frontend already running at http://localhost:3000
3. Open browser console (F12)
4. Follow test cases in order
5. Document EVERY failure
6. Take screenshots of bugs
7. Report back with results

**I'M READY TO BREAK EVERYTHING. LET'S GO.** 🔥
