import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div className="flex flex-col items-center flex-grow bg-gradient-to-b from-[#d4e6ff] to-white p-4 md:p-8 mx-4 my-4 rounded-lg mb-10">
      <Header />
      <div className="p-8 max-w-sm w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Login Coming Soon</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <label
              htmlFor="email"
              className="absolute left-3 top-1/2 text-gray-500 transition-all duration-200 transform -translate-y-1/2 scale-100 origin-left peer-focus:top-0 peer-focus:text-blue-500 peer-focus:scale-75 peer-focus:-translate-y-full peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2"
            >
              Email
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <label
              htmlFor="password"
              className="absolute left-3 top-1/2 text-gray-500 transition-all duration-200 transform -translate-y-1/2 scale-100 origin-left peer-focus:top-0 peer-focus:text-blue-500 peer-focus:scale-75 peer-focus:-translate-y-full peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2"
            >
              Password
            </label>
          </div>
          <Button type="submit" className="w-full bg-blue-400 text-white py-2 rounded-lg hover:bg-blue-500 transition-colors">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
