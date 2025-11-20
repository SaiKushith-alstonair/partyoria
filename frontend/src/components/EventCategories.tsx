import React, { memo } from 'react';
import { 
  Briefcase, Heart, Palette, Church, Sparkles, Flag, 
  Trophy, GraduationCap, Activity, Leaf, Monitor
} from 'lucide-react';

interface EventCategoriesProps {
  sections: any[];
  onSectionSelect: (sectionId: string) => void;
  searchQuery: string;
}

const iconMap = {
  Briefcase, Heart, Palette, Church, Sparkles, Flag,
  Trophy, GraduationCap, Activity, Leaf, Monitor
};

const EventCategories: React.FC<EventCategoriesProps> = ({
  sections,
  onSectionSelect,
  searchQuery
}) => {
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent size={32} /> : <Briefcase size={32} />;
  };

  const filteredSections = sections.filter(section =>
    section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.subsections.some((sub: any) => 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const colors = {
    'corporate': { bg: 'from-purple-500 to-pink-600', popular: true },
    'social': { bg: 'from-pink-500 to-pink-600', trending: true },
    'cultural': { bg: 'from-purple-500 to-purple-600' },
    'religious': { bg: 'from-indigo-500 to-indigo-600' },
    'festival': { bg: 'from-violet-500 to-violet-600', trending: true },
    'political': { bg: 'from-gray-500 to-gray-600' },
    'sports': { bg: 'from-cyan-500 to-cyan-600' },
    'educational': { bg: 'from-teal-500 to-teal-600' },
    'health': { bg: 'from-emerald-500 to-emerald-600' },
    'environmental': { bg: 'from-green-500 to-green-600' },
    'virtual': { bg: 'from-rose-500 to-rose-600', budget: true },
    'entertainment': { bg: 'from-orange-500 to-orange-600' },
    'community': { bg: 'from-yellow-500 to-yellow-600' }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredSections.map((section: any) => {
        const categoryConfig = colors[section.id as keyof typeof colors] || { bg: 'from-purple-500 to-pink-600' };
        
        return (
          <div
            key={section.id}
            onClick={() => onSectionSelect(section.id)}
            className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-10 cursor-pointer border-2 border-transparent hover:border-purple-200 shadow-lg hover:shadow-xl min-h-[320px] interactive-card"
          >

            
            {'popular' in categoryConfig && categoryConfig.popular && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                🔥 Trending
              </div>
            )}
            {'trending' in categoryConfig && categoryConfig.trending && !('popular' in categoryConfig) && (
              <div className="absolute top-4 right-4 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                ⭐ Top Rated
              </div>
            )}
            {'budget' in categoryConfig && categoryConfig.budget && (
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                💰 Budget Friendly
              </div>
            )}
            
            <div className={`w-12 h-12 bg-gradient-to-br ${categoryConfig.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
              <div className="text-white">
                {getIcon(section.icon)}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
              {section.name}
            </h3>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Professional planning with expert vendors and seamless coordination.
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                {section.subsections.length} Event Options →
              </span>
            </div>
            
            <button
              className={`absolute bottom-4 left-4 right-4 bg-gradient-to-r ${categoryConfig.bg} text-white py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 interactive-button`}
            >
              Plan Event
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default memo(EventCategories);