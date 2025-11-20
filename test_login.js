// Test login to get fresh JWT tokens
const testLogin = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: 'saiku', 
        password: '1234' 
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Login successful:', data);
      
      // Store tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      console.log('Tokens stored successfully');
      
      // Test API call
      const eventsResponse = await fetch('http://127.0.0.1:8000/api/events/', {
        headers: {
          'Authorization': `Bearer ${data.access}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (eventsResponse.ok) {
        const events = await eventsResponse.json();
        console.log('Events fetched successfully:', events.length, 'events');
      } else {
        console.log('Events fetch failed:', eventsResponse.status, eventsResponse.statusText);
      }
    } else {
      const error = await response.json();
      console.log('Login failed:', error);
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
};

testLogin();