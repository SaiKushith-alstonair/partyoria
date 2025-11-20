import React from 'react';

// Re-export everything from LoadingStates for backward compatibility
export { 
  LoadingSpinner, 
  PageLoading, 
  SkeletonLoader, 
  EmptyState, 
  ErrorState, 
  FieldError 
} from './LoadingStates';

// Import for default export and legacy components
import { LoadingSpinner, PageLoading } from './LoadingStates';

// Legacy components for backward compatibility
export const LoadingState = PageLoading;
export const ButtonLoadingSpinner: React.FC = () => {
  return (
    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );
};

// Default export
export default LoadingSpinner;