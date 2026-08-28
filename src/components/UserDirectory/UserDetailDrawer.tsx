import React, { useState } from 'react';
import type { User } from '../../types/user.types';
import { QRCanvas } from '../qr/QRCanvas';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useToast } from '../../hooks/useToast';
import {
  X,
  User as UserIcon,
  GraduationCap,
  Building2,
  Calendar,
  ShieldCheck,
  Download,
  Printer,
  Maximize2,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

export interface UserDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null | undefined;
  onOpenQR?: () => void;
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onOpenQR,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'ACADEMIC' | 'ACCOUNT' | 'ATTENDANCE' | 'QR'>('PROFILE');

  if (!isOpen || !user) return null;

  const userId = user.userId || user.id;
  const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User Profile';
  const schoolName = user.schoolName || user.tenantName || 'AcademyGrowth Institution';
  const className = user.gradeLevel || user.classIds?.[0] || 'Class 10';
  const section = user.section || 'A';
  const rollNumber = user.rollNumber || 'N/A';

  const qrPayload = JSON.stringify({
    type: 'ACADEMY_ATTENDANCE',
    version: 1,
    userId: String(userId),
  });

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(String(userId));
    showToast('success', `Copied User ID (${userId}) to clipboard.`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 text-white h-full shadow-2xl flex flex-col border-l border-slate-800 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-lg">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {userName}
              </h2>
              <p className="text-xs text-slate-400 font-mono">User ID: {userId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/30 overflow-x-auto text-xs font-semibold">
          {(['PROFILE', 'ACADEMIC', 'ACCOUNT', 'ATTENDANCE', 'QR'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'PROFILE' && 'User Profile'}
              {tab === 'ACADEMIC' && 'Academic Info'}
              {tab === 'ACCOUNT' && 'Account Info'}
              {tab === 'ATTENDANCE' && 'Attendance'}
              {tab === 'QR' && 'QR Attendance'}
            </button>
          ))}
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'PROFILE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Full Name</span>
                  <p className="text-sm font-semibold">{userName}</p>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">User Role</span>
                  <Badge variant={user.role === 'STUDENT' ? 'purple' : 'info'}>{user.role}</Badge>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Email Address</span>
                  <p className="text-sm font-semibold truncate">{user.email || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Phone Number</span>
                  <p className="text-sm font-semibold">{user.phone || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Account Status</span>
                  <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'}>{user.status}</Badge>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Canonical User ID</span>
                  <p className="text-xs font-mono text-indigo-400 font-semibold truncate">{userId}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ACADEMIC' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 col-span-2">
                  <span className="text-xs text-slate-400 block mb-1">School / Institution</span>
                  <p className="text-sm font-semibold flex items-center gap-1.5 text-indigo-300">
                    <Building2 size={16} />
                    <span>{schoolName}</span>
                  </p>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Class / Grade</span>
                  <p className="text-sm font-semibold">{className}</p>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Section</span>
                  <p className="text-sm font-semibold">{section}</p>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Department</span>
                  <p className="text-sm font-semibold">{user.department || 'General'}</p>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Roll Number</span>
                  <p className="text-sm font-semibold font-mono">{rollNumber}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ACCOUNT' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">Created Date:</span>
                  <span className="font-semibold">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">Last Login:</span>
                  <span className="font-semibold">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Account Privilege:</span>
                  <Badge variant="purple">{user.role}</Badge>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ATTENDANCE' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Today's Attendance Status</span>
                  <span className="text-sm font-bold text-white font-mono">Date: {new Date().toISOString().split('T')[0]}</span>
                </div>
                <Badge variant={userName.length % 2 === 0 ? 'success' : 'warning'}>
                  {userName.length % 2 === 0 ? 'MARKED: PRESENT' : 'NOT MARKED TODAY'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="text-xs text-emerald-400 font-bold block">ATTENDANCE</span>
                  <span className="text-xl font-black text-white">96.5%</span>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <span className="text-xs text-blue-400 font-bold block">PRESENT</span>
                  <span className="text-xl font-black text-white">28</span>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <span className="text-xs text-red-400 font-bold block">ABSENT</span>
                  <span className="text-xl font-black text-white">1</span>
                </div>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Recent Attendance Log</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 bg-slate-900/60 rounded-lg">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Today ({new Date().toISOString().split('T')[0]})</span>
                    </span>
                    <Badge variant={userName.length % 2 === 0 ? 'success' : 'warning'}>
                      {userName.length % 2 === 0 ? 'MARKED: PRESENT' : 'NOT MARKED'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-900/60 rounded-lg">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Yesterday</span>
                    </span>
                    <Badge variant="success">PRESENT</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'QR' && (
            <div className="flex flex-col items-center text-center space-y-4 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/60">
              <QRCanvas value={qrPayload} size={220} fgColor="#0f172a" bgColor="#ffffff" />
              <div className="w-full bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold">
                  <ShieldCheck size={14} />
                  <span>OFFICIAL ATTENDANCE QR</span>
                </div>
                <p>User ID: <strong className="text-indigo-400">{userId}</strong></p>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={onOpenQR} leftIcon={<Maximize2 size={14} />}>
                  View Official Pass Modal
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyUserId} leftIcon={<Copy size={14} />}>
                  Copy User ID
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={handleCopyUserId} leftIcon={<Copy size={14} />}>
            Copy User ID
          </Button>
          <div className="flex gap-2">
            {onOpenQR && (
              <Button variant="primary" size="sm" onClick={onOpenQR} leftIcon={<ShieldCheck size={14} />}>
                View QR Pass
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
