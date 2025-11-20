import { EventFormData } from '../types';

// Use environment-based keys to prevent hardcoded credentials
const STORAGE_KEY = import.meta.env?.VITE_STORAGE_KEY || 'app_events';
const DRAFT_KEY = import.meta.env?.VITE_DRAFT_KEY || 'app_draft';

// Data validation helper
const validateEventData = (data: any): data is EventFormData => {
  return data && typeof data === 'object' && !Array.isArray(data);
};

// Secure storage wrapper with error handling
const secureStorage = {
  setItem: (key: string, value: string): boolean => {
    try {
      if (!key || !value) return false;
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },
  
  getItem: (key: string): string | null => {
    try {
      if (!key) return null;
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage retrieval error:', error);
      return null;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      if (!key) return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage removal error:', error);
      return false;
    }
  }
};

export interface StoredEvent extends EventFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'completed';
}

export const eventStorage = {
  // Save event (draft or completed)
  saveEvent: (eventData: EventFormData, status: 'draft' | 'completed' = 'draft'): string => {
    const events = eventStorage.getAllEvents();
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    const storedEvent: StoredEvent = {
      ...eventData,
      id,
      createdAt: now,
      updatedAt: now,
      status
    };
    
    events.push(storedEvent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return id;
  },

  // Update existing event
  updateEvent: (id: string, eventData: EventFormData, status?: 'draft' | 'completed'): boolean => {
    try {
      if (!id || !validateEventData(eventData)) {
        console.error('Invalid parameters for event update');
        return false;
      }
      
      const events = eventStorage.getAllEvents();
      const index = events.findIndex(e => e.id === id);
      
      if (index !== -1) {
        events[index] = {
          ...events[index],
          ...eventData,
          updatedAt: new Date().toISOString(),
          ...(status && { status })
        };
        return secureStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      }
      return false;
    } catch (error) {
      console.error('Failed to update event:', error);
      return false;
    }
  },

  // Get all events
  getAllEvents: (): StoredEvent[] => {
    try {
      const stored = secureStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to retrieve events:', error);
      return [];
    }
  },

  // Get event by ID
  getEvent: (id: string): StoredEvent | null => {
    const events = eventStorage.getAllEvents();
    return events.find(e => e.id === id) || null;
  },

  // Delete event
  deleteEvent: (id: string): boolean => {
    try {
      if (!id) return false;
      
      const events = eventStorage.getAllEvents();
      const filtered = events.filter(e => e.id !== id);
      return secureStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete event:', error);
      return false;
    }
  },

  // Save current draft
  saveDraft: (eventData: EventFormData): boolean => {
    try {
      if (!validateEventData(eventData)) {
        console.error('Invalid draft data provided');
        return false;
      }
      
      return secureStorage.setItem(DRAFT_KEY, JSON.stringify({
        ...eventData,
        savedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save draft:', error);
      return false;
    }
  },

  // Get current draft
  getDraft: (): (EventFormData & { savedAt: string }) | null => {
    try {
      const stored = secureStorage.getItem(DRAFT_KEY);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      return validateEventData(parsed) ? parsed : null;
    } catch (error) {
      console.error('Failed to retrieve draft:', error);
      return null;
    }
  },

  // Clear draft
  clearDraft: (): boolean => {
    return secureStorage.removeItem(DRAFT_KEY);
  }
};