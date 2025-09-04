import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/userSlice';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <aside className={`h-full bg-gradient-to-b from-indigo-50 to-white shadow-lg border-r border-gray-200 flex flex-col justify-between transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} min-h-screen`}> 
      <div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-4 mb-6 ml-2 p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition flex items-center justify-center"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16M10 6l-6 6 6 6" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m6-6l6 6-6 6" /></svg>
          )}
        </button>
        <ul className={`flex flex-col gap-2 ${collapsed ? 'items-center' : 'items-start'} transition-all`}>
          <li>
            <Link to="/" className={`group flex items-center gap-2 font-semibold hover:text-indigo-600 px-3 py-2 rounded-lg transition ${collapsed ? 'justify-center' : ''}`}> 
              <span className="material-icons" title="Dashboard">dashboard</span> {!collapsed && 'Dashboard'}
              {collapsed && <span className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition">Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link to="/invoices" className={`group flex items-center gap-2 hover:text-indigo-600 px-3 py-2 rounded-lg transition ${collapsed ? 'justify-center' : ''}`}> 
              <span className="material-icons" title="Invoices">receipt_long</span> {!collapsed && 'Invoices'}
              {collapsed && <span className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition">Invoices</span>}
            </Link>
          </li>
          <li>
            <Link to="/create-invoice" className={`group flex items-center gap-2 hover:text-indigo-600 px-3 py-2 rounded-lg transition ${collapsed ? 'justify-center' : ''}`}> 
              <span className="material-icons" title="Create Invoice">add_circle</span> {!collapsed && 'Create Invoice'}
              {collapsed && <span className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition">Create Invoice</span>}
            </Link>
          </li>
          <li>
            <Link to="/payments" className={`group flex items-center gap-2 hover:text-indigo-600 px-3 py-2 rounded-lg transition ${collapsed ? 'justify-center' : ''}`}> 
              <span className="material-icons" title="Payments">credit_card</span> {!collapsed && 'Payments'}
              {collapsed && <span className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition">Payments</span>}
            </Link>
          </li>
          <li>
            <Link to="/clients" className={`group flex items-center gap-2 hover:text-indigo-600 px-3 py-2 rounded-lg transition ${collapsed ? 'justify-center' : ''}`}> 
              <span className="material-icons" title="Clients">groups</span> {!collapsed && 'Clients'}
              {collapsed && <span className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition">Clients</span>}
            </Link>
          </li>
          <li>
            <Link to="/projects" className={`group flex items-center gap-2 hover:text-indigo-600 px-3 py-2 rounded-lg transition ${collapsed ? 'justify-center' : ''}`}> 
              <span className="material-icons" title="Projects">work</span> {!collapsed && 'Projects'}
              {collapsed && <span className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition">Projects</span>}
            </Link>
          </li>
          <li>
            <Link to="/profile" className={`group flex items-center gap-2 hover:text-indigo-600 px-3 py-2 rounded-lg transition ${collapsed ? 'justify-center' : ''}`}> 
              <span className="material-icons" title="Profile">person</span> {!collapsed && 'Profile'}
              {collapsed && <span className="absolute left-full ml-2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition">Profile</span>}
            </Link>
          </li>
        </ul>
      </div>
      <button
        onClick={handleLogout}
        className={`m-4 bg-red-500 text-white py-2 px-4 rounded-lg font-semibold shadow hover:bg-red-600 transition ${collapsed ? 'mx-auto px-2' : ''}`}
      >
        {!collapsed && 'Logout'}
        {collapsed && <span className="material-icons">logout</span>}
      </button>
    </aside>
  );
};

export default Sidebar;
