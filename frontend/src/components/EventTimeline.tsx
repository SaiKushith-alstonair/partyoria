import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Circle, Users, MapPin, Settings, Eye, Edit, Trash2, Filter, Search, AlertTriangle, TrendingUp, Target, IndianRupee } from 'lucide-react';
import { apiService, ApiEvent } from '../services/api';
import { eventStorage, StoredEvent } from '../utils/localStorage';
import { useNavigate } from 'react-router-dom';

interface TimelineEvent {
  id: string;
  eventName: string;
  clientName: string;
  dateTime: string;
  status: 'planning' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  attendees: number;
  budget: number;
  venue: string;
  progress: number;
  milestones: {
    id: string;
    title: string;
    completed: boolean;
    date?: string;
    description?: string;
    category?: string;
    priority?: string;
    dueDate?: string;
  }[];
  isApiEvent?: boolean;
}

const EventTimeline: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'progress' | 'name'>('date');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const [localEvents, apiEvents] = await Promise.all([
        eventStorage.getAllEvents(),
        apiService.getEvents()
      ]);

      const timelineEvents: TimelineEvent[] = [
        ...localEvents.map(event => convertToTimelineEvent(event, false)),
        ...apiEvents.map(event => convertToTimelineEvent(event, true))
      ];

      setEvents(timelineEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      const localEvents = eventStorage.getAllEvents();
      setEvents(localEvents.map(event => convertToTimelineEvent(event, false)));
    } finally {
      setLoading(false);
    }
  };

  const convertToTimelineEvent = (event: StoredEvent | ApiEvent, isApiEvent: boolean): TimelineEvent => {
    const eventData = isApiEvent ? (event as ApiEvent) : (event as StoredEvent);
    const formData = isApiEvent ? (event as ApiEvent).form_data : eventData;
    
    // Calculate progress based on completed milestones
    const milestones = generateMilestones(eventData, isApiEvent);
    const completedMilestones = milestones.filter(m => m.completed).length;
    const progress = Math.round((completedMilestones / milestones.length) * 100);
    
    // Determine status based on progress and date
    let status: TimelineEvent['status'] = 'planning';
    const eventDate = new Date(formData?.dateTime || '');
    const now = new Date();
    
    if (progress === 100) {
      status = 'completed';
    } else if (eventDate < now && progress > 0) {
      status = 'in-progress';
    } else if (progress > 50) {
      status = 'confirmed';
    }

    return {
      id: isApiEvent ? (event as ApiEvent).id!.toString() : (event as StoredEvent).id,
      eventName: isApiEvent ? (event as ApiEvent).event_name : (event as StoredEvent).eventName,
      clientName: formData?.clientName || 'Unknown Client',
      dateTime: formData?.dateTime || '',
      status,
      attendees: formData?.attendees || 0,
      budget: formData?.budget || 0,
      venue: `${formData?.city || ''}, ${formData?.state || ''}`.replace(', ', ''),
      progress,
      milestones,
      isApiEvent
    };
  };

  const [milestoneData, setMilestoneData] = useState<Record<string, any>>({});

  const generateMilestones = (event: any, isApiEvent: boolean) => {
    const formData = isApiEvent ? event.form_data : event;
    const specialRequirements = isApiEvent ? event.special_requirements : event.specialRequirements;
    const selectedServices = isApiEvent ? event.selected_services : event.selectedVendors;
    const eventDate = new Date(formData?.dateTime || '');
    const now = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Get event type for specific milestones
    const eventType = formData?.event_type || 'general';
    const eventName = (formData?.eventName || event.event_name || '').toLowerCase();
    
    const baseMilestones = [
      {
        id: 'basic-info',
        title: 'Event Planning Started',
        completed: !!(formData?.eventName || event.event_name),
        date: event.created_at || event.createdAt,
        description: 'Event details and requirements gathered',
        category: 'planning',
        priority: 'high'
      },
      {
        id: 'venue-booking',
        title: 'Venue Confirmed',
        completed: !!(formData?.city && formData?.state && formData?.venueDetails),
        description: `Venue booked in ${formData?.city || 'selected location'}`,
        category: 'venue',
        priority: 'high',
        dueDate: daysUntilEvent > 30 ? 'On track' : daysUntilEvent > 0 ? 'Urgent' : 'Overdue'
      },
      {
        id: 'guest-planning',
        title: 'Guest List Finalized',
        completed: !!(formData?.attendees && formData.attendees > 0),
        description: `Planning for ${formData?.attendees || 0} guests`,
        category: 'guests',
        priority: 'medium'
      },
      {
        id: 'catering-booking',
        title: 'Catering Arranged',
        completed: !!(selectedServices && selectedServices.some((s: string) => 
          s.toLowerCase().includes('catering') || s.toLowerCase().includes('food')
        )),
        description: 'Menu planning and catering services',
        category: 'catering',
        priority: 'high',
        dueDate: daysUntilEvent > 14 ? 'On track' : daysUntilEvent > 0 ? 'Urgent' : 'Overdue'
      },
      {
        id: 'decoration-planning',
        title: 'Decoration & Theme',
        completed: !!(formData?.traditionStyle || (selectedServices && selectedServices.some((s: string) => 
          s.toLowerCase().includes('decoration') || s.toLowerCase().includes('flowers')
        ))),
        description: `${formData?.traditionStyle || 'Custom'} theme selected`,
        category: 'decoration',
        priority: 'medium'
      },
      {
        id: 'photography-booking',
        title: 'Photography/Videography',
        completed: !!(selectedServices && selectedServices.some((s: string) => 
          s.toLowerCase().includes('photo') || s.toLowerCase().includes('video')
        )),
        description: 'Professional photography services',
        category: 'media',
        priority: 'medium'
      },
      {
        id: 'vendor-coordination',
        title: 'Vendor Coordination',
        completed: !!(selectedServices && selectedServices.length >= 3),
        description: `${selectedServices?.length || 0} vendors coordinated`,
        category: 'vendors',
        priority: 'high'
      },
      {
        id: 'final-preparations',
        title: 'Final Preparations',
        completed: daysUntilEvent <= 3 && !!(formData?.dateTime),
        description: 'Last-minute arrangements and confirmations',
        category: 'execution',
        priority: 'critical',
        dueDate: daysUntilEvent <= 7 ? 'Final week' : 'Upcoming'
      }
    ];
    
    // Add event-specific milestones
    if (eventName.includes('wedding')) {
      baseMilestones.splice(4, 0, {
        id: 'wedding-specific',
        title: 'Wedding Preparations',
        completed: !!(formData?.traditionStyle && selectedServices?.length >= 2),
        description: 'Bridal preparations and ceremony arrangements',
        category: 'special',
        priority: 'high'
      });
    }
    
    if (eventName.includes('corporate') || eventName.includes('conference')) {
      baseMilestones.splice(4, 0, {
        id: 'corporate-specific',
        title: 'AV & Technical Setup',
        completed: !!(selectedServices && selectedServices.some((s: string) => 
          s.toLowerCase().includes('av') || s.toLowerCase().includes('technical')
        )),
        description: 'Audio-visual and technical arrangements',
        category: 'technical',
        priority: 'high'
      });
    }
    
    // Load saved milestone data
    const eventId = isApiEvent ? event.id?.toString() : event.id;
    const savedMilestones = milestoneData[eventId] || {};
    
    // Update milestones with saved completion status
    return baseMilestones.map(milestone => ({
      ...milestone,
      completed: savedMilestones[milestone.id]?.completed || milestone.completed,
      completedAt: savedMilestones[milestone.id]?.completedAt,
      completedBy: savedMilestones[milestone.id]?.completedBy
    }));
  };
  
  const updateMilestoneStatus = async (eventId: string, milestoneId: string, completed: boolean) => {
    try {
      const updatedMilestones = {
        ...milestoneData[eventId],
        [milestoneId]: {
          completed,
          completedAt: completed ? new Date().toISOString() : null,
          completedBy: 'User' // In real app, get from auth
        }
      };
      
      // Update local state
      setMilestoneData(prev => ({
        ...prev,
        [eventId]: updatedMilestones
      }));
      
      // Save to backend
      await fetch(`http://localhost:8000/api/events/milestones/${eventId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          milestones: updatedMilestones
        })
      });
      
      // Reload events to update progress
      loadEvents();
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };
  
  const loadMilestoneData = async () => {
    try {
      const eventIds = events.map(e => e.id);
      const milestonePromises = eventIds.map(async (eventId) => {
        try {
          const response = await fetch(`http://localhost:8000/api/events/milestones/${eventId}/`);
          const data = await response.json();
          return { eventId, milestones: data.milestones || {} };
        } catch {
          return { eventId, milestones: {} };
        }
      });
      
      const results = await Promise.all(milestonePromises);
      const milestoneMap: Record<string, any> = {};
      results.forEach(({ eventId, milestones }) => {
        milestoneMap[eventId] = milestones;
      });
      
      setMilestoneData(milestoneMap);
    } catch (error) {
      console.error('Error loading milestone data:', error);
    }
  };
  
  useEffect(() => {
    if (events.length > 0) {
      loadMilestoneData();
    }
  }, [events.length]);

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'planning': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in-progress': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (progress >= 70) return 'bg-gradient-to-r from-blue-400 to-blue-500';
    if (progress >= 50) return 'bg-gradient-to-r from-purple-400 to-purple-500';
    if (progress >= 30) return 'bg-gradient-to-r from-orange-400 to-orange-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };
  
  const formatBudget = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount.toLocaleString()}`;
  };
  
  const getBudgetUtilization = (event: TimelineEvent) => {
    const completedMilestones = event.milestones.filter(m => m.completed).length;
    const totalMilestones = event.milestones.length;
    const expectedUtilization = (completedMilestones / totalMilestones) * 100;
    return Math.min(expectedUtilization * 0.8, 85); // Realistic utilization
  };
  
  const getCostPerGuest = (budget: number, attendees: number) => {
    if (!attendees || attendees === 0) return 0;
    return Math.round(budget / attendees);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.dateTime || 0).getTime() - new Date(a.dateTime || 0).getTime();
      case 'progress':
        return b.progress - a.progress;
      case 'name':
        return a.eventName.localeCompare(b.eventName);
      default:
        return 0;
    }
  });

  const handleEdit = (event: TimelineEvent) => {
    if (event.isApiEvent) {
      navigate(`/event-creation?edit=${event.id}`);
    } else {
      // Handle local event editing
      navigate(`/event-creation?edit=${event.id}`);
    }
  };

  const handleDelete = async (event: TimelineEvent) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        if (event.isApiEvent) {
          await apiService.deleteEvent(parseInt(event.id));
        } else {
          eventStorage.deleteEvent(event.id);
        }
        loadEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading timeline...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">🎯 Event Timeline</h1>
            <p className="text-purple-100">Track the progress of all your events in one place</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{filteredEvents.length}</div>
                <div className="text-xs text-purple-100">Events</div>
              </div>
              <div>
                <div className="text-lg font-bold">{formatBudget(filteredEvents.reduce((sum, event) => sum + event.budget, 0))}</div>
                <div className="text-xs text-purple-100">Total Budget</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(filteredEvents.reduce((sum, event) => sum + event.progress, 0) / filteredEvents.length || 0)}%</div>
                <div className="text-xs text-purple-100">Avg Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
            <input
              type="text"
              placeholder="🔍 Search events or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all bg-purple-50/30"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-xl">
              <Filter size={16} className="text-purple-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-purple-700 font-medium"
              >
                <option value="all">All Status</option>
                <option value="planning">📋 Planning</option>
                <option value="confirmed">✅ Confirmed</option>
                <option value="in-progress">⚡ In Progress</option>
                <option value="completed">🎉 Completed</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'progress' | 'name')}
              className="px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 font-medium text-gray-700"
            >
              <option value="date">📅 Sort by Date</option>
              <option value="progress">📊 Sort by Progress</option>
              <option value="name">🔤 Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Create your first event to see it here'}
            </p>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div key={event.id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-purple-200 group">
              <div className="p-6">
                {/* Event Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{event.eventName}</h3>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full border-2 ${getStatusColor(event.status)} shadow-sm`}>
                        {event.status === 'planning' && '📋'}
                        {event.status === 'confirmed' && '✅'}
                        {event.status === 'in-progress' && '⚡'}
                        {event.status === 'completed' && '🎉'}
                        {event.status === 'cancelled' && '❌'}
                        {' '}{event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                        <Users size={16} className="text-purple-500" />
                        <span className="font-medium text-purple-700">{event.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                        <Calendar size={16} className="text-blue-500" />
                        <span className="font-medium text-blue-700">{event.dateTime ? new Date(event.dateTime).toLocaleDateString() : 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                        <MapPin size={16} className="text-green-500" />
                        <span className="font-medium text-green-700">{event.venue || 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                        <span className="text-orange-500 font-bold">₹</span>
                        <span className="font-bold text-orange-700">{formatBudget(event.budget).replace('₹', '')}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-pink-50 px-3 py-2 rounded-lg">
                        <Target size={16} className="text-pink-500" />
                        <span className="font-medium text-pink-700">{formatBudget(getCostPerGuest(event.budget, event.attendees)).replace('₹', '')}₹/guest</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                      className="p-3 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:scale-110"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-3 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                      title="Edit Event"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(event)}
                      className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                      title="Delete Event"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar with Budget Info */}
                <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-purple-700">📊 Planning Progress</span>
                      {event.progress < 50 && new Date(event.dateTime) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                        <AlertTriangle size={16} className="text-orange-500 animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-purple-700">{event.progress}%</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                        💰 {getBudgetUtilization(event).toFixed(0)}% allocated
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-white rounded-full h-4 relative shadow-inner border border-purple-100">
                    <div 
                      className={`h-4 rounded-full transition-all duration-500 shadow-sm ${getProgressColor(event.progress)}`}
                      style={{ width: `${event.progress}%` }}
                    ></div>
                    <div 
                      className="absolute top-0 h-4 bg-blue-400 opacity-30 rounded-full"
                      style={{ width: `${getBudgetUtilization(event)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-purple-600 mt-2">
                    <span>🚀 Planning</span>
                    <span>💸 Budget Allocation</span>
                    <span>✨ Ready</span>
                  </div>
                </div>

                {/* Enhanced Milestones Preview */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Key Milestones</span>
                    <span className="text-xs text-gray-500">
                      {event.milestones.filter(m => m.completed).length}/{event.milestones.length} completed
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {event.milestones.slice(0, 6).map((milestone, idx) => (
                      <div key={milestone.id} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full transition-all ${
                          milestone.completed 
                            ? 'bg-green-500' 
                            : (milestone as any).priority === 'critical' 
                              ? 'bg-red-200 border-2 border-red-400'
                              : (milestone as any).priority === 'high'
                                ? 'bg-orange-200 border-2 border-orange-400'
                                : 'bg-gray-200'
                        }`}></div>
                        {idx < 5 && <div className="w-4 h-0.5 bg-gray-200 mx-0.5"></div>}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {event.milestones.filter(m => !(m as any).completed && (m as any).priority === 'high').slice(0, 2).map(milestone => (
                      <span key={milestone.id} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        {milestone.title}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Enhanced Detailed Milestones */}
                {selectedEvent?.id === event.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Detailed Timeline</h4>
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-blue-500" />
                        <span className="text-xs text-blue-600">Budget: {formatBudget(event.budget)}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {event.milestones.map((milestone, idx) => {
                        const extendedMilestone = milestone as any;
                        return (
                          <div key={milestone.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                            milestone.completed ? 'bg-green-50 border border-green-200' : 
                            extendedMilestone.priority === 'critical' ? 'bg-red-50 border border-red-200' :
                            extendedMilestone.priority === 'high' ? 'bg-orange-50 border border-orange-200' :
                            'bg-gray-50 border border-gray-200'
                          }`}>
                            <div className="flex-shrink-0 mt-1">
                              {milestone.completed ? (
                                <CheckCircle size={20} className="text-green-500" />
                              ) : extendedMilestone.priority === 'critical' ? (
                                <AlertTriangle size={20} className="text-red-500" />
                              ) : (
                                <Circle size={20} className="text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h5 className={`text-sm font-medium ${
                                  milestone.completed ? 'text-green-800' : 
                                  extendedMilestone.priority === 'critical' ? 'text-red-800' :
                                  extendedMilestone.priority === 'high' ? 'text-orange-800' :
                                  'text-gray-700'
                                }`}>
                                  {milestone.title}
                                </h5>
                                <button
                                  onClick={() => updateMilestoneStatus(event.id, milestone.id, !milestone.completed)}
                                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-sm ${
                                    milestone.completed
                                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600'
                                      : 'bg-gradient-to-r from-purple-400 to-purple-500 text-white hover:from-purple-500 hover:to-purple-600'
                                  }`}
                                >
                                  {milestone.completed ? '✅ Completed' : '⏳ Mark Complete'}
                                </button>
                                <div className="flex items-center gap-2">
                                  {extendedMilestone.dueDate && (
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      extendedMilestone.dueDate === 'Overdue' ? 'bg-red-100 text-red-700' :
                                      extendedMilestone.dueDate === 'Urgent' ? 'bg-orange-100 text-orange-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {extendedMilestone.dueDate}
                                    </span>
                                  )}
                                  {milestone.date && (
                                    <span className="text-xs text-gray-500">
                                      {new Date(milestone.date).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{milestone.description}</p>
                              {(milestone as any).completedAt && (
                                <p className="text-xs text-green-600 mb-2">
                                  Completed on {new Date((milestone as any).completedAt).toLocaleDateString()}
                                </p>
                              )}
                              {extendedMilestone.category && (
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    extendedMilestone.category === 'venue' ? 'bg-purple-100 text-purple-700' :
                                    extendedMilestone.category === 'catering' ? 'bg-green-100 text-green-700' :
                                    extendedMilestone.category === 'decoration' ? 'bg-pink-100 text-pink-700' :
                                    extendedMilestone.category === 'media' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {extendedMilestone.category}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    extendedMilestone.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                    extendedMilestone.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                    extendedMilestone.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {extendedMilestone.priority} priority
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Budget Breakdown */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="text-sm font-medium text-blue-900 mb-3">Budget Overview</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700 font-medium">Total Budget</span>
                          <p className="text-blue-900 font-semibold">{formatBudget(event.budget)}</p>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Per Guest</span>
                          <p className="text-blue-900 font-semibold">{formatBudget(getCostPerGuest(event.budget, event.attendees))}</p>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Allocated</span>
                          <p className="text-blue-900 font-semibold">{getBudgetUtilization(event).toFixed(0)}%</p>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Remaining</span>
                          <p className="text-blue-900 font-semibold">{formatBudget(event.budget * (1 - getBudgetUtilization(event) / 100))}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventTimeline;