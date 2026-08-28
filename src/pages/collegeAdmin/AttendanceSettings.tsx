import React, { useState } from 'react';
import { ShieldCheck, Save, Clock, Percent } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';

export const AttendanceSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    minAttendancePct: 75,
    lateGraceMinutes: 15,
    autoNotifyParents: true,
    notifyViaSms: true,
    notifyViaWhatsapp: true,
    allowTeacherRetroactiveDays: 2,
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">Attendance Policy & Notification Rules</h1>
          <p className="ag-page-subtitle">
            Configure minimum attendance thresholds, parent SMS alerts, and faculty marking deadlines.
          </p>
        </div>
        <Badge variant="purple">School Level Configuration</Badge>
      </div>

      {isSaved && (
        <div className="ag-alert ag-alert-success" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} />
          <span>Attendance settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="ag-form-stack">
        <div className="ag-card" style={{ marginBottom: '1.5rem' }}>
          <div className="ag-card-header">
            <h3>Minimum Attendance & Punctuality Rules</h3>
          </div>
          <div className="ag-card-body">
            <div className="ag-form-row">
              <Input
                label="Minimum Attendance Requirement (%)"
                type="number"
                value={settings.minAttendancePct}
                onChange={(e) => setSettings({ ...settings, minAttendancePct: Number(e.target.value) })}
                leftIcon={<Percent size={18} />}
                required
              />
              <Input
                label="Late Entry Grace Period (Minutes)"
                type="number"
                value={settings.lateGraceMinutes}
                onChange={(e) => setSettings({ ...settings, lateGraceMinutes: Number(e.target.value) })}
                leftIcon={<Clock size={18} />}
                required
              />
            </div>
            <div className="ag-form-row">
              <Input
                label="Teacher Retroactive Marking Window (Days)"
                type="number"
                value={settings.allowTeacherRetroactiveDays}
                onChange={(e) => setSettings({ ...settings, allowTeacherRetroactiveDays: Number(e.target.value) })}
                required
              />
            </div>
          </div>
        </div>

        <div className="ag-card" style={{ marginBottom: '1.5rem' }}>
          <div className="ag-card-header">
            <h3>Parent Automated Notification Triggers</h3>
          </div>
          <div className="ag-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.autoNotifyParents}
                  onChange={(e) => setSettings({ ...settings, autoNotifyParents: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: 600 }}>Enable automatic real-time absentee alert to parents</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.notifyViaSms}
                  onChange={(e) => setSettings({ ...settings, notifyViaSms: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Send via SMS Gateway</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.notifyViaWhatsapp}
                  onChange={(e) => setSettings({ ...settings, notifyViaWhatsapp: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Send via WhatsApp Business API</span>
              </label>
            </div>
          </div>
        </div>

        <div className="ag-header-actions" style={{ justifyContent: 'flex-end' }}>
          <Button type="submit" leftIcon={<Save size={18} />}>
            Save Policy Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceSettings;
