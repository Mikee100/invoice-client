
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import Invoices from './pages/Invoices';
import MpesaPaymentPage from './pages/MpesaPaymentPage';
import Payments from './pages/Payments';
import Clients from './pages/Clients';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import { getCurrentUser } from './redux/userSlice';

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
                    <Route path="/mpesa-payment/:invoiceId" element={<MpesaPaymentPage />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/clients" element={<Clients />} />
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
