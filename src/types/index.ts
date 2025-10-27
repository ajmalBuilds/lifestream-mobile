// Core Types
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UserType = 'donor' | 'recipient' | 'both';
export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  bloodType: BloodType;
  userType: UserType;
  phone: string;
  location?: Location;
  isVerified: boolean;
  createdAt: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

// Emergency Types
export interface EmergencyRequest {
  id: string;
  patientName: string;
  bloodType: BloodType;
  unitsNeeded: number;
  hospital: string;
  urgency: UrgencyLevel;
  location: Location;
  additionalNotes?: string;
  status: 'active' | 'fulfilled' | 'cancelled' | 'expired';
  createdAt: string;
  requester: User;
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  EmergencyCreate: undefined;
  EmergencyDetails: { requestId: string };
  Chat: { conversationId: string };
};