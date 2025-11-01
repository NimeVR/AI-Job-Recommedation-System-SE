import React from 'react';
import { LogOut } from 'lucide-react';

const NavBar = ({ onLogout }) => {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        JobMatch
      </h1>
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </nav>
  );
};

export default NavBar;