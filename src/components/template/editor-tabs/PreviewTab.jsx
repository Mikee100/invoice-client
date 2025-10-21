import React from 'react';
import { FiEye } from 'react-icons/fi';

const PreviewTab = ({ template }) => {
  return (
    <div className="p-4 h-full">
      <div className="flex items-center mb-4">
        <FiEye className="mr-2" />
        <h3 className="text-lg font-medium">Preview</h3>
      </div>
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{template.name}</h2>
          {template.category && (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {template.category}
            </span>
          )}
        </div>

        {template.description && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-gray-700">{template.description}</p>
          </div>
        )}

        {/* Content preview would go here */}
        <div className="bg-gray-50 p-4 rounded border border-dashed border-gray-200 text-center text-gray-500">
          Template content preview will be shown here
        </div>
      </div>
    </div>
  );
};

export default PreviewTab;