import { Toaster } from "../components/ui/toaster";
import { Toaster as Sonner } from "../components/ui/sonner";
import { TooltipProvider } from "../components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Home from "./pages/dashboard/Home";
import Profile from "./pages/dashboard/Profile";
import Bookings from "./pages/dashboard/Bookings";
import EventsCalendar from "./pages/dashboard/EventsCalendar";
import Reviews from "./pages/dashboard/Reviews";
import Analytics from "./pages/dashboard/Analytics";
import Verification from "./pages/dashboard/Verification";
import Settings from "./pages/dashboard/Settings";
import Services from "./pages/dashboard/Services";
import VendorManagement from "./pages/dashboard/VendorManagement";
import VendorChat from "./pages/dashboard/VendorChat";
import QuoteRequests from "./components/QuoteRequests";

const VendorApp = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="calendar" element={<EventsCalendar />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="verification" element={<Verification />} />
        <Route path="settings" element={<Settings />} />
        <Route path="services" element={<Services />} />
        <Route path="quotes" element={<QuoteRequests />} />
        <Route path="messages" element={<VendorChat />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default VendorApp;





