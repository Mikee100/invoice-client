import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFilter, FiSearch, FiDownload, FiEye, FiCopy } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getTemplates, getTemplatesByCategory } from '../../services/templateService';

const FreelancerTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await getTemplates();
        setTemplates(response.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map(t => t.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast.error('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    const filterTemplates = async () => {
      try {
        setLoading(true);
        let response;
        
        if (category === 'all') {
          response = await getTemplates();
        } else {
          response = await getTemplatesByCategory(category);
        }
        
        setTemplates(response.data);
      } catch (error) {
        console.error('Error filtering templates:', error);
        toast.error('Failed to filter templates');
      } finally {
        setLoading(false);
      }
    };

    filterTemplates();
  }, [category]);

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUseTemplate = (templateId) => {
    // Navigate to create invoice with template ID
    // This will be implemented based on your routing
    console.log('Using template:', templateId);
    toast.success('Template applied successfully');
  };

  const handlePreview = (template) => {
    // Show preview modal or navigate to preview page
    console.log('Preview template:', template._id);
    // This would typically open a modal or navigate to a preview page
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Templates Gallery</h1>
        <p className="mt-2 text-sm text-gray-600">
          Choose from our collection of professional templates to get started quickly
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full sm:w-64">
          <div className="relative">
            <select
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FiFilter className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                  {!template.isPublic && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Private
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {template.description || 'No description available'}
                </p>
                {template.tags && template.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                        +{template.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  {new Date(template.createdAt).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePreview(template)}
                    className="p-2 text-gray-500 hover:text-blue-600 focus:outline-none"
                    title="Preview"
                  >
                    <FiEye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template._id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiCopy className="mr-1.5 h-3 w-3" />
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'No templates match your search. Try different keywords.'
              : 'There are currently no templates available in this category.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FreelancerTemplates;
