import React from 'react';
import { BudgetManagement } from '../BudgetManagement';

interface BudgetAnalyticsProps {
  onNavigate?: (component: string) => void;
  onEventSelect?: (event: any) => void;
}

export default function BudgetAnalytics({ onNavigate, onEventSelect }: BudgetAnalyticsProps = {}) {
  return <BudgetManagement onEventSelect={onEventSelect} />;
}