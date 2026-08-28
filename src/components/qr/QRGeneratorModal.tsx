import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Badge } from '../common/Badge';
import { QRCanvas } from './QRCanvas';
import { attendanceApi } from '../../api/attendance.api';
import { useToast } from '../../hooks/useToast';
import type { QRSessionStatus, ClassOptionModel, SectionModel } from '../../types/attendance.types';
import { QrCode, Clock, RefreshCw, XCircle, Users, CheckCircle2, Copy } from 'lucide-react';

export interface QRGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClassId?: string;
  defaultSectionId?: string;
}

export const QRGeneratorModal: React.FC<QRGeneratorModalProps> = ({
  isOpen,
  onClose,
  defaultClassId = 'class-10',
  defaultSectionId = 'A',
}) => {
  const { showToast } = useToast();
  const [classes, setClasses] = useState<ClassOptionModel[]>([]);
  const [sections, setSections] = useState<SectionModel[]>([]);
  const [selectedClass, setSelectedClass] = useState(defaultClassId);
  const [selectedSection, setSelectedSection] = useState(defaultSectionId);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<QRSessionStatus>('CLOSED');
  const [isGenerating, setIsGenerating] = useState(false);

  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [scannedCount, setScannedCount] = useState<number>(0);
  const totalClassStudents = 35; // Default roster estimate for progress bar

  // Load classes & sections from real API
  useEffect(() => {
    if (isOpen) {
      const loadOptions = async () => {
        const classList = await attendanceApi.getClasses();
        setClasses(classList);
        if (classList.length > 0 && !selectedClass) {
          setSelectedClass(classList[0].id);
        }
        const secList = await attendanceApi.getSections(selectedClass);
        setSections(secList);
      };
      loadOptions();
    }
  }, [isOpen, selectedClass]);

  // Countdown timer effect
  useEffect(() => {
    if (!expiresAt || sessionStatus !== 'ACTIVE') return;

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeftSeconds(diff);

      if (diff <= 0) {
        setSessionStatus('EXPIRED');
        showToast('warning', 'QR session expired. Please generate a new QR session.');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, sessionStatus, showToast]);

  // Controlled live scan polling effect (every 3s)
  useEffect(() => {
    if (!sessionId || sessionStatus !== 'ACTIVE') return;

    const pollInterval = setInterval(() => {
      const count = attendanceApi.getSessionScannedCount(sessionId);
      setScannedCount(count);
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [sessionId, sessionStatus]);

  const handleGenerateQR = async () => {
    setIsGenerating(true);
    try {
      const res = await attendanceApi.createQRSession({
        classId: selectedClass,
        sectionId: selectedSection,
      });

      if (res.success && res.token) {
        setSessionId(res.sessionId);
        setQrToken(res.token);
        setExpiresAt(res.expiresAt);
        setSessionStatus('ACTIVE');
        setScannedCount(0);
        showToast('success', `Active QR Session created for ${selectedClass} - Section ${selectedSection}`);
      } else {
        showToast('error', res.message || 'Failed to generate QR session.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error generating QR code.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloseSession = () => {
    if (sessionId) {
      attendanceApi.closeQRSession(sessionId);
    }
    setSessionStatus('CLOSED');
    showToast('info', 'QR Attendance session closed by teacher.');
  };

  const handleCopyToken = () => {
    if (qrToken) {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(qrToken).catch(() => {});
      }
      showToast('success', 'QR Token copied to clipboard.');
    }
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    switch (sessionStatus) {
      case 'ACTIVE':
        return <Badge variant="success">QR ACTIVE</Badge>;
      case 'EXPIRED':
        return <Badge variant="danger">EXPIRED</Badge>;
      default:
        return <Badge variant="neutral">CLOSED</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Classroom Attendance QR Session"
      subtitle="Generate short-lived, encrypted QR codes for live student check-ins."
      maxWidth="lg"
    >
      <div className="ag-qr-modal-body space-y-6">
        {/* Class Selection Controls */}
        <div className="ag-form-row">
          <Select
            label="Select Class"
            options={classes.map((c) => ({ value: c.id, label: `${c.name} (${c.gradeLevel || 'Roster'})` }))}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={sessionStatus === 'ACTIVE'}
          />
          <Select
            label="Select Section"
            options={sections.map((s) => ({ value: s.name, label: s.name }))}
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            disabled={sessionStatus === 'ACTIVE'}
          />
        </div>

        {/* Active QR Session Card */}
        {qrToken && sessionStatus !== 'CLOSED' ? (
          <div className="ag-qr-display-container p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center text-center space-y-4">
            <div className="flex items-center justify-between w-full px-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <QrCode size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span>Class: {selectedClass} - Section {selectedSection}</span>
              </div>
              {getStatusBadge()}
            </div>

            {/* Render Crisp QR Canvas */}
            <QRCanvas value={qrToken} size={220} />

            {/* Session Expiry Countdown */}
            <div className="flex items-center justify-center gap-4 w-full">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                <Clock size={16} className="text-amber-500" />
                <span>Expires in:</span>
                <span className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">
                  {formatCountdown(timeLeftSeconds)}
                </span>
              </div>
            </div>

            {/* Live Scan Monitor */}
            <div className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-left space-y-2">
              <div className="flex justify-between items-center text-sm font-medium text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Users size={16} className="text-emerald-500" />
                  Students Scanned:
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                  {scannedCount} / {totalClassStudents}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (scannedCount / totalClassStudents) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 text-right">Auto-refreshing live scan roster</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Copy size={14} />}
                onClick={handleCopyToken}
              >
                Copy Token
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle size={14} />}
                onClick={handleCloseSession}
              >
                Close Session
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
              <QrCode size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Ready to start attendance</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Select your class group and section above to display a secure 5-minute QR code on screen.
              </p>
            </div>
            <Button
              variant="primary"
              leftIcon={<CheckCircle2 size={16} />}
              isLoading={isGenerating}
              onClick={handleGenerateQR}
            >
              Generate QR Session
            </Button>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Done / Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
