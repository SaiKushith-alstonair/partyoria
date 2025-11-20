import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { secureApiService } from './services/secureApi';
import { Event } from './types';

// Lazy load components
const Home = lazy(() => import('./components/home/Home'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const EventCreationPage = lazy(() => import('./components/EventCreationPage'));
const EventList = lazy(() => import('./components/EventList'));
const BudgetManagement = lazy(() => import('./components/BudgetManagement').then(m => ({ default: m.BudgetManagement })));
const BudgetControl = lazy(() => import('./components/BudgetControl').then(m => ({ default: m.BudgetControl })));
const ErrorBoundary = lazy(() => import('./components/ErrorBoundary'));
const RouteGuard = lazy(() => import('./components/RouteGuard'));
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const SignupPage = lazy(() => import('./components/auth/SignupPage'));
import DashboardLayout from './components/DashboardLayout';
const RSVPResponse = lazy(() => import('./components/RSVPResponse'));
const VendorApp = lazy(() => import('./vendor/App'));
const TestLogin = lazy(() => import('./components/TestLogin'));
const VendorMarketplace = lazy(() => import('./components/marketplace/VendorMarketplace'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="loading-spinner" />
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);

function BudgetRoute() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = React.useState<Event | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (eventId) {
      secureApiService.getEvent(parseInt(eventId))
        .then(setEvent)
        .catch(() => navigate('/dashboard'))
        .finally(() => setLoading(false));
    }
  }, [eventId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="loading-spinner" />
        <p className="text-gray-600 text-sm">Loading event...</p>
      </div>
    </div>
  );
  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Event not found</h2>
        <p className="text-gray-600">The event you're looking for doesn't exist.</p>
      </div>
    </div>
  );

  return (
    <BudgetControl 
      event={event} 
      onClose={() => navigate('/dashboard')} 
    />
  );
}
import './App.css';
import './styles/design-system.css';

const queryClient = new QueryClient();

function AppContent() {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedSubsection, setSelectedSubsection] = useState<string | null>(null);
  const [editEventId, setEditEventId] = useState<string | undefined>(undefined);

  useEffect(() => {
    console.log('🚀 PartyOria Event Management System Started');
    
    // Preload critical resources
    const preloadImage = (src: string) => {
      const img = new Image();
      img.src = src;
    };
    
    // Preload hero video poster
    preloadImage('/images/hero-poster.jpg');
  }, []);

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
  };

  const handleSubsectionSelect = (subsectionId: string, fromPlanButton?: boolean) => {
    setSelectedSubsection(subsectionId);
    if (fromPlanButton) {
      navigate('/event-creation');
    }
  };

  const handleBack = () => {
    if (selectedSubsection) {
      setSelectedSubsection(null);
    } else if (selectedSection) {
      setSelectedSection(null);
    }
  };

  const handleShowEventList = () => {
    navigate('/event-list');
  };

  const handleBackToHome = () => {
    setSelectedSection(null);
    setSelectedSubsection(null);
    setEditEventId(undefined);
    navigate('/', { replace: true });
  };

  const handleEventsBack = () => {
    if (selectedSubsection) {
      setSelectedSubsection(null);
    } else if (selectedSection) {
      setSelectedSection(null);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleCreateNewEvent = () => {
    setEditEventId(undefined);
    navigate('/event-creation');
  };



  const handleStartEventCreation = () => {
    setSelectedSection(null);
    setSelectedSubsection(null);
    navigate('/landing');
  };



  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ErrorBoundary>
        <Routes>
        <Route path="/" element={<Home onStartEventCreation={handleStartEventCreation} />} />
        <Route path="/events" element={<Navigate to="/" replace />} />
        <Route path="/landing" element={
          <LandingPage
            selectedSection={selectedSection}
            onSectionSelect={handleSectionSelect}
            onSubsectionSelect={handleSubsectionSelect}
            onBack={handleEventsBack}
            onShowEventList={handleShowEventList}

          />
        } />

        <Route path="/event-creation" element={
          <RouteGuard requireAuth={true}>
            <EventCreationPage
              sectionId={selectedSection || ''}
              subsectionId={selectedSubsection || ''}
              onBack={() => navigate('/landing')}
              onEventCreated={(eventName: string, clientName: string) => {
                console.log('Event created:', { eventName, clientName });
                navigate('/');
                setSelectedSection(null);
                setSelectedSubsection(null);
                setEditEventId(undefined);
              }}
              editEventId={editEventId}
            />
          </RouteGuard>
        } />
        <Route path="/event-list" element={
          <RouteGuard requireAuth={true}>
            <EventList
              onEditEvent={(eventId: string, sectionId: string, subsectionId: string) => {
                console.log('Editing event:', { eventId, sectionId, subsectionId });
                setEditEventId(eventId);
                setSelectedSection(sectionId);
                setSelectedSubsection(subsectionId);
                navigate('/event-creation');
              }}
              onBack={() => navigate('/dashboard')}
            />
          </RouteGuard>
        } />
        <Route path="/budget-management" element={
          <RouteGuard requireAuth={true}>
            <BudgetManagement />
          </RouteGuard>
        } />
        <Route path="/budget/:eventId" element={
          <RouteGuard requireAuth={true}>
            <BudgetRoute />
          </RouteGuard>
        } />
        <Route path="/dashboard" element={
          <RouteGuard requireAuth={true}>
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardLayout />
            </Suspense>
          </RouteGuard>
        } />
        <Route path="/rsvp" element={<RSVPResponse />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/quote-management" element={
          <RouteGuard requireAuth={true}>
            <Navigate to="/dashboard" replace />
          </RouteGuard>
        } />
        <Route path="/vendor-marketplace" element={<VendorMarketplace />} />
        <Route path="/vendor/*" element={
          <RouteGuard requireAuth={true} requireVendor={true}>
            <VendorApp />
          </RouteGuard>
        } />
        <Route path="/test-login" element={<TestLogin />} />
        </Routes>
      </ErrorBoundary>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;