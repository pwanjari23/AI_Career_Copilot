import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Zap, Award, Bot, Compass } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/60 dark:bg-darkBg/60 backdrop-blur-lg border-b border-gray-200/40 dark:border-gray-800/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-primary-500/20">
            C
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">CareerCopilot</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="hover:text-primary-500 font-medium transition-colors">Features</a>
          <a href="#pricing" className="hover:text-primary-500 font-medium transition-colors">Pricing</a>
          <Link to="/about" className="hover:text-primary-500 font-medium transition-colors">About</Link>
          <Link to="/contact" className="hover:text-primary-500 font-medium transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium hover:text-primary-500 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md shadow-primary-500/15 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold text-xs mb-6 animate-pulse">
          <Sparkles className="h-4 w-4" />
          <span>Supercharged by Gemini 1.5 Flash</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black font-sans leading-tight tracking-tight max-w-4xl mx-auto">
          Engineer Your Career Growth with{' '}
          <span className="bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">
            AI-Driven Intelligence
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
          AI Career Copilot parses resumes, evaluates mock interviews, highlights core skill gaps, maps study milestones, and mentors you 24/7.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-2xl shadow-lg shadow-primary-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <span>Claim Your Free Account</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 border border-gray-300 dark:border-gray-700 font-semibold rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800/50 flex items-center justify-center transition-all"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Comprehensive Career Modules</h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Everything you need to level up from entry junior to principal software engineer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 bg-white dark:bg-darkCard rounded-2xl border border-gray-200/50 dark:border-gray-800/50 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Resume Analyzer</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Upload PDF resumes to compute ATS scores, parse content, and receive actionable suggestions.
            </p>
          </div>

          <div className="glass-card p-8 bg-white dark:bg-darkCard rounded-2xl border border-gray-200/50 dark:border-gray-800/50 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">AI Mock Interviews</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Choose developer roles and answer 10 questions. Gemini grades correctness, technical depth, and communication.
            </p>
          </div>

          <div className="glass-card p-8 bg-white dark:bg-darkCard rounded-2xl border border-gray-200/50 dark:border-gray-800/50 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Interactive Mentor</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Chat in real time with our intelligent chatbot. Clarify code queries, ask roadmap guidance, and practice concepts.
            </p>
          </div>

          <div className="glass-card p-8 bg-white dark:bg-darkCard rounded-2xl border border-gray-200/50 dark:border-gray-800/50 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Roadmap Generator</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Define target positions to generate personalized 6-month visual schedules containing study plans and milestones.
            </p>
          </div>

          <div className="glass-card p-8 bg-white dark:bg-darkCard rounded-2xl border border-gray-200/50 dark:border-gray-800/50 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">JD Match Score</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Paste descriptions of target jobs to map exact matching indicators, missing keywords, and alignments.
            </p>
          </div>

          <div className="glass-card p-8 bg-white dark:bg-darkCard rounded-2xl border border-gray-200/50 dark:border-gray-800/50 space-y-4">
            <div className="h-12 w-12 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Skill Gap Analytics</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Input role targets to isolate missing capabilities. Review recommended resources to bridge the gaps.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto border-t border-gray-200/40 dark:border-gray-800/40">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing</h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Start preparing for your dream interview today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="glass-card p-8 bg-white dark:bg-darkCard rounded-2xl border border-gray-200/50 dark:border-gray-800/50 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold">Starter Plan</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Basic AI coaching capabilities.</p>
              <div className="mt-6">
                <span className="text-4xl font-black font-sans">$0</span>
                <span className="text-gray-400 text-sm font-light"> / forever</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>3 PDF Resume Analyses</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>2 Mock Interview Sessions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>20 Chatbot Queries per day</span>
                </li>
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-8 block text-center py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 font-semibold rounded-xl transition-all"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="glass-card p-8 bg-white dark:bg-darkCard rounded-2xl border-2 border-primary-500 relative flex flex-col justify-between shadow-lg shadow-primary-500/5">
            <div className="absolute top-0 right-6 transform -translate-y-1/2 px-3 py-1 bg-primary-500 text-white rounded-full text-xs font-bold uppercase tracking-wider">
              Popular
            </div>
            <div>
              <h3 className="text-xl font-bold">Pro Plan</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Unlimited coaching and roadmap generation.</p>
              <div className="mt-6">
                <span className="text-4xl font-black font-sans">$19</span>
                <span className="text-gray-400 text-sm font-light"> / month</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Unlimited Resume Uploads</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Unlimited Job Description Matching</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Unlimited Mock Interviews</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Uncapped real-time chatbot mentorship</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>6-Month custom visual learning roadmaps</span>
                </li>
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-8 block text-center py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-md shadow-primary-500/20 transition-all"
            >
              Get Pro Access
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200/40 dark:border-gray-800/40 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2026 CareerCopilot. Powered by Gemini, Node.js and React. Built with clean code principles.</p>
      </footer>
    </div>
  );
};

export default Home;
