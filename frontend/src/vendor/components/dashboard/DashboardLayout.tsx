import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { AlertCircle, X } from "lucide-react";

const DashboardLayout = () => {
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Simple auth check without complex logic
    const accessToken = localStorage.getItem('access_token');
    const vendorProfile = localStorage.getItem('vendor_profile');
    
    if (accessToken && vendorProfile) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(true); // Allow access for development
    }
    setIsLoading(false);
    
    // Check verification popup
    const hasShownPopup = localStorage.getItem('verificationPopupShown');
    const verificationStatus = localStorage.getItem('verificationStatus');
    
    if (!hasShownPopup && verificationStatus !== 'approved') {
      setShowVerificationPopup(true);
      localStorage.setItem('verificationPopupShown', 'true');
    }
  }, []);
  
  useEffect(() => {
    // Listen for verification status changes
    const handleVerificationUpdate = () => {
      const verificationStatus = localStorage.getItem('verificationStatus');
      if (verificationStatus === 'approved') {
        setShowVerificationPopup(false);
      }
    };

    window.addEventListener('verificationStatusChanged', handleVerificationUpdate);
    
    return () => {
      window.removeEventListener('verificationStatusChanged', handleVerificationUpdate);
    };
  }, []);

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Temporarily allow access without authentication for testing
  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto" id="dashboard-main">
          <Outlet />
        </main>
      </div>
      
      {showVerificationPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Verification Required
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowVerificationPopup(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Welcome! Complete your profile setup and document verification to start receiving bookings.
              </p>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => {
                    setShowVerificationPopup(false);
                    navigate('/vendor/dashboard/onboarding');
                  }}
                >
                  Complete Profile Setup
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowVerificationPopup(false);
                    navigate('/dashboard/verification');
                  }}
                >
                  Verify Documents
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowVerificationPopup(false)}
                >
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;





