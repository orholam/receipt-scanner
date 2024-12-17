// src/components/ui/Menu.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Info, LogIn, Camera } from 'lucide-react';

const Menu = () => {
  return (
    <nav className="bg-white shadow-md rounded-lg p-4 mx-4 my-2">
      <ul className="flex justify-center items-center space-x-6">
        <li>
          <Link to="/" className="flex items-center text-gray-800 hover:text-indigo-500 transition-colors">
            <Home className="mr-2" size={20} /> Home
          </Link>
        </li>
        <li>
          <Link to="/about" className="flex items-center text-gray-800 hover:text-indigo-500 transition-colors">
            <Info className="mr-2" size={20} /> About
          </Link>
        </li>
        <li>
          <Link to="/login" className="flex items-center text-gray-800 hover:text-indigo-500 transition-colors">
            <LogIn className="mr-2" size={20} /> Login
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;