const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Input sanitization helper
const sanitizeInput = (input: any): string => {
  if (typeof input !== 'string') {
    return String(input || '');
  }
  return input
    .replace(/[<>"'&]/g, (match) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match] || match;
    })
    .trim();
};

// Safe logging helper
const safeLog = (message: string, data?: any) => {
  if (import.meta.env?.DEV && import.meta.env?.VITE_ENABLE_LOGGING !== 'false') {
    if (data) {
      console.log(message, typeof data === 'object' ? '[Object]' : sanitizeInput(data));
    } else {
      console.log(message);
    }
  }
};

export interface ApiEvent {
  id?: number;
  event_name: string;
  event_type?: 'corporate' | 'wedding' | 'birthday' | 'festival' | 'other';
  attendees?: number;
  venue_type?: 'indoor' | 'outdoor' | 'hybrid';
  duration?: number;
  total_budget?: number;
  services: string[];
  form_data: any;
  special_requirements?: Record<string, { selected: boolean; quantity?: number; unit?: string; }>;
  selected_services?: string[];
  budget_allocations?: Array<{
    id?: number;
    category: string;
    percentage: number;
    amount: number;
    created_at?: string;
    updated_at?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface ApiEventSection {
  section_id: string;
  name: string;
  icon: string;
  subsections: ApiEventSubsection[];
}

export interface ApiEventSubsection {
  subsection_id: string;
  name: string;
}

export interface ApiEventImage {
  event_id: string;
  image_url: string;
  description: string;
}

export interface ApiEventRequirement {
  event_id: string;
  category_name: string;
  requirement_id: string;
  label: string;
  category: string;
  unit?: string;
  placeholder?: string;
}

export interface ApiVendorCategory {
  category_id: string;
  name: string;
  vendors: any[];
}

export interface ApiLocation {
  id: number;
  state: string;
  city: string;
}

export interface ApiTraditionStyle {
  id: number;
  event_type?: string;
  style_name: string;
  description: string;
}

export interface ApiVendor {
  id: number;
  name: string;
  category: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
  location: string;
  price_range_min: number;
  price_range_max: number;
  rating: number;
  is_available: boolean;
}

export interface ApiVendorBooking {
  id?: number;
  vendor_id: number;
  event_id: number;
  booking_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

class ApiService {
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      // Consider token expired if it expires within 30 seconds
      return currentTime >= (expirationTime - 30000);
    } catch (error) {
      return true; // If we can't parse the token, consider it expired
    }
  }

  private clearAllTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('authToken');
    
    // Clear Zustand auth store
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        if (authData?.state) {
          authData.state.tokens = null;
          authData.state.isAuthenticated = false;
          authData.state.user = null;
          localStorage.setItem('auth-storage', JSON.stringify(authData));
        }
      }
    } catch (e) {
      localStorage.removeItem('auth-storage');
    }
  }

  private async refreshTokenIfNeeded(): Promise<string | null> {
    // Get tokens from multiple sources
    let token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    let refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
    
    // Check Zustand auth store
    if (!token || !refreshToken) {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const authData = JSON.parse(authStorage);
          if (authData?.state?.tokens) {
            token = token || authData.state.tokens.access;
            refreshToken = refreshToken || authData.state.tokens.refresh;
          }
        }
      } catch (e) {
        console.warn('Failed to parse auth storage:', e);
      }
    }

    if (!token && !refreshToken) {
      return null;
    }

    // If we have a valid token that's not expired, return it
    if (token && !this.isTokenExpired(token)) {
      return token;
    }

    // Try to refresh the token
    if (refreshToken && !this.isTokenExpired(refreshToken)) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/api/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken })
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newToken = refreshData.access;
          
          // Store new token
          localStorage.setItem('access_token', newToken);
          
          // Update Zustand store
          try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
              const authData = JSON.parse(authStorage);
              if (authData?.state?.tokens) {
                authData.state.tokens.access = newToken;
                localStorage.setItem('auth-storage', JSON.stringify(authData));
              }
            }
          } catch (e) {
            // Ignore update errors
          }
          
          return newToken;
        } else {
          // Refresh failed, clear all tokens and redirect to login
          console.warn('Token refresh failed - logging out user');
          this.clearAllTokens();
          // Redirect to login page
          if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            window.location.href = '/';
          }
          return null;
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        this.clearAllTokens();
        return null;
      }
    } else {
      // No valid refresh token, clear everything
      this.clearAllTokens();
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      // Get authentication token and refresh if needed
      const token = await this.refreshTokenIfNeeded();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const config: RequestInit = {
        headers,
        ...options,
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        // If 401, clear tokens but don't auto-redirect
        if (response.status === 401) {
          console.warn('Authentication failed - clearing tokens');
          this.clearAllTokens();
        }
        
        const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      // Safe error logging without exposing sensitive data
      safeLog(`API request failed: ${sanitizeInput(endpoint)}`, {
        method: options.method || 'GET',
        status: 'error'
      });
      
      // Re-throw with sanitized error message
      throw new Error(`API request failed: ${sanitizeInput(error.message)}`);
    }
  }

  // Events API
  async getEvents(): Promise<ApiEvent[]> {
    try {
      const token = await this.refreshTokenIfNeeded();
      if (!token) {
        return [];
      }
      const events = await this.request<ApiEvent[]>('/events/');
      safeLog(`API: Retrieved ${Array.isArray(events) ? events.length : 0} events`);
      return Array.isArray(events) ? events : [];
    } catch (error: any) {
      safeLog(`API: Failed to get events - ${error.message}`);
      return [];
    }
  }

  async getUserEvents(): Promise<ApiEvent[]> {
    try {
      safeLog('API: Requesting user events...');
      // Backend automatically filters by authenticated user
      const events = await this.request<ApiEvent[]>('/events/');
      safeLog(`API: Retrieved ${events.length} user events`);
      return events;
    } catch (error) {
      safeLog('API: Failed to get user events');
      throw error;
    }
  }

  async createEvent(event: Omit<ApiEvent, 'id'>): Promise<ApiEvent> {
    safeLog('Creating event');
    
    // Sanitize event data
    const sanitizedEvent = {
      ...event,
      event_name: sanitizeInput(event.event_name),
      // Ensure services is never empty
      services: event.services && event.services.length > 0 ? event.services : ['general'],
      form_data: event.form_data ? {
        ...event.form_data,
        clientName: sanitizeInput(event.form_data.clientName),
        clientEmail: sanitizeInput(event.form_data.clientEmail),
        description: sanitizeInput(event.form_data.description)
      } : event.form_data
    };
    
    console.log('Final sanitized event data:', JSON.stringify(sanitizedEvent, null, 2));
    console.log('Event type being sent:', sanitizedEvent.event_type);
    console.log('Services being sent:', sanitizedEvent.services);
    
    return this.request<ApiEvent>('/events/', {
      method: 'POST',
      body: JSON.stringify(sanitizedEvent),
    });
  }

  async getEvent(id: number): Promise<ApiEvent> {
    return this.request<ApiEvent>(`/events/${id}/`);
  }

  async updateEvent(id: number, event: Partial<ApiEvent>): Promise<ApiEvent> {
    return this.request<ApiEvent>(`/events/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: number): Promise<void> {
    const url = `${API_BASE_URL}/events/${id}/`;
    const token = await this.refreshTokenIfNeeded();
    
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok && response.status !== 204) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  async searchEvents(query: string, eventType?: string): Promise<ApiEvent[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', sanitizeInput(query));
    if (eventType) params.append('type', sanitizeInput(eventType));
    
    return this.request<ApiEvent[]>(`/events/search/?${params}`);
  }

  async getEventTypes(): Promise<{value: string, label: string}[]> {
    return this.request<{value: string, label: string}[]>('/events/event_types/');
  }

  async getBudgetRanges(): Promise<{value: string, label: string}[]> {
    return this.request<{value: string, label: string}[]>('/events/budget_ranges/');
  }

  // Locations API
  async getStates(): Promise<{name: string}[]> {
    const response = await this.request<{states: {name: string}[]}>('/events/states/');
    return response.states;
  }

  async getCities(state: string): Promise<{name: string}[]> {
    const sanitizedState = sanitizeInput(state);
    const response = await this.request<{cities: {name: string}[]}>(`/events/cities/?state=${encodeURIComponent(sanitizedState)}`);
    return response.cities;
  }

  // Traditions API with fallback
  async getTraditionStyles(eventType: string): Promise<ApiTraditionStyle[]> {
    try {
      const sanitizedEventType = sanitizeInput(eventType);
      safeLog(`API: Requesting traditions for event type: ${sanitizedEventType}`);
      const result = await this.request<ApiTraditionStyle[]>(`/events/traditions/by_event_type/?event_type=${encodeURIComponent(sanitizedEventType)}`);
      safeLog('API: Traditions response received');
      return result;
    } catch (error) {
      safeLog('API: Traditions request failed');
      throw new Error('Traditions API endpoint not available');
    }
  }

  // Event System API
  async getEventSections(): Promise<ApiEventSection[]> {
    return this.request<ApiEventSection[]>('/events/sections/');
  }

  async getEventImages(): Promise<ApiEventImage[]> {
    return this.request<ApiEventImage[]>('/events/images/');
  }

  async getEventRequirements(eventId: string): Promise<ApiEventRequirement[]> {
    const sanitizedEventId = sanitizeInput(eventId);
    return this.request<ApiEventRequirement[]>(`/events/requirements/?event_id=${encodeURIComponent(sanitizedEventId)}`);
  }

  async getVendorCategories(): Promise<ApiVendorCategory[]> {
    return this.request<ApiVendorCategory[]>('/events/vendor-categories/');
  }

  // Vendors API (using fallback data)
  async getVendors(): Promise<ApiVendor[]> {
    return [];
  }

  async searchVendors(query?: string, category?: string): Promise<ApiVendor[]> {
    return [];
  }

  async createVendorBooking(booking: Omit<ApiVendorBooking, 'id'>): Promise<ApiVendorBooking> {
    return { id: 1, ...booking };
  }

  // Budget API
  async allocateBudget(eventId: number): Promise<any> {
    return this.request<any>(`/events/${eventId}/allocate-budget/`, {
      method: 'POST',
    });
  }

  async updateBudget(eventId: number, allocations: Record<string, number>): Promise<any> {
    return this.request<any>(`/events/${eventId}/update-budget/`, {
      method: 'PUT',
      body: JSON.stringify({ allocations }),
    });
  }

  async getBudgetSummary(eventId: number): Promise<any> {
    return this.request<any>(`/events/${eventId}/budget-summary/`);
  }

  // Quote Management API
  async sendQuoteRequests(eventId: number): Promise<any> {
    return this.request<any>(`/events/${eventId}/send-quotes/`, {
      method: 'POST',
    });
  }

  async sendQuotes(eventId: number): Promise<any> {
    return this.request<any>(`/events/${eventId}/send-quotes/`, {
      method: 'POST',
    });
  }

  async createQuoteRequest(quoteData: any): Promise<any> {
    return this.request<any>('/quote-requests/', {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });
  }

  async getQuoteRequests(): Promise<any[]> {
    return this.request<any[]>('/quote-requests/');
  }

  async getQuoteDetails(quoteId: number): Promise<any> {
    return this.request<any>(`/quote-requests/${quoteId}/quote-details/`);
  }

  // Quote Tracking API
  async getCustomerQuoteStatus(eventId: number): Promise<any> {
    return this.request<any>(`/events/${eventId}/quote-status/`);
  }

  async getQuoteResponses(eventId: number): Promise<any> {
    return this.request<any>(`/events/${eventId}/quote-responses/`);
  }

  async getVendorPendingQuotes(): Promise<any> {
    return this.request<any>('/events/vendor/pending-quotes/');
  }

  async submitVendorQuote(quoteId: number, quoteData: any): Promise<any> {
    return this.request<any>(`/events/vendor/quotes/${quoteId}/submit/`, {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });
  }

  async getEventQuotes(eventId: number): Promise<any[]> {
    return this.request<any[]>(`/events/${eventId}/quotes/`);
  }

  async acceptQuote(quoteId: number): Promise<any> {
    return this.request<any>(`/events/quotes/${quoteId}/accept/`, {
      method: 'POST',
    });
  }

  // Vendor Quote API
  async getVendorQuoteRequests(): Promise<any[]> {
    return this.request<any[]>('/vendor/quote-requests/');
  }

  async getQuoteRequestDetail(quoteId: number): Promise<any> {
    return this.request<any>(`/vendor/quote-requests/${quoteId}/`);
  }

  async submitQuote(quoteId: number, quoteData: any): Promise<any> {
    return this.request<any>(`/vendor/quotes/${quoteId}/submit/`, {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });
  }

  // Vendor Profile API
  async updateProfile(profileData: any): Promise<any> {
    safeLog('Updating vendor profile');
    
    // Sanitize profile data
    const sanitizedData = {
      ...profileData,
      full_name: sanitizeInput(profileData.full_name),
      business: sanitizeInput(profileData.business),
      location: sanitizeInput(profileData.location)
    };
    
    return this.request<any>('/vendor/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(sanitizedData),
    });
  }
}

// Helper function to convert EventFormData to ApiEvent
export const convertFormDataToApiEvent = (formData: any, eventType: string, subType: string): any => {
  // Convert special requirements to proper format with quantity support
  const convertedSpecialRequirements: Record<string, { selected: boolean; quantity?: number; unit?: string; }> = {};
  
  if (formData.specialRequirements) {
    Object.entries(formData.specialRequirements).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'object' && value !== null) {
        convertedSpecialRequirements[key] = {
          selected: value.selected || true,
          ...(value.quantity !== undefined && { quantity: parseInt(value.quantity) || 0 }),
          ...(value.unit && { unit: value.unit }),
          ...(value.questions && { questions: value.questions }),
          ...(value.answers && { answers: value.answers })
        };
      } else if (typeof value === 'string' && value.trim()) {
        // Handle simple string values as quantity
        const quantity = parseInt(value);
        if (!isNaN(quantity)) {
          convertedSpecialRequirements[key] = {
            selected: true,
            quantity: quantity
          };
        }
      }
    });
  }

  // Map frontend event types to backend valid choices
  const mapEventType = (type: string, subType?: string): string => {
    // Check subType first for more specific mapping
    if (subType) {
      const subTypeLower = subType.toLowerCase();
      if (subTypeLower.includes('birthday') || subTypeLower.includes('birth')) return 'birthday';
      if (subTypeLower.includes('wedding') || subTypeLower.includes('marriage')) return 'wedding';
      if (subTypeLower.includes('anniversary')) return 'other';
      if (subTypeLower.includes('corporate') || subTypeLower.includes('business')) return 'corporate';
    }
    
    const typeMap: Record<string, string> = {
      'social': 'birthday',
      'cultural': 'festival', 
      'religious': 'festival',
      'festival': 'festival',
      'corporate': 'corporate',
      'political': 'other',
      'sports': 'other',
      'educational': 'other',
      'health': 'other',
      'environmental': 'other',
      'virtual': 'other',
      'entertainment': 'other',
      'community': 'other'
    };
    return typeMap[type] || 'other';
  };

  // Ensure services array is never empty - collect all possible services
  let services = [];
  
  // Add selected services
  if (formData.selectedServices && Array.isArray(formData.selectedServices)) {
    services = [...services, ...formData.selectedServices];
  }
  
  // Add vendor services
  if (formData.selectedVendorServices && Array.isArray(formData.selectedVendorServices)) {
    services = [...services, ...formData.selectedVendorServices];
  }
  
  // Add venue types as services if no other services
  if (services.length === 0 && formData.selectedVenueTypes && Array.isArray(formData.selectedVenueTypes)) {
    services = [...formData.selectedVenueTypes];
  }
  
  // CRITICAL: Always ensure services array has at least one item
  if (services.length === 0) {
    services = ['general'];
  }
  
  // Remove duplicates and ensure no empty strings
  services = [...new Set(services.filter(s => s && s.trim()))];
  
  // Final safety check
  if (services.length === 0) {
    services = ['general'];
  }
  
  console.log('Services determination:', {
    selectedServices: formData.selectedServices,
    selectedVendorServices: formData.selectedVendorServices,
    selectedVenueTypes: formData.selectedVenueTypes,
    finalServices: services,
    servicesLength: services.length
  });

  const mappedEventType = mapEventType(eventType, subType);
  
  return {
    event_name: formData.eventName || 'Untitled Event',
    event_type: mappedEventType,
    attendees: formData.attendees || 50,
    total_budget: formData.budget || 10000,
    services: services,
    special_requirements: convertedSpecialRequirements,
    selected_services: formData.selectedServices || [],
    budget_allocation: formData.budgetAllocation?.categories || {},
    allocation_method: formData.budgetAllocation?.method || null,

    form_data: {
      event_type: mappedEventType,
      original_event_type: eventType,
      sub_type: subType,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      dateTime: formData.dateTime,
      duration: formData.duration,
      customDuration: formData.customDuration,
      state: formData.state,
      city: formData.city,
      venueDetails: formData.venueDetails,
      traditionStyle: formData.traditionStyle,
      attendees: formData.attendees,
      budget: formData.budget,
      description: formData.description,
      timeline: formData.timeline || [],
      foodPreferences: formData.foodPreferences || [],
      selectedServices: formData.selectedServices || [],
      selectedVenueTypes: formData.selectedVenueTypes || [],
      selectedVendorServices: formData.selectedVendorServices || [],
      planningType: formData.planningType,
      customRequirements: formData.customRequirements,
      specialInstructions: formData.specialInstructions,
      accessibilityNeeds: formData.accessibilityNeeds,
      eventPriority: formData.eventPriority,
      contactPreference: formData.contactPreference
    },
    // Store venue and vendor selections at root level for easy access
    selectedVenueTypes: formData.selectedVenueTypes || [],
    selectedVendorServices: formData.selectedVendorServices || []
  };
};

// Helper function to convert ApiEvent to EventFormData
export const convertApiEventToFormData = (apiEvent: ApiEvent): any => {
  const formData = {
    eventName: apiEvent.event_name,
    clientName: apiEvent.form_data?.clientName || '',
    clientEmail: apiEvent.form_data?.clientEmail || '',
    clientPhone: apiEvent.form_data?.clientPhone || '',
    dateTime: apiEvent.form_data?.dateTime || '',
    duration: apiEvent.form_data?.duration || '',
    customDuration: apiEvent.form_data?.customDuration || '',
    state: apiEvent.form_data?.state || '',
    city: apiEvent.form_data?.city || '',
    venueDetails: apiEvent.form_data?.venueDetails || '',
    traditionStyle: apiEvent.form_data?.traditionStyle || '',
    attendees: apiEvent.form_data?.attendees || 0,
    budget: apiEvent.form_data?.budget || 0,
    description: apiEvent.form_data?.description || '',
    customRequirements: apiEvent.form_data?.customRequirements || '',
    specialInstructions: apiEvent.form_data?.specialInstructions || '',
    accessibilityNeeds: apiEvent.form_data?.accessibilityNeeds || '',
    eventPriority: apiEvent.form_data?.eventPriority || 'medium',
    contactPreference: apiEvent.form_data?.contactPreference || 'both',
    needsVendor: false,
    selectedVendors: [],
    inspirationImage: null,
    
    specialRequirements: apiEvent.special_requirements || {},
    budgetAllocation: apiEvent.budget_allocation ? {
      categories: apiEvent.budget_allocation,
      method: apiEvent.allocation_method || 'manual',
      totalAllocated: Object.values(apiEvent.budget_allocation).reduce((sum, cat) => sum + cat.amount, 0)
    } : null,
    timeline: apiEvent.form_data?.timeline || [],
    foodPreferences: apiEvent.form_data?.foodPreferences || [],
    selectedServices: apiEvent.form_data?.selectedServices || [],
    selectedVenueTypes: apiEvent.form_data?.selectedVenueTypes || [],
    selectedVendorServices: apiEvent.form_data?.selectedVendorServices || [],
    planningType: apiEvent.form_data?.planningType
  };
  
  return formData;
};

export const apiService = new ApiService();

// Helper function to convert quote form data to API format
export const convertQuoteFormToApiData = (formData: any): any => {
  return {
    event_type: formData.eventType,
    event_name: formData.eventName,
    client_name: formData.clientName,
    client_email: formData.clientEmail,
    client_phone: formData.clientPhone,
    event_date: formData.eventDate,
    location: formData.location,
    guest_count: formData.guestCount,
    budget_range: formData.budget,
    services: [...(formData.selectedVendors || []), ...(formData.selectedVenues || [])],
    description: formData.specialRequirements,
    urgency: formData.urgency,
    // Enhanced fields
    quote_type: formData.quoteType || 'comprehensive',
    expand_vendors: formData.expandVendors || false,
    prefilled_event_id: formData.prefilledEventId,
    selected_vendors: formData.selectedVendors || [],
    selected_venues: formData.selectedVenues || [],
    is_targeted_quote: formData.quoteType === 'targeted'
  };
};