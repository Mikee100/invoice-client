import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiEye, FiCode, FiDroplet, FiSettings, FiCheck } from 'react-icons/fi';
import { TEMPLATES } from '../../../../src/data/templates';

const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [activeTab, setActiveTab] = useState('design');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    isPremium: false,
    categories: [],
    thumbnail: '',
    styles: {
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'sans-serif',
      borderRadius: '0.375rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    },
    layout: 'classic',
    previewHtml: ''
  });

  useEffect(() => {
    if (isEditMode) {
      // Find the template to edit
      const templateToEdit = TEMPLATES.find(t => t.id === id);
      if (templateToEdit) {
        setFormData(templateToEdit);
      }
    } else {
      // Generate a new ID for new templates
      setFormData(prev => ({
        ...prev,
        id: `template-${Date.now()}`,
        name: `New Template ${TEMPLATES.length + 1}`
      }));
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      let categories = [...prev.categories];
      if (checked) {
        categories.push(value);
      } else {
        categories = categories.filter(cat => cat !== value);
      }
      return { ...prev, categories };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement save functionality
    console.log('Saving template:', formData);
    navigate('/admin/templates');
  };

  const generatePreview = () => {
    // In a real app, this would generate a preview based on the template
    const preview = `
      <div class="p-6 max-w-4xl mx-auto" style="font-family: ${formData.styles.fontFamily}; color: ${formData.styles.textColor};">
        <div class="p-6 rounded-lg" style="background: ${formData.styles.backgroundColor}; box-shadow: ${formData.styles.boxShadow};">
          <div class="pb-4 mb-6 border-b" style="border-color: ${formData.styles.primaryColor}20;">
            <h1 class="text-2xl font-bold" style="color: ${formData.styles.primaryColor};">Invoice #INV-001</h1>
            <p class="text-gray-600">${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 class="text-lg font-semibold mb-2">From</h2>
              <p>Your Company</p>
              <p>123 Business St.</p>
              <p>City, Country</p>
            </div>
            <div class="text-right md:text-left">
              <h2 class="text-lg font-semibold mb-2">Bill To</h2>
              <p>Client Name</p>
              <p>Client Company</p>
              <p>client@example.com</p>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr style="background: ${formData.styles.primaryColor}10;">
                  <th class="py-2 px-4 text-left">Item</th>
                  <th class="py-2 px-4 text-right">Qty</th>
                  <th class="py-2 px-4 text-right">Price</th>
                  <th class="py-2 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b">
                  <td class="py-3 px-4">Website Design</td>
                  <td class="py-3 px-4 text-right">1</td>
                  <td class="py-3 px-4 text-right">$1,200.00</td>
                  <td class="py-3 px-4 text-right">$1,200.00</td>
                </tr>
                <tr class="border-b">
                  <td class="py-3 px-4">Hosting (1 year)</td>
                  <td class="py-3 px-4 text-right">1</td>
                  <td class="py-3 px-4 text-right">$300.00</td>
                  <td class="py-3 px-4 text-right">$300.00</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="py-2 px-4 text-right font-semibold">Subtotal</td>
                  <td class="py-2 px-4 text-right">$1,500.00</td>
                </tr>
                <tr>
                  <td colspan="3" class="py-2 px-4 text-right font-semibold">Tax (10%)</td>
                  <td class="py-2 px-4 text-right">$150.00</td>
                </tr>
                <tr style="background: ${formData.styles.primaryColor}05;">
                  <td colspan="3" class="py-3 px-4 text-right font-bold text-lg" style="color: ${formData.styles.primaryColor};">Total</td>
                  <td class="py-3 px-4 text-right font-bold text-lg" style="color: ${formData.styles.primaryColor};">$1,650.00</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div class="mt-8 pt-6 border-t text-center text-sm text-gray-500">
            <p>Thank you for your business!</p>
            <p class="mt-1">Please make payment within 30 days of receiving this invoice.</p>
          </div>
        </div>
      </div>
    `;
    
    setFormData(prev => ({
      ...prev,
      previewHtml: preview
    }));
  };

  const availableCategories = [
    'Business', 'Creative', 'Minimal', 'Modern', 'Professional', 'Elegant', 'Simple', 'Corporate'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Template' : 'Create New Template'}
        </h1>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            type="button"
            onClick={() => navigate('/admin/templates')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiX className="-ml-1 mr-2 h-5 w-5" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiSave className="-ml-1 mr-2 h-5 w-5" />
            Save Template
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              type="button"
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'design' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('design')}
            >
              <FiDroplet className="mr-2" />
              Design
            </button>
            <button
              type="button"
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'preview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => {
                generatePreview();
                setActiveTab('preview');
              }}
            >
              <FiEye className="inline-block mr-2" />
              Preview
            </button>
            <button
              type="button"
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'code' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('code')}
            >
              <FiCode className="inline-block mr-2" />
              Code
            </button>
            <button
              type="button"
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('settings')}
            >
              <FiSettings className="inline-block mr-2" />
              Settings
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'design' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Template Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableCategories.map(category => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            value={category.toLowerCase()}
                            checked={formData.categories.includes(category.toLowerCase())}
                            onChange={handleCategoryChange}
                          />
                          <span className="ml-2 text-sm text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Template Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="isPremium"
                        name="isPremium"
                        type="checkbox"
                        checked={formData.isPremium}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isPremium" className="ml-2 block text-sm text-gray-700">
                        Premium Template
                      </label>
                    </div>

                    <div>
                      <label htmlFor="layout" className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
                      <select
                        id="layout"
                        name="layout"
                        value={formData.layout}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="classic">Classic</option>
                        <option value="modern">Modern</option>
                        <option value="minimal">Minimal</option>
                        <option value="creative">Creative</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Color
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          id="primaryColor"
                          name="styles.primaryColor"
                          value={formData.styles.primaryColor}
                          onChange={handleChange}
                          className="h-10 w-10 p-1 border border-gray-300 rounded-md"
                        />
                        <span className="ml-2 text-sm text-gray-500">{formData.styles.primaryColor}</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700 mb-1">
                        Font Family
                      </label>
                      <select
                        id="fontFamily"
                        name="styles.fontFamily"
                        value={formData.styles.fontFamily}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="sans-serif">Sans-serif</option>
                        <option value="serif">Serif</option>
                        <option value="monospace">Monospace</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="'Courier New', monospace">Courier New</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && formData.previewHtml && (
            <div className="bg-gray-100 p-6 rounded-lg">
              <div 
                className="bg-white mx-auto max-w-4xl shadow-lg"
                dangerouslySetInnerHTML={{ __html: formData.previewHtml }}
              />
            </div>
          )}

          {activeTab === 'code' && (
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
                <code>{JSON.stringify(formData, null, 2)}</code>
              </pre>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Advanced settings should be configured with caution. Changes here may affect template functionality.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="templateId" className="block text-sm font-medium text-gray-700">Template ID</label>
                  <input
                    type="text"
                    id="templateId"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={isEditMode}
                  />
                </div>

                <div>
                  <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
                  <input
                    type="text"
                    id="thumbnail"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Danger Zone</h3>
                <p className="mt-1 text-sm text-gray-500">
                  These actions are irreversible. Please be certain.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FiTrash2 className="-ml-1 mr-2 h-5 w-5" />
                    Delete Template
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
