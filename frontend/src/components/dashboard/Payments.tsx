import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, IndianRupee, Calendar, CheckCircle, Clock, AlertCircle, Search } from "lucide-react"

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")

  const payments = [
    {
      id: 1,
      eventName: "Wedding Anniversary",
      vendor: "Elite Events Caterers",
      amount: 25000,
      status: "completed",
      date: "2024-01-15",
      method: "Credit Card",
      transactionId: "TXN123456789"
    },
    {
      id: 2,
      eventName: "Birthday Party",
      vendor: "Royal Bloom Decor",
      amount: 15000,
      status: "pending",
      date: "2024-01-14",
      method: "Bank Transfer",
      transactionId: "TXN123456790"
    },
    {
      id: 3,
      eventName: "Corporate Event",
      vendor: "DJ Night Beats",
      amount: 12000,
      status: "failed",
      date: "2024-01-13",
      method: "UPI",
      transactionId: "TXN123456791"
    }
  ]

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "failed":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 w-full max-w-full mx-0">
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 mb-6 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Payments</h1>
          <p className="text-white/90 max-w-xl">
            Track your payments, manage transactions, and view payment history for all your events.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mt-20 -mr-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -mb-20 -ml-20"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                <h3 className="text-2xl font-bold mt-1">₹52,000</h3>
                <span className="text-xs font-medium text-green-600">+₹15K this month</span>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <IndianRupee className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Payments</p>
                <h3 className="text-2xl font-bold mt-1">₹15,000</h3>
                <span className="text-xs font-medium text-yellow-600">1 payment due</span>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <h3 className="text-2xl font-bold mt-1">8</h3>
                <span className="text-xs font-medium text-green-600">Transactions</span>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <CheckCircle className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <h3 className="text-2xl font-bold mt-1">₹25,000</h3>
                <span className="text-xs font-medium text-purple-600">3 payments</span>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search payments..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="amount-high">Amount: High to Low</SelectItem>
            <SelectItem value="amount-low">Amount: Low to High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <Card key={payment.id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-gray-50">
                    <CreditCard className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{payment.eventName}</h3>
                    <p className="text-gray-600">{payment.vendor}</p>
                    <p className="text-sm text-gray-500">
                      {payment.method} • {payment.transactionId}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusStyle(payment.status)}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1 capitalize">{payment.status}</span>
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">₹{payment.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{payment.date}</p>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const receiptData = {
                      transactionId: payment.transactionId,
                      eventName: payment.eventName,
                      vendor: payment.vendor,
                      amount: payment.amount,
                      date: payment.date,
                      method: payment.method
                    }
                    
                    const receiptText = `
                      PAYMENT RECEIPT
                      ================
                      Transaction ID: ${receiptData.transactionId}
                      Event: ${receiptData.eventName}
                      Vendor: ${receiptData.vendor}
                      Amount: ₹${receiptData.amount.toLocaleString()}
                      Date: ${receiptData.date}
                      Payment Method: ${receiptData.method}
                      Status: ${payment.status.toUpperCase()}
                    `
                    
                    const blob = new Blob([receiptText], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `receipt-${payment.transactionId}.txt`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }}
                >
                  View Receipt
                </Button>
                {payment.status === "failed" && (
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    onClick={() => {
                      alert(`Retrying payment for ${payment.eventName}. You will be redirected to payment gateway.`)
                    }}
                  >
                    Retry Payment
                  </Button>
                )}
                {payment.status === "pending" && (
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    onClick={() => {
                      alert(`Completing payment for ${payment.eventName}. You will be redirected to payment gateway.`)
                    }}
                  >
                    Complete Payment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}