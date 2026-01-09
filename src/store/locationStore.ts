import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { locationAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
}

export interface PermissionStatus {
  foreground: boolean;
  background: boolean;
}

export interface LocationState {
  currentLocation: Location | null;
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
  permissionStatus: PermissionStatus;
  updateLocation: (location: { latitude: number; longitude: number; address?: string }) => Promise<void>;
  startTracking: () => void;
  stopTracking: () => void;
  clearError: () => void;
  setPermissionStatus: (status: PermissionStatus) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      currentLocation: null,
      isTracking: false,
      isLoading: false,
      error: null,
      permissionStatus: {
        foreground: false,
        background: false,
      },

      updateLocation: async (locationData: { latitude: number; longitude: number; address?: string }) => {
        const { token } = useAuthStore.getState();
        
        if (!token) {
          set({ error: 'Not authenticated' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const location: Location = {
            ...locationData,
            timestamp: Date.now(),
          };

          // Update local state first for immediate UI feedback
          set({ currentLocation: location });

          // Then sync with backend
          await locationAPI.updateLocation(location);
          
          // Emit to socket if available
          const socket = (global as any).socket;
          if (socket && socket.connected) {
            socket.emit('update-location', location);
          }

          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to update location';
          console.error('Location update error:', errorMessage);
          
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          
          throw new Error(errorMessage);
        }
      },

      startTracking: () => {
        set({ isTracking: true, error: null });
      },

      stopTracking: () => {
        set({ isTracking: false });
      },

      clearError: () => set({ error: null }),

      setPermissionStatus: (status: PermissionStatus) => {
        set({ permissionStatus: status });
      },
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        isTracking: state.isTracking,
        permissionStatus: state.permissionStatus,
      }),
    }
  )
);