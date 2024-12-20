// src/components/ui/Menu.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, LogIn, Camera } from 'lucide-react';

const Menu = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-30 backdrop-blur-md shadow-md rounded-lg p-4 mb-4 my-2 max-w-max">
      <ul className="flex justify-center items-center space-x-6">
        <li>
          <Link
            to="/scan"
            className={`flex items-center transition-colors ${
              isActive('/scan') ? 'text-blue-500' : 'text-gray-800 hover:text-blue-500'
            }`}
          >
            <Home className="mr-2" size={20} /> Home
          </Link>
        </li>
        <li>
          <Link
            to="/about"
            className={`flex items-center transition-colors ${
              isActive('/about') ? 'text-blue-500' : 'text-gray-800 hover:text-blue-500'
            }`}
          >
            <Info className="mr-2" size={20} /> About
          </Link>
        </li>
        <li>
          <Link
            to="/login"
            className={`flex items-center transition-colors ${
              isActive('/login') ? 'text-blue-500' : 'text-gray-800 hover:text-blue-500'
            }`}
          >
            <LogIn className="mr-2" size={20} /> Login
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;