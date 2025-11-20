import React, { useState, useEffect } from 'react';
import { Event, BudgetAllocation, BUDGET_CATEGORIES } from '../types';
import { secureApiService } from '../services/secureApi';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface BudgetEditorProps {
  event: Event;
  currentAllocations: BudgetAllocation[];
  onSave: () => void;
  onCancel: () => void;
}

export const BudgetEditor: React.FC<BudgetEditorProps> = ({ 
  event, 
  currentAllocations, 
  onSave, 
  onCancel 
}) => {
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize allocations from current data or defaults
    const initialAllocations: Record<string, number> = {};
    
    if (currentAllocations.length > 0) {
      currentAllocations.forEach(allocation => {
        initialAllocations[allocation.category] = allocation.percentage;
      });
    } else {
      // Default allocations
      Object.keys(BUDGET_CATEGORIES).forEach(category => {
        initialAllocations[category] = 0;
      });
    }
    
    setAllocations(initialAllocations);
  }, [currentAllocations]);

  const totalPercentage = Object.values(allocations).reduce((sum, value) => sum + value, 0);
  const remainingPercentage = 100 - totalPercentage;
  const totalBudget = event.total_budget || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateAmount = (percentage: number) => {
    return (totalBudget * percentage) / 100;
  };

  const handlePercentageChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      setAllocations(prev => ({
        ...prev,
        [category]: numValue
      }));
    }
  };

  const handleAutoBalance = () => {
    const categories = Object.keys(BUDGET_CATEGORIES);
    const equalPercentage = 100 / categories.length;
    const newAllocations: Record<string, number> = {};
    
    categories.forEach(category => {
      newAllocations[category] = parseFloat(equalPercentage.toFixed(2));
    });
    
    setAllocations(newAllocations);
  };

  const handleSave = async () => {
    if (!event.id) return;
    
    if (Math.abs(totalPercentage - 100) > 0.01) {
      setError('Total allocation must equal 100%');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await secureApiService.updateBudget(event.id, allocations);
      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isValid = Math.abs(totalPercentage - 100) <= 0.01;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold">Edit Budget Allocation</h2>
              </div>
              <p className="text-purple-100 text-lg ml-14">{event.event_name}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 px-6 py-2 font-semibold"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </Button>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-white overflow-y-auto max-h-[calc(95vh-120px)]">
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-100 to-pink-100 border-l-4 border-red-400 rounded-r-lg shadow-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Enhanced Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 border-0 shadow-xl text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                </svg>
              </div>
              <div className="text-sm font-medium text-purple-700 mb-1">Total Budget</div>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(totalBudget)}
              </div>
            </Card>
            
            <Card className={`p-6 border-0 shadow-xl text-center transform hover:scale-105 transition-all duration-300 ${
              isValid ? 'bg-gradient-to-br from-pink-100 to-pink-200' : 'bg-gradient-to-br from-red-100 to-red-200'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ${
                isValid ? 'bg-gradient-to-r from-pink-600 to-purple-600' : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  {isValid ? (
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  ) : (
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  )}
                </svg>
              </div>
              <div className={`text-sm font-medium mb-1 ${
                isValid ? 'text-pink-700' : 'text-red-700'
              }`}>Total Allocated</div>
              <div className={`text-2xl font-bold ${
                isValid ? 'text-pink-900' : 'text-red-900'
              }`}>
                {totalPercentage.toFixed(1)}%
              </div>
            </Card>
            
            <Card className={`p-6 border-0 shadow-xl text-center transform hover:scale-105 transition-all duration-300 ${
              remainingPercentage === 0 ? 'bg-gradient-to-br from-purple-200 to-pink-200' :
              remainingPercentage > 0 ? 'bg-gradient-to-br from-purple-100 to-purple-200' :
              'bg-gradient-to-br from-red-100 to-red-200'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ${
                remainingPercentage === 0 ? 'bg-gradient-to-r from-purple-700 to-pink-700' :
                remainingPercentage > 0 ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className={`text-sm font-medium mb-1 ${
                remainingPercentage === 0 ? 'text-purple-700' :
                remainingPercentage > 0 ? 'text-purple-700' : 'text-red-700'
              }`}>Remaining</div>
              <div className={`text-2xl font-bold ${
                remainingPercentage === 0 ? 'text-purple-900' :
                remainingPercentage > 0 ? 'text-purple-900' : 'text-red-900'
              }`}>
                {remainingPercentage.toFixed(1)}%
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-pink-100 to-pink-200 border-0 shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div className="text-sm font-medium text-pink-700 mb-3">Quick Actions</div>
              <div className="space-y-2">
                <Button 
                  onClick={handleAutoBalance}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Auto Balance
                </Button>
                <Button 
                  onClick={() => {
                    const presets = {
                      catering: 35, venue: 25, decorations: 15, 
                      entertainment: 10, photography: 10, other_services: 5
                    };
                    setAllocations(presets);
                  }}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Wedding Preset
                </Button>
                <Button 
                  onClick={() => {
                    const presets = {
                      catering: 30, venue: 35, decorations: 10, 
                      entertainment: 15, photography: 5, other_services: 5
                    };
                    setAllocations(presets);
                  }}
                  className="w-full bg-gradient-to-r from-purple-700 to-pink-700 text-white font-semibold py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Corporate Preset
                </Button>
              </div>
            </Card>
          </div>

          {/* Enhanced Allocation Editor */}
          <Card className="p-6 mb-8 bg-gradient-to-br from-white to-purple-50 border-0 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">Budget Categories</h3>
            </div>
            <div className="space-y-8">
              {Object.entries(BUDGET_CATEGORIES).map(([category, label], index) => {
                const colors = [
                  'from-purple-500 to-pink-500',
                  'from-purple-600 to-pink-600', 
                  'from-purple-700 to-pink-700',
                  'from-pink-500 to-purple-500',
                  'from-pink-600 to-purple-600',
                  'from-pink-700 to-purple-700'
                ];
                const bgColors = [
                  'from-white to-white',
                  'from-white to-white',
                  'from-white to-white', 
                  'from-white to-white',
                  'from-white to-white',
                  'from-white to-white'
                ];
                return (
                  <div key={category} className={`p-6 bg-gradient-to-br from-white to-purple-50 border border-purple-200 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300`}>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 bg-gradient-to-r ${colors[index % colors.length]} rounded-full mr-3`}></div>
                        <Label className="text-xl font-bold text-gray-900">{label}</Label>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(calculateAmount(allocations[category] || 0))}
                        </div>
                        <div className="text-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg shadow-lg">
                          {(allocations[category] || 0).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="flex-1">
                        <div className="space-y-2">
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={allocations[category] || 0}
                              onChange={(e) => handlePercentageChange(category, e.target.value)}
                              className="pr-12 py-3 text-lg font-semibold border-2 border-purple-300 focus:border-purple-500 rounded-xl shadow-md focus:shadow-lg transition-all duration-200"
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">
                              %
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handlePercentageChange(category, String((allocations[category] || 0) + 5))}
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 text-xs rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              +5%
                            </Button>
                            <Button 
                              onClick={() => handlePercentageChange(category, String(Math.max(0, (allocations[category] || 0) - 5)))}
                              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 text-xs rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              -5%
                            </Button>
                            <Button 
                              onClick={() => handlePercentageChange(category, '0')}
                              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 text-xs rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              Clear
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="w-48">
                        <div className="w-full bg-gradient-to-r from-purple-100 to-pink-100 rounded-full h-10 shadow-inner border border-purple-200">
                          <div 
                            className={`bg-gradient-to-r ${colors[index % colors.length]} h-10 rounded-full transition-all duration-500 flex items-center justify-center shadow-xl`}
                            style={{ width: `${Math.min(100, allocations[category] || 0)}%` }}
                          >
                            <span className="text-white text-xl font-bold drop-shadow-lg">
                              {(allocations[category] || 0).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Enhanced Validation & Action Bar */}
          <Card className={`p-6 border-0 shadow-2xl ${
            isValid ? 'bg-gradient-to-r from-purple-100 to-pink-100' : 'bg-gradient-to-r from-red-100 to-pink-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                  isValid ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-red-500 to-pink-500'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    {isValid ? (
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    )}
                  </svg>
                </div>
                <div>
                  <div className={`text-xl font-bold ${
                    isValid ? 'text-purple-800' : 'text-red-800'
                  }`}>
                    {isValid ? 'Valid Allocation' : 'Invalid Allocation'}
                  </div>
                  <div className={`text-sm ${
                    isValid ? 'text-purple-600' : 'text-red-600'
                  }`}>
                    {isValid ? 'Perfect 100% allocation' : `Current total: ${totalPercentage.toFixed(1)}%`}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="px-8 py-3 border-2 border-purple-300 hover:border-purple-400 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!isValid || saving}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Allocation...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Allocation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};