import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Dashboard, MyEvents, Messages, Payments, Settings, BudgetAnalytics, QuoteManagement } from './dashboard';
import QuotesDashboard from './dashboard/QuotesDashboard';
import RSVPManager from './dashboard/RSVPManager';
import MyBookings from './dashboard/MyBookings';
import { BudgetDashboard } from './BudgetDashboard';
import { BudgetManagement } from './BudgetManagement';
import RequotePage from './RequotePage';
import { Bell, ChevronDown, Home, Calendar, Plus, Search, BarChart3, Clock, MessageSquare, CreditCard, Settings as SettingsIcon, LogOut, FileText, UserCheck } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { isAuthenticated, getUserData } from '../utils/auth';
import AuthWrapper from './AuthWrapper';
import EventCategories from './EventCategories';
import EventTypes from './EventTypes';
import EventCreationPage from './EventCreationPage';
import EventTimeline from './EventTimeline';
import { eventSections } from '../data/eventSections';

const DashboardLayout: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [userType, setUserType] = useState('customer');
  const [userName, setUserName] = useState('User');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedSubsection, setSelectedSubsection] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventForBudget, setSelectedEventForBudget] = useState<any>(null);
  const navigate = useNavigate();
  
  const handleBudgetAnalytics = () => {
    navigate('/budget-management');
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/', { replace: true });
      return;
    }

    const user = getUserData();
    if (user) {
      setUserType(user.user_type || 'customer');
      setUserName(user.first_name || user.username || 'User');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('partyoria_user');
    localStorage.removeItem('vendor_profile');
    localStorage.removeItem('auth-storage');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('partyoria_user');
    
    // Clear auth store
    useAuthStore.getState().logout();
    
    navigate('/', { replace: true });
  };

  const eventMenuItems = [
    { label: 'Create Event', icon: Plus, component: 'create-event' },
    { label: 'My Events', icon: Calendar, component: 'my-events' },
    { label: 'My Bookings', icon: UserCheck, component: 'my-bookings' },
    { label: 'Event Timeline', icon: Clock, component: 'event-timeline' },
    { label: 'Budget Analytics', icon: BarChart3, component: 'budget-analytics', action: handleBudgetAnalytics },
    { label: 'Request Quote', icon: FileText, component: 'requote' },
    { label: 'My Quotes', icon: FileText, component: 'quotes' },
    { label: 'RSVP Manager', icon: UserCheck, component: 'rsvp-manager' }
  ];

  const menuItems = [
    { label: 'Dashboard', icon: Home, component: 'dashboard' },
    { label: 'Browse Vendors', icon: Search, component: 'browse-vendors' },
    { label: 'Messages', icon: MessageSquare, component: 'messages' },
    { label: 'Payments', icon: CreditCard, component: 'payments' },
    { label: 'Settings', icon: SettingsIcon, component: 'settings' }
  ];

  const handleMenuClick = (item: any) => {
    if (item.action) {
      item.action();
    } else {
      setActiveComponent(item.component);
    }
    setDropdownOpen(false);
  };

  const handleEventMenuClick = (item: any) => {
    if (item.action) {
      item.action();
    } else {
      setActiveComponent(item.component);
    }
    setEventDropdownOpen(false);
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
  };

  const handleSubsectionSelect = (subsectionId: string) => {
    setSelectedSubsection(subsectionId);
    setShowEventForm(true);
  };

  const handleBack = () => {
    if (showEventForm) {
      setShowEventForm(false);
      setSelectedSubsection(null);
    } else if (selectedSection) {
      setSelectedSection(null);
    }
  };

  const handleEventCreated = (eventName: string, clientName: string) => {
    console.log('Event created:', { eventName, clientName });
    setShowEventForm(false);
    setSelectedSection(null);
    setSelectedSubsection(null);
    setActiveComponent('my-events');
    // Trigger refresh of MyEvents component
    window.dispatchEvent(new CustomEvent('eventCreated'));
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveComponent} />;
      case 'my-events':
        return <MyEvents />;
      case 'create-event':
        const selectedSectionData = eventSections.find(s => s.id === selectedSection);
        
        if (showEventForm && selectedSection && selectedSubsection) {
          return (
            <EventCreationPage
              sectionId={selectedSection}
              subsectionId={selectedSubsection}
              onBack={handleBack}
              onEventCreated={handleEventCreated}
              editEventId={undefined}
            />
          );
        }
        
        if (selectedSection && selectedSectionData) {
          return (
            <EventTypes
              selectedSectionData={selectedSectionData}
              apiImages={{}}
              onSubsectionSelect={handleSubsectionSelect}
              onBack={handleBack}
            />
          );
        }
        
        return (
          <div className="bg-white">
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

            <section className="py-16 relative z-10">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Event Type</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Select from 12+ categories, each with multiple event options tailored to your needs
                  </p>
                </div>

                <EventCategories
                  sections={eventSections}
                  onSectionSelect={handleSectionSelect}
                  searchQuery={searchQuery}
                />
              </div>
            </section>
          </div>
        );
      case 'browse-vendors':
        navigate('/vendors');
        return null;
      case 'budget-analytics':
        return <BudgetAnalytics />;
      case 'budget-dashboard':
        return selectedEventForBudget ? (
          <BudgetDashboard 
            event={selectedEventForBudget} 
            onClose={() => {
              setSelectedEventForBudget(null);
              setActiveComponent('budget-analytics');
            }} 
          />
        ) : (
          <BudgetManagement />
        );
      case 'event-timeline':
        return <EventTimeline />;
      case 'requote':
        return <RequotePage onNavigate={setActiveComponent} />;
      case 'quotes':
        return <QuoteManagement onNavigate={setActiveComponent} />;
      case 'quote-management':
        return <QuoteManagement onNavigate={setActiveComponent} />;
      case 'rsvp-manager':
        return <RSVPManager onNavigate={setActiveComponent} />;
      case 'my-bookings':
        return <MyBookings onNavigate={setActiveComponent} />;
      case 'messages':
        return <Messages />;
      case 'payments':
        return <Payments />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const userData = (() => {
    const user = getUserData();
    if (user) {
      return {
        name: user.first_name || user.username || 'User',
        email: user.email || 'user@example.com',
        type: user.user_type || 'customer'
      };
    }
    return { name: 'User', email: 'user@example.com', type: 'customer' };
  })();

  return (
    <AuthWrapper>
      <div className="h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16">
              <img src="/videos/partyoria.gif" alt="PartyOria" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 capitalize">
              {activeComponent.replace('-', ' ')}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Event Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setEventDropdownOpen(!eventDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Events</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {eventDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {eventMenuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleEventMenuClick(item)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Menu Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium">More</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleMenuClick(item)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <NotificationBell />
            
            {/* Profile */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {userData.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-900">{userData.name}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
    </AuthWrapper>
  );
};

export default DashboardLayout;