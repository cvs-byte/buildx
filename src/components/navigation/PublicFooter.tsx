import React from 'react';
import { Link } from 'react-router-dom';
import { School, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-md">
                <School className="w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                AcademyGrowth
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              "Manage. Learn. Grow." — A unified academic management platform that helps institutions manage students, attendance, results, fees, events and daily operations from one secure portal.
            </p>
          </div>

          {/* Portal Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Academy Portals</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/student/dashboard" className="hover:text-white transition-colors">Student Portal</Link>
              </li>
              <li>
                <Link to="/parent/dashboard" className="hover:text-white transition-colors">Parent Portal</Link>
              </li>
              <li>
                <Link to="/teacher/dashboard" className="hover:text-white transition-colors">Teacher Portal</Link>
              </li>
              <li>
                <Link to="/accountant/dashboard" className="hover:text-white transition-colors">Accountant Desk</Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-white transition-colors">Administration</Link>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/features" className="hover:text-white transition-colors">Features</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Security Protocol</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AcademyGrowth Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              AWS Serverless Prepared
            </span>
            <span>Zero Fake Data Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
