import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on app initialization
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/profile');
        setUser(response.data.data);
      } catch (err) {
        console.error('Initial session fetch failed:', err.message);
        localStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, accessToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      setUser(null);
      localStorage.removeItem('accessToken');
      const errorMsg = err.response?.data?.errors
        ? err.response.data.errors.map((e) => e.message).join(', ')
        : err.response?.data?.message;
      throw errorMsg || 'Login failed. Check your credentials.';
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { fullName, email, password });
      const { user: userData, accessToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      setUser(null);
      localStorage.removeItem('accessToken');
      const errorMsg = err.response?.data?.errors
        ? err.response.data.errors.map((e) => e.message).join(', ')
        : err.response?.data?.message;
      throw errorMsg || 'Registration failed.';
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API failed, forcing state cleanup anyway');
    } finally {
      localStorage.removeItem('accessToken');
      disconnectSocket();
      setUser(null);
      setLoading(false);
      window.location.href = '/login';
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
