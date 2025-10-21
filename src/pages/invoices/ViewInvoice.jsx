import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getInvoiceById, deleteInvoice } from "../../services/invoiceService";

const ViewInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const data = await getInvoiceById(id);
        setInvoice(data);
      } catch (error) {
        console.error('Error loading invoice:', error);
        toast.error('Failed to load invoice');
        navigate('/invoices');
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        setDeleting(true);
        await deleteInvoice(id);
        toast.success('Invoice deleted successfully');
        navigate('/invoices');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast.error('Failed to delete invoice');
      } finally {
        setDeleting(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="text-center py-8">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="text-center py-8">Invoice not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoice #{invoice.invoiceData?.number}</h1>
          <p className="text-sm text-gray-500">
            Created on {formatDate(invoice.invoiceData?.date)}
          </p>
          {invoice.templateId && (
            <p className="text-sm text-blue-600">
              Template: {invoice.templateId.name}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/invoices/${id}/edit`}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <Link
            to="/invoices"
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Back to List
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6" style={invoice.templateId?.styles || {}}>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">From</h3>
              <p className="mt-2">
                {invoice.invoiceData?.business?.name || 'Your Business Name'}<br />
                {invoice.invoiceData?.business?.address}<br />
                {invoice.invoiceData?.business?.city}, {invoice.invoiceData?.business?.state} {invoice.invoiceData?.business?.zip}<br />
                {invoice.invoiceData?.business?.country}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Bill To</h3>
              <p className="mt-2">
                {invoice.clientName}<br />
                {invoice.clientEmail}
              </p>
            </div>
            <div className="text-right">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Invoice #</h3>
                <p>{invoice.invoiceData?.number}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Date</h3>
                <p>{formatDate(invoice.invoiceData?.date)}</p>
              </div>
              {invoice.dueDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Due Date</h3>
                  <p>{formatDate(invoice.dueDate)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.invoiceData?.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      ${parseFloat(item.rate).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {item.tax}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      ${(item.quantity * item.rate * (1 + item.tax / 100)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="text-right px-6 py-3 text-sm font-medium text-gray-900">
                    Subtotal:
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    ${invoice.invoiceData?.subtotal?.toFixed(2) || '0.00'}
                  </td>
                </tr>
                {invoice.invoiceData?.tax > 0 && (
                  <tr>
                    <td colSpan="4" className="text-right px-6 py-1 text-sm text-gray-500">
                      Tax ({invoice.invoiceData.tax}%):
                    </td>
                    <td className="px-6 py-1 text-right text-sm text-gray-500">
                      ${((invoice.invoiceData.subtotal * invoice.invoiceData.tax) / 100).toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan="4" className="text-right px-6 py-3 text-lg font-bold text-gray-900 border-t border-gray-200">
                    Total:
                  </td>
                  <td className="px-6 py-3 text-right text-lg font-bold text-gray-900 border-t border-gray-200">
                    ${invoice.invoiceData?.total?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {(invoice.invoiceData?.notes || invoice.invoiceData?.terms) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {invoice.invoiceData?.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Notes</h3>
                    <p className="text-sm text-gray-500 whitespace-pre-line">{invoice.invoiceData.notes}</p>
                  </div>
                )}
                {invoice.invoiceData?.terms && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Terms & Conditions</h3>
                    <p className="text-sm text-gray-500 whitespace-pre-line">{invoice.invoiceData.terms}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewInvoice;
