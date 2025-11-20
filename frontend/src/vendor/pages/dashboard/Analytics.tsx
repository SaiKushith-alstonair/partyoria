import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 3800 },
  { month: "Mar", revenue: 5100 },
  { month: "Apr", revenue: 4600 },
  { month: "May", revenue: 6200 },
  { month: "Jun", revenue: 5800 },
  { month: "Jul", revenue: 7400 },
  { month: "Aug", revenue: 6900 },
  { month: "Sep", revenue: 8100 },
];

const bookingsData = [
  { service: "Photography", bookings: 18 },
  { service: "Catering", bookings: 15 },
  { service: "Decoration", bookings: 12 },
  { service: "DJ", bookings: 8 },
  { service: "Planning", bookings: 5 },
  { service: "Videography", bookings: 10 },
  { service: "Transportation", bookings: 4 },
];

const ratingData = [
  { name: "5 Stars", value: 35, color: "hsl(142 76% 36%)" },
  { name: "4 Stars", value: 12, color: "hsl(221 83% 53%)" },
  { name: "3 Stars", value: 2, color: "hsl(38 92% 50%)" },
  { name: "2 Stars", value: 1, color: "hsl(25 95% 53%)" },
];

const Analytics = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Analytics</h1>

      {/* Revenue Trend */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings by Service */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Bookings by Service Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" tick={{ fontSize: 8 }} interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ratingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {ratingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;





