import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  onRetry?: () => void;
  retryCount?: number;
}

export const MessageStatus: React.FC<MessageStatusProps> = ({ 
  status, 
  onRetry, 
  retryCount = 0 
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400 animate-spin" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-500" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return (
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-red-500" />
            {retryCount < 3 && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="h-4 w-4 p-0"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-end">
      {getStatusIcon()}
    </div>
  );
};