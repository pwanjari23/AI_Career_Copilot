import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CheckCircle, AlertCircle, Sun, Moon, Bell, Key } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post('/auth/reset-password', { email: user.email, password });
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold font-sans">Settings Panel</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Customize notifications, manage security passwords, and toggle theme settings.
        </p>
      </div>

      {/* Theme Card */}
      <Card className="space-y-4">
        <h3 className="text-lg font-bold flex items-center space-x-2">
          {theme === 'dark' ? <Moon className="h-5 w-5 text-indigo-500" /> : <Sun className="h-5 w-5 text-amber-500" />}
          <span>Theme Customization</span>
        </h3>
        <p className="text-xs text-gray-500">
          Switch between responsive light and dark theme mode values.
        </p>
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800">
          <span className="text-sm font-semibold">Dark theme mode active</span>
          <button
            onClick={toggleTheme}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              theme === 'dark' ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Notification Card */}
      <Card className="space-y-4">
        <h3 className="text-lg font-bold flex items-center space-x-2">
          <Bell className="h-5 w-5 text-primary-500" />
          <span>Notification Preferences</span>
        </h3>
        <p className="text-xs text-gray-500">
          Toggle channel notification settings.
        </p>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 text-sm font-light">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary-500 border-gray-300" />
            <span>Email notifications on mock interview feedbacks</span>
          </label>
          <label className="flex items-center space-x-3 text-sm font-light">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary-500 border-gray-300" />
            <span>Weekly career activity newsletter reports</span>
          </label>
        </div>
      </Card>

      {/* Security Update Card */}
      <Card className="space-y-4">
        <h3 className="text-lg font-bold flex items-center space-x-2">
          <Key className="h-5 w-5 text-red-500" />
          <span>Change Password</span>
        </h3>

        {success && (
          <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
            Password updated successfully.
          </div>
        )}

        {error && (
          <div className="p-3 text-xs bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" loading={loading}>
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Settings;
