import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CreateInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({
    businessName: '',
    businessLogo: '',
    clientName: '',
    clientEmail: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, price: 0 }],
    footer: '',
  });
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editId, setEditId] = useState(null);
  const user = useSelector(state => state.user.user);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      setError('Failed to fetch invoices');
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      }
      
      setForm({ 
        businessName: form.businessName, 
        businessLogo: form.businessLogo,
        clientName: '', 
        clientEmail: '', 
        dueDate: '', 
        items: [{ description: '', quantity: 1, price: 0 }],
        footer: '' 
      });
      setEditId(null);
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
      dueDate: '', 
      items: [{ description: '', quantity: 1, price: 0 }],
      footer: '' 
    });
    setEditId(null);
    setSuccess(null);
    setError(null);
  };

  // PDF download handler
  const handleDownloadPDF = async () => {
    const input = document.getElementById('invoice-preview');
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
    pdf.save(`${form.businessName || 'invoice'}.pdf`);
  };

  const handleSendInvoice = async () => {
    const input = document.getElementById('invoice-preview');
    if (!input) return;
    try {
      // Generate PDF as base64
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      const pdfBase64 = pdf.output('datauristring'); // returns base64 string
      // Send to backend
      await api.post('/invoices/send-email', {
        clientEmail: form.clientEmail,
        clientName: form.clientName,
        businessName: form.businessName,
        pdfBase64,
      });
      setSuccess('Invoice sent to client!');
    } catch (err) {
      setError('Failed to send invoice email');
    }
  };

  // Live preview component
  const InvoicePreview = () => (
    <div style={{ background: '#f9fafb', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '500px' }} id="invoice-preview">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
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
            <div style={{ color: '#2563eb', fontWeight: '500', marginTop: '4px' }}>INVOICE</div>
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
            <span style={{ fontWeight: '700', fontSize: '18px', color: '#2563eb' }}>${getTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ color: '#6b7280', fontSize: '14px' }}>{form.footer || 'Thank you for your business!'}</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
  <div style={{ display: 'flex', flexDirection: 'row', gap: '32px', flexWrap: 'wrap' }}>
        {/* Form Section */}
        <div style={{ flex: '1 1 50%', minWidth: '300px' }}>
          <div id="invoice-form" style={{ background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
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
            
            {error && (
              <div style={{ marginBottom: '24px', padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                {error}
              </div>
            )}
            
            {success && (
              <div style={{ marginBottom: '24px', padding: '12px', background: '#d1fae5', color: '#15803d', borderRadius: '8px', border: '1px solid #6ee7b7' }}>
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Business Details */}
              <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                  Business Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                </div>
              </div>
              
              {/* Client Details */}
              <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                  Client Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Client Name</label>
                    <input
                      name="clientName"
                      value={form.clientName}
                      onChange={handleChange}
                      placeholder="Client Name"
                      style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#374151', outline: 'none', transition: 'border-color 0.3s' }}
                      required
                    />
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
              
              <button 
                type="submit" 
                style={{ background: '#2563eb', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  editId ? 'Update Invoice' : 'Create Invoice'
                )}
              </button>
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
                style={{ background: '#22c55e', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1', transition: 'background 0.3s' }}
                onClick={handleSendInvoice}
              >
                <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '20px', width: '20px', marginRight: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;