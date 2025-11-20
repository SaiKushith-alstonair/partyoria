import React, { useState, useEffect } from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { apiService, ApiTraditionStyle } from '../services/api';

// Enhanced tradition interface with better typing
interface TraditionStyle extends ApiTraditionStyle {
  event_type?: string;
}

interface TraditionSelectorProps {
  eventType: string;
  selectedTradition: string;
  onTraditionChange: (tradition: string) => void;
  subsectionName?: string;
}

const TraditionSelector: React.FC<TraditionSelectorProps> = ({
  eventType,
  selectedTradition,
  onTraditionChange,
  subsectionName,
}) => {
  const [traditions, setTraditions] = useState<TraditionStyle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show traditions for most event types
  const shouldShowTraditions = (sectionId: string, subsectionName?: string): boolean => {
    // Show for all social, cultural, religious, and festival events
    if (sectionId === 'social' || sectionId === 'cultural' || sectionId === 'religious' || sectionId === 'festival') {
      return true;
    }
    
    // Also show for specific corporate events that might have cultural elements
    if (subsectionName) {
      const lowerName = subsectionName.toLowerCase();
      return lowerName.includes('wedding') || 
             lowerName.includes('birthday') || 
             lowerName.includes('anniversary') || 
             lowerName.includes('engagement') || 
             lowerName.includes('baby') || 
             lowerName.includes('shower') || 
             lowerName.includes('housewarming') || 
             lowerName.includes('graduation') || 
             lowerName.includes('retirement') ||
             lowerName.includes('party') ||
             lowerName.includes('celebration');
    }
    
    return false;
  };

  const getTraditionEventType = (sectionId: string, subsectionName?: string): string => {
    if (subsectionName) {
      const lowerName = subsectionName.toLowerCase();
      if (lowerName.includes('wedding')) return 'wedding';
      if (lowerName.includes('birthday')) return 'birthday';
      if (lowerName.includes('anniversary')) return 'anniversary';
      if (lowerName.includes('engagement')) return 'engagement';
      if (lowerName.includes('baby') || lowerName.includes('shower')) return 'baby_shower';
      if (lowerName.includes('housewarming')) return 'housewarming';
      if (lowerName.includes('graduation')) return 'graduation';
      if (lowerName.includes('retirement')) return 'retirement';
    }
    return sectionId;
  };

  // Fallback tradition data for different event types
  const getFallbackTraditions = (eventType: string): TraditionStyle[] => {
    const traditionMap: Record<string, TraditionStyle[]> = {
      'wedding': [
        { id: 1, event_type: 'wedding', style_name: 'Traditional Hindu', description: 'Classic Hindu wedding ceremonies' },
        { id: 2, event_type: 'wedding', style_name: 'South Indian', description: 'Traditional South Indian customs' },
        { id: 3, event_type: 'wedding', style_name: 'North Indian', description: 'Traditional North Indian customs' },
        { id: 4, event_type: 'wedding', style_name: 'Christian', description: 'Christian wedding traditions' },
        { id: 5, event_type: 'wedding', style_name: 'Muslim', description: 'Islamic wedding customs' },
        { id: 6, event_type: 'wedding', style_name: 'Sikh', description: 'Sikh wedding traditions' },
        { id: 7, event_type: 'wedding', style_name: 'Modern Fusion', description: 'Mix of traditional and contemporary' }
      ],
      'birthday': [
        { id: 1, event_type: 'birthday', style_name: 'Traditional Indian', description: 'Classic Indian birthday celebrations' },
        { id: 2, event_type: 'birthday', style_name: 'Western Style', description: 'Modern Western birthday party' },
        { id: 3, event_type: 'birthday', style_name: 'Theme Based', description: 'Themed birthday celebration' },
        { id: 4, event_type: 'birthday', style_name: 'Regional Traditional', description: 'Local cultural birthday customs' }
      ],
      'festival': [
        { id: 1, event_type: 'festival', style_name: 'Traditional Hindu', description: 'Classic Hindu festival celebrations' },
        { id: 2, event_type: 'festival', style_name: 'Regional Folk', description: 'Local folk traditions' },
        { id: 3, event_type: 'festival', style_name: 'Modern Celebration', description: 'Contemporary festival style' },
        { id: 4, event_type: 'festival', style_name: 'Community Style', description: 'Community-based celebrations' }
      ],
      'default': [
        { id: 1, event_type: 'default', style_name: 'Traditional Indian', description: 'Classic Indian cultural style' },
        { id: 2, event_type: 'default', style_name: 'Modern Contemporary', description: 'Modern and stylish approach' },
        { id: 3, event_type: 'default', style_name: 'Regional Traditional', description: 'Local cultural traditions' },
        { id: 4, event_type: 'default', style_name: 'Fusion Style', description: 'Mix of traditional and modern' }
      ]
    };
    
    return traditionMap[eventType] || traditionMap['default'];
  };

  useEffect(() => {
    if (!shouldShowTraditions(eventType, subsectionName)) {
      setTraditions([]);
      setLoading(false);
      return;
    }

    const actualEventType = getTraditionEventType(eventType, subsectionName);
    
    const loadTraditions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try API first
        const traditionData = await apiService.getTraditionStyles(actualEventType);
        setTraditions(traditionData);
      } catch (error) {
        // Silently use fallback data
        // Use fallback data immediately without showing error
        const fallbackTraditions = getFallbackTraditions(actualEventType);
        setTraditions(fallbackTraditions);
        setError(null); // Don't show error to user
      } finally {
        setLoading(false);
      }
    };
    
    loadTraditions();
  }, [eventType, subsectionName]);

  // Don't render if traditions shouldn't be shown
  if (!shouldShowTraditions(eventType, subsectionName)) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Crown className="inline w-4 h-4 mr-1" />
        Cultural Tradition Style (Optional)
      </label>
      <p className="text-sm text-gray-500 mb-4">
        🎭 Choose the cultural or regional tradition you'd like to follow for your event
      </p>
      
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading traditions...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : (
        <div className="space-y-4">
          {/* None/Skip Option */}
          <div
            onClick={() => onTraditionChange('')}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedTradition === ''
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">No Specific Tradition</span>
              <span className="text-sm text-gray-500">(Modern/Contemporary Style)</span>
            </div>
          </div>
          
          {traditions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {traditions.map((tradition) => (
                <div
                  key={tradition.id}
                  onClick={() => onTraditionChange(tradition.style_name)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedTradition === tradition.style_name
                      ? 'border-purple-500 bg-purple-100 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-purple-600" size={16} />
                    <span className="font-medium text-gray-900">{tradition.style_name}</span>
                  </div>
                  {tradition.description && (
                    <p className="text-sm text-gray-600">{tradition.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No specific cultural traditions available for this event type.</p>
              <p className="text-sm mt-1">You can proceed with a modern/contemporary style.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TraditionSelector;