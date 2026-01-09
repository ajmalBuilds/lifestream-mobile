import { create } from 'zustand';

export interface MapRequest {
  id: number;
  patient_name: string;
  blood_type: string;
  hospital: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  units_needed: number;
  created_at: string;
  latitude: number;
  longitude: number;
  distance?: number;
  contact_number?: string;
  additional_notes?: string;
}

interface MapState {
  requests: MapRequest[];
  selectedRequest: MapRequest | null;
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  isLoading: boolean;
  filters: {
    bloodType: string | null;
    urgency: string | null;
    maxDistance: number;
  };
  setRequests: (requests: MapRequest[]) => void;
  setSelectedRequest: (request: MapRequest | null) => void;
  setMapRegion: (region: MapState['mapRegion']) => void;
  setLoading: (loading: boolean) => void;
  updateFilters: (filters: Partial<MapState['filters']>) => void;
  clearFilters: () => void;
  getFilteredRequests: () => MapRequest[];
}

export const useMapStore = create<MapState>((set, get) => ({
  requests: [],
  selectedRequest: null,
  mapRegion: {
    latitude: 17.3841,
    longitude: 78.4564,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  isLoading: false,
  filters: {
    bloodType: null,
    urgency: null,
    maxDistance: 50,
  },
  setRequests: (requests) => set({ requests }),
  setSelectedRequest: (selectedRequest) => set({ selectedRequest }),
  setMapRegion: (mapRegion) => set({ mapRegion }),
  setLoading: (isLoading) => set({ isLoading }),
  updateFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  clearFilters: () => set({ 
    filters: { bloodType: null, urgency: null, maxDistance: 50 } 
  }),
  getFilteredRequests: () => {
    const { requests, filters } = get();
    return requests.filter(request => {
      if (filters.bloodType && request.blood_type !== filters.bloodType) {
        return false;
      }
      if (filters.urgency && request.urgency !== filters.urgency) {
        return false;
      }
      return true;
    });
  },
}));