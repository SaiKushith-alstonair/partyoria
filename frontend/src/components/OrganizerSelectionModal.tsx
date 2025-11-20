import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle, Search } from 'lucide-react';
import { apiService, ApiVendor } from '../services/api';

interface OrganizerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (selectedOrganizer: string | null) => void;
  eventName: string;
}

const OrganizerSelectionModal: React.FC<OrganizerSelectionModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  eventName,
}) => {
  const [organizers, setOrganizers] = useState<ApiVendor[]>([]);
  const [selectedOrganizer, setSelectedOrganizer] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOrganizers();
    }
  }, [isOpen]);

  const loadOrganizers = async () => {
    setLoading(true);
    try {
      const organizerData = await apiService.searchVendors('', 'organizer');
      setOrganizers(organizerData);
    } catch (error) {
      console.error('Error loading organizers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganizers = organizers.filter(organizer =>
    organizer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    organizer.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleComplete = () => {
    onComplete(selectedOrganizer);
    onClose();
  };

  const handleSkip = () => {
    onComplete(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Event Organizer</h2>
            <p className="text-gray-600">Choose an organizer for "{eventName}"</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="max-h-[50vh]">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading organizers...</p>
              </div>
            ) : filteredOrganizers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrganizers.map((organizer) => (
                  <div
                    key={organizer.id}
                    onClick={() => setSelectedOrganizer(organizer.id.toString())}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedOrganizer === organizer.id.toString()
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{organizer.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{organizer.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>📍 {organizer.location}</span>
                          <span>⭐ {organizer.rating}</span>
                          <span>💰 ₹{organizer.price_range_min} - ₹{organizer.price_range_max}</span>
                        </div>
                      </div>
                      {selectedOrganizer === organizer.id.toString() && (
                        <CheckCircle className="text-purple-600 ml-2" size={20} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No organizers found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedOrganizer ? '1 organizer selected' : 'No organizer selected'}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Skip for Now
            </button>
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <CheckCircle size={16} />
              {selectedOrganizer ? 'Select Organizer' : 'Continue Without Organizer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerSelectionModal;