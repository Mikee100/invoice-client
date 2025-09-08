import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiTrash2, FiSend, FiDownload, FiEdit2, FiSave, FiLayers } from 'react-icons/fi';
import Spinner from '../components/ui/Spinner';
import { useSelector } from 'react-redux';
import api from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import TemplateSelector from '../components/TemplateSelector';
import { TEMPLATES } from '../data/templates';

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
    template: 'classic',
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

  // ... (existing functions like fetchInvoices, fetchProjects, etc.)

  // Live preview component
  const InvoicePreview = () => {
    const selectedTemplate = TEMPLATES.find(t => t.id === form.template) || TEMPLATES[0];
    const styles = selectedTemplate.styles;
    
    const headerBg = styles.headerBg || styles.primaryColor || '#f9fafb';
    const headerText = styles.headerText || (headerBg === styles.primaryColor ? '#ffffff' : styles.textColor || '#1f2937');
    const borderColor = styles.borderColor || '#e5e7eb';
    const primaryColor = styles.primaryColor || '#2563eb';
    const secondaryColor = styles.secondaryColor || '#3b82f6';

    const previewStyles = {
      background: styles.backgroundColor || '#ffffff',
      color: styles.textColor || '#1f2937',
      fontFamily: styles.fontFamily || 'Inter, sans-serif',
      padding: '24px',
      borderRadius: styles.borderRadius || '12px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '500px',
      maxWidth: '700px',
      margin: '0 auto',
      boxSizing: 'border-box',
      overflowX: 'auto',
      fontSize: '16px',
    };

    return (
      <div id="invoice-preview" style={previewStyles}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '32px', 
          paddingBottom: '24px', 
          borderBottom: `1px solid ${borderColor}`,
          background: headerBg,
          color: headerText,
          padding: '16px 24px',
          borderRadius: '8px 8px 0 0',
          margin: '-24px -24px 24px -24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            {form.businessLogo ? (
              <img src={form.businessLogo} alt="Logo" style={{ height: '64px', width: '64px', objectFit: 'contain', borderRadius: '8px' }} />
            ) : (
              <div style={{ height: '64px', width: '64px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', border: '1px solid #e5e7eb' }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '32px', width: '32px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: headerText }}>{form.businessName || 'Your Business Name'}</h2>
              <div style={{ color: headerText, fontWeight: '500', marginTop: '4px', opacity: 0.9 }}>INVOICE</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: headerText, opacity: 0.8, fontSize: '14px' }}>Due Date</div>
            <div style={{ fontWeight: '600', color: headerText }}>{form.dueDate || 'YYYY-MM-DD'}</div>
          </div>
        </div>
        
        {/* Rest of the invoice preview */}
        
        {/* Footer */}
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '24px', 
          borderTop: `1px solid ${borderColor}`,
          fontSize: '14px',
          color: styles.textColor ? `${styles.textColor}aa` : '#6b7280'
        }}>
          <div>{form.footer || 'Thank you for your business!'}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form Section */}
        <div className="flex-1 min-w-0">
          <div id="invoice-form" className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create New Invoice</h2>
              <button
                type="button"
                onClick={() => setShowTemplateSelector(true)}
                className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md text-sm font-medium transition-colors"
              >
                <FiLayers className="mr-2" />
                Change Template
              </button>
            </div>
            
            {/* Your form fields here */}
            
          </div>
        </div>
        
        {/* Preview Section */}
        <div className="flex-1 min-w-0">
          <div className="sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Invoice Preview</h2>
            <InvoicePreview />
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
              onTemplateSelect={(template) => {
                setForm(prev => ({ ...prev, template: template.id }));
                setShowTemplateSelector(false);
              }}
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
