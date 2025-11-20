import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CalendarIcon, Clock, Search, TrendingUp, Zap, CheckCircle, IndianRupee, Eye, Users, Calendar, FileText, UserCheck, Bell } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import QuoteRequestModal from "../QuoteRequestModal"
import { LoadingSpinner, EmptyState } from "../ui/LoadingStates"
import OnboardingFlow from "../ui/OnboardingFlow"
import "../../styles/design-system.css"

interface DashboardProps {
  onNavigate?: (component: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps = {}) {
  const [userName, setUserName] = useState("User")
  const [userId, setUserId] = useState<string | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [selectedActivityEvent, setSelectedActivityEvent] = useState<any>(null)
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [selectedEventForQuote, setSelectedEventForQuote] = useState<any>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showQuickLogin, setShowQuickLogin] = useState(false)
  const [loginCredentials, setLoginCredentials] = useState({ username: 'saiku', password: 'saiku123' })
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    // Check Zustand store first
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage)
        if (authData?.state?.user) {
          const user = authData.state.user
          setUserId(user.id || user.username)
          setUserName(user.first_name || user.username || 'User')
          loadRealTimeData(user.id || user.username)
          return
        }
      } catch (e) {}
    }

    // Fallback to old storage
    const userStr = sessionStorage.getItem('partyoria_user') || localStorage.getItem('partyoria_user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserId(user.id || user.username)
        setUserName(user.first_name || user.firstName || user.username || 'User')
        loadRealTimeData(user.id || user.username)
      } catch (e) {
        console.error('Failed to parse user data:', e)
        localStorage.removeItem('partyoria_user')
        sessionStorage.removeItem('partyoria_user')
      }
    }
  }, [])

  const loadRealTimeData = async (currentUserId?: string) => {
    const activeUserId = currentUserId || userId
    if (!activeUserId) {
        return
    }

    try {
      // Check authentication state from multiple sources
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      const authStorage = localStorage.getItem('auth-storage')
      let isAuthenticatedUser = false
      
      if (token) {
        isAuthenticatedUser = true
      } else if (authStorage) {
        try {
          const authData = JSON.parse(authStorage)
          if (authData?.state?.isAuthenticated && authData?.state?.tokens?.access) {
            isAuthenticatedUser = true
            // Sync token to localStorage
            localStorage.setItem('access_token', authData.state.tokens.access)
          }
        } catch (e) {
          console.warn('Failed to parse auth storage:', e)
        }
      }
      
      // Authentication check completed
      
      if (isAuthenticatedUser) {
        try {
          const { apiService } = await import('../../services/api')
          const apiEvents = await apiService.getEvents()
          
          // Convert API events to display format
          const displayEvents = apiEvents.map(apiEvent => ({
            id: apiEvent.id,
            name: apiEvent.event_name,
            type: apiEvent.form_data?.event_type || 'Event',
            date: apiEvent.form_data?.dateTime && !isNaN(new Date(apiEvent.form_data.dateTime).getTime()) ? new Date(apiEvent.form_data.dateTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            time: apiEvent.form_data?.dateTime && !isNaN(new Date(apiEvent.form_data.dateTime).getTime()) ? new Date(apiEvent.form_data.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '12:00 PM',
            location: `${apiEvent.form_data?.city || 'Unknown'}, ${apiEvent.form_data?.state || 'Unknown'}`,
            attendees: apiEvent.form_data?.attendees || 0,
            guestCount: apiEvent.form_data?.attendees || 0,
            budget: apiEvent.form_data?.budget || 0,
            status: 'Planning',
            progress: 25,
            vendorCount: (apiEvent.form_data?.selectedVendorServices || []).length,
            vendors: apiEvent.form_data?.selectedVendorServices || [],
            createdAt: apiEvent.created_at
          }))
          
          setEvents(displayEvents)
        } catch (apiError) {
          console.error('Dashboard: API call failed:', apiError)
          // Fallback to localStorage on API failure
          const userEventsKey = `userEvents_${activeUserId}`
          const userEventsData = JSON.parse(localStorage.getItem(userEventsKey) || '[]')
          setEvents(userEventsData)
        }
      } else {
        // Load from localStorage if not authenticated
        const userEventsKey = `userEvents_${activeUserId}`
        const userEventsData = JSON.parse(localStorage.getItem(userEventsKey) || '[]')
        setEvents(userEventsData)
      }

      // Load localStorage data for payments and messages
      const userPaymentsKey = `userPayments_${activeUserId}`
      const paymentsData = JSON.parse(localStorage.getItem(userPaymentsKey) || '[]')
      setPayments(paymentsData)

      const userMessagesKey = `userMessages_${activeUserId}`
      const messagesData = JSON.parse(localStorage.getItem(userMessagesKey) || '[]')
      setMessages(messagesData)
    } catch (error) {
      console.error('Dashboard: Error loading real-time data:', error)
      // Fallback to localStorage
      const userEventsKey = `userEvents_${activeUserId}`
      const userEventsData = JSON.parse(localStorage.getItem(userEventsKey) || '[]')
      setEvents(userEventsData)
    }
  }

  const totalSpentAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalVendorsHired = events.reduce((sum, e) => sum + (e.vendorCount || e.vendors?.length || 0), 0)
  const upcomingEventsCount = events.filter(e => e.status === 'Planning' || e.status === 'Upcoming').length

  const stats = [
    {
      title: "My Events",
      value: events.length.toString(),
      icon: <CalendarIcon className="h-6 w-6 text-purple-600" />,
      change: events.length > 0 ? `+${events.length}` : "",
      description: "Total events created"
    },
    {
      title: "Quote Requests",
      value: totalVendorsHired.toString(),
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      change: totalVendorsHired > 0 ? `+${totalVendorsHired}` : "",
      description: "Quotes sent to vendors"
    },
    {
      title: "Upcoming Events",
      value: upcomingEventsCount.toString(),
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      change: upcomingEventsCount > 0 ? `+${upcomingEventsCount}` : "",
      description: "Events in planning"
    },
    {
      title: "Total Budget",
      value: totalSpentAmount > 0 ? `₹${Math.round(totalSpentAmount / 1000)}K` : "₹0",
      icon: <IndianRupee className="h-6 w-6 text-green-600" />,
      change: "",
      description: "Budget allocated"
    },
  ]

  const getTimeAgo = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  const recentActivities = [
    ...payments.slice(0, 3).map((payment, index) => ({
      id: index + 1,
      type: "payment",
      description: `Payment ${payment.status} for ${payment.eventName}`,
      amount: `₹${payment.amount?.toLocaleString()}`,
      time: payment.createdAt ? getTimeAgo(payment.createdAt) : getTimeAgo(new Date().toISOString()),
      status: payment.status,
      eventData: events.find(e => e.name === payment.eventName)
    })),
    ...events.slice(0, 4).map((event, index) => ({
      id: index + 4,
      type: "event",
      description: `Event: ${event.name}`,
      time: event.createdAt ? getTimeAgo(event.createdAt) : getTimeAgo(new Date().toISOString()),
      status: event.status?.toLowerCase() || 'active',
      eventData: event,
    })),
    ...messages.slice(0, 2).map((message, index) => ({
      id: index + 6,
      type: "message",
      description: `New message received`,
      time: message.createdAt ? getTimeAgo(message.createdAt) : getTimeAgo(new Date().toISOString()),
      status: message.read ? 'read' : 'unread',
    }))
  ]

  const handleActivityView = (activity: any) => {
    if (activity.type === 'event' && activity.eventData) {
      setSelectedActivityEvent(activity.eventData)
      setIsActivityDialogOpen(true)
    }
  }

  return (
    <div className="p-6 w-full max-w-full mx-0 bg-white min-h-screen">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 lg:p-6 mb-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold text-white mb-2">Welcome back, {userName}</h1>
            <p className="text-white/90 text-sm lg:text-base">
              {events.length > 0 
                ? `You have ${events.length} event${events.length > 1 ? 's' : ''} to manage.`
                : "Ready to plan your first event? Let's get started!"
              }
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <Button 
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold touch-target w-full justify-center h-12"
            onClick={() => onNavigate?.('create-event')}
          >
            <Zap className="mr-2 h-4 w-4" /> Create Event
          </Button>
          <Button 
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold touch-target w-full justify-center h-12"
            onClick={() => onNavigate?.('requote')}
          >
            <FileText className="mr-2 h-4 w-4" /> Request Quote
          </Button>
          <Button 
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold touch-target w-full justify-center h-12"
            onClick={() => onNavigate?.('quote-management')}
          >
            <TrendingUp className="mr-2 h-4 w-4" /> Quote Progress
          </Button>
          <Button 
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold touch-target w-full justify-center h-12"
            onClick={() => onNavigate?.('budget-analytics')}
          >
            <IndianRupee className="mr-2 h-4 w-4" /> Budget Analytics
          </Button>
          <Button 
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold touch-target w-full justify-center h-12"
            onClick={() => onNavigate?.('rsvp-manager')}
          >
            <UserCheck className="mr-2 h-4 w-4" /> RSVP Manager
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="card hover:shadow-md transition-all cursor-pointer touch-target"
            onClick={() => {
              if (stat.title === "My Events") {
                onNavigate?.('my-events');
              } else if (stat.title === "Total Budget") {
                onNavigate?.('budget-analytics');
              } else if (stat.title === "Hired Vendors") {
                onNavigate?.('quote-management');
              }
            }}
          >
            <CardContent className="p-3 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2">
                <div className="flex-1">
                  <p className="text-xs lg:text-sm text-gray-600">{stat.title}</p>
                  <h3 className="text-lg lg:text-2xl font-semibold text-gray-900 mt-1">{stat.value}</h3>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  {stat.change && (
                    <span className="text-xs text-green-600 hidden lg:inline">{stat.change}</span>
                  )}
                </div>
                <div className="p-2 rounded bg-gray-50 self-start">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white border border-gray-200 hover:shadow-sm transition-shadow">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 flex items-center">
              <Zap className="mr-2 h-4 w-4 text-gray-600" /> Recent Activity
            </h3>
            <div className="flex gap-2">
              <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                if (userId) {
                  loadRealTimeData(userId);
                } else {
                  window.location.reload();
                }
              }} 
              className="btn-primary touch-target"
            >
              <span className="hidden lg:inline">Refresh</span>
              <span className="lg:hidden">↻</span>
            </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-5">
          <div className="relative border-l-2 border-gray-200 pl-5 ml-3 space-y-6 py-1">
            {recentActivities.length === 0 ? (
              <EmptyState
                title="No recent activities"
                description="Your activities will appear here as you use the platform"
                action={
                  <Button 
                    onClick={() => onNavigate?.('create-event')}
                    className="btn-primary"
                  >
                    Create Your First Event
                  </Button>
                }
              />
            ) : (
              recentActivities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex flex-col">
                  <div className={`absolute -left-[11px] rounded-full w-5 h-5 flex items-center justify-center ${
                    activity.type === 'payment' ? 'bg-pink-500' :
                    activity.type === 'event' ? 'bg-purple-600' :
                    'bg-gradient-to-r from-purple-600 to-pink-600'
                  }`}>
                    {activity.type === 'payment' && <IndianRupee className="text-white h-3 w-3" />}
                    {activity.type === 'event' && <Calendar className="text-white h-3 w-3" />}
                    {activity.type !== 'payment' && activity.type !== 'event' && <CheckCircle className="text-white h-3 w-3" />}
                  </div>
                  <div className="-mt-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{activity.description}</h4>
                        {activity.amount && (
                          <p className="text-sm text-gray-600 mt-1">Amount: {activity.amount}</p>
                        )}
                        <span className="text-xs text-gray-500 block mt-1">{activity.time}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="bg-primary-600 text-white hover:bg-primary-700" onClick={() => handleActivityView(activity)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {activity.type === 'event' && activity.eventData && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="bg-success-600 text-white hover:bg-success-700"
                            onClick={() => {
                              setSelectedEventForQuote(activity.eventData)
                              setIsQuoteModalOpen(true)
                            }}
                            title="Get quote for this event"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedActivityEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {selectedActivityEvent.name || selectedActivityEvent.type}
                </DialogTitle>
                <DialogDescription>Complete event details and information</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Event Type</Label>
                      <p className="text-base font-medium">{selectedActivityEvent.type}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Date & Time</Label>
                      <p className="text-base">{selectedActivityEvent.date ? new Date(selectedActivityEvent.date).toLocaleDateString() : 'No date'} at {selectedActivityEvent.time || 'No time'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Location</Label>
                      <p className="text-base">{selectedActivityEvent.location || 'No location'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Guest Count</Label>
                      <p className="text-base font-medium">{selectedActivityEvent.guestCount || selectedActivityEvent.guests || 0} people</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Budget</Label>
                      <p className="text-base font-medium text-green-600">₹{parseInt(selectedActivityEvent.budget || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <Badge>{selectedActivityEvent.status || 'Planning'}</Badge>
                    </div>
                  </div>
                </div>
                
                {selectedActivityEvent.status !== "Cancelled" && selectedActivityEvent.status !== "Completed" && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Planning Progress</Label>
                    <div className="mt-2">
                      <Progress value={selectedActivityEvent.progress || 0} className="h-3" />
                      <p className="text-sm text-gray-600 mt-2 font-medium">{selectedActivityEvent.progress || 0}% complete</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <QuoteRequestModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => {
          setIsQuoteModalOpen(false)
          setSelectedEventForQuote(null)
        }}
        prefilledEvent={selectedEventForQuote}
        selectedVendors={selectedEventForQuote?.vendors || selectedEventForQuote?.form_data?.selectedVendorServices || []}
        selectedVenues={selectedEventForQuote?.venues || []}
      />

      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          localStorage.setItem('hasSeenOnboarding', 'true')
          setShowOnboarding(false)
          onNavigate?.('create-event')
        }}
        userType="customer"
      />


    </div>
  )
}