// Test script to reproduce skip button issue
// Run this in browser console on event creation page

console.log('=== SKIP BUTTON TEST ===');

// Check authentication
const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
console.log('Has access token:', !!accessToken);
console.log('Token preview:', accessToken?.substring(0, 30));

// Test API call with minimal data
const testEventData = {
  event_name: "Test Conference",
  event_type: "corporate", // Valid backend type
  attendees: 50,
  total_budget: 100000,
  services: ["general"], // Never empty
  form_data: {
    eventName: "Test Conference",
    clientName: "Test User",
    clientEmail: "test@example.com", 
    clientPhone: "1234567890",
    state: "Maharashtra",
    city: "Mumbai",
    dateTime: "2024-12-25T10:00",
    duration: "4-6 hours",
    budget: 100000,
    attendees: 50,
    event_type: "corporate",
    selectedVenueTypes: [],
    selectedVendorServices: []
  }
};

console.log('Test event data:', testEventData);

// Make API call
fetch('http://localhost:8000/api/events/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(testEventData)
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);
  return response.json();
})
.then(data => {
  console.log('Response data:', data);
  if (data.error || data.errors) {
    console.error('API Error:', data);
  } else {
    console.log('SUCCESS: Event created');
  }
})
.catch(error => {
  console.error('Network error:', error);
});