import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../redux/userSlice';
import Loader from './Loader';

const ProtectedRoute = ({ roles = [], children }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If we don't have a user but have a token, try to fetch the current user
        if (!user && localStorage.getItem('token')) {
          await dispatch(getCurrentUser()).unwrap();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear any invalid token
        localStorage.removeItem('token');
      }
    };

    checkAuth();
  }, [dispatch, user]);

  // Show loading state while checking auth
  if (loading || (localStorage.getItem('token') && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (roles.length > 0 && (!user || !roles.includes(user.role))) {
    // If user is authenticated but doesn't have the required role, redirect to home
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If all checks pass, render the child routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
