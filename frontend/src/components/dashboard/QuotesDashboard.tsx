import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/services/api"
import QuoteStatus from "./QuoteStatus"

interface Quote {
  id: number
  vendor: {
    name: string
    business: string
    location: string
    experience: string
  }
  requirement_category: string
  quote_amount: number
  message: string
  includes: string[]
  excludes: string[]
  terms: string
  valid_until: string
  submitted_at: string
}

interface QuotesDashboardProps {
  eventId: number
  eventName: string
  onQuoteAccepted?: () => void
}

export default function QuotesDashboard({ eventId, eventName, onQuoteAccepted }: QuotesDashboardProps) {
  const { toast } = useToast()
  const [sendingQuote, setSendingQuote] = useState(false)

  const handleSendQuote = async () => {
    setSendingQuote(true)
    try {
      const result = await apiService.sendQuotes(eventId)
      
      if (result.success) {
        toast({
          title: "Quote Sent Successfully",
          description: result.message || `Quote requests sent to ${result.vendor_count} vendors`,
        })
      } else {
        toast({
          title: "No Vendors Found",
          description: result.message || "No matching vendors found for this event",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send quote requests",
        variant: "destructive"
      })
    } finally {
      setSendingQuote(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quote Management</h1>
          <p className="text-gray-600">Track your quote requests and vendor responses for {eventName}</p>
        </div>
        <Button 
          onClick={handleSendQuote}
          disabled={sendingQuote}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        >
          {sendingQuote ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Quote Request
            </>
          )}
        </Button>
      </div>
      
      <QuoteStatus eventId={eventId} eventName={eventName} />
    </div>
  )
}