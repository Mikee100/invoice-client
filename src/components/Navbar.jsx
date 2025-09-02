
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="w-full h-16 flex items-center justify-between px-6 shadow bg-white">
    <div className="font-bold text-xl">FreelancePay</div>
    <div className="flex gap-6">
      <Link to="/" className="hover:text-indigo-600">Dashboard</Link>
      <Link to="/create-invoice" className="hover:text-indigo-600">Create Invoice</Link>
      <Link to="/payments" className="hover:text-indigo-600">Payments</Link>
      <Link to="/clients" className="hover:text-indigo-600">Clients</Link>
      <Link to="/profile" className="hover:text-indigo-600">Profile</Link>
    </div>
  </nav>
);

export default Navbar;
