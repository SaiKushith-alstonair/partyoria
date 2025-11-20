import { useState, useEffect } from 'react';
import { apiService } from '../vendor/services/api';

interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  business: string;
  is_verified: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('vendor_profile');
      
      if (token && storedUser) {
        try {
          const result = await apiService.getProfile();
          if (result.data) {
            setUser(result.data);
          } else {
            // Token might be expired, clear storage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('vendor_profile');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await apiService.login(email, password);
    if (result.data) {
      setUser(result.data.vendor);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await apiService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };
};

