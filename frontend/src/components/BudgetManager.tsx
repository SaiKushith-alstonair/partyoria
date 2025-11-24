import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert } from './ui/alert';
import { apiService } from '../services/api';
import { useToast } from '@/hooks/use-toast';

interface BudgetAllocation {
  [category: string]: number;
}

interface BudgetManagerProps {
  eventId: string;
  totalBudget: number;
  onSave: (allocations: BudgetAllocation) => void;
  initialAllocations?: BudgetAllocation;
}

// UNIFIED CATEGORY RULES - Matches backend exactly
const CATEGORY_RULES = {
  catering: { min: 20, max: 50, required: true, label: 'Catering & Food' },
  venue: { min: 15, max: 40, required: true, label: 'Venue & Location' },
  decorations: { min: 5, max: 25, required: false, label: 'Decorations' },
  photography: { min: 5, max: 20, required: false, label: 'Photography/Video' },
  entertainment: { min: 5, max: 20, required: false, label: 'Entertainment' },
  audio_visual: { min: 3, max: 15, required: false, label: 'Audio Visual' },
  lighting: { min: 2, max: 12, required: false, label: 'Lighting' },
  transportation: { min: 2, max: 15, required: false, label: 'Transportation' },
  security: { min: 1, max: 10, required: false, label: 'Security' },
  contingency: { min: 5, max: 15, required: true, label: 'Contingency' }
};

// UNIFIED EVENT PRESETS - Matches backend exactly
const EVENT_PRESETS = {
  wedding: { catering: 30, venue: 25, decorations: 15, photography: 12, entertainment: 8, lighting: 3, contingency: 7 },
  corporate: { venue: 35, catering: 25, audio_visual: 15, entertainment: 8, photography: 5, transportation: 7, contingency: 5 },
  birthday: { catering: 35, venue: 20, entertainment: 20, decorations: 12, photography: 6, contingency: 7 }
};

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  eventId,
  totalBudget,
  onSave,
  initialAllocations = {}
}) => {
  const { toast } = useToast();
  const [allocations, setAllocations] = useState<BudgetAllocation>(initialAllocations);
  const [errors, setErrors] = useState<string[]>([]);
  const [lockedCategories, setLockedCategories] = useState<Set<string>>(new Set());
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);

  const validateAllocation = useCallback((allocs: BudgetAllocation): string[] => {
    const validationErrors: string[] = [];
    const total = Object.values(allocs).reduce((sum, val) => sum + val, 0);

    // Check total is 100%
    if (Math.abs(total - 100) > 0.01) {
      validationErrors.push(`Total must be 100%, currently ${total.toFixed(1)}%`);
    }

    // Check category rules
    Object.entries(allocs).forEach(([category, percentage]) => {
      const rule = CATEGORY_RULES[category as keyof typeof CATEGORY_RULES];
      if (rule) {
        if (percentage < rule.min) {
          validationErrors.push(`${rule.label}: minimum ${rule.min}%, got ${percentage}%`);
        }
        if (percentage > rule.max) {
          validationErrors.push(`${rule.label}: maximum ${rule.max}%, got ${percentage}%`);
        }
      }
    });

    // Check required categories
    Object.entries(CATEGORY_RULES).forEach(([category, rule]) => {
      if (rule.required && (!allocs[category] || allocs[category] === 0)) {
        validationErrors.push(`Required: ${rule.label}`);
      }
    });

    return validationErrors;
  }, []);

  const handleAllocationChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newAllocations = { ...allocations, [category]: numValue };
    setAllocations(newAllocations);
    
    // Real-time validation
    const validationErrors = validateAllocation(newAllocations);
    setErrors(validationErrors);
  };

  const rebalanceUnlocked = () => {
    const locked = Array.from(lockedCategories);
    const lockedTotal = locked.reduce((sum, cat) => sum + (allocations[cat] || 0), 0);
    const remaining = 100 - lockedTotal;
    
    const unlocked = Object.keys(allocations).filter(cat => !lockedCategories.has(cat));
    
    if (unlocked.length === 0 || remaining <= 0) return;
    
    const newAllocations = { ...allocations };
    const equalShare = remaining / unlocked.length;
    
    unlocked.forEach(category => {
      newAllocations[category] = parseFloat(equalShare.toFixed(1));
    });
    
    setAllocations(newAllocations);
    setErrors(validateAllocation(newAllocations));
  };

  const applyPreset = (preset: keyof typeof EVENT_PRESETS) => {
    const presetData = EVENT_PRESETS[preset];
    setAllocations(presetData);
    setErrors(validateAllocation(presetData));
    setLockedCategories(new Set());
  };

  const toggleLock = (category: string) => {
    const newLocked = new Set(lockedCategories);
    if (newLocked.has(category)) {
      newLocked.delete(category);
    } else {
      newLocked.add(category);
    }
    setLockedCategories(newLocked);
  };

  const calculateAmount = (percentage: number) => {
    return (totalBudget * percentage) / 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalPercentage = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  const isValid = errors.length === 0;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button onClick={() => applyPreset('wedding')} variant="outline" size="sm">
            Wedding Preset
          </Button>
          <Button onClick={() => applyPreset('corporate')} variant="outline" size="sm">
            Corporate Preset
          </Button>
          <Button onClick={() => applyPreset('birthday')} variant="outline" size="sm">
            Birthday Preset
          </Button>
          <Button onClick={rebalanceUnlocked} variant="outline" size="sm">
            Rebalance Unlocked
          </Button>
        </div>
        
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className={`p-3 rounded ${isValid ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="font-bold">{totalPercentage.toFixed(1)}%</div>
            <div className="text-sm">Total Allocated</div>
          </div>
          <div className="p-3 bg-blue-100 rounded">
            <div className="font-bold">{formatCurrency(totalBudget)}</div>
            <div className="text-sm">Total Budget</div>
          </div>
          <div className="p-3 bg-purple-100 rounded">
            <div className="font-bold">{Object.keys(allocations).length}</div>
            <div className="text-sm">Categories</div>
          </div>
        </div>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Category Allocations */}
      <div className="grid gap-4">
        {Object.entries(CATEGORY_RULES).map(([category, rule]) => {
          const percentage = allocations[category] || 0;
          const amount = calculateAmount(percentage);
          const isLocked = lockedCategories.has(category);
          const hasError = errors.some(error => error.includes(rule.label));

          return (
            <Card key={category} className={`p-4 ${hasError ? 'border-red-300' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{rule.label}</span>
                  {rule.required && <span className="text-red-500 text-sm">*</span>}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLock(category)}
                    className={isLocked ? 'text-blue-600' : 'text-gray-400'}
                  >
                    {isLocked ? '🔒' : '🔓'}
                  </Button>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(amount)}</div>
                  <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    min={rule.min}
                    max={rule.max}
                    step="0.1"
                    value={percentage}
                    onChange={(e) => handleAllocationChange(category, e.target.value)}
                    disabled={isLocked}
                    className={hasError ? 'border-red-300' : ''}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Range: {rule.min}% - {rule.max}%
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAllocationChange(category, String(percentage + 5))}
                    disabled={isLocked}
                  >
                    +5%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAllocationChange(category, String(Math.max(0, percentage - 5)))}
                    disabled={isLocked}
                  >
                    -5%
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    hasError ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, (percentage / rule.max) * 100)}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button
          onClick={async () => {
            try {
              setSaving(true);
              await onSave(allocations);
              
              // Trigger quote requests after successful budget save
              const response = await apiService.sendQuoteRequests(parseInt(eventId));
              if (response.success) {
                toast({
                  title: "Budget Saved & Quotes Sent!",
                  description: `Quotes sent to ${response.vendor_count} vendors. You'll receive notifications when they respond.`,
                });
                
                // Navigate to dashboard after a short delay to show the toast
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 2000);
              }
            } catch (error) {
              console.error('Error saving budget or sending quotes:', error);
              toast({
                title: "Error",
                description: "Failed to save budget or send quotes",
                variant: "destructive"
              });
            } finally {
              setSaving(false);
            }
          }}
          disabled={!isValid || saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? 'Saving & Sending Quotes...' : 'Save Budget & Send Quotes'}
        </Button>
      </div>
    </div>
  );
};