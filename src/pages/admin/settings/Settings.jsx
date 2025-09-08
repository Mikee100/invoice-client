import React, { useState } from 'react';
import { FiSave, FiMail, FiCreditCard, FiGlobe, FiLock, FiUsers } from 'react-icons/fi';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'Invoice Management',
    currency: 'KES',
    taxRate: 16,
    enable2FA: true,
    emailNotifications: true,
    paymentMethodMpesa: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full border rounded p-2"
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleChange}
                className="w-32 border rounded p-2"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="mpesa"
                name="paymentMethodMpesa"
                checked={settings.paymentMethodMpesa}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="mpesa" className="ml-2 block text-sm text-gray-700">
                Enable M-Pesa Payments
              </label>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoFactor"
                name="enable2FA"
                checked={settings.enable2FA}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="twoFactor" className="ml-2 block text-sm text-gray-700">
                Enable Two-Factor Authentication
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'general' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiGlobe className="inline-block mr-2" />
              General
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'payments' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiCreditCard className="inline-block mr-2" />
              Payments
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'security' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiLock className="inline-block mr-2" />
              Security
            </button>
          </nav>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {renderTabContent()}
            <div className="mt-8 pt-5 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiSave className="-ml-1 mr-2 h-5 w-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
