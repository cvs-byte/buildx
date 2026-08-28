import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, FileSpreadsheet, DollarSign, Calendar, Users, School, Bell, BarChart3, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <Breadcrumb items={[{ label: 'Features' }]} />

      <div className="space-y-4 max-w-3xl">
        <Badge variant="primary">Academy Management Capabilities</Badge>
        <h1 className="text-4xl font-extrabold tracking-tight">Institutional Platform Features</h1>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
          AcademyGrowth delivers dedicated tools for student administration, daily attendance logging, examination marksheets, financial ledger tracking, and role-based portal access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="p-8 space-y-4">
          <UserCheck className="w-8 h-8 text-indigo-600" />
          <h3 className="text-xl font-bold">Attendance Management</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Record daily attendance by class, date, and subject. Track present, absent, and late statuses with automated parent notification triggers.
          </p>
        </Card>

        <Card className="p-8 space-y-4">
          <FileSpreadsheet className="w-8 h-8 text-sky-600" />
          <h3 className="text-xl font-bold">Results & Marks Entry</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Streamlined marks entry for teachers across terms. Create exams, configure grade boundaries, review draft submissions, and publish marksheets.
          </p>
        </Card>

        <Card className="p-8 space-y-4">
          <DollarSign className="w-8 h-8 text-emerald-600" />
          <h3 className="text-xl font-bold">Fees & Accounting</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Fee structures, ledger balances, transaction receipts, pending fee reminders, and online payment gateway readiness.
          </p>
        </Card>

        <Card className="p-8 space-y-4">
          <Calendar className="w-8 h-8 text-amber-600" />
          <h3 className="text-xl font-bold">Events & Scheduling</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Schedule campus events, exam timetables, parent-teacher meetings, and holiday notices with audience targeting.
          </p>
        </Card>

        <Card className="p-8 space-y-4">
          <Users className="w-8 h-8 text-violet-600" />
          <h3 className="text-xl font-bold">Student & Parent Directories</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Centralized student profiles linked to guardians. Parents monitor multiple children from a single login.
          </p>
        </Card>

        <Card className="p-8 space-y-4">
          <BarChart3 className="w-8 h-8 text-slate-700 dark:text-slate-300" />
          <h3 className="text-xl font-bold">Reports & Audit Trail</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Generate PDF and CSV reports for academic performance, fee collections, and administrative audit logs.
          </p>
        </Card>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-10 text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to access your portal?</h2>
        <Button variant="primary" size="lg" onClick={() => navigate('/login')} rightIcon={<ArrowRight className="w-4 h-4" />}>
          Access Academy Portal
        </Button>
      </div>
    </div>
  );
};
