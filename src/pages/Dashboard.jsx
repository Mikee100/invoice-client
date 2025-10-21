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
  const [stats, setStats] = React.useState({
    user: { name: 'User', role: 'User' },
    invoices: { total: 0, amount: 0, paid: 0, unpaid: 0, recent: [] },
    payments: { total: 0, amount: 0, recent: [] },
    clients: { total: 0, recent: [] },
    projects: { total: 0, recent: [] }
  });
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
        setStats(prev => ({
          ...prev,
          ...res.data,
          user: res.data.user || { name: 'User', role: 'User' }
        }));
      } catch (err) {
        setError('Failed to fetch dashboard stats');
        console.error('Error fetching dashboard stats:', err);
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
      console.error('Error fetching AI report:', err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  const { user, invoices, payments, clients, projects } = stats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.role || 'User'}</p>
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
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'User'}!</h2>
              <p className="opacity-90">Here's what's happening with your business today.</p>
            </div>
            <button
              onClick={fetchAIReport}
              disabled={aiLoading}
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {aiLoading ? 'Generating...' : (
                <>
                  <SparklesIcon className="-ml-1 mr-2 h-5 w-5" />
                  Generate AI Report
                </>
              )}
            </button>
          </div>
          {report && (
            <div className="mt-4 p-4 bg-white bg-opacity-10 rounded-lg">
              <p className="text-sm">{report}</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Invoices Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {invoices?.total?.toLocaleString() || '0'}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <ArrowTrendingUpIcon className="h-4 w-4" />
                        <span className="sr-only">Increased by</span>
                        12%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/invoices" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View all
                </a>
              </div>
            </div>
          </div>

          {/* Payments Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <CreditCardIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        ${payments?.amount?.toLocaleString() || '0'}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <ArrowTrendingUpIcon className="h-4 w-4" />
                        <span className="sr-only">Increased by</span>
                        8.2%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/payments" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View all
                </a>
              </div>
            </div>
          </div>

          {/* Clients Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {clients?.total?.toLocaleString() || '0'}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <ArrowTrendingUpIcon className="h-4 w-4" />
                        <span className="sr-only">Increased by</span>
                        5.4%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/clients" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View all
                </a>
              </div>
            </div>
          </div>

          {/* Projects Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <BriefcaseIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {projects?.total?.toLocaleString() || '0'}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                        <ArrowTrendingDownIcon className="h-4 w-4" />
                        <span className="sr-only">Decreased by</span>
                        3.2%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/projects" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View all
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Payment Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
            <div className="h-80">
              <PaymentChart />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Invoices</h3>
            <div className="space-y-4">
              {invoices?.recent?.length > 0 ? (
                invoices.recent.map((invoice) => (
                  <InvoiceCard key={invoice._id} invoice={invoice} />
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent invoices</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;