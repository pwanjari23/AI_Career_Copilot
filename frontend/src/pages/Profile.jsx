import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { AlertCircle, User, Briefcase, Award, CheckCircle, Upload } from 'lucide-react';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Populate form with current values
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setTargetRole(user.targetRole || '');
      setExperienceLevel(user.experienceLevel || 'Entry');
    }
  }, [user]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('targetRole', targetRole);
    formData.append('experienceLevel', experienceLevel);
    if (selectedFile) {
      formData.append('profileImage', selectedFile);
    }

    try {
      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUserProfile(res.data.data);
      setSuccess(true);
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold font-sans">Developer Profile</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Keep your target engineering title and experience levels up to date.
        </p>
      </div>

      <Card className="p-8">
        {success && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar upload */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <img
              src={user?.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`) : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.fullName || 'Copilot'}`}
              alt="Avatar Preview"
              className="h-20 w-20 rounded-2xl object-cover bg-gray-100 dark:bg-gray-800 border-2 border-primary-500/20"
            />
            <div className="text-center sm:text-left space-y-2">
              <label htmlFor="avatar-file" className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-xs font-bold inline-flex items-center cursor-pointer space-x-1.5 transition-colors">
                <Upload className="h-4 w-4" />
                <span>Upload New Photo</span>
              </label>
              <input
                id="avatar-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="text-xs text-primary-500 font-semibold mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
              <p className="text-[10px] text-gray-400">
                Supports JPG, PNG, WEBP. Max 2MB.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Target Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Briefcase className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Experience Level
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Award className="h-5 w-5" />
                </div>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="Entry">Entry (0-2 Years)</option>
                  <option value="Mid">Mid Level (2-5 Years)</option>
                  <option value="Senior">Senior Level (5-8 Years)</option>
                  <option value="Lead">Lead / Principal (8+ Years)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              loading={loading}
              className="w-full py-3"
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
