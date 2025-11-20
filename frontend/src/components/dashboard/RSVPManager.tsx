import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Users, Mail, Calendar, Plus, Eye, Edit, Trash2, Send, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Guest {
  name: string
  email: string
  phone?: string
  category?: string
}

interface RSVP {
  id: number
  event: number
  event_name: string
  guest_data: Guest
  invitation_code: string
  response_status: 'pending' | 'accepted' | 'declined' | 'maybe'
  response_date?: string
  plus_ones: number
  dietary_restrictions: string
  special_requests: string
  guest_name: string
  guest_email: string
  total_attendees: number
  created_at: string
  updated_at: string
}

interface RSVPStats {
  total_invitations: number
  accepted: number
  declined: number
  maybe: number
  pending: number
  total_attendees: number
  response_rate: number
}

interface RSVPManagerProps {
  onNavigate?: (component: string) => void
}

export default function RSVPManager({ onNavigate }: RSVPManagerProps = {}) {
  const [events, setEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [rsvps, setRSVPs] = useState<RSVP[]>([])
  const [stats, setStats] = useState<RSVPStats | null>(null)
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false)
  const [isBulkInviteModalOpen, setIsBulkInviteModalOpen] = useState(false)
  const [isViewRSVPModalOpen, setIsViewRSVPModalOpen] = useState(false)
  const [selectedRSVP, setSelectedRSVP] = useState<RSVP | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [newGuest, setNewGuest] = useState<Guest>({
    name: '',
    email: '',
    phone: '',
    category: 'general'
  })

  const [bulkGuests, setBulkGuests] = useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      loadRSVPs()
      loadStats()
    }
  }, [selectedEvent])

  const loadEvents = async () => {
    try {
      const { apiService } = await import('../../services/api')
      const apiEvents = await apiService.getEvents()
      setEvents(apiEvents)
      if (apiEvents.length > 0 && !selectedEvent) {
        setSelectedEvent(apiEvents[0])
      }
    } catch (error) {
      console.error('Error loading events:', error)
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      })
    }
  }

  const loadRSVPs = async () => {
    if (!selectedEvent) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      if (!token) {
        setRSVPs([])
        setLoading(false)
        return
      }

      const response = await fetch(`http://localhost:8000/api/events/rsvps/by-event/?event_id=${selectedEvent.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setRSVPs(data)
    } catch (error) {
      console.error('Error loading RSVPs:', error)
      toast({
        title: "Error",
        description: "Failed to load RSVPs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!selectedEvent) return
    
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      if (!token) return

      const response = await fetch(`http://localhost:8000/api/events/rsvps/stats/?event_id=${selectedEvent.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const createRSVP = async (guestData: Guest) => {
    if (!selectedEvent) return

    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/api/events/rsvps/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: selectedEvent.id,
          guest_data: guestData
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: "Invitation sent successfully"
        })
        loadRSVPs()
        loadStats()
        return true
      } else {
        const errorData = await response.json()
        console.error('RSVP creation error:', errorData)
        throw new Error(errorData.detail || 'Failed to create RSVP')
      }
    } catch (error) {
      console.error('Error creating RSVP:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive"
      })
      return false
    }
  }

  const handleAddGuest = async () => {
    if (!newGuest.name || !newGuest.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      })
      return
    }

    const success = await createRSVP(newGuest)
    if (success) {
      setNewGuest({ name: '', email: '', phone: '', category: 'general' })
      setIsAddGuestModalOpen(false)
    }
  }

  const handleBulkInvite = async () => {
    if (!bulkGuests.trim()) {
      toast({
        title: "Error",
        description: "Please enter guest information",
        variant: "destructive"
      })
      return
    }

    const lines = bulkGuests.trim().split('\n')
    const guests: Guest[] = []

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim())
      if (parts.length >= 2) {
        guests.push({
          name: parts[0],
          email: parts[1],
          phone: parts[2] || '',
          category: parts[3] || 'general'
        })
      }
    }

    if (guests.length === 0) {
      toast({
        title: "Error",
        description: "No valid guest entries found",
        variant: "destructive"
      })
      return
    }

    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/api/events/rsvps/bulk-invite/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: selectedEvent.id,
          guests: guests
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${guests.length} invitations sent successfully`
        })
        setBulkGuests('')
        setIsBulkInviteModalOpen(false)
        loadRSVPs()
        loadStats()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to send bulk invitations')
      }
    } catch (error) {
      console.error('Error sending bulk invitations:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send bulk invitations",
        variant: "destructive"
      })
    }
  }

  const deleteRSVP = async (rsvpId: number) => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      const response = await fetch(`http://localhost:8000/api/events/rsvps/${rsvpId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Invitation deleted successfully"
        })
        loadRSVPs()
        loadStats()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to delete RSVP')
      }
    } catch (error) {
      console.error('Error deleting RSVP:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete invitation",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'maybe':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      case 'maybe':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-4 lg:p-6 w-full max-w-full mx-0 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center">
              <Users className="mr-3 h-7 w-7" />
              RSVP Management
            </h1>
            <p className="text-white/90 text-base">
              Manage guest invitations and track responses for your events
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-4 py-2 rounded-lg shadow-md"
              onClick={() => setIsAddGuestModalOpen(true)}
              disabled={!selectedEvent}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Guest
            </Button>
            <Button 
              className="bg-white/20 text-white hover:bg-white/30 font-semibold px-4 py-2 rounded-lg border border-white/30"
              onClick={() => setIsBulkInviteModalOpen(true)}
              disabled={!selectedEvent}
            >
              <Send className="mr-2 h-4 w-4" /> Bulk Invite
            </Button>
          </div>
        </div>
      </div>

      {/* Event Selection */}
      <Card className="mb-6 bg-white shadow-md border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-gray-900 text-lg">
            <Calendar className="mr-2 h-5 w-5 text-purple-600" />
            Select Event
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select value={selectedEvent?.id?.toString() || ''} onValueChange={(value) => {
            const event = events.find(e => e.id.toString() === value)
            setSelectedEvent(event)
          }}>
            <SelectTrigger className="w-full h-12 bg-white border border-gray-300 focus:border-purple-500 rounded-lg">
              <SelectValue placeholder="Choose an event to manage RSVPs" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id.toString()} className="hover:bg-purple-50 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{event.event_name}</span>
                    <span className="text-sm text-gray-500">{new Date(event.created_at).toLocaleDateString()}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEvent && stats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Invitations</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total_invitations}</h3>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Confirmed Guests</p>
                    <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</h3>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Attendees</p>
                    <h3 className="text-2xl font-bold text-purple-600 mt-1">{stats.total_attendees}</h3>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Response Rate</p>
                    <h3 className="text-2xl font-bold text-purple-600 mt-1">{Math.round(stats.response_rate)}%</h3>
                    <div className="mt-2">
                      <Progress value={stats.response_rate} className="h-2" />
                    </div>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-lg ml-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="text-purple-600 font-bold text-xs">%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Response Breakdown */}
          <Card className="mb-8 bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-gray-800">Response Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-1">{stats.accepted}</div>
                  <div className="text-sm font-semibold text-green-700 uppercase tracking-wide">Accepted</div>
                </div>
                <div className="text-center bg-red-50 p-4 rounded-lg border-2 border-red-200">
                  <div className="text-3xl font-bold text-red-600 mb-1">{stats.declined}</div>
                  <div className="text-sm font-semibold text-red-700 uppercase tracking-wide">Declined</div>
                </div>
                <div className="text-center bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.maybe}</div>
                  <div className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">Maybe</div>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <div className="text-3xl font-bold text-gray-600 mb-1">{stats.pending}</div>
                  <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RSVP List */}
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-gray-800">Guest List</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading guest list...</p>
                </div>
              ) : rsvps.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No invitations sent yet</p>
                  <p className="text-gray-400 text-sm">Start by adding guests to your event!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rsvps.map((rsvp) => (
                    <div key={rsvp.id} className="flex items-center justify-between p-5 bg-gray-50 border-2 border-gray-200 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="bg-white p-2 rounded-full border-2 border-gray-200">
                          {getStatusIcon(rsvp.response_status)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{rsvp.guest_name}</h4>
                          <p className="text-sm text-gray-600 font-medium">{rsvp.guest_email}</p>
                          {rsvp.response_status === 'accepted' && rsvp.plus_ones > 0 && (
                            <p className="text-sm text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded mt-1 inline-block">
                              +{rsvp.plus_ones} guest{rsvp.plus_ones > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getStatusColor(rsvp.response_status)} px-3 py-1 text-sm font-semibold`}>
                          {rsvp.response_status.toUpperCase()}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRSVP(rsvp)
                            setIsViewRSVPModalOpen(true)
                          }}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-700 border-2 border-purple-200"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRSVP(rsvp.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Guest Modal */}
      <Dialog open={isAddGuestModalOpen} onOpenChange={setIsAddGuestModalOpen}>
        <DialogContent className="bg-white border-2 border-gray-200 shadow-2xl max-w-md">
          <DialogHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
            <DialogTitle className="text-xl font-semibold text-white">Add New Guest</DialogTitle>
            <DialogDescription className="text-white/90">Send an invitation to a new guest for your event</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name *</Label>
              <Input
                id="name"
                value={newGuest.name}
                onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                placeholder="Enter guest's full name"
                className="bg-gray-50 border-2 border-gray-200 focus:border-purple-500 focus:bg-white transition-all duration-200 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={newGuest.email}
                onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                placeholder="guest@example.com"
                className="bg-gray-50 border-2 border-gray-200 focus:border-purple-500 focus:bg-white transition-all duration-200 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
              <Input
                id="phone"
                value={newGuest.phone}
                onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="bg-gray-50 border-2 border-gray-200 focus:border-purple-500 focus:bg-white transition-all duration-200 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Guest Category</Label>
              <Select value={newGuest.category || 'general'} onValueChange={(value) => setNewGuest({ ...newGuest, category: value })}>
                <SelectTrigger className="bg-gray-50 border-2 border-gray-200 focus:border-purple-500 h-12">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-gray-200 shadow-lg">
                  <SelectItem value="general" className="hover:bg-purple-50">General Guest</SelectItem>
                  <SelectItem value="family" className="hover:bg-purple-50">Family Member</SelectItem>
                  <SelectItem value="friends" className="hover:bg-purple-50">Friend</SelectItem>
                  <SelectItem value="colleagues" className="hover:bg-purple-50">Colleague</SelectItem>
                  <SelectItem value="vip" className="hover:bg-purple-50">VIP Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => setIsAddGuestModalOpen(false)}
                className="px-6 py-2 border-2 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddGuest}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg"
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Invite Modal */}
      <Dialog open={isBulkInviteModalOpen} onOpenChange={setIsBulkInviteModalOpen}>
        <DialogContent className="bg-white border-2 border-gray-200 shadow-2xl max-w-3xl">
          <DialogHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
            <DialogTitle className="text-xl font-semibold text-white">Bulk Invite Guests</DialogTitle>
            <DialogDescription className="text-white/90">Send invitations to multiple guests at once</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-2">
            <div className="space-y-3">
              <Label htmlFor="bulk-guests" className="text-sm font-semibold text-gray-700">Guest Information</Label>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-800 font-medium mb-2">Format Instructions:</p>
                <p className="text-sm text-purple-700">
                  Enter one guest per line: <span className="font-mono bg-white px-2 py-1 rounded">Name, Email, Phone, Category</span>
                </p>
                <p className="text-xs text-purple-600 mt-2">Example: John Doe, john@example.com, +1234567890, family</p>
              </div>
              <Textarea
                id="bulk-guests"
                value={bulkGuests}
                onChange={(e) => setBulkGuests(e.target.value)}
                placeholder="John Doe, john@example.com, +1234567890, family&#10;Jane Smith, jane@example.com, +0987654321, friends&#10;Mike Johnson, mike@example.com, +1122334455, colleagues"
                rows={12}
                className="bg-gray-50 border-2 border-gray-200 focus:border-purple-500 focus:bg-white transition-all duration-200 font-mono text-sm"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => setIsBulkInviteModalOpen(false)}
                className="px-6 py-2 border-2 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBulkInvite}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg"
              >
                Send Invitations
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View RSVP Modal */}
      <Dialog open={isViewRSVPModalOpen} onOpenChange={setIsViewRSVPModalOpen}>
        <DialogContent className="bg-white border-2 border-gray-200 shadow-2xl max-w-lg">
          <DialogHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
            <DialogTitle className="text-xl font-semibold text-white">RSVP Details</DialogTitle>
            <DialogDescription className="text-white/90">View detailed information about this guest's RSVP</DialogDescription>
          </DialogHeader>
          {selectedRSVP && (
            <div className="space-y-6 p-2">
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Guest Name</Label>
                  <p className="font-semibold text-lg text-gray-900 mt-1">{selectedRSVP.guest_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Email Address</Label>
                  <p className="text-gray-800 mt-1">{selectedRSVP.guest_email}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Invitation Code</Label>
                  <p className="font-mono text-sm bg-white border-2 border-gray-200 p-3 rounded-lg mt-1 text-center font-bold text-purple-600">{selectedRSVP.invitation_code}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Response Status</Label>
                  <div className="mt-2">
                    <Badge className={`${getStatusColor(selectedRSVP.response_status)} px-3 py-1 text-sm font-semibold`}>
                      {selectedRSVP.response_status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {(selectedRSVP.response_date || selectedRSVP.plus_ones > 0 || selectedRSVP.dietary_restrictions || selectedRSVP.special_requests) && (
                <div className="bg-purple-50 rounded-lg p-4 space-y-4">
                  {selectedRSVP.response_date && (
                    <div>
                      <Label className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Response Date</Label>
                      <p className="text-purple-800 mt-1 font-medium">{new Date(selectedRSVP.response_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedRSVP.plus_ones > 0 && (
                    <div>
                      <Label className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Additional Guests</Label>
                      <p className="text-purple-800 mt-1 font-medium">+{selectedRSVP.plus_ones} guest{selectedRSVP.plus_ones > 1 ? 's' : ''}</p>
                    </div>
                  )}
                  {selectedRSVP.dietary_restrictions && (
                    <div>
                      <Label className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Dietary Restrictions</Label>
                      <p className="text-purple-800 mt-1 bg-white p-2 rounded border">{selectedRSVP.dietary_restrictions}</p>
                    </div>
                  )}
                  {selectedRSVP.special_requests && (
                    <div>
                      <Label className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Special Requests</Label>
                      <p className="text-purple-800 mt-1 bg-white p-2 rounded border">{selectedRSVP.special_requests}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}