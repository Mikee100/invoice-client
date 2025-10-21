import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../services/api';
import { sessionManager, requestQueue } from '../utils/auth';

export const TOKEN_KEY = 'invoice_management_token';

// Helper to store auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Thunk to get current user from /auth/me
export const getCurrentUser = createAsyncThunk('user/getCurrentUser', async (_, { rejectWithValue }) => {
  return requestQueue.add(async () => {
    try {
      console.log('getCurrentUser called');
      const token = localStorage.getItem(TOKEN_KEY);
      console.log('Token from localStorage:', token ? 'exists' : 'not found');

      if (!token) {
        console.log('No token found, rejecting');
        return rejectWithValue('No token found');
      }

      // Set the token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Making API call to /auth/me');

      const response = await api.get('/auth/me');

      if (!response.data.user) {
        console.error('No user data in response');
        setAuthToken(null);
        return rejectWithValue('No user data received');
      }

      console.log('User data received:', response.data.user);

      // Start session heartbeat after successful auth
      sessionManager.startHeartbeat(() => api.get('/auth/me'));

      return response.data.user;

    } catch (err) {
      console.error('Error in getCurrentUser:', {
        message: err.message,
        response: {
          status: err.response?.status,
          data: err.response?.data
        }
      });

      // Stop heartbeat on auth failure
      sessionManager.stopHeartbeat();

      // Clear invalid token
      setAuthToken(null);

      if (err.response?.status === 401) {
        return rejectWithValue('Session expired. Please log in again.');
      }

      return rejectWithValue(
        err.response?.data?.message ||
        'Failed to fetch user data. Please try again.'
      );
    }
  });
});

// User registration
export const registerUser = createAsyncThunk(
  'user/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      setAuthToken(token);
      return user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Registration failed. Please try again.'
      );
    }
  }
);

// User login
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      console.log('Login attempt with credentials:', { email: credentials.email });
      
      // Clear any existing tokens to ensure a clean state
      localStorage.removeItem(TOKEN_KEY);
      delete api.defaults.headers.common['Authorization'];
      
      console.log('Making login request to /auth/login');
      
      const response = await api.post('/auth/login', credentials);
      
      console.log('Login response:', response.data);
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Login failed');
      }
      
      const { token, user: userData } = response.data;
      
      if (!token) {
        console.error('No token received in login response');
        return rejectWithValue('No authentication token received from server');
      }
      
      console.log('Login successful, storing token');
      setAuthToken(token);
      
      if (!userData) {
        console.error('No user data in login response');
        return rejectWithValue('No user data received from server');
      }
      
      console.log('Login successful, user data:', userData);
      return userData;
      
    } catch (err) {
      console.error('Login error:', err);
      setAuthToken(null);
      return rejectWithValue(
        err.response?.data?.message || 
        err.message || 
        'Login failed. Please try again.'
      );
    }
  }
);

// User logout
export const logoutUser = createAsyncThunk('user/logout', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem(TOKEN_KEY);
  
  try {
    // Try to call the logout endpoint if we have a token
    if (token) {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api'}/auth/logout`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
    }
  } catch (err) {
    // Even if logout fails on the server, we want to clear the local state
    console.error('Logout error:', err);
  } finally {
    // Always clear all auth-related data
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    
    // Clear any auth cookies by making a request with credentials
    try {
      await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api'}/auth/logout`,
        { withCredentials: true }
      );
    } catch (e) {
      console.log('Additional logout cleanup completed');
    }
  }
});

const token = localStorage.getItem(TOKEN_KEY);
const initialState = {
  user: null,
  loading: !!token, // Set loading to true if we have a token
  error: null,
  isAuthenticated: false,
  registration: {
    loading: false,
    success: false,
    error: null
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.registration.error = null;
    },
    resetRegistration: (state) => {
      state.registration = { ...initialState.registration };
    }
  },
  extraReducers: (builder) => {
    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login User
      .addCase(loginUser.pending, (state) => {
        console.log('Login pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('Login fulfilled with payload:', action.payload);
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        console.log('Login successful - User authenticated:', state.user);
        console.log('isAuthenticated set to:', state.isAuthenticated);
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.error('Login rejected with error:', action.payload);
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload || 'Login failed';
        console.log('isAuthenticated set to:', state.isAuthenticated);
        // Clear any invalid token on login failure
        setAuthToken(null);
      })
      
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.registration.loading = true;
        state.registration.error = null;
        state.registration.success = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.registration.loading = false;
        state.registration.success = true;
        state.registration.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registration.loading = false;
        state.registration.error = action.payload || 'Registration failed';
        state.registration.success = false;
      })
      
      // Logout User
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        // Stop session heartbeat
        sessionManager.stopHeartbeat();
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails on the server, clear the local state
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        // Stop session heartbeat
        sessionManager.stopHeartbeat();
      });
  },
});

// Export actions
export const { clearError, resetRegistration } = userSlice.actions;

export default userSlice.reducer;
