import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { School, UserPlus, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';

export const RegisterPage: React.FC = () => {
  const { signIn, isLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [localMsg, setLocalMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMsg(null);
    try {
      await signIn();
    } catch (err: any) {
      setLocalMsg(err.message || 'Connecting to AWS Cognito Sign Up endpoint...');
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xl">
            <School className="w-7 h-7" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">AcademyGrowth</span>
        </Link>
      </div>

      <Card className="p-8 space-y-6 shadow-2xl rounded-3xl">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Portal Account</h1>
          <p className="text-xs text-slate-500">Register account credentials managed via AWS Cognito User Pool.</p>
        </div>

        {localMsg && <Alert variant="info" onClose={() => setLocalMsg(null)}>{localMsg}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="FIRST NAME" required value={firstName} onChange={e => setFirstName(e.target.value)} leftIcon={<User className="w-4 h-4 text-slate-400" />} />
            <Input label="LAST NAME" required value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>

          <Input label="EMAIL ADDRESS" type="email" required value={email} onChange={e => setEmail(e.target.value)} leftIcon={<Mail className="w-4 h-4 text-slate-400" />} />

          <Select
            label="PORTAL ROLE"
            value={role}
            onChange={e => setRole(e.target.value)}
            options={[
              { label: 'Student Account', value: 'STUDENT' },
              { label: 'Parent / Guardian Account', value: 'PARENT' },
              { label: 'Faculty Teacher Account', value: 'TEACHER' },
            ]}
          />

          <Button variant="primary" size="lg" type="submit" isLoading={isLoading} className="w-full justify-center" rightIcon={<UserPlus className="w-4 h-4" />}>
            Register Account
          </Button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
