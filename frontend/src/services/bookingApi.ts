const API_BASE = 'http://127.0.0.1:8000/api/vendor/bookings';

const getAuthToken = () => {
  // Try customer token first
  let token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  
  // Fallback to vendor auth-storage
  if (!token) {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        token = authData?.state?.tokens?.access;
      } catch (e) {
        console.error('Failed to parse auth storage:', e);
      }
    }
  }
  
  return token;
};

export const bookingApi = {
  // Customer creates booking from accepted quote
  createBooking: async (quoteId: number, vendorName: string) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quote_id: quoteId,
        vendor_name: vendorName
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }

    return response.json();
  },

  // Get customer's bookings
  getCustomerBookings: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/customer/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  // Get vendor's bookings
  getVendorBookings: async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/vendor/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  // Get booking details
  getBookingDetail: async (bookingId: number) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/${bookingId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch booking details');
    return response.json();
  },

  // Vendor confirms booking
  confirmBooking: async (bookingId: number) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/${bookingId}/confirm/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to confirm booking');
    }

    return response.json();
  },

  // Cancel booking
  cancelBooking: async (bookingId: number, reason: string) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}/${bookingId}/cancel/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel booking');
    }

    return response.json();
  }
};
