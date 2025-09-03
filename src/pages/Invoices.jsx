import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await api.get('/invoices');
        setInvoices(res.data);
      } catch (err) {
        setError('Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleEdit = (invoice) => {
    navigate('/create-invoice', { state: { invoice } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    setLoading(true);
    try {
      await api.delete(`/invoices/${id}`);
      setInvoices(invoices.filter(inv => inv._id !== id));
    } catch {
      setError('Failed to delete invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 p-8 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>
      {loading && <div className="mb-4">Loading...</div>}
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Project</th>
            <th className="p-3 text-left">Client</th>
            <th className="p-3 text-right">Amount</th>
            <th className="p-3 text-center">Status</th>
            <th className="p-3 text-center">Due Date</th>
            <th className="p-3 text-center">Info</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv._id} className="border-b">
              <td className="p-3">{inv.project || 'N/A'}</td>
              <td className="p-3">{inv.clientName}</td>
              <td className="p-3 text-right">${inv.amount}</td>
              <td className="p-3 text-center">{inv.status}</td>
              <td className="p-3 text-center">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : ''}</td>
              <td className="p-3 text-center text-gray-500 text-sm">
                {inv.clientEmail}<br />
                {inv.clientPhone}
              </td>
              <td className="p-3 text-center">
                <button
                  className="bg-indigo-600 text-white px-3 py-1 rounded mr-2"
                  onClick={() => handleEdit(inv)}
                >Edit</button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(inv._id)}
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {invoices.length === 0 && !loading && <div className="text-gray-500">No invoices found.</div>}
    </div>
  );
};

export default Invoices;
