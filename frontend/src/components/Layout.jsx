import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-darkBg transition-colors duration-300">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-12 w-12 rounded-full border-4 border-primary-500/20 animate-pulse-slow" />
          <div className="h-9 w-9 rounded-full border-t-4 border-l-4 border-primary-500 animate-spin" />
        </div>
        <p className="mt-3 font-semibold text-gray-500 dark:text-gray-400 font-sans text-xs tracking-wide">
          Syncing with Career Copilot...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-darkBg transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-5 no-scrollbar bg-gray-50 dark:bg-darkBg">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
