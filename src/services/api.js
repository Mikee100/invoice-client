import axios from 'axios';
import { TOKEN_KEY } from '../config';
import { toast } from 'react-toastify';
import { store } from '../redux/store';
import { logoutUser } from '../redux/userSlice';
import { isTokenExpired, shouldRefreshToken, requestQueue } from '../utils/auth';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Check for token in response and update it if present
    const newToken = response?.headers?.['x-auth-token'] || response?.data?.token;
    if (newToken) {
      console.log('Updating token from response');
      localStorage.setItem(TOKEN_KEY, newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }
    return response;
  },
  (error) => {
    const { response, config } = error;
    const originalRequest = config;
    
    // Handle different error statuses
    if (response) {
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // If this is a retry or already attempted refresh, don't try again
          if (originalRequest._retry) {
            console.log('Already attempted refresh, logging out...');
            localStorage.removeItem(TOKEN_KEY);
            store.dispatch(logoutUser());
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login?session=expired';
            }
            return Promise.reject(error);
          }
          
          // Mark this request as having been retried
          originalRequest._retry = true;
          
          // Try to refresh the token first
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            console.log('Attempting to refresh token...');
            return api.post('/auth/refresh-token', { refreshToken })
              .then(({ data }) => {
                const { token } = data;
                if (token) {
                  console.log('Token refreshed successfully');
                  localStorage.setItem(TOKEN_KEY, token);
                  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                  originalRequest.headers['Authorization'] = `Bearer ${token}`;
                  return api(originalRequest);
                }
                throw new Error('No token in refresh response');
              })
              .catch(refreshError => {
                console.error('Failed to refresh token:', refreshError);
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem('refresh_token');
                store.dispatch(logoutUser());
                if (!window.location.pathname.includes('/login')) {
                  window.location.href = '/login?session=expired';
                }
                return Promise.reject(refreshError);
              });
          }
          
          // No refresh token, proceed with normal 401 handling
          localStorage.removeItem(TOKEN_KEY);
          store.dispatch(logoutUser());
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?session=expired';
          }
          break;
          
        case 403:
          // Handle forbidden access
          toast.error('You do not have permission to perform this action');
          break;
          
        case 404:
          // Handle not found
          toast.error('The requested resource was not found');
          break;
          
        case 422:
          // Handle validation errors
          if (data.errors) {
            const errorMessages = Object.values(data.errors).flat();
            errorMessages.forEach((msg) => toast.error(msg));
          } else {
            toast.error('Validation error occurred');
          }
          break;
          
        case 500:
          // Handle server errors
          toast.error('An unexpected error occurred. Please try again later.');
          break;
          
        default:
          // Handle other errors
          toast.error(data.message || 'An error occurred');
      }
    } else {
      // Handle network errors
      toast.error('Unable to connect to the server. Please check your internet connection.');
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
