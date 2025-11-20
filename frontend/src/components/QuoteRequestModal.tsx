import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, IndianRupee, FileText, Send, CheckCircle, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QuoteRequestModalProps {
  isOpen: boolean
  onClose: () => void
  prefilledEvent?: any
  selectedVendors?: any[]
  selectedVenues?: any[]
}

interface QuoteRequest {
  eventType: string
  eventName: string
  clientName: string
  clientEmail: string
  clientPhone: string
  eventDate: string
  location: string
  guestCount: number
  budget: string
  selectedVendors: string[]
  selectedVenues: string[]
  specialRequirements: string
  urgency: 'low' | 'medium' | 'high'
}

const eventTypes = [
  'Wedding', 'Birthday Party', 'Corporate Event', 'Anniversary', 'Festival Celebration',
  'Baby Shower', 'Graduation Party', 'Engagement', 'Housewarming', 'Other'
]

const vendorServices = [
  'Catering', 'Photography', 'Videography', 'Music & DJ', 'Decoration', 
  'Flowers', 'Transportation', 'Entertainment', 'Security', 'Lighting', 
  'Sound System', 'Event Planning', 'Coordination'
]

const venueTypes = [
  'Banquet Hall', 'Hotel', 'Resort', 'Garden/Outdoor', 'Community Center',
  'Restaurant', 'Beach', 'Farmhouse', 'Palace/Heritage', 'Rooftop'
]

const getBudgetRange = (budget: number): string => {
  if (budget < 50000) return 'under-50k'
  if (budget < 100000) return '50k-1l'
  if (budget < 200000) return '1l-2l'
  if (budget < 500000) return '2l-5l'
  if (budget < 1000000) return '5l-10l'
  return 'above-10l'
}

const getPreselectedVendors = (vendors: any[], selectedServices: any[] = []): string[] => {
  const services = new Set<string>()
  
  // Add from selected vendors (excluding venues)
  vendors.forEach(vendor => {
    if (vendor.category && !vendor.category.toLowerCase().includes('venue')) {
      const category = vendor.category.toLowerCase()
      if (category.includes('photo')) services.add('Photography')
      if (category.includes('video')) services.add('Videography')
      if (category.includes('cater')) services.add('Catering')
      if (category.includes('decor')) services.add('Decoration')
      if (category.includes('music') || category.includes('dj')) services.add('Music & DJ')
      if (category.includes('flower')) services.add('Flowers')
      if (category.includes('transport')) services.add('Transportation')
      if (category.includes('entertain')) services.add('Entertainment')
      if (category.includes('light')) services.add('Lighting')
      if (category.includes('sound')) services.add('Sound System')
    }
  })
  
  // Add from selected services
  selectedServices.forEach(service => {
    if (typeof service === 'string') {
      const serviceName = service.toLowerCase()
      vendorServices.forEach(option => {
        if (option.toLowerCase().includes(serviceName) || serviceName.includes(option.toLowerCase())) {
          services.add(option)
        }
      })
    }
  })
  
  return Array.from(services)
}

const getPreselectedVenues = (venues: any[]): string[] => {
  return venues.map(venue => venue.name || venue.category || 'Selected Venue')
}

export default function QuoteRequestModal({ isOpen, onClose, prefilledEvent, selectedVendors = [], selectedVenues = [] }: QuoteRequestModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [quoteType, setQuoteType] = useState<'targeted' | 'comprehensive'>('targeted')
  const [expandVendors, setExpandVendors] = useState(false)
  const [formData, setFormData] = useState<QuoteRequest>({
    eventType: '',
    eventName: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    eventDate: '',
    location: '',
    guestCount: 0,
    budget: '',
    selectedVendors: [],
    selectedVenues: [],
    specialRequirements: '',
    urgency: 'medium'
  })

  useEffect(() => {
    if (isOpen) {
      // Pre-fill user data
      const userStr = sessionStorage.getItem('partyoria_user') || localStorage.getItem('partyoria_user')
      let userData = {}
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          userData = {
            clientName: user.firstName || user.username || '',
            clientEmail: user.email || ''
          }
        } catch (e) {
          console.warn('Failed to parse user data:', e)
        }
      }

      // Pre-fill event data if available
      if (prefilledEvent) {
        const eventFormData = prefilledEvent.form_data || {}
        setFormData(prev => ({
          ...prev,
          ...userData,
          eventType: prefilledEvent.type || eventFormData.event_type || '',
          eventName: prefilledEvent.name || prefilledEvent.event_name || '',
          eventDate: eventFormData.dateTime ? eventFormData.dateTime.split('T')[0] : '',
          location: eventFormData.city && eventFormData.state ? `${eventFormData.city}, ${eventFormData.state}` : '',
          guestCount: eventFormData.attendees || prefilledEvent.attendees || 0,
          budget: eventFormData.budget ? getBudgetRange(eventFormData.budget) : '',
          specialRequirements: eventFormData.description || '',
          selectedVendors: getPreselectedVendors(selectedVendors, eventFormData.selectedVendorServices),
          selectedVenues: getPreselectedVenues(selectedVenues)
        }))
        setQuoteType('targeted')
      } else {
        setFormData(prev => ({ ...prev, ...userData }))
        setQuoteType('comprehensive')
      }
    }
  }, [isOpen, prefilledEvent, selectedVendors])

  const handleInputChange = (field: keyof QuoteRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleVendorToggle = (vendor: string) => {
    setFormData(prev => ({
      ...prev,
      selectedVendors: prev.selectedVendors.includes(vendor)
        ? prev.selectedVendors.filter(v => v !== vendor)
        : [...prev.selectedVendors, vendor]
    }))
  }

  const handleVenueToggle = (venue: string) => {
    setFormData(prev => ({
      ...prev,
      selectedVenues: prev.selectedVenues.includes(venue)
        ? prev.selectedVenues.filter(v => v !== venue)
        : [...prev.selectedVenues, venue]
    }))
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.eventType || !formData.clientName || !formData.clientEmail || !formData.eventDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Event Type, Name, Email, Date).",
        variant: "destructive"
      })
      return
    }

    if (formData.selectedVendors.length === 0 && formData.selectedVenues.length === 0) {
      toast({
        title: "No Services Selected",
        description: "Please select at least one vendor or venue for your quote.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const apiData = {
        event_type: formData.eventType || 'other',
        event_name: formData.eventName || 'Untitled Event',
        client_name: formData.clientName || 'Unknown Client',
        client_email: formData.clientEmail || 'client@example.com',
        client_phone: formData.clientPhone || '',
        event_date: formData.eventDate || new Date().toISOString().split('T')[0],
        location: formData.location || '',
        guest_count: parseInt(formData.guestCount) || 0,
        budget_range: formData.budget || '',
        services: [...formData.selectedVendors, ...formData.selectedVenues],
        description: formData.specialRequirements || '',
        urgency: formData.urgency || 'medium',
        quote_type: quoteType || 'comprehensive',
        expand_vendors: expandVendors || false,
        prefilled_event_id: prefilledEvent?.id || null,
        selected_vendors: formData.selectedVendors.map(v => ({ name: v, category: v })),
        selected_venues: formData.selectedVenues.map(v => ({ name: v, category: v }))
      }

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
        toast({
          title: "Authentication Required",
          description: "Please log in to request quotes.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('http://127.0.0.1:8000/api/quote-requests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      })

      if (response.ok) {
        const quoteData = await response.json()
        
        // If this is for a prefilled event, send quotes to vendors
        if (prefilledEvent?.id) {
          try {
            const sendQuotesResponse = await fetch(`http://127.0.0.1:8000/api/events/${prefilledEvent.id}/send-quotes/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            })
            
            if (sendQuotesResponse.ok) {
              const sendData = await sendQuotesResponse.json()
              console.log('Quotes sent to vendors:', sendData)
            }
          } catch (sendError) {
            console.error('Error sending quotes to vendors:', sendError)
          }
        }
        
        setIsSubmitted(true)
        toast({
          title: "Quote Request Submitted!",
          description: "We'll get back to you within 24-48 hours with a detailed quote.",
        })
      } else {
        throw new Error('Failed to submit quote request')
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({
          eventType: '',
          eventName: '',
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          eventDate: '',
          location: '',
          guestCount: 0,
          budget: '',
          selectedVendors: [],
          selectedVenues: [],
          specialRequirements: '',
          urgency: 'medium'
        })
        onClose()
      }, 3000)

    } catch (error) {
      console.error('Error submitting quote request:', error)
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quote Request Submitted!</h3>
            <p className="text-gray-600 mb-4">
              We've received your request and will get back to you within 24-48 hours with a detailed quote.
            </p>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Request submitted successfully!
            </Badge>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {prefilledEvent ? `Quote for ${prefilledEvent.name || prefilledEvent.event_name}` : 'Request a Quote'}
          </DialogTitle>
          <DialogDescription>
            {prefilledEvent 
              ? `Get targeted quotes from your selected vendors for this ${prefilledEvent.type || 'event'}.`
              : 'Tell us about your event and we\'ll provide you with a detailed quote from our network of vendors.'
            }
          </DialogDescription>
        </DialogHeader>

        {prefilledEvent && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-purple-900">Quote Type</h3>
              <div className="flex gap-2">
                <Button
                  variant={quoteType === 'targeted' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQuoteType('targeted')}
                  className={quoteType === 'targeted' ? 'bg-purple-600' : ''}
                >
                  Targeted ({formData.selectedVendors.length + formData.selectedVenues.length} providers)
                </Button>
                <Button
                  variant={quoteType === 'comprehensive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQuoteType('comprehensive')}
                  className={quoteType === 'comprehensive' ? 'bg-purple-600' : ''}
                >
                  Comprehensive
                </Button>
              </div>
            </div>
            
            {quoteType === 'targeted' && (formData.selectedVendors.length > 0 || formData.selectedVenues.length > 0) && (
              <div className="space-y-2">
                <p className="text-sm text-purple-700">Selected services will receive this quote:</p>
                <div className="flex flex-wrap gap-2">
                  {[...formData.selectedVendors, ...formData.selectedVenues].slice(0, 5).map((service, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                      {service}
                    </Badge>
                  ))}
                  {(formData.selectedVendors.length + formData.selectedVenues.length) > 5 && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      +{(formData.selectedVendors.length + formData.selectedVenues.length) - 5} more
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="expandVendors"
                    checked={expandVendors}
                    onChange={(e) => setExpandVendors(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="expandVendors" className="text-sm text-purple-700">
                    Also include additional providers for comparison
                  </Label>
                </div>
              </div>
            )}
            
            {quoteType === 'comprehensive' && (
              <p className="text-sm text-purple-700">
                Quote will be sent to all relevant vendors in our network for maximum options.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Event Details */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Information
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="eventType">Event Type *</Label>
                    <Select 
                      value={formData.eventType} 
                      onValueChange={(value) => handleInputChange('eventType', value)}
                      disabled={!!prefilledEvent}
                    >
                      <SelectTrigger className={prefilledEvent ? 'bg-gray-50' : ''}>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {prefilledEvent && (
                      <p className="text-xs text-gray-500 mt-1">Pre-filled from your event</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="eventName">Event Name</Label>
                    <Input
                      id="eventName"
                      value={formData.eventName}
                      onChange={(e) => handleInputChange('eventName', e.target.value)}
                      placeholder="e.g., Sarah's Wedding, Company Annual Party"
                      className={prefilledEvent ? 'bg-gray-50' : ''}
                      readOnly={!!prefilledEvent}
                    />
                    {prefilledEvent && (
                      <p className="text-xs text-gray-500 mt-1">Pre-filled from your event</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="eventDate">Event Date *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => handleInputChange('eventDate', e.target.value)}
                      className={prefilledEvent ? 'bg-gray-50' : ''}
                      readOnly={!!prefilledEvent}
                    />
                    {prefilledEvent && (
                      <p className="text-xs text-gray-500 mt-1">Pre-filled from your event</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, State"
                      className={prefilledEvent ? 'bg-gray-50' : ''}
                      readOnly={!!prefilledEvent}
                    />
                    {prefilledEvent && (
                      <p className="text-xs text-gray-500 mt-1">Pre-filled from your event</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="guestCount">Guest Count</Label>
                      <Input
                        id="guestCount"
                        type="number"
                        value={formData.guestCount || ''}
                        onChange={(e) => handleInputChange('guestCount', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className={prefilledEvent ? 'bg-gray-50' : ''}
                        readOnly={!!prefilledEvent}
                      />
                      {prefilledEvent && (
                        <p className="text-xs text-gray-500 mt-1">From event</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="budget">Budget Range</Label>
                      <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-50k">Under ₹50,000</SelectItem>
                          <SelectItem value="50k-1l">₹50,000 - ₹1,00,000</SelectItem>
                          <SelectItem value="1l-2l">₹1,00,000 - ₹2,00,000</SelectItem>
                          <SelectItem value="2l-5l">₹2,00,000 - ₹5,00,000</SelectItem>
                          <SelectItem value="5l-10l">₹5,00,000 - ₹10,00,000</SelectItem>
                          <SelectItem value="above-10l">Above ₹10,00,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contact Information
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="clientName">Full Name *</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => handleInputChange('clientName', e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientEmail">Email Address *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientPhone">Phone Number</Label>
                    <Input
                      id="clientPhone"
                      value={formData.clientPhone}
                      onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div>
                    <Label htmlFor="urgency">Response Urgency</Label>
                    <Select value={formData.urgency} onValueChange={(value: 'low' | 'medium' | 'high') => handleInputChange('urgency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (3-5 days)</SelectItem>
                        <SelectItem value="medium">Medium (1-2 days)</SelectItem>
                        <SelectItem value="high">High (Within 24 hours)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Vendors & Venues */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Required Vendors
                  </h3>
                  {prefilledEvent && formData.selectedVendors.length > 0 && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {formData.selectedVendors.length} pre-selected
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {vendorServices.map(vendor => {
                    const isPreselected = prefilledEvent && getPreselectedVendors(selectedVendors, prefilledEvent.form_data?.selectedVendorServices).includes(vendor)
                    return (
                      <div
                        key={vendor}
                        onClick={() => handleVendorToggle(vendor)}
                        className={`p-2 rounded-lg border cursor-pointer transition-colors relative ${
                          formData.selectedVendors.includes(vendor)
                            ? 'bg-purple-50 border-purple-200 text-purple-700'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-sm font-medium">{vendor}</span>
                        {isPreselected && (
                          <CheckCircle className="h-3 w-3 text-green-600 absolute top-1 right-1" />
                        )}
                      </div>
                    )
                  })}
                </div>
                {formData.selectedVendors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">
                      Selected vendors ({formData.selectedVendors.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {formData.selectedVendors.map(vendor => {
                        const isPreselected = prefilledEvent && getPreselectedVendors(selectedVendors, prefilledEvent.form_data?.selectedVendorServices).includes(vendor)
                        return (
                          <Badge 
                            key={vendor} 
                            variant={isPreselected ? "default" : "secondary"} 
                            className={`text-xs ${isPreselected ? 'bg-green-100 text-green-800 border-green-200' : ''}`}
                          >
                            {vendor}
                            {isPreselected && <CheckCircle className="h-3 w-3 ml-1" />}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Venue Requirements
                  </h3>
                  {prefilledEvent && formData.selectedVenues.length > 0 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {formData.selectedVenues.length} pre-selected
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {venueTypes.map(venue => {
                    const isPreselected = prefilledEvent && getPreselectedVenues(selectedVenues).includes(venue)
                    return (
                      <div
                        key={venue}
                        onClick={() => handleVenueToggle(venue)}
                        className={`p-2 rounded-lg border cursor-pointer transition-colors relative ${
                          formData.selectedVenues.includes(venue)
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-sm font-medium">{venue}</span>
                        {isPreselected && (
                          <CheckCircle className="h-3 w-3 text-green-600 absolute top-1 right-1" />
                        )}
                      </div>
                    )
                  })}
                </div>
                {formData.selectedVenues.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">
                      Selected venues ({formData.selectedVenues.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {formData.selectedVenues.map(venue => {
                        const isPreselected = prefilledEvent && getPreselectedVenues(selectedVenues).includes(venue)
                        return (
                          <Badge 
                            key={venue} 
                            variant={isPreselected ? "default" : "secondary"} 
                            className={`text-xs ${isPreselected ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}`}
                          >
                            {venue}
                            {isPreselected && <CheckCircle className="h-3 w-3 ml-1" />}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">Special Requirements</h3>
                <div>
                  <Label htmlFor="specialRequirements">Describe your specific needs, themes, or special requirements</Label>
                  <Textarea
                    id="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                    placeholder={prefilledEvent 
                      ? "Add any additional requirements or modifications to your existing event plan..."
                      : "e.g., Vegetarian catering, outdoor setup, specific decorations, accessibility needs, cultural requirements..."
                    }
                    rows={4}
                  />
                  {prefilledEvent && prefilledEvent.special_requirements && Object.keys(prefilledEvent.special_requirements).length > 0 && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      <strong>Existing requirements:</strong> {Object.keys(prefilledEvent.special_requirements).join(', ')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {prefilledEvent 
                      ? `Send to ${quoteType === 'targeted' ? (formData.selectedVendors.length + formData.selectedVenues.length) : 'All'} Providers`
                      : 'Submit Quote Request'
                    }
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}