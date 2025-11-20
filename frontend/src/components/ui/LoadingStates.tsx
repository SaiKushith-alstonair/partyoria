import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';

// Loading Spinner
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
  );
};

// Full Page Loading
export const PageLoading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="loading-overlay">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-2 text-gray-600">{message}</p>
    </div>
  </div>
);

// Skeleton Loader
export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`loading-skeleton rounded ${className}`} />
);

// Empty State
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="empty-state">
    <div className="empty-state-icon">
      {icon || <Inbox className="w-full h-full" />}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    {description && <p className="text-gray-600 mb-4">{description}</p>}
    {action}
  </div>
);

// Error State
export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Something went wrong', message, onRetry }) => (
  <div className="error-state">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-semibold text-error-800">{title}</h4>
        <p className="text-error-700 mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-error-600 hover:text-error-800 underline"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  </div>
);

// Form Field Error
export const FieldError: React.FC<{ message: string }> = ({ message }) => (
  <div className="form-error">
    <AlertCircle className="w-4 h-4" />
    <span>{message}</span>
  </div>
);

// Default export for backward compatibility
export default LoadingSpinner;