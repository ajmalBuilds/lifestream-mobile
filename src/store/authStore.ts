import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, RegisterData } from '../services/api';
import { extractAuthData, extractUserData } from '@/utils/apiHelpers';

export interface User {
  id: string;
  email: string;
  name: string;
  bloodType: string;
  userType: 'donor' | 'recipient' | 'admin';
  isVerified: boolean;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(email, password);
          const { user, token } = extractAuthData(response.data);

          if (!user || !token) {
            throw new Error('Invalid response from server');
          }

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw new Error(errorMessage);
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const { user, token } = extractAuthData(response.data);

          if (!user || !token) {
            throw new Error('Invalid response from server');
          }

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw new Error(errorMessage);
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await authAPI.getCurrentUser();
          const currentUser = extractUserData(response.data);
          set({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);