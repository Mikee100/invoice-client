import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiDownload, FiSend, FiPrinter } from 'react-icons/fi';
import api from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Format currency helper
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

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/invoices/${id}`);
        setInvoice(res.data);
      } catch (err) {
        toast.error('Failed to fetch invoice');
        navigate('/invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/invoices/${id}`);
        toast.success('Invoice deleted successfully');
        navigate('/invoices');
      } catch (err) {
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handleSendInvoice = async () => {
    setSending(true);
    try {
      // Simulate sending (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Invoice sent to ${invoice.clientEmail}`);
    } catch (err) {
      toast.error('Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const input = document.getElementById('invoice-preview');
      if (!input) throw new Error('Invoice preview not found');
      
      const canvas = await html2canvas(input, {
        scale: 2,
        backgroundColor: '#fff',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40; // Add margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add white background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Add the image
      pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`invoice-${invoice._id}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!invoice) {
    return <div className="p-8 text-center">Invoice not found</div>;
  }

  const total = invoice.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link 
            to="/invoices" 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back to invoices"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice #{invoice.invoiceNumber || invoice._id.substring(0, 8)}</h1>
            <p className="text-sm text-gray-500">
              Created on {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            invoice.status === 'Paid' 
              ? 'bg-green-100 text-green-800' 
              : invoice.status === 'Overdue' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-yellow-100 text-yellow-800'
          }`}>
            {invoice.status || 'Draft'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-gray-200">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiDownload className="mr-2 h-4 w-4" />
          {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
        
        <button
          onClick={handleSendInvoice}
          disabled={sending}
          className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSend className="mr-2 h-4 w-4" />
          {sending ? 'Sending...' : 'Send to Client'}
        </button>
        
        <Link
          to={`/invoices/edit/${invoice._id}`}
          className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiEdit className="mr-2 h-4 w-4" />
          Edit
        </Link>
        
        <button
          onClick={handleDelete}
          className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <FiTrash2 className="mr-2 h-4 w-4" />
          Delete
        </button>
        
        <button
          onClick={() => window.print()}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FiPrinter className="mr-2 h-4 w-4" />
          Print
        </button>
      </div>

      {/* Invoice Preview */}
      <div id="invoice-preview" className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            {invoice.businessLogo && (
              <img 
                src={invoice.businessLogo} 
                alt={invoice.businessName || 'Business Logo'} 
                className="h-12 mb-4"
              />
            )}
            <h2 className="text-2xl font-bold text-gray-900">{invoice.businessName || 'Your Business Name'}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {invoice.businessAddress || 'Business Address'}
            </p>
          </div>
          
          <div className="mt-6 md:mt-0 text-right">
            <h1 className="text-2xl font-bold text-indigo-600">INVOICE</h1>
            <div className="mt-2 text-sm text-gray-500">
              <p>#{invoice.invoiceNumber || invoice._id.substring(0, 8).toUpperCase()}</p>
              <p>Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
              {invoice.dueDate && (
                <p className="mt-1 font-medium">
                  Due: {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Client & Business Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
            <p className="font-medium text-gray-900">{invoice.clientName}</p>
            <p className="text-gray-600">{invoice.clientEmail}</p>
            {invoice.clientPhone && (
              <p className="text-gray-600">{invoice.clientPhone}</p>
            )}
            {invoice.clientAddress && (
              <p className="text-gray-600 mt-1">{invoice.clientAddress}</p>
            )}
          </div>
          
          <div className="md:text-right">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Business</h3>
            <p className="font-medium text-gray-900">{invoice.businessName || 'Your Business Name'}</p>
            <p className="text-gray-600">{invoice.businessEmail || 'your@email.com'}</p>
            <p className="text-gray-600">{invoice.businessPhone || '+1 (555) 123-4567'}</p>
            {invoice.businessAddress && (
              <p className="text-gray-600 mt-1">{invoice.businessAddress}</p>
            )}
          </div>
        </div>
        
        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items?.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.description || 'Item description'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.quantity || 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(item.price, invoice.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {formatCurrency((item.quantity || 1) * item.price, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Totals */}
        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-xs">
            <div className="flex justify-between py-2 text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(total, invoice.currency)}</span>
            </div>
            
            {invoice.taxRate && invoice.taxRate > 0 && (
              <div className="flex justify-between py-2 text-sm text-gray-600">
                <span>Tax ({invoice.taxRate}%):</span>
                <span>{formatCurrency((total * invoice.taxRate) / 100, invoice.currency)}</span>
              </div>
            )}
            
            {invoice.discount && invoice.discount > 0 && (
              <div className="flex justify-between py-2 text-sm text-gray-600">
                <span>Discount:</span>
                <span className="text-red-600">-{formatCurrency(invoice.discount, invoice.currency)}</span>
              </div>
            )}
            
            <div className="flex justify-between pt-4 mt-4 border-t border-gray-200 text-base font-medium text-gray-900">
              <span>Total:</span>
              <span className="text-xl">
                {formatCurrency(
                  total + 
                  (invoice.taxRate ? (total * invoice.taxRate) / 100 : 0) - 
                  (invoice.discount || 0),
                  invoice.currency
                )}
              </span>
            </div>
            
            {invoice.paymentMethod === 'bank' && invoice.bankDetails && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Bank Transfer Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <span>Bank:</span>
                  <span className="text-right font-medium">{invoice.bankDetails.bankName}</span>
                  
                  <span>Account Name:</span>
                  <span className="text-right font-medium">{invoice.bankDetails.accountName}</span>
                  
                  <span>Account Number:</span>
                  <span className="text-right font-medium">{invoice.bankDetails.accountNumber}</span>
                  
                  {invoice.bankDetails.swiftCode && (
                    <>
                      <span>SWIFT Code:</span>
                      <span className="text-right font-medium">{invoice.bankDetails.swiftCode}</span>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {invoice.paymentMethod === 'mpesa' && invoice.mpesaDetails && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  M-Pesa Payment
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Pay via M-Pesa to the number below:
                </p>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Paybill:</span>
                    <span className="font-mono">123456</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-medium">Account:</span>
                    <span className="font-mono">INV-{invoice._id.substring(0, 6).toUpperCase()}</span>
                  </div>
                  <div className="mt-3 text-xs text-indigo-700">
                    Use your phone number as the account number if prompted
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Notes */}
        {invoice.notes && (
          <div className="mt-12 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Notes
            </h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {invoice.notes}
            </p>
          </div>
        )}
        
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Thank you for your business!</p>
          {invoice.footer && (
            <p className="mt-1">{invoice.footer}</p>
          )}
          <p className="mt-2">
            If you have any questions about this invoice, please contact us at {invoice.businessEmail || 'your@email.com'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
