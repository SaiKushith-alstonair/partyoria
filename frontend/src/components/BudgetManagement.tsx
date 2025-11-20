import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import { apiService } from '../services/api';
import { EventCard } from './EventCard';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

interface BudgetManagementProps {
  onEventSelect?: (event: any) => void;
}

export const BudgetManagement: React.FC<BudgetManagementProps> = ({ onEventSelect }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'allocated' | 'unallocated'>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, filterType]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventsData = await apiService.getEvents();
      
      // Convert API events to Event interface format with proper data handling
      const convertedEvents: Event[] = eventsData.map((apiEvent: any) => {
        const formData = apiEvent.form_data || {};
        return {
          id: apiEvent.id,
          event_name: apiEvent.event_name || 'Untitled Event',
          event_type: formData.event_type || apiEvent.event_type || 'other',
          attendees: formData.attendees || apiEvent.attendees || 50,
          venue_type: apiEvent.venue_type || 'indoor',
          duration: formData.duration || apiEvent.duration || 4,
          total_budget: parseFloat(formData.budget || apiEvent.total_budget) || 200000,
          services: apiEvent.services || [],
          form_data: formData,
          special_requirements: apiEvent.special_requirements || {},
          selected_services: apiEvent.selected_services || [],
          budget_allocations: apiEvent.budget_allocations || [],
          created_at: apiEvent.created_at,
          updated_at: apiEvent.updated_at
        };
      });
      
      console.log('Loaded events:', convertedEvents.length);
      setEvents(convertedEvents);
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError(`Failed to load events: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.event_type && event.event_type.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Budget allocation filter
    if (filterType === 'allocated') {
      filtered = filtered.filter(event => 
        event.budget_allocations && event.budget_allocations.length > 0
      );
    } else if (filterType === 'unallocated') {
      filtered = filtered.filter(event => 
        !event.budget_allocations || event.budget_allocations.length === 0
      );
    }

    setFilteredEvents(filtered);
  };

  const handleEventClick = (event: Event) => {
    if (onEventSelect) {
      onEventSelect(event);
    } else {
      navigate(`/budget/${event.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="p-12 bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z"/>
              </svg>
            </div>
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-center text-gray-600 text-lg">Preparing your budget dashboard...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                  </svg>
                </div>
                <h1 className="text-4xl font-bold">Budget Management</h1>
              </div>
              <p className="text-purple-100 text-lg ml-14">
                Manage budget allocations for your events with smart distribution algorithms
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
onClick={() => navigate('/dashboard')}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 px-4 py-2"
              >
                ← Back to Dashboard
              </Button>
              <div className="text-right bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="text-purple-100 text-sm font-medium mb-1">Total Events</div>
                <div className="text-4xl font-bold text-white">{events.length}</div>
                <div className="text-purple-200 text-sm mt-1">Active Projects</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                type="text"
                placeholder="Search events by name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 py-3 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
                  filterType === 'all' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'border-2 border-gray-300 hover:border-purple-500 hover:text-purple-600'
                }`}
              >
                All Events
              </Button>
              <Button
                variant={filterType === 'allocated' ? 'default' : 'outline'}
                onClick={() => setFilterType('allocated')}
                className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
                  filterType === 'allocated' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'border-2 border-gray-300 hover:border-purple-500 hover:text-purple-600'
                }`}
              >
                Budget Allocated
              </Button>
              <Button
                variant={filterType === 'unallocated' ? 'default' : 'outline'}
                onClick={() => setFilterType('unallocated')}
                className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
                  filterType === 'unallocated' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'border-2 border-gray-300 hover:border-purple-500 hover:text-purple-600'
                }`}
              >
                Needs Allocation
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {error && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-red-50 to-red-100 border-0 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-red-800 font-semibold text-lg">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={loadEvents}
                  className="mt-3 bg-white border-red-300 text-red-700 hover:bg-red-50 px-6 py-2 font-semibold rounded-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry Loading
                </Button>
              </div>
            </div>
          </Card>
        )}

        {filteredEvents.length === 0 ? (
          <Card className="p-16 text-center bg-gradient-to-br from-gray-50 to-purple-50 border-0 shadow-xl">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchQuery || filterType !== 'all' ? 'No matching events found' : 'No events available'}
            </h3>
            <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria to find the events you\'re looking for.'
                : 'Create your first event to start managing budgets and allocations.'
              }
            </p>
            {(searchQuery || filterType !== 'all') && (
              <Button 
                onClick={() => { setSearchQuery(''); setFilterType('all'); }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Clear Filters
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        )}
      </div>


    </div>
  );
};