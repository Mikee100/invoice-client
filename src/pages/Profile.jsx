
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

const Profile = () => {
  const user = useSelector(state => state.user.user);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role] = useState(user?.role || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.put('/auth/profile', { name, email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-16 p-8 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">Profile</h1>
      <form onSubmit={handleUpdate} className="flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          className="border p-2 rounded"
          required
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          value={role}
          disabled
          className="border p-2 rounded bg-gray-100"
        />
        <button type="submit" className="bg-indigo-600 text-white py-2 rounded" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
        {success && <p className="text-green-600">Profile updated!</p>}
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default Profile;
