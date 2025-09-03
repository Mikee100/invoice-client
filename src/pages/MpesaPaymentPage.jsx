import React from 'react';
import { useParams } from 'react-router-dom';

const MpesaPaymentPage = () => {
  const { invoiceId } = useParams();
  return (
    <div className="max-w-lg mx-auto mt-20 p-8 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-green-600">Mpesa Payment</h1>
      <p className="mb-4 text-lg">Thank you for choosing to pay via Mpesa.</p>
      <div className="mb-6">
        <strong>Invoice ID:</strong> {invoiceId}
      </div>
      <div className="mb-6">
        <p className="text-gray-700">A payment prompt has been sent to your phone number associated with this invoice.</p>
        <p className="text-gray-700 mt-2">Please check your Mpesa app and follow the instructions to complete the payment.</p>
      </div>
      <div className="mt-8">
        <p className="text-sm text-gray-500">If you did not receive a prompt, ensure your phone number is correct and try again, or contact support.</p>
      </div>
    </div>
  );
};

export default MpesaPaymentPage;
