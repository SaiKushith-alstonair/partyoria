import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, IndianRupee, User, Phone, Mail, MessageCircle, XCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { bookingApi } from "@/services/bookingApi"
import { toast } from "@/components/ui/use-toast"

export default function MyBookings({ onNavigate }: { onNavigate?: (component: string) => void }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await bookingApi.getCustomerBookings()
      setBookings(response.bookings || [])
    } catch (error) {
      console.error('Failed to load bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason.trim()) {
      toast({ title: "Error", description: "Please provide a cancellation reason", variant: "destructive" })
      return
    }

    try {
      await bookingApi.cancelBooking(selectedBooking.id, cancelReason)
      toast({ title: "Success", description: "Booking cancelled successfully" })
      setShowCancelDialog(false)
      setCancelReason("")
      await loadBookings()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending_vendor: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200"
    }
    const labels = {
      pending_vendor: "Pending Confirmation",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      completed: "Completed"
    }
    return <Badge className={styles[status as keyof typeof styles]}>{labels[status as keyof typeof labels]}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2">Loading bookings...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-white/90">Manage your vendor bookings</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-4">Accept vendor quotes to create bookings</p>
            <Button onClick={() => onNavigate?.('quotes')} className="bg-gradient-to-r from-purple-600 to-pink-600">
              View Quotes
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{booking.vendor_name}</h3>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{booking.vendor_business}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(booking.event_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{booking.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-green-600">₹{booking.amount.toLocaleString()}</span>
                      </div>
                    </div>

                    {booking.event_name && (
                      <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                        <strong>Event:</strong> {booking.event_name}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onNavigate?.('messages')
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent('openVendorChat', {
                            detail: {
                              vendorName: booking.vendor_name,
                              vendorId: booking.vendor_id,
                              vendorBusiness: booking.vendor_business
                            }
                          }))
                        }, 100)
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    {booking.status === 'pending_vendor' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedBooking(booking)
                          setShowCancelDialog(true)
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {booking.quote_data && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2">Quote Details:</h4>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      {booking.quote_data.includes && booking.quote_data.includes.length > 0 && (
                        <div>
                          <p className="font-medium text-green-700">✅ Included:</p>
                          <ul className="text-gray-600 space-y-1">
                            {booking.quote_data.includes.map((item: string, idx: number) => (
                              <li key={idx}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {booking.quote_data.message && (
                        <div>
                          <p className="font-medium">Message:</p>
                          <p className="text-gray-600">{booking.quote_data.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to cancel this booking with {selectedBooking?.vendor_name}?
            </p>
            <div>
              <label className="block font-medium mb-2">Cancellation Reason *</label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="flex-1">
                Keep Booking
              </Button>
              <Button variant="destructive" onClick={handleCancelBooking} className="flex-1">
                Cancel Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
