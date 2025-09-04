import React from 'react';
import Loader from '../components/Loader';
import PaymentChart from '../components/PaymentChart';
import InvoiceCard from '../components/InvoiceCard';
import api from '../services/api';
import { 
  UserIcon, 
  DocumentTextIcon, 
  CreditCardIcon, 
  BriefcaseIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [report, setReport] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('overview');

  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/auth/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        setError('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const fetchAIReport = async () => {
    setAiLoading(true);
    setError(null);
    setReport('');
    try {
      const res = await api.post('/ai/report');
      setReport(res.data.report);
    } catch (err) {
      setError('Failed to fetch AI report');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{stats.user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{stats.user?.role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {stats.user?.name || 'User'}!</h2>
              <p className="opacity-90">Here's what's happening with your business today.</p>
            </div>
            <button
              onClick={fetchAIReport}
              className="mt-4 md:mt-0 flex items-center bg-white text-indigo-600 font-medium py-2 px-4 rounded-lg shadow hover:bg-gray-100 transition-colors"
              disabled={aiLoading}
            >
              {aiLoading ? (
                <Loader size="small" />
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  AI Insights
                </>
              )}
            </button>
          </div>
        </div>

        {stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-indigo-100">
                    <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Invoices</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.invoices.total}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <div className="flex-1">
                    <p className="text-gray-500">Total Amount</p>
                    <p className="font-medium">${stats.invoices.amount}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stats.invoices.paid > stats.invoices.unpaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {stats.invoices.paid > stats.invoices.unpaid ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                      )}
                      {Math.round((stats.invoices.paid / stats.invoices.total) * 100)}% Paid
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <CreditCardIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Payments</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.payments.total}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Total Processed</p>
                  <p className="font-medium">${stats.payments.amount}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Clients</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.clients.total}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="font-medium">{stats.clients.total} Clients</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <BriefcaseIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Projects</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.projects.total}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="font-medium">{stats.projects.total} Projects</p>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Income Analytics</h2>
                <div className="flex space-x-2">
                  <button className={`px-3 py-1 text-sm rounded-lg ${activeTab === 'overview' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => setActiveTab('overview')}>
                    Overview
                  </button>
                  <button className={`px-3 py-1 text-sm rounded-lg ${activeTab === 'detailed' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => setActiveTab('detailed')}>
                    Detailed
                  </button>
                </div>
              </div>
              <PaymentChart 
                data={stats.invoices.recent.map(inv => ({
                  month: new Date(inv.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' }),
                  amount: inv.amount
                }))} 
              />
            </div>

            {/* AI Report Section */}
            {report && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <SparklesIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  AI Insights
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {report}
                </div>
              </div>
            )}

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Invoices */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h2>
                <div className="space-y-4">
                  {stats.invoices.recent.slice(0, 5).map(inv => (
                    <InvoiceCard key={inv._id} invoice={inv} />
                  ))}
                </div>
                <button className="mt-4 w-full text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium py-2">
                  View all invoices →
                </button>
              </div>

              {/* Recent Payments */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h2>
                <div className="divide-y divide-gray-200">
                  {stats.payments.recent.slice(0, 5).map(pay => (
                    <div key={pay._id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">${pay.amountPaid}</p>
                          <p className="text-sm text-gray-500">Invoice #{pay.invoiceId}</p>
                        </div>
                        <span className="text-sm text-gray-500">{new Date(pay.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium py-2">
                  View all payments →
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;