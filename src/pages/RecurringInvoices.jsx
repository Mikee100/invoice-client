import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getRecurringInvoices, pauseRecurringInvoice, resumeRecurringInvoice, deleteRecurringInvoice } from '../services/recurringInvoiceService';

const RecurringInvoices = () => {
  const [recurringInvoices, setRecurringInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadRecurringInvoices();
  }, [currentPage, searchTerm]);

  const loadRecurringInvoices = async () => {
    try {
      setLoading(true);
      const response = await getRecurringInvoices({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      setRecurringInvoices(response.recurringInvoices);
      setTotalPages(response.pages);
    } catch (error) {
      toast.error('Failed to load recurring invoices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id) => {
    try {
      await pauseRecurringInvoice(id);
      toast.success('Recurring invoice paused');
      loadRecurringInvoices();
    } catch (error) {
      toast.error('Failed to pause recurring invoice');
    }
  };

  const handleResume = async (id) => {
    try {
      await resumeRecurringInvoice(id);
      toast.success('Recurring invoice resumed');
      loadRecurringInvoices();
    } catch (error) {
      toast.error('Failed to resume recurring invoice');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recurring invoice?')) return;
    try {
      await deleteRecurringInvoice(id);
      toast.success('Recurring invoice deleted');
      loadRecurringInvoices();
    } catch (error) {
      toast.error('Failed to delete recurring invoice');
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {isActive ? 'Active' : 'Paused'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Recurring Invoices</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your recurring billing schedules
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => window.location.href = '/create-invoice'}
          >
            Create Recurring Invoice
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search recurring invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {recurringInvoices.map((recurring) => (
              <li key={recurring._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {recurring.clientName}
                        </p>
                        {getStatusBadge(recurring.isActive)}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {recurring.clientEmail}
                      </p>
                      <p className="text-sm text-gray-500">
                        {recurring.currency} {recurring.amount.toFixed(2)} - {recurring.frequency}
                      </p>
                      <p className="text-sm text-gray-500">
                        Next due: {new Date(recurring.nextDueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {recurring.isActive ? (
                        <button
                          onClick={() => handlePause(recurring._id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => handleResume(recurring._id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Resume
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(recurring._id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringInvoices;
