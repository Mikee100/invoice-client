import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiEdit2, FiSave, FiLock, FiTrash2, FiUpload, FiUser, FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';

const Profile = () => {
  const user = useSelector(state => state.user.user);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [role] = useState(user?.role || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [photo, setPhoto] = useState(user?.photo || null);
  const [lastLogin] = useState(user?.lastLogin || new Date().toLocaleString());
  const [invoicesCreated] = useState(user?.invoicesCreated || 0);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Calculate member since duration
  const getMemberSince = (dateString) => {
    if (!dateString) return 'N/A';
    const joinDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    } else if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      if (fileInputRef.current?.files[0]) {
        formDataToSend.append('photo', fileInputRef.current.files[0]);
      }
      
      await api.put('/auth/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess(true);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 5000);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setPhoto(user?.photo || null);
    setEditing(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Profile Settings</h2>
              <p className="mt-1 text-sm text-gray-500">Manage your account information and settings</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiEdit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleUpdate} className="divide-y divide-gray-200">
            {/* Photo Section */}
            <div className="px-6 py-6 space-y-6 sm:px-8">
              <div className="flex items-center">
                <div className="relative group">
                  <img
                    className="h-24 w-24 rounded-full object-cover"
                    src={photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.name) + '&background=4f46e5&color=fff'}
                    alt="Profile"
                  />
                  {editing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer p-2 rounded-full bg-white bg-opacity-80">
                        <FiUpload className="h-5 w-5 text-gray-700" />
                        <input
                          type="file"
                          ref={fileInputRef}
                          name="photo"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium text-gray-900">{formData.name || 'User'}</h3>
                  <p className="text-sm text-gray-500">{role}</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="px-6 py-6 space-y-6 sm:px-8">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
              
              {/* Success/Error Messages */}
              {message && (
                <div className="rounded-md bg-green-50 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{message}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6 md:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full name
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className={`h-5 w-5 ${editing ? 'text-indigo-500' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`${editing ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white' : 'border-gray-200 bg-gray-50'} block w-full pl-10 pr-3 py-2.5 text-sm rounded-md border`}
                      disabled={!editing}
                      placeholder="John Doe"
                    />
                  </div>
                  {editing && (
                    <p className="mt-1 text-xs text-gray-500">
                      Your full name as it should appear on invoices
                    </p>
                  )}
                </div>

                <div className="sm:col-span-6 md:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className={`h-5 w-5 ${editing ? 'text-indigo-500' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${editing ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white' : 'border-gray-200 bg-gray-50'} block w-full pl-10 pr-3 py-2.5 text-sm rounded-md border`}
                      disabled={!editing}
                      placeholder="you@example.com"
                    />
                  </div>
                  {editing && (
                    <p className="mt-1 text-xs text-gray-500">
                      Your primary email address
                    </p>
                  )}
                </div>

                <div className="sm:col-span-6 md:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone number
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className={`h-5 w-5 ${editing ? 'text-indigo-500' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`${editing ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white' : 'border-gray-200 bg-gray-50'} block w-full pl-10 pr-3 py-2.5 text-sm rounded-md border`}
                      disabled={!editing}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  {editing && (
                    <p className="mt-1 text-xs text-gray-500">
                      Include country code
                    </p>
                  )}
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Address
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute top-3 left-3">
                      <FiMapPin className={`h-5 w-5 ${editing ? 'text-indigo-500' : 'text-gray-400'}`} />
                    </div>
                    <textarea
                      name="address"
                      id="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className={`${editing ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white' : 'border-gray-200 bg-gray-50'} block w-full pl-10 pr-3 py-2.5 text-sm rounded-md border`}
                      disabled={!editing}
                      placeholder="123 Main St, Apt 4B\nCity, State ZIP\nCountry"
                    />
                  </div>
                  {editing && (
                    <p className="mt-1 text-xs text-gray-500">
                      Your complete billing address for invoices
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="px-6 py-6 space-y-6 sm:px-8">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Account Information</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">{role}</dd>
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="flex items-center">
                        <FiClock className="h-4 w-4 text-gray-400 mr-1.5" />
                        {user?.createdAt ? (
                          <span>
                            {formatDate(user.createdAt)}
                            <span className="block text-xs text-gray-500 mt-1">
                              ({getMemberSince(user.createdAt)})
                            </span>
                          </span>
                        ) : 'N/A'}
                      </div>
                    </dd>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Invoices Created
                  </label>
                  <div className="mt-1">
                    <div className="bg-gray-100 px-3 py-2 rounded-md text-sm text-gray-900">
                      {invoicesCreated}
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Last Login
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formatDate(lastLogin)}
                      disabled
                      className="bg-gray-100 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 text-right sm:px-8 flex justify-between">
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiLock className="mr-2 h-4 w-4" />
                  Change Password
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </button>
              </div>
              
              {editing && (
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" color="white" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
