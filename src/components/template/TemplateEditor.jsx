import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getTemplateById, saveTemplate } from '../../services/templateService';
import EnhancedTemplateEditor from './EnhancedTemplateEditor';

const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    category: 'invoice',
    isPublic: false,
    tags: [],
    content: {
      header: {},
      client: {},
      items: { columns: [], data: [] },
      summary: {},
      footer: {},
      styles: {
        primaryColor: '#4F46E5',
        secondaryColor: '#6B7280',
        fontFamily: 'Arial, sans-serif',
        headerBg: '#F9FAFB',
        borderColor: '#E5E7EB'
      }
    }
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Load template if in edit mode
  useEffect(() => {
    if (id && id !== 'new') {
      const loadTemplate = async () => {
        try {
          const data = await getTemplateById(id);
          setTemplate(data);
        } catch (error) {
          toast.error('Failed to load template');
          console.error('Error loading template:', error);
        }
      };
      loadTemplate();
    }
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTemplate(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle content changes
  const handleContentChange = (path, value) => {
    setTemplate(prev => {
      const newContent = { ...prev.content };
      const keys = path.split('.');
      let current = newContent;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }
      
      current[keys[keys.length - 1]] = value;
      
      return {
        ...prev,
        content: newContent
      };
    });
  };

  // Handle style changes
  const handleStyleChange = (property, value) => {
    setTemplate(prev => ({
      ...prev,
      content: {
        ...prev.content,
        styles: {
          ...prev.content.styles,
          [property]: value
        }
      }
    }));
  };

  // Save template
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveTemplate(template);
      toast.success('Template saved successfully');
      navigate('/templates');
    } catch (error) {
      toast.error('Failed to save template');
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  };


  // Handle template content change
  const handleTemplateChange = (updatedTemplate) => {
    setTemplate(updatedTemplate);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {id === 'new' ? 'Create New Template' : 'Edit Template'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
            <input
              type="text"
              name="name"
              value={template.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="Enter template name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={template.category}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="invoice">Invoice</option>
              <option value="proposal">Proposal</option>
              <option value="contract">Contract</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={template.isPublic}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              Make this template public
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={template.description}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border rounded-md"
            placeholder="Enter template description"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {tag}
                <button
                  type="button"
                  onClick={() => {
                    const newTags = [...template.tags];
                    newTags.splice(index, 1);
                    setTemplate(prev => ({ ...prev, tags: newTags }));
                  }}
                  className="ml-1.5 inline-flex text-blue-700 hover:text-blue-900"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add a tag and press Enter"
              className="flex-1 min-w-[150px] p-1 border rounded-md text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  e.preventDefault();
                  setTemplate(prev => ({
                    ...prev,
                    tags: [...new Set([...prev.tags, e.target.value.trim()])]
                  }));
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <EnhancedTemplateEditor 
          template={template} 
          onTemplateChange={handleTemplateChange} 
        />
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/templates')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </div>
  );
};

export default TemplateEditor;
