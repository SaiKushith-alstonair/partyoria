import React, { useState } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from './ui/sidebar';
import { cn } from '../lib/utils';
import { 
  Home, 
  Calendar, 
  Users, 
  CreditCard, 
  Settings, 
  Plus,
  Search,
  BarChart3,
  Clock,
  MessageSquare,
  Bell,
  LogOut,
  User
} from 'lucide-react';
import { getUserData } from '../utils/auth';

interface CustomerSidebarProps {
  activeComponent: string;
  onComponentChange: (component: string) => void;
  onLogout: () => void;
}

const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  activeComponent,
  onComponentChange,
  onLogout
}) => {
  const [open, setOpen] = useState(false);

  const userData = (() => {
    const user = getUserData();
    if (user) {
      return {
        name: user.firstName || user.username || 'User',
        email: user.email || 'user@example.com',
        type: user.user_type || 'customer'
      };
    }
    return { name: 'User', email: 'user@example.com', type: 'customer' };
  })();

  const customerLinks = [
    {
      label: "Dashboard",
      href: "#",
      icon: <Home className="h-5 w-5" />,
      component: "dashboard"
    },
    {
      label: "My Events",
      href: "#",
      icon: <Calendar className="h-5 w-5" />,
      component: "my-events"
    },
    {
      label: "Create Event",
      href: "#",
      icon: <Plus className="h-5 w-5" />,
      component: "create-event"
    },
    {
      label: "Browse Vendors",
      href: "#",
      icon: <Search className="h-5 w-5" />,
      component: "browse-vendors"
    },
    {
      label: "Budget Analytics",
      href: "#",
      icon: <BarChart3 className="h-5 w-5" />,
      component: "budget-analytics"
    },
    {
      label: "Event Timeline",
      href: "#",
      icon: <Clock className="h-5 w-5" />,
      component: "event-timeline"
    },
    {
      label: "Messages",
      href: "#",
      icon: <MessageSquare className="h-5 w-5" />,
      component: "messages"
    },
    {
      label: "Payments",
      href: "#",
      icon: <CreditCard className="h-5 w-5" />,
      component: "payments"
    },
    {
      label: "Settings",
      href: "#",
      icon: <Settings className="h-5 w-5" />,
      component: "settings"
    }
  ];

  return (
    <div className="flex h-screen bg-white">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 border-r border-purple-200 bg-white">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo */}
            <div className="flex items-center gap-2 py-4 px-2">
              <div className="w-16 h-16">
                <img src="/videos/partyoria.gif" alt="PartyOria" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="mt-4 flex flex-col gap-1">
              {customerLinks.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={link}
                  isActive={activeComponent === link.component}
                  onClick={() => onComponentChange(link.component)}
                />
              ))}
            </div>
          </div>

          {/* User Profile Section */}
          <div className="border-t border-purple-100 pt-4">
            {/* User Info */}
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {userData.name.charAt(0).toUpperCase()}
              </div>
              {open && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userData.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userData.email}
                  </p>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <SidebarLink
              link={{
                label: "Logout",
                href: "#",
                icon: <LogOut className="h-5 w-5" />
              }}
              onClick={onLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            />
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
};

export default CustomerSidebar;