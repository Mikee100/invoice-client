import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { loginUser, clearError, getCurrentUser } from '../redux/userSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check for expired session
  useEffect(() => {
    if (searchParams.get('session') === 'expired') {
      toast.info('Your session has expired. Please log in again.');
      // Clean up the URL
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, role:', user.role);
      let redirectPath = '/';
      
      if (user.role === 'admin') {
        redirectPath = '/admin/dashboard';
      } else if (user.role === 'freelancer') {
        redirectPath = '/freelancer/dashboard';
      }
      
      console.log('Redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  
  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(clearError());
    
    // Clean up any old tokens that might be causing issues
    const oldToken = localStorage.getItem('token');
    const currentToken = localStorage.getItem('invoice_management_token');
    
    if (oldToken) {
      console.log('Cleaning up old token');
      localStorage.removeItem('token');
    }
    
    // If we have a token but no user, try to get the user
    if (currentToken && !user) {
      console.log('Found token, fetching user...');
      dispatch(getCurrentUser())
        .unwrap()
        .catch(err => {
          console.error('Error fetching user:', err);
          // Clear invalid token
          localStorage.removeItem('invoice_management_token');
          delete api.defaults.headers.common['Authorization'];
        });
    }
    
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any existing errors
    dispatch(clearError());
    
    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    console.log('Attempting login with email:', formData.email);
    
    try {
      const result = await dispatch(loginUser({
        email: formData.email,
        password: formData.password
      })).unwrap();
      
      console.log('Login successful, user:', result);
      
      // The useEffect will handle the redirection based on user role
      
    } catch (err) {
      console.error('Login failed:', err);
      toast.error(err || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <GoogleOAuthProvider clientId="933855646195-52mnjc4vblvvj54uvgl2v2bostedihg4.apps.googleusercontent.com">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none flex justify-center items-center">
          <svg width="180" height="180" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-indigo-300">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-7 4h10a2 2 0 002-2V7a2 2 0 00-2-2h-3.5a1.5 1.5 0 01-1.5-1.5V3a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl relative z-10">
          {loading && <Loader />}
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="flex items-center gap-2">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-7 4h10a2 2 0 002-2V7a2 2 0 00-2-2h-3.5a1.5 1.5 0 01-1.5-1.5V3a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z" />
              </svg>
              <h2 className="text-2xl font-bold text-indigo-700 tracking-tight">Invoice Portal</h2>
            </div>
            <p className="text-gray-600">Sign in to your account</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold shadow transition disabled:opacity-70" 
              disabled={loading}
            >
              {loading ? <Loader size="small" /> : 'Sign In'}
            </button>
          </form>
          <div className="my-6 flex items-center">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-4 text-gray-400">or</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  // Send credential to backend for Google login
                  const response = await api.post('/auth/google-login', {
                    credential: credentialResponse.credential
                  });
                  
                  const { token, user } = response.data;
                  
                  // Set the token in axios headers and localStorage
                  setAuthToken(token);
                  
                  // Update the Redux store
                  dispatch(loginUser.fulfilled({ user }));
                  
                  toast.success('Google login successful!');
                  
                  // Redirect based on user role
                  const redirectPath = user.role === 'admin' 
                    ? '/admin/dashboard' 
                    : user.role === 'freelancer' 
                      ? '/freelancer/dashboard' 
                      : '/dashboard';
                  
                  navigate(redirectPath);
                } catch (err) {
                  console.error('Google login error:', err);
                  toast.error(
                    err.response?.data?.message || 
                    'Google login failed. Please try again.'
                  );
                }
              }}
              onError={() => {
                toast.error('Google login failed. Please try again.');
              }}
              useOneTap={false}
              text="continue_with"
              shape="rectangular"
              size="large"
              width="100%"
              theme="outline"
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </p>
            <p className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
