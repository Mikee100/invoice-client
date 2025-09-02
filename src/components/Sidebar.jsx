

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/userSlice';

const Sidebar = () => {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <aside className="w-64 h-full bg-gray-100 p-4 shadow flex flex-col justify-between">
      <div>
        <ul className="flex flex-col gap-4">
          <li>
            <Link to="/" className="font-semibold hover:text-indigo-600">Dashboard</Link>
          </li>
          <li>
            <Link to="/create-invoice" className="hover:text-indigo-600">Create Invoice</Link>
          </li>
          <li>
            <Link to="/payments" className="hover:text-indigo-600">Payments</Link>
          </li>
          <li>
            <Link to="/clients" className="hover:text-indigo-600">Clients</Link>
          </li>
          <li>
            <Link to="/profile" className="hover:text-indigo-600">Profile</Link>
          </li>
        </ul>
      </div>
      <button
        onClick={handleLogout}
        className="mt-8 bg-red-500 text-white py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
