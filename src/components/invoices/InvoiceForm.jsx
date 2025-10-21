import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createInvoice, updateInvoice, getInvoiceById } from '../../services/invoiceService';
import { saveTemplate } from '../../services/templateService';
import api from '../../services/api';

const InvoiceForm = forwardRef(({ isEdit = false, selectedTemplate = null, customStyles = {} }, ref) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    client: { name: '', email: '' },
    invoice: {
      number: '',
      date: new Date().toISOString().split('T')[0],
      currency: 'USD',
      items: [{ description: '', quantity: 1, rate: 0, amount: 0, tax: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0
    },
    isRecurring: false,
    frequency: 'monthly',
    nextDueDate: '',
    endDate: '',
    approvalRequired: false
  });

  // Apply template data and custom styles when selectedTemplate or customStyles change
  useEffect(() => {
    if (selectedTemplate && !isEdit) {
      // Pre-populate form with template data
      const templateItems = selectedTemplate.content?.items?.data || [];
      setFormData(prev => ({
        ...prev,
        invoice: {
          ...prev.invoice,
          items: templateItems.length > 0 ? templateItems.map(item => ({
            description: item.description || '',
            quantity: item.quantity || 1,
            rate: item.rate || 0,
            amount: item.amount || 0,
            tax: item.tax || 0
          })) : [{ description: '', quantity: 1, rate: 0, amount: 0, tax: 0 }]
        }
      }));
    }
  }, [selectedTemplate, isEdit]);

  // Apply custom styles to form elements
  const formStyle = {
    fontFamily: customStyles.fontFamily || 'Arial, sans-serif',
    fontSize: customStyles.fontSize || '16px',
    lineHeight: customStyles.lineHeight || '1.5',
    color: customStyles.secondaryColor || '#6B7280',
    backgroundColor: customStyles.backgroundColor || '#FFFFFF',
    padding: `${customStyles.padding || 20}px`,
    margin: `${customStyles.margin || 10}px`,
    borderRadius: `${customStyles.borderRadius || 4}px`,
    border: `1px solid ${customStyles.borderColor || '#E5E7EB'}`
  };

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [clients, setClients] = useState([]);

  // Load invoice if in edit mode and fetch clients
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch clients
        const clientsRes = await api.get('/clients');
        setClients(clientsRes.data);

        // Load invoice if in edit mode
        if (isEdit && id) {
          const data = await getInvoiceById(id);
          setFormData(prev => ({
            ...prev,
            ...data,
            invoice: {
              ...prev.invoice,
              ...data.invoiceData,
              date: data.invoiceData?.date ? new Date(data.invoiceData.date).toISOString().split('T')[0] : prev.invoice.date
            }
          }));
        }
      } catch (error) {
        toast.error('Failed to load data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Handle client selection
    if (name === 'clientId') {
      const selectedClient = clients.find(c => c._id === value);
      if (selectedClient) {
        setFormData(prev => ({
          ...prev,
          client: {
            name: selectedClient.name,
            email: selectedClient.email
          }
        }));
      }
    }
  };

  const updateItem = (index, field, value) => {
    const items = [...formData.invoice.items];
    items[index] = { ...items[index], [field]: parseFloat(value) || 0 };
    
    // Recalculate amount and totals
    const subtotal = items.reduce((sum, item) => {
      const amount = (item.quantity || 0) * (item.rate || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const tax = items.reduce((sum, item) => {
      const amount = (item.quantity || 0) * (item.rate || 0);
      const itemTax = (amount * (item.tax || 0)) / 100;
      return sum + (isNaN(itemTax) ? 0 : itemTax);
    }, 0);
    
    setFormData(prev => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        items,
        subtotal,
        tax,
        total: subtotal + tax
      }
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        items: [...prev.invoice.items, { description: '', quantity: 1, rate: 0, amount: 0, tax: 0 }]
      }
    }));
  };

  const removeItem = (index) => {
    const items = formData.invoice.items.filter((_, i) => i !== index);
    if (items.length === 0) {
      items.push({ description: '', quantity: 1, rate: 0, amount: 0, tax: 0 });
    }
    setFormData(prev => ({
      ...prev,
      invoice: { ...prev.invoice, items }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      if (formData.isRecurring) {
        // Handle recurring invoice creation
        const recurringData = {
          client: formData.client,
          clientName: formData.client.name,
          clientEmail: formData.client.email,
          clientPhone: formData.client.phone,
          amount: formData.invoice.total,
          currency: formData.invoice.currency,
          frequency: formData.frequency,
          nextDueDate: new Date(formData.nextDueDate).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          paymentMethod: formData.paymentMethod || 'mpesa',
          bankDetails: formData.bankDetails || {},
          templateId: selectedTemplate?._id,
          invoice: {
            ...formData.invoice,
            date: new Date(formData.invoice.date).toISOString()
          },
          styles: customStyles
        };

        const { createRecurringInvoice } = await import('../../services/recurringInvoiceService');
        await createRecurringInvoice(recurringData);
        toast.success('Recurring invoice created successfully');
      } else {
        // Handle regular invoice creation
        const data = {
          ...formData,
          invoice: {
            ...formData.invoice,
            date: new Date(formData.invoice.date).toISOString()
          },
          styles: customStyles, // Include custom styles in the invoice data
          templateId: selectedTemplate?._id // Include template ID if selected
        };

        if (isEdit && id) {
          await updateInvoice(id, data);
          toast.success('Invoice updated successfully');
        } else {
          await createInvoice(data);
          toast.success('Invoice created successfully');
        }
      }
      navigate('/invoices');
    } catch (error) {
      toast.error(error.message || 'Error saving invoice');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    try {
      setSavingTemplate(true);

      // Format the template data
      const templateData = {
        name: 'Custom Invoice Template',
        description: 'A custom invoice template created from an invoice',
        category: 'invoice',
        content: {
          client: formData.client,
          items: {
            data: formData.invoice.items
          },
          styles: {
            ...customStyles,
            fontFamily: customStyles.fontFamily === 'Arial, sans-serif' ? 'sans-serif' : customStyles.fontFamily
          }
        }
      };

      await saveTemplate(templateData);
      toast.success('Template saved successfully');
    } catch (error) {
      toast.error(error.message || 'Error saving template');
      console.error(error);
    } finally {
      setSavingTemplate(false);
    }
  };

  // Expose form data to parent component via ref
  useImperativeHandle(ref, () => ({
    getFormData: () => formData
  }));

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Client Information</h2>
          <p className="text-gray-600 mt-1">Enter your client's billing details</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
            <select
              name="clientId"
              value={formData.clientId || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client Email</label>
            <input
              type="email"
              name="client.email"
              value={formData.client.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Client email will be auto-filled"
              required
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Invoice Details</h2>
          <p className="text-gray-600 mt-1">Set your invoice number and date</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
            <input
              type="text"
              name="invoice.number"
              value={formData.invoice.number}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter invoice number"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
            <input
              type="date"
              name="invoice.date"
              value={formData.invoice.date}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              name="invoice.currency"
              value={formData.invoice.currency}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
      </div>

      
        <div className="border-b border-gray-200 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invoice Items</h2>
              <p className="text-gray-600 mt-1">Add products or services to your invoice</p>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <span>+</span>
              <span>Add Item</span>
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          {formData.invoice.items.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="grid grid-cols-12 gap-6 items-end">
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => {
                      const items = [...formData.invoice.items];
                      items[index].description = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        invoice: { ...prev.invoice, items }
                      }));
                    }}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter item description"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qty</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    step="1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rate ({formData.invoice.currency})</label>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax %</label>
                  <input
                    type="number"
                    value={item.tax}
                    onChange={(e) => updateItem(index, 'tax', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2 flex items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <span className="font-medium text-lg text-gray-900">
                      {formData.invoice.currency === 'USD' ? '$' : formData.invoice.currency === 'EUR' ? '€' : formData.invoice.currency === 'GBP' ? '£' : formData.invoice.currency === 'KES' ? 'KSh' : formData.invoice.currency === 'NGN' ? '₦' : formData.invoice.currency === 'INR' ? '₹' : formData.invoice.currency === 'ZAR' ? 'R' : '$'}{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors font-medium"
                >
                  Remove Item
                </button>
              </div>
            </div>
          ))}
        </div>
  

      <div className="border-t border-gray-200 pt-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-end">
            <div className="text-right space-y-3 w-64">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  {formData.invoice.currency === 'USD' ? '$' : formData.invoice.currency === 'EUR' ? '€' : formData.invoice.currency === 'GBP' ? '£' : formData.invoice.currency === 'KES' ? 'KSh' : formData.invoice.currency === 'NGN' ? '₦' : formData.invoice.currency === 'INR' ? '₹' : formData.invoice.currency === 'ZAR' ? 'R' : '$'}{formData.invoice.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">
                  {formData.invoice.currency === 'USD' ? '$' : formData.invoice.currency === 'EUR' ? '€' : formData.invoice.currency === 'GBP' ? '£' : formData.invoice.currency === 'KES' ? 'KSh' : formData.invoice.currency === 'NGN' ? '₦' : formData.invoice.currency === 'INR' ? '₹' : formData.invoice.currency === 'ZAR' ? 'R' : '$'}{formData.invoice.tax.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-3 flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-gray-900">
                  {formData.invoice.currency === 'USD' ? '$' : formData.invoice.currency === 'EUR' ? '€' : formData.invoice.currency === 'GBP' ? '£' : formData.invoice.currency === 'KES' ? 'KSh' : formData.invoice.currency === 'NGN' ? '₦' : formData.invoice.currency === 'INR' ? '₹' : formData.invoice.currency === 'ZAR' ? 'R' : '$'}{formData.invoice.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recurring Invoice Options */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recurring Options</h2>
          <p className="text-gray-600 mt-1">Set up automatic recurring billing</p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-900">
              Make this a recurring invoice
            </label>
          </div>

          {formData.isRecurring && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-6 border-l-2 border-blue-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Next Due Date</label>
                <input
                  type="date"
                  name="nextDueDate"
                  value={formData.nextDueDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approval Workflow */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Approval Workflow</h2>
          <p className="text-gray-600 mt-1">Require approval before sending invoices</p>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="approvalRequired"
            name="approvalRequired"
            checked={formData.approvalRequired}
            onChange={(e) => setFormData(prev => ({ ...prev, approvalRequired: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="approvalRequired" className="ml-2 block text-sm text-gray-900">
            Require approval before sending this invoice
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-8">
        <button
          type="button"
          onClick={() => navigate('/invoices')}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          disabled={saving || savingTemplate}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveAsTemplate}
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
          disabled={saving || savingTemplate}
        >
          {savingTemplate ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving Template...</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Save as Template</span>
            </>
          )}
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
          disabled={saving || savingTemplate}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>Save Invoice</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
});

export default InvoiceForm;
