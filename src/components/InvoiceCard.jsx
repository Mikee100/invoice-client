import React from 'react';

const InvoiceCard = ({ invoice }) => (
  <div className="border rounded p-4 shadow mb-4 bg-white">
    <h3 className="font-bold">Invoice #{invoice._id}</h3>
    <p>Client: {invoice.clientName}</p>
    <p>Amount: ${invoice.amount}</p>
    <p>Status: {invoice.status}</p>
    <p>Due: {invoice.dueDate}</p>
  </div>
);

export default InvoiceCard;
