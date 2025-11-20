/**
 * Temporary authentication bypass for testing quote system
 */

export const setTestAuth = () => {
  // Create a mock JWT-like token for development
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwidXNlcl9pZCI6MiwidXNlcm5hbWUiOiJzYWlrdSJ9.test-signature';
  
  // Set test user data
  const testUser = {
    id: 2,
    username: 'saiku',
    email: 'saiku@test.com',
    first_name: 'Test',
    last_name: 'User'
  };
  
  // Store in both locations
  localStorage.setItem('access_token', testToken);
  sessionStorage.setItem('access_token', testToken);
  localStorage.setItem('partyoria_user', JSON.stringify(testUser));
  sessionStorage.setItem('partyoria_user', JSON.stringify(testUser));
  
  // Also create some test events for development
  const testEvents = [
    {
      id: 1,
      event_name: 'Test Wedding',
      event_type: 'wedding',
      attendees: 100,
      total_budget: 500000,
      services: ['catering', 'photography', 'decoration'],
      form_data: {
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        dateTime: '2024-12-25T18:00:00',
        city: 'Mumbai',
        state: 'Maharashtra',
        budget: 500000,
        attendees: 100,
        description: 'Beautiful wedding celebration'
      },
      special_requirements: {
        'wedding-photography': {
          selected: true,
          quantity: 1,
          unit: 'photographer'
        },
        'catering-service': {
          selected: true,
          quantity: 100,
          unit: 'guests'
        }
      },
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      event_name: 'Corporate Conference',
      event_type: 'corporate',
      attendees: 50,
      total_budget: 200000,
      services: ['venue', 'catering', 'av-equipment'],
      form_data: {
        clientName: 'ABC Corp',
        clientEmail: 'events@abc.com',
        dateTime: '2024-11-30T09:00:00',
        city: 'Delhi',
        state: 'Delhi',
        budget: 200000,
        attendees: 50,
        description: 'Annual company conference'
      },
      special_requirements: {
        'av-equipment': {
          selected: true,
          quantity: 1,
          unit: 'setup'
        }
      },
      created_at: new Date().toISOString()
    }
  ];
  
  const userEventsKey = `userEvents_${testUser.id}`;
  localStorage.setItem(userEventsKey, JSON.stringify(testEvents));
  
  console.log('🔧 Test authentication set up');
  console.log('User:', testUser);
  console.log('Token:', testToken.substring(0, 50) + '...');
  console.log('Test events created:', testEvents.length);
};

export const clearTestAuth = () => {
  localStorage.removeItem('access_token');
  sessionStorage.removeItem('access_token');
  localStorage.removeItem('partyoria_user');
  sessionStorage.removeItem('partyoria_user');
  
  console.log('🧹 Test authentication cleared');
};

// Auto-setup for development - disabled to prevent conflicts
// if (import.meta.env.DEV) {
//   console.log('🚀 Development mode - setting up test auth');
//   setTestAuth();
// }