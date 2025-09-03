import React from 'react';
import PaymentChart from '../components/PaymentChart';
import InvoiceCard from '../components/InvoiceCard';
import api from '../services/api';

const mockInvoices = [
  { _id: '1', clientName: 'Acme Corp', amount: 1200, status: 'pending', dueDate: '2025-09-10' },
  { _id: '2', clientName: 'Beta LLC', amount: 800, status: 'paid', dueDate: '2025-08-20' },
];

const mockChartData = [
  { month: 'Jan', amount: 1200 },
  { month: 'Feb', amount: 800 },
  { month: 'Mar', amount: 1500 },
];

const Dashboard = () => {
  const [report, setReport] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchAIReport = async () => {
    setLoading(true);
    setError(null);
    setReport('');
    try {
      const res = await api.post('/ai/report');
      setReport(res.data.report);
    } catch (err) {
      setError('Failed to fetch AI report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <button
        onClick={fetchAIReport}
        className="bg-indigo-600 text-white py-2 px-6 rounded mb-6"
        disabled={loading}
      >
        {loading ? 'Generating AI Report...' : 'Generate AI Invoice Report'}
      </button>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {report && (
        <div className="mt-6 p-4 bg-gray-50 rounded border">
          <h2 className="text-xl font-semibold mb-2">AI Insights</h2>
          <pre className="whitespace-pre-wrap text-gray-800">{report}</pre>
        </div>
      )}
      <PaymentChart data={mockChartData} />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
        {mockInvoices.map(inv => <InvoiceCard key={inv._id} invoice={inv} />)}
      </div>
    </div>
  );
};

export default Dashboard;
