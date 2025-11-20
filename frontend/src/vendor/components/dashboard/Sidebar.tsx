import { NavLink, useNavigate } from "react-router-dom";
import { Home, Calendar, Star, BarChart3, FileCheck, BookOpen, MessageCircle, Settings, User, Users, LogOut, FileText } from "lucide-react";

const menuItems = [
  { path: "/vendor/dashboard", label: "Dashboard", icon: Home },
  { path: "/vendor/dashboard/profile", label: "Profile", icon: User },
  { path: "/vendor/dashboard/bookings", label: "Bookings", icon: BookOpen },
  { path: "/vendor/dashboard/quotes", label: "Quote Requests", icon: FileText },
  { path: "/vendor/dashboard/services", label: "Services", icon: Settings },
  { path: "/vendor/dashboard/calendar", label: "Calendar", icon: Calendar },
  { path: "/vendor/dashboard/messages", label: "Messages", icon: MessageCircle },
  { path: "/vendor/dashboard/reviews", label: "Reviews", icon: Star },
  { path: "/vendor/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/vendor/dashboard/verification", label: "Verification", icon: FileCheck },
];

const Sidebar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    sessionStorage.removeItem('partyoria_user');
    localStorage.removeItem('partyoria_user');
    localStorage.removeItem('vendor_profile');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate("/");
  };
  
  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 border-r border-purple-700/30 flex flex-col z-10 shadow-2xl">
      <div className="p-6 border-b border-purple-700/30">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">
          ✨ Vendor Hub
        </h1>
        <p className="text-purple-200 text-sm mt-1">Professional Dashboard</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/vendor/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-purple-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-purple-700/30">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 text-purple-200 hover:bg-white/10 hover:text-white w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;





