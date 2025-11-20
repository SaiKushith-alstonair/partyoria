// Test JWT token validity
const testToken = () => {
  const token = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  console.log('=== TOKEN TEST ===');
  console.log('Access token exists:', !!token);
  console.log('Refresh token exists:', !!refreshToken);
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const isExpired = currentTime >= expirationTime;
      
      console.log('Token expires at:', new Date(expirationTime));
      console.log('Current time:', new Date(currentTime));
      console.log('Token is expired:', isExpired);
      console.log('User ID in token:', payload.user_id);
    } catch (e) {
      console.log('Error parsing token:', e.message);
    }
  }
  
  // Check Zustand store
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    try {
      const authData = JSON.parse(authStorage);
      console.log('Zustand auth data:', authData);
    } catch (e) {
      console.log('Error parsing auth storage:', e.message);
    }
  }
};

testToken();