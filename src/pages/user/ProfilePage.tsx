import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, GraduationCap, Briefcase, Award, Save } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { userService } from '../../services/userService';
import { UserProfile } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { FileUploader } from '../../components/ui/FileUploader';
import { Alert } from '../../components/ui/Alert';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
    education: '',
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      await userService.updateProfile(profile);
      setMsg('Profile updated successfully.');
    } catch (err: any) {
      setMsg(err.message || 'Connecting to AWS DynamoDB User Table...');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">User Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your account information, biography, skills, and avatar.</p>
      </div>

      {msg && <Alert variant="info" onClose={() => setMsg(null)}>{msg}</Alert>}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <Avatar name={`${profile.firstName || 'User'} ${profile.lastName || ''}`} size="xl" />
            <div className="flex-1 w-full">
              <FileUploader
                label="Profile Photo (AWS S3 Upload)"
                accept="image/*"
                helperText="PNG or JPG up to 5MB"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={profile.firstName}
              onChange={e => setProfile({ ...profile, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              value={profile.lastName}
              onChange={e => setProfile({ ...profile, lastName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              disabled
              value={profile.email}
              helperText="Email is managed via AWS Cognito User Pool."
            />
            <Input
              label="Phone Number"
              type="tel"
              value={profile.phone}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          <Textarea
            label="Biography"
            rows={3}
            placeholder="Tell us about your background and career aspirations..."
            value={profile.bio}
            onChange={e => setProfile({ ...profile, bio: e.target.value })}
          />

          <Input
            label="Highest Education / Institution"
            placeholder="e.g. B.S. Computer Science"
            value={profile.education}
            onChange={e => setProfile({ ...profile, education: e.target.value })}
          />

          <div className="pt-2">
            <Button variant="primary" size="md" type="submit" isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
