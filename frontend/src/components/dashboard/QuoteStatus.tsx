import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, CheckCircle, AlertCircle, Users, Calendar, 
  MapPin, IndianRupee, Eye, MessageSquare, Phone, Mail 
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface QuoteStatusProps {
  eventId: number;
  eventName: string;
}

export const QuoteStatus: React.FC<QuoteStatusProps> = ({ eventId, eventName }) => {
  const { toast } = useToast();
  const [quoteStatus, setQuoteStatus] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);

  useEffect(() => {
    loadQuoteData();
  }, [eventId]);

  const loadQuoteData = async () => {
    try {
      setLoading(true);
      const [statusData, responsesData] = await Promise.all([
        apiService.getCustomerQuoteStatus(eventId),
        apiService.getQuoteResponses(eventId)
      ]);
      
      setQuoteStatus(statusData);
      setResponses(responsesData.responses || []);
    } catch (error: any) {
      console.error('Error loading quote data:', error);
      const errorMsg = error?.message?.includes('404') ? 'Event not found' : 'Failed to load quote status';
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      setQuoteStatus(null);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'vendors_notified': return 'bg-blue-100 text-blue-800';
      case 'responses_received': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'vendors_notified': return <AlertCircle className="h-4 w-4" />;
      case 'responses_received': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!quoteStatus || quoteStatus.quotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quotes Sent</h3>
          <p className="text-gray-600">No quote requests have been sent for this event yet.</p>
        </CardContent>
      </Card>
    );
  }

  const totalVendors = quoteStatus.quotes.reduce((sum: number, q: any) => sum + q.vendors_contacted, 0);
  const totalResponses = quoteStatus.total_responses;
  const responseRate = totalVendors > 0 ? (totalResponses / totalVendors) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quotes Sent</p>
                <p className="text-2xl font-bold text-purple-600">{quoteStatus.total_quotes_sent}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vendors Contacted</p>
                <p className="text-2xl font-bold text-blue-600">{totalVendors}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Responses</p>
                <p className="text-2xl font-bold text-green-600">{totalResponses}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-orange-600">{responseRate.toFixed(0)}%</p>
              </div>
              <div className="w-8 h-8">
                <Progress value={responseRate} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quote Requests Status */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Requests Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quoteStatus.quotes.map((quote: any) => (
              <div key={quote.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(quote.status)}>
                      {getStatusIcon(quote.status)}
                      <span className="ml-1">{quote.status.replace('_', ' ')}</span>
                    </Badge>
                    <span className="font-medium">{quote.services.join(', ')}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Vendors Contacted:</span>
                    <span className="ml-2 font-medium">{quote.vendors_contacted}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Responses:</span>
                    <span className="ml-2 font-medium">{quote.responses_received}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <span className="ml-2 font-medium capitalize">{quote.urgency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vendor Responses */}
      {responses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vendor Responses ({responses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {responses.map((response: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{response.vendor_name}</h4>
                      <p className="text-gray-600">{response.vendor_business}</p>
                      <p className="text-sm text-gray-500">{response.vendor_location}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(response.quote_amount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(response.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {response.message && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {response.message}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="outline">{response.services.join(', ')}</Badge>
                      <Badge variant="outline" className="capitalize">{response.urgency}</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      {response.vendor_phone && (
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      )}
                      {response.vendor_email && (
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                      )}
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => setSelectedResponse(response)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {response.includes && response.includes.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-1">Includes:</p>
                      <div className="flex flex-wrap gap-1">
                        {response.includes.map((item: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            ✓ {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuoteStatus;