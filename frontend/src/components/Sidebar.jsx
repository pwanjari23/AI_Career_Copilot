import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Award,
  MessageSquare,
  TrendingUp,
  Compass,
  User,
  Settings,
  Shield,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText },
    { name: 'Job Matcher', path: '/job-analyzer', icon: Briefcase },
    { name: 'Mock Interview', path: '/mock-interview', icon: Award },
    { name: 'Career Chatbot', path: '/career-chatbot', icon: MessageSquare },
    { name: 'Skill Gap', path: '/skill-gap', icon: TrendingUp },
    { name: 'Roadmap', path: '/roadmap', icon: Compass },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    links.push({ name: 'Admin Panel', path: '/admin', icon: Shield });
  }

  const activeStyle = 'bg-primary-500 text-white shadow-sm';
  const inactiveStyle = 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100';

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-gray-950/30 dark:bg-black/50 backdrop-blur-sm lg:hidden transition-all duration-300"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-56 bg-white dark:bg-darkCard border-r border-gray-200/50 dark:border-gray-800/50 transform lg:translate-x-0 lg:static transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800/80">
          <NavLink to="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-black text-md shadow-sm">
              C
            </div>
            <span className="font-bold text-md text-gray-800 dark:text-white font-sans tracking-tight">
              CareerCopilot
            </span>
          </NavLink>
          
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-gray-105 dark:hover:bg-gray-800 lg:hidden text-gray-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={({ isActive }) =>
                `flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive ? activeStyle : inactiveStyle
                }`
              }
            >
              <link.icon className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Profile Info */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800/80">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 text-xs font-semibold transition-all duration-200"
          >
            <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
