import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label="Toggle theme mode"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-amber-500 animate-spin-slow" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700" />
      )}
    </button>
  );
};

export default ThemeToggle;
