import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import InvoiceForm from '../../components/invoices/InvoiceForm';

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    toast.success('Invoice updated successfully');
    navigate(`/invoices/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Invoice</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <InvoiceForm isEdit={true} onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default EditInvoice;
