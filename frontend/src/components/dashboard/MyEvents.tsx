import React from 'react';
import { Calendar, Edit, Trash2, Clock, Eye, Search, Filter, ChevronDown, Heart, Users, MapPin, ArrowLeft, IndianRupee } from 'lucide-react';
import { eventStorage, StoredEvent } from '../../utils/localStorage';
import { apiService, ApiEvent } from '../../services/api';
import EventDetailsModal from '../EventDetailsModal';
import { useNavigate } from 'react-router-dom';

export default function MyEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = React.useState<StoredEvent[]>([]);
  const [apiEvents, setApiEvents] = React.useState<ApiEvent[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [priceFilter, setPriceFilter] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState('');
  const [guestFilter, setGuestFilter] = React.useState('');
  const [sortBy, setSortBy] = React.useState('date');
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

  const loadEvents = async () => {
    setLoading(true);
    try {
      const backendEvents = await apiService.getEvents();
      setApiEvents(backendEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setApiEvents([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadEvents();
    
    // Listen for event creation to refresh the list
    const handleEventCreated = () => {
      loadEvents();
    };
    
    window.addEventListener('eventCreated', handleEventCreated);
    
    return () => {
      window.removeEventListener('eventCreated', handleEventCreated);
    };
  }, []);

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await apiService.deleteEvent(parseInt(eventId));
        await loadEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        await loadEvents();
      }
    }
  };

  const onEditEvent = (eventId: string, sectionId: string, subsectionId: string) => {
    navigate(`/event-creation?edit=${eventId}&section=${sectionId}&subsection=${subsectionId}`);
  };

  const allEvents = apiEvents.map(e => ({
    id: e.id!.toString(),
    eventName: e.event_name,
    clientName: e.form_data?.clientName || '',
    clientEmail: e.form_data?.clientEmail || '',
    clientPhone: e.form_data?.clientPhone || '',
    dateTime: e.form_data?.dateTime || '',
    state: e.form_data?.state || '',
    city: e.form_data?.city || '',
    venueDetails: e.form_data?.venueDetails || '',
    traditionStyle: e.form_data?.traditionStyle || '',
    venue: `${e.form_data?.city || ''}, ${e.form_data?.state || ''}`.replace(', ', ''),
    attendees: e.form_data?.attendees || 0,
    budget: e.form_data?.budget || 0,
    description: e.form_data?.description || '',
    selectedVendors: [],
    customRequirements: e.form_data?.customRequirements || '',
    specialInstructions: e.form_data?.specialInstructions || '',
    accessibilityNeeds: e.form_data?.accessibilityNeeds || '',
    needsVendor: false,
    eventPriority: e.form_data?.eventPriority || 'medium',
    contactPreference: e.form_data?.contactPreference || 'both',
    timeline: e.form_data?.timeline || [],
    foodPreferences: e.form_data?.foodPreferences || [],
    specialRequirements: e.special_requirements || {},
    status: 'completed' as const,
    createdAt: e.created_at || new Date().toISOString(),
    updatedAt: e.updated_at || new Date().toISOString(),
    isApiEvent: true
  }));

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      return newFavorites;
    });
  };

  const filteredAndSortedEvents = React.useMemo(() => {
    let filtered = allEvents.filter(event => {
      const matchesSearch = event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPrice = !priceFilter || (
        priceFilter === 'low' && event.budget < 50000 ||
        priceFilter === 'medium' && event.budget >= 50000 && event.budget < 200000 ||
        priceFilter === 'high' && event.budget >= 200000
      );
      
      const matchesGuests = !guestFilter || (
        guestFilter === 'small' && event.attendees < 50 ||
        guestFilter === 'medium' && event.attendees >= 50 && event.attendees < 200 ||
        guestFilter === 'large' && event.attendees >= 200
      );
      
      return matchesSearch && matchesPrice && matchesGuests;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.dateTime || 0).getTime() - new Date(a.dateTime || 0).getTime();
        case 'name':
          return a.eventName.localeCompare(b.eventName);
        case 'budget':
          return b.budget - a.budget;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allEvents, searchQuery, priceFilter, dateFilter, guestFilter, sortBy]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading events...</p>
      </div>
    );
  }

  // Always show the interface, even if no events

  return (
    <>
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="text-sm text-gray-600">{filteredAndSortedEvents.length} events</div>
          <div className="text-xs text-gray-500">
            Total Budget: ₹{filteredAndSortedEvents.reduce((sum, event) => sum + (event.budget || 0), 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search events or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Budgets</option>
            <option value="low">Under ₹50K</option>
            <option value="medium">₹50K - ₹2L</option>
            <option value="high">Above ₹2L</option>
          </select>

          <select
            value={guestFilter}
            onChange={(e) => setGuestFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Guest Counts</option>
            <option value="small">Under 50</option>
            <option value="medium">50 - 200</option>
            <option value="large">200+</option>
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="budget">Budget</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedEvents.map((event, index) => {
          const eventType = event.eventName.toLowerCase().includes('wedding') ? 'social' :
                          event.eventName.toLowerCase().includes('conference') ? 'corporate' :
                          event.eventName.toLowerCase().includes('festival') ? 'festival' :
                          event.eventName.toLowerCase().includes('sports') ? 'sports' :
                          event.eventName.toLowerCase().includes('cultural') ? 'cultural' :
                          'corporate';
          
          return (
            <div 
              key={event.id}
              className={`bg-white backdrop-blur-sm rounded-xl border border-gray-200/40 hover:border-purple-300/60 shadow-sm hover:shadow-md transition-all duration-300 group transform hover:scale-105 relative overflow-hidden`}
            >
              <div className="h-24 bg-gray-100 relative overflow-hidden rounded-t-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-lg opacity-60">
                    {eventType === 'social' ? '💍' : 
                     eventType === 'corporate' ? '💼' :
                     eventType === 'festival' ? '🎊' :
                     eventType === 'sports' ? '⚽' :
                     eventType === 'cultural' ? '🎭' : '📅'}
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(event.id);
                  }}
                  className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                >
                  <Heart 
                    size={10} 
                    className={favorites.has(event.id) ? 'text-red-500 fill-current' : 'text-gray-400'}
                  />
                </button>

                <div className="absolute top-1 left-1">
                  <span className={`px-1 py-0.5 text-xs rounded-full font-medium ${
                    event.status === 'completed' 
                      ? 'bg-emerald-100/90 text-emerald-700' 
                      : 'bg-amber-100/90 text-amber-700'
                  }`}>
                    {event.status === 'completed' ? '✓' : '•'}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-orange-700 transition-colors line-clamp-2">
                    {event.eventName}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-purple-600">
                      ₹{(event.budget || 0) > 100000 ? `${((event.budget || 0) / 100000).toFixed(1)}L` : (event.budget || 0).toLocaleString()}
                    </p>
                    {(() => {
                      const apiEvent = apiEvents.find(e => e.id?.toString() === event.id);
                      const subType = apiEvent?.form_data?.sub_type || 'Conference';
                      return (
                        <span className="px-2 py-1 text-sm bg-purple-100/80 text-purple-700 rounded-md font-medium">
                          {subType}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="bg-white/60 rounded-md p-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Client:</span>
                    <span className="text-sm text-gray-800 font-medium truncate">{event.clientName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} className="text-purple-500" />
                    <span className="font-medium">{event.attendees || 0} Guests</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span className="font-medium">{(() => {
                      const apiEvent = apiEvents.find(e => e.id?.toString() === event.id);
                      const selectedServices = apiEvent?.selected_services;
                      const vendorServices = apiEvent?.form_data?.selectedVendorServices;
                      const serviceCount = selectedServices?.length || vendorServices?.length || 0;
                      return serviceCount;
                    })()} Vendors</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Calendar size={16} className="text-purple-500" />
                    <span className="font-medium">{event.dateTime ? new Date(event.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}</span>
                  </p>
                </div>

                <div className="flex gap-1 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const apiEvent = apiEvents.find(e => e.id?.toString() === event.id);
                      const eventType = apiEvent?.form_data?.event_type || 'corporate';
                      const subType = apiEvent?.form_data?.sub_type || 'conference';
                      onEditEvent(event.id, eventType, subType);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <Edit size={12} />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/budget-dashboard/${event.id}`);
                    }}
                    className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <IndianRupee size={12} />
                    Budget
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEventId(event.id);
                      setShowDetailsModal(true);
                    }}
                    className="flex items-center justify-center px-2 py-2 text-xs font-semibold bg-white/80 text-gray-700 rounded-md border border-gray-200 hover:bg-white/90 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(event.id);
                    }}
                    className="flex items-center justify-center px-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/80 rounded-md border border-red-200/60 hover:border-red-300 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    
    <EventDetailsModal
      isOpen={showDetailsModal}
      onClose={() => setShowDetailsModal(false)}
      onEdit={() => {
        setShowDetailsModal(false);
        if (selectedEventId) {
          const apiEvent = apiEvents.find(e => e.id?.toString() === selectedEventId);
          const eventType = apiEvent?.form_data?.event_type || 'corporate';
          const subType = apiEvent?.form_data?.sub_type || 'conference';
          onEditEvent(selectedEventId, eventType, subType);
        }
      }}
      eventId={selectedEventId || ''}
    />
    </>
  );
}