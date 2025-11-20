import { useAuthStore } from '../stores/authStore';

export const isAuthenticated = (): boolean => {
  const state = useAuthStore.getState();
  return state.isAuthenticated;
};

export const getUserData = () => {
  const state = useAuthStore.getState();
  return state.user;
};

export const clearAuthData = () => {
  useAuthStore.getState().logout();
};

export const setAuthData = (userData: any) => {
  useAuthStore.setState({ user: userData, isAuthenticated: true });
};