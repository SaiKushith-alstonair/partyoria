import React from 'react';
import { Event, BUDGET_CATEGORIES, EVENT_TYPES, VENUE_TYPES } from '../types';
import { Card } from './ui/card';

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const hasBudgetAllocation = event.budget_allocations && event.budget_allocations.length > 0;
  const totalAllocated = hasBudgetAllocation 
    ? event.budget_allocations!.reduce((sum, allocation) => sum + Number(allocation.amount), 0)
    : 0;

  return (
    <Card 
      className="p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-blue-300"
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {event.event_name}
            </h3>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              {event.event_type && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {EVENT_TYPES[event.event_type]}
                </span>
              )}
              {event.venue_type && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {VENUE_TYPES[event.venue_type]}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {event.total_budget ? formatCurrency(Number(event.total_budget)) : 'No Budget'}
            </div>
            <div className="text-xs text-gray-500">
              {event.form_data?.dateTime ? formatDate(event.form_data.dateTime) : 
               event.created_at ? formatDate(event.created_at) : 'No date'}
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Attendees:</span>
            <span className="ml-2 font-medium">{event.attendees || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-gray-600">Duration:</span>
            <span className="ml-2 font-medium">{event.duration ? `${event.duration}h` : 'Not specified'}</span>
          </div>
        </div>

        {/* Budget Status */}
        <div className="border-t pt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Budget Status</span>
            {hasBudgetAllocation && (
              <span className="text-xs text-green-600 font-medium">Allocated</span>
            )}
          </div>
          
          {hasBudgetAllocation ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Allocated: {formatCurrency(totalAllocated)}</span>
                <span>
                  Remaining: {formatCurrency((Number(event.total_budget) || 0) - totalAllocated)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (totalAllocated / (Number(event.total_budget) || 1)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic">
              No budget allocation yet
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-xs text-gray-500">
            Click to manage budget
          </div>
          <div className="flex space-x-2">
            {hasBudgetAllocation && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Budget Ready
              </span>
            )}
            {!hasBudgetAllocation && event.total_budget && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Needs Allocation
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};