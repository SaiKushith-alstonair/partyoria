import { useState, useEffect } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { FileText, Clock, Users, MapPin, Calendar, IndianRupee, Send } from "lucide-react"
import { apiService } from "../services/api"

interface QuoteRequest {
  id: number
  event_name: string
  event_type: string
  vendor_budget?: number
  budget_percentage?: number
  event_date: string
  location: string
  guest_count: number
  client_name: string
  status: string
  expires_at: string
  has_responded: boolean
}

interface QuoteRequestDetail {
  id: number
  event: {
    name: string
    type: string
    date: string
    duration: string
    location: string
    attendees: number
    description: string
  }
  client: {
    name: string
    email: string
    phone: string
  }
  vendor_budget?: number
  budget_allocation?: number
  vendor_category?: string
  budget_percentage?: number
  has_responded: boolean
}

export default function QuoteRequests() {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequestDetail | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [quoteForm, setQuoteForm] = useState({
    quote_amount: '',
    message: '',
    includes: [''],
    terms: ''
  })

  useEffect(() => {
    loadQuoteRequests()
  }, [])

  const loadQuoteRequests = async () => {
    try {
      setLoading(true)
      const response = await apiService.getVendorQuoteRequests()
      if (response.success && response.quote_requests) {
        setQuoteRequests(Array.isArray(response.quote_requests) ? response.quote_requests : [])
      }
    } catch (error) {
      console.error('Failed to load quote requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadQuoteDetail = async (quoteId: number) => {
    try {
      const response = await apiService.getQuoteRequestDetail(quoteId)
      console.log('Load detail response:', response)
      if (response.success && response.quote_request) {
        setSelectedRequest(response.quote_request)
        setIsDetailModalOpen(true)
        return true
      } else if (response.data) {
        setSelectedRequest(response.data)
        setIsDetailModalOpen(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to load quote detail:', error)
      return false
    }
  }

  const handleSubmitQuote = async () => {
    console.log('Submit clicked - selectedRequest:', selectedRequest)
    console.log('Submit clicked - quoteForm:', quoteForm)
    
    const request = selectedRequest?.quote_request || selectedRequest
    
    if (!request?.id) {
      alert('No request selected')
      return
    }
    
    if (!quoteForm.quote_amount || quoteForm.quote_amount.trim() === '') {
      alert('Please enter a quote amount')
      return
    }

    const amount = parseFloat(quoteForm.quote_amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Quote amount must be a valid positive number')
      return
    }

    try {
      setSubmitting(true)
      console.log('Submitting to API with request ID:', request.id)
      const response = await apiService.submitQuote(request.id, {
        quote_amount: amount,
        message: quoteForm.message || '',
        includes: quoteForm.includes.filter(item => item.trim()),
        excludes: [],
        terms: quoteForm.terms || ''
      })
      
      console.log('API response:', response)
      
      if (response.success) {
        alert('Quote submitted successfully!')
        setIsSubmitModalOpen(false)
        setSelectedRequest(null)
        await loadQuoteRequests()
        setQuoteForm({ quote_amount: '', message: '', includes: [''], terms: '' })
      } else {
        alert('Failed to submit quote: ' + (response.error || 'Unknown error'))
        console.error('Submit failed:', response)
      }
    } catch (error) {
      console.error('Failed to submit quote:', error)
      alert('Error submitting quote')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return '₹' + new Intl.NumberFormat('en-IN').format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quote Requests</h2>
          <p className="text-gray-600">Manage incoming quote requests</p>
        </div>
        <Badge variant="outline">{quoteRequests.length} requests</Badge>
      </div>

      {quoteRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No quote requests</h3>
            <p className="text-gray-600">You'll receive notifications when customers request quotes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quoteRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{request.event_name}</h3>
                    <p className="text-sm text-gray-600">{request.event_type}</p>
                    
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-bold text-green-700">{formatCurrency(request.vendor_budget || 0)}</div>
                          <div className="text-xs text-gray-500">Your Budget</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(request.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{request.guest_count} guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{request.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => loadQuoteDetail(request.id)}>
                      View Details
                    </Button>
                    {!request.has_responded && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={async () => {
                        const loaded = await loadQuoteDetail(request.id)
                        if (loaded) {
                          setTimeout(() => setIsSubmitModalOpen(true), 200)
                        }
                      }}>
                        <Send className="h-4 w-4 mr-1" />
                        Submit Quote
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedRequest.event?.name} - Quote Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Event Details</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Type:</strong> {selectedRequest.event?.type}</div>
                    <div><strong>Date:</strong> {selectedRequest.event?.date ? formatDate(selectedRequest.event.date) : 'N/A'}</div>
                    <div><strong>Location:</strong> {selectedRequest.event?.location}</div>
                    <div><strong>Attendees:</strong> {selectedRequest.event?.attendees}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Client Details</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Name:</strong> {selectedRequest.client?.name}</div>
                    <div><strong>Email:</strong> {selectedRequest.client?.email}</div>
                    <div><strong>Phone:</strong> {selectedRequest.client?.phone}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-900 mb-2">Your Allocated Budget</h4>
                <div className="text-3xl font-bold text-green-900">
                  {formatCurrency(selectedRequest.vendor_budget || selectedRequest.budget_allocation || 0)}
                </div>
                <p className="text-sm text-green-700 mt-1">
                  {selectedRequest.budget_percentage || 0}% of total event budget
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)} className="flex-1">
                  Close
                </Button>
                {!selectedRequest.has_responded && (
                  <Button onClick={() => {
                    setIsDetailModalOpen(false)
                    setTimeout(() => setIsSubmitModalOpen(true), 100)
                  }} className="flex-1 bg-green-600 hover:bg-green-700">
                    Submit Quote
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Submit Modal */}
      {selectedRequest && (
        <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Submit Quote</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Event:</span>
                    <div className="font-medium">{(selectedRequest?.quote_request || selectedRequest)?.event?.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Budget:</span>
                    <div className="font-semibold text-green-600">
                      {formatCurrency((selectedRequest?.quote_request || selectedRequest)?.vendor_budget || (selectedRequest?.quote_request || selectedRequest)?.budget_allocation || 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2">Your Quote Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <Input
                    type="number"
                    min="1"
                    value={quoteForm.quote_amount}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, quote_amount: e.target.value }))}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="Enter amount"
                    className="pl-8 h-12 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Customer budget: {formatCurrency((selectedRequest?.quote_request || selectedRequest)?.vendor_budget || (selectedRequest?.quote_request || selectedRequest)?.budget_allocation || 0)}
                </p>
              </div>

              <div>
                <label className="block font-medium mb-2">Message</label>
                <Textarea
                  value={quoteForm.message}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your services..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Services Included</label>
                <div className="space-y-2">
                  {quoteForm.includes.map((item, index) => (
                    <Input
                      key={index}
                      value={item}
                      onChange={(e) => setQuoteForm(prev => ({
                        ...prev,
                        includes: prev.includes.map((i, idx) => idx === index ? e.target.value : i)
                      }))}
                      placeholder="e.g., Equipment, Setup"
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuoteForm(prev => ({ ...prev, includes: [...prev.includes, ''] }))}
                    className="w-full"
                  >
                    + Add Item
                  </Button>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2">Terms</label>
                <Textarea
                  value={quoteForm.terms}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Payment terms, cancellation policy..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)} className="flex-1" disabled={submitting}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitQuote} disabled={submitting || !quoteForm.quote_amount} className="flex-1 bg-green-600 hover:bg-green-700">
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Quote
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
