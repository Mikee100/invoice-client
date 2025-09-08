

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Helper to store auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Thunk to get current user from /auth/me
export const getCurrentUser = createAsyncThunk('user/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      const response = await api.get('/auth/me');
      return response.data.user;
    }
    return rejectWithValue('No token found');
  } catch (err) {
    setAuthToken(null);
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
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
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      setAuthToken(token);
      return user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 
        'Invalid email or password. Please try again.'
      );
    }
  }
);

// User logout
export const logoutUser = createAsyncThunk('user/logout', async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    setAuthToken(null);
  }
});

const initialState = {
  user: null,
  loading: false,
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
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
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
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registration.loading = false;
        state.registration.error = action.payload || 'Registration failed';
        state.registration.success = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails on the server, clear the local state
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

// Export actions
export const { clearError, resetRegistration } = userSlice.actions;

export default userSlice.reducer;
