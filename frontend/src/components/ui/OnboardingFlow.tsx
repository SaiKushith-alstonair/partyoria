import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from './button';

interface OnboardingStep {
  title: string;
  description: string;
  action?: string;
  onClick?: () => void;
}

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userType: 'customer' | 'vendor';
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  onClose,
  onComplete,
  userType
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const customerSteps: OnboardingStep[] = [
    {
      title: "Welcome to PartyOria! 🎉",
      description: "Plan amazing events with verified vendors across India",
      action: "Get Started"
    },
    {
      title: "Create Your First Event",
      description: "Tell us about your event and we'll match you with perfect vendors",
      action: "Create Event"
    },
    {
      title: "Browse & Connect",
      description: "View quotes, chat with vendors, and manage everything in one place",
      action: "Explore Dashboard"
    }
  ];

  const vendorSteps: OnboardingStep[] = [
    {
      title: "Welcome, Vendor! 👋",
      description: "Connect with customers and grow your event business",
      action: "Get Started"
    },
    {
      title: "Complete Your Profile",
      description: "Add your services, portfolio, and get verified to attract more customers",
      action: "Setup Profile"
    },
    {
      title: "Start Receiving Bookings",
      description: "Respond to quotes, manage bookings, and build your reputation",
      action: "View Dashboard"
    }
  ];

  const steps = userType === 'customer' ? customerSteps : vendorSteps;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index <= currentStep ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-primary-600 hover:bg-primary-700"
          >
            {steps[currentStep].action}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;