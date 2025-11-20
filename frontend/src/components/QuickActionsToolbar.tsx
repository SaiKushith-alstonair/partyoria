import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  IndianRupee, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  Phone, 
  Video,
  CheckCircle,
  Clock
} from 'lucide-react';

interface QuickActionsToolbarProps {
  userType: 'vendor' | 'customer';
  onSendQuote?: (quoteData: any) => void;
  onUpdateBooking?: (status: string, data: any) => void;
  onScheduleCall?: () => void;
  onSharePortfolio?: () => void;
}

export const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({
  userType,
  onSendQuote,
  onUpdateBooking,
  onScheduleCall,
  onSharePortfolio
}) => {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showBookingUpdate, setShowBookingUpdate] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteDescription, setQuoteDescription] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  const handleSendQuote = () => {
    if (quoteAmount && onSendQuote) {
      onSendQuote({
        amount: parseFloat(quoteAmount),
        description: quoteDescription,
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });
      setQuoteAmount('');
      setQuoteDescription('');
      setShowQuoteForm(false);
    }
  };

  const handleUpdateBooking = () => {
    if (bookingStatus && onUpdateBooking) {
      onUpdateBooking(bookingStatus, {
        notes: bookingNotes,
        updated_at: new Date().toISOString()
      });
      setBookingStatus('');
      setBookingNotes('');
      setShowBookingUpdate(false);
    }
  };

  if (userType === 'vendor') {
    return (
      <div className="border-t p-3 bg-gray-50">
        <div className="flex flex-wrap gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuoteForm(!showQuoteForm)}
            className="gap-1"
          >
            <IndianRupee className="h-4 w-4" />
            Send Quote
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBookingUpdate(!showBookingUpdate)}
            className="gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            Update Booking
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onScheduleCall}
            className="gap-1"
          >
            <Calendar className="h-4 w-4" />
            Schedule Call
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onSharePortfolio}
            className="gap-1"
          >
            <ImageIcon className="h-4 w-4" />
            Share Portfolio
          </Button>
        </div>

        {/* Quote Form */}
        {showQuoteForm && (
          <div className="space-y-2 p-3 border rounded-lg bg-white">
            <h4 className="font-medium text-sm">Send Quote</h4>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Amount (₹)"
                type="number"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
              />
              <Button onClick={handleSendQuote} size="sm">
                Send Quote
              </Button>
            </div>
            <Textarea
              placeholder="Quote description..."
              value={quoteDescription}
              onChange={(e) => setQuoteDescription(e.target.value)}
              rows={2}
            />
          </div>
        )}

        {/* Booking Update Form */}
        {showBookingUpdate && (
          <div className="space-y-2 p-3 border rounded-lg bg-white">
            <h4 className="font-medium text-sm">Update Booking Status</h4>
            <div className="flex gap-2">
              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value)}
                className="flex-1 px-3 py-1 border rounded text-sm"
              >
                <option value="">Select status...</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <Button onClick={handleUpdateBooking} size="sm">
                Update
              </Button>
            </div>
            <Textarea
              placeholder="Additional notes..."
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              rows={2}
            />
          </div>
        )}
      </div>
    );
  }

  // Customer actions
  return (
    <div className="border-t p-3 bg-gray-50">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onScheduleCall}
          className="gap-1"
        >
          <Phone className="h-4 w-4" />
          Request Call
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <Video className="h-4 w-4" />
          Video Chat
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <FileText className="h-4 w-4" />
          View Contract
        </Button>
        
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Response time: ~2h
        </Badge>
      </div>
    </div>
  );
};