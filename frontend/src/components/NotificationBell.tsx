import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { useNotifications } from '../hooks/useNotifications';

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  is_read: boolean;
  created_at: string;
  time_ago: string;
  action_url?: string;
}

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Mock notifications for testing when no API data
  const mockNotifications = [
    {
      id: '1',
      title: 'Welcome to PartyOria!',
      message: 'Start planning your first event today.',
      notification_type: 'welcome',
      priority: 'medium' as const,
      is_read: false,
      created_at: new Date().toISOString(),
      time_ago: '2 minutes ago'
    },
    {
      id: '2', 
      title: 'Event Planning Tips',
      message: 'Check out our guide for successful events.',
      notification_type: 'tips',
      priority: 'low' as const,
      is_read: false,
      created_at: new Date().toISOString(),
      time_ago: '1 hour ago'
    },
    {
      id: '3',
      title: 'New Vendors Available',
      message: 'Discover amazing vendors in your area.',
      notification_type: 'vendor_update',
      priority: 'medium' as const,
      is_read: false,
      created_at: new Date().toISOString(),
      time_ago: '3 hours ago'
    }
  ];

  const displayNotifications = notifications.length > 0 ? notifications : mockNotifications;
  const displayUnreadCount = unreadCount > 0 ? unreadCount : mockNotifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleBellClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Bell clicked, current isOpen:', isOpen);
    setIsOpen(!isOpen);
    console.log('Setting isOpen to:', !isOpen);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Only call API for real notifications, not mock ones
    if (!notification.is_read && notifications.length > 0) {
      await markAsRead([notification.id]);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-purple-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'quote_received': '💰',
      'quote_accepted': '✅',
      'booking_confirmed': '📅',
      'payment_due': '💳',
      'new_message': '💬',
      'event_reminder': '⏰',
      'review_received': '⭐',
      'performance_summary': '📊',
      'new_quote_request': '📝',
      'payment_received': '💵',
    };
    return iconMap[type] || '🔔';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBellClick}
        className="relative hover:bg-gray-100"
      >
        <Bell className="h-5 w-5" />
        {displayUnreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-[9999]">
          <Card className="w-80 max-h-96 shadow-xl border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex gap-1">
                  {displayUnreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Only call API for real notifications
                        if (notifications.length > 0) {
                          markAllAsRead();
                        }
                      }}
                      title="Mark all as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {displayUnreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {displayUnreadCount} unread notification{displayUnreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-80">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading notifications...
                  </div>
                ) : displayNotifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {displayNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b cursor-pointer hover:bg-muted transition-colors ${
                          !notification.is_read ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <span className="text-lg">
                              {getTypeIcon(notification.notification_type)}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm truncate">
                                {notification.title}
                              </p>
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {notification.time_ago}
                              </span>
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Only call API for real notifications
                                    if (notifications.length > 0) {
                                      markAsRead([notification.id]);
                                    }
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              {displayNotifications.length > 0 && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/dashboard/notifications';
                    }}
                  >
                    View All Notifications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};