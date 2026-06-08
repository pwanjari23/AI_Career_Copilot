import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  
  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="glass-nav sticky top-0 z-30 flex items-center justify-between px-5 py-3 shadow-sm">
      {/* Mobile Toggler + Left Section */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-left flex items-center space-x-2">
          <h1 className="text-sm font-bold text-gray-800 dark:text-white hidden sm:block font-sans">
            Hello, {user?.fullName?.split(' ')[0]} 👋
          </h1>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center space-x-3.5">
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-150 dark:bg-gray-800 text-gray-500 sm:hidden">
          {formattedDate}
        </span>

        {/* Get Pro Access button */}
        {user && !user.isPro && (
          <Link
            to="/checkout"
            className="flex items-center space-x-1 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white rounded-lg shadow-md shadow-primary-500/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Sparkles className="h-3 w-3" />
            <span>Get Pro</span>
          </Link>
        )}


        {/* Theme Toggle switch */}
        <ThemeToggle />

        {/* Profile Avatar indicator */}
        <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-gray-800 pl-3">
          <img
            src={user?.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`) : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.fullName || 'Copilot'}`}
            alt="Profile Avatar"
            className={`h-7 w-7 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 border ${user?.isPro ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200/50 dark:border-gray-700/50'}`}
          />
          <span className="text-[10px] font-semibold text-gray-500 hidden md:block max-w-[120px] truncate">
            {user?.fullName}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
