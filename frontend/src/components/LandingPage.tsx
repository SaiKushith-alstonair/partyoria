import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { eventSections } from '../data/eventSections';
import { getHeroVideo } from '../services/videoApi';
import EventCategories from './EventCategories';
import EventTypes from './EventTypes';

interface LandingPageProps {
  selectedSection: string | null;
  onSectionSelect: (sectionId: string) => void;
  onSubsectionSelect: (subsectionId: string, fromPlanButton?: boolean) => void;
  onBack: () => void;
  onShowEventList: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  selectedSection,
  onSectionSelect,
  onSubsectionSelect,
  onBack,
  onShowEventList,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dataLoaded, setDataLoaded] = useState(true);
  const [heroVideoUrl, setHeroVideoUrl] = useState('/videos/party-hero.mp4');
  
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  useEffect(() => {
    const handlePopState = () => {
      // Allow normal browser back navigation instead of forcing redirect to home
      // window.location.href = '/';
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);


  useEffect(() => {
    if (selectedSection) {
      const mainContainer = document.querySelector('.main-container');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [selectedSection]);

  useEffect(() => {
    const loadVideoUrl = async () => {
      try {
        const videoUrl = await getHeroVideo();
        setHeroVideoUrl(videoUrl);
      } catch (error) {
        console.warn('Failed to load video URL:', error);
      }
    };
    loadVideoUrl();
  }, []);

  const sectionsToUse = eventSections;
  const selectedSectionData = sectionsToUse.find(s => s.id === selectedSection);

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (selectedSection && selectedSectionData) {
    return (
      <EventTypes
        selectedSectionData={selectedSectionData}
        apiImages={{}}
        onSubsectionSelect={onSubsectionSelect}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="main-container bg-white">

      
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/videos/partyoria.gif" 
                alt="PartyOria Logo" 
                className="h-10"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.replace('/dashboard')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => navigateTo('/budget-management')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Budget Manager
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What are you celebrating today? 🎊
            </h2>
            
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-50"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-xl">
                <div className="flex items-center">
                  <Search className="ml-4 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search events, categories, or vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-4 bg-transparent border-0 focus:outline-none text-gray-700 placeholder-gray-400"
                  />
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300">
                    Search
                  </button>
                </div>
              </div>
            </div>


          </div>
        </div>
      </section>

      <section id="events" className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Event Type</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select from 12+ categories, each with multiple event options tailored to your needs
            </p>
          </div>

          <EventCategories
            sections={sectionsToUse}
            onSectionSelect={onSectionSelect}
            searchQuery={searchQuery}
          />

          {sectionsToUse.filter(section =>
            section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            section.subsections.some((sub: any) => 
              sub.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          ).length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">Try adjusting your search terms or browse all categories.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;