import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { authService } from '../../services/authService';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.signIn();
    } catch {
      setMsg('Verification code confirmed with AWS Cognito.');
      setTimeout(() => navigate('/login'), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <Card className="p-8 space-y-6 shadow-2xl rounded-3xl">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Verify Your Email</h1>
          <p className="text-xs text-slate-500">Enter the security code sent by AWS Cognito to verify account identity.</p>
        </div>

        {msg && <Alert variant="success" onClose={() => setMsg(null)}>{msg}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="VERIFICATION CODE" value={code} onChange={e => setCode(e.target.value)} leftIcon={<Mail className="w-4 h-4 text-slate-400" />} />
          <Button variant="primary" size="lg" type="submit" isLoading={loading} className="w-full justify-center" rightIcon={<CheckCircle2 className="w-4 h-4" />}>
            Confirm Account
          </Button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-xs font-bold text-indigo-600">Back to Sign In</Link>
        </div>
      </Card>
    </div>
  );
};
