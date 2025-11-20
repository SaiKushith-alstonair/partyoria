

// Input sanitization for frontend
const sanitizeInput = (input: any): string => {
  if (typeof input !== 'string') {
    return String(input || '');
  }
  return input
    .replace(/[<>\"'&]/g, (match) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match] || match;
    })
    .trim()
    .slice(0, 1000); // Limit length
};

// Validate email format
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Validate phone number
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

// Rate limiting tracker
class RateLimiter {
  private static attempts: Map<string, number[]> = new Map();
  
  static checkLimit(endpoint: string, maxAttempts: number = 100, windowMs: number = 3600000): boolean {
    const now = Date.now();
    const key = endpoint;
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }
    
    const attempts = this.attempts.get(key)!;
    
    // Clean old attempts
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      console.warn(`Rate limit exceeded for ${endpoint}`);
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
}

class SecureApiService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
  }
  
  private async secureRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    skipAuth: boolean = false
  ): Promise<T> {
    // Rate limiting
    if (!RateLimiter.checkLimit(endpoint)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    // Validate endpoint
    const sanitizedEndpoint = sanitizeInput(endpoint);
    if (sanitizedEndpoint !== endpoint) {
      throw new Error('Invalid endpoint');
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    
    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL');
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };
    
    // Add authentication if not skipped
    if (!skipAuth) {
      let token = localStorage.getItem('access_token') || 
                 sessionStorage.getItem('access_token') ||
                 localStorage.getItem('authToken') || 
                 localStorage.getItem('token') || 
                 sessionStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add CSRF token for state-changing operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
      const csrfToken = this.getCSRFToken();
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }
    }
    
    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Include cookies for CSRF
    };
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const refreshResponse = await fetch(`${this.baseUrl.replace('/api', '')}/api/auth/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken })
              });
              
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                localStorage.setItem('access_token', refreshData.access);
                
                // Retry original request with new token
                headers['Authorization'] = `Bearer ${refreshData.access}`;
                const retryResponse = await fetch(url, { ...config, headers });
                
                if (retryResponse.ok) {
                  return await retryResponse.json();
                }
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
          throw new Error('Authentication expired. Please try again.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data; // Handle both wrapped and unwrapped responses
      
    } catch (error: any) {
      console.error(`API request failed: ${endpoint}`, error.message);
      throw error;
    }
  }
  
  private getCSRFToken(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }
  
  // Secure event operations
  async getEvents(query?: string, limit?: number, offset?: number): Promise<any[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', sanitizeInput(query));
    if (limit) params.append('limit', String(Math.min(limit, 100)));
    if (offset) params.append('offset', String(Math.max(offset, 0)));
    
    const endpoint = `/events/${params.toString() ? '?' + params.toString() : ''}`;
    return this.secureRequest<any[]>(endpoint);
  }
  
  async createEvent(eventData: any): Promise<any> {
    // Validate and sanitize event data
    const sanitizedData = this.validateEventData(eventData);
    
    return this.secureRequest<any>('/events/', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    });
  }
  
  async getEvent(id: number): Promise<any> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid event ID');
    }
    
    return this.secureRequest<any>(`/events/${id}/`);
  }
  
  async updateEvent(id: number, eventData: any): Promise<any> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid event ID');
    }
    
    const sanitizedData = this.validateEventData(eventData);
    
    return this.secureRequest<any>(`/events/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(sanitizedData),
    });
  }
  
  async deleteEvent(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid event ID');
    }
    
    await this.secureRequest<void>(`/events/${id}/`, {
      method: 'DELETE',
    });
  }
  
  // Budget operations
  async getBudgetSummary(eventId: number): Promise<any> {
    if (!Number.isInteger(eventId) || eventId <= 0) {
      throw new Error('Invalid event ID');
    }
    
    return this.secureRequest<any>(`/events/${eventId}/budget-summary/`);
  }
  
  async allocateBudget(eventId: number): Promise<any> {
    if (!Number.isInteger(eventId) || eventId <= 0) {
      throw new Error('Invalid event ID');
    }
    
    return this.secureRequest<any>(`/events/${eventId}/allocate-budget/`, {
      method: 'POST',
    });
  }
  
  async updateBudget(eventId: number, allocations: Record<string, number>): Promise<any> {
    if (!Number.isInteger(eventId) || eventId <= 0) {
      throw new Error('Invalid event ID');
    }
    
    return this.secureRequest<any>(`/events/${eventId}/update-budget/`, {
      method: 'PUT',
      body: JSON.stringify({ allocations }),
    });
  }
  
  // Public endpoints (no auth required)
  async getEventSections(): Promise<any[]> {
    return this.secureRequest<any[]>('/events/sections/', {}, true);
  }
  
  async getEventImages(): Promise<any[]> {
    return this.secureRequest<any[]>('/events/images/', {}, true);
  }
  
  // Vendor operations
  async getVendors(filters?: any): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', String(filters.category));
    if (filters?.location) params.append('location', String(filters.location));
    if (filters?.search) params.append('search', String(filters.search));
    if (filters?.price_range) params.append('price_range', String(filters.price_range));
    if (filters?.limit) params.append('limit', String(Math.min(filters.limit, 200)));
    
    const queryString = params.toString();
    const endpoint = `/vendor/marketplace/${queryString ? '?' + queryString : ''}`;
    
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch vendors: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Vendor fetch error:', error);
      throw new Error(error?.message || 'Failed to load vendors');
    }
  }
  
  // Authentication endpoints
  async login(email: string, password: string): Promise<any> {
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    return this.secureRequest<any>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({
        email: sanitizeInput(email).toLowerCase(),
        password: password, // Don't sanitize password
      }),
    }, true);
  }
  
  async register(userData: any): Promise<any> {
    const sanitizedData = this.validateUserData(userData);
    
    return this.secureRequest<any>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    }, true);
  }
  
  // Data validation methods
  private validateEventData(data: any): any {
    const validated: any = {};
    
    // Required fields
    if (!data.event_name || typeof data.event_name !== 'string') {
      throw new Error('Event name is required');
    }
    validated.event_name = sanitizeInput(data.event_name);
    
    // Optional fields
    if (data.client_name) {
      validated.client_name = sanitizeInput(data.client_name);
    }
    
    if (data.client_email) {
      if (!validateEmail(data.client_email)) {
        throw new Error('Invalid email format');
      }
      validated.client_email = sanitizeInput(data.client_email).toLowerCase();
    }
    
    if (data.client_phone) {
      if (!validatePhone(data.client_phone)) {
        throw new Error('Invalid phone number format');
      }
      validated.client_phone = sanitizeInput(data.client_phone);
    }
    
    if (data.attendees) {
      const attendees = Number(data.attendees);
      if (!Number.isInteger(attendees) || attendees < 1 || attendees > 100000) {
        throw new Error('Invalid attendee count');
      }
      validated.attendees = attendees;
    }
    
    if (data.budget) {
      const budget = Number(data.budget);
      if (isNaN(budget) || budget < 0 || budget > 10000000) {
        throw new Error('Invalid budget amount');
      }
      validated.budget = budget;
    }
    
    if (data.description) {
      validated.description = sanitizeInput(data.description);
    }
    
    return validated;
  }
  
  private validateUserData(data: any): any {
    const validated: any = {};
    
    // Email validation
    if (!data.email || !validateEmail(data.email)) {
      throw new Error('Valid email is required');
    }
    validated.email = sanitizeInput(data.email).toLowerCase();
    
    // Password validation
    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    validated.password = data.password; // Don't sanitize password
    
    // Name validation
    if (data.first_name) {
      validated.first_name = sanitizeInput(data.first_name);
    }
    
    if (data.last_name) {
      validated.last_name = sanitizeInput(data.last_name);
    }
    
    if (data.phone) {
      if (!validatePhone(data.phone)) {
        throw new Error('Invalid phone number format');
      }
      validated.phone = sanitizeInput(data.phone);
    }
    
    return validated;
  }
}

export const secureApiService = new SecureApiService();