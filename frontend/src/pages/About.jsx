import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Code, Cpu, ShieldAlert } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary-500/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/60 dark:bg-darkBg/60 backdrop-blur-lg border-b border-gray-200/40 dark:border-gray-800/40 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md">
            C
          </div>
          <span className="font-bold text-lg">CareerCopilot</span>
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link to="/" className="text-sm font-medium hover:text-primary-500 transition-colors flex items-center space-x-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      {/* Main container */}
      <main className="max-w-4xl mx-auto py-16 px-6 text-center space-y-12">
        <div className="space-y-4">
          
          <h1 className="text-4xl font-extrabold font-sans">Empowering Tomorrow's Engineers</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-light max-w-2xl mx-auto">
            We bridge the gap between academic theory, resume presentations, and core technical interviews through targeted AI diagnostics.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="glass-card p-6 bg-white dark:bg-darkCard rounded-2xl border border-gray-200/50 dark:border-gray-800/50 space-y-3">
            <Code className="h-6 w-6 text-primary-500" />
            <h3 className="font-bold text-lg">Actionable Code Prep</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              We test you using questions derived directly from top engineering teams, analyzing syntax and deep designs.
            </p>
          </div>

          <div className="glass-card p-6 bg-white dark:bg-darkCard rounded-2xl border border-gray-200/50 dark:border-gray-800/50 space-y-3">
            <Cpu className="h-6 w-6 text-primary-500" />
            <h3 className="font-bold text-lg">Model Evaluation</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Using Google Gemini, we deliver instant scores, diagnostic feedbacks, and corrective model responses.
            </p>
          </div>

          <div className="glass-card p-6 bg-white dark:bg-darkCard rounded-2xl border border-gray-200/50 dark:border-gray-800/50 space-y-3">
            <ShieldAlert className="h-6 w-6 text-primary-500" />
            <h3 className="font-bold text-lg">Security & Privacy</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              We encrypt candidate information, secure cookies using HttpOnly configurations, and restrict access controls.
            </p>
          </div>
        </div>

        <div className="pt-6">
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md font-semibold transition-all"
          >
            <span>Create Your Account</span>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default About;
