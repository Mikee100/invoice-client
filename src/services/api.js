import axios from 'axios';
import { toast } from 'react-toastify';
import { store } from '../redux/store';
import { logoutUser } from '../redux/userSlice';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        method: config.method.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }
    
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for handling common responses
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        status: error.response?.status,
        url: originalRequest?.url,
        message: error.message,
        response: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token if refresh token is available
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });
          
          const { token } = response.data;
          localStorage.setItem('token', token);
          
          // Update the Authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } else {
          // No refresh token available, log out the user
          store.dispatch(logoutUser());
          window.location.href = '/login';
        }
      } catch (refreshError) {
        // If refresh token fails, log out the user
        store.dispatch(logoutUser());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    // Show error toast for non-401 errors
    if (error.response?.status !== 401) {
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle file uploads
export const uploadFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

// Helper function to handle errors
export const handleApiError = (error, customMessage = null) => {
  const errorMessage = error.response?.data?.message || error.message || customMessage || 'An error occurred';
  console.error('API Error:', errorMessage, error);
  
  toast.error(errorMessage, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
  
  return Promise.reject(error);
};

// Mock data for development
const mockPayments = [
  { _id: 'p1', invoiceId: '1', amount: 500, method: 'credit_card', date: '2025-08-15', status: 'completed' },
  { _id: 'p2', invoiceId: '1', amount: 700, method: 'bank_transfer', date: '2025-08-20', status: 'completed' },
  { _id: 'p3', invoiceId: '2', amount: 800, method: 'credit_card', date: '2025-08-25', status: 'completed' },
  { _id: 'p4', invoiceId: '3', amount: 450, method: 'paypal', date: '2025-09-01', status: 'completed' },
];

// Mock API responses for development
if (import.meta.env.DEV) {
  const originalGet = api.get;
  const originalPost = api.post;
  const originalPut = api.put;
  const originalDelete = api.delete;
  
  // Override methods for mock data
  api.get = async (url, ...args) => {
    if (url === '/payments') {
      return Promise.resolve({
        data: mockPayments,
      });
    }
    // Fall back to original implementation for other endpoints
    return originalGet(url, ...args);
  };
  
  // Add mock implementations for other methods if needed
  api.post = async (url, data, ...args) => {
    // Add mock implementations for POST requests if needed
    return originalPost(url, data, ...args);
  };
  
  api.put = async (url, data, ...args) => {
    // Add mock implementations for PUT requests if needed
    return originalPut(url, data, ...args);
  };
  
  api.delete = async (url, ...args) => {
    // Add mock implementations for DELETE requests if needed
    return originalDelete(url, ...args);
  };
}

export default api;
