import axios from 'axios';
import { Config } from '../config/environment';
import { useAuthStore } from '@/store/authStore';

export const api = axios.create({
  baseURL: Config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (userData: RegisterData) =>
    api.post('/auth/register', userData),

  getCurrentUser: () =>
    api.get('/auth/me'),

  logout: () =>
    api.post('/auth/logout'),

  refreshToken: (token: string) =>
    api.post('/auth/refresh', { token }),
};

export const locationAPI = {
    updateLocation: (location: { latitude: number; longitude: number; address?:string; timestamp: number} ) => 
    api.post('users/location', location),

  getLocation: (userId: string) =>
    api.get(`users/${userId}/location`),
}

export const requestAPI = {
  createRequest: (requestData: any) =>
    api.post('/requests/create', requestData),

  getRequests: () =>
    api.get('/requests/active'),

  getRequestById: (id: string) =>
    api.get(`/requests/${id}`),

  getNearbyRequests: (latitude: number, longitude: number, radius: number = 10, bloodType?: string) => {
    const params: any = {
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString()
    };
    
    if (bloodType) {
      params.bloodType = bloodType;
    }
    
    return api.get(`/requests/nearby`, { params });
  },
  updateRequest: (id: string, updateData: any) =>
    api.put(`/requests/${id}`, updateData),

  deleteRequest: (id: string) =>
    api.delete(`/requests/${id}`),
};

export const mapAPI = {
  getRequestsWithCoordinates: (latitude: number, longitude: number, radius: number = 50) =>
    api.get(`/requests/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`),

  getRequestDetails: (id: number) =>
    api.get(`/requests/${id}`),
};

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  bloodType: string;
  userType: 'donor' | 'recipient';
  phone?: string;
}