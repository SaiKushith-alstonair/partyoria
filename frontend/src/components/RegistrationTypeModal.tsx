import React from 'react';
import { Button } from './ui/button';
import { X, Users, Store } from 'lucide-react';

interface RegistrationTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: () => void;
  onSelectVendor: () => void;
}

const RegistrationTypeModal: React.FC<RegistrationTypeModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
  onSelectVendor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            How do you want to register?
          </h2>
          <p className="text-gray-600">
            Choose your account type to get started
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onSelectCustomer}
            className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3"
          >
            <Users className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Customer</div>
              <div className="text-sm opacity-90">Plan and book events</div>
            </div>
          </Button>

          <Button
            onClick={onSelectVendor}
            className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-3"
          >
            <Store className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Vendor</div>
              <div className="text-sm opacity-90">Provide event services</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationTypeModal;