

import React, { useState } from 'react';
import Loader from '../components/Loader';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';


const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('freelancer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/register', { name, email, password, role });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    navigate('/login');
    return null;
  }

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
          {loading && <Loader />}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Name</label>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full border border-indigo-200 focus:border-indigo-500 p-3 rounded-lg focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-indigo-200 focus:border-indigo-500 p-3 rounded-lg focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-indigo-200 focus:border-indigo-500 p-3 rounded-lg focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-700 mb-1">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full border border-indigo-200 focus:border-indigo-500 p-3 rounded-lg focus:outline-none transition"
              >
                <option value="freelancer">Freelancer</option>
                <option value="business">Business</option>
              </select>
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold shadow transition" disabled={loading}>
              {loading ? <Loader /> : 'Sign Up'}
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
