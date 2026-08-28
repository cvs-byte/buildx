import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Alert } from '../../components/ui/Alert';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', institution: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAlertMsg('Contact service is not configured yet. AWS Lambda endpoint pending.');
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <Breadcrumb items={[{ label: 'Contact Us' }]} />

      <div className="space-y-4 max-w-3xl">
        <Badge variant="primary">Institutional Inquiries</Badge>
        <h1 className="text-4xl font-extrabold tracking-tight">Contact AcademyGrowth</h1>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
          Get in touch with our institutional software support team for platform deployments, portal configuration, or technical questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <Card className="p-8">
            {alertMsg && (
              <Alert variant="info" className="mb-6" onClose={() => setAlertMsg(null)}>
                {alertMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  placeholder="Administrator Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="admin@academy.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  label="Institution Name"
                  required
                  placeholder="e.g. St. Jude Academy"
                  value={formData.institution}
                  onChange={e => setFormData({ ...formData, institution: e.target.value })}
                />
              </div>

              <Textarea
                label="Message"
                rows={5}
                required
                placeholder="Describe your academy management requirements..."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
              />

              <Button variant="primary" size="lg" type="submit" isLoading={loading} rightIcon={<Send className="w-4 h-4" />}>
                Submit Inquiry
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-bold">Academy Contact Desk</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Institutional Sales & Support</p>
                  <p className="text-slate-500">support@academygrowth.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Direct Helpline</p>
                  <p className="text-slate-500">+1 (800) 555-ACADEMY</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Headquarters</p>
                  <p className="text-slate-500">100 Academic Plaza, San Francisco, CA 94105</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
