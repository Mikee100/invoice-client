import { useEffect } from 'react';
import { useSelector } from 'react-router-dom';

export const AuthDebugger = () => {
  const { user, isAuthenticated, loading, error } = useSelector((state) => ({
    user: state.user.user,
    isAuthenticated: state.user.isAuthenticated,
    loading: state.user.loading,
    error: state.user.error
  }));

  useEffect(() => {
    console.group('Auth State Changed');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('Loading:', loading);
    console.log('User:', user);
    console.log('Error:', error);
    console.log('Token in localStorage:', localStorage.getItem('invoice_management_token') ? 'exists' : 'not found');
    console.groupEnd();
  }, [isAuthenticated, loading, user, error]);

  return null; // This component doesn't render anything
};

export default AuthDebugger;
