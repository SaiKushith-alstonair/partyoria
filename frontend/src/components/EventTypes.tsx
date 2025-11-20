import React, { useEffect } from 'react';
import { ArrowLeft, Briefcase, Heart, Palette, Church, Sparkles, Flag, Trophy, GraduationCap, Activity, Leaf, Monitor } from 'lucide-react';
import { getEventImage } from '../data/eventImages';

interface EventTypesProps {
  selectedSectionData: any;
  apiImages: Record<string, string>;
  onSubsectionSelect: (subsectionId: string, fromPlanButton?: boolean) => void;
  onBack: () => void;
}

const iconMap = {
  Briefcase, Heart, Palette, Church, Sparkles, Flag,
  Trophy, GraduationCap, Activity, Leaf, Monitor
};

const EventTypes: React.FC<EventTypesProps> = ({
  selectedSectionData,
  apiImages,
  onSubsectionSelect,
  onBack
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedSectionData.id]);

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent size={32} /> : <Briefcase size={32} />;
  };

  const colors = {
    'corporate': { bg: 'from-purple-500 to-pink-600', text: 'text-purple-600' },
    'social': { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600' },
    'cultural': { bg: 'from-indigo-500 to-indigo-600', text: 'text-indigo-600' },
    'religious': { bg: 'from-slate-500 to-slate-600', text: 'text-slate-600' },
    'festival': { bg: 'from-violet-500 to-violet-600', text: 'text-violet-600' },
    'political': { bg: 'from-gray-500 to-gray-600', text: 'text-gray-600' },
    'sports': { bg: 'from-cyan-500 to-cyan-600', text: 'text-cyan-600' },
    'educational': { bg: 'from-teal-500 to-teal-600', text: 'text-teal-600' },
    'health': { bg: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600' },
    'environmental': { bg: 'from-green-500 to-green-600', text: 'text-green-600' },
    'virtual': { bg: 'from-pink-500 to-pink-600', text: 'text-pink-600' },
    'entertainment': { bg: 'from-rose-500 to-rose-600', text: 'text-rose-600' },
    'community': { bg: 'from-orange-500 to-orange-600', text: 'text-orange-600' }
  };

  const colorScheme = colors[selectedSectionData.id as keyof typeof colors] || { bg: 'from-purple-500 to-pink-600', text: 'text-purple-600' };

  return (
    <div className="main-container corporate-events-grid bg-white" style={{minHeight: '100vh'}}>
      {/* Navigation Header */}
      <nav className="bg-white backdrop-blur-md border-b border-gray-200 shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{selectedSectionData.name}</h1>
              <p className="text-sm text-gray-500">Choose your event type</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section for Category */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-3xl mb-6">
            <div className="text-white">
              {getIcon(selectedSectionData.icon)}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedSectionData.name}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover {selectedSectionData.subsections.length} unique event types with professional planning and expert vendors
          </p>
        </div>

        {/* Event Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {selectedSectionData.subsections.map((subsection: any, index: number) => (
            <div
              key={subsection.id}
              className="group bg-white rounded-xl transition-all duration-200 hover:shadow-lg border border-gray-100 h-full flex flex-col interactive-card"
            >
              {/* Event Image */}
              <div className="relative h-32 overflow-hidden rounded-t-xl">
                <img 
                  src={apiImages[subsection.id] || getEventImage(subsection.id)}
                  alt={subsection.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className={`absolute top-2 right-2 w-6 h-6 bg-gradient-to-br ${colorScheme.bg} rounded-full flex items-center justify-center`}>
                  <div className="text-white text-xs">
                    {getIcon(selectedSectionData.icon)}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors line-clamp-1">
                  {subsection.name}
                </h3>
                
                <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                  <span className="text-purple-600">Popular Choice</span>
                  <span className="text-green-600">Ready to Plan</span>
                </div>
                
                <button 
                  onClick={() => onSubsectionSelect(subsection.id, true)}
                  className={`w-full py-2 bg-gradient-to-r ${colorScheme.bg} text-white text-sm font-medium rounded-lg hover:shadow-md transition-all duration-300 mt-auto`}
                >
                  Plan Event
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventTypes;

