import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const PaymentChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={320}>
    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barSize={40}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" tick={{ fontSize: 14, fill: '#6366F1' }} />
      <YAxis tick={{ fontSize: 14, fill: '#6366F1' }} />
      <Tooltip wrapperClassName="!rounded-xl !shadow-lg !bg-white !text-gray-800" />
      <Legend wrapperStyle={{ fontSize: 16 }} />
      <Bar dataKey="amount" fill="url(#colorUv)" radius={[8, 8, 0, 0]} />
      <defs>
        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#A5B4FC" stopOpacity={0.7} />
        </linearGradient>
      </defs>
    </BarChart>
  </ResponsiveContainer>
);

export default PaymentChart;
