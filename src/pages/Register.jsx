import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser, clearError, resetRegistration } from '../redux/userSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin', // Default to admin for now
    companyName: '',
    phone: ''
  });
  
  const { registration, isAuthenticated, user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(clearError());
    dispatch(resetRegistration());
    
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Redirect after successful registration
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      const redirectPath = user.role === 'admin' 
        ? '/admin/dashboard' 
        : user.role === 'freelancer' 
          ? '/freelancer/dashboard' 
          : '/dashboard';
      
      toast.success('Registration successful! Redirecting...');
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    try {
      // Dispatch the registerUser action
      const result = await dispatch(registerUser(formData));
      
      if (registerUser.rejected.match(result)) {
        // Error is already handled by the reducer
        return;
      }
      
      // If we get here, registration was successful
      // The useEffect will handle the redirect based on user role
      
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('An unexpected error occurred. Please try again.');
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
          <div className="flex items-center gap-2 mb-6">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-7 4h10a2 2 0 002-2V7a2 2 0 00-2-2h-3.5a1.5 1.5 0 01-1.5-1.5V3a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-indigo-700 tracking-tight">Create Invoice Account</h2>
          </div>
          {registration.loading && <Loader />}
          {registration.error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {registration.error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Email</label>
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
              <label className="block text-sm font-medium text-indigo-700 mb-1">Password</label>
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
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Company Name</label>
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+254 7XX XXX XXX"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <input type="hidden" name="role" value={formData.role} />
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="admin">Admin</option>
                <option value="freelancer">Freelancer</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms</a> and <a href="#" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
              </label>
            </div>
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold shadow transition disabled:opacity-70" 
              disabled={registration.loading}
            >
              {registration.loading ? <Loader size="small" /> : 'Create Account'}
            </button>
            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
          </form>
          <div className="my-6 flex items-center">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-4 text-gray-400">or</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>
          <GoogleLogin
            onSuccess={async credentialResponse => {
              try {
                // Send credential to backend for Google registration
                await fetch('http://localhost:8000/api/auth/google-register', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ credential: credentialResponse.credential }),
                });
                navigate('/login');
              } catch (err) {
                alert('Google Sign Up Failed');
              }
            }}
            onError={() => {
              alert('Google Sign Up Failed');
            }}
            width={300}
          />
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <a href="/login" className="text-indigo-600 font-medium hover:underline">Login</a>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
