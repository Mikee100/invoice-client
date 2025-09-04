import React, { useEffect, useState } from 'react';

// Currency formatting helper
function formatCurrency(amount, currency) {
  if (!amount) return '';
  const symbols = {
    USD: '$',
    KES: 'Ksh',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
    INR: '₹',
    ZAR: 'R'
  };
  const symbol = symbols[currency] || '$';
  return symbol + Number(amount).toLocaleString();
}
import Loader from '../components/Loader';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Invoices = () => {
  const [viewInvoice, setViewInvoice] = useState(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  // PDF and email helpers
  const handleView = (invoice) => setViewInvoice(invoice);
  const handleCloseView = () => setViewInvoice(null);
  const handleDownloadPDF = async (invoice) => {
    setPdfLoading(true);
    try {
      // Generate simple PDF (can be improved)
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      doc.text(`Invoice for ${invoice.clientName}`, 10, 10);
      doc.text(`Amount: ${formatCurrency(invoice.amount, invoice.currency)}`, 10, 20);
      doc.text(`Due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}`, 10, 30);
      doc.save(`${invoice.businessName || 'invoice'}.pdf`);
    } catch (err) {
      setError('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };
  const handleSendInvoice = async (invoice) => {
    setSending(true);
    setSuccess(null);
    setError(null);
    try {
      // Simulate sending (replace with real API call)
      await new Promise(res => setTimeout(res, 1200));
      setSuccess(`Invoice sent to ${invoice.clientEmail}`);
    } catch {
      setError('Failed to send invoice');
    } finally {
      setSending(false);
    }
  };
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
    <div className="max-w-5xl mx-auto mt-12 p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-blue-900">Invoices</h1>
        <div className="flex gap-6">
          <div className="bg-white rounded-lg shadow px-4 py-2 text-center">
            <div className="text-lg font-bold text-blue-700">{invoices.length}</div>
            <div className="text-xs text-gray-500">Total Invoices</div>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-2 text-center">
            <div className="text-lg font-bold text-green-700">{formatCurrency(invoices.reduce((sum, i) => sum + (i.amount || 0), 0), 'USD')}</div>
            <div className="text-xs text-gray-500">Total Amount</div>
          </div>
        </div>
      </div>
      {loading && <Loader />}
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
              <th className="p-3 rounded-l-lg">Project</th>
              <th className="p-3">Client</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-right">Currency</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Due Date</th>
              <th className="p-3 text-center">Info</th>
              <th className="p-3 text-center rounded-r-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => (
              <tr key={inv._id} className={`transition hover:bg-blue-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'} shadow rounded-lg`}>
                <td className="p-3 font-semibold text-blue-800">{inv.project || 'N/A'}</td>
                <td className="p-3 font-medium text-gray-700">{inv.clientName}</td>
                <td className="p-3 text-right text-green-700 font-bold">{formatCurrency(inv.amount, inv.currency)}</td>
                <td className="p-3 text-right text-gray-600">{inv.currency || 'USD'}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{inv.status}</span>
                </td>
                <td className="p-3 text-center text-gray-600">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : ''}</td>
                <td className="p-3 text-center text-gray-500 text-xs">
                  <div>{inv.clientEmail}</div>
                  <div>{inv.clientPhone}</div>
                </td>
                <td className="p-3 text-center flex flex-wrap gap-2 justify-center">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded shadow flex items-center gap-1 transition"
                    onClick={() => handleView(inv)}
                  ><span>👁️</span>View</button>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded shadow flex items-center gap-1 transition"
                    disabled={pdfLoading}
                    onClick={() => handleDownloadPDF(inv)}
                  ><span>⬇️</span>{pdfLoading ? 'Downloading...' : 'PDF'}</button>
                  <button
                    className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded shadow flex items-center gap-1 transition"
                    disabled={sending}
                    onClick={() => handleSendInvoice(inv)}
                  ><span>✉️</span>{sending ? 'Sending...' : 'Send'}</button>
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded shadow flex items-center gap-1 transition"
                    onClick={() => handleEdit(inv)}
                  ><span>✏️</span>Edit</button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded shadow flex items-center gap-1 transition"
                    onClick={() => handleDelete(inv._id)}
                  ><span>🗑️</span>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {invoices.length === 0 && !loading && <div className="text-gray-500 mt-8">No invoices found.</div>}
      {/* Modal Preview */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative border-2 border-blue-200">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl" onClick={handleCloseView}>✕</button>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Invoice Preview</h2>
            <div className="mb-2 text-lg"><b>Business:</b> <span className="text-blue-700">{viewInvoice.businessName}</span></div>
            <div className="mb-2"><b>Client:</b> {viewInvoice.clientName}</div>
            <div className="mb-2"><b>Email:</b> {viewInvoice.clientEmail}</div>
            <div className="mb-2"><b>Amount:</b> <span className="text-green-700 font-bold">{formatCurrency(viewInvoice.amount, viewInvoice.currency)}</span></div>
            <div className="mb-2"><b>Due:</b> {viewInvoice.dueDate ? new Date(viewInvoice.dueDate).toLocaleDateString() : ''}</div>
            <div className="mb-2"><b>Status:</b> <span className={`px-2 py-1 rounded text-xs font-bold ${viewInvoice.status === 'Paid' ? 'bg-green-100 text-green-700' : viewInvoice.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{viewInvoice.status}</span></div>
            <div className="mb-2"><b>Footer:</b> {viewInvoice.footer}</div>
          </div>
        </div>
      )}
      {success && <div className="mb-4 text-green-600 font-bold text-center mt-4">{success}</div>}
    </div>
  );
};

export default Invoices;
