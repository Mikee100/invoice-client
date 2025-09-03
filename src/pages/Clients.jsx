import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [success, setSuccess] = useState(null);

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

  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Clients</h1>
      <form onSubmit={handleSubmit} className="mb-8 flex gap-4 flex-wrap items-end">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Client Name"
          className="border p-2 rounded flex-1 min-w-[180px]"
          required
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Client Email"
          type="email"
          className="border p-2 rounded flex-1 min-w-[180px]"
          required
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Client Phone"
          className="border p-2 rounded flex-1 min-w-[140px]"
        />
        <button type="submit" className="bg-indigo-600 text-white py-2 px-6 rounded">Add Client</button>
      </form>
      {success && <div className="mb-4 text-green-600">{success}</div>}
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">Added</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client._id} className="border-b">
              <td className="p-3">{client.name}</td>
              <td className="p-3">{client.email}</td>
              <td className="p-3">{client.phone}</td>
              <td className="p-3">{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {clients.length === 0 && !loading && <div className="text-gray-500 mt-4">No clients found.</div>}
    </div>
  );
};

export default Clients;
