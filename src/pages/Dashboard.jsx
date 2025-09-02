import React from 'react';
import PaymentChart from '../components/PaymentChart';
import InvoiceCard from '../components/InvoiceCard';

const mockInvoices = [
  { _id: '1', clientName: 'Acme Corp', amount: 1200, status: 'pending', dueDate: '2025-09-10' },
  { _id: '2', clientName: 'Beta LLC', amount: 800, status: 'paid', dueDate: '2025-08-20' },
];

const mockChartData = [
  { month: 'Jan', amount: 1200 },
  { month: 'Feb', amount: 800 },
  { month: 'Mar', amount: 1500 },
];

const Dashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
    <PaymentChart data={mockChartData} />
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
      {mockInvoices.map(inv => <InvoiceCard key={inv._id} invoice={inv} />)}
    </div>
  </div>
);

export default Dashboard;
