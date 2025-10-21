import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import TemplateForm from './TemplateForm';

const CreateTemplate = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Create New Template</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <TemplateForm />
      </div>
    </div>
  );
};

export default CreateTemplate;
