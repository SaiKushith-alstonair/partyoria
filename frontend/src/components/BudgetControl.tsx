import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BudgetManager } from './BudgetManager';
import { secureApiService } from '../services/secureApi';
import { Event } from '../types';

interface BudgetControlProps {
  event: Event;
  onClose: () => void;
}

export const BudgetControl: React.FC<BudgetControlProps> = ({ event, onClose }) => {
  const navigate = useNavigate();
  const [showEditor, setShowEditor] = useState(false);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [allocating, setAllocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBudgetData();
  }, [event.id]);

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      const data = await secureApiService.getBudgetSummary(event.id);
      setBudgetData(data);
    } catch (err) {
      console.error('Failed to load budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSmartAllocation = async () => {
    try {
      setAllocating(true);
      await secureApiService.allocateBudget(event.id);
      await loadBudgetData();
    } catch (err) {
      console.error('Smart allocation failed:', err);
      setError(err.message);
    } finally {
      setAllocating(false);
    }
  };

  const handleSaveAllocation = async (allocations: any) => {
    try {
      setAllocating(true);
      await secureApiService.updateBudget(event.id, allocations);
      await loadBudgetData();
      setShowEditor(false);
    } catch (err) {
      console.error('Save allocation failed:', err);
      setError(err.message);
    } finally {
      setAllocating(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-gradient-to-r from-purple-600 to-pink-600';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (showEditor) {
    const currentAllocations = budgetData?.allocations?.reduce((acc: any, alloc: any) => {
      acc[alloc.category] = alloc.percentage;
      return acc;
    }, {}) || {};

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Budget - {event.event_name}</h1>
            <Button onClick={() => setShowEditor(false)} variant="outline">
              Cancel
            </Button>
          </div>
          
          <BudgetManager
            eventId={event.id}
            totalBudget={event.total_budget || 200000}
            onSave={handleSaveAllocation}
            initialAllocations={currentAllocations}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.event_name}</h1>
              <p className="text-gray-600">Budget Management Dashboard</p>
            </div>
            <Button onClick={onClose} variant="outline">
              ← Back
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!budgetData?.has_allocation ? (
          /* No Allocation State */
          <Card className="text-center py-16">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4">No Budget Allocation</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create a smart budget allocation based on your event requirements or set up a custom allocation.
            </p>
            
            <div className="flex justify-center gap-4">
              <Button 
                onClick={handleSmartAllocation}
                disabled={allocating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {allocating ? 'Generating...' : 'Smart Allocation'}
              </Button>
              <Button 
                onClick={() => setShowEditor(true)}
                variant="outline"
              >
                Manual Setup
              </Button>
            </div>
          </Card>
        ) : (
          /* Budget Dashboard */
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="text-2xl font-bold">{formatCurrency(budgetData.event.total_budget)}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                    </svg>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Allocated</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(budgetData.summary.total_allocated)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(budgetData.summary.remaining_budget)}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Efficiency</p>
                    <p className="text-2xl font-bold">{budgetData.summary.efficiency_score}%</p>
                    <Badge className={`${getEfficiencyColor(budgetData.summary.efficiency_score)} text-white`}>
                      {budgetData.summary.efficiency_score >= 90 ? 'Excellent' : 
                       budgetData.summary.efficiency_score >= 75 ? 'Good' : 
                       budgetData.summary.efficiency_score >= 60 ? 'Fair' : 'Poor'}
                    </Badge>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </Card>
            </div>

            {/* Actions */}
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Budget Actions</h3>
                <div className="flex gap-3">
                  <Button onClick={() => setShowEditor(true)} variant="outline">
                    Edit Allocation
                  </Button>
                  <Button onClick={handleSmartAllocation} disabled={allocating}>
                    {allocating ? 'Regenerating...' : 'Regenerate'}
                  </Button>
                  <Button 
                    onClick={() => navigate(`/vendor-marketplace?price_range=0-${budgetData.event.total_budget}&eventId=${event.id}`)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    🎯 Find Vendors
                  </Button>
                </div>
              </div>
            </Card>

            {/* Allocation Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Budget Breakdown</h3>
              <div className="space-y-4">
                {budgetData.allocations.map((allocation: any, index: number) => (
                  <div key={allocation.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${index % 2 === 0 ? 'bg-purple-500' : 'bg-pink-500'}`}></div>
                      <span className="font-medium capitalize">{allocation.category.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(allocation.amount)}</div>
                        <div className="text-sm text-gray-600">{Number(allocation.percentage).toFixed(1)}%</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/vendor-marketplace?price_range=0-${allocation.amount}&category=${allocation.category}&eventId=${event.id}`)}
                        className="text-xs"
                      >
                        Find Vendors
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};