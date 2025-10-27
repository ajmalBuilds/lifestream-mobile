// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://lifestream-backend-he53.onrender.com',
    SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'https://lifestream-backend-he53.onrender.com',
    TIMEOUT: 10000,
  };
  
  // App Constants
  export const APP_CONSTANTS = {
    APP_NAME: 'LifeStream',
    VERSION: '1.0.0',
    SUPPORT_EMAIL: 'support@lifestream.com',
  };
  
  // Emergency Constants
  export const EMERGENCY_CONSTANTS = {
    BLOOD_TYPES: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const,
    URGENCY_LEVELS: ['critical', 'high', 'medium', 'low'] as const,
    MAX_DISTANCE_KM: 50,
  };