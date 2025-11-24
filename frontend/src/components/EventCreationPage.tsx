import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, ArrowLeft, CheckCircle, Star, Users, MapPin, Clock, Eye } from 'lucide-react';
import { eventSections } from '../data/eventSections';
import { EventFormData, ValidationErrors } from '../types';
import { validateForm, isFormValid } from '../utils/validation';
import { eventStorage } from '../utils/localStorage';

import OrganizerSelectionModal from './OrganizerSelectionModal';
import EventDetailsModal from './EventDetailsModal';
import ServiceExpansionModal from './ServiceExpansionModal';
import LocationSelector from './LocationSelector';
import TraditionSelector from './TraditionSelector';
import Breadcrumb from './Breadcrumb';
import RequirementQuestionsModal from './RequirementQuestionsModal';
import { LoadingSpinner, PageLoading, EmptyState, ErrorState, FieldError } from './ui/LoadingStates';

// Removed unused imports for deleted files
import { getEventImage } from '../data/eventImages';
import "../styles/design-system.css";

type FormStep = 'basic' | 'thankyou' | 'location' | 'duration' | 'budget' | 'tradition' | 'food' | 'requirements' | 'timeline' | 'venues' | 'vendors' | 'review' | 'success';

interface EventCreationPageProps {
  sectionId: string;
  subsectionId: string;
  onBack: () => void;
  onEventCreated: (eventName: string, clientName: string) => void;
  editEventId?: string;
}

const EventCreationPage: React.FC<EventCreationPageProps> = ({
  sectionId,
  subsectionId,
  onBack,
  onEventCreated,
  editEventId,
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    eventName: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    dateTime: '',
    duration: '',
    customDuration: '',
    state: '',
    city: '',
    venueDetails: '',
    traditionStyle: '',
    attendees: 0,
    budget: 0,
    description: '',
    selectedVendors: [],
    customRequirements: '',
    specialInstructions: '',
    accessibilityNeeds: '',
    needsVendor: false,
    eventPriority: 'medium',
    contactPreference: 'both',
    timeline: [],
    foodPreferences: [],
    specialRequirements: {},
    selectedServices: [],
  });

  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set());
  const [wantsDetailedPlanning, setWantsDetailedPlanning] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{name: string; icon: string; services: any[]} | null>(null);
  const [createdEventData, setCreatedEventData] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [apiSections, setApiSections] = useState<any[]>([]);
  const [apiImages, setApiImages] = useState<Record<string, string>>({});

  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<{id: string; label: string} | null>(null);

  // State declarations that need to be available early
  const [selectedVenueTypes, setSelectedVenueTypes] = useState<string[]>([]);
  const [selectedVendorServices, setSelectedVendorServices] = useState<string[]>([]);
  const [apiRequirements, setApiRequirements] = useState<any>({});
  const [requirementsLoaded, setRequirementsLoaded] = useState(false);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [traditions, setTraditions] = useState<any[]>([]);
  const [loadingTraditions, setLoadingTraditions] = useState(false);
  const [isCustomBudget, setIsCustomBudget] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [apiVendorServices, setApiVendorServices] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const section = apiSections.find((s: any) => s.id === sectionId) || eventSections.find((s: any) => s.id === sectionId);
  const subsection = section?.subsections.find((s: any) => s.id === subsectionId);
  
  // Debug logging
  console.log('Section lookup:', { sectionId, subsectionId, section: section?.name, subsection: subsection?.name });
  console.log('Event type mapping - sectionId:', sectionId, 'will be mapped to backend event_type');

  const steps: { id: FormStep; title: string; icon: React.ReactNode }[] = [
    { id: 'basic', title: 'Basic Details', icon: <Users size={20} /> },
    { id: 'location', title: 'Location', icon: <MapPin size={20} /> },
    { id: 'duration', title: 'Duration & Date', icon: <Clock size={20} /> },
    { id: 'budget', title: 'Budget', icon: <span>💰</span> },
    { id: 'thankyou', title: 'Planning Choice', icon: <Star size={20} /> },
    { id: 'tradition', title: 'Tradition Style', icon: <Calendar size={20} /> },
    { id: 'food', title: 'Food Preferences', icon: <span>🍽️</span> },
    { id: 'requirements', title: 'Special Requirements', icon: <span>🎯</span> },
    { id: 'timeline', title: 'Timeline & Details', icon: <span>⏰</span> },
    { id: 'venues', title: 'Venues', icon: <span>🏛️</span> },
    { id: 'vendors', title: 'Vendors', icon: <span>👥</span> },
    { id: 'review', title: 'Review & Submit', icon: <CheckCircle size={20} /> }
  ];

  const getVisibleSteps = () => {
    // For editing events, skip planning choice and go directly to detailed flow
    if (editEventId) {
      const baseSteps = ['basic', 'location', 'duration', 'budget'];
      const conditionalSteps = [];
      
      if (['social', 'cultural', 'religious', 'festival'].includes(sectionId) || 
          subsection?.name.toLowerCase().includes('wedding') ||
          subsection?.name.toLowerCase().includes('birthday') ||
          subsection?.name.toLowerCase().includes('party') ||
          subsection?.name.toLowerCase().includes('celebration')) {
        conditionalSteps.push('tradition');
      }
      
      if (['social', 'cultural', 'religious', 'festival', 'corporate'].includes(sectionId) &&
          !['webinar', 'online-webinar', 'virtual-conference', 'tree-planting-drive', 'clean-up-drive'].includes(subsectionId)) {
        conditionalSteps.push('food');
      }
      
      conditionalSteps.push('requirements', 'timeline');
      const finalSteps = [...baseSteps, ...conditionalSteps, 'review'];
      return steps.filter(step => finalSteps.includes(step.id));
    }
    
    // Quick planning flow - only after user chooses quick
    if (wantsDetailedPlanning === false) {
      const quickSteps = ['basic', 'location', 'duration', 'budget', 'thankyou', 'venues', 'vendors', 'review'];
      return steps.filter(step => quickSteps.includes(step.id));
    }
    
    // Detailed planning flow (default and when user chooses detailed)
    const detailedSteps = ['basic', 'location', 'duration', 'budget', 'thankyou'];
    
    if (['social', 'cultural', 'religious', 'festival'].includes(sectionId) || 
        subsection?.name.toLowerCase().includes('wedding') ||
        subsection?.name.toLowerCase().includes('birthday') ||
        subsection?.name.toLowerCase().includes('party') ||
        subsection?.name.toLowerCase().includes('celebration')) {
      detailedSteps.push('tradition');
    }
    
    if (['social', 'cultural', 'religious', 'festival', 'corporate'].includes(sectionId) &&
        !['webinar', 'online-webinar', 'virtual-conference', 'tree-planting-drive', 'clean-up-drive'].includes(subsectionId)) {
      detailedSteps.push('food');
    }
    
    detailedSteps.push('requirements', 'timeline', 'review');
    return steps.filter(step => detailedSteps.includes(step.id));
  };

  const getCurrentStepIndex = () => {
    const visibleSteps = getVisibleSteps();
    const index = visibleSteps.findIndex(step => step.id === currentStep);
    return index >= 0 ? index : 0;
  };

  const getProgressPercentage = () => {
    const visibleSteps = getVisibleSteps();
    const currentIndex = getCurrentStepIndex();
    return ((currentIndex + 1) / visibleSteps.length) * 100;
  };

  const getStepProgress = () => {
    const visibleSteps = getVisibleSteps();
    const currentIndex = getCurrentStepIndex();
    const totalSteps = visibleSteps.length;
    const currentStepNumber = Math.max(1, currentIndex + 1);
    return `${currentStepNumber}/${totalSteps}`;
  };

  // AUTO-SAVE: Save form data every 10 seconds
  useEffect(() => {
    if (!isDirty || !formData.eventName) return;
    
    const autoSave = setTimeout(() => {
      const draftKey = `draft_${sectionId}_${subsectionId}_${editEventId || 'new'}`;
      const draftData = {
        formData,
        currentStep,
        selectedVenueTypes,
        selectedVendorServices,
        wantsDetailedPlanning,
        completedSteps: Array.from(completedSteps),
        timestamp: Date.now()
      };
      
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      setLastSaved(new Date());
      setIsDirty(false);
    }, 10000);
    
    return () => clearTimeout(autoSave);
  }, [formData, currentStep, selectedVenueTypes, selectedVendorServices, wantsDetailedPlanning, completedSteps, isDirty, sectionId, subsectionId, editEventId]);
  
  // AUTO-SAVE: Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirty && formData.eventName) {
        const draftKey = `draft_${sectionId}_${subsectionId}_${editEventId || 'new'}`;
        const draftData = {
          formData,
          currentStep,
          selectedVenueTypes,
          selectedVendorServices,
          wantsDetailedPlanning,
          completedSteps: Array.from(completedSteps),
          timestamp: Date.now()
        };
        localStorage.setItem(draftKey, JSON.stringify(draftData));
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, currentStep, selectedVenueTypes, selectedVendorServices, wantsDetailedPlanning, completedSteps, isDirty, sectionId, subsectionId, editEventId]);
  
  // AUTO-SAVE: Load draft on mount
  useEffect(() => {
    const loadEventData = async () => {
      if (subsectionId) {
        console.log('Event type:', subsectionId);
      }
      
      setApiSections(eventSections);
      setApiImages({});

      // Defer heavy API calls
      setTimeout(() => loadStates(), 100);

      // Try to load draft first
      const draftKey = `draft_${sectionId}_${subsectionId}_${editEventId || 'new'}`;
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft && !editEventId) {
        try {
          const draftData = JSON.parse(savedDraft);
          const draftAge = Date.now() - draftData.timestamp;
          
          // Only restore drafts less than 24 hours old
          if (draftAge < 24 * 60 * 60 * 1000) {
            setFormData(draftData.formData);
            setCurrentStep(draftData.currentStep);
            setSelectedVenueTypes(draftData.selectedVenueTypes || []);
            setSelectedVendorServices(draftData.selectedVendorServices || []);
            setWantsDetailedPlanning(draftData.wantsDetailedPlanning);
            setCompletedSteps(new Set(draftData.completedSteps || []));
            setLastSaved(new Date(draftData.timestamp));
            console.log('Restored draft from:', new Date(draftData.timestamp));
            return;
          } else {
            // Clean up old draft
            localStorage.removeItem(draftKey);
          }
        } catch (error) {
          console.warn('Failed to restore draft:', error);
          localStorage.removeItem(draftKey);
        }
      }
      
      if (editEventId) {
        try {
          const { apiService, convertApiEventToFormData } = await import('../services/api');
          const eventData = await apiService.getEvent(parseInt(editEventId));
          const convertedFormData = convertApiEventToFormData(eventData);
          convertedFormData.dateTime = eventData.form_data?.dateTime || '';
          // Preserve the original event name from the database
          convertedFormData.eventName = eventData.event_name;
          setFormData(convertedFormData);
          
          // Initialize venue and vendor selections from loaded data
          if (convertedFormData.selectedVenueTypes) {
            setSelectedVenueTypes(convertedFormData.selectedVenueTypes);
          }
          if (convertedFormData.selectedVendorServices) {
            setSelectedVendorServices(convertedFormData.selectedVendorServices);
          }
          
          console.log('Loaded venue types:', convertedFormData.selectedVenueTypes);
          console.log('Loaded vendor services:', convertedFormData.selectedVendorServices);
          
          // Set planning choice based on loaded data
          if (convertedFormData.planningType) {
            setWantsDetailedPlanning(convertedFormData.planningType === 'detailed');
          }
          return;
        } catch (error) {
          console.warn('Failed to load event from API:', error);
        }
      } else {
        // For new events, ensure we get the correct event name based on subsectionId
        let correctEventName = subsection?.name || '';
        
        // Fallback: if subsection name is wrong, use subsectionId to determine correct name
        if (subsectionId === 'conference') {
          correctEventName = 'Conference';
        }
        
        console.log('Setting event name for new event:', correctEventName, 'subsectionId:', subsectionId, 'subsection:', subsection);
        setFormData({
          eventName: correctEventName,
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          dateTime: '',
          duration: '',
          customDuration: '',
          state: '',
          city: '',
          venueDetails: '',
          traditionStyle: '',
          attendees: 0,
          budget: 0,
          description: '',
          selectedVendors: [],
          customRequirements: '',
          specialInstructions: '',
          accessibilityNeeds: '',
          needsVendor: false,
          contactPreference: 'both',
          inspirationImage: null,
          timeline: [],
          foodPreferences: [],
          specialRequirements: {},
          selectedVenueTypes: [],
          selectedVendorServices: [],
          selectedServices: [],
          planningType: undefined,
        });
        
        // Reset venue and vendor selections for new events
        setSelectedVenueTypes([]);
        setSelectedVendorServices([]);
      }
    };
    
    loadEventData();
  }, [subsection?.name, editEventId]);

  const loadStates = async () => {
    setLoadingStates(true);
    try {
      const { apiService } = await import('../services/api');
      const statesData = await apiService.getStates();
      setStates(statesData.map(state => state.name));
    } catch (error) {
      console.warn('Failed to load states from API, using fallback:', error);
      // Fallback to hardcoded states
      setStates([
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 
        'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 
        'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 
        'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
      ]);
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCities = async (selectedState: string) => {
    if (!selectedState) {
      setCities([]);
      return;
    }
    
    setLoadingCities(true);
    try {
      const { apiService } = await import('../services/api');
      const citiesData = await apiService.getCities(selectedState);
      setCities(citiesData.map(city => city.name));
    } catch (error) {
      console.warn('Failed to load cities from API, using fallback:', error);
      // Fallback to hardcoded cities for major states
      const fallbackCities: Record<string, string[]> = {
        'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
        'Delhi': ['New Delhi', 'Delhi'],
        'Karnataka': ['Bengaluru', 'Mysore', 'Hubli', 'Mangalore'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
        'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri'],
        'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
        'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer'],
        'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Noida']
      };
      setCities(fallbackCities[selectedState] || []);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Theme change removed (files deleted)
    if (field === 'eventName' && value) {
      console.log('Event name changed to:', value);
    }
  };

  const validateStep = (stepId: FormStep): { isValid: boolean; hasErrors: boolean } => {
    const stepErrors: ValidationErrors = {};
    
    if (stepId === 'basic') {
      if (!formData.eventName.trim()) stepErrors.eventName = 'Event name is required';
      if (!formData.clientName.trim()) stepErrors.clientName = 'Client name is required';
      if (!formData.clientEmail.trim()) stepErrors.clientEmail = 'Email is required';
      if (!formData.clientPhone.trim()) stepErrors.clientPhone = 'Phone is required';
      if (!formData.attendees || formData.attendees <= 0) stepErrors.attendees = 'Valid number of attendees required (minimum 1)';
    } else if (stepId === 'location') {
      if (!formData.state.trim()) stepErrors.venue = 'State is required';
      if (!formData.city.trim()) stepErrors.venue = 'City is required';
    } else if (stepId === 'duration') {
      if (!formData.dateTime) stepErrors.dateTime = 'Date & time is required';
      if (!formData.duration) stepErrors.duration = 'Duration is required';
    } else if (stepId === 'budget') {
      if (!formData.budget || formData.budget <= 0) stepErrors.budget = 'Valid budget amount required (minimum ₹1)';
    }
    
    return {
      isValid: Object.keys(stepErrors).length === 0,
      hasErrors: Object.keys(stepErrors).length > 0
    };
  };

  const validateCurrentStep = (): boolean => {
    const { isValid, hasErrors } = validateStep(currentStep);
    if (hasErrors) {
      const stepErrors: ValidationErrors = {};
      
      if (currentStep === 'basic') {
        if (!formData.eventName.trim()) stepErrors.eventName = 'Event name is required';
        if (!formData.clientName.trim()) stepErrors.clientName = 'Client name is required';
        if (!formData.clientEmail.trim()) stepErrors.clientEmail = 'Email is required';
        if (!formData.clientPhone.trim()) stepErrors.clientPhone = 'Phone is required';
        if (!formData.attendees || formData.attendees <= 0) stepErrors.attendees = 'Valid number of attendees required (minimum 1)';
      } else if (currentStep === 'location') {
        if (!formData.state.trim()) stepErrors.venue = 'State is required';
        if (!formData.city.trim()) stepErrors.venue = 'City is required';
      } else if (currentStep === 'duration') {
        if (!formData.dateTime) stepErrors.dateTime = 'Date & time is required';
        if (!formData.duration) stepErrors.duration = 'Duration is required';
      } else if (currentStep === 'budget') {
        if (!formData.budget || formData.budget <= 0) stepErrors.budget = 'Valid budget amount required (minimum ₹1)';
      }
      
      setErrors(stepErrors);
    }
    return isValid;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) return;
    
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setIsDirty(true);
    
    if (currentStep === 'budget' && !editEventId) {
      setCurrentStep('thankyou');
    } else {
      const visibleSteps = getVisibleSteps();
      const currentIndex = visibleSteps.findIndex(step => step.id === currentStep);
      
      if (currentIndex >= 0 && currentIndex < visibleSteps.length - 1) {
        setCurrentStep(visibleSteps[currentIndex + 1].id);
      }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    // Special handling for thankyou step
    if (currentStep === 'thankyou') {
      setCompletedSteps(prev => {
        const newCompleted = new Set(prev);
        newCompleted.delete('thankyou');
        return newCompleted;
      });
      setWantsDetailedPlanning(null);
      setCurrentStep('budget');
    } else {
      const visibleSteps = getVisibleSteps();
      const currentIndex = visibleSteps.findIndex(step => step.id === currentStep);
      
      if (currentIndex > 0) {
        const prevStep = visibleSteps[currentIndex - 1];
        setCurrentStep(prevStep.id);
        
        // Don't remove completed steps when going back to preserve form state
      }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDetailedPlanningChoice = (choice: boolean) => {
    setWantsDetailedPlanning(choice);
    setCompletedSteps(prev => new Set([...prev, 'thankyou']));
    handleInputChange('planningType', choice ? 'detailed' : 'skip');
    
    if (choice === false) {
      // Quick planning - go directly to venues
      setCurrentStep('venues');
    } else {
      // Detailed planning - go to next step in sequence
      if (['social', 'cultural', 'religious', 'festival'].includes(sectionId) || 
          subsection?.name.toLowerCase().includes('wedding') ||
          subsection?.name.toLowerCase().includes('birthday') ||
          subsection?.name.toLowerCase().includes('party') ||
          subsection?.name.toLowerCase().includes('celebration')) {
        setCurrentStep('tradition');
      } else if (['social', 'cultural', 'religious', 'festival', 'corporate'].includes(sectionId) &&
          !['webinar', 'online-webinar', 'virtual-conference', 'tree-planting-drive', 'clean-up-drive'].includes(subsectionId)) {
        setCurrentStep('food');
      } else {
        setCurrentStep('requirements');
      }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== HANDLE SUBMIT STARTED ===');
    console.log('Form data at submit:', formData);
    console.log('Selected venue types:', selectedVenueTypes);
    console.log('Selected vendor services:', selectedVendorServices);
    
    // Basic validation for required fields
    const stepErrors: ValidationErrors = {};
    if (!formData.eventName.trim()) stepErrors.eventName = 'Event name is required';
    if (!formData.clientName.trim()) stepErrors.clientName = 'Client name is required';
    if (!formData.clientEmail.trim()) stepErrors.clientEmail = 'Email is required';
    if (!formData.clientPhone.trim()) stepErrors.clientPhone = 'Phone is required';
    if (!formData.state.trim()) stepErrors.venue = 'State is required';
    if (!formData.city.trim()) stepErrors.venue = 'City is required';
    if (!formData.dateTime) stepErrors.dateTime = 'Date & time is required';
    if (!formData.duration) stepErrors.duration = 'Duration is required';
    if (!formData.budget || formData.budget <= 0) stepErrors.budget = 'Valid budget amount required (minimum ₹1)';
    
    setErrors(stepErrors);
    
    if (Object.keys(stepErrors).length > 0) {
      console.log('Validation errors:', stepErrors);
      alert('Please fill in all required fields before creating the event.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { apiService, convertFormDataToApiEvent } = await import('../services/api');
      
      // Include venue and vendor selections in form data - ensure we get the latest values
      const finalVenueTypes = (formData.selectedVenueTypes?.length || 0) > 0 ? formData.selectedVenueTypes : selectedVenueTypes || [];
      const finalVendorServices = (formData.selectedVendorServices?.length || 0) > 0 ? formData.selectedVendorServices : selectedVendorServices || [];
      
      const updatedFormData = {
        ...formData,
        selectedVenueTypes: finalVenueTypes,
        selectedVendorServices: finalVendorServices
      };
      
      console.log('=== VENUE & VENDOR SELECTION CHECK ===');
      console.log('formData.selectedVenueTypes:', formData.selectedVenueTypes);
      console.log('selectedVenueTypes state:', selectedVenueTypes);
      console.log('finalVenueTypes:', finalVenueTypes);
      console.log('formData.selectedVendorServices:', formData.selectedVendorServices);
      console.log('selectedVendorServices state:', selectedVendorServices);
      console.log('finalVendorServices:', finalVendorServices);
      
      console.log('=== FORM DATA PROCESSING ===');
      console.log('Creating event with data:', updatedFormData);
      console.log('Section ID (event type):', sectionId, 'Subsection ID:', subsectionId);
      console.log('Final venue types (length:', updatedFormData.selectedVenueTypes?.length || 0, '):', updatedFormData.selectedVenueTypes);
      console.log('Final vendor services (length:', updatedFormData.selectedVendorServices?.length || 0, '):', updatedFormData.selectedVendorServices);
      
      const apiEvent = convertFormDataToApiEvent(updatedFormData, sectionId, subsectionId);
      
      console.log('=== API EVENT PAYLOAD ===');
      console.log('API Event payload:', JSON.stringify(apiEvent, null, 2));
      console.log('Mapped event_type:', apiEvent.event_type);
      console.log('Services array:', apiEvent.services);
      console.log('Services length:', apiEvent.services?.length);
      console.log('Venue types in API event:', apiEvent.selectedVenueTypes);
      console.log('Vendor services in API event:', apiEvent.selectedVendorServices);
      
      // Check authentication before API call
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      console.log('=== AUTHENTICATION CHECK ===');
      console.log('Has access token:', !!accessToken);
      console.log('Token preview:', accessToken?.substring(0, 30) + '...');
      
      let savedEvent;
      if (editEventId) {
        console.log('=== UPDATING EVENT ===');
        savedEvent = await apiService.updateEvent(parseInt(editEventId), apiEvent);
        console.log('Event updated successfully:', savedEvent);
        
        // Clear draft after successful update
        const draftKey = `draft_${sectionId}_${subsectionId}_${editEventId || 'new'}`;
        localStorage.removeItem(draftKey);
        
        setCurrentStep('success');
      } else {
        console.log('=== CREATING NEW EVENT ===');
        savedEvent = await apiService.createEvent(apiEvent);
        console.log('Event created successfully:', savedEvent);
        
        // Clear draft after successful creation
        const draftKey = `draft_${sectionId}_${subsectionId}_${editEventId || 'new'}`;
        localStorage.removeItem(draftKey);
        
        setCurrentStep('success');
      }
    } catch (error: unknown) {
      console.error('=== ERROR SAVING EVENT ===');
      console.error('Full error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error ${editEventId ? 'updating' : 'creating'} event: ${errorMessage}\n\nPlease check the console for more details and ensure the backend server is running.`);
    } finally {
      setIsSubmitting(false);
      console.log('=== HANDLE SUBMIT FINISHED ===');
    }
  };

  if (!section || !subsection) {
    React.useEffect(() => {
      onBack();
    }, []);
    
    return <PageLoading message="Redirecting to event selection..." />;
  }

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Progress</h3>
        <span className="text-sm text-gray-500">{Math.round(getProgressPercentage())}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>
      <div className="flex justify-between mt-4">
        {getVisibleSteps().map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          const isCurrent = step.id === currentStep;
          const { hasErrors } = validateStep(step.id);
          const showError = hasErrors && (isCompleted || isCurrent);
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all relative ${
                showError ? 'bg-red-500 text-white animate-pulse' :
                isCompleted ? 'bg-green-500 text-white' :
                isCurrent ? 'bg-violet-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {showError ? '⚠️' : isCompleted ? '✓' : step.icon}
                {showError && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                )}
              </div>
              <span className={`text-xs mt-1 text-center max-w-16 ${
                showError ? 'text-red-600 font-medium' :
                isCurrent ? 'text-violet-600 font-medium' : 
                isCompleted ? 'text-green-600 font-medium' :
                'text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderBasicDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">👤</span>
        </div>
        <p className="text-gray-600">Let's start with your basic information</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Name <span className="text-error-600">*</span>
          </label>
          <input
            type="text"
            value={formData.eventName}
            onChange={(e) => handleInputChange('eventName', e.target.value)}
            className={`input-field ${errors.eventName ? 'border-error-500 bg-error-50' : 'border-gray-300 bg-white'}`}
            placeholder={`Enter ${subsection?.name.toLowerCase()} name`}
          />
          {errors.eventName && <FieldError message={errors.eventName} />}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name <span className="text-error-600">*</span>
          </label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => handleInputChange('clientName', e.target.value)}
            className={`input-field ${errors.clientName ? 'border-error-500 bg-error-50' : 'border-gray-300 bg-white'}`}
            placeholder="Enter your full name"
          />
          {errors.clientName && <FieldError message={errors.clientName} />}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-error-600">*</span>
          </label>
          <input
            type="email"
            value={formData.clientEmail}
            onChange={(e) => handleInputChange('clientEmail', e.target.value)}
            className={`input-field ${errors.clientEmail ? 'border-error-500 bg-error-50' : 'border-gray-300 bg-white'}`}
            placeholder="your@email.com"
          />
          {errors.clientEmail && <FieldError message={errors.clientEmail} />}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-error-600">*</span>
          </label>
          <input
            type="tel"
            value={formData.clientPhone}
            onChange={(e) => handleInputChange('clientPhone', e.target.value)}
            className={`input-field ${errors.clientPhone ? 'border-error-500 bg-error-50' : 'border-gray-300 bg-white'}`}
            placeholder="+91 98765 43210"
          />
          {errors.clientPhone && <FieldError message={errors.clientPhone} />}
        </div>



        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Attendees <span className="text-error-600">*</span>
          </label>
          <input
            type="number"
            value={formData.attendees || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 0 || e.target.value === '') {
                handleInputChange('attendees', value || 0);
              }
            }}
            className={`input-field ${errors.attendees ? 'border-error-500 bg-error-50' : 'border-gray-300 bg-white'}`}
            placeholder="50"
            min="1"
          />
          {errors.attendees && <FieldError message={errors.attendees} />}
        </div>
      </div>
    </div>
  );

  const renderThankYouStep = () => (
    <div className="text-center space-y-8">
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Thank you, {formData.clientName}! 🎉
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Great news! We already have <span className="font-semibold text-violet-600">150+ venues</span> and <span className="font-semibold text-violet-600">500+ vendors</span> in your area.
        </p>
      </div>

      <div className="bg-gradient-to-r from-[#FFF9E6] to-[#F5F0D8] rounded-2xl p-8 border border-[#C4A661]">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Would you like to provide a few more details so we can show you the PERFECT matches for your dream {subsection?.name.toLowerCase()}?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center border border-[#E5D5A3]">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm font-medium text-gray-800">Personalized venue recommendations</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-[#E5D5A3]">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-sm font-medium text-gray-800">Vendors within your budget</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-[#E5D5A3]">
            <div className="text-2xl mb-2">🎁</div>
            <div className="text-sm font-medium text-gray-800">Exclusive deals & discounts</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => handleDetailedPlanningChoice(true)}
            className="bg-gradient-to-r from-[#C4A661] to-[#B8941A] hover:from-[#B8941A] hover:to-[#A67C00] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Star size={20} />
            Yes, Help Me Find Perfect Matches!
          </button>
          <button
            onClick={() => handleDetailedPlanningChoice(false)}
            className="border-2 border-[#C4A661] hover:border-[#B8941A] text-[#C4A661] hover:text-[#B8941A] px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ArrowRight size={20} />
            Skip to Browse Venues/Vendors
          </button>
        </div>
      </div>
    </div>
  );

  const renderNavigationButtons = () => {
    if (currentStep === 'success') return null;
    
    return (
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 'basic'}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
            currentStep === 'basic'
              ? 'text-gray-400 cursor-not-allowed bg-gray-100/50'
              : 'text-gray-600 hover:text-gray-800 bg-gray-100/80 backdrop-blur-sm hover:bg-gray-200/80 hover:shadow-lg hover:-translate-x-1'
          }`}
        >
          <ArrowLeft size={20} />
          Previous
        </button>
        
        {currentStep !== 'thankyou' && currentStep !== 'vendors' && (
          <button
            onClick={currentStep === 'review' ? handleSubmit : handleNextStep}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:translate-x-1 hover:-translate-y-1 flex items-center gap-2 disabled:opacity-50 animate-pulse-glow"
          >
            {currentStep === 'review' ? (isSubmitting ? (editEventId ? 'Updating Event...' : 'Creating Event...') : (editEventId ? 'Update Event' : 'Create Event')) : 'Continue'}
            <ArrowRight size={20} />
          </button>
        )}
      </div>
    );
  };

  const renderLocationStep = () => {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">📍</span>
          </div>
          <p className="text-gray-600">Choose your event location</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <select
              value={formData.state}
              onChange={(e) => {
                const selectedState = e.target.value;
                handleInputChange('state', selectedState);
                handleInputChange('city', '');
                loadCities(selectedState);
              }}
              className="w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all border-gray-200"
              disabled={loadingStates}
            >
              <option value="">{loadingStates ? 'Loading states...' : 'Select State'}</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <select
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all border-gray-200"
              disabled={!formData.state || loadingCities}
            >
              <option value="">
                {!formData.state ? 'Select State First' : 
                 loadingCities ? 'Loading cities...' : 
                 'Select City'}
              </option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderDurationStep = () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear + 1];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-gray-600">When is your special day?</p>
        </div>
        
        {/* Year Selection */}
        {formData.dateTime !== 'not-confirmed' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">📅 Select Year</label>
          <div className="flex gap-4">
            {years.map(year => (
              <button
                key={year}
                type="button"
                onClick={() => {
                  setSelectedYear(selectedYear === year ? null : year);
                  if (selectedYear === year) {
                    setSelectedMonth(null);
                    handleInputChange('dateTime', '');
                  }
                }}
                className={`flex-1 py-3 px-6 rounded-xl border-2 font-medium transition-all ${
                  selectedYear === year
                    ? 'border-[#C4A661] bg-[#C4A661] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-[#C4A661]'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Month Selection */}
        {formData.dateTime !== 'not-confirmed' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">🗓️ Select Month</label>
          <select
            value={selectedMonth !== null ? selectedMonth.toString() : ''}
            onChange={(e) => {
              if (!selectedYear) return;
              
              const monthIndex = e.target.value ? parseInt(e.target.value) : null;
              setSelectedMonth(monthIndex);
              
              if (monthIndex !== null) {
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                
                // Prevent selecting past months in current year
                if (selectedYear === currentYear && monthIndex < currentMonth) {
                  return;
                }
                
                // Clear selected date when month changes
                setSelectedDate('');
                // Clear dateTime when month changes
                handleInputChange('dateTime', '');
              }
            }}
            disabled={!selectedYear}
            className="w-full py-3 px-4 rounded-xl border-2 border-gray-300 focus:border-[#C4A661] focus:ring-2 focus:ring-[#C4A661] focus:ring-opacity-20 transition-all disabled:opacity-50"
          >
            <option value="">{!selectedYear ? 'Select Year First' : 'Select month'}</option>
            {months.map((month, index) => {
              const currentMonth = new Date().getMonth();
              const currentYear = new Date().getFullYear();
              const isPastMonth = selectedYear === currentYear && index < currentMonth;
              
              return (
                <option key={month} value={index} disabled={isPastMonth}>
                  {month}
                </option>
              );
            })}
          </select>
        </div>
        )}

        {/* Date Selection */}
        {formData.dateTime !== 'not-confirmed' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">📆 Select Date (Optional)</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              if (e.target.value && selectedYear && selectedMonth !== null) {
                const time = formData.dateTime ? formData.dateTime.split('T')[1] || '12:00' : '12:00';
                handleInputChange('dateTime', `${e.target.value}T${time}`);
              }
            }}
            disabled={!selectedYear || selectedMonth === null}
            min={new Date().toISOString().split('T')[0]}
            max={selectedYear && selectedMonth !== null ? `${selectedYear}-12-31` : undefined}
            className="w-full py-3 px-4 rounded-xl border-2 border-gray-300 focus:border-[#C4A661] focus:ring-2 focus:ring-[#C4A661] focus:ring-opacity-20 transition-all disabled:opacity-50"
            onFocus={(e) => {
              if (selectedYear && selectedMonth !== null) {
                const monthStr = (selectedMonth + 1).toString().padStart(2, '0');
                const defaultDate = `${selectedYear}-${monthStr}-01`;
                if (!selectedDate) {
                  e.target.value = defaultDate;
                }
              }
            }}
          />
          <p className="text-xs text-gray-500 mt-2">*We will consider 2 days if a date isn't selected</p>
        </div>
        )}

        {/* OR Divider */}
        {formData.dateTime !== 'not-confirmed' && (
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
        )}

        {/* Date Not Confirmed */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.dateTime === 'not-confirmed'}
              onChange={(e) => {
                if (e.target.checked) {
                  handleInputChange('dateTime', 'not-confirmed');
                  setSelectedYear(null);
                  setSelectedMonth(null);
                  setSelectedDate('');
                } else {
                  handleInputChange('dateTime', '');
                }
              }}
              className="w-5 h-5 text-[#C4A661] border-2 border-gray-300 rounded focus:ring-[#C4A661] focus:ring-2"
            />
            <span className="text-gray-700">The {subsection?.name.toLowerCase()} date isn't confirmed yet</span>
          </label>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">⏰ Event Duration *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['2-3 hours', '4-6 hours', '1 day', '2-3 days', '1 week', 'Custom'].map(duration => (
              <button
                key={duration}
                type="button"
                onClick={() => handleInputChange('duration', duration)}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                  formData.duration === duration
                    ? 'border-[#C4A661] bg-[#C4A661] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-[#C4A661]'
                }`}
              >
                {duration}
              </button>
            ))}
          </div>
          {formData.duration === 'Custom' && (
            <input
              type="text"
              value={formData.customDuration || ''}
              onChange={(e) => handleInputChange('customDuration', e.target.value)}
              placeholder="Enter custom duration"
              className="w-full mt-3 py-3 px-4 rounded-xl border-2 border-gray-300 focus:border-[#C4A661] focus:ring-2 focus:ring-[#C4A661] focus:ring-opacity-20 transition-all"
            />
          )}
          {errors.duration && (
            <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
          )}
        </div>
      </div>
    );
  };

  const renderBudgetStep = () => {
    const budgetRanges = [
      { value: 50000, label: 'Under ₹50,000', icon: '💰' },
      { value: 100000, label: '₹50,000 - ₹1,00,000', icon: '💵' },
      { value: 200000, label: '₹1,00,000 - ₹2,00,000', icon: '💸' },
      { value: 500000, label: '₹2,00,000 - ₹5,00,000', icon: '💎' },
      { value: 1000000, label: '₹5,00,000 - ₹10,00,000', icon: '👑' },
      { value: 0, label: 'Custom Budget', icon: '✏️' }
    ];
    
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-gray-600">What's your budget range?</p>
        </div>
        
        {/* Budget Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">💰 Budget Range *</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {budgetRanges.map(range => (
              <button
                key={range.value}
                type="button"
                onClick={() => {
                  if (range.value === 0) {
                    setIsCustomBudget(true);
                    handleInputChange('budget', formData.budget === 0 ? 0 : 0);
                  } else {
                    setIsCustomBudget(false);
                    handleInputChange('budget', formData.budget === range.value ? 0 : range.value);
                  }
                }}
                className={`p-4 text-left rounded-xl border-2 font-medium transition-all hover:scale-105 ${
                  (range.value !== 0 && formData.budget === range.value) || (range.value === 0 && isCustomBudget)
                    ? 'border-[#C4A661] bg-[#C4A661] text-white shadow-lg'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-[#C4A661] hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{range.icon}</span>
                  <span>{range.label}</span>
                </div>
              </button>
            ))}
          </div>
          {isCustomBudget && (
            <input
              type="number"
              value={formData.budget || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 0 || e.target.value === '') {
                  handleInputChange('budget', value || 0);
                }
              }}
              placeholder="Enter your custom budget"
              className="w-full mt-3 py-3 px-4 rounded-xl border-2 border-gray-300 focus:border-[#C4A661] focus:ring-2 focus:ring-[#C4A661] focus:ring-opacity-20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="1"
            />
          )}
          {errors.budget && (
            <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
          )}
        </div>
      </div>
    );
  };

  // Debug traditions state
  useEffect(() => {
    console.log('Traditions state updated:', traditions.length, 'items:', traditions);
  }, [traditions]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Sync venue and vendor selections between state and form data
  useEffect(() => {
    if (formData.selectedVenueTypes && formData.selectedVenueTypes.length > 0 && selectedVenueTypes.length === 0) {
      setSelectedVenueTypes(formData.selectedVenueTypes);
      console.log('Syncing venue types from formData to state:', formData.selectedVenueTypes);
    }
    if (formData.selectedVendorServices && formData.selectedVendorServices.length > 0 && selectedVendorServices.length === 0) {
      setSelectedVendorServices(formData.selectedVendorServices);
      console.log('Syncing vendor services from formData to state:', formData.selectedVendorServices);
    }
  }, [formData.selectedVenueTypes, formData.selectedVendorServices, selectedVenueTypes.length, selectedVendorServices.length]);

  // Update form data when state changes
  useEffect(() => {
    if (selectedVenueTypes.length > 0 && (!formData.selectedVenueTypes || formData.selectedVenueTypes.length === 0)) {
      handleInputChange('selectedVenueTypes', selectedVenueTypes);
      console.log('Updating formData with venue types from state:', selectedVenueTypes);
    }
  }, [selectedVenueTypes]);

  useEffect(() => {
    if (selectedVendorServices.length > 0 && (!formData.selectedVendorServices || formData.selectedVendorServices.length === 0)) {
      handleInputChange('selectedVendorServices', selectedVendorServices);
      console.log('Updating formData with vendor services from state:', selectedVendorServices);
    }
  }, [selectedVendorServices]);

  const getVenueTypesForEvent = () => {
    const eventName = subsection?.name || '';
    
    // Comprehensive venue mapping for all 138+ events
    const eventVenueMapping: Record<string, string[]> = {
      // Corporate Events
      'conference': ['hotel', 'conference_centre', 'conference_center', 'banquet_hall', 'community_centre', 'commercial'],
      'seminar': ['hotel', 'conference_centre', 'library', 'school', 'college', 'training'],
      'corporate-party': ['hotel', 'banquet_hall', 'resort', 'restaurant', 'rooftop', 'events_venue'],
      'award-ceremony': ['hotel', 'banquet_hall', 'theatre', 'conference_centre', 'events_venue'],
      'product-launch': ['hotel', 'conference_centre', 'commercial', 'events_venue', 'cinema'],
      'trade-show': ['commercial', 'conference_centre', 'events_venue', 'marketplace'],
      'networking-mixer': ['hotel', 'restaurant', 'bar', 'pub', 'events_venue'],
      'webinar': ['hotel', 'conference_centre', 'library', 'training'],
      'leadership-summit': ['hotel', 'conference_centre', 'resort', 'banquet_hall'],
      'hackathon': ['college', 'commercial', 'conference_centre', 'training'],
      'investor-meetup': ['hotel', 'conference_centre', 'commercial', 'restaurant'],
      'career-expo': ['commercial', 'conference_centre', 'college', 'community_centre'],
      'industry-roundtable': ['hotel', 'conference_centre', 'restaurant', 'commercial'],
      'press-conference': ['hotel', 'conference_centre', 'civic', 'commercial'],
      
      // Social Events
      'wedding': ['banquet_hall', 'marriage_hall', 'resort', 'hotel', 'garden', 'palace'],
      'engagement': ['banquet_hall', 'hotel', 'restaurant', 'garden', 'events_venue'],
      'birthday': ['banquet_hall', 'restaurant', 'community_centre', 'apartment', 'garden'],
      'anniversary': ['restaurant', 'hotel', 'banquet_hall', 'resort', 'events_venue'],
      'baby-shower': ['restaurant', 'community_centre', 'apartment', 'banquet_hall'],
      'housewarming': ['apartment', 'community_centre', 'restaurant', 'banquet_hall'],
      'bachelor-party': ['nightclub', 'bar', 'pub', 'resort', 'restaurant'],
      'retirement': ['restaurant', 'banquet_hall', 'community_centre', 'hotel'],
      'farewell': ['restaurant', 'banquet_hall', 'community_centre', 'hotel'],
      'graduation-party': ['banquet_hall', 'restaurant', 'community_centre', 'college'],
      'kitty-party': ['restaurant', 'apartment', 'community_centre', 'cafe'],
      'pre-wedding-bash': ['banquet_hall', 'resort', 'hotel', 'restaurant'],
      'bridal-shower': ['restaurant', 'banquet_hall', 'community_centre', 'apartment'],
      'gender-reveal-party': ['restaurant', 'banquet_hall', 'community_centre', 'apartment'],
      'friendship-day-event': ['restaurant', 'cafe', 'community_centre', 'apartment'],
      'valentines-day-celebration': ['restaurant', 'hotel', 'resort', 'cafe'],
      'adoption-celebration': ['restaurant', 'community_centre', 'banquet_hall', 'apartment'],
      
      // Cultural Events
      'cultural-fair': ['outdoor_venue', 'park', 'community_centre', 'open_ground', 'marketplace'],
      'naming-ceremony': ['community_centre', 'banquet_hall', 'apartment', 'restaurant'],
      'music-concert': ['theatre', 'stadium', 'outdoor_venue', 'arts_centre', 'auditorium'],
      'book-launch': ['library', 'cafe', 'restaurant', 'community_centre', 'arts_centre'],
      'heritage-walk': ['outdoor_venue', 'museum', 'park', 'public'],
      'food-festival': ['outdoor_venue', 'marketplace', 'food_court', 'park', 'community_centre'],
      'cultural-exchange': ['community_centre', 'conference_centre', 'library', 'arts_centre'],
      'language-festival': ['community_centre', 'library', 'school', 'arts_centre'],
      'handicraft-exhibition': ['arts_centre', 'community_centre', 'marketplace', 'museum'],
      'cultural-parade': ['outdoor_venue', 'public', 'park', 'open_ground'],
      'ethnic-wear-show': ['theatre', 'banquet_hall', 'arts_centre', 'events_venue'],
      'regional-cuisine-fest': ['outdoor_venue', 'marketplace', 'food_court', 'community_centre'],
      'cultural-documentary-screening': ['cinema', 'library', 'community_centre', 'arts_centre'],
      
      // Religious Events
      'mass-gathering': ['outdoor_venue', 'stadium', 'community_centre', 'public'],
      'interfaith-gathering': ['community_centre', 'conference_centre', 'library', 'civic'],
      'religious-seminar': ['community_centre', 'conference_centre', 'library', 'temple'],
      'puja-ceremony': ['temple', 'community_centre', 'banquet_hall', 'apartment'],
      'kirtan': ['temple', 'community_centre', 'banquet_hall', 'music_school'],
      'satsang': ['temple', 'community_centre', 'library', 'yoga'],
      'religious-discourse': ['temple', 'community_centre', 'conference_centre', 'library'],
      'temple-inauguration': ['temple', 'outdoor_venue', 'community_centre', 'public'],
      'religious-procession': ['outdoor_venue', 'public', 'park', 'open_ground'],
      'prayer-meeting': ['temple', 'community_centre', 'library', 'apartment'],
      'community-service': ['community_centre', 'outdoor_venue', 'park', 'public'],
      'pilgrimage-tour': ['outdoor_venue', 'temple', 'tourist_attraction', 'hotel'],
      'blessing-ceremony': ['temple', 'community_centre', 'banquet_hall', 'apartment'],
      'sacred-thread-ceremony': ['temple', 'community_centre', 'banquet_hall', 'apartment'],
      
      // Festival Events
      'diwali-celebration': ['community_centre', 'banquet_hall', 'outdoor_venue', 'temple'],
      'holi-festival': ['outdoor_venue', 'park', 'open_ground', 'community_centre'],
      'eid-al-fitr': ['community_centre', 'banquet_hall', 'outdoor_venue', 'mosque'],
      'eid-al-adha': ['community_centre', 'banquet_hall', 'outdoor_venue', 'mosque'],
      'christmas-celebration': ['community_centre', 'banquet_hall', 'church', 'restaurant'],
      'new-years-party': ['hotel', 'nightclub', 'bar', 'resort', 'rooftop'],
      'navratri-garba': ['outdoor_venue', 'community_centre', 'banquet_hall', 'open_ground'],
      'ganesh-chaturthi': ['outdoor_venue', 'community_centre', 'temple', 'public'],
      'raksha-bandhan': ['community_centre', 'banquet_hall', 'apartment', 'temple'],
      'janmashtami': ['temple', 'community_centre', 'outdoor_venue', 'banquet_hall'],
      'onam': ['community_centre', 'banquet_hall', 'outdoor_venue', 'restaurant'],
      'durga-puja': ['outdoor_venue', 'community_centre', 'temple', 'public'],
      'baisakhi': ['outdoor_venue', 'community_centre', 'gurdwara', 'banquet_hall'],
      'gurupurab': ['gurdwara', 'community_centre', 'outdoor_venue', 'banquet_hall'],
      'makar-sankranti': ['outdoor_venue', 'park', 'rooftop', 'community_centre'],
      'easter-celebration': ['church', 'community_centre', 'banquet_hall', 'restaurant'],
      
      // Political Events
      'charity-event': ['banquet_hall', 'hotel', 'community_centre', 'conference_centre'],
      'political-rally': ['outdoor_venue', 'stadium', 'public', 'open_ground'],
      'election-campaign': ['outdoor_venue', 'community_centre', 'public', 'townhall'],
      'political-conference': ['conference_centre', 'hotel', 'civic', 'townhall'],
      'party-convention': ['conference_centre', 'hotel', 'civic', 'banquet_hall'],
      'swearing-in-ceremony': ['courthouse', 'civic', 'townhall', 'conference_centre'],
      'political-summit': ['conference_centre', 'hotel', 'civic', 'resort'],
      'community-town-hall': ['townhall', 'community_centre', 'civic', 'library'],
      
      // Sports Events
      'sports-tournament': ['stadium', 'sports_centre', 'outdoor_venue', 'swimming_pool'],
      'marathon-run': ['outdoor_venue', 'stadium', 'park', 'public'],
      'adventure-camp': ['outdoor_venue', 'forest', 'park', 'resort'],
      'cycling-event': ['outdoor_venue', 'park', 'stadium', 'public'],
      'sports-day': ['stadium', 'sports_centre', 'school', 'outdoor_venue'],
      
      // Educational Events
      'workshop': ['conference_centre', 'library', 'school', 'college', 'training'],
      'lecture-series': ['library', 'school', 'college', 'conference_centre'],
      'school-annual-day': ['school', 'theatre', 'community_centre', 'auditorium'],
      'science-fair': ['school', 'college', 'conference_centre', 'museum'],
      'academic-symposium': ['college', 'conference_centre', 'library', 'research_institute'],
      'research-conference': ['college', 'conference_centre', 'research_institute', 'hotel'],
      'debate-competition': ['school', 'college', 'library', 'community_centre'],
      'quiz-contest': ['school', 'college', 'community_centre', 'library'],
      'literary-festival': ['library', 'arts_centre', 'community_centre', 'college'],
      
      // Health Events
      'health-camp': ['community_centre', 'clinic', 'hospital', 'school'],
      'mental-health-awareness-event': ['community_centre', 'clinic', 'conference_centre', 'library'],
      'fitness-bootcamp': ['fitness_centre', 'sports_centre', 'outdoor_venue', 'park'],
      'health-fair': ['community_centre', 'clinic', 'hospital', 'conference_centre'],
      'blood-donation-drive': ['community_centre', 'hospital', 'clinic', 'school'],
      'health-screening': ['clinic', 'hospital', 'community_centre', 'school'],
      'medical-conference': ['hospital', 'conference_centre', 'hotel', 'clinic'],
      'vaccination-drive': ['hospital', 'clinic', 'community_centre', 'school'],
      'health-awareness-campaign': ['community_centre', 'hospital', 'clinic', 'public'],
      
      // Environmental Events
      'tree-planting-drive': ['outdoor_venue', 'park', 'forest', 'farmland', 'open_ground'],
      'eco-festival': ['outdoor_venue', 'park', 'community_centre', 'open_ground'],
      'clean-up-drive': ['outdoor_venue', 'park', 'public', 'recycling', 'open_ground'],
      'environmental-awareness-campaign': ['outdoor_venue', 'community_centre', 'park', 'public'],
      'green-living-expo': ['outdoor_venue', 'community_centre', 'conference_centre', 'park'],
      
      // Virtual Events
      'online-webinar': ['hotel', 'conference_centre', 'library', 'training'],
      'virtual-conference': ['hotel', 'conference_centre', 'commercial', 'studio'],
      'live-stream-party': ['studio', 'hotel', 'events_venue', 'nightclub'],
      'virtual-team-building-event': ['hotel', 'conference_centre', 'commercial', 'training'],
      'online-product-launch': ['studio', 'commercial', 'conference_centre', 'hotel'],
      'virtual-charity-auction': ['hotel', 'conference_centre', 'studio', 'commercial'],
      'hybrid-festival-celebration': ['community_centre', 'conference_centre', 'hotel', 'events_venue'],
      
      // Entertainment Events
      'dance-performance': ['theatre', 'dance', 'arts_centre', 'community_centre'],
      'comedy-show': ['theatre', 'bar', 'pub', 'community_centre'],
      'theater-play': ['theatre', 'arts_centre', 'community_centre', 'auditorium'],
      'fashion-show': ['theatre', 'hotel', 'arts_centre', 'events_venue'],
      'magic-show': ['theatre', 'community_centre', 'restaurant', 'events_venue'],
      'storytelling-session': ['library', 'community_centre', 'cafe', 'arts_centre'],
      'karaoke-night': ['bar', 'pub', 'restaurant', 'nightclub'],
      'open-mic-night': ['bar', 'pub', 'cafe', 'community_centre'],
      'film-screening': ['cinema', 'library', 'community_centre', 'arts_centre'],
      'poetry-reading': ['library', 'cafe', 'arts_centre', 'community_centre'],
      'celebrity-meet-greet': ['hotel', 'theatre', 'events_venue', 'conference_centre'],
      
      // Community Events
      'neighborhood-gathering': ['community_centre', 'park', 'apartment', 'social_centre'],
      'volunteer-appreciation': ['community_centre', 'banquet_hall', 'restaurant', 'hotel'],
      'fundraising-gala': ['banquet_hall', 'hotel', 'conference_centre', 'events_venue'],
      'community-festival': ['outdoor_venue', 'community_centre', 'park', 'public'],
      'senior-citizen-program': ['community_centre', 'social_centre', 'library', 'clinic'],
      'youth-development-program': ['community_centre', 'school', 'college', 'social_centre']
    };
    
    // All venue types with icons and descriptions
    const allVenueTypes = [
      { id: 'hotel', name: 'Hotel', icon: '🏨', description: 'Hotel venues' },
      { id: 'banquet_hall', name: 'Banquet Hall', icon: '🏛️', description: 'Traditional banquet halls' },
      { id: 'marriage_hall', name: 'Marriage Hall', icon: '💒', description: 'Wedding venues' },
      { id: 'resort', name: 'Resort', icon: '🏖️', description: 'Resort destinations' },
      { id: 'guest_house', name: 'Guest House', icon: '🏠', description: 'Guest house venues' },
      { id: 'community_centre', name: 'Community Centre', icon: '🏢', description: 'Community venues' },
      { id: 'events_venue', name: 'Events Venue', icon: '🎪', description: 'Dedicated event spaces' },
      { id: 'conference_centre', name: 'Conference Centre', icon: '🏛️', description: 'Conference facilities' },
      { id: 'conference_center', name: 'Conference Center', icon: '🏛️', description: 'Conference centers' },
      { id: 'theatre', name: 'Theatre', icon: '🎭', description: 'Theatre venues' },
      { id: 'stadium', name: 'Stadium', icon: '🏟️', description: 'Sports stadiums' },
      { id: 'sports_centre', name: 'Sports Centre', icon: '⚽', description: 'Sports facilities' },
      { id: 'swimming_pool', name: 'Swimming Pool', icon: '🏊', description: 'Pool venues' },
      { id: 'golf_course', name: 'Golf Course', icon: '⛳', description: 'Golf venues' },
      { id: 'fitness_centre', name: 'Fitness Centre', icon: '💪', description: 'Fitness facilities' },
      { id: 'arts_centre', name: 'Arts Centre', icon: '🎨', description: 'Arts venues' },
      { id: 'cinema', name: 'Cinema', icon: '🎬', description: 'Cinema halls' },
      { id: 'restaurant', name: 'Restaurant', icon: '🍽️', description: 'Restaurant venues' },
      { id: 'cafe', name: 'Cafe', icon: '☕', description: 'Cafe venues' },
      { id: 'nightclub', name: 'Nightclub', icon: '🍸', description: 'Nightclub venues' },
      { id: 'bar', name: 'Bar', icon: '🍺', description: 'Bar venues' },
      { id: 'pub', name: 'Pub', icon: '🍻', description: 'Pub venues' },
      { id: 'fast_food', name: 'Fast Food', icon: '🍔', description: 'Fast food venues' },
      { id: 'apartment', name: 'Apartment', icon: '🏠', description: 'Apartment venues' },
      { id: 'hostel', name: 'Hostel', icon: '🏨', description: 'Hostel venues' },
      { id: 'motel', name: 'Motel', icon: '🏨', description: 'Motel venues' },
      { id: 'townhall', name: 'Town Hall', icon: '🏛️', description: 'Town hall venues' },
      { id: 'public', name: 'Public Venue', icon: '🏛️', description: 'Public venues' },
      { id: 'civic', name: 'Civic Centre', icon: '🏛️', description: 'Civic venues' },
      { id: 'courthouse', name: 'Courthouse', icon: '⚖️', description: 'Court venues' },
      { id: 'library', name: 'Library', icon: '📚', description: 'Library venues' },
      { id: 'school', name: 'School', icon: '🏫', description: 'School venues' },
      { id: 'college', name: 'College', icon: '🎓', description: 'College venues' },
      { id: 'museum', name: 'Museum', icon: '🏛️', description: 'Museum venues' },
      { id: 'dance', name: 'Dance Studio', icon: '💃', description: 'Dance venues' },
      { id: 'music_school', name: 'Music School', icon: '🎵', description: 'Music venues' },
      { id: 'studio', name: 'Studio', icon: '🎬', description: 'Studio venues' },
      { id: 'social_centre', name: 'Social Centre', icon: '👥', description: 'Social venues' },
      { id: 'community_center', name: 'Community Center', icon: '🏢', description: 'Community centers' },
      { id: 'commercial', name: 'Commercial Space', icon: '🏢', description: 'Commercial venues' },
      { id: 'marketplace', name: 'Marketplace', icon: '🛒', description: 'Market venues' },
      { id: 'food_court', name: 'Food Court', icon: '🍽️', description: 'Food court venues' },
      { id: 'bowling_alley', name: 'Bowling Alley', icon: '🎳', description: 'Bowling venues' },
      { id: 'trampoline_park', name: 'Trampoline Park', icon: '🤸', description: 'Trampoline venues' },
      { id: 'attraction', name: 'Tourist Attraction', icon: '🎡', description: 'Tourist venues' },
      { id: 'bank', name: 'Bank', icon: '🏦', description: 'Bank venues' },
      { id: 'clinic', name: 'Clinic', icon: '🏥', description: 'Medical venues' },
      { id: 'hospital', name: 'Hospital', icon: '🏥', description: 'Hospital venues' },
      { id: 'pharmacy', name: 'Pharmacy', icon: '💊', description: 'Pharmacy venues' },
      { id: 'dentist', name: 'Dental Clinic', icon: '🦷', description: 'Dental venues' },
      { id: 'police', name: 'Police Station', icon: '👮', description: 'Police venues' },
      { id: 'post_office', name: 'Post Office', icon: '📮', description: 'Postal venues' },
      { id: 'fuel', name: 'Fuel Station', icon: '⛽', description: 'Fuel stations' },
      { id: 'bus_station', name: 'Bus Station', icon: '🚌', description: 'Transport venues' },
      { id: 'public_building', name: 'Public Building', icon: '🏛️', description: 'Government venues' },
      { id: 'recycling', name: 'Recycling Center', icon: '♻️', description: 'Environmental venues' },
      { id: 'training', name: 'Training Center', icon: '📚', description: 'Training venues' },
      { id: 'yoga', name: 'Yoga Center', icon: '🧘', description: 'Yoga venues' },
      { id: 'internet_cafe', name: 'Internet Cafe', icon: '💻', description: 'Internet venues' },
      { id: 'research_institute', name: 'Research Institute', icon: '🔬', description: 'Research venues' },
      { id: 'outdoor_venue', name: 'Outdoor Venue', icon: '🌲', description: 'Open air outdoor spaces' },
      { id: 'park', name: 'Park', icon: '🌳', description: 'Public parks' },
      { id: 'garden', name: 'Garden Venue', icon: '🌿', description: 'Garden spaces' },
      { id: 'forest', name: 'Forest Area', icon: '🌲', description: 'Forest locations' },
      { id: 'farmland', name: 'Farmland', icon: '🚜', description: 'Agricultural land' },
      { id: 'open_ground', name: 'Open Ground', icon: '🏞️', description: 'Open field spaces' },
      { id: 'rooftop', name: 'Rooftop Venue', icon: '🏢', description: 'Rooftop spaces' },
      { id: 'auditorium', name: 'Auditorium', icon: '🎭', description: 'Large auditoriums' },
      { id: 'temple', name: 'Temple', icon: '🕉️', description: 'Religious temples' },
      { id: 'church', name: 'Church', icon: '⛪', description: 'Christian churches' },
      { id: 'mosque', name: 'Mosque', icon: '🕌', description: 'Islamic mosques' },
      { id: 'gurdwara', name: 'Gurdwara', icon: '🕉️', description: 'Sikh gurdwaras' },
      { id: 'palace', name: 'Palace', icon: '🏰', description: 'Heritage palaces' }
    ];
    
    // Get venue types for the current event
    const eventVenueIds = eventVenueMapping[subsectionId] || [];
    const filteredVenues = allVenueTypes.filter(venue => eventVenueIds.includes(venue.id));
    
    // If no specific matches, return popular venue types
    if (filteredVenues.length === 0) {
      return [
        { id: 'banquet_hall', name: 'Banquet Hall', icon: '🏛️', description: 'Traditional banquet halls' },
        { id: 'hotel', name: 'Hotel', icon: '🏨', description: 'Hotel venues' },
        { id: 'community_centre', name: 'Community Centre', icon: '🏢', description: 'Community venues' },
        { id: 'outdoor_venue', name: 'Outdoor Venue', icon: '🌲', description: 'Open air outdoor spaces' }
      ];
    }
    
    return filteredVenues;
  };

  const renderVenuesStep = () => {
    const venueTypes = getVenueTypesForEvent();
    
    const toggleVenueType = (venueId: string) => {
      const newVenueTypes = selectedVenueTypes.includes(venueId) 
        ? selectedVenueTypes.filter(id => id !== venueId)
        : [...selectedVenueTypes, venueId];
      
      setSelectedVenueTypes(newVenueTypes);
      handleInputChange('selectedVenueTypes', newVenueTypes);
      console.log('Venue type toggled:', venueId, 'New selection:', newVenueTypes);
    };
    
    return (
      <div className="text-center space-y-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">🏛️ Find Perfect Venues</h2>
          <p className="text-lg text-gray-600 mb-6">
            Browse amazing venues {formData.city && formData.state ? (
              <>in <span className="font-semibold text-violet-600">{formData.city}, {formData.state}</span></>
            ) : (
              'for your event'
            )}
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">🏛️ Venue Types</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {venueTypes.map(venue => (
                <button
                  key={venue.id}
                  onClick={() => toggleVenueType(venue.id)}
                  className={`p-4 rounded-xl text-center transition-all border-2 ${
                    selectedVenueTypes.includes(venue.id)
                      ? 'border-[#C4A661] bg-[#C4A661] text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-[#C4A661]'
                  }`}
                >
                  <div className="text-2xl mb-2">{venue.icon}</div>
                  <div className="text-sm font-medium">{venue.name}</div>
                  <div className="text-xs mt-1 opacity-75">{venue.description}</div>
                </button>
              ))}
            </div>
          </div>
          
          {selectedVenueTypes.length > 0 && (
            <div className="mb-6 p-4 bg-white rounded-lg border border-purple-300">
              <h4 className="font-medium text-gray-900 mb-2">Selected Venue Types ({selectedVenueTypes.length})</h4>
              <div className="flex flex-wrap gap-2">
                {selectedVenueTypes.map(venueId => {
                  const venue = venueTypes.find(v => v.id === venueId);
                  return venue ? (
                    <span key={venueId} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {venue.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                // Ensure venue types are properly stored before continuing
                const finalVenueTypes = selectedVenueTypes.length > 0 ? selectedVenueTypes : formData.selectedVenueTypes || [];
                handleInputChange('selectedVenueTypes', finalVenueTypes);
                setSelectedVenueTypes(finalVenueTypes);
                console.log('Continue to vendors - storing venue types:', finalVenueTypes);
                setCurrentStep('vendors');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-[#C4A661] to-[#B8941A] hover:from-[#B8941A] hover:to-[#A67C00] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Continue to Vendors ({selectedVenueTypes.length} selected)
            </button>
            <button
              onClick={async () => {
                console.log('Skip venues button clicked - selectedVenueTypes:', selectedVenueTypes);
                console.log('Current formData before submit:', formData);
                
                try {
                  // Ensure venue types are stored in form data and state
                  const updatedFormData = {
                    ...formData,
                    selectedVenueTypes: selectedVenueTypes.length > 0 ? selectedVenueTypes : formData.selectedVenueTypes || [],
                    selectedVendorServices: [] // Empty since we're skipping vendors
                  };
                  
                  // Update both form data and input change to ensure persistence
                  setFormData(updatedFormData);
                  handleInputChange('selectedVenueTypes', updatedFormData.selectedVenueTypes);
                  handleInputChange('selectedVendorServices', []);
                  
                  console.log('Updated form data with venues:', updatedFormData);
                  console.log('Final selectedVenueTypes:', updatedFormData.selectedVenueTypes);
                  console.log('Authentication check:', {
                    hasAccessToken: !!localStorage.getItem('access_token'),
                    hasSessionToken: !!sessionStorage.getItem('access_token'),
                    tokenPreview: localStorage.getItem('access_token')?.substring(0, 20)
                  });
                  
                  // Wait a moment for state to update
                  setTimeout(async () => {
                    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                    await handleSubmit(fakeEvent);
                  }, 200);
                } catch (error: unknown) {
                  console.error('Skip venues error:', error);
                  alert(`Error creating event: ${error instanceof Error ? error.message : String(error)}`);
                }
              }}
              disabled={isSubmitting}
              className="border-2 border-gray-300 hover:border-[#C4A661] text-gray-700 hover:text-[#C4A661] px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Creating...' : 'Create Event Now'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const loadTraditions = async () => {
    console.log('loadTraditions called for subsectionId:', subsectionId);
    setLoadingTraditions(true);
    try {
      const { apiService } = await import('../services/api');
      const traditionsData = await apiService.getTraditionStyles(subsectionId);
      console.log('API returned traditions for', subsectionId, ':', traditionsData);
      
      if (traditionsData && traditionsData.length > 0) {
        setTraditions(traditionsData);
      } else {
        setTraditions(getFallbackTraditions());
      }
    } catch (error) {
      console.warn('Failed to load traditions from API, using fallback:', error);
      setTraditions(getFallbackTraditions());
    } finally {
      setLoadingTraditions(false);
    }
  };

  const getFallbackTraditions = () => {
    // Event-specific traditions based on event type
    const eventTraditions: Record<string, any[]> = {
      'social': [
        { id: 1, style_name: 'Traditional', description: 'Classic cultural style with heritage elements' },
        { id: 2, style_name: 'Modern', description: 'Contemporary approach with sleek design' },
        { id: 3, style_name: 'Fusion', description: 'Perfect blend of traditional & modern' },
        { id: 4, style_name: 'Elegant', description: 'Sophisticated and refined style' },
        { id: 5, style_name: 'Rustic', description: 'Natural and earthy with vintage charm' },
        { id: 6, style_name: 'Luxury', description: 'Premium and lavish celebration' }
      ],
      'cultural': [
        { id: 1, style_name: 'Traditional', description: 'Authentic cultural heritage style' },
        { id: 2, style_name: 'Regional', description: 'Local cultural traditions and customs' },
        { id: 3, style_name: 'Folk', description: 'Traditional folk art and customs' },
        { id: 4, style_name: 'Contemporary', description: 'Modern interpretation of culture' },
        { id: 5, style_name: 'Ethnic', description: 'Rich ethnic traditions and colors' },
        { id: 6, style_name: 'Heritage', description: 'Historical and ancestral styles' }
      ],
      'religious': [
        { id: 1, style_name: 'Traditional', description: 'Sacred traditional ceremonies' },
        { id: 2, style_name: 'Spiritual', description: 'Peaceful and meditative atmosphere' },
        { id: 3, style_name: 'Devotional', description: 'Deep devotional and pious style' },
        { id: 4, style_name: 'Simple', description: 'Minimalist and pure approach' },
        { id: 5, style_name: 'Grand', description: 'Elaborate religious celebrations' },
        { id: 6, style_name: 'Community', description: 'Inclusive community gathering style' }
      ],
      'festival': [
        { id: 1, style_name: 'Traditional', description: 'Classic festival celebrations' },
        { id: 2, style_name: 'Vibrant', description: 'Colorful and energetic festivities' },
        { id: 3, style_name: 'Community', description: 'Large community celebrations' },
        { id: 4, style_name: 'Family', description: 'Intimate family-style festivities' },
        { id: 5, style_name: 'Modern', description: 'Contemporary festival celebrations' },
        { id: 6, style_name: 'Grand', description: 'Large-scale festival events' }
      ],
      'corporate': [
        { id: 1, style_name: 'Professional', description: 'Formal business atmosphere' },
        { id: 2, style_name: 'Modern', description: 'Contemporary corporate style' },
        { id: 3, style_name: 'Elegant', description: 'Sophisticated business events' },
        { id: 4, style_name: 'Casual', description: 'Relaxed corporate gathering' },
        { id: 5, style_name: 'Luxury', description: 'Premium corporate events' },
        { id: 6, style_name: 'Minimalist', description: 'Clean and simple design' }
      ]
    };
    
    // Return traditions based on section, or default if not found
    return eventTraditions[sectionId] || [
      { id: 1, style_name: 'Traditional', description: 'Classic style with heritage elements' },
      { id: 2, style_name: 'Modern', description: 'Contemporary approach' },
      { id: 3, style_name: 'Fusion', description: 'Mix of traditional & modern' },
      { id: 4, style_name: 'Elegant', description: 'Sophisticated and refined' },
      { id: 5, style_name: 'Luxury', description: 'Premium and lavish' },
      { id: 6, style_name: 'Simple', description: 'Clean and minimalist' }
    ];
  };

  const renderTraditionStep = () => {
    const getStyleIcon = (styleName: string) => {
      const icons: Record<string, string> = {
        'traditional': '🎭',
        'modern': '✨',
        'fusion': '🌈',
        'minimalist': '🤍',
        'luxury': '💎',
        'rustic': '🌿',
        'classic': '🎭',
        'contemporary': '✨',
        'elegant': '💎',
        'simple': '🤍',
        'professional': '💼',
        'casual': '👔',
        'regional': '🏛️',
        'folk': '🎪',
        'ethnic': '🎨',
        'heritage': '🏺',
        'spiritual': '🕯️',
        'devotional': '🙏',
        'grand': '👑',
        'community': '👥',
        'vibrant': '🌈',
        'family': '👨‍👩‍👧‍👦'
      };
      return icons[styleName.toLowerCase()] || '🎭';
    };
    
    if (loadingTraditions) {
      return (
        <div className="text-center py-8">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-gray-600">Loading tradition styles...</p>
        </div>
      );
    }
    
    if (!traditions || traditions.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <p className="text-yellow-800 mb-4">No tradition styles found for this event type.</p>
            <button
              onClick={() => {
                console.log('Retrying tradition load...');
                loadTraditions();
              }}
              className="bg-[#C4A661] text-white px-4 py-2 rounded-lg hover:bg-[#B8941A] transition-colors"
            >
              Retry Loading
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">🎨</span>
          </div>
          <p className="text-gray-600">Choose your style and tradition</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Tradition & Style</label>
          <p className="text-sm text-gray-600 mb-4">Choose a style that matches your vision for this {subsection?.name.toLowerCase()}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {traditions.filter((style, index, self) => 
              index === self.findIndex(s => s.style_name === style.style_name)
            ).map(style => (
              <button
                key={`${style.id}-${style.style_name}`}
                type="button"
                onClick={() => {
                  const newValue = formData.traditionStyle === style.style_name ? '' : style.style_name;
                  handleInputChange('traditionStyle', newValue);
                }}
                className={`p-4 text-center rounded-xl border-2 font-medium transition-all hover:scale-105 ${
                  formData.traditionStyle === style.style_name
                    ? 'border-[#C4A661] bg-[#C4A661] text-white shadow-lg'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-[#C4A661] hover:shadow-md'
                }`}
              >
                <div className="text-2xl mb-2">{getStyleIcon(style.style_name)}</div>
                <div className="text-sm font-medium">{style.style_name}</div>
                <div className="text-xs mt-1 opacity-75">{style.description}</div>
              </button>
            ))}
          </div>
          
          {formData.traditionStyle && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                ✓ Selected: <span className="font-medium">{formData.traditionStyle}</span>
              </p>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-purple-800 text-sm">
              💡 <strong>Tip:</strong> You can skip this step if you don't have a specific tradition preference.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderFoodStep = () => {
    const foodPreferences = [
      { id: 'vegetarian', name: 'Vegetarian', icon: '🥗' },
      { id: 'non-vegetarian', name: 'Non-Vegetarian', icon: '🍖' },
      { id: 'vegan', name: 'Vegan', icon: '🥬' },
      { id: 'jain', name: 'Jain', icon: '🌿' },
      { id: 'gujarati', name: 'Gujarati', icon: '🍛' },
      { id: 'south-indian', name: 'South Indian', icon: '🍜' },
      { id: 'north-indian', name: 'North Indian', icon: '🍛' },
      { id: 'continental', name: 'Continental', icon: '🍽️' },
      { id: 'chinese', name: 'Chinese', icon: '🥢' }
    ];
    
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">🍽️</span>
          </div>
          <p className="text-gray-600">What are your food preferences?</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">🍽️ Food Preferences</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {foodPreferences.map(pref => (
              <button
                key={pref.id}
                type="button"
                onClick={() => {
                  const current = formData.foodPreferences || [];
                  const updated = current.includes(pref.name)
                    ? current.filter(p => p !== pref.name)
                    : [...current, pref.name];
                  handleInputChange('foodPreferences', updated);
                }}
                className={`p-4 text-center rounded-xl border-2 font-medium transition-all hover:scale-105 ${
                  (formData.foodPreferences || []).includes(pref.name)
                    ? 'border-[#C4A661] bg-[#C4A661] text-white shadow-lg'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-[#C4A661] hover:shadow-md'
                }`}
              >
                <div className="text-2xl mb-2">{pref.icon}</div>
                <div className="text-sm">{pref.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  useEffect(() => {
    if (currentStep === 'requirements') {
      const loadRequirements = async () => {
        setRequirementsLoaded(false);
        try {
          const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
          if (!token) {
            setApiRequirements(getDefaultRequirements());
            setRequirementsLoaded(true);
            return;
          }

          const response = await fetch(`http://localhost:8000/api/events/requirements/?event_id=${subsectionId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const dbRequirements = await response.json();
          
          const grouped = dbRequirements.reduce((acc: Record<string, any[]>, req: any) => {
            if (!acc[req.category_name]) acc[req.category_name] = [];
            acc[req.category_name].push({
              id: req.requirement_id,
              label: req.label,
              category: req.category,
              unit: req.unit,
              placeholder: req.placeholder
            });
            return acc;
          }, {});
          
          setApiRequirements(grouped);
        } catch (error) {
          setApiRequirements(getDefaultRequirements());
        } finally {
          setRequirementsLoaded(true);
        }
      };
      setTimeout(() => loadRequirements(), 50);
    }
    
    if (currentStep === 'tradition') {
      loadTraditions();
    }
    
    if (currentStep === 'vendors') {
      loadVendorServices();
    }
  }, [currentStep, subsectionId, sectionId]);

  // Also load traditions when component mounts if we're on tradition step
  useEffect(() => {
    if (currentStep === 'tradition' && traditions.length === 0) {
      console.log('Component mounted on tradition step, loading traditions...');
      loadTraditions();
    }
  }, []);

  const getDefaultRequirements = () => ({
    'Essential Services': [
      { id: 'basic-decoration', label: 'Basic Decoration', category: 'decoration', unit: 'setups', placeholder: 'How many decoration setups?' },
      { id: 'sound-system', label: 'Sound System', category: 'music_dj' }
    ],
    'Catering Services': [
      { id: 'event-catering', label: 'Event Catering', category: 'catering', unit: 'meals', placeholder: 'How many meals?' },
      { id: 'refreshments', label: 'Refreshments', category: 'catering', unit: 'servings', placeholder: 'How many servings?' }
    ]
  });

  const renderRequirementsStep = () => {
    if (!requirementsLoaded) {
      return (
        <div className="text-center py-8">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-gray-600">Loading requirements...</p>
        </div>
      );
    }

    // Get requirements directly from database via API
    let requirements: Record<string, any[]> = {};
    try {
      const allRequirements = Object.keys(apiRequirements).length > 0 ? apiRequirements : getDefaultRequirements();
      console.log('Database requirements loaded:', allRequirements);
      
      // Filter out Vendor Services and structure the data
      requirements = {};
      Object.entries(allRequirements).forEach(([categoryName, services]) => {
        if (categoryName !== 'Vendor Services') {
          if (Array.isArray(services)) {
            (requirements as Record<string, any[]>)[categoryName] = services;
          }
        }
      });
      
      if (Object.keys(requirements).length === 0) {
        requirements = getDefaultRequirements();
      }
    } catch (error) {
      requirements = getDefaultRequirements();
    }
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">🎯</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Special Requirements</h2>
          <p className="text-gray-600">Select requirements and vendor services for your {subsection?.name.toLowerCase()}</p>
        </div>
        
        {Object.keys(requirements).length === 0 ? (
          <EmptyState
            title="No specific requirements found"
            description="You can add custom requirements below or continue to the next step."
          />
        ) : (
          <div className="space-y-4">
            {Object.entries(requirements).map(([categoryName, services]) => {
              // Ensure services is an array
              const serviceArray = Array.isArray(services) ? services : [];

              if (serviceArray.length === 0) return null;
              
              const isExpanded = expandedCategories.has(categoryName);
              const isSelected = (formData.selectedServices || []).includes(categoryName);
              
              return (
                <div key={categoryName} className="bg-[#FFF9E6] rounded-xl p-6 border border-[#E5D5A3]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span>🎯</span>
                      {categoryName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const current = formData.selectedServices || [];
                          const updated = isSelected
                            ? current.filter(s => s !== categoryName)
                            : [...current, categoryName];
                          handleInputChange('selectedServices', updated);
                        }}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors border ${
                          isSelected
                            ? 'bg-[#C4A661] text-white border-[#C4A661]'
                            : 'bg-white text-gray-700 border-[#C4A661] hover:border-[#B8941A]'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select Service'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCategory(categoryName)}
                        className="px-3 py-2 text-sm bg-[#E5D5A3] text-[#8B7355] rounded-lg hover:bg-[#D4C49A] transition-colors"
                      >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && serviceArray.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#E5D5A3]">
                      {serviceArray.map((service: any) => {
                        if (!service || !service.id || !service.label) return null;
                        
                        const isSubSelected = (formData.specialRequirements || {})[service.id]?.selected || (formData.selectedServices || []).includes(service.label);
                        
                        return (
                          <div key={service.id} className="bg-white rounded-lg p-4 border border-[#E5D5A3]">
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRequirement({ id: service.id, label: service.label });
                                  setShowRequirementModal(true);
                                }}
                                className="flex-1 text-left px-3 py-2 text-sm rounded-lg transition-colors border bg-white text-gray-600 border-[#E5D5A3] hover:border-[#C4A661] hover:bg-gray-50"
                              >
                                {service.label}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isSubSelected) {
                                    const updatedRequirements = { ...formData.specialRequirements };
                                    delete updatedRequirements[service.id];
                                    const updatedServices = (formData.selectedServices || []).filter(s => s !== service.label);
                                    handleInputChange('specialRequirements', updatedRequirements);
                                    handleInputChange('selectedServices', updatedServices);
                                  } else {
                                    setSelectedRequirement({ id: service.id, label: service.label });
                                    setShowRequirementModal(true);
                                  }
                                }}
                                className={`ml-2 px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                                  isSubSelected
                                    ? 'bg-[#C4A661] text-white border border-[#C4A661]'
                                    : 'bg-white text-gray-700 border border-[#C4A661] hover:border-[#B8941A]'
                                }`}
                              >
                                {isSubSelected ? 'Selected' : 'Select'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {isExpanded && serviceArray.length === 0 && (
                    <div className="mt-4 pt-4 border-t border-[#E5D5A3] text-center text-gray-500">
                      No individual services available for this category.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Requirements
          </label>
          <textarea
            value={formData.customRequirements || ''}
            onChange={(e) => handleInputChange('customRequirements', e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
            rows={4}
            placeholder="Any other specific requirements or services you need..."
            maxLength={500}
          />
        </div>
      </div>
    );
  };

  const addTimelineItem = () => {
    const newItem = {
      id: Date.now(),
      time: '',
      activity: '',
      description: ''
    };
    const updatedTimeline = [...(formData.timeline || []), newItem];
    handleInputChange('timeline', updatedTimeline);
  };

  const updateTimelineItem = (id: number, field: string, value: string) => {
    const updatedTimeline = (formData.timeline || []).map((item: any) => 
      item.id === id ? { ...item, [field]: value } : item
    );
    handleInputChange('timeline', updatedTimeline);
  };

  const removeTimelineItem = (id: number) => {
    const updatedTimeline = (formData.timeline || []).filter((item: any) => item.id !== id);
    handleInputChange('timeline', updatedTimeline);
  };

  const renderTimelineStep = () => {
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">⏰</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Timeline</h2>
          <p className="text-gray-600">Plan your event schedule and timing</p>
        </div>
        
        {/* Timeline Builder */}
        <div className="bg-purple-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">⏰ Event Schedule</h3>
            <button
              type="button"
              onClick={addTimelineItem}
              className="bg-violet-500 text-white px-4 py-2 rounded-lg hover:bg-violet-600 transition-colors text-sm"
            >
              + Add Timeline Item
            </button>
          </div>
          
          {formData.timeline && formData.timeline.length > 0 ? (
            <div className="space-y-4">
              {formData.timeline.map((item: any, index: number) => (
                <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={item.time}
                        onChange={(e) => updateTimelineItem(item.id, 'time', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activity/Ceremony
                      </label>
                      <input
                        type="text"
                        value={item.activity}
                        onChange={(e) => updateTimelineItem(item.id, 'activity', e.target.value)}
                        placeholder="e.g., Muhurtham, Reception, Dinner"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                    </div>
                    
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateTimelineItem(item.id, 'description', e.target.value)}
                          placeholder="Brief description"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTimelineItem(item.id)}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No timeline items added yet</p>
              <p className="text-sm">Click "Add Timeline Item" to start planning your event schedule</p>
            </div>
          )}
        </div>
        
        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              value={formData.specialInstructions || ''}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              rows={4}
              placeholder="Any special instructions for vendors or coordinators..."
              maxLength={500}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              rows={4}
              placeholder="Describe your event vision and theme..."
              maxLength={1000}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">📋</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Event</h2>
        <p className="text-gray-600">Please review all details before creating your event</p>
      </div>
      
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
            <p><span className="font-medium">Event:</span> {formData.eventName}</p>
            <p><span className="font-medium">Date:</span> {new Date(formData.dateTime).toLocaleString()}</p>
            <p><span className="font-medium">Duration:</span> {formData.duration}</p>
            <p><span className="font-medium">Attendees:</span> {formData.attendees}</p>
            <p><span className="font-medium">Budget:</span> ₹{formData.budget?.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Contact Details</h3>
            <p><span className="font-medium">Name:</span> {formData.clientName}</p>
            <p><span className="font-medium">Email:</span> {formData.clientEmail}</p>
            <p><span className="font-medium">Phone:</span> {formData.clientPhone}</p>
            <p><span className="font-medium">Location:</span> {formData.city}, {formData.state}</p>
          </div>
        </div>
        
        {formData.traditionStyle && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Style & Preferences</h3>
            <p><span className="font-medium">Tradition:</span> {formData.traditionStyle}</p>
            {formData.foodPreferences && formData.foodPreferences.length > 0 && (
              <p><span className="font-medium">Food:</span> {formData.foodPreferences.join(', ')}</p>
            )}
          </div>
        )}
        
        {formData.selectedServices && formData.selectedServices.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Selected Services</h3>
            <div className="flex flex-wrap gap-2">
              {formData.selectedServices.map(service => (
                <span key={service} className="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-sm">
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {formData.selectedVenueTypes && formData.selectedVenueTypes.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Selected Venue Types</h3>
            <div className="flex flex-wrap gap-2">
              {formData.selectedVenueTypes.map(venue => (
                <span key={venue} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {venue.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {formData.selectedVendorServices && formData.selectedVendorServices.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Selected Vendor Services</h3>
            <div className="flex flex-wrap gap-2">
              {formData.selectedVendorServices.map(service => (
                <span key={service} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {formData.specialRequirements && Object.keys(formData.specialRequirements).length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Special Requirements Details</h3>
            <div className="space-y-3">
              {Object.entries(formData.specialRequirements).map(([key, value]) => {
                if (typeof value === 'object' && value && (value as any).requirementLabel) {
                  const reqData = value as any;
                  return (
                    <div key={key} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <h4 className="font-medium text-purple-900 mb-2">{reqData.requirementLabel}</h4>
                      <div className="space-y-1">
                        {reqData.questions?.map((question: any) => {
                          const answer = reqData.answers?.[question.id];
                          if (!answer || (Array.isArray(answer) && answer.length === 0)) return null;
                          
                          return (
                            <div key={question.id} className="text-sm">
                              <span className="font-medium text-purple-800">{question.question_text}:</span>
                              <span className="ml-2 text-purple-700">
                                {Array.isArray(answer) ? answer.join(', ') : answer}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              }).filter(Boolean)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const getVendorServicesForEvent = () => {
    const eventName = subsection?.name || '';
    
    // Comprehensive vendor mapping for all 138+ events
    const eventVendorMapping: Record<string, string[]> = {
      // Corporate Events
      'conference': ['catering', 'photography', 'videography', 'coordination', 'av_technical', 'transportation', 'security', 'speaking'],
      'seminar': ['catering', 'photography', 'coordination', 'av_technical', 'speaking', 'equipment'],
      'corporate-party': ['catering', 'photography', 'videography', 'decoration', 'entertainment', 'coordination', 'transportation', 'flowers'],
      'award-ceremony': ['catering', 'photography', 'videography', 'decoration', 'entertainment', 'coordination', 'security', 'flowers', 'av_technical'],
      'product-launch': ['catering', 'photography', 'videography', 'decoration', 'av_technical', 'coordination', 'marketing', 'security', 'equipment'],
      'trade-show': ['catering', 'photography', 'coordination', 'av_technical', 'security', 'transportation', 'equipment', 'marketing'],
      'networking-mixer': ['catering', 'photography', 'coordination', 'entertainment', 'av_technical'],
      'webinar': ['av_technical', 'coordination', 'virtual_platform', 'speaking'],
      'leadership-summit': ['catering', 'photography', 'videography', 'coordination', 'av_technical', 'transportation', 'security', 'speaking'],
      'hackathon': ['catering', 'coordination', 'av_technical', 'security', 'equipment', 'speaking'],
      'investor-meetup': ['catering', 'photography', 'coordination', 'av_technical', 'security', 'speaking'],
      'career-expo': ['catering', 'photography', 'coordination', 'av_technical', 'security', 'equipment', 'speaking'],
      'industry-roundtable': ['catering', 'photography', 'coordination', 'av_technical', 'speaking'],
      'press-conference': ['photography', 'videography', 'coordination', 'av_technical', 'security', 'speaking'],
      
      // Social Events
      'wedding': ['catering', 'photography', 'videography', 'decoration', 'flowers', 'entertainment', 'beauty', 'coordination', 'transportation', 'religious', 'av_technical'],
      'engagement': ['catering', 'photography', 'videography', 'decoration', 'flowers', 'entertainment', 'coordination', 'beauty', 'av_technical'],
      'birthday': ['catering', 'photography', 'videography', 'decoration', 'entertainment', 'coordination', 'flowers', 'av_technical'],
      'anniversary': ['catering', 'photography', 'videography', 'decoration', 'flowers', 'entertainment', 'coordination', 'av_technical'],
      'baby-shower': ['catering', 'photography', 'decoration', 'coordination', 'flowers', 'entertainment'],
      'housewarming': ['catering', 'photography', 'decoration', 'coordination', 'religious', 'flowers'],
      'bachelor-party': ['catering', 'photography', 'entertainment', 'coordination', 'transportation', 'av_technical'],
      'retirement': ['catering', 'photography', 'decoration', 'coordination', 'flowers', 'av_technical', 'speaking'],
      'farewell': ['catering', 'photography', 'decoration', 'coordination', 'flowers', 'av_technical'],
      'graduation-party': ['catering', 'photography', 'decoration', 'coordination', 'flowers', 'entertainment', 'av_technical'],
      'kitty-party': ['catering', 'photography', 'coordination', 'decoration', 'entertainment'],
      'pre-wedding-bash': ['catering', 'photography', 'videography', 'decoration', 'entertainment', 'coordination', 'beauty', 'av_technical'],
      'bridal-shower': ['catering', 'photography', 'decoration', 'beauty', 'coordination', 'flowers', 'entertainment'],
      'gender-reveal-party': ['catering', 'photography', 'decoration', 'coordination', 'entertainment', 'flowers'],
      'friendship-day-event': ['catering', 'photography', 'coordination', 'decoration', 'entertainment'],
      'valentines-day-celebration': ['catering', 'photography', 'decoration', 'flowers', 'coordination', 'entertainment'],
      'adoption-celebration': ['catering', 'photography', 'decoration', 'coordination', 'flowers', 'entertainment'],
      
      // Cultural Events
      'cultural-fair': ['catering', 'photography', 'videography', 'decoration', 'entertainment', 'coordination', 'security', 'av_technical', 'speaking'],
      'naming-ceremony': ['catering', 'photography', 'decoration', 'religious', 'coordination', 'flowers', 'av_technical'],
      'music-concert': ['photography', 'videography', 'av_technical', 'entertainment', 'coordination', 'security', 'equipment'],
      'book-launch': ['catering', 'photography', 'coordination', 'av_technical', 'speaking', 'decoration'],
      'heritage-walk': ['coordination', 'transportation', 'speaking', 'photography', 'security'],
      'food-festival': ['catering', 'photography', 'coordination', 'security', 'decoration', 'entertainment'],
      'cultural-exchange': ['catering', 'photography', 'coordination', 'speaking', 'av_technical', 'decoration'],
      'language-festival': ['catering', 'photography', 'coordination', 'speaking', 'av_technical', 'decoration'],
      'handicraft-exhibition': ['photography', 'coordination', 'security', 'decoration', 'speaking'],
      'cultural-parade': ['photography', 'videography', 'coordination', 'security', 'entertainment', 'av_technical'],
      'ethnic-wear-show': ['photography', 'videography', 'decoration', 'beauty', 'coordination', 'av_technical', 'entertainment'],
      'regional-cuisine-fest': ['catering', 'photography', 'coordination', 'decoration', 'entertainment'],
      'cultural-documentary-screening': ['av_technical', 'coordination', 'photography', 'speaking'],
      'tribal-art-exhibition': ['photography', 'coordination', 'decoration', 'speaking', 'security'],
      'folk-music-festival': ['photography', 'videography', 'entertainment', 'coordination', 'av_technical', 'decoration'],
      'traditional-games-tournament': ['photography', 'coordination', 'entertainment', 'av_technical', 'security'],
      'cultural-storytelling-session': ['photography', 'coordination', 'av_technical', 'speaking', 'decoration'],
      
      // Religious Events
      'mass-gathering': ['coordination', 'security', 'av_technical', 'religious', 'medical', 'transportation'],
      'interfaith-gathering': ['catering', 'photography', 'coordination', 'religious', 'speaking', 'av_technical', 'security'],
      'religious-seminar': ['catering', 'photography', 'coordination', 'religious', 'av_technical', 'speaking'],
      'puja-ceremony': ['catering', 'photography', 'decoration', 'flowers', 'religious', 'coordination', 'av_technical'],
      'kirtan': ['photography', 'entertainment', 'religious', 'coordination', 'av_technical', 'decoration'],
      'satsang': ['photography', 'religious', 'coordination', 'av_technical', 'speaking'],
      'religious-discourse': ['photography', 'religious', 'coordination', 'av_technical', 'speaking'],
      'temple-inauguration': ['catering', 'photography', 'videography', 'decoration', 'religious', 'coordination', 'security', 'flowers'],
      'religious-procession': ['photography', 'videography', 'coordination', 'security', 'religious', 'av_technical'],
      'prayer-meeting': ['photography', 'religious', 'coordination', 'av_technical'],
      'community-service': ['coordination', 'transportation', 'photography', 'catering'],
      'pilgrimage-tour': ['coordination', 'transportation', 'religious', 'photography', 'catering'],
      'blessing-ceremony': ['photography', 'decoration', 'religious', 'coordination', 'flowers', 'av_technical'],
      'sacred-thread-ceremony': ['catering', 'photography', 'decoration', 'religious', 'coordination', 'flowers'],
      
      // Festival Events
      'diwali-celebration': ['catering', 'photography', 'decoration', 'entertainment', 'coordination', 'religious', 'flowers', 'av_technical'],
      'holi-festival': ['photography', 'videography', 'coordination', 'entertainment', 'other', 'catering', 'security'],
      'eid-al-fitr': ['catering', 'photography', 'decoration', 'religious', 'coordination', 'flowers', 'entertainment'],
      'eid-al-adha': ['catering', 'photography', 'decoration', 'religious', 'coordination', 'flowers'],
      'christmas-celebration': ['catering', 'photography', 'decoration', 'entertainment', 'coordination', 'religious', 'flowers'],
      'new-years-party': ['catering', 'photography', 'videography', 'decoration', 'entertainment', 'coordination', 'av_technical'],
      'navratri-garba': ['photography', 'videography', 'entertainment', 'coordination', 'av_technical', 'decoration', 'catering'],
      'ganesh-chaturthi': ['catering', 'photography', 'decoration', 'religious', 'coordination', 'entertainment', 'flowers'],
      'raksha-bandhan': ['catering', 'photography', 'decoration', 'coordination', 'flowers', 'religious'],
      'janmashtami': ['catering', 'photography', 'decoration', 'entertainment', 'religious', 'coordination', 'flowers'],
      'onam': ['catering', 'photography', 'decoration', 'entertainment', 'coordination', 'flowers'],
      'durga-puja': ['catering', 'photography', 'decoration', 'entertainment', 'religious', 'coordination', 'flowers'],
      'baisakhi': ['catering', 'photography', 'decoration', 'entertainment', 'coordination', 'flowers'],
      'gurupurab': ['catering', 'photography', 'decoration', 'religious', 'coordination', 'flowers', 'av_technical'],
      'makar-sankranti': ['catering', 'photography', 'coordination', 'other', 'decoration', 'entertainment'],
      'easter-celebration': ['catering', 'photography', 'decoration', 'religious', 'coordination', 'flowers', 'entertainment'],
      
      // Political Events
      'charity-event': ['catering', 'photography', 'videography', 'coordination', 'av_technical', 'decoration', 'speaking'],
      'political-rally': ['photography', 'videography', 'av_technical', 'coordination', 'security', 'speaking', 'transportation'],
      'election-campaign': ['photography', 'videography', 'coordination', 'marketing', 'transportation', 'av_technical', 'speaking'],
      'political-conference': ['catering', 'photography', 'videography', 'coordination', 'av_technical', 'security', 'speaking'],
      'party-convention': ['catering', 'photography', 'videography', 'decoration', 'coordination', 'av_technical', 'security'],
      'swearing-in-ceremony': ['photography', 'videography', 'coordination', 'security', 'av_technical', 'decoration'],
      'political-summit': ['catering', 'photography', 'videography', 'coordination', 'av_technical', 'security', 'speaking'],
      'community-town-hall': ['photography', 'coordination', 'av_technical', 'speaking', 'security'],
      'independence-day-rally': ['photography', 'videography', 'coordination', 'security', 'av_technical', 'decoration'],
      'republic-day-parade': ['photography', 'videography', 'coordination', 'security', 'av_technical', 'entertainment'],
      'labor-day-rally': ['photography', 'videography', 'coordination', 'security', 'av_technical', 'speaking'],
      
      // Sports Events
      'sports-tournament': ['photography', 'videography', 'coordination', 'security', 'medical', 'catering', 'av_technical'],
      'marathon-run': ['photography', 'coordination', 'security', 'medical', 'transportation', 'catering', 'equipment'],
      'adventure-camp': ['photography', 'coordination', 'security', 'medical', 'equipment', 'catering'],
      'cycling-event': ['photography', 'coordination', 'security', 'medical', 'equipment', 'catering'],
      'sports-day': ['photography', 'coordination', 'catering', 'medical', 'av_technical', 'entertainment'],
      
      // Educational Events
      'workshop': ['catering', 'photography', 'coordination', 'av_technical', 'speaking', 'equipment'],
      'lecture-series': ['photography', 'coordination', 'av_technical', 'speaking', 'catering'],
      'school-annual-day': ['photography', 'videography', 'decoration', 'entertainment', 'coordination', 'av_technical', 'flowers'],
      'science-fair': ['photography', 'coordination', 'av_technical', 'equipment', 'speaking', 'decoration'],
      'academic-symposium': ['catering', 'photography', 'coordination', 'av_technical', 'speaking', 'equipment'],
      'research-conference': ['catering', 'photography', 'videography', 'coordination', 'av_technical', 'speaking'],
      'debate-competition': ['photography', 'coordination', 'av_technical', 'speaking'],
      'quiz-contest': ['photography', 'coordination', 'av_technical', 'speaking', 'equipment'],
      'literary-festival': ['catering', 'photography', 'coordination', 'speaking', 'av_technical', 'decoration'],
      
      // Health Events
      'health-camp': ['coordination', 'medical', 'security', 'equipment', 'catering'],
      'mental-health-awareness-event': ['photography', 'coordination', 'speaking', 'medical', 'av_technical'],
      'fitness-bootcamp': ['photography', 'coordination', 'medical', 'equipment', 'catering'],
      'health-fair': ['photography', 'coordination', 'medical', 'catering', 'equipment', 'decoration'],
      'blood-donation-drive': ['coordination', 'medical', 'security', 'catering', 'equipment'],
      'health-screening': ['coordination', 'medical', 'equipment', 'catering'],
      'medical-conference': ['catering', 'photography', 'videography', 'coordination', 'av_technical', 'medical', 'speaking'],
      'vaccination-drive': ['coordination', 'medical', 'security', 'equipment', 'catering'],
      'health-awareness-campaign': ['photography', 'coordination', 'speaking', 'medical', 'av_technical', 'marketing'],
      'wellness-workshop': ['photography', 'coordination', 'speaking', 'medical', 'catering', 'equipment'],
      'wellness-seminar': ['catering', 'photography', 'coordination', 'speaking', 'medical', 'av_technical'],
      'nutrition-awareness-program': ['catering', 'photography', 'coordination', 'speaking', 'medical', 'av_technical'],
      'nutrition-workshop': ['catering', 'photography', 'coordination', 'speaking', 'medical', 'equipment'],
      'mindfulness-retreat': ['coordination', 'speaking', 'medical', 'catering', 'decoration'],
      'meditation-retreat': ['coordination', 'speaking', 'religious', 'catering', 'decoration'],
      
      // Environmental Events
      'tree-planting-drive': ['coordination', 'transportation', 'equipment', 'photography', 'catering', 'speaking', 'medical'],
      'eco-festival': ['catering', 'photography', 'coordination', 'speaking', 'entertainment', 'decoration', 'av_technical'],
      'clean-up-drive': ['coordination', 'transportation', 'equipment', 'photography', 'catering', 'medical'],
      'environmental-awareness-campaign': ['photography', 'coordination', 'speaking', 'marketing', 'av_technical', 'decoration'],
      'green-living-expo': ['catering', 'photography', 'coordination', 'speaking', 'decoration', 'av_technical'],
      'sustainability-workshop': ['catering', 'photography', 'coordination', 'speaking', 'equipment', 'av_technical'],
      
      // Virtual Events
      'online-webinar': ['av_technical', 'coordination', 'virtual_platform', 'speaking'],
      'virtual-conference': ['av_technical', 'coordination', 'virtual_platform', 'speaking', 'equipment'],
      'live-stream-party': ['av_technical', 'coordination', 'virtual_platform', 'entertainment', 'equipment'],
      'virtual-team-building-event': ['coordination', 'virtual_platform', 'entertainment', 'av_technical'],
      'online-product-launch': ['av_technical', 'coordination', 'virtual_platform', 'marketing', 'speaking'],
      'virtual-charity-auction': ['coordination', 'virtual_platform', 'av_technical', 'speaking'],
      'hybrid-festival-celebration': ['catering', 'photography', 'coordination', 'virtual_platform', 'av_technical', 'decoration'],
      
      // Entertainment Events
      'dance-performance': ['photography', 'videography', 'av_technical', 'coordination', 'decoration', 'beauty'],
      'comedy-show': ['photography', 'videography', 'av_technical', 'coordination', 'catering'],
      'theater-play': ['photography', 'videography', 'av_technical', 'coordination', 'decoration', 'beauty'],
      'fashion-show': ['photography', 'videography', 'beauty', 'coordination', 'av_technical', 'decoration'],
      'magic-show': ['photography', 'videography', 'coordination', 'av_technical', 'entertainment'],
      'puppet-show': ['photography', 'videography', 'coordination', 'entertainment', 'av_technical'],
      'storytelling-session': ['photography', 'coordination', 'av_technical', 'speaking', 'decoration'],
      'karaoke-night': ['photography', 'av_technical', 'coordination', 'entertainment', 'catering'],
      'open-mic-night': ['photography', 'av_technical', 'coordination', 'entertainment', 'catering'],
      'film-screening': ['av_technical', 'coordination', 'catering', 'equipment'],
      'poetry-reading': ['photography', 'coordination', 'av_technical', 'speaking', 'decoration'],
      'art-workshop': ['photography', 'coordination', 'equipment', 'speaking', 'catering'],
      'dance-workshop': ['photography', 'coordination', 'av_technical', 'speaking', 'equipment'],
      'music-workshop': ['photography', 'coordination', 'av_technical', 'speaking', 'equipment'],
      'celebrity-meet-greet': ['photography', 'videography', 'coordination', 'security', 'av_technical'],
      
      // Community Events
      'neighborhood-gathering': ['catering', 'photography', 'coordination', 'decoration', 'entertainment'],
      'volunteer-appreciation': ['catering', 'photography', 'coordination', 'decoration', 'speaking'],
      'fundraising-gala': ['catering', 'photography', 'videography', 'decoration', 'coordination', 'av_technical', 'entertainment'],
      'community-festival': ['catering', 'photography', 'entertainment', 'coordination', 'security', 'decoration'],
      'senior-citizen-program': ['catering', 'photography', 'coordination', 'medical', 'speaking', 'transportation'],
      'youth-development-program': ['photography', 'coordination', 'speaking', 'catering', 'av_technical'],
      'community-cleanup': ['coordination', 'transportation', 'equipment', 'photography', 'catering'],
      'tree-plantation-drive': ['coordination', 'transportation', 'equipment', 'photography', 'catering', 'speaking'],
      'awareness-rally': ['photography', 'videography', 'coordination', 'speaking', 'av_technical', 'security']
    };
    
    // All vendor services with icons and descriptions
    const allVendorServices = [
      { id: 'catering', name: 'Catering', icon: '🍽️', description: 'Food and beverage services' },
      { id: 'photography', name: 'Photography', icon: '📸', description: 'Professional photographers' },
      { id: 'videography', name: 'Videography', icon: '🎥', description: 'Video recording services' },
      { id: 'decoration', name: 'Decoration', icon: '🎨', description: 'Event decoration and design' },
      { id: 'flowers', name: 'Flowers', icon: '💐', description: 'Floral arrangements' },
      { id: 'entertainment', name: 'Entertainment', icon: '🎭', description: 'Live entertainment acts' },
      { id: 'beauty', name: 'Beauty Services', icon: '💄', description: 'Makeup and beauty services' },
      { id: 'coordination', name: 'Event Coordination', icon: '📋', description: 'Professional event management' },
      { id: 'transportation', name: 'Transportation', icon: '🚗', description: 'Guest transportation' },
      { id: 'security', name: 'Security Services', icon: '🛡️', description: 'Event security and safety' },
      { id: 'av_technical', name: 'AV & Technical', icon: '🎤', description: 'Audio visual and technical services' },
      { id: 'medical', name: 'Medical Services', icon: '🏥', description: 'Healthcare and medical support' },
      { id: 'religious', name: 'Religious Services', icon: '🕉️', description: 'Religious and spiritual services' },
      { id: 'speaking', name: 'Speaking & Education', icon: '🎓', description: 'Speakers and educational services' },
      { id: 'marketing', name: 'Marketing & PR', icon: '📢', description: 'Marketing and promotional services' },
      { id: 'virtual_platform', name: 'Virtual Platform', icon: '💻', description: 'Virtual and digital event services' },
      { id: 'equipment', name: 'Equipment & Tools', icon: '🛠️', description: 'Tools and equipment suppliers' },
      { id: 'other', name: 'Other Services', icon: '🔧', description: 'Additional event services' }
    ];
    
    // Get vendor services for the current event
    const eventVendorIds = eventVendorMapping[subsectionId] || [];
    const filteredServices = allVendorServices.filter(service => eventVendorIds.includes(service.id));
    
    // If no specific services found, return popular fallback services
    if (filteredServices.length === 0) {
      return [
        { id: 'photography', name: 'Photography', icon: '📸', description: 'Professional photographers' },
        { id: 'catering', name: 'Catering', icon: '🍽️', description: 'Food and beverage services' },
        { id: 'decoration', name: 'Decoration', icon: '🎨', description: 'Event decoration and design' },
        { id: 'coordination', name: 'Event Coordination', icon: '📋', description: 'Professional event management' }
      ];
    }
    
    return filteredServices;
  };

  const loadVendorServices = async () => {
    setLoadingVendors(true);
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) {
        setApiVendorServices([]);
        setLoadingVendors(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/events/requirements/?event_id=${subsectionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      // Filter for Vendor Services category
      const vendorServices = data.filter((req: any) => req.category_name === 'Vendor Services');
      setApiVendorServices(vendorServices);
    } catch (error) {
      console.warn('Failed to load vendor services from API, using fallback:', error);
      setApiVendorServices([]);
    } finally {
      setLoadingVendors(false);
    }
  };

  const getVendorIcon = (category: string) => {
    const icons: Record<string, string> = {
      'catering': '🍽️',
      'photography': '📸',
      'videography': '🎥',
      'decoration': '🎨',
      'flowers': '💐',
      'entertainment': '🎭',
      'beauty': '💄',
      'coordination': '📋',
      'transportation': '🚗',
      'security': '🛡️',
      'av_technical': '🎤',
      'medical': '🏥',
      'religious': '🕉️',
      'speaking': '🎓',
      'marketing': '📢',
      'virtual_platform': '💻',
      'equipment': '🛠️',
      'other': '🔧'
    };
    return icons[category] || '👥';
  };

  const renderVendorsStep = () => {
    if (loadingVendors) {
      return (
        <div className="text-center py-8">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-gray-600">Loading vendor services...</p>
        </div>
      );
    }

    const vendorServices = apiVendorServices.length > 0 ? apiVendorServices : getVendorServicesForEvent();
    
    const toggleVendorService = (serviceId: string) => {
      const newVendorServices = selectedVendorServices.includes(serviceId) 
        ? selectedVendorServices.filter(id => id !== serviceId)
        : [...selectedVendorServices, serviceId];
      
      setSelectedVendorServices(newVendorServices);
      handleInputChange('selectedVendorServices', newVendorServices);
      console.log('Vendor service toggled:', serviceId, 'New selection:', newVendorServices);
    };
    
    return (
      <div className="text-center space-y-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">👥 Find Perfect Vendors</h2>
          <p className="text-lg text-gray-600 mb-6">
            Connect with top-rated vendors for your {subsection?.name.toLowerCase()}
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">👥 Vendor Services</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendorServices.map((service: any) => {
                const serviceId = service.requirement_id || service.id;
                const serviceName = service.label || service.name;
                const serviceCategory = service.category;
                const serviceIcon = getVendorIcon(serviceCategory);
                
                return (
                  <button
                    key={serviceId}
                    onClick={() => toggleVendorService(serviceId)}
                    className={`p-4 rounded-xl text-center transition-all border-2 ${
                      selectedVendorServices.includes(serviceId)
                        ? 'border-[#C4A661] bg-[#C4A661] text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-[#C4A661]'
                    }`}
                  >
                    <div className="text-2xl mb-2">{serviceIcon}</div>
                    <div className="text-sm font-medium">{serviceName}</div>
                    <div className="text-xs mt-1 opacity-75">{serviceCategory}</div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {selectedVendorServices.length > 0 && (
            <div className="mb-6 p-4 bg-white rounded-lg border border-green-300">
              <h4 className="font-medium text-gray-900 mb-2">Selected Services ({selectedVendorServices.length})</h4>
              <div className="flex flex-wrap gap-2">
                {selectedVendorServices.map(serviceId => {
                  const service = vendorServices.find((s: any) => (s.requirement_id || s.id) === serviceId);
                  return service ? (
                    <span key={serviceId} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {service.label || service.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                // Ensure vendor services are properly stored before continuing
                const finalVendorServices = selectedVendorServices.length > 0 ? selectedVendorServices : formData.selectedVendorServices || [];
                handleInputChange('selectedVendorServices', finalVendorServices);
                setSelectedVendorServices(finalVendorServices);
                console.log('Continue to review - storing vendor services:', finalVendorServices);
                setCurrentStep('review');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-[#C4A661] to-[#B8941A] hover:from-[#B8941A] hover:to-[#A67C00] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Continue to Review ({selectedVendorServices.length} selected)
            </button>
            <button
              onClick={async () => {
                console.log('Skip vendors button clicked - selectedVendorServices:', selectedVendorServices);
                console.log('Current formData before submit:', formData);
                
                try {
                  // Ensure vendor services are stored in form data and state
                  const updatedFormData = {
                    ...formData,
                    selectedVenueTypes: selectedVenueTypes.length > 0 ? selectedVenueTypes : formData.selectedVenueTypes || [], // Keep existing venue selections
                    selectedVendorServices: selectedVendorServices.length > 0 ? selectedVendorServices : formData.selectedVendorServices || []
                  };
                  
                  // Update both form data and input change to ensure persistence
                  setFormData(updatedFormData);
                  handleInputChange('selectedVenueTypes', updatedFormData.selectedVenueTypes);
                  handleInputChange('selectedVendorServices', updatedFormData.selectedVendorServices);
                  
                  console.log('Updated form data with vendors:', updatedFormData);
                  console.log('Final selectedVenueTypes:', updatedFormData.selectedVenueTypes);
                  console.log('Final selectedVendorServices:', updatedFormData.selectedVendorServices);
                  console.log('Authentication check:', {
                    hasAccessToken: !!localStorage.getItem('access_token'),
                    hasSessionToken: !!sessionStorage.getItem('access_token'),
                    tokenPreview: localStorage.getItem('access_token')?.substring(0, 20)
                  });
                  
                  // Wait a moment for state to update
                  setTimeout(async () => {
                    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                    await handleSubmit(fakeEvent);
                  }, 200);
                } catch (error: unknown) {
                  console.error('Skip vendors error:', error);
                  alert(`Error creating event: ${error instanceof Error ? error.message : String(error)}`);
                }
              }}
              disabled={isSubmitting}
              className="border-2 border-gray-300 hover:border-[#C4A661] text-gray-700 hover:text-[#C4A661] px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Creating...' : 'Create Event Now'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSuccessStep = () => (
    <div className="text-center space-y-8">
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 Event Created Successfully!
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Your {subsection?.name.toLowerCase()} has been created and saved.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => {
            // Reset form and go back to event creation
            setCurrentStep('basic');
            setFormData({
              eventName: subsection?.name || '',
              clientName: '',
              clientEmail: '',
              clientPhone: '',
              dateTime: '',
              duration: '',
              customDuration: '',
              state: '',
              city: '',
              venueDetails: '',
              traditionStyle: '',
              attendees: 0,
              budget: 0,
              description: '',
              selectedVendors: [],
              customRequirements: '',
              specialInstructions: '',
              accessibilityNeeds: '',
              needsVendor: false,
              contactPreference: 'both',
              inspirationImage: null,
              timeline: [],
              foodPreferences: [],
              specialRequirements: {},
              selectedVenueTypes: [],
              selectedVendorServices: [],
              selectedServices: [],
              planningType: undefined,
            });
            setCompletedSteps(new Set());
            setWantsDetailedPlanning(null);
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          Create Another Event
        </button>
        <button
          onClick={() => {
            // Force navigation to dashboard, bypassing any routing issues
            window.location.replace('/dashboard');
          }}
          className="border-2 border-gray-300 hover:border-purple-600 text-gray-700 hover:text-purple-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  // Remove auto-redirect on success step

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return renderBasicDetailsStep();
      case 'thankyou':
        return renderThankYouStep();
      case 'location':
        return renderLocationStep();
      case 'duration':
        return renderDurationStep();
      case 'budget':
        return renderBudgetStep();
      case 'tradition':
        return renderTraditionStep();
      case 'food':
        return renderFoodStep();
      case 'requirements':
        return renderRequirementsStep();
      case 'timeline':
        return renderTimelineStep();
      case 'review':
        return renderReviewStep();
      case 'venues':
        return renderVenuesStep();
      case 'vendors':
        return renderVendorsStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderBasicDetailsStep();
    }
  };

  // Dynamic content based on event type
  const getEventIcon = () => {
    const eventIcons: Record<string, string> = {
      'wedding': '💒', 'engagement': '💍', 'birthday': '🎂',
      'corporate-party': '🎉', 'conference': '🏢', 'seminar': '📊',
      'anniversary': '💕', 'baby-shower': '👶', 'sangeet': '💃',
      'mehndi': '🎨', 'product-launch': '🚀', 'award-ceremony': '🏆'
    };
    return eventIcons[subsectionId] || '🎪';
  };

  const getCityOptions = () => {
    const eventCities: Record<string, Array<{id: string, name: string, icon: string, highlighted?: boolean}>> = {
      'wedding': [
        { id: 'delhi', name: 'Delhi NCR', icon: '🏛️' },
        { id: 'bengaluru', name: 'Bengaluru', icon: '🏢' },
        { id: 'goa', name: 'Goa', icon: '⛪', highlighted: true },
        { id: 'udaipur', name: 'Udaipur', icon: '🏰' },
        { id: 'jaipur', name: 'Jaipur', icon: '🕌' },
        { id: 'rishikesh', name: 'Jim Corbett or Rishikesh', icon: '🏔️' }
      ],
      'corporate-party': [
        { id: 'mumbai', name: 'Mumbai', icon: '🏢' },
        { id: 'delhi', name: 'Delhi NCR', icon: '🏛️' },
        { id: 'bengaluru', name: 'Bengaluru', icon: '🏢', highlighted: true },
        { id: 'pune', name: 'Pune', icon: '🏢' },
        { id: 'hyderabad', name: 'Hyderabad', icon: '🏢' },
        { id: 'chennai', name: 'Chennai', icon: '🏢' }
      ]
    };
    return eventCities[subsectionId] || eventCities['wedding'];
  };

  return (
    <div className="relative min-h-screen bg-gray-50">


      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* LEFT SIDE - RESPONSIVE */}
        <div className="lg:fixed lg:left-0 lg:top-0 lg:w-1/3 lg:h-screen p-4 lg:p-6 flex flex-col z-10 bg-white lg:bg-transparent">
          {/* Top - Logo */}
          <div className="flex items-center gap-3 mb-6 lg:mb-8">
            <img 
              src="/videos/partyoria.gif" 
              alt="PartyOria Logo" 
              className="w-12 h-12 lg:w-16 lg:h-16 object-contain"
            />
            <h1 className="text-lg lg:text-xl font-bold text-gray-900 lg:hidden">
              {subsection?.name} Planning
            </h1>
          </div>

          {/* Center - Hero Content - Hidden on mobile */}
          <div className="hidden lg:block text-center flex-1 flex flex-col justify-center">
            {/* Event Image */}
            <div className="w-full max-w-md mb-6 bg-white/10 backdrop-blur-xl rounded-3xl p-4 border border-white/20 shadow-2xl hover:transform hover:scale-105 transition-all duration-500 mx-auto">
              <div className="w-full h-64 rounded-2xl border-2 border-white/30 shadow-inner">
                <img 
                  src={apiImages[subsectionId] || getEventImage(subsectionId)}
                  alt={subsection?.name || 'Event'}
                  className="w-full h-full object-cover rounded-2xl"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Heading with decorative elements */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                Your {subsection?.name} Requirements
              </h2>
              <p className="text-gray-700 leading-relaxed max-w-sm text-center text-base font-medium mx-auto">
                Let's start with these details to help us create your personalized proposal.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - SCROLLABLE */}
        <div className="w-full lg:ml-[33.333333%] flex-1 p-4 lg:p-6 min-h-screen overflow-y-auto">
          {/* Top Right - Close Button */}
          <button 
            onClick={onBack}
            className="fixed top-4 right-4 lg:absolute lg:top-6 lg:right-6 w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 touch-target z-20"
          >
            <span className="text-xl lg:text-2xl font-bold">×</span>
          </button>

          {/* Main Form Card */}
          <div className="max-w-4xl mx-auto pt-4 lg:pt-8 pb-20">
            <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-gray-200 shadow-lg lg:shadow-2xl">
              {/* Auto-save indicator */}
              {lastSaved && (
                <div className="mb-2 text-xs text-gray-500 text-right">
                  Draft saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
              
              {/* Progress Indicator */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-semibold shadow-lg">
                    Step {getStepProgress()}
                  </div>
                  <span className="text-xs lg:text-sm text-gray-500">
                    {Math.round(getProgressPercentage())}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>

              {/* Step Label */}
              <div className="mb-4">
                <span className="text-gray-600 text-sm lg:text-base font-medium">
                  {currentStep === 'basic' && 'Basic details'}
                  {currentStep === 'location' && 'Select location'}
                  {currentStep === 'duration' && 'Duration & date'}
                  {currentStep === 'budget' && 'Budget range'}
                  {currentStep === 'thankyou' && 'Planning choice'}
                  {currentStep === 'tradition' && 'Tradition style'}
                  {currentStep === 'food' && 'Food preferences'}
                  {currentStep === 'requirements' && 'Special requirements'}
                  {currentStep === 'timeline' && 'Event timeline'}
                  {currentStep === 'venues' && 'Venue selection'}
                  {currentStep === 'vendors' && 'Vendor services'}
                  {currentStep === 'review' && 'Review details'}
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-2xl lg:text-4xl font-bold mb-6 lg:mb-8 leading-tight text-black">
                {currentStep === 'basic' && `Tell us about your ${subsection?.name.toLowerCase()}`}
                {currentStep === 'location' && `Where do you want to host your ${subsection?.name.toLowerCase()}?`}
                {currentStep === 'duration' && `When do you plan to have your ${subsection?.name.toLowerCase()}?`}
                {currentStep === 'budget' && `What's your budget for this ${subsection?.name.toLowerCase()}?`}
                {currentStep === 'thankyou' && 'Thank you for the details!'}
                {currentStep === 'tradition' && 'Choose your tradition style'}
                {currentStep === 'food' && 'What are your food preferences?'}
                {currentStep === 'requirements' && 'What are your special requirements?'}
                {currentStep === 'timeline' && 'Plan your event timeline'}
                {currentStep === 'venues' && 'Select your preferred venues'}
                {currentStep === 'vendors' && 'Choose your vendor services'}
                {currentStep === 'review' && 'Review your event details'}
              </h1>

              {/* Step Content */}
              <div className="space-y-6">
                {renderStepContent()}
              </div>

              {/* Navigation */}
              {renderNavigationButtons()}
            </div>
          </div>
        </div>
      </div>

      {/* Requirement Questions Modal */}
      <RequirementQuestionsModal
        isOpen={showRequirementModal}
        onClose={() => setShowRequirementModal(false)}
        requirement={selectedRequirement || { id: '', label: '' }}
        eventId={subsectionId}
        eventType={subsection?.name}
        onSave={(savedData) => {
          if (selectedRequirement) {
            // Save the complete requirement data including questions, answers and mark as selected
            setFormData(prev => ({
              ...prev,
              specialRequirements: {
                ...prev.specialRequirements,
                [selectedRequirement.id]: {
                  selected: true,
                  requirementId: savedData.requirementId,
                  requirementLabel: savedData.requirementLabel,
                  questions: savedData.questions,
                  answers: savedData.answers
                }
              },
              selectedServices: [...(prev.selectedServices || []).filter(s => s !== selectedRequirement.label), selectedRequirement.label]
            }));
          }
        }}
      />

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 8px 25px rgba(255, 140, 0, 0.4); }
          50% { box-shadow: 0 8px 25px rgba(255, 140, 0, 0.6), 0 0 0 8px rgba(255, 140, 0, 0.1); }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
        
        .animate-pulse-glow:hover {
          animation: none;
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          25% { transform: translateY(-30px) rotate(90deg); opacity: 1; }
          50% { transform: translateY(-15px) rotate(180deg); opacity: 0.8; }
          75% { transform: translateY(-25px) rotate(270deg); opacity: 0.9; }
        }
        
        @keyframes bubble {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) scale(1); opacity: 0; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-gradient-x {
          background-size: 400% 400%;
          animation: gradient-x 15s ease infinite;
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-bubble {
          animation: bubble 12s linear infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }
      `}</style>
      

    </div>
  );
};

export default EventCreationPage;