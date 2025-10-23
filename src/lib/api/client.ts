/**
 * API Client (Phase 6)
 * Axios instance with interceptors for authentication, error handling, and request/response transformation
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/schemas/community';

// API base URL - use environment variable or fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies for auth
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get auth token from localStorage or your auth provider
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = crypto.randomUUID();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Transform response to match ApiResponse type
    if (response.data && typeof response.data === 'object') {
      return response;
    }
    // Wrap raw responses
    return {
      ...response,
      data: {
        success: true,
        data: response.data,
      },
    };
  },
  (error: AxiosError<ApiResponse>) => {
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject({
        success: false,
        error: 'Network error',
        message: 'Unable to connect to server',
      });
    }

    const { status, data } = error.response;

    // Handle specific error codes
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        toast.error('Session expired. Please log in again.');
        // Clear auth token
        localStorage.removeItem('auth_token');
        // Optionally redirect to login
        // window.location.href = '/login';
        break;

      case 403:
        // Forbidden
        toast.error(data?.error || 'You do not have permission to perform this action.');
        break;

      case 404:
        // Not found
        toast.error(data?.error || 'Resource not found.');
        break;

      case 422:
        // Validation error
        toast.error(data?.error || 'Validation failed. Please check your input.');
        break;

      case 429:
        // Rate limit
        toast.error('Too many requests. Please slow down.');
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        toast.error('Server error. Please try again later.');
        break;

      default:
        toast.error(data?.error || 'An unexpected error occurred.');
    }

    return Promise.reject(data || { success: false, error: 'Unknown error' });
  }
);

// API wrapper functions with type safety
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.get(url, config).then((res) => res.data),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.post(url, data, config).then((res) => res.data),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.put(url, data, config).then((res) => res.data),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.patch(url, data, config).then((res) => res.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.delete(url, config).then((res) => res.data),
};

// Helper to set auth token
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('auth_token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('auth_token');
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Export axios instance for advanced use cases
export default apiClient;
