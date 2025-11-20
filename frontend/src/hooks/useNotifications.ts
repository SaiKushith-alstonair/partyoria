import { useState, useEffect, useCallback } from 'react';

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
  related_object_type?: string;
  related_object_id?: string;
}

interface NotificationPreferences {
  enable_in_app: boolean;
  quote_notifications: boolean;
  booking_notifications: boolean;
  payment_notifications: boolean;
  message_notifications: boolean;
  marketing_notifications: boolean;
  system_notifications: boolean;
  quiet_hours_enabled: boolean;
  quiet_start_time: string;
  quiet_end_time: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  // Get auth token
  const getAuthToken = useCallback(() => {
    // Check Zustand auth store first
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        if (authData?.state?.tokens?.access) {
          return authData.state.tokens.access;
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    // Check vendor profile
    const vendorProfile = localStorage.getItem('vendor_profile');
    if (vendorProfile) {
      try {
        const vendorData = JSON.parse(vendorProfile);
        if (vendorData.access_token) {
          return vendorData.access_token;
        }
      } catch (e) {
        console.error('Failed to parse vendor_profile:', e);
      }
    }
    
    // Try customer tokens
    return localStorage.getItem('access_token') || 
           localStorage.getItem('authToken') || 
           localStorage.getItem('token');
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/notifications/recent/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else if (response.status === 401) {
        // Token expired or invalid - silently fail
        setNotifications([]);
      }
    } catch (error) {
      // Silently fail - don't log auth errors
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/notifications/unread_count/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count);
      } else if (response.status === 401) {
        // Token expired or invalid - set count to 0
        setUnreadCount(0);
      }
    } catch (error) {
      // Silently fail - don't log auth errors
      setUnreadCount(0);
    }
  }, [getAuthToken]);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/notifications/mark_as_read/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notification_ids: notificationIds
        })
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notificationIds.includes(notif.id) 
              ? { ...notif, is_read: true }
              : notif
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, [getAuthToken]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/notifications/mark_all_read/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [getAuthToken]);

  // Load preferences
  const loadPreferences = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/preferences/my_preferences/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      } else if (response.status === 401) {
        // Token expired or invalid - silently fail
        setPreferences(null);
      }
    } catch (error) {
      // Silently fail - don't log auth errors
      setPreferences(null);
    }
  }, [getAuthToken]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/preferences/update_preferences/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPreferences)
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
        return true;
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
    return false;
  }, [getAuthToken]);

  // Get notifications by type
  const getNotificationsByType = useCallback(async (type: string) => {
    const token = getAuthToken();
    if (!token) return [];

    try {
      const response = await fetch(`http://localhost:8000/api/notifications/by_type/?type=${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error loading notifications by type:', error);
    }
    return [];
  }, [getAuthToken]);

  // Get high priority notifications
  const getHighPriorityNotifications = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return [];

    try {
      const response = await fetch('http://localhost:8000/api/notifications/priority/?priority=high', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error loading high priority notifications:', error);
    }
    return [];
  }, [getAuthToken]);

  // Auto-refresh notifications
  useEffect(() => {
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  // Initial load - only if authenticated
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      loadUnreadCount();
      loadPreferences();
    }
  }, [loadUnreadCount, loadPreferences, getAuthToken]);

  return {
    notifications,
    unreadCount,
    loading,
    preferences,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    loadPreferences,
    updatePreferences,
    getNotificationsByType,
    getHighPriorityNotifications
  };
};