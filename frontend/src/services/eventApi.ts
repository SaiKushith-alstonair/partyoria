import { useQuery } from '@tanstack/react-query';

const API_BASE = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

interface EventSection {
  id: string;
  name: string;
  icon: string;
  subsections: EventSubsection[];
}

interface EventSubsection {
  id: string;
  name: string;
  vendors: Vendor[];
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  selected: boolean;
}

// Cache for 5 minutes
const CACHE_TIME = 5 * 60 * 1000;

export const useEventSections = (page = 1, limit = 12) => {
  return useQuery({
    queryKey: ['eventSections', page, limit],
    queryFn: async (): Promise<{ data: EventSection[], total: number }> => {
      const response = await fetch(`${API_BASE}/events/sections/?page=${page}&limit=${limit}`);
      if (!response.ok) {
        // Fallback to local data if API fails
        const { eventSections } = await import('../data/eventSections');
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
          data: eventSections.slice(start, end),
          total: eventSections.length
        };
      }
      return response.json();
    },
    staleTime: CACHE_TIME,
    cacheTime: CACHE_TIME,
  });
};

export const useEventSection = (sectionId: string) => {
  return useQuery({
    queryKey: ['eventSection', sectionId],
    queryFn: async (): Promise<EventSection> => {
      const response = await fetch(`${API_BASE}/events/sections/${sectionId}/`);
      if (!response.ok) {
        // Fallback to local data
        const { eventSections } = await import('../data/eventSections');
        const section = eventSections.find(s => s.id === sectionId);
        if (!section) throw new Error('Section not found');
        return section;
      }
      return response.json();
    },
    staleTime: CACHE_TIME,
    cacheTime: CACHE_TIME,
    enabled: !!sectionId,
  });
};