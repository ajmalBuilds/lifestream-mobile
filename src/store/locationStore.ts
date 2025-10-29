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

interface LocationState {
  currentLocation: Location | null;
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
  updateLocation: (location: { latitude: number; longitude: number; address?: string }) => Promise<void>;
  startTracking: () => void;
  stopTracking: () => void;
  clearError: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      currentLocation: null,
      isTracking: false,
      isLoading: false,
      error: null,

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

          set({ currentLocation: location });

          await locationAPI.updateLocation(location);
          const socket = (global as any).socket;
          if (socket) {
            socket.emit('update-location', location);
          }

          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to update location';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw new Error(errorMessage);
        }
      },

      startTracking: () => {
        set({ isTracking: true });
      },

      stopTracking: () => {
        set({ isTracking: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        isTracking: state.isTracking,
      }),
    }
  )
);