import React from 'react';
import { useNavigate } from 'react-router-dom';
import { School, ShieldCheck, Target, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <Breadcrumb items={[{ label: 'About Us' }]} />

      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="primary">About AcademyGrowth</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Unified Operations for Modern Educational Institutions
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          AcademyGrowth is an enterprise academic management platform engineered to connect students, teachers, parents, accountants, and school leaders in one secure ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Platform Mission</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            To provide educational institutions with reliable, centralized digital management tools for daily academic operations.
          </p>
        </Card>

        <Card className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Platform Vision</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            To eliminate administrative manual paperwork and enable transparent communication between academies and families.
          </p>
        </Card>

        <Card className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Cloud Security</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Architected for AWS serverless execution, Amazon Cognito identity verification, and role-scoped permissions.
          </p>
        </Card>
      </div>

      {/* Institutional Stakeholder Benefits */}
      <div className="space-y-8">
        <h2 className="text-3xl font-extrabold text-center">Benefits Across the Academy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 space-y-3">
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">For Institutions & Admins</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Centralized student records, automated fee tracking, institutional attendance oversight, and instant report generation.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-lg font-bold text-sky-600 dark:text-sky-400">For Teachers & Faculty</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Streamlined daily attendance entry, exam marksheets submission, and direct notice publishing to assigned classes.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">For Students</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Instant access to attendance summaries, examination grades, fee receipts, and event schedules.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400">For Parents & Guardians</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time monitoring of all children, fee payment history, attendance alerts, and institutional notices.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
