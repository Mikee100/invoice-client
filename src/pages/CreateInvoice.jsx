import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiTrash2, FiSend, FiDownload, FiEdit2, FiSave, FiLayers } from 'react-icons/fi';
import Spinner from '../components/ui/Spinner';
import { useSelector } from 'react-redux';
import api from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import TemplateSelector from '../components/TemplateSelector';
import { TEMPLATES } from '../data/templates'; // <-- Add this line

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
    template: 'classic', // Default template
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

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      setError('Failed to fetch invoices');
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      // ignore
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchInvoices(), fetchProjects(), fetchClients()])
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'clientId') {
      const selectedClient = clients.find(c => c._id === e.target.value);
      if (selectedClient) {
        setForm(f => ({ ...f, clientName: selectedClient.name, clientEmail: selectedClient.email, clientPhone: selectedClient.phone }));
      }
    }
    if (e.target.name === 'projectId') {
      const selectedProject = projects.find(p => p._id === e.target.value);
      if (selectedProject) {
        setForm(f => ({ ...f, project: selectedProject.name }));
      }
    }
  };

  const handleLogoUpload = e => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, businessLogo: reader.result });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleItemChange = (idx, field, value) => {
    const items = form.items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    setForm({ ...form, items });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { description: '', quantity: 1, price: 0 }] });
  };

  const removeItem = idx => {
    if (form.items.length > 1) {
      setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
    }
  };

  const getTotal = () => {
    return form.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const invoiceData = {
        ...form,
        amount: getTotal(),
      };
      if (editId) {
        await api.put(`/invoices/${editId}`, invoiceData);
        setSuccess('Invoice updated successfully!');
      } else {
        await api.post('/invoices', invoiceData);
        setSuccess('Invoice created successfully!');
        setInvoiceCreated(true);
      }
      // Do NOT reset form or navigate away; keep preview visible
      // setEditId(null);
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = invoice => {
    setForm({
      businessName: invoice.businessName || '',
      businessLogo: invoice.businessLogo || '',
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientPhone: invoice.clientPhone || '',
      dueDate: invoice.dueDate?.slice(0, 10),
      items: invoice.items || [{ description: '', quantity: 1, price: 0 }],
      footer: invoice.footer || ''
    });
    setEditId(invoice._id);
    setSuccess(null);
    setError(null);
    
    // Scroll to form
    document.getElementById('invoice-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/invoices/${id}`);
      setSuccess('Invoice deleted successfully!');
      fetchInvoices();
    } catch (err) {
      setError('Failed to delete invoice');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ 
      businessName: '', 
      businessLogo: '', 
      clientName: '', 
      clientEmail: '', 
      clientPhone: '',
      dueDate: '', 
      items: [{ description: '', quantity: 1, price: 0 }],
      footer: '' 
    });
    setEditId(null);
    setSuccess(null);
    setError(null);
    setMpesaLinkPreview('');
    setInvoiceCreated(false);
  };

  // PDF download handler
  const handleDownloadPDF = async () => {
  const input = document.getElementById('invoice-preview');
  if (!input) return;
  const canvas = await html2canvas(input, {
    scale: 2,
    backgroundColor: '#fff',
    useCORS: true,
    allowTaint: true,
    logging: false,
    width: input.offsetWidth,
    height: input.offsetHeight
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  // Add white margin
  const margin = 32;
  // Calculate image size to fit with margin
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = canvas.height * (imgWidth / canvas.width);
  // Center image vertically if shorter than page
  const yOffset = Math.max(margin, (pageHeight - imgHeight) / 2);
  pdf.setFillColor(255,255,255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  // Add drop shadow effect (simulate)
  pdf.setDrawColor(220,220,220);
  pdf.setLineWidth(2);
  pdf.rect(margin-2, yOffset-2, imgWidth+4, imgHeight+4);
  // Add image
  pdf.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
  // Add custom font for header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(37,99,235);
  pdf.text(form.businessName || 'Your Business Name', margin+8, margin+28);
  // Add footer
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(107,114,128);
  pdf.text(form.footer || 'Thank you for your business!', margin+8, pageHeight-margin+12);
  pdf.save(`${form.businessName || 'invoice'}.pdf`);
  };

  const handleSendInvoice = async () => {
    const input = document.getElementById('invoice-preview');
    if (!input) return;
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      // Generate PDF as base64
  const canvas = await html2canvas(input, { scale: 2 }); // Higher scale for sharper image
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      const pdfBase64 = pdf.output('datauristring'); // returns base64 string
      // Send to backend
      const res = await api.post('/invoices/send-email', {
        clientEmail: form.clientEmail,
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        businessName: form.businessName,
        amount: getTotal(),
        pdfBase64,
      });
      if (res.data.mpesaLink) {
        setMpesaLinkPreview(res.data.mpesaLink);
      } else {
        setMpesaLinkPreview('');
      }
      setSuccess('Invoice sent successfully to ' + form.clientEmail + '!');
    } catch (err) {
      setError('Failed to send invoice email');
    } finally {
      setSending(false);
    }
  };

  // Live preview component
  const InvoicePreview = () => {
    // Get the selected template or fallback to default
    const selectedTemplate = TEMPLATES.find(t => t.id === form.template) || TEMPLATES[0];
    const styles = selectedTemplate.styles;
    
    // Apply template styles with fallbacks
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
      '@media print': {
        boxShadow: 'none',
        background: '#fff',
        color: '#000',
        padding: '0',
        maxWidth: '100%',
      },
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
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{form.businessName || 'Your Business Name'}</h2>
            <div style={{ 
            color: headerText, 
            fontWeight: '500', 
            marginTop: '4px',
            opacity: 0.9
          }}>INVOICE</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Due Date</div>
          <div style={{ fontWeight: '600', color: '#1f2937' }}>{form.dueDate || 'YYYY-MM-DD'}</div>
        </div>
      </div>
      
      {/* Client Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
        <div>
          <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Bill To:</div>
          <div style={{ fontWeight: '600', color: '#1f2937' }}>{form.clientName || 'Client Name'}</div>
          <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>{form.clientEmail || 'client@example.com'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Prepared By:</div>
          <div style={{ fontWeight: '600', color: '#1f2937' }}>{user?.name || 'Your Name'}</div>
          <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>{user?.email || 'your@email.com'}</div>
        </div>
      </div>
      
      {/* Items Table */}
      <div style={{ marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '14px', borderBottom: '1px solid #e5e7eb' }}>Description</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#4b5563', fontWeight: '600', fontSize: '14px', borderBottom: '1px solid #e5e7eb', width: '80px' }}>Qty</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#4b5563', fontWeight: '600', fontSize: '14px', borderBottom: '1px solid #e5e7eb', width: '112px' }}>Price</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#4b5563', fontWeight: '600', fontSize: '14px', borderBottom: '1px solid #e5e7eb', width: '128px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {form.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: idx % 2 === 0 ? '#f9fafb' : 'transparent' }}>
                <td style={{ padding: '12px', color: '#374151' }}>{item.description || 'Item description'}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#374151' }}>{item.quantity}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#374151' }}>${item.price.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#374151', fontWeight: '500' }}>${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ width: '256px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', paddingBottom: '12px', borderTop: '1px solid #e5e7eb' }}>
            <span style={{ fontWeight: '600', color: '#374151' }}>Total:</span>
            <span style={{ fontWeight: '700', fontSize: '18px', color: primaryColor }}>${getTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
      
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
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {editId ? 'Edit Invoice' : 'Create Invoice'}
              </h1>
              {editId && (
                <button 
                  onClick={resetForm}
                  style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '16px', width: '16px', marginRight: '4px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Invoice
                </button>
              )}
            </div>
            {/* Error Message */}
            {error && (
              <div style={{ marginBottom: '24px', padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', border: '1px solid #fecaca' }}>
                {error}
              </div>
            )}
            {/* Sending Message */}
            {sending && (
              <div className="mb-6 p-3 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-200 flex items-center gap-3">
                <Spinner size="md" color="indigo" />
                <span>Sending invoice... Please wait.</span>
              </div>
            )}
            {/* Success Message */}
            {success && (
              <div style={{ marginBottom: '24px', padding: '12px', background: '#d1fae5', color: '#15803d', borderRadius: '8px', border: '1px solid #6ee7b7' }}>
                {success}
              </div>
            )}
            <form>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Currency</label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s', marginBottom: '16px' }}
                  required
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="NGN">NGN - Nigerian Naira</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="ZAR">ZAR - South African Rand</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Project</label>
                <select
                  name="projectId"
                  value={form.projectId || ''}
                  onChange={handleChange}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Business Name</label>
                <input
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="Your Business Name"
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Business Logo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', opacity: '0', cursor: 'pointer' }}
                    />
                    <button 
                      type="button"
                      style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', fontWeight: '500', cursor: 'pointer', transition: 'background 0.3s, border-color 0.3s' }}
                    >
                      Choose Image
                    </button>
                  </div>
                  {form.businessLogo && (
                    <img src={form.businessLogo} alt="Logo" style={{ height: '48px', width: '48px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>JPG, PNG or GIF (Max 2MB)</p>
              </div>
              </form>
              <form>
              {/* Client Details */}
              <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                  Client Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Client</label>
                    <select
                      name="clientId"
                      value={form.clientId || ''}
                      onChange={handleChange}
                      style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                      required
                    >
                      <option value="">Select Client</option>
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Client Email</label>
                    <input
                      name="clientEmail"
                      value={form.clientEmail}
                      onChange={handleChange}
                      placeholder="client@example.com"
                      type="email"
                      style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Client Phone (Mpesa)</label>
                    <input
                      name="clientPhone"
                      value={form.clientPhone}
                      onChange={handleChange}
                      placeholder="2547XXXXXXXX"
                      type="tel"
                      style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                      pattern="2547[0-9]{8}"
                    />
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Required for Mpesa payment link (format: 2547XXXXXXXX)</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Due Date</label>
                    <input
                      name="dueDate"
                      value={form.dueDate}
                      onChange={handleChange}
                      type="date"
                      style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Payment Method */}
              <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                  Payment Method
                </h3>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s', marginBottom: '16px' }}
                  required
                >
                  <option value="mpesa">Mpesa</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="stripe">Stripe (Card/Online)</option>
                </select>
                {form.paymentMethod === 'stripe' && (
                  <div style={{ marginTop: '16px', background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
                    <p className="text-green-700 font-semibold">Stripe is a secure way for your client to pay online using a card or mobile money. The payment link will be sent with the invoice.</p>
                  </div>
                )}
                {form.paymentMethod === 'bank' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Bank Name</label>
                      <input
                        name="bankName"
                        value={form.bankName}
                        onChange={handleChange}
                        placeholder="Bank Name"
                        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Account Name</label>
                      <input
                        name="accountName"
                        value={form.accountName}
                        onChange={handleChange}
                        placeholder="Account Name"
                        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Account Number</label>
                      <input
                        name="accountNumber"
                        value={form.accountNumber}
                        onChange={handleChange}
                        placeholder="Account Number"
                        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Reference</label>
                      <input
                        name="reference"
                        value={form.reference}
                        onChange={handleChange}
                        placeholder="Reference"
                        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Line Items */}
              <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                    Line Items
                  </h3>
                  <button 
                    type="button" 
                    onClick={addItem}
                    style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#2563eb', fontWeight: '500', cursor: 'pointer' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '16px', width: '16px', marginRight: '4px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Item
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {form.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                      <div style={{ flex: '1' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Description</label>
                        <input
                          value={item.description}
                          onChange={e => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="Item description"
                          style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                          required
                        />
                      </div>
                      <div style={{ width: '80px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Qty</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                          min={1}
                          required
                        />
                      </div>
                      <div style={{ width: '112px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Price</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={e => handleItemChange(idx, 'price', Number(e.target.value))}
                          style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                          min={0}
                          step="0.01"
                          required
                        />
                      </div>
                      <div style={{ paddingTop: '24px' }}>
                        <button 
                          type="button" 
                          onClick={() => removeItem(idx)}
                          style={{ color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.3s' }}
                          disabled={form.items.length <= 1}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '20px', width: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Footer Notes */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                  Footer Notes
                </h3>
                <textarea
                  name="footer"
                  value={form.footer}
                  onChange={handleChange}
                  placeholder="Thank you for your business! Payment terms: Net 30"
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                  rows={3}
                />
              </div>
              
              {/* No submit button. Only live preview is available. */}
            </form>
          </div>
        </div>
        {/* Preview Section */}
        <div style={{ flex: '1 1 50%', minWidth: '300px' }}>
          <div style={{ position: 'sticky', top: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
              Invoice Preview
            </h2>
            <InvoicePreview />
            {/* Download PDF button always visible below preview */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
              <button
                type="button"
                style={{ background: '#111827', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1', transition: 'background 0.3s' }}
                onClick={handleDownloadPDF}
              >
                <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '20px', width: '20px', marginRight: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
              <button
                type="button"
                style={{ background: '#2563eb', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1', transition: 'background 0.3s' }}
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(form, null, 2));
                  alert('Invoice data copied as JSON!');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '20px', width: '20px', marginRight: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8M4 6h16M4 20h16" />
                </svg>
                Export JSON
              </button>
              <button
                type="button"
                style={{ background: '#ef4444', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1', transition: 'background 0.3s' }}
                onClick={resetForm}
              >
                <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '20px', width: '20px', marginRight: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Form
              </button>
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
}
export default CreateInvoice;