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

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  bloodType: string;
  userType: 'donor' | 'recipient';
  phone?: string;
}