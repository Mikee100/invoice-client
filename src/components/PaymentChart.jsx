import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PaymentChart = ({ data }) => (
  <div className="bg-white p-4 rounded shadow">
    <h2 className="font-bold mb-2">Income Analytics</h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="amount" fill="#4F46E5" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default PaymentChart;
