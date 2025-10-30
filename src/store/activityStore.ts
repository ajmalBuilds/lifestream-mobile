import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ActivityType = 
  | 'request_created'
  | 'request_fulfilled'
  | 'donor_matched'
  | 'donation_scheduled'
  | 'donation_completed'
  | 'message_received'
  | 'profile_updated'
  | 'location_shared';

// More flexible metadata type
export interface ActivityMetadata {
  // Request-related metadata
  requestId?: string;
  donorId?: string;
  bloodType?: string;
  units?: number;
  hospital?: string;
  
  // Profile-related metadata
  field?: string;
  oldValue?: string;
  newValue?: string;
  
  // Location-related metadata
  enabled?: boolean;
  address?: string;
  
  // Message-related metadata
  fromUser?: string;
  message?: string;
  
  // Donation-related metadata
  donorName?: string;
  distance?: number;
  scheduledTime?: string;
  
  // Generic metadata for flexibility
  [key: string]: any;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  message: string;
  timestamp: string;
  metadata?: ActivityMetadata;
  read: boolean;
}

interface ActivityState {
  activities: Activity[];
  unreadCount: number;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (activityId: string) => void;
  markAllAsRead: () => void;
  clearActivities: () => void;
  getRecentActivities: (limit?: number) => Activity[];
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      unreadCount: 0,

      addActivity: (activityData) => {
        const newActivity: Activity = {
          id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          read: false,
          ...activityData,
        };

        set((state) => ({
          activities: [newActivity, ...state.activities].slice(0, 50), // Keep last 100 activities
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (activityId) => {
        set((state) => ({
          activities: state.activities.map((activity) =>
            activity.id === activityId ? { ...activity, read: true } : activity
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          activities: state.activities.map((activity) => ({
            ...activity,
            read: true,
          })),
          unreadCount: 0,
        }));
      },

      clearActivities: () => {
        set({ activities: [], unreadCount: 0 });
      },

      getRecentActivities: (limit = 10) => {
        const { activities } = get();
        return activities.slice(0, limit);
      },
    }),
    {
      name: 'activity-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);