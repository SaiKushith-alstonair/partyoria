import { useState, useCallback } from 'react';
import { secureApiService } from '../services/secureApi';

interface BudgetAllocation {
  [category: string]: number;
}

interface BudgetValidation {
  valid: boolean;
  errors: string[];
  total_percentage: number;
}

interface UseBudgetReturn {
  allocating: boolean;
  validating: boolean;
  error: string | null;
  allocateBudget: (eventId: string) => Promise<any>;
  updateBudget: (eventId: string, allocations: BudgetAllocation) => Promise<any>;
  validateBudget: (allocations: BudgetAllocation, totalBudget: number) => Promise<BudgetValidation>;
  rebalanceBudget: (eventId: string, allocations: BudgetAllocation, lockedCategories: string[]) => Promise<any>;
}

export const useBudget = (): UseBudgetReturn => {
  const [allocating, setAllocating] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allocateBudget = useCallback(async (eventId: string) => {
    try {
      setAllocating(true);
      setError(null);
      
      const response = await fetch(`/api/events/${eventId}/budget/allocate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to allocate budget');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setAllocating(false);
    }
  }, []);

  const updateBudget = useCallback(async (eventId: string, allocations: BudgetAllocation) => {
    try {
      setAllocating(true);
      setError(null);
      
      const response = await fetch(`/api/events/${eventId}/budget/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ allocations }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.join(', ') || 'Failed to update budget');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setAllocating(false);
    }
  }, []);

  const validateBudget = useCallback(async (allocations: BudgetAllocation, totalBudget: number): Promise<BudgetValidation> => {
    try {
      setValidating(true);
      setError(null);
      
      const response = await fetch('/api/events/budget/validate/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ allocations, total_budget: totalBudget }),
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return { valid: false, errors: [err.message], total_percentage: 0 };
    } finally {
      setValidating(false);
    }
  }, []);

  const rebalanceBudget = useCallback(async (eventId: string, allocations: BudgetAllocation, lockedCategories: string[]) => {
    try {
      setAllocating(true);
      setError(null);
      
      const response = await fetch(`/api/events/${eventId}/budget/rebalance/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ allocations, locked_categories: lockedCategories }),
      });

      if (!response.ok) {
        throw new Error('Failed to rebalance budget');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setAllocating(false);
    }
  }, []);

  return {
    allocating,
    validating,
    error,
    allocateBudget,
    updateBudget,
    validateBudget,
    rebalanceBudget,
  };
};