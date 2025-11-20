import { EventFormData, ValidationErrors } from '../types';

export const validateForm = (formData: EventFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Event Name validation
  if (!formData.eventName.trim()) {
    errors.eventName = 'Event name is required';
  } else if (formData.eventName.trim().length < 3) {
    errors.eventName = 'Event name must be at least 3 characters';
  } else if (formData.eventName.trim().length > 100) {
    errors.eventName = 'Event name must be less than 100 characters';
  }

  // Client Name validation
  if (!formData.clientName.trim()) {
    errors.clientName = 'Client name is required';
  } else if (formData.clientName.trim().length < 2) {
    errors.clientName = 'Client name must be at least 2 characters';
  }

  // Client Email validation
  if (!formData.clientEmail.trim()) {
    errors.clientEmail = 'Client email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
    errors.clientEmail = 'Please enter a valid email address';
  }

  // Client Phone validation
  if (!formData.clientPhone.trim()) {
    errors.clientPhone = 'Client phone number is required';
  } else if (!/^[\d\s\+\-\(\)]{10,15}$/.test(formData.clientPhone.replace(/\s/g, ''))) {
    errors.clientPhone = 'Please enter a valid phone number';
  }

  // Date & Time validation
  if (!formData.dateTime) {
    errors.dateTime = 'Date and time is required';
  } else {
    const selectedDate = new Date(formData.dateTime);
    const now = new Date();
    if (selectedDate <= now) {
      errors.dateTime = 'Event date must be in the future';
    }
  }

  // Location validation
  if (!formData.state.trim()) {
    errors.venue = 'State is required';
  } else if (!formData.city.trim()) {
    errors.venue = 'City is required';
  }

  // Attendees validation
  if (!formData.attendees || formData.attendees <= 0) {
    errors.attendees = 'Number of attendees must be greater than 0';
  } else if (formData.attendees > 10000) {
    errors.attendees = 'Please contact us directly for events with more than 10,000 attendees';
  }
  
  // Duration validation
  if (!formData.duration) {
    errors.duration = 'Event duration is required';
  } else if (formData.duration === 'custom' && !formData.customDuration?.trim()) {
    errors.duration = 'Please specify custom duration';
  }

  // Budget validation
  if (!formData.budget || formData.budget <= 0) {
    errors.budget = 'Budget is required and must be greater than 0';
  } else if (formData.budget > 10000000) {
    errors.budget = 'Please contact us directly for budgets over ₹1 crore';
  }

  // Description validation (optional)
  if (formData.description && formData.description.trim().length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  return errors;
};

export const isFormValid = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length === 0;
};