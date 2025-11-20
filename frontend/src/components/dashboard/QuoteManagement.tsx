import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, Clock, Users, MapPin, Calendar, Eye, TrendingUp, CheckCircle, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { toast } from "@/components/ui/use-toast"
import { bookingApi } from "@/services/bookingApi"

interface QuoteManagementProps {
  eventId?: number
  onNavigate?: (component: string) => void
}

export default function QuoteManagement({ eventId, onNavigate }: QuoteManagementProps = {}) {
  const { toast } = useToast()
  const [quotes, setQuotes] = useState<any[]>([])
  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    targeted: 0
  })

  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    try {
      // Get token from Zustand
      const authStorage = localStorage.getItem('auth-storage')
      let token = null
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage)
          token = authData?.state?.tokens?.access
        } catch (e) {
          console.error('Failed to parse auth storage:', e)
        }
      }

      if (!token) {
        setQuotes([])
        setStats({ total: 0, pending: 0, completed: 0, targeted: 0 })
        return
      }

      const url = eventId 
        ? `http://127.0.0.1:8000/api/quote-requests/?event_id=${eventId}`
        : 'http://127.0.0.1:8000/api/quote-requests/'
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const apiQuotes = await response.json()
        
        // Fetch detailed data for each quote
        const quotesWithDetails = await Promise.all(
          apiQuotes.map(async (quote: any) => {
            try {
              const detailResponse = await fetch(`http://127.0.0.1:8000/api/quote-requests/${quote.id}/quote-details/`, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              })
              if (detailResponse.ok) {
                const details = await detailResponse.json()
                return { ...quote, ...details }
              }
            } catch (error) {
              console.error(`Error fetching details for quote ${quote.id}:`, error)
            }
            return quote
          })
        )
        
        setQuotes(quotesWithDetails)
        
        // Calculate real-time stats
        setStats({
          total: quotesWithDetails.length,
          pending: quotesWithDetails.filter(q => q.status === 'pending').length,
          completed: quotesWithDetails.filter(q => q.status === 'completed').length,
          targeted: quotesWithDetails.filter(q => q.quote_type === 'targeted').length
        })
      } else {
        console.error('Failed to load quotes:', response.status, response.statusText)
        setQuotes([])
        setStats({ total: 0, pending: 0, completed: 0, targeted: 0 })
      }
    } catch (error) {
      console.error('Error loading quotes:', error)
      setQuotes([])
      setStats({ total: 0, pending: 0, completed: 0, targeted: 0 })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'low': return <Clock className="h-4 w-4 text-green-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewQuote = async (quote: any) => {
    try {
      const authStorage = localStorage.getItem('auth-storage')
      let token = null
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage)
          token = authData?.state?.tokens?.access
        } catch (e) {}
      }

      if (!token) return

      const response = await fetch(`http://127.0.0.1:8000/api/quote-requests/${quote.id}/quote-details/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const quoteDetails = await response.json()
        setSelectedQuote({ ...quote, ...quoteDetails })
      } else {
        setSelectedQuote(quote)
      }
    } catch (error) {
      console.error('Error fetching quote details:', error)
      setSelectedQuote(quote)
    }
    setIsDetailModalOpen(true)
  }

  const handleClearAllQuotes = async () => {
    if (window.confirm('Are you sure you want to clear all quote requests? This action cannot be undone.')) {
      try {
        const authStorage = localStorage.getItem('auth-storage')
        let token = null
        if (authStorage) {
          try {
            const authData = JSON.parse(authStorage)
            token = authData?.state?.tokens?.access
          } catch (e) {}
        }

        if (!token) return

        const response = await fetch('http://127.0.0.1:8000/api/quote-requests/clear-all/', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          await loadQuotes()
          
          toast({
            title: "Success",
            description: result.message || "All quote requests have been cleared.",
          })
        } else {
          throw new Error('Failed to clear quotes')
        }
      } catch (error) {
        console.error('Error clearing quotes:', error)
        toast({
          title: "Error",
          description: "Failed to clear quote requests. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const loadVendorResponses = async (quoteId: number) => {
    try {
      const authStorage = localStorage.getItem('auth-storage')
      let token = null
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage)
          token = authData?.state?.tokens?.access
        } catch (e) {}
      }

      if (!token) return []

      const response = await fetch(`http://127.0.0.1:8000/api/quote-requests/${quoteId}/responses/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.responses || []
      }
    } catch (error) {
      console.error('Error loading vendor responses:', error)
    }
    return []
  }

  return (
    <div className="p-6 w-full max-w-full mx-0 bg-white min-h-screen">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 mb-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Quote Management</h1>
            <p className="text-white/90">Track and manage all your quote requests</p>
          </div>
          {quotes.length > 0 && (
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleClearAllQuotes}
            >
              Clear All Quotes
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Total Quotes</p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-1">{stats.total}</h3>
              </div>
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-1">{stats.pending}</h3>
              </div>
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-1">{stats.completed}</h3>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Targeted</p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-1">{stats.targeted}</h3>
              </div>
              <TrendingUp className="h-6 w-6 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotes List */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Quote Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No quote requests yet</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  onClick={() => onNavigate?.('dashboard')}
                >
                  Request Your First Quote
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => onNavigate?.('create-event')}
                >
                  Create Event First
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote, index) => (
                <div key={quote.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {quote.event_name || `${quote.event_type?.charAt(0).toUpperCase() + quote.event_type?.slice(1)} Event`}
                        </h3>
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status?.replace('_', ' ') || 'pending'}
                        </Badge>
                        {quote.quote_type === 'targeted' && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            Targeted
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(quote.event_date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {quote.guest_count || 0} guests
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {quote.location || 'Location TBD'}
                        </div>
                      </div>

                      {/* Show services */}
                      {quote.services && Array.isArray(quote.services) && quote.services.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Services Requested:</p>
                          <div className="flex flex-wrap gap-1">
                            {quote.services.slice(0, 3).map((service: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {quote.services.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{quote.services.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quote status info */}
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Quote Status</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{quote.services?.length || 0}</div>
                            <div className="text-blue-700">Services</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{quote.budget_range || 'Not specified'}</div>
                            <div className="text-green-700">Budget</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-600">{quote.urgency || 'medium'}</div>
                            <div className="text-purple-700">Priority</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-orange-600">{Object.keys(quote.vendor_responses || {}).length}</div>
                            <div className="text-orange-700">Responses</div>
                          </div>
                        </div>
                      </div>

                      {/* Vendor Responses Preview */}
                      {quote.vendor_responses && Object.keys(quote.vendor_responses).length > 0 && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="text-sm font-medium text-green-900 mb-2">📋 Vendor Responses ({Object.keys(quote.vendor_responses).length})</h4>
                          <div className="space-y-2">
                            {Object.entries(quote.vendor_responses).slice(0, 3).map(([vendorName, response]: [string, any]) => (
                              <div key={vendorName} className="flex items-center justify-between p-2 bg-white rounded border">
                                <div>
                                  <div className="font-medium text-sm">{vendorName}</div>
                                  <div className="text-xs text-gray-600">{response.vendor_business}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-green-600">₹{response.quote_amount?.toLocaleString()}</div>
                                  <div className="text-xs text-gray-500">{new Date(response.submitted_at).toLocaleDateString()}</div>
                                </div>
                              </div>
                            ))}
                            {Object.keys(quote.vendor_responses).length > 3 && (
                              <div className="text-xs text-center text-gray-600 pt-1">
                                +{Object.keys(quote.vendor_responses).length - 3} more responses
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {getUrgencyIcon(quote.urgency)}
                      <div className="flex flex-col gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewQuote(quote)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {quote.vendor_responses && Object.keys(quote.vendor_responses).length > 0 && (
                          <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                            {Object.keys(quote.vendor_responses).length} Response{Object.keys(quote.vendor_responses).length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedQuote && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {selectedQuote.event_name || `${selectedQuote.event_type} Event`}
                </DialogTitle>
                <DialogDescription>Quote request details and status</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Badge className={getStatusColor(selectedQuote.status)}>
                    {selectedQuote.status?.replace('_', ' ') || 'pending'}
                  </Badge>
                  {selectedQuote.quote_type === 'targeted' && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Targeted Quote
                    </Badge>
                  )}
                  <Badge variant="outline" className="capitalize">
                    {selectedQuote.urgency} Priority
                  </Badge>
                </div>

                {/* Quote Statistics */}
                {selectedQuote.category_stats && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Quote Progress</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-xl font-bold text-blue-600">
                          {selectedQuote.total_vendors_contacted || 0}
                        </div>
                        <div className="text-xs text-gray-600">Vendors Contacted</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-xl font-bold text-green-600">
                          {selectedQuote.total_responses || 0}
                        </div>
                        <div className="text-xs text-gray-600">Responses Received</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <div className="text-xl font-bold text-purple-600">
                          {selectedQuote.total_quotes_submitted || 0}
                        </div>
                        <div className="text-xs text-gray-600">Quotes Submitted</div>
                      </div>
                    </div>
                    
                    {/* Category Breakdown */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-gray-700">Category Breakdown</h5>
                      {Object.entries(selectedQuote.category_stats || {}).map(([category, stats]: [string, any]) => (
                        <div key={category} className="border border-gray-200 rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                            <span className="text-sm text-green-600 font-medium">
                              ₹{stats.budget_allocated?.toLocaleString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div>
                              <div className="text-gray-600">Contacted</div>
                              <div className="font-medium">{stats.vendors_contacted}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Responded</div>
                              <div className="font-medium">{stats.responses_received}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Quotes</div>
                              <div className="font-medium">{stats.quotes_submitted}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Accepted</div>
                              <div className="font-medium text-green-600">{stats.quotes_accepted}</div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Response Rate</span>
                              <span>{Math.round((stats.responses_received / stats.vendors_contacted) * 100)}%</span>
                            </div>
                            <Progress 
                              value={(stats.responses_received / stats.vendors_contacted) * 100} 
                              className="h-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Event Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Type:</strong> {selectedQuote.event_type?.charAt(0).toUpperCase() + selectedQuote.event_type?.slice(1)}</div>
                        <div><strong>Date:</strong> {formatDate(selectedQuote.event_date)}</div>
                        <div><strong>Location:</strong> {selectedQuote.location || 'TBD'}</div>
                        <div><strong>Guests:</strong> {selectedQuote.guest_count || 0}</div>
                        <div><strong>Budget:</strong> {selectedQuote.budget_range || 'Not specified'}</div>
                        <div><strong>Urgency:</strong> {selectedQuote.urgency || 'medium'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Name:</strong> {selectedQuote.client_name}</div>
                        <div><strong>Email:</strong> {selectedQuote.client_email}</div>
                        {selectedQuote.client_phone && (
                          <div><strong>Phone:</strong> {selectedQuote.client_phone}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedQuote.services && Array.isArray(selectedQuote.services) && selectedQuote.services.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Required Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedQuote.services.map((service: string, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedQuote.selected_vendors && selectedQuote.selected_vendors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Selected Vendors ({selectedQuote.selected_vendors.length})</h4>
                    <div className="space-y-2">
                      {selectedQuote.selected_vendors.map((vendor: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">{typeof vendor === 'string' ? vendor : vendor.name}</span>
                          <Badge variant="outline">{typeof vendor === 'string' ? 'Vendor' : vendor.category}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vendor Responses Section */}
                {selectedQuote.vendor_responses && Object.keys(selectedQuote.vendor_responses).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">💼 Vendor Responses ({Object.keys(selectedQuote.vendor_responses).length})</h4>
                    <div className="space-y-4">
                      {Object.entries(selectedQuote.vendor_responses).map(([vendorName, response]: [string, any]) => (
                        <div key={vendorName} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-semibold text-lg">{vendorName}</h5>
                              <p className="text-sm text-gray-600">{response.vendor_business}</p>
                              <p className="text-xs text-gray-500">{response.vendor_location}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">₹{response.quote_amount?.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">{new Date(response.submitted_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          {response.message && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                              <p className="text-sm text-gray-600 bg-white p-2 rounded border">{response.message}</p>
                            </div>
                          )}
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            {response.includes && response.includes.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-green-700 mb-1">✅ What's Included:</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {response.includes.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-center">
                                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {response.excludes && response.excludes.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-red-700 mb-1">❌ What's Not Included:</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {response.excludes.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-center">
                                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          {response.terms && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm font-medium text-gray-700 mb-1">📋 Terms & Conditions:</p>
                              <p className="text-sm text-gray-600 bg-white p-2 rounded border">{response.terms}</p>
                            </div>
                          )}
                          
                          <div className="mt-3 pt-3 border-t flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={async () => {
                                try {
                                  const result = await bookingApi.createBooking(selectedQuote.id, vendorName)
                                  toast({
                                    title: "Booking Created!",
                                    description: `Booking #${result.booking_id} created. Waiting for vendor confirmation.`,
                                  })
                                  await loadQuotes()
                                  setIsDetailModalOpen(false)
                                } catch (error: any) {
                                  toast({
                                    title: "Error",
                                    description: error.message || "Failed to create booking",
                                    variant: "destructive"
                                  })
                                }
                              }}
                            >
                              ✅ Accept Quote
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                onNavigate?.('messages')
                                setTimeout(() => {
                                  window.dispatchEvent(new CustomEvent('openVendorChat', { 
                                    detail: { 
                                      vendorName: vendorName,
                                      vendorId: response.vendor_id,
                                      vendorBusiness: response.vendor_business 
                                    } 
                                  }))
                                }, 100)
                              }}
                            >
                              💬 Contact Vendor
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedQuote.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedQuote.description}
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  <div>Created: {formatDate(selectedQuote.created_at || selectedQuote.createdAt)}</div>
                  {selectedQuote.estimated_response_time && (
                    <div>Expected response: {selectedQuote.estimated_response_time}</div>
                  )}
                  {selectedQuote.vendor_responses && Object.keys(selectedQuote.vendor_responses).length > 0 && (
                    <div className="mt-2 p-2 bg-green-100 rounded">
                      <span className="font-medium text-green-800">🎉 Great news! You have {Object.keys(selectedQuote.vendor_responses).length} vendor response{Object.keys(selectedQuote.vendor_responses).length > 1 ? 's' : ''} to review.</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}