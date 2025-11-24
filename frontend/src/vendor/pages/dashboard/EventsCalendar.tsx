import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useCalendarEvents, useCreateEvent, useDeleteEvent } from "../../../hooks/useCalendarEvents";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from "date-fns";

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-700';
    case 'pending_vendor': return 'bg-yellow-100 text-yellow-700';
    case 'completed': return 'bg-purple-100 text-purple-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const EventsCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const { data: events = [], isLoading, error } = useCalendarEvents(
    monthStart.toISOString(),
    monthEnd.toISOString()
  );

  const deleteEventMutation = useDeleteEvent();

  const calendarDays = useMemo(() => {
    const start = new Date(monthStart);
    start.setDate(start.getDate() - monthStart.getDay());
    
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [monthStart]);

  const eventsByDate = useMemo(() => {
    return events.reduce((acc, event) => {
      const dateKey = new Date(event.date).toDateString();
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [events]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    const dayEvents = eventsByDate[date.toDateString()];
    if (dayEvents && dayEvents.length > 0) {
      setSelectedEvent(dayEvents[0]);
    }
  }, [eventsByDate]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleDeleteEvent = useCallback(async (eventId: number) => {
    try {
      await deleteEventMutation.mutateAsync(eventId);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  }, [deleteEventMutation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-red-600">Failed to load calendar events</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Calendar View</CardTitle>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="text-lg font-semibold min-w-[140px] text-center">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 p-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold text-sm text-gray-600 p-2">
                    {day}
                  </div>
                ))}
                
                {calendarDays.map((date, i) => {
                  const dayEvents = eventsByDate[date.toDateString()] || [];
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isSelected = isSameDay(date, selectedDate);
                  const isDayToday = isToday(date);
                  
                  return (
                    <div
                      key={i}
                      onClick={() => handleDateSelect(date)}
                      className={`min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all ${
                        isDayToday ? '!bg-blue-500 !text-white !border-blue-600 shadow-lg font-bold ring-2 ring-blue-300' : 
                        isSelected ? 'border-blue-500 bg-blue-100' : 
                        dayEvents.length > 0 ? 'bg-green-50 border-green-200' : 'bg-white'
                      } ${
                        !isCurrentMonth ? 'opacity-50' : ''
                      } hover:shadow-md`}
                    >
                      <div className="text-sm font-bold mb-1">
                        {date.getDate()}
                      </div>
                      {dayEvents.slice(0, 2).map((event, idx) => (
                        <div
                          key={idx}
                          className="text-xs p-1 mb-1 truncate font-bold text-gray-700 bg-white/80 rounded"
                          title={`${event.title} - ${event.booking?.customer_name || ''}`}
                        >
                          {event.title.length > 10 ? event.title.substring(0, 10) + '...' : event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 font-bold">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No upcoming events
                  </div>
                ) : (
                  upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium">{event.title}</p>
                        <Badge variant="secondary" className="bg-primary text-primary-foreground">
                          {format(new Date(event.date), 'MMM dd')}
                        </Badge>
                      </div>
                      {event.booking && (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">{event.booking.customer_name}</p>
                            <Badge className={getStatusColor(event.booking.status)}>
                              {event.booking.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm font-semibold text-primary">₹{event.booking.amount}</p>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="text-lg font-semibold">{selectedEvent.title}</p>
              </div>
              {selectedEvent.booking && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="text-lg font-semibold">{selectedEvent.booking.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(selectedEvent.booking.status)}>
                      {selectedEvent.booking.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-2xl font-bold text-primary">₹{selectedEvent.booking.amount}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="text-lg font-semibold">
                  {format(new Date(selectedEvent.date), 'EEEE, MMMM dd, yyyy')}
                </p>
              </div>
              {selectedEvent.location && (
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-lg font-semibold">{selectedEvent.location}</p>
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedEvent.description}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  disabled={deleteEventMutation.isPending}
                >
                  {deleteEventMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsCalendar;