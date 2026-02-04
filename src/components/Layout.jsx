import React from 'react';
import Navigation from './Navigation';
import { Toaster } from './ui/toaster';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="pt-20">
        {children}
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;