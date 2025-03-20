import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentLocale } from '../i18n';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://api.superapp-home-services.com/api/v1', // This would be the real API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Set auth token for API requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// API service - Organize endpoints by resource
export const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials: { email: string; password: string }) => 
      api.post('/auth/login', credentials),
    register: (userData: { name: string; email: string; password: string }) => 
      api.post('/auth/register', userData),
    forgotPassword: (email: string) => 
      api.post('/auth/forgot-password', { email }),
    resetPassword: (data: { token: string; password: string }) => 
      api.post('/auth/reset-password', data),
    getProfile: () => 
      api.get('/auth/profile'),
    updateProfile: (profileData: any) => 
      api.put('/auth/profile', profileData),
  },
  
  // Services endpoints
  services: {
    getAll: (params?: any) => 
      api.get('/services', { params }),
    getById: (id: string) => 
      api.get(`/services/${id}`),
    getCategories: () => 
      api.get('/services/categories'),
    search: (query: string) => 
      api.get('/services/search', { params: { query } }),
  },
  
  // Bookings endpoints
  bookings: {
    getAll: () => 
      api.get('/bookings'),
    getById: (id: string) => 
      api.get(`/bookings/${id}`),
    create: (bookingData: any) => 
      api.post('/bookings', bookingData),
    update: (id: string, bookingData: any) => 
      api.put(`/bookings/${id}`, bookingData),
    cancel: (id: string) => 
      api.post(`/bookings/${id}/cancel`),
  },
  
  // Payments endpoints
  payments: {
    getAll: () => 
      api.get('/payments'),
    getById: (id: string) => 
      api.get(`/payments/${id}`),
    create: (paymentData: any) => 
      api.post('/payments', paymentData),
    getPaymentMethods: () => 
      api.get('/payments/methods'),
    addPaymentMethod: (methodData: any) => 
      api.post('/payments/methods', methodData),
  },
  
  // Providers endpoints
  providers: {
    getAll: (params?: any) => 
      api.get('/providers', { params }),
    getById: (id: string) => 
      api.get(`/providers/${id}`),
    getReviews: (id: string) => 
      api.get(`/providers/${id}/reviews`),
    addReview: (id: string, reviewData: any) => 
      api.post(`/providers/${id}/reviews`, reviewData),
  },
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add logic here to automatically add auth token to all requests
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors (401, 403, etc.)
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        // Handle unauthorized (redirect to login, etc.)
        console.log('Unauthorized, redirecting to login...');
      }
      
      if (status === 403) {
        // Handle forbidden
        console.log('Forbidden access');
      }
      
      if (status === 500) {
        // Handle server error
        console.log('Server error occurred');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 