import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// Lazy load components for better performance
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const TemplateManager = lazy(() => import('./components/template/TemplateManager'));
const TemplateEditor = lazy(() => import('./components/template/TemplateEditor'));
const TemplatePreview = lazy(() => import('./components/template/TemplatePreview'));
const CreateTemplate = lazy(() => import('./pages/admin/templates/CreateTemplate'));
const FreelancerTemplates = lazy(() => import('./pages/FreelancerTemplates'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UserManager = lazy(() => import('./pages/admin/UserManager'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Public routes that don't require authentication
const publicRoutes = [
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password/:token', element: <ResetPassword /> },
  { path: '/templates/preview/:id', element: <TemplatePreview /> },
];

// Protected routes that require authentication
const protectedRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/profile', element: <Profile /> },
  { path: '/settings', element: <Settings /> },
  { path: '/templates', element: <FreelancerTemplates /> },
  { path: '/templates/manage', element: <TemplateManager /> },
  { path: '/templates/new', element: <CreateTemplate /> },
  { path: '/templates/edit/:id', element: <TemplateEditor /> },
];

// Admin routes with admin layout
const adminRoutes = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: 'dashboard', element: <AdminDashboard /> },
  { path: 'templates', element: <TemplateManager /> },
  { path: 'templates/new', element: <CreateTemplate /> },
  { path: 'users', element: <UserManager /> },
  { path: 'settings', element: <AdminSettings /> },
];

// 404 route
const notFoundRoute = { path: '*', element: <NotFound /> };

export { publicRoutes, protectedRoutes, adminRoutes, notFoundRoute };
