import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import api from '../services/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    invoiceId: '',
    amountPaid: '',
    paymentMethod: 'bank',
    bankName: '',
    accountNumber: '',
    reference: '',
  });
  const [success, setSuccess] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
    } catch (err) {
      setError('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      setError('Failed to fetch invoices');
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
      await api.post('/payments', form);
      setSuccess('Payment recorded successfully!');
      setForm({ invoiceId: '', amountPaid: '', paymentMethod: 'bank', bankName: '', accountNumber: '', reference: '' });
      fetchPayments();
    } catch (err) {
      setError('Failed to record payment');
    }
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Payments</h1>
      <form onSubmit={handleSubmit} className="mb-8 flex gap-4 flex-wrap items-end">
        <select
          name="invoiceId"
          value={form.invoiceId}
          onChange={handleChange}
          className="border p-2 rounded flex-1 min-w-[180px]"
          required
        >
          <option value="">Select Invoice</option>
          {invoices.map(inv => (
            <option key={inv._id} value={inv._id}>{inv.clientName} - {inv.project} - ${inv.amount}</option>
          ))}
        </select>
        <input
          name="amountPaid"
          value={form.amountPaid}
          onChange={handleChange}
          placeholder="Amount Paid"
          type="number"
          className="border p-2 rounded flex-1 min-w-[120px]"
          required
        />
        <input
          name="bankName"
          value={form.bankName}
          onChange={handleChange}
          placeholder="Bank Name"
          className="border p-2 rounded flex-1 min-w-[140px]"
          required
        />
        <input
          name="accountNumber"
          value={form.accountNumber}
          onChange={handleChange}
          placeholder="Account Number"
          className="border p-2 rounded flex-1 min-w-[140px]"
          required
        />
        <input
          name="reference"
          value={form.reference}
          onChange={handleChange}
          placeholder="Reference"
          className="border p-2 rounded flex-1 min-w-[140px]"
          required
        />
        <button type="submit" className="bg-indigo-600 text-white py-2 px-6 rounded">Record Payment</button>
      </form>
      {success && <div className="mb-4 text-green-600">{success}</div>}
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Invoice</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Bank</th>
            <th className="p-3 text-left">Account</th>
            <th className="p-3 text-left">Reference</th>
            <th className="p-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment._id} className="border-b">
              <td className="p-3">{invoices.find(inv => inv._id === payment.invoiceId)?.clientName || '-'}</td>
              <td className="p-3">${payment.amountPaid}</td>
              <td className="p-3">{payment.bankName}</td>
              <td className="p-3">{payment.accountNumber}</td>
              <td className="p-3">{payment.reference}</td>
              <td className="p-3">{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {payments.length === 0 && !loading && <div className="text-gray-500 mt-4">No payments found.</div>}
    </div>
  );
};

export default Payments;
