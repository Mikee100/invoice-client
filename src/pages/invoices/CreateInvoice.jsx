import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import StylingPanel from '../../components/invoices/StylingPanel';
import TemplatePreview from '../../components/template/TemplatePreview';
import { saveTemplate } from '../../services/templateService';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const invoiceFormRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [customStyles, setCustomStyles] = useState({
    primaryColor: '#4F46E5',
    secondaryColor: '#6B7280',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    lineHeight: '1.5',
    padding: 20,
    margin: 10,
    borderRadius: 4,
    headerBg: '#F9FAFB',
    footerBg: '#F9FAFB'
  });

  const handleSuccess = () => {
    navigate('/invoices');
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleSaveAsTemplate = async () => {
    if (!invoiceFormRef.current) {
      toast.error('Unable to access invoice form data');
      return;
    }

    try {
      setSavingTemplate(true);

      // Get form data from InvoiceForm component
      const formData = invoiceFormRef.current.getFormData();

      // Create template data structure
      const templateData = {
        name: `Custom Invoice Template - ${new Date().toLocaleDateString()}`,
        description: 'Template created from invoice creation form',
        category: 'invoice',
        isPublic: false,
        tags: ['custom', 'invoice'],
        content: {
          business: {
            name: 'Your Company Name',
            address: '123 Business St, City, State 12345',
            email: 'info@company.com',
            phone: '+1 (555) 123-4567'
          },
          client: {
            title: 'Bill To',
            name: formData.client?.name || 'Client Name',
            email: formData.client?.email || 'client@example.com',
            address: '123 Client St, Client City, Country'
          },
          invoice: {
            title: 'INVOICE',
            numberPrefix: 'INV-',
            currency: 'USD',
            notes: 'Thank you for your business!',
            terms: 'Payment due within 30 days of issue date.'
          },
          items: {
            columns: [
              { id: 'description', label: 'Description', type: 'text', width: '40%', required: true },
              { id: 'quantity', label: 'Qty', type: 'number', width: '15%', required: true },
              { id: 'rate', label: 'Rate', type: 'currency', width: '20%', required: true },
              { id: 'amount', label: 'Amount', type: 'currency', width: '25%', calculated: true }
            ]
          },
          summary: {
            subtotal: { label: 'Subtotal', value: formData.invoice?.subtotal || 0 },
            tax: { label: 'Tax', value: formData.invoice?.tax || 0, rate: 0 },
            total: { label: 'Total', value: formData.invoice?.total || 0 }
          },
          styles: customStyles,
          additionalData: {
            items: formData.invoice?.items || []
          }
        }
      };

      await saveTemplate(templateData);
      toast.success('Template saved successfully!');

    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(error.message || 'Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
              <p className="text-gray-600 mt-1">Design and customize your invoice template</p>
            </div>
            <button
              onClick={() => navigate('/invoices')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
            >
              ← Back to Invoices
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Invoice Form - Takes up 3 columns on large screens */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Form Header */}
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Invoice Details</h2>
                    <p className="text-gray-600 mt-1">Fill in your invoice information</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handlePreview}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
                    >
                      👁️ Preview
                    </button>
                    <button
                      onClick={handleSaveAsTemplate}
                      disabled={savingTemplate}
                      className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                    >
                      {savingTemplate ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>💾</span>
                          <span>Save as Template</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <InvoiceForm
                  ref={invoiceFormRef}
                  onSuccess={handleSuccess}
                  isEdit={false}
                  customStyles={customStyles}
                />
              </div>
            </div>
          </div>

          {/* Styling Panel - Takes up 1 column on large screens */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <StylingPanel styles={customStyles} onStyleChange={setCustomStyles} />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Invoice Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <TemplatePreview
                template={{
                  content: {
                    header: {
                      title: 'INVOICE',
                      companyName: 'Your Company Name',
                      companyAddress: '123 Business St, City, State 12345',
                      companyEmail: 'info@company.com',
                      companyPhone: '+1 (555) 123-4567',
                      invoiceNumber: 'INV-0001',
                      date: new Date().toLocaleDateString(),
                      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                    },
                    client: {
                      title: 'Bill To',
                      name: 'Client Name',
                      email: 'client@example.com',
                      phone: '+1 (555) 000-0000',
                      address: '123 Client St, Client City, Country'
                    },
                    items: {
                      columns: [
                        { header: 'Description', width: 40 },
                        { header: 'Qty', width: 15 },
                        { header: 'Rate', width: 20 },
                        { header: 'Amount', width: 25 }
                      ],
                      data: [
                        { description: 'Web Development', quantity: 1, rate: 100, amount: 100 },
                        { description: 'UI/UX Design', quantity: 1, rate: 80, amount: 80 }
                      ]
                    },
                    summary: {
                      subtotal: 180,
                      tax: { name: 'Tax', rate: 10, amount: 18 },
                      total: 198,
                      currency: 'USD'
                    },
                    styles: customStyles
                  },
                  footer: {
                    text: 'Thank you for your business!',
                    terms: 'Payment is due within 30 days. Late payments may incur additional fees.'
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInvoice;
