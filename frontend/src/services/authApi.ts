import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

export const getAuthToken = () => {
  const state = useAuthStore.getState();
  return state.tokens?.access || null;
};

export const getRefreshToken = () => {
  const state = useAuthStore.getState();
  return state.tokens?.refresh || null;
};

export const isAuthenticated = () => {
  const state = useAuthStore.getState();
  return state.isAuthenticated;
};

export const getUser = () => {
  const state = useAuthStore.getState();
  return state.user;
};

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await useAuthStore.getState().refreshToken();
        const newToken = getAuthToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          return fetch(`${API_BASE_URL}${url}`, { ...options, headers });
        }
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    } else {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
  }
  
  return response;
};
