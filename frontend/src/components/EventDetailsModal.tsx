import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, IndianRupee, Edit, User, Briefcase } from 'lucide-react';
import { apiService, ApiEvent, ApiVendor } from '../services/api';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  eventId: string;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  eventId,
}) => {
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [vendors, setVendors] = useState<ApiVendor[]>([]);
  const [organizer, setOrganizer] = useState<ApiVendor | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && eventId) {
      loadEventDetails();
    }
  }, [isOpen, eventId]);

  const loadEventDetails = async () => {
    setLoading(true);
    try {
      const eventData = await apiService.getEvent(parseInt(eventId));
      setEvent(eventData);
      
      // Load associated vendors/organizers
      // This would require a new API endpoint to get bookings by event
      // For now, we'll show placeholder data
    } catch (error) {
      console.error('Error loading event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getBudgetText = (event: ApiEvent) => {
    // If actual budget values are available, use them
    if (event.budget_min !== undefined && event.budget_max !== undefined) {
      if (event.budget_min > 0 && event.budget_max > 0) {
        return `₹${event.budget_min.toLocaleString()} - ₹${event.budget_max.toLocaleString()}`;
      } else if (event.budget_min > 0) {
        return `₹${event.budget_min.toLocaleString()}+`;
      }
    }
    
    // Fallback to range text
    const ranges = {
      'under_5k': 'Under ₹5,000',
      '5k_15k': '₹5,000 - ₹15,000',
      '15k_30k': '₹15,000 - ₹30,000',
      '30k_50k': '₹30,000 - ₹50,000',
      'over_50k': 'Over ₹50,000'
    };
    return ranges[event.budget_range as keyof typeof ranges] || event.budget_range;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
            <p className="text-gray-600">Complete event information</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Event"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading event details...</p>
            </div>
          ) : event ? (
            <div className="space-y-6">
              {/* Basic Event Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{event.event_name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-purple-600" size={20} />
                    <span>{event.form_data?.dateTime ? formatDate(event.form_data.dateTime) : 'Date TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="text-purple-600" size={20} />
                    <span>{event.form_data?.city || 'TBD'}, {event.form_data?.state || 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="text-purple-600" size={20} />
                    <span>{event.form_data?.attendees || 0} attendees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="text-purple-600" size={20} />
                    <span>₹{event.form_data?.budget?.toLocaleString() || '0'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {event.duration && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Duration: </span>
                      <span className="text-purple-600 font-medium">
                        {event.duration === 'custom' ? event.custom_duration : 
                         typeof event.duration === 'string' ? event.duration.replace('-', ' ') : event.duration}
                      </span>
                    </div>
                  )}
                  {event.event_priority && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Priority: </span>
                      <span className={`font-medium capitalize ${
                        event.event_priority === 'high' ? 'text-red-600' :
                        event.event_priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {event.event_priority}
                      </span>
                    </div>
                  )}
                  {event.tradition_style && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Tradition Style: </span>
                      <span className="text-purple-600 font-medium">{event.tradition_style}</span>
                    </div>
                  )}
                  {event.contact_preference && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Contact Preference: </span>
                      <span className="text-purple-600 font-medium capitalize">{event.contact_preference}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Name:</span>
                    <p className="text-gray-900">{event.form_data?.clientName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <p className="text-gray-900">{event.form_data?.clientEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Phone:</span>
                    <p className="text-gray-900">{event.form_data?.clientPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              {event.form_data?.venueDetails && (
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Venue Details</h4>
                  <p className="text-gray-700">{event.form_data.venueDetails}</p>
                </div>
              )}

              {/* Description */}
              {event.form_data?.description && (
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Event Description</h4>
                  <p className="text-gray-700">{event.form_data.description}</p>
                </div>
              )}

              {/* Special Requirements with Quantities */}
              {(event.special_requirements || event.form_data?.customRequirements || event.form_data?.specialInstructions || event.form_data?.accessibilityNeeds) && (
                <div className="bg-red-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Requirements & Instructions</h4>
                  <div className="space-y-4">
                    {event.form_data?.customRequirements && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Custom Requirements</h5>
                        <p className="text-gray-700">{event.form_data.customRequirements}</p>
                      </div>
                    )}
                    {event.form_data?.specialInstructions && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Special Instructions</h5>
                        <p className="text-gray-700">{event.form_data.specialInstructions}</p>
                      </div>
                    )}
                    {event.form_data?.accessibilityNeeds && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Accessibility Needs</h5>
                        <p className="text-gray-700">{event.form_data.accessibilityNeeds}</p>
                      </div>
                    )}
                    {event.special_requirements && Object.keys(event.special_requirements).length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Special Requirements with Quantities</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(event.special_requirements).map(([key, value]) => {
                            if (typeof value === 'object' && value !== null) {
                              const req = value as { selected?: boolean; quantity?: number; unit?: string };
                              return req.selected && (
                                <div key={key} className="bg-white rounded-lg p-3 border border-red-200">
                                  <div className="font-medium text-gray-900">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </div>
                                  {req.quantity && (
                                    <div className="text-sm text-purple-600 font-medium">
                                      Quantity: {req.quantity} {req.unit || 'units'}
                                    </div>
                                  )}
                                </div>
                              );
                            } else if (typeof value === 'string' && value.trim()) {
                              return (
                                <div key={key} className="bg-white rounded-lg p-3 border border-red-200">
                                  <div className="font-medium text-gray-900">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </div>
                                  <div className="text-sm text-purple-600 font-medium">
                                    Quantity: {value} units
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }).filter(Boolean)}
                        </div>
                      </div>
                    )}
                    {event.form_data?.selectedServices && event.form_data.selectedServices.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Selected Services</h5>
                        <div className="flex flex-wrap gap-2">
                          {event.form_data.selectedServices.map((service: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Venue Types */}
              {event.form_data?.selectedVenueTypes && event.form_data.selectedVenueTypes.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    🏛️ Selected Venue Types ({event.form_data.selectedVenueTypes.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.form_data.selectedVenueTypes.map((venue: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {venue.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Vendor Services */}
              {event.form_data?.selectedVendorServices && event.form_data.selectedVendorServices.length > 0 && (
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    👥 Selected Vendor Services ({event.form_data.selectedVendorServices.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.form_data.selectedVendorServices.map((service: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Vendors */}
              {vendors.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase size={20} />
                    Selected Vendors ({vendors.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vendors.map((vendor) => (
                      <div key={vendor.id} className="bg-white rounded-lg p-4 border">
                        <h5 className="font-medium text-gray-900">{vendor.name}</h5>
                        <p className="text-sm text-gray-600">{vendor.category}</p>
                        <p className="text-sm text-gray-500">{vendor.contact_phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Organizer */}
              {organizer && (
                <div className="bg-indigo-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Event Organizer
                  </h4>
                  <div className="bg-white rounded-lg p-4 border">
                    <h5 className="font-medium text-gray-900">{organizer.name}</h5>
                    <p className="text-sm text-gray-600">{organizer.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>📍 {organizer.location}</span>
                      <span>⭐ {organizer.rating}</span>
                      <span>📞 {organizer.contact_phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Food Preferences */}
              {event.form_data?.foodPreferences && event.form_data.foodPreferences.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">🍽️ Food Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.form_data.foodPreferences.map((preference: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        {preference}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Event Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Additional Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {event.form_data?.duration && (
                    <div>
                      <span className="font-medium text-gray-700">Duration: </span>
                      <span className="text-gray-900">
                        {event.form_data.duration === 'custom' ? event.form_data.customDuration : 
                         typeof event.form_data.duration === 'string' ? event.form_data.duration.replace('-', ' ') : event.form_data.duration}
                      </span>
                    </div>
                  )}
                  {event.form_data?.traditionStyle && (
                    <div>
                      <span className="font-medium text-gray-700">Tradition Style: </span>
                      <span className="text-gray-900">{event.form_data.traditionStyle}</span>
                    </div>
                  )}
                  {event.form_data?.contactPreference && (
                    <div>
                      <span className="font-medium text-gray-700">Contact Preference: </span>
                      <span className="text-gray-900 capitalize">{event.form_data.contactPreference}</span>
                    </div>
                  )}
                  {event.form_data?.event_type && (
                    <div>
                      <span className="font-medium text-gray-700">Event Type: </span>
                      <span className="text-gray-900 capitalize">{event.form_data.event_type}</span>
                    </div>
                  )}
                  {event.form_data?.sub_type && (
                    <div>
                      <span className="font-medium text-gray-700">Event Category: </span>
                      <span className="text-gray-900 capitalize">{event.form_data.sub_type.replace('-', ' ')}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Created: </span>
                    <span className="text-gray-900">{event.created_at ? formatDate(event.created_at) : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Updated: </span>
                    <span className="text-gray-900">{event.updated_at ? formatDate(event.updated_at) : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {event.form_data?.timeline && event.form_data.timeline.length > 0 && (
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">⏰ Event Timeline</h4>
                  <div className="space-y-3">
                    {event.form_data.timeline.map((timelineEvent: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{timelineEvent.activity || timelineEvent.title}</div>
                            {timelineEvent.description && (
                              <div className="text-sm text-gray-600 mt-1">{timelineEvent.description}</div>
                            )}
                          </div>
                          <span className="text-green-600 font-medium ml-4">{timelineEvent.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget Allocation */}
              {event.budget_allocation && Object.keys(event.budget_allocation).length > 0 && (
                <div className="bg-indigo-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">💰 Budget Allocation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(event.budget_allocation).map(([category, allocation]: [string, any]) => (
                      <div key={category} className="bg-white rounded-lg p-4 border border-indigo-200">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-gray-900 capitalize">{category.replace('_', ' ')}</h5>
                          <span className="text-indigo-600 font-bold">₹{allocation.amount?.toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-gray-600">{allocation.percentage}% of total budget</div>
                        {allocation.services && allocation.services.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">Services:</div>
                            <div className="flex flex-wrap gap-1">
                              {allocation.services.map((service: string, idx: number) => (
                                <span key={idx} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {event.allocation_method && (
                    <div className="mt-4 text-center">
                      <span className="text-sm text-gray-600">Allocation Method: </span>
                      <span className="text-indigo-600 font-medium capitalize">{event.allocation_method}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Event Status */}
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Event Status:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Vendor Selection:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.vendor_selection_completed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {event.vendor_selection_completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Event not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;