import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvoices } from '../redux/invoiceSlice';
import { fetchPayments } from '../redux/paymentSlice';
import FinancialInsights from '../components/FinancialInsights';
import PaymentPredictor from '../components/PaymentPredictor';
import Loader from '../components/Loader';

const AIDashboard = () => {
  const dispatch = useDispatch();
  const { list: invoices, loading: invoicesLoading } = useSelector((state) => state.invoices);
  const { payments, status: paymentsStatus } = useSelector((state) => state.payments);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    if (invoices.length === 0) dispatch(fetchInvoices());
    if (paymentsStatus === 'idle') dispatch(fetchPayments());
  }, [dispatch, invoices.length, paymentsStatus]);
  
  if (invoicesLoading || paymentsStatus === 'loading') return <Loader />;
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
        <p className="mt-2 text-gray-600">Business analytics and predictions</p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {['overview', 'predictions', 'invoices'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${activeTab === tab 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <>
            <FinancialInsights 
              invoices={invoices} 
              payments={payments} 
            />
            <PaymentPredictor 
              payments={payments} 
              className="mt-8"
            />
          </>
        )}
        
        {activeTab === 'predictions' && (
          <PaymentPredictor payments={payments} />
        )}
        
        {activeTab === 'invoices' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Invoice Analysis</h2>
            <p className="text-gray-600">Invoice analysis features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDashboard;
