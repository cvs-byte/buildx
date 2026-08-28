import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { School, Mail, ArrowLeft, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { authService } from '../../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await authService.signIn();
    } catch {
      setMsg('Redirecting to AWS Cognito password recovery service...');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <School className="w-7 h-7" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">AcademyGrowth</span>
        </Link>
      </div>

      <Card className="p-8 space-y-6 shadow-2xl rounded-3xl">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Forgot Password?</h1>
          <p className="text-xs text-slate-500">Reset your Cognito account password via registered email verification.</p>
        </div>

        {msg && <Alert variant="info" onClose={() => setMsg(null)}>{msg}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ACCOUNT EMAIL"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <Button variant="primary" size="lg" type="submit" isLoading={loading} className="w-full justify-center" rightIcon={<Send className="w-4 h-4" />}>
            Request Password Reset
          </Button>
        </form>

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-500">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </Card>
    </div>
  );
};
