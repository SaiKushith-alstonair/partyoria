import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  description: string;
  location: string;
  booking?: {
    customer_name: string;
    amount: string;
    status: string;
    service_type: string;
  };
}

interface CreateEventData {
  title: string;
  event_date: string;
  description?: string;
  location?: string;
  booking_id?: number;
}

export const useCalendarEvents = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['calendar-events', startDate, endDate],
    queryFn: async (): Promise<CalendarEvent[]> => {
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);
      
      const response = await api.get(`/vendor/calendar/events/?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateEventData): Promise<CalendarEvent> => {
      const response = await api.post('/vendor/calendar/events/create/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateEventData> }): Promise<CalendarEvent> => {
      const response = await api.put(`/vendor/calendar/events/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/vendor/calendar/events/${id}/delete/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
};

export const useVendorAvailability = (date: string) => {
  return useQuery({
    queryKey: ['vendor-availability', date],
    queryFn: async () => {
      const response = await api.get(`/vendor/calendar/availability/?date=${date}`);
      return response.data;
    },
    enabled: !!date,
  });
};