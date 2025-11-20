import React, { useState } from 'react';
import { X, ChevronRight, Check, User } from 'lucide-react';


interface ServiceExpansionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  categoryIcon: string;
  subServices: any[];
  selectedServices: Record<string, { selected: boolean; quantity?: number; unit?: string; }>;
  onServicesUpdate: (updatedServices: Record<string, { selected: boolean; quantity?: number; unit?: string; }>) => void;
}

const ServiceExpansionModal: React.FC<ServiceExpansionModalProps> = ({
  isOpen,
  onClose,
  categoryName,
  categoryIcon,
  subServices,
  selectedServices,
  onServicesUpdate
}) => {
  const [tempSelectedServices, setTempSelectedServices] = useState(selectedServices);
  const [hasChanges, setHasChanges] = useState(false);

  if (!isOpen) return null;

  const handleServiceToggle = (serviceId: string, service: any) => {
    const updated = { ...tempSelectedServices };
    if (updated[serviceId]?.selected) {
      delete updated[serviceId];
    } else {
      updated[serviceId] = { 
        selected: true, 
        unit: service.unit,
        quantity: service.unit ? 1 : undefined
      };
    }
    setTempSelectedServices(updated);
    setHasChanges(true);
  };

  const handleQuantityChange = (serviceId: string, quantity: number) => {
    const updated = { ...tempSelectedServices };
    if (updated[serviceId]) {
      updated[serviceId] = { ...updated[serviceId], quantity };
    }
    setTempSelectedServices(updated);
    setHasChanges(true);
  };

  const handleExploreServices = () => {
    let finalServices = { ...tempSelectedServices };
    
    // Simple service consolidation
    const isSingleProvider = ['photography', 'videography', 'catering'].includes(categoryName.toLowerCase());
    if (isSingleProvider) {
      const selectedSubServices = Object.keys(tempSelectedServices).filter(key => tempSelectedServices[key]?.selected);
      if (selectedSubServices.length > 0) {
        finalServices[`${categoryName}-service`] = {
          selected: true,
          subServices: selectedSubServices,
          category: categoryName
        };
      }
    }
    
    // Save to database by updating parent component
    onServicesUpdate(finalServices);
    onClose();
  };

  const handleSaveAndNext = () => {
    handleExploreServices();
  };

  const handleSkipForNow = () => {
    onClose();
  };

  const selectedCount = Object.keys(tempSelectedServices).filter(key => tempSelectedServices[key]?.selected).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{categoryIcon}</span>
            <div>
              <h2 className="text-xl font-bold">{categoryName}</h2>
              <p className="text-purple-100">Select specific services you need</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-blue-900">
                  💡 Service Selection
                </h3>
              </div>
              <p className="text-sm text-blue-700">
                Choose the specific {categoryName.toLowerCase()} services you need for your event. You can specify quantities for better vendor matching and accurate budget planning.
              </p>
            </div>
          </div>

          <div className="max-h-[50vh] mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subServices.map((service) => (
                <div 
                  key={service.id} 
                  className={`border rounded-lg p-4 transition-all cursor-pointer ${
                    tempSelectedServices[service.id]?.selected 
                      ? 'border-purple-300 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-200 hover:bg-purple-25'
                  }`}
                  onClick={() => handleServiceToggle(service.id, service)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        tempSelectedServices[service.id]?.selected 
                          ? 'bg-purple-500 border-purple-500' 
                          : 'border-gray-300'
                      }`}>
                        {tempSelectedServices[service.id]?.selected && (
                          <Check className="text-white" size={12} />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{service.label}</span>
                    </div>
                    {service.unit && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        per {service.unit}
                      </span>
                    )}
                  </div>

                  {tempSelectedServices[service.id]?.selected && service.unit && (
                    <div className="mt-3 pt-3 border-t border-purple-200" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          value={tempSelectedServices[service.id]?.quantity || ''}
                          onChange={(e) => handleQuantityChange(service.id, parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 text-sm border border-purple-300 rounded focus:ring-2 focus:ring-purple-500"
                          placeholder={service.placeholder || "Qty"}
                        />
                        <span className="text-sm text-gray-500">{service.unit}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                {selectedCount} of {subServices.length} services selected
              </div>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 ml-4">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${(selectedCount / subServices.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSkipForNow}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {hasChanges && (
                <button
                  onClick={handleExploreServices}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Check size={16} />
                  Save Services
                </button>
              )}
              <button
                onClick={handleSaveAndNext}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                OK
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceExpansionModal;