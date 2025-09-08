import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaFileInvoice, FaCog, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, getCurrentUser } from '../redux/userSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useSelector((state) => state.user);
  
  // Check if user is authenticated and has admin role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If we don't have a user but have a token, try to fetch the current user
        if (!user && localStorage.getItem('token')) {
          await dispatch(getCurrentUser()).unwrap();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear any invalid token
        localStorage.removeItem('token');
        navigate('/login', { state: { from: location } });
      }
    };

    checkAuth();
  }, [dispatch, user, navigate, location]);
  
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('You have been logged out');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const isActive = (path) => {
    return location.pathname.startsWith(`/admin/${path}`) 
      ? 'bg-indigo-700 text-white' 
      : 'text-gray-300 hover:bg-gray-700';
  };

  const menuItems = [
    { path: 'dashboard', icon: <FaTachometerAlt className="w-5 h-5" />, label: 'Dashboard' },
    { path: 'templates', icon: <FaFileInvoice className="w-5 h-5" />, label: 'Templates' },
    { path: 'users', icon: <FaUsers className="w-5 h-5" />, label: 'Users' },
    { path: 'settings', icon: <FaCog className="w-5 h-5" />, label: 'Settings' },
  ];
  
  // Show loading state while checking auth
  if (loading || (localStorage.getItem('token') && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="large" />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Redirect to home if not an admin
  if (user.role !== 'admin') {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-indigo-800">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            </div>
            <div className="mt-5 flex-1 flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={`/admin/${item.path}`}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                      isActive(item.path).includes('bg-indigo-700')
                        ? 'bg-indigo-700 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600 hover:bg-opacity-75'
                    }`}
                  >
                    <span className="mr-3">
                      {React.cloneElement(item.icon, {
                        className: `h-6 w-6 ${isActive(item.path).includes('bg-indigo-700') ? 'text-white' : 'text-indigo-300 group-hover:text-white'}`,
                        'aria-hidden': 'true'
                      })}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-indigo-700 p-4">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs font-medium text-indigo-200 group-hover:text-white">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto flex-shrink-0 p-1 rounded-full text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-800 focus:ring-white"
              >
                <FaSignOutAlt className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <nav className="flex justify-around items-center h-16">
          {menuItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={`/admin/${item.path}`}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive(item.path).includes('bg-indigo-700')
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {React.cloneElement(item.icon, {
                className: 'h-6 w-6',
                'aria-hidden': 'true'
              })}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => 
                  location.pathname.startsWith(`/admin/${item.path}`)
                )?.label || 'Dashboard'}
              </h2>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <Link 
                to="/" 
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaHome className="h-6 w-6" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
