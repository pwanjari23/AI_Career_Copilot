import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Mail, MapPin, Phone } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Button from '../components/Button';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary-500/10 blur-[100px] pointer-events-none" />

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

      {/* Main Body */}
      <main className="max-w-6xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Info Column */}
        <div className="space-y-8 text-left">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold font-sans leading-tight">Get in Touch</h1>
            <p className="text-gray-500 dark:text-gray-400 font-light text-lg">
              Have questions about billing, custom integrations, enterprise access, or API limits? Drop us a line.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                <Mail className="h-5 w-5" />
              </div>
              <span className="text-gray-600 dark:text-gray-300">support@careercopilot.ai</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-gray-600 dark:text-gray-300">San Francisco, California</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                <Phone className="h-5 w-5" />
              </div>
              <span className="text-gray-600 dark:text-gray-300">+1 (800) 555-AI-COPILOT</span>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="glass-card p-8 bg-white dark:bg-darkCard rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
          {submitted ? (
            <div className="text-center py-10 space-y-4 animate-fade-in">
              <div className="h-16 w-16 bg-emerald-500/15 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <h2 className="text-2xl font-bold">Message Sent!</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm">
                Thank you for reaching out. A career advisor will get back to you shortly (typically within 24 hours).
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-sm text-primary-500 font-semibold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  How can we help?
                </label>
                <textarea
                  required
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                  placeholder="Describe your inquiry..."
                ></textarea>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full py-3"
              >
                <Send className="h-4 w-4 mr-2" />
                <span>Submit message</span>
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default Contact;
