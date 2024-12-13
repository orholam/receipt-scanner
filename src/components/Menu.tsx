// src/components/ui/Menu.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Info, LogIn, Camera } from 'lucide-react';

const Menu = () => {
  return (
    <nav className="bg-indigo-200 p-4">
      <ul className="flex justify-center space-x-4">
        <li><Camera className="text-black mr-4" /></li>
        <li><Link to="/" className="text-black">Home</Link></li>
        <li><Link to="/about" className="text-black">About</Link></li>
        <li><Link to="/login" className="text-black">Login</Link></li>
      </ul>
    </nav>
  );
};

export default Menu;