import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

// Define user roles
const ROLES = {
  ADMIN: 'admin',
  FREELANCER: 'freelancer',
  CLIENT: 'client'
};

const AuthContext = createContext();

// Mock API service
const authService = {
  login: async (email, password) => {
    // Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock different users based on email
        let role = ROLES.FREELANCER;
        if (email.includes('@admin.')) role = ROLES.ADMIN;
        if (email.includes('@client.')) role = ROLES.CLIENT;
        
        resolve({
          user: { 
            id: '1', 
            name: email.split('@')[0], 
            email, 
            role,
            permissions: role === ROLES.ADMIN ? ['manage_templates', 'manage_users'] : []
          },
          token: 'mock-jwt-token'
        });
      }, 500);
    });
  }
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    return user?.permissions?.includes(permission) || false;
  }, [user]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        try {
          // In a real app, verify token with backend
          // const decoded = jwtDecode(savedToken);
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch (err) {
          console.error('Failed to authenticate token', err);
          logout();
        }
      }
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user: userData, token: authToken } = await authService.login(email, password);
      
      setUser(userData);
      setToken(authToken);
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', authToken);
      
      // Return the user data and let the component handle navigation
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return { success: true };
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, 
        error, 
        login, 
        logout,
        hasRole,
        hasPermission,
        ROLES
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext, AuthProvider as default, useAuth };
