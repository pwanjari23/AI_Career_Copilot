import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';
import api from '../services/api';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Forgot password states
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    try {
      await login(data.email, data.password);
      navigate(redirect || '/dashboard');
    } catch (err) {
      setApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    setLoading(true);
    setApiError(null);
    try {
      await loginWithGoogle(response.credential);
      navigate(redirect || '/dashboard');
    } catch (err) {
      setApiError(err);
    } finally {
      setLoading(false);
    }
  };

  /* global google */
  useEffect(() => {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });
      google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        { theme: 'outline', size: 'large', width: '100%' }
      );
    }
  }, [loginWithGoogle, redirect, navigate]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMsg(res.data.message);
    } catch (err) {
      setForgotMsg(err.response?.data?.message || 'Password reset request failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">
      {/* Theme Toggle in top corner of form side */}
      <div className="absolute top-6 left-6 z-10 lg:left-8">
        <ThemeToggle />
      </div>

      {/* Main Container */}
      <div className="w-full lg:grid lg:grid-cols-12 h-screen">
        {/* Left Side: Form (5 cols on lg) */}
        <div className="flex flex-col justify-between col-span-12 lg:col-span-5 px-6 py-12 sm:px-12 lg:px-16 relative z-0 h-screen overflow-y-auto no-scrollbar">
          {/* Background decoration orbs on form side for visual depth */}
          <div className="absolute top-[-10%] left-[-10%] w-[250px] h-[250px] rounded-full bg-primary-500/5 blur-[70px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] rounded-full bg-indigo-500/5 blur-[70px] pointer-events-none" />

          {/* Top Header/Brand */}
          <div className="mb-8 mt-6">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-md">
                C
              </div>
              <span className="font-bold text-xl font-sans tracking-tight">CareerCopilot</span>
            </Link>
          </div>

          {/* Form Content */}
          <div className="my-auto max-w-md w-full mx-auto space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight font-sans">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Sign in to continue your career development
              </p>
            </div>

            {apiError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm flex items-center space-x-2 border border-red-500/10">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                    placeholder="name@domain.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-xs font-semibold text-primary-500 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full py-3 mt-2"
              >
                <span>Sign In</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">Or</span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
            </div>

            <div id="googleSignInButton" className="w-full flex justify-center mt-2 h-[44px]"></div>
          </div>

          {/* Footer Switch */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"} className="font-semibold text-primary-500 hover:underline">
              Sign up now
            </Link>
          </div>
        </div>

        {/* Right Side: Artwork Panel (7 cols on lg, hidden on mobile/tablet) */}
        <div className="hidden lg:block lg:col-span-7 relative overflow-hidden bg-gray-950">
          <img
            src="/auth_bg.png"
            alt="AI Career Copilot Visuals"
            className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 via-gray-950/40 to-transparent" />
          
          <div className="absolute bottom-16 left-16 right-16 p-8 rounded-3xl bg-gray-950/45 backdrop-blur-md border border-white/10 text-white max-w-xl">
            <h3 className="text-2xl font-bold font-sans tracking-tight mb-3">
              Engineer Your Ultimate Career Path
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed font-light">
              Elevate your developer journey with instant ATS resume scoring, real-time AI mock interviews, interactive roadmaps, and custom skill diagnostics.
            </p>
            <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-white/10 text-xs text-gray-400">
              <span className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2" /> Resume ATS Score
              </span>
              <span className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-400 mr-2" /> AI Tech Interviews
              </span>
              <span className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" /> Live Roadmap
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 bg-white dark:bg-darkCard rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Recover Password</h3>
              <button
                onClick={() => {
                  setForgotModalOpen(false);
                  setForgotMsg('');
                  setForgotEmail('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            {forgotMsg && (
              <p className="p-3 text-xs bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl">
                {forgotMsg}
              </p>
            )}
            <form onSubmit={handleForgotPassword} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Enter your registered email
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="yourname@domain.com"
                />
              </div>
              <Button
                type="submit"
                loading={forgotLoading}
                className="w-full"
              >
                Send Instructions
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
