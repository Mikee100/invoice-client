import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InvoiceList from '../pages/invoices/InvoiceList';
import CreateInvoice from '../pages/invoices/CreateInvoice';
import EditInvoice from '../pages/invoices/EditInvoice';
import ViewInvoice from '../pages/invoices/ViewInvoice';
import RecurringInvoices from '../pages/RecurringInvoices';

const InvoiceRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<InvoiceList />} />
      <Route path="/recurring" element={<RecurringInvoices />} />
      <Route path="/new" element={<CreateInvoice />} />
      <Route path="/:id" element={<ViewInvoice />} />
      <Route path="/:id/edit" element={<EditInvoice />} />
    </Routes>
  );
};

export default InvoiceRoutes;
