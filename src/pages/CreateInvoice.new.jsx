import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiTrash2, FiSend, FiDownload, FiEdit2, FiSave, FiLayers } from 'react-icons/fi';
import Spinner from '../components/ui/Spinner';
import { useSelector } from 'react-redux';
import api from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import TemplateSelector from '../components/TemplateSelector';

const CreateInvoice = () => {
  const [mpesaLinkPreview, setMpesaLinkPreview] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    project: '',
    businessName: '',
    businessLogo: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, price: 0 }],
    currency: 'USD',
    footer: '',
    paymentMethod: 'mpesa',
    bankName: '',
    accountName: '',
    accountNumber: '',
    reference: '',
    template: 'classic', // Added template field
  });
  
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sending, setSending] = useState(false);
  const [editId, setEditId] = useState(null);
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const user = useSelector(state => state.user.user);

  // ... (keep all your existing functions as they are)

  // Add this function to handle template selection
  const handleTemplateSelect = (template) => {
    setForm(prev => ({ ...prev, template: template.id }));
    setShowTemplateSelector(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form Section */}
        <div className="flex-1 min-w-0">
          <div id="invoice-form" className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editId ? 'Edit Invoice' : 'Create Invoice'}
              </h2>
              <button
                type="button"
                onClick={() => setShowTemplateSelector(true)}
                className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md text-sm font-medium transition-colors"
              >
                <FiLayers className="mr-2" />
                Change Template
              </button>
            </div>
            
            {/* Your existing form content goes here */}
            
          </div>
        </div>
        
        {/* Preview Section */}
        <div className="flex-1 min-w-0">
          <div className="sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Invoice Preview</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <InvoicePreview />
              
              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  <FiDownload className="mr-2" />
                  Download PDF
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(form, null, 2));
                    alert('Invoice data copied to clipboard!');
                  }}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <FiSave className="mr-2" />
                  Copy Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mt-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Select a Template</h2>
              <button
                onClick={() => setShowTemplateSelector(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <TemplateSelector
              onTemplateSelect={handleTemplateSelect}
              currentTemplateId={form.template}
              isPremiumUser={user?.isPremium || false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInvoice;
