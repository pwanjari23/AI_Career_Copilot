import React from 'react';
import { Menu, Bell } from 'lucide-react';
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
        <div className="text-left">
          <h1 className="text-sm font-bold text-gray-800 dark:text-white hidden sm:block font-sans">
            Hello, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-[10px] text-gray-400 hidden sm:block font-sans font-light">
            Career Copilot active | {formattedDate}
          </p>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center space-x-3.5">
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-150 dark:bg-gray-800 text-gray-500 sm:hidden">
          {formattedDate}
        </span>

        {/* Notifications mock icon */}
        <button className="p-1.5 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 relative">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary-500 animate-ping" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
        </button>

        {/* Theme Toggle switch */}
        <ThemeToggle />

        {/* Profile Avatar indicator */}
        <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-gray-800 pl-3">
          <img
            src={user?.profileImage ? `http://localhost:5000${user.profileImage}` : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.fullName || 'Copilot'}`}
            alt="Profile Avatar"
            className="h-7 w-7 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50"
          />
          <span className="text-[10px] font-semibold text-gray-500 hidden md:block max-w-[90px] truncate">
            {user?.targetRole || 'Developer'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
