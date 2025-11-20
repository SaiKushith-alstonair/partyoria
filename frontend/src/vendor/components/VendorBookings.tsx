import { useState, useEffect } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Calendar, MapPin, IndianRupee, User, CheckCircle, XCircle } from "lucide-react"
import { bookingApi } from "../../services/bookingApi"
import { toast } from "sonner"

export default function VendorBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await bookingApi.getVendorBookings()
      setBookings(response.bookings || [])
    } catch (error) {
      console.error('Failed to load bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (bookingId: number) => {
    try {
      await bookingApi.confirmBooking(bookingId)
      toast.success('Booking confirmed successfully!')
      await loadBookings()
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm booking')
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
      pending_vendor: "Pending Your Confirmation",
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          <p className="text-gray-600">Manage customer bookings</p>
        </div>
        <Badge variant="outline">{bookings.length} bookings</Badge>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
            <p className="text-gray-600">You'll receive bookings when customers accept your quotes</p>
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
                      <h3 className="text-lg font-semibold">{booking.customer_name}</h3>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{booking.service_type}</span>
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

                    {booking.description && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                        <strong>Details:</strong> {booking.description}
                      </div>
                    )}

                    <div className="mt-3 p-3 bg-purple-50 rounded text-sm">
                      <h4 className="font-medium mb-1">Customer Contact:</h4>
                      <div className="space-y-1 text-gray-700">
                        {booking.customer_email && <div>📧 {booking.customer_email}</div>}
                        {booking.customer_phone && <div>📱 {booking.customer_phone}</div>}
                      </div>
                    </div>
                  </div>

                  {booking.status === 'pending_vendor' && (
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleConfirm(booking.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
