export interface EventSection {
  id: string;
  name: string;
  icon: string;
  subsections: EventSubsection[];
}

export interface EventSubsection {
  id: string;
  name: string;
  vendors: Vendor[];
  description?: string;
  typeTheme?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  selected: boolean;
}

export interface TimelineEvent {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
}

export interface EventFormData {
  eventName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  dateTime: string;
  duration?: string;
  customDuration?: string;
  state: string;
  city: string;
  venueDetails: string;
  traditionStyle: string;
  attendees: number;
  budget: number;
  description: string;
  selectedVendors: string[];
  customRequirements: string;
  specialInstructions: string;
  accessibilityNeeds: string;
  needsVendor: boolean;
  eventPriority?: 'low' | 'medium' | 'high';
  contactPreference?: 'email' | 'phone' | 'both';
  
  // Event Images
  inspirationImage?: File | null;
  
  // Timeline/Schedule (Dynamic)
  timeline: TimelineEvent[];
  
  // Food Preferences
  foodPreferences: string[];
  
  // Special Requirements (Dynamic per event type with quantities)
  specialRequirements: Record<string, any>;
  
  // Venue and Vendor Selection for Skip Flow
  selectedVenueTypes?: string[];
  selectedVendorServices?: string[];
  selectedServices?: string[];
  
  // Planning Type Tracking
  planningType?: 'detailed' | 'skip';
}

export interface NavigationState {
  selectedSection: string | null;
  selectedSubsection: string | null;
  currentPage: 'selection' | 'event-creation' | 'event-list';
}

export interface FestivalSubtype {
  id: string;
  name: string;
  additionalVendors?: Vendor[];
}

export interface ValidationErrors {
  [key: string]: string | undefined;
  eventName?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  dateTime?: string;
  duration?: string;
  venue?: string;
  attendees?: string;
  budget?: string;
  description?: string;
  selectedVendors?: string;
  customRequirements?: string;
  specialInstructions?: string;
  accessibilityNeeds?: string;
}

export interface Event {
  id?: number;
  event_name: string;
  event_type?: 'corporate' | 'wedding' | 'birthday' | 'festival' | 'other';
  attendees?: number;
  venue_type?: 'indoor' | 'outdoor' | 'hybrid';
  duration?: number;
  total_budget?: number;
  services?: string[];
  form_data: Record<string, any>;
  special_requirements?: Record<string, any>;
  selected_services?: string[];
  budget_allocations?: BudgetAllocation[];
  created_at?: string;
  updated_at?: string;
}

export interface BudgetAllocation {
  id?: number;
  category: 'catering' | 'venue' | 'decorations' | 'photography' | 'entertainment' | 'other_services' | 'audio_visual' | 'lighting';
  percentage: number;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetSummary {
  event: {
    id: number;
    name: string;
    type: string;
    attendees: number;
    venue_type: string;
    duration: number;
    total_budget: string;
  };
  allocations: BudgetAllocation[];
  summary: {
    total_allocated: string;
    remaining_budget: string;
    efficiency_score: number;
    allocation_count: number;
  };
  has_allocation: boolean;
}

export interface BudgetAllocationRequest {
  allocations: Record<string, number>;
}

export const BUDGET_CATEGORIES = {
  catering: 'Catering',
  venue: 'Venue', 
  decorations: 'Decorations',
  photography: 'Photography',
  entertainment: 'Entertainment',
  other_services: 'Other Services',
  audio_visual: 'Audio Visual Equipment',
  lighting: 'Lighting Setup'
} as const;

export const EVENT_TYPES = {
  corporate: 'Corporate',
  wedding: 'Wedding',
  birthday: 'Birthday',
  festival: 'Festival',
  other: 'Other'
} as const;

export const VENUE_TYPES = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  hybrid: 'Hybrid'
} as const;

