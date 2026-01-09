import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useLocationStore, PermissionStatus } from '../store/locationStore';

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

  // Check current permission status without requesting
  async checkPermissions(): Promise<PermissionStatus> {
    try {
      const foreground = await Location.getForegroundPermissionsAsync();
      const background = await Location.getBackgroundPermissionsAsync();
      
      return {
        foreground: foreground.status === 'granted',
        background: background.status === 'granted',
      };
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return {
        foreground: false,
        background: false,
      };
    }
  }

  // Request foreground permissions only
  async requestForegroundPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      
      // Update store with permission status
      useLocationStore.getState().setPermissionStatus({
        foreground: granted,
        background: false,
      });
      
      return granted;
    } catch (error) {
      console.error('Error requesting foreground permissions:', error);
      return false;
    }
  }

  // Request background permissions (only call after foreground is granted)
  async requestBackgroundPermissions(): Promise<boolean> {
    try {
      const foregroundStatus = await Location.getForegroundPermissionsAsync();
      
      if (foregroundStatus.status !== 'granted') {
        console.warn('Foreground permission must be granted before requesting background');
        return false;
      }

      const { status } = await Location.requestBackgroundPermissionsAsync();
      const granted = status === 'granted';
      
      // Update store with both permissions
      useLocationStore.getState().setPermissionStatus({
        foreground: true,
        background: granted,
      });
      
      return granted;
    } catch (error) {
      console.error('Error requesting background permissions:', error);
      return false;
    }
  }

  // Request all necessary permissions with proper flow
  async requestPermissions(): Promise<PermissionStatus> {
    try {
      // First check if we already have permissions
      const currentPermissions = await this.checkPermissions();
      
      if (currentPermissions.foreground && currentPermissions.background) {
        // Already have all permissions
        useLocationStore.getState().setPermissionStatus(currentPermissions);
        return currentPermissions;
      }

      // Request foreground if not granted
      if (!currentPermissions.foreground) {
        const foregroundGranted = await this.requestForegroundPermissions();
        
        if (!foregroundGranted) {
          return { foreground: false, background: false };
        }
      }

      // Request background if not granted (optional - only for continuous tracking)
      if (!currentPermissions.background) {
        const backgroundGranted = await this.requestBackgroundPermissions();
        return {
          foreground: true,
          background: backgroundGranted,
        };
      }

      return await this.checkPermissions();
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return { foreground: false, background: false };
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

  // Get current location once (only needs foreground permission)
  async getCurrentLocation(): Promise<LocationCoordinates | null> {
    try {
      // Check if we have at least foreground permission
      const permissions = await this.checkPermissions();
      
      if (!permissions.foreground) {
        const granted = await this.requestForegroundPermissions();
        if (!granted) {
          throw new Error('Location permission not granted');
        }
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
  async startWatchingLocation(): Promise<boolean> {
    try {
      // Check current permissions
      const permissions = await this.checkPermissions();
      
      // Request permissions if needed
      if (!permissions.foreground) {
        const newPermissions = await this.requestPermissions();
        if (!newPermissions.foreground) {
          throw new Error('Location permission not granted');
        }
      }

      // Stop existing subscription if any
      if (this.watchSubscription) {
        this.watchSubscription.remove();
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
      return true;
    } catch (error) {
      console.error('Error starting location watch:', error);
      useLocationStore.getState().stopTracking();
      return false;
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