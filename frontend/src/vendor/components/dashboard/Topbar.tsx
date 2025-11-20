import { useState, useEffect } from "react";
import { Bell, User, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Badge } from "../../../components/ui/badge";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "../../../components/NotificationBell";

const Topbar = () => {
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState({ fullName: 'Vendor', business: 'Professional' });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadVendorData = () => {
      const stored = localStorage.getItem("vendor_profile") || localStorage.getItem("vendorOnboarding") || "{}";
      try {
        const parsed = JSON.parse(stored);
        const firstName = parsed.first_name || '';
        const lastName = parsed.last_name || '';
        let fullName = `${firstName} ${lastName}`.trim();
        
        if (!fullName) {
          fullName = parsed.full_name || parsed.email?.split('@')[0] || 'Vendor';
        }
        
        setVendorData({
          fullName: fullName,
          business: parsed.business || 'Professional'
        });
      } catch (e) {
        setVendorData({ fullName: 'Vendor', business: 'Professional' });
      }
    };
    
    loadVendorData();
    
    const interval = setInterval(loadVendorData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('partyoria_user');
    localStorage.removeItem('partyoria_user');
    localStorage.removeItem('vendor_profile');
    localStorage.removeItem('vendorOnboarding');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
  };

  return (
    <header className={`sticky top-0 z-50 h-20 transition-all duration-300 flex items-center justify-between px-8 ${
      isScrolled 
        ? 'bg-white border-b border-gray-300 shadow-2xl' 
        : 'bg-gradient-to-r from-slate-100 to-indigo-100 border-b border-indigo-200/60 shadow-lg'
    }`}>
      {/* Beautiful Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
          <input
            type="text"
            placeholder="Search bookings, customers, services..."
            className="w-full h-12 pl-12 pr-4 bg-white/80 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-400 transition-all duration-200 shadow-sm backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="h-8 w-px bg-slate-300 mx-2"></div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-2xl p-2 hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-blue-200 shadow-sm">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-slate-900 font-medium text-sm">{vendorData.fullName || 'Vendor'}</p>
                  <p className="text-slate-500 text-xs">{vendorData.business || 'Professional'}</p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/vendor/dashboard/profile")}>Profile Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;





