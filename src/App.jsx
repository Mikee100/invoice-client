import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import MpesaPaymentPage from './pages/MpesaPaymentPage';
import Payments from './pages/Payments';
import Clients from './pages/Clients';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import CreateProject from './pages/CreateProject';
import { getCurrentUser } from './redux/userSlice';
import ProjectDetails from './pages/ProjectDetails';

function PrivateRoute({ children }) {
  const user = useSelector(state => state.user.user);
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="*"
          element={
            <PrivateRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/create-invoice" element={<CreateInvoice />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/invoices/:id" element={<InvoiceDetail />} />
                    <Route path="/invoices/edit/:id" element={<CreateInvoice />} />
                    
                    <Route path="/mpesa-payment/:invoiceId" element={<MpesaPaymentPage />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<ProjectDetails />} />
                    <Route path="/create-project" element={<CreateProject />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </main>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
