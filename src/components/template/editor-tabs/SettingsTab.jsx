import React from 'react';
import { FiSettings, FiTrash2, FiTag, FiGlobe, FiLock } from 'react-icons/fi';

const SettingsTab = ({ template, onTemplateChange }) => {
  const handleChange = (field, value) => {
    onTemplateChange({
      ...template,
      [field]: value
    });
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center mb-6">
        <FiSettings className="mr-2" />
        <h3 className="text-lg font-medium">Template Settings</h3>
      </div>
      
      <div className="space-y-8">
        {/* Visibility Settings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium mb-3 flex items-center">
            <FiGlobe className="mr-2" />
            Visibility
          </h4>
          <div className="space-y-3 pl-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="visibility"
                checked={!template.isPublic}
                onChange={() => handleChange('isPublic', false)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">
                <span className="font-medium">Private</span>
                <p className="text-sm text-gray-500">Only you can see and use this template</p>
              </span>
            </label>
            
            <label className="flex items-start">
              <input
                type="radio"
                name="visibility"
                checked={template.isPublic}
                onChange={() => handleChange('isPublic', true)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
              />
              <span className="ml-2 text-gray-700">
                <span className="font-medium">Public</span>
                <p className="text-sm text-gray-500">All users can see and use this template</p>
              </span>
            </label>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium mb-3 flex items-center">
            <FiTag className="mr-2" />
            Tags
          </h4>
          <div className="pl-6">
            <input
              type="text"
              placeholder="Add tags separated by commas"
              value={Array.isArray(template.tags) ? template.tags.join(', ') : ''}
              onChange={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag);
                handleChange('tags', tags);
              }}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Use tags to organize your templates (e.g., "invoice, business, legal")
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <h4 className="text-md font-medium text-red-800 mb-3 flex items-center">
            <FiTrash2 className="mr-2" />
            Danger Zone
          </h4>
          <div className="pl-6">
            <p className="text-sm text-red-600 mb-3">
              Once you delete this template, there is no going back. Please be certain.
            </p>
            <button
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
                  // Handle delete action here
                  console.log('Deleting template:', template._id);
                }
              }}
              disabled={!template._id} // Disable if it's a new template
            >
              Delete this template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
