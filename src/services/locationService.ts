import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useLocationStore } from '../store/locationStore';

const LOCATION_TASK_NAME = 'background-location-task';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
}

export class LocationService {
  private static instance: LocationService;
  private watchSubscription: Location.LocationSubscription | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Request location permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
        return backgroundStatus.status === 'granted';
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  // Open device settings for location permissions
  async openSettings(): Promise<void> {
    try {
      await Location.enableNetworkProviderAsync();
    } catch (error) {
      console.error('Error opening location settings:', error);
    }
  }

  // Get current location once
  async getCurrentLocation(): Promise<LocationCoordinates | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        altitude: location.coords.altitude ?? undefined,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  // Start watching location (for real-time updates)
  async startWatchingLocation() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 50, // Update every 50 meters
          timeInterval: 30000, // Update every 30 seconds
        },
        (location) => {
          const coordinates: LocationCoordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy ?? undefined,
            altitude: location.coords.altitude ?? undefined,
          };

          // Update store with new location
          useLocationStore.getState().updateLocation(coordinates);
        }
      );

      useLocationStore.getState().startTracking();
    } catch (error) {
      console.error('Error starting location watch:', error);
    }
  }

  // Stop watching location
  stopWatchingLocation() {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
    useLocationStore.getState().stopTracking();
  }

  // Get address from coordinates (reverse geocoding)
  async getAddressFromCoords(latitude: number, longitude: number): Promise<string> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        return [
          address.street,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(', ');
      }

      return 'Address not available';
    } catch (error) {
      console.error('Error getting address:', error);
      return 'Address not available';
    }
  }

  // Calculate distance between two coordinates in kilometers
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const locationService = LocationService.getInstance();