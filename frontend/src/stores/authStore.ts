import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

// Types
interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  user_type: 'customer' | 'vendor';
  phone?: string;
  bio?: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  user_type: 'customer' | 'vendor';
  phone?: string;
}

// API Service
class AuthAPI {
  private baseURL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  }

  async register(userData: RegisterData) {
    const response = await fetch(`${this.baseURL}/api/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  }

  async refreshToken(refreshToken: string) {
    const response = await fetch(`${this.baseURL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }

  async logout(refreshToken: string) {
    await fetch(`${this.baseURL}/api/auth/logout/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async updateProfile(data: Partial<User>, accessToken: string) {
    const response = await fetch(`${this.baseURL}/api/auth/profile/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Profile update failed');
    }

    return response.json();
  }
}

const authAPI = new AuthAPI();

// Zustand Store
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await authAPI.login(email, password);
            
            const tokens = response.tokens || {
              access: response.access,
              refresh: response.refresh
            };
            
            set({
              user: response.user,
              tokens: tokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Login failed',
            });
            throw error;
          }
        },

        register: async (userData: RegisterData) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await authAPI.register(userData);
            
            set({
              user: response.user,
              tokens: response.tokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Registration failed',
            });
            throw error;
          }
        },

        logout: async () => {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            error: null,
          });
        },

        refreshToken: async () => {
          const { tokens } = get();
          
          if (!tokens?.refresh) {
            throw new Error('No refresh token available');
          }
          
          try {
            const response = await authAPI.refreshToken(tokens.refresh);
            
            const newTokens = {
              ...tokens,
              access: response.access,
            };
            
            set({
              tokens: newTokens,
            });
          } catch (error) {
            get().logout();
            throw error;
          }
        },

        updateProfile: async (data: Partial<User>) => {
          const { tokens, user } = get();
          
          if (!tokens?.access) {
            throw new Error('No access token available');
          }
          
          set({ isLoading: true, error: null });
          
          try {
            const updatedUser = await authAPI.updateProfile(data, tokens.access);
            
            set({
              user: { ...user, ...updatedUser },
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Profile update failed',
            });
            throw error;
          }
        },

        checkAuth: async () => {
          const { tokens } = get();
          
          if (!tokens?.access) {
            // No tokens, user is not authenticated
            set({ isAuthenticated: false, user: null, tokens: null });
            return;
          }
          
          try {
            // Try to decode token to check if it's valid
            const payload = JSON.parse(atob(tokens.access.split('.')[1]));
            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            
            if (currentTime >= expirationTime) {
              // Token expired, try to refresh
              await get().refreshToken();
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            get().logout();
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          tokens: state.tokens,
          isAuthenticated: state.isAuthenticated,
        }),
        skipHydration: false,
      }
    ),
    { name: 'auth-store' }
  )
);

// Token refresh interceptor
let refreshPromise: Promise<void> | null = null;

export const setupTokenRefresh = () => {
  const { tokens, refreshToken, logout } = useAuthStore.getState();
  
  if (!tokens?.access) return;
  
  // Decode JWT to check expiration
  try {
    const payload = JSON.parse(atob(tokens.access.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    
    // Refresh token 5 minutes before expiry
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);
    
    setTimeout(async () => {
      if (!refreshPromise) {
        refreshPromise = refreshToken().catch(() => {
          logout();
        }).finally(() => {
          refreshPromise = null;
        });
      }
      
      await refreshPromise;
      setupTokenRefresh(); // Setup next refresh
    }, refreshTime);
  } catch (error) {
    console.error('Token parsing error:', error);
    logout();
  }
};

