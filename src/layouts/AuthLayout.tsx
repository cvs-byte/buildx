import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="flex justify-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AcademyGrowth
            </span>
            <span className="block text-[11px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
              AWS Cognito Authentication Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Auth Content Card Container */}
      <div className="my-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          <Outlet />
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <div className="flex items-center justify-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secured via Amazon Cognito & OAuth2 Standards</span>
        </div>
        <p>© {new Date().getFullYear()} AcademyGrowth Inc. All rights reserved.</p>
      </div>
    </div>
  );
};
