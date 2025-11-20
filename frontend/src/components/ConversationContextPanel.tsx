import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, IndianRupee, MapPin, Clock, User, Phone } from 'lucide-react';

interface ConversationContext {
  event_id?: number;
  event_title?: string;
  event_date?: string;
  event_budget?: number;
  booking_status?: string;
  service_category?: string;
  requirements?: string;
  metadata?: any;
}

interface ConversationContextPanelProps {
  context?: ConversationContext;
  otherUser: {
    id: number;
    username: string;
    user_type: 'vendor' | 'customer';
    display_name?: string;
  };
  onUpdateContext?: (updates: Partial<ConversationContext>) => void;
}

export const ConversationContextPanel: React.FC<ConversationContextPanelProps> = ({
  context,
  otherUser,
  onUpdateContext
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          {otherUser.display_name || otherUser.username}
        </CardTitle>
        <Badge variant="secondary">{otherUser.user_type}</Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Event Details */}
        {context?.event_title && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Event Details</h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{context.event_title}</span>
              </div>
              
              {context.event_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(context.event_date)}</span>
                </div>
              )}
              
              {context.event_budget && (
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee className="h-4 w-4 text-gray-500" />
                  <span>${context.event_budget.toLocaleString()}</span>
                </div>
              )}
              
              {context.service_category && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{context.service_category}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking Status */}
        {context?.booking_status && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Booking Status</h3>
            <Badge className={getStatusColor(context.booking_status)}>
              {context.booking_status.charAt(0).toUpperCase() + context.booking_status.slice(1)}
            </Badge>
          </div>
        )}

        {/* Requirements */}
        {context?.requirements && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Requirements</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {context.requirements}
            </p>
          </div>
        )}

        {/* Contact Actions */}
        <div className="space-y-2 pt-4 border-t">
          <h3 className="font-semibold text-sm">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-1" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Metadata */}
        {context?.metadata && Object.keys(context.metadata).length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Additional Info</h3>
            <div className="text-xs space-y-1">
              {Object.entries(context.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-500">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};