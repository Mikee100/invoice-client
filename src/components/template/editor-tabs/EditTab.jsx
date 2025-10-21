import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';

const Section = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      
      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = 'text', placeholder = '', className = '', ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      {...props}
    />
  </div>
);

export default function EditTab({ template, onTemplateChange }) {
  const updateContent = (path, value) => {
    const newContent = { ...template.content };
    const keys = path.split('.');
    let current = newContent;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onTemplateChange({ ...template, content: newContent });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onTemplateChange({
      ...template,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleContentChange = (path) => (e) => {
    const { value, type, checked } = e.target;
    updateContent(path, type === 'checkbox' ? checked : value);
  };

  return (
    <div className="p-4 overflow-y-auto h-full">
      <Section title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Template Name"
            name="name"
            value={template.name}
            onChange={handleChange}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={template.category || 'invoice'}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="invoice">Invoice</option>
              <option value="proposal">Proposal</option>
              <option value="contract">Contract</option>
              <option value="receipt">Receipt</option>
              <option value="estimate">Estimate</option>
              <option value="quote">Quote</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={template.description || ''}
              onChange={handleChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="A brief description of this template"
            />
          </div>
        </div>
      </Section>

      <Section title="Business Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Business Name"
            value={template.content.business?.name || ''}
            onChange={handleContentChange('business.name')}
          />
          
          <InputField
            label="Email"
            type="email"
            value={template.content.business?.email || ''}
            onChange={handleContentChange('business.email')}
          />
          
          <InputField
            label="Phone"
            type="tel"
            value={template.content.business?.phone || ''}
            onChange={handleContentChange('business.phone')}
          />
          
          <InputField
            label="Address"
            value={template.content.business?.address || ''}
            onChange={handleContentChange('business.address')}
            className="md:col-span-2"
          />
          
          <InputField
            label="City"
            value={template.content.business?.city || ''}
            onChange={handleContentChange('business.city')}
          />
          
          <InputField
            label="State/Province"
            value={template.content.business?.state || ''}
            onChange={handleContentChange('business.state')}
          />
          
          <InputField
            label="ZIP/Postal Code"
            value={template.content.business?.zip || ''}
            onChange={handleContentChange('business.zip')}
          />
          
          <InputField
            label="Country"
            value={template.content.business?.country || ''}
            onChange={handleContentChange('business.country')}
          />
          
          <InputField
            label="Website"
            type="url"
            value={template.content.business?.website || ''}
            onChange={handleContentChange('business.website')}
            placeholder="https://example.com"
          />
          
          <InputField
            label="Tax ID"
            value={template.content.business?.taxId || ''}
            onChange={handleContentChange('business.taxId')}
          />
        </div>
      </Section>

      <Section title="Invoice Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Invoice Title"
            value={template.content.invoice?.title || 'INVOICE'}
            onChange={handleContentChange('invoice.title')}
          />
          
          <InputField
            label="Invoice Number Prefix"
            value={template.content.invoice?.numberPrefix || 'INV-'}
            onChange={handleContentChange('invoice.numberPrefix')}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
            <select
              value={template.content.invoice?.dateFormat || 'MM/DD/YYYY'}
              onChange={handleContentChange('invoice.dateFormat')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="Month D, YYYY">Month D, YYYY</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={template.content.invoice?.currency || 'USD'}
              onChange={handleContentChange('invoice.currency')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
              <option value="JPY">Japanese Yen (¥)</option>
              <option value="AUD">Australian Dollar (A$)</option>
              <option value="CAD">Canadian Dollar (C$)</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
            <textarea
              value={template.content.invoice?.terms || 'Payment due within 30 days of issue date.'}
              onChange={handleContentChange('invoice.terms')}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter payment terms and conditions"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={template.content.invoice?.notes || 'Thank you for your business!'}
              onChange={handleContentChange('invoice.notes')}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Additional notes for the client"
            />
          </div>
        </div>
      </Section>

      <Section title="Line Items">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium text-gray-900">Columns</h4>
            <button
              type="button"
              onClick={() => {
                const newColumns = [...(template.content.items?.columns || [])];
                newColumns.push({
                  id: `col-${Date.now()}`,
                  label: `Column ${newColumns.length + 1}`,
                  type: 'text',
                  width: '20%'
                });
                updateContent('items.columns', newColumns);
              }}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="mr-1" /> Add Column
            </button>
          </div>

          <div className="space-y-2">
            {template.content.items?.columns?.map((column, index) => (
              <div key={column.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <InputField
                  label="Label"
                  value={column.label}
                  onChange={(e) => {
                    const newColumns = [...template.content.items.columns];
                    newColumns[index] = { ...newColumns[index], label: e.target.value };
                    updateContent('items.columns', newColumns);
                  }}
                  className="flex-1"
                />
                <select
                  value={column.type || 'text'}
                  onChange={(e) => {
                    const newColumns = [...template.content.items.columns];
                    newColumns[index] = { ...newColumns[index], type: e.target.value };
                    updateContent('items.columns', newColumns);
                  }}
                  className="mt-1 block w-32 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="currency">Currency</option>
                  <option value="date">Date</option>
                  <option value="checkbox">Checkbox</option>
                </select>
                <InputField
                  label="Width"
                  type="text"
                  value={column.width || '20%'}
                  onChange={(e) => {
                    const newColumns = [...template.content.items.columns];
                    newColumns[index] = { ...newColumns[index], width: e.target.value };
                    updateContent('items.columns', newColumns);
                  }}
                  className="w-24"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newColumns = template.content.items.columns.filter((_, i) => i !== index);
                    updateContent('items.columns', newColumns);
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Subtotal</h4>
            <InputField
              label="Label"
              value={template.content.summary?.subtotal?.label || 'Subtotal'}
              onChange={handleContentChange('summary.subtotal.label')}
            />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Tax</h4>
            <InputField
              label="Label"
              value={template.content.summary?.tax?.label || 'Tax'}
              onChange={handleContentChange('summary.tax.label')}
            />
            <div className="flex items-center space-x-2">
              <InputField
                label="Rate %"
                type="number"
                value={template.content.summary?.tax?.rate || 0}
                onChange={handleContentChange('summary.tax.rate')}
                min="0"
                max="100"
                step="0.01"
                className="w-24"
              />
              <div className="pt-5">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={template.content.summary?.tax?.included || false}
                    onChange={(e) => updateContent('summary.tax.included', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Included in price</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Discount</h4>
            <InputField
              label="Label"
              value={template.content.summary?.discount?.label || 'Discount'}
              onChange={handleContentChange('summary.discount.label')}
            />
            <InputField
              label="Amount"
              type="number"
              value={template.content.summary?.discount?.amount || 0}
              onChange={handleContentChange('summary.discount.amount')}
              min="0"
              step="0.01"
              className="w-32"
            />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Total</h4>
            <InputField
              label="Label"
              value={template.content.summary?.total?.label || 'Total'}
              onChange={handleContentChange('summary.total.label')}
            />
          </div>
        </div>
      </Section>

      <Section title="Styling">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
            <div className="flex items-center">
              <input
                type="color"
                value={template.content.styles?.primaryColor || '#4F46E5'}
                onChange={handleContentChange('styles.primaryColor')}
                className="h-10 w-10 rounded border border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-500">
                {template.content.styles?.primaryColor || '#4F46E5'}
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
            <select
              value={template.content.styles?.fontFamily || 'sans-serif'}
              onChange={handleContentChange('styles.fontFamily')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="sans-serif">Sans-serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom CSS</label>
            <textarea
              value={template.content.styles?.customCSS || ''}
              onChange={handleContentChange('styles.customCSS')}
              rows={4}
              className="w-full p-2 font-mono text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add custom CSS styles here..."
            />
          </div>
        </div>
      </Section>
    </div>
  );
};