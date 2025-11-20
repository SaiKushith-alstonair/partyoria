import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, Users, MapPin, IndianRupee, Package, Building, Wrench, Send, Sparkles, Clock, Star, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService, ApiEvent, convertQuoteFormToApiData } from "@/services/api"

interface RequotePageProps {
  onNavigate?: (component: string) => void
}

export default function RequotePage({ onNavigate }: RequotePageProps = {}) {
  const { toast } = useToast()
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null)
  const [loading, setLoading] = useState(false)
  const [sendingQuote, setSendingQuote] = useState(false)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [budgetData, setBudgetData] = useState<any>(null)
  const [quoteForm, setQuoteForm] = useState({
    urgency: 'medium',
    specialRequirements: '',
    contactPreference: 'email'
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const apiEvents = await apiService.getUserEvents()
      setEvents(apiEvents)
    } catch (error) {
      // Fallback to localStorage
      const userStr = sessionStorage.getItem('partyoria_user') || localStorage.getItem('partyoria_user')
      if (userStr) {
        const user = JSON.parse(userStr)
        const userId = user.id || user.email || user.username
        const userEventsKey = `userEvents_${userId}`
        const localEvents = JSON.parse(localStorage.getItem(userEventsKey) || '[]')
        setEvents(localEvents)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEventSelect = (eventId: string) => {
    const event = events.find(e => e.id?.toString() === eventId)
    setSelectedEvent(event || null)
  }

  const getAllVendorsAndServices = (event: ApiEvent) => {
    const allItems: Array<{name: string, type: 'vendor' | 'service' | 'requirement', category?: string}> = []
    
    console.log('Event data:', event)
    console.log('Selected services:', event.selected_services)
    console.log('Form data selected services:', event.form_data?.selectedServices)
    console.log('Special requirements:', event.special_requirements)
    
    // Add selected services
    if (event.selected_services) {
      event.selected_services.forEach(service => {
        allItems.push({ name: service, type: 'service' })
      })
    }

    // Add services from form data
    if (event.form_data?.selectedServices) {
      event.form_data.selectedServices.forEach((service: string) => {
        if (!allItems.find(item => item.name === service)) {
          allItems.push({ name: service, type: 'service' })
        }
      })
    }

    // Add vendor services
    if (event.form_data?.selectedVendorServices) {
      event.form_data.selectedVendorServices.forEach((vendor: any) => {
        const name = typeof vendor === 'string' ? vendor : vendor.name || vendor.service
        if (name && !allItems.find(item => item.name === name)) {
          allItems.push({ name, type: 'vendor', category: vendor.category })
        }
      })
    }

    // Add special requirements as vendors
    if (event.special_requirements) {
      Object.entries(event.special_requirements).forEach(([reqId, reqData]: [string, any]) => {
        if (reqData.selected) {
          const name = reqData.label || reqId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          const displayName = reqData.quantity ? `${name} (${reqData.quantity}${reqData.unit ? ' ' + reqData.unit : ''})` : name
          allItems.push({ name: displayName, type: 'requirement' })
        }
      })
    }

    console.log('All items found:', allItems)
    return allItems
  }

  const handleSendQuote = async () => {
    if (!selectedEvent) return
    
    // Load budget data
    try {
      const budget = await apiService.getBudgetSummary(selectedEvent.id!)
      setBudgetData(budget)
    } catch (error) {
      // Fallback to localStorage budget data
      const userStr = sessionStorage.getItem('partyoria_user') || localStorage.getItem('partyoria_user')
      if (userStr) {
        const user = JSON.parse(userStr)
        const userId = user.id || user.email || user.username
        const budgetKey = `eventBudget_${selectedEvent.id}_${userId}`
        const localBudget = JSON.parse(localStorage.getItem(budgetKey) || 'null')
        setBudgetData(localBudget)
      }
    }
    
    setShowQuoteForm(true)
  }

  const sendQuoteRequest = async () => {
    if (!selectedEvent) return

    setSendingQuote(true)
    try {
      const allItems = getAllVendorsAndServices(selectedEvent)
      
      const quoteData = {
        event_type: selectedEvent.event_type || 'other',
        event_name: selectedEvent.event_name,
        client_name: selectedEvent.form_data?.clientName || 'Client',
        client_email: selectedEvent.form_data?.clientEmail || '',
        client_phone: selectedEvent.form_data?.clientPhone || '',
        event_date: selectedEvent.form_data?.dateTime?.split('T')[0] || new Date().toISOString().split('T')[0],
        location: `${selectedEvent.form_data?.city || ''}, ${selectedEvent.form_data?.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'TBD',
        guest_count: selectedEvent.attendees || selectedEvent.form_data?.attendees || 0,
        budget_range: selectedEvent.total_budget?.toString() || selectedEvent.form_data?.budget?.toString() || 'Not specified',
        services: allItems.map(item => item.name),
        description: `Event Details: ${selectedEvent.form_data?.description || 'No description provided'}\n\nAdditional Requirements: ${quoteForm.specialRequirements}\n\nContact Preference: ${quoteForm.contactPreference}`,
        urgency: quoteForm.urgency,
        quote_type: 'comprehensive',
        prefilled_event_id: selectedEvent.id,
        selected_vendors: allItems.filter(item => item.type === 'vendor').map(item => ({ name: item.name, category: item.category || 'General' })),
        selected_venues: allItems.filter(item => item.type === 'service' && item.name.toLowerCase().includes('venue')).map(item => ({ name: item.name })),
        budget_breakdown: budgetData?.allocations || {},
        total_budget: budgetData?.total_budget || selectedEvent.total_budget
      }

      await apiService.createQuoteRequest(quoteData)
      
      toast({
        title: "Quote Request Sent",
        description: "Your quote request has been sent successfully to all relevant vendors.",
      })

      setShowQuoteForm(false)
      if (onNavigate) {
        onNavigate('quotes')
      } else {
        window.location.href = '/dashboard'
      }
    } catch (error) {
      const userStr = sessionStorage.getItem('partyoria_user') || localStorage.getItem('partyoria_user')
      if (userStr) {
        const user = JSON.parse(userStr)
        const userId = user.id || user.email || user.username
        const userQuotesKey = `userQuotes_${userId}`
        const existingQuotes = JSON.parse(localStorage.getItem(userQuotesKey) || '[]')
        
        const allItems = getAllVendorsAndServices(selectedEvent!)
        const newQuote = {
          id: Date.now(),
          event_type: selectedEvent!.event_type || 'other',
          event_name: selectedEvent!.event_name,
          client_name: selectedEvent!.form_data?.clientName || 'Client',
          client_email: selectedEvent!.form_data?.clientEmail || '',
          event_date: selectedEvent!.form_data?.dateTime?.split('T')[0] || new Date().toISOString().split('T')[0],
          location: `${selectedEvent!.form_data?.city || ''}, ${selectedEvent!.form_data?.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'TBD',
          guest_count: selectedEvent!.attendees || selectedEvent!.form_data?.attendees || 0,
          budget_range: selectedEvent!.total_budget?.toString() || selectedEvent!.form_data?.budget?.toString() || 'Not specified',
          services: allItems.map(item => item.name),
          status: 'pending',
          urgency: quoteForm.urgency,
          quote_type: 'comprehensive',
          selected_vendors: allItems.filter(item => item.type === 'vendor').map(item => ({ name: item.name, category: item.category || 'General' })),
          vendor_count: allItems.filter(item => item.type === 'vendor').length,
          budget_breakdown: budgetData?.allocations || {},
          total_budget: budgetData?.total_budget || selectedEvent!.total_budget,
          description: `${selectedEvent!.form_data?.description || ''}\n\n${quoteForm.specialRequirements}`,
          contact_preference: quoteForm.contactPreference,
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
        
        existingQuotes.push(newQuote)
        localStorage.setItem(userQuotesKey, JSON.stringify(existingQuotes))
        
        toast({
          title: "Quote Request Created",
          description: "Your quote request has been saved locally.",
        })
        
        setShowQuoteForm(false)
        if (onNavigate) {
          onNavigate('quotes')
        } else {
          window.location.href = '/dashboard'
        }
      }
    } finally {
      setSendingQuote(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTypeIcon = (type: 'vendor' | 'service' | 'requirement') => {
    switch (type) {
      case 'vendor': return <Building className="h-5 w-5 text-blue-600" />
      case 'service': return <Package className="h-5 w-5 text-green-600" />
      case 'requirement': return <Wrench className="h-5 w-5 text-purple-600" />
      default: return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="p-6 w-full max-w-full mx-0 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-8 mb-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-8 w-8 text-yellow-300" />
            <h1 className="text-3xl font-bold text-white">Request Quote</h1>
          </div>
          <p className="text-white/90 text-lg">Select an event to send comprehensive quote requests to all vendors</p>
        </div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Event Selection */}
      <Card className="mb-8 border-0 shadow-xl bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-6 w-6 text-purple-600" />
            Select Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500 mb-6">Create your first event to start requesting quotes</p>
              <Button 
                onClick={() => onNavigate?.('dashboard')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Create Your First Event
              </Button>
            </div>
          ) : (
            <Select onValueChange={handleEventSelect}>
              <SelectTrigger className="w-full h-14 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
                <SelectValue placeholder="🎉 Choose an event to request quotes for" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white border shadow-lg">
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id?.toString() || ''} className="py-3 px-4 hover:bg-gray-50 focus:bg-gray-50">
                    <div className="flex items-center gap-3 w-full">
                      <span className="font-semibold text-gray-900">{event.event_name}</span>
                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                        {event.event_type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Selected Event Details */}
      {selectedEvent && !showQuoteForm && (
        <div className="space-y-6">
          {/* Event Overview */}
          <Card className="mb-8 border-0 shadow-xl bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Star className="h-6 w-6 text-yellow-500" />
                Event Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-600 rounded-full p-2">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-purple-700">Date</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedEvent.form_data?.dateTime ? 
                      formatDate(selectedEvent.form_data.dateTime) : 
                      'Date TBD'
                    }
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 rounded-full p-2">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-blue-700">Guests</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedEvent.attendees || selectedEvent.form_data?.attendees || 0} people
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-600 rounded-full p-2">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-green-700">Location</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {`${selectedEvent.form_data?.city || ''}, ${selectedEvent.form_data?.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'Location TBD'}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-yellow-600 rounded-full p-2">
                      <IndianRupee className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-yellow-700">Budget</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ₹{selectedEvent.total_budget?.toLocaleString() || selectedEvent.form_data?.budget?.toLocaleString() || 'TBD'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Services, Vendors & Requirements */}
          <Card className="mb-8 border-0 shadow-xl bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="h-6 w-6 text-indigo-600" />
                Quote Items
              </CardTitle>
              <p className="text-gray-600 mt-2">
                All services, vendors, and special requirements that will be included in the quote request
              </p>
            </CardHeader>
            <CardContent>
              {(() => {
                const allItems = getAllVendorsAndServices(selectedEvent)
                
                if (allItems.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <Package className="h-10 w-10 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                      <p className="text-gray-500">No services or requirements found for this event</p>
                    </div>
                  )
                }

                const groupedItems = {
                  services: allItems.filter(item => item.type === 'service'),
                  vendors: allItems.filter(item => item.type === 'vendor'),
                  requirements: allItems.filter(item => item.type === 'requirement')
                }

                return (
                  <div className="space-y-6">
                    {Object.entries(groupedItems).map(([type, items]) => {
                      if (items.length === 0) return null
                      
                      return (
                        <div key={type} className="mb-8">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-xl ${
                              type === 'services' ? 'bg-green-100' :
                              type === 'vendors' ? 'bg-blue-100' : 'bg-purple-100'
                            }`}>
                              {getTypeIcon(type as any)}
                            </div>
                            <h4 className="text-lg font-semibold capitalize text-gray-900">
                              {type} ({items.length})
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {items.map((item, idx) => (
                              <div 
                                key={idx} 
                                className={`p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                                  item.type === 'service' ? 'bg-green-50 border-green-200 hover:border-green-300' :
                                  item.type === 'vendor' ? 'bg-blue-50 border-blue-200 hover:border-blue-300' :
                                  'bg-purple-50 border-purple-200 hover:border-purple-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(item.type)}
                                  <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {type !== 'requirements' && <Separator className="mt-6 opacity-30" />}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </CardContent>
          </Card>

          {!showQuoteForm && (
            <div className="flex justify-center">
              <Button 
                onClick={handleSendQuote}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-12 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
                <Send className="h-5 w-5 mr-3" />
                Continue to Quote Form
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Quote Form - Separate Page */}
      {selectedEvent && showQuoteForm && (
        <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-purple-600" />
                  Quote Request Form
                </CardTitle>
                <p className="text-gray-600">Complete details for <strong>{selectedEvent.event_name}</strong></p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Budget Breakdown */}
                {budgetData && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-green-600" />
                      Budget Allocation
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {budgetData.allocations && (Array.isArray(budgetData.allocations) ? 
                        budgetData.allocations.map((item: any, index: number) => (
                          <div key={index} className="bg-white rounded-lg p-4 border shadow-sm">
                            <p className="text-sm font-medium text-gray-700 mb-2">{item.category || `Category ${index + 1}`}</p>
                            <p className="text-xl font-bold text-green-600 mb-1">₹{item.amount?.toLocaleString()}</p>
                            <p className="text-sm text-gray-500 mb-2">{item.percentage?.toFixed(1)}%</p>
                            {item.per_guest_cost > 0 && (
                              <div className="text-xs text-gray-600 space-y-1">
                                <p>Per Guest: ₹{item.per_guest_cost?.toLocaleString()}</p>
                                <p>Per Hour: ₹{item.per_hour_cost?.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        )) :
                        Object.entries(budgetData.allocations).map(([category, data]: [string, any]) => (
                          <div key={category} className="bg-white rounded-lg p-4 border shadow-sm">
                            <p className="text-sm font-medium text-gray-700 mb-2">{category}</p>
                            <p className="text-xl font-bold text-green-600 mb-1">₹{data.amount?.toLocaleString()}</p>
                            <p className="text-sm text-gray-500 mb-2">{data.percentage?.toFixed(1)}%</p>
                            {data.per_guest_cost > 0 && (
                              <div className="text-xs text-gray-600 space-y-1">
                                <p>Per Guest: ₹{data.per_guest_cost?.toLocaleString()}</p>
                                <p>Per Hour: ₹{data.per_hour_cost?.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t">
                      <p className="font-semibold text-gray-900">Total Budget: ₹{budgetData.total_budget?.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {/* Quote Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="urgency">Priority Level</Label>
                    <Select value={quoteForm.urgency} onValueChange={(value) => setQuoteForm({...quoteForm, urgency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="contact">Contact Preference</Label>
                    <Select value={quoteForm.contactPreference} onValueChange={(value) => setQuoteForm({...quoteForm, contactPreference: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="requirements">Additional Requirements</Label>
                  <Textarea 
                    id="requirements"
                    placeholder="Any specific requirements or notes for vendors..."
                    value={quoteForm.specialRequirements}
                    onChange={(e) => setQuoteForm({...quoteForm, specialRequirements: e.target.value})}
                    rows={3}
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Quote Summary</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Event: {selectedEvent.event_name}</p>
                    <p>• Items: {getAllVendorsAndServices(selectedEvent).length} services/vendors</p>
                    <p>• Budget: ₹{selectedEvent.total_budget?.toLocaleString() || selectedEvent.form_data?.budget?.toLocaleString() || 'TBD'}</p>
                    <p>• Priority: {quoteForm.urgency}</p>
                  </div>
                </div>

                <div className="flex gap-4 justify-end pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowQuoteForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={sendQuoteRequest}
                    disabled={sendingQuote}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8"
                  >
                    {sendingQuote ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Quote...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Quote Request
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}