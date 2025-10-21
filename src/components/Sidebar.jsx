import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/userSlice';
import { 
  
  FiGrid, 
  FiFileText, 
  FiPlusCircle, 
  FiCreditCard, 
  FiUsers, 
  FiBriefcase, 
  FiUser, 
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiBarChart2,
  FiSettings,
  FiDroplet
} from 'react-icons/fi';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mainNavItems = [
    { to: '/', icon: <FiGrid size={20} />, label: 'Dashboard' },
    { to: '/invoices', icon: <FiFileText size={20} />, label: 'Invoices' },
    { to: '/invoices/recurring', icon: <FiFileText size={20} />, label: 'Recurring Invoices' },
    { to: '/invoices/new', icon: <FiPlusCircle size={20} />, label: 'Create Invoice' },
    { to: '/payments', icon: <FiCreditCard size={20} />, label: 'Payments' },
    { to: '/clients', icon: <FiUsers size={20} />, label: 'Clients' },
    { to: '/projects', icon: <FiBriefcase size={20} />, label: 'Projects' },
    { to: '/ai-dashboard', icon: <FiBarChart2 size={20} />, label: 'AI Insights' },
  ];

  const settingsNavItems = [
    { to: '/profile', icon: <FiUser size={20} />, label: 'Profile' },
    { to: '/settings/appearance', icon: <FiDroplet size={20} />, label: 'Appearance' },
  ];

  const isActive = (path) => {
    return location.pathname === path ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50';
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <aside 
      className={`h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo / Collapse Button */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} h-16 px-4 border-b border-gray-100`}>
        {!collapsed && (
          <h1 className="text-xl font-bold text-indigo-600">InvoicePro</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-6">
          <div>
            <h3 className={`px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider ${collapsed ? 'hidden' : ''}`}>
              Main
            </h3>
            <ul className="mt-2 space-y-1">
              {mainNavItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`group flex items-center ${
                      collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                    } rounded-lg text-sm font-medium ${isActive(item.to)} transition-colors`}
                  >
                    <span className={`${!collapsed ? 'mr-3' : ''}`}>
                      {React.cloneElement(item.icon, {
                        className: `flex-shrink-0 ${isActive(item.to).includes('text-indigo-600') ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`
                      })}
                    </span>
                    {!collapsed && item.label}
                    {collapsed && (
                      <span className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider ${collapsed ? 'hidden' : ''}`}>
              Settings
            </h3>
            <ul className="mt-2 space-y-1">
              {settingsNavItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`group flex items-center ${
                      collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                    } rounded-lg text-sm font-medium ${isActive(item.to)} transition-colors`}
                  >
                    <span className={`${!collapsed ? 'mr-3' : ''}`}>
                      {React.cloneElement(item.icon, {
                        className: `flex-shrink-0 ${isActive(item.to).includes('text-indigo-600') ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`
                      })}
                    </span>
                    {!collapsed && item.label}
                    {collapsed && (
                      <span className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* User & Logout */}
      <div className={`border-t border-gray-100 p-4 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${
            collapsed ? 'justify-center' : 'justify-between px-3'
          } py-2 text-sm font-medium text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors`}
        >
          <FiLogOut size={18} className={collapsed ? '' : 'mr-2'} />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
