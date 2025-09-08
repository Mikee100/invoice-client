import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { generateFinancialSummary } from '../utils/invoiceAnalyzer';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const FinancialInsights = ({ invoices = [], payments = [] }) => {
  const [summary, setSummary] = useState(null);
  const [timeRange, setTimeRange] = useState('6m'); // 1m, 3m, 6m, 1y, all
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (invoices && payments) {
        // Ensure we have the expected data structure
        const formattedInvoices = Array.isArray(invoices) ? invoices : [];
        const formattedPayments = Array.isArray(payments) ? payments : [];
        
        const filteredInvoices = filterByTimeRange(formattedInvoices, timeRange);
        const filteredPayments = filterByTimeRange(formattedPayments, timeRange);
        
        setSummary(generateFinancialSummary(filteredInvoices, filteredPayments));
        setError(null);
      }
    } catch (err) {
      console.error('Error generating financial insights:', err);
      setError('Failed to generate financial insights. Please try again later.');
    }
  }, [invoices, payments, timeRange]);

  const filterByTimeRange = (items, range) => {
    const now = new Date();
    let fromDate = new Date();
    
    switch(range) {
      case '1m':
        fromDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        fromDate.setMonth(now.getMonth() - 3);
        break;
      case '1y':
        fromDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        return items; // No filter
    }
    
    return items.filter(item => new Date(item.date || item.issueDate) >= fromDate);
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Prepare data for charts
  const monthlyData = {
    labels: Object.keys(summary.byMonth),
    datasets: [
      {
        label: 'Revenue by Month',
        data: Object.values(summary.byMonth),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const paymentMethodsData = {
    labels: Object.keys(summary.paymentMethods),
    datasets: [
      {
        data: Object.values(summary.paymentMethods),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Financial Insights</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        >
          <option value="1m">Last Month</option>
          <option value="3m">Last 3 Months</option>
          <option value="6m">Last 6 Months</option>
          <option value="1y">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Invoiced</h3>
          <p className="text-2xl font-bold">${summary.totalInvoiced.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Received</h3>
          <p className="text-2xl font-bold text-green-600">${summary.totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Outstanding</h3>
          <p className="text-2xl font-bold text-red-600">${summary.outstanding.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <Line 
              data={monthlyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `$${value.toLocaleString()}`
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => `$${context.parsed.y.toLocaleString()}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
          <div className="h-64 flex items-center justify-center">
            <Pie 
              data={paymentMethodsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialInsights;
