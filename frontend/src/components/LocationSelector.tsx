import React, { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { apiService } from '../services/api';

interface LocationSelectorProps {
  selectedState: string;
  selectedCity: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  error?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedState,
  selectedCity,
  onStateChange,
  onCityChange,
  error,
}) => {
  const [states, setStates] = useState<{name: string}[]>([]);
  const [cities, setCities] = useState<{name: string}[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const stateData = await apiService.getStates();
        setStates(stateData);
      } catch (error) {
        console.error('Error loading states:', error);
      }
    };
    loadStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      const loadCities = async () => {
        setLoading(true);
        try {
          const cityData = await apiService.getCities(selectedState);
          setCities(cityData);
        } catch (error) {
          console.error('Error loading cities:', error);
        } finally {
          setLoading(false);
        }
      };
      loadCities();
    } else {
      setCities([]);
    }
  }, [selectedState]);

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleStateChange = (state: string) => {
    onStateChange(state);
    onCityChange(''); // Reset city when state changes
    setCitySearch('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            State *
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
              error ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.name} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search and select city"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                error ? 'border-red-500' : 'border-gray-200'
              }`}
              disabled={!selectedState}
            />
          </div>
          
          {selectedState && (
            <div className="mt-2 max-h-40 border-2 border-gray-200 rounded-xl">
              {loading ? (
                <div className="p-3 text-center text-gray-500">Loading cities...</div>
              ) : filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <div
                    key={city.name}
                    onClick={() => {
                      onCityChange(city.name);
                      setCitySearch(city.name);
                    }}
                    className={`p-3 cursor-pointer hover:bg-purple-50 ${
                      selectedCity === city.name ? 'bg-purple-100 text-purple-700' : ''
                    }`}
                  >
                    {city.name}
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500">
                  {citySearch ? 'No cities found' : 'Type to search cities'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

export default LocationSelector;