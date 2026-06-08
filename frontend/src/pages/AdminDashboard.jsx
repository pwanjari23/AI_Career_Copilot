import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { Users, FileText, Award, ShieldAlert, Sparkles, CheckCircle, Trash2, Ban } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // Client-Side Security Guard
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data.data);
      setUsersList(usersRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrative details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleBlock = async (userId) => {
    setError(null);
    try {
      const res = await api.put(`/admin/users/${userId}/block`);
      // Update local state
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isBlocked: res.data.data.isBlocked } : u))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user block status.');
    }
  };
 
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setError(null);
    
    try {
      await api.delete(`/admin/users/${userToDelete}`);
      setUsersList((prev) => prev.filter((u) => u.id !== userToDelete));
      setUserToDelete(null);
      // Refresh stats count
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
      setUserToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <p className="text-sm animate-pulse">Loading administrative analytics...</p>
      </div>
    );
  }

  const { cards } = stats || {
    cards: { totalUsers: 0, totalResumes: 0, totalInterviews: 0, avgAtsScore: 0, avgInterviewScore: 0 },
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-sans flex items-center space-x-2">
          <ShieldAlert className="h-6 w-6 text-primary-500" />
          <span>Admin Command Center</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Monitor global registration metrics, inspect user data, and configure account access.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-bold mt-1">{cards.totalUsers}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">CVs Uploaded</p>
            <p className="text-2xl font-bold mt-1">{cards.totalResumes}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Interviews</p>
            <p className="text-2xl font-bold mt-1">{cards.totalInterviews}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Avg ATS</p>
            <p className="text-2xl font-bold mt-1">{cards.avgAtsScore}%</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Avg Grade</p>
            <p className="text-2xl font-bold mt-1">{cards.avgInterviewScore}%</p>
          </div>
        </Card>
      </div>

      {/* Users table */}
      <Card className="overflow-hidden p-0 border border-gray-200/50 dark:border-gray-800/50 rounded-3xl">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800/80 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Registered Accounts</h3>
          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-950/20 text-primary-500 rounded-full text-xs font-semibold">
            {usersList.length} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/40 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Target Job</th>
                <th className="px-6 py-4">Experience</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {usersList.map((usr) => (
                <tr key={usr.id} className="hover:bg-gray-50/20 dark:hover:bg-gray-800/10 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{usr.id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">{usr.fullName}</td>
                  <td className="px-6 py-4 font-light text-gray-500 dark:text-gray-400">{usr.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                      usr.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {usr.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 truncate max-w-[150px]" title={usr.targetRole}>
                    {usr.targetRole || 'Not set'}
                  </td>
                  <td className="px-6 py-4">{usr.experienceLevel || 'Not set'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      usr.isBlocked ? 'bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {usr.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {usr.role !== 'admin' && (
                      <>
                        <button
                          onClick={() => handleToggleBlock(usr.id)}
                          className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors inline-flex ${
                            usr.isBlocked ? 'text-emerald-500' : 'text-amber-500'
                          }`}
                          title={usr.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setUserToDelete(usr.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500 transition-colors inline-flex"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Custom Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6 max-w-sm w-full shadow-2xl animate-scale-in text-center space-y-4">
            <div className="mx-auto h-12 w-12 bg-red-100 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete User Account?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Are you sure you want to permanently delete this user? All associated resumes, interviews, chatbot logs and roadmaps will be deleted. This action cannot be undone.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setUserToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 rounded-xl"
                onClick={handleDeleteUser}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
