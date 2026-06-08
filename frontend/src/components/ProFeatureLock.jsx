import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import Card from './Card';

const ProFeatureLock = ({ title, description, benefits = [] }) => {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center p-4">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/10 blur-[90px] pointer-events-none" />

      <Card className="max-w-lg w-full p-8 text-center bg-white/60 dark:bg-darkCard/60 backdrop-blur-md border border-gray-200/40 dark:border-gray-800/80 shadow-2xl rounded-3xl space-y-6 relative overflow-hidden animate-scale-in">
        {/* Top visual ring */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-tr from-primary-500/10 to-indigo-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Lock visual indicator */}
        <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 relative animate-pulse">
          <Lock className="h-7 w-7" />
          <div className="absolute -top-1.5 -right-1.5 p-1 bg-amber-500 text-white rounded-full">
            <Sparkles className="h-3 w-3" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black font-sans tracking-tight text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        </div>

        {benefits.length > 0 && (
          <div className="py-4 border-y border-gray-250/20 dark:border-gray-800/50 max-w-sm mx-auto">
            <ul className="text-left space-y-2.5 text-xs font-semibold text-gray-650 dark:text-gray-300">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start space-x-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2">
          <Link
            to="/checkout"
            className="inline-flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/35 transition-all duration-300 active:scale-[0.98] hover:-translate-y-0.5"
          >
            Upgrade to Pro
          </Link>
          <p className="text-[10px] text-gray-400 mt-3">
            One-time mock flat-rate. Full lifetime career value.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ProFeatureLock;
