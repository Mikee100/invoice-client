import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import api from '../services/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [success, setSuccess] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) {
      setError('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.post('/clients', form);
      setSuccess('Client added successfully!');
      setForm({ name: '', email: '', phone: '' });
      fetchClients();
    } catch (err) {
      setError('Failed to add client');
    }
  };

  const handleEdit = (client) => {
    setEditing(client);
    setForm({ name: client.name, email: client.email, phone: client.phone || '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/clients/${editing._id}`, form);
      setSuccess('Client updated successfully!');
      setEditing(null);
      setForm({ name: '', email: '', phone: '' });
      fetchClients();
    } catch (err) {
      setError('Failed to update client');
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/clients/${id}`);
      setSuccess('Client deleted successfully!');
      fetchClients();
    } catch (err) {
      setError('Failed to delete client');
    }
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <div className="max-w-4xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 flex items-center gap-2">
        <span className="inline-block bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-lg font-semibold">Clients</span>
      </h1>
      <form onSubmit={editing ? handleUpdate : handleSubmit} className="mb-10 flex gap-4 flex-wrap items-end bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Client Name"
          className="border border-gray-300 p-3 rounded-lg flex-1 min-w-[180px] focus:ring-2 focus:ring-indigo-400 transition"
          required
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Client Email"
          type="email"
          className="border border-gray-300 p-3 rounded-lg flex-1 min-w-[180px] focus:ring-2 focus:ring-indigo-400 transition"
          required
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Client Phone"
          className="border border-gray-300 p-3 rounded-lg flex-1 min-w-[140px] focus:ring-2 focus:ring-indigo-400 transition"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg font-semibold shadow transition">{editing ? 'Update Client' : 'Add Client'}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', email: '', phone: '' }); }} className="ml-2 text-gray-600 hover:text-gray-900 transition">Cancel</button>}
      </form>
      {success && <div className="mb-4 text-green-600 font-semibold bg-green-50 border border-green-200 rounded-lg p-3">{success}</div>}
      {error && <div className="mb-4 text-red-500 font-semibold bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm">
          <thead>
            <tr className="bg-indigo-50">
              <th className="p-4 text-left font-semibold text-gray-700">Name</th>
              <th className="p-4 text-left font-semibold text-gray-700">Email</th>
              <th className="p-4 text-left font-semibold text-gray-700">Phone</th>
              <th className="p-4 text-left font-semibold text-gray-700">Added</th>
              <th className="p-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client._id} className="border-b hover:bg-indigo-50 transition">
                <td className="p-4 text-gray-900 font-medium">{client.name}</td>
                <td className="p-4 text-gray-700">{client.email}</td>
                <td className="p-4 text-gray-700">{client.phone}</td>
                <td className="p-4 text-gray-500">{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : ''}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(client)} className="text-indigo-600 hover:text-indigo-900 font-semibold px-3 py-1 rounded transition bg-indigo-100">Edit</button>
                  <button onClick={() => handleDelete(client._id)} className="text-red-600 hover:text-red-900 font-semibold px-3 py-1 rounded transition bg-red-100">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {clients.length === 0 && !loading && <div className="text-gray-500 mt-6 text-center">No clients found.</div>}
    </div>
  );
};

export default Clients;
