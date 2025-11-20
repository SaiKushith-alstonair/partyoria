import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, AlertCircle, Calendar, MapPin, Users, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RSVP {
  id: number
  event: number
  event_name: string
  guest_data: {
    name: string
    email: string
    phone?: string
    category?: string
  }
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

export default function RSVPResponse() {
  const [searchParams] = useSearchParams()
  const [rsvp, setRSVP] = useState<RSVP | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const [response, setResponse] = useState({
    response_status: '',
    plus_ones: 0,
    dietary_restrictions: '',
    special_requests: ''
  })

  const invitationCode = searchParams.get('code')

  useEffect(() => {
    if (invitationCode) {
      loadRSVP()
    } else {
      setError('Invalid invitation link')
      setLoading(false)
    }
  }, [invitationCode])

  const loadRSVP = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/rsvps/by-invitation/?code=${invitationCode}`)
      
      if (response.ok) {
        const data = await response.json()
        setRSVP(data)
        
        // Pre-fill form if already responded
        if (data.response_status !== 'pending') {
          setResponse({
            response_status: data.response_status,
            plus_ones: data.plus_ones,
            dietary_restrictions: data.dietary_restrictions,
            special_requests: data.special_requests
          })
          setSubmitted(true)
        }
      } else {
        setError('Invalid invitation code')
      }
    } catch (error) {
      console.error('Error loading RSVP:', error)
      setError('Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!response.response_status) {
      toast({
        title: "Error",
        description: "Please select your response",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    try {
      const submitResponse = await fetch(`http://localhost:8000/api/rsvps/${rsvp?.id}/respond/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response)
      })

      if (submitResponse.ok) {
        setSubmitted(true)
        toast({
          title: "Success",
          description: "Your response has been recorded"
        })
        // Reload to get updated data
        loadRSVP()
      } else {
        throw new Error('Failed to submit response')
      }
    } catch (error) {
      console.error('Error submitting response:', error)
      toast({
        title: "Error",
        description: "Failed to submit response",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case 'declined':
        return <XCircle className="h-8 w-8 text-red-600" />
      case 'maybe':
        return <AlertCircle className="h-8 w-8 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'accepted':
        return "Great! We're excited to see you at the event."
      case 'declined':
        return "Thank you for letting us know. You'll be missed!"
      case 'maybe':
        return "Thanks for your response. Please let us know if your plans change."
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!rsvp) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <img src="/videos/partyoria.gif" alt="PartyOria" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Invited!</h1>
          <p className="text-gray-600">Please respond to this invitation</p>
        </div>

        {/* Event Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              {rsvp.event_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Users className="mr-2 h-4 w-4" />
                <span>Invited: {rsvp.guest_name}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="mr-2 h-4 w-4" />
                <span>Invitation Code: {rsvp.invitation_code}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Form or Confirmation */}
        <Card>
          <CardHeader>
            <CardTitle>
              {submitted ? 'Response Recorded' : 'Please Respond'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-6">
                {getStatusIcon(response.response_status)}
                <h3 className="text-xl font-semibold mt-4 mb-2">
                  Response: {response.response_status.charAt(0).toUpperCase() + response.response_status.slice(1)}
                </h3>
                <p className="text-gray-600 mb-4">
                  {getStatusMessage(response.response_status)}
                </p>
                {response.response_status === 'accepted' && response.plus_ones > 0 && (
                  <p className="text-sm text-blue-600">
                    You're bringing {response.plus_ones} additional guest{response.plus_ones > 1 ? 's' : ''}
                  </p>
                )}
                {rsvp.response_date && (
                  <p className="text-sm text-gray-500 mt-4">
                    Responded on: {new Date(rsvp.response_date).toLocaleDateString()}
                  </p>
                )}
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSubmitted(false)}
                >
                  Update Response
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Will you attend?</Label>
                  <Select value={response.response_status || ''} onValueChange={(value) => setResponse({ ...response, response_status: value })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Please select your response" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accepted">
                        <div className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Yes, I'll be there
                        </div>
                      </SelectItem>
                      <SelectItem value="declined">
                        <div className="flex items-center">
                          <XCircle className="mr-2 h-4 w-4 text-red-600" />
                          Sorry, can't make it
                        </div>
                      </SelectItem>
                      <SelectItem value="maybe">
                        <div className="flex items-center">
                          <AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />
                          Maybe
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {response.response_status === 'accepted' && (
                  <div>
                    <Label htmlFor="plus-ones">How many additional guests will you bring?</Label>
                    <Select value={response.plus_ones?.toString() || '0'} onValueChange={(value) => setResponse({ ...response, plus_ones: parseInt(value) })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 0 ? 'Just me' : num === 1 ? 'guest' : 'guests'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="dietary">Dietary restrictions or allergies</Label>
                  <Textarea
                    id="dietary"
                    value={response.dietary_restrictions}
                    onChange={(e) => setResponse({ ...response, dietary_restrictions: e.target.value })}
                    placeholder="Please let us know about any dietary requirements..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="requests">Special requests or comments</Label>
                  <Textarea
                    id="requests"
                    value={response.special_requests}
                    onChange={(e) => setResponse({ ...response, special_requests: e.target.value })}
                    placeholder="Any special requests or comments..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting || !response.response_status}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                >
                  {submitting ? 'Submitting...' : 'Submit Response'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by PartyOria Event Management</p>
        </div>
      </div>
    </div>
  )
}