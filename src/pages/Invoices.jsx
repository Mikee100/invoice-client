import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiSend, FiDownload, FiMoreVertical } from 'react-icons/fi';
import Loader from '../components/Loader';
import api from '../services/api';
import { toast } from 'react-toastify';

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

const Invoices = () => {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Handle sending invoice
  const handleSendInvoice = async (invoice) => {
    setSending(invoice._id);
    setSuccess(null);
    setError(null);
    try {
      // Simulate sending (replace with real API call)
      await new Promise(res => setTimeout(res, 1200));
      setSuccess(`Invoice sent to ${invoice.clientEmail}`);
      toast.success(`Invoice sent to ${invoice.clientEmail}`);
    } catch (err) {
      setError('Failed to send invoice');
      toast.error('Failed to send invoice');
    } finally {
      setSending(false);
    }
  };
  
  // Handle quick download
  const handleQuickDownload = async (invoice) => {
    setActionLoading(`download-${invoice._id}`);
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      doc.text(`Invoice for ${invoice.clientName}`, 10, 10);
      doc.text(`Amount: ${formatCurrency(invoice.amount, invoice.currency)}`, 10, 20);
      doc.text(`Due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}`, 10, 30);
      doc.save(`invoice-${invoice._id}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      setActionLoading(null);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all your invoices in one place
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/create-invoice"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{invoices.length}</div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Paid</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {invoices.filter(i => i.status === 'Paid').length}
                  </div>
                  <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    {invoices.length > 0 ? Math.round((invoices.filter(i => i.status === 'Paid').length / invoices.length) * 100) : 0}%
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {invoices.filter(i => i.status === 'Pending').length}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {invoices.filter(i => i.status === 'Overdue').length}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="p-8">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new invoice.
            </p>
            <div className="mt-6">
              <Link
                to="/create-invoice"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                New Invoice
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{invoice.clientName}</div>
                          <div className="text-sm text-gray-500">{invoice.clientEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.project || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </div>
                      <div className="text-xs text-gray-500">{invoice.currency || 'USD'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : invoice.status === 'Overdue' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status || 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/invoices/${invoice._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Invoice"
                        >
                          <FiEye className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleQuickDownload(invoice)}
                          disabled={actionLoading === `download-${invoice._id}`}
                          className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          title="Download PDF"
                        >
                          {actionLoading === `download-${invoice._id}` ? (
                            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <FiDownload className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSendInvoice(invoice)}
                          disabled={sending === invoice._id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title="Send Invoice"
                        >
                          {sending === invoice._id ? (
                            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <FiSend className="h-5 w-5" />
                          )}
                        </button>
                        <div className="relative inline-block text-left group" x-data="{ open: false }">
                          <div>
                            <button 
                              type="button" 
                              className="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Toggle dropdown
                                const dropdown = e.currentTarget.nextElementSibling;
                                const isHidden = dropdown.classList.contains('hidden');
                                document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.add('hidden'));
                                if (isHidden) dropdown.classList.remove('hidden');
                              }}
                            >
                              <span className="sr-only">Open options</span>
                              <FiMoreVertical className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="hidden dropdown-menu origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            <div className="py-1">
                              <Link
                                to={`/invoices/edit/${invoice._id}`}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FiEdit2 className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(invoice._id);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                              >
                                <FiTrash2 className="mr-2 h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Success message */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
    </div>
  );
};

export default Invoices;
