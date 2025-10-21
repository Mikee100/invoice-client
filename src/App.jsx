import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Common Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// User Pages
import Dashboard from './pages/Dashboard';
import MpesaPaymentPage from './pages/MpesaPaymentPage';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Profile from './pages/Profile';
import FreelancerTemplates from './pages/freelancer/Templates';
import Clients from './pages/Clients';


// Invoice Pages
import InvoiceRoutes from './routes/invoiceRoutes.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import TemplateManager from './pages/admin/templates/TemplateManager';
import AdminTemplateEditor from './pages/admin/templates/TemplateEditor';
import UserManager from './pages/admin/users/UserManager';
import AdminSettings from './pages/admin/settings/Settings';
import DebugAuth from './pages/DebugAuth';

import { getCurrentUser } from './redux/userSlice';


function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, loading, isAuthenticated } = useSelector((state) => ({
    user: state.user.user,
    loading: state.user.loading,
    isAuthenticated: state.user.isAuthenticated
  }));
  
  // Check if user is authenticated on app load
  useEffect(() => {
    console.log('App mounted, checking authentication...');
    console.log('Current path:', location.pathname);
    
    const checkAuth = async () => {
      const token = localStorage.getItem('invoice_management_token');
      console.log('Current token:', token || 'No token found');
      
      if (!token) {
        console.log('No token found, checking if we need to redirect to login');
        const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
        if (!publicPaths.includes(location.pathname)) {
          console.log('Not a public path, redirecting to login');
          navigate('/login', { 
            replace: true, 
            state: { from: location.pathname } 
          });
        }
        return;
      }
      
      try {
        console.log('Dispatching getCurrentUser...');
        const resultAction = await dispatch(getCurrentUser());
        
        if (getCurrentUser.fulfilled.match(resultAction)) {
          const user = resultAction.payload;
          console.log('User authenticated:', { id: user?._id, role: user?.role });
          
          // If we're on login/register page and already authenticated, redirect to appropriate dashboard
          if (['/login', '/register'].includes(location.pathname)) {
            const redirectPath = user?.role === 'admin' 
              ? '/admin/dashboard' 
              : user?.role === 'freelancer' 
                ? '/freelancer/dashboard' 
                : '/';
            console.log('Already authenticated, redirecting to:', redirectPath);
            navigate(redirectPath, { replace: true });
          }
        } else {
          console.log('Failed to authenticate user, clearing token');
          localStorage.removeItem('invoice_management_token');
          if (location.pathname !== '/login' && location.pathname !== '/register') {
            navigate('/login', { 
              replace: true, 
              state: { from: location.pathname } 
            });
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('invoice_management_token');
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login', { 
            replace: true, 
            state: { from: location.pathname } 
          });
        }
      }
    };
    
    checkAuth();
  }, [dispatch, navigate, location]);

  // Only show loading if we have a token and we're still loading
  const initialLoading = loading && localStorage.getItem('invoice_management_token');
  
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />} />
      <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected Routes */}
      <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" state={{ from: window.location.pathname }} replace />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/freelancer/dashboard" element={<Dashboard />} />
        <Route path="/invoices/*" element={<InvoiceRoutes />} />
        <Route path="/mpesa-payment/:invoiceId" element={<MpesaPaymentPage />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/templates" element={<FreelancerTemplates />} />
        <Route path="/templates/manage" element={<TemplateManager />} />
         <Route path='/clients' element={<Clients />} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <AdminLayout /> : <Navigate to="/unauthorized" replace />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="templates" element={<TemplateManager />} />
        <Route path="templates/new" element={<AdminTemplateEditor />} />
        <Route path="templates/edit/:id" element={<AdminTemplateEditor />} />
        <Route path="users" element={<UserManager />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      
      {/* Debug Route */}
      <Route path="/debug/auth" element={<DebugAuth />} />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
