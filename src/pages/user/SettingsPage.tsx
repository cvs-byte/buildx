import React, { useState } from 'react';
import { ShieldCheck, Lock, Bell, User, Laptop } from 'lucide-react';
import { Tabs } from '../../components/ui/Tabs';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security & MFA', icon: <Lock className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Laptop className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure account parameters, security preferences, and email notifications.</p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'account' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-bold">Account Configurations</h3>
          <p className="text-xs text-slate-500">Account status is managed directly through AWS Cognito identity integration.</p>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-bold">Security & Authentication</h3>
          <div className="space-y-4">
            <Input label="Current Password" type="password" placeholder="••••••••" />
            <Input label="New Password" type="password" placeholder="••••••••" />
            <Button variant="primary" size="sm">Update Password</Button>
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-bold">Email Notifications</h3>
          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
              <span>Learning milestone reminders</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
              <span>Platform announcements & new program releases</span>
            </label>
          </div>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-bold">Display Preferences</h3>
          <p className="text-xs text-slate-500">System dark mode and accessibility settings.</p>
        </Card>
      )}
    </div>
  );
};
