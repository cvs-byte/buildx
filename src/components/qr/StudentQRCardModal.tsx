import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { QRCanvas } from './QRCanvas';
import { storage } from '../../utils/storage';
import { useToast } from '../../hooks/useToast';
import { QrCode, User, Building2, Copy, Download, ShieldCheck } from 'lucide-react';

export interface StudentQRCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentQRCardModal: React.FC<StudentQRCardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const currentUser = storage.getUser<any>();

  const studentId = currentUser?.userId || currentUser?.id || 'std_current';
  const studentName = currentUser?.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Student Pass';
  const schoolName = currentUser?.schoolName || currentUser?.tenantName || storage.getSchoolName() || 'AcademyGrowth School';
  const className = currentUser?.gradeLevel || currentUser?.classIds?.[0] || 'Class 10';
  const section = currentUser?.section || 'Section A';
  const rollNumber = currentUser?.rollNumber || `CS-2026-${studentId.slice(-4).toUpperCase()}`;

  // Encodes JSON payload or canonical userId
  const qrPayload = JSON.stringify({
    userId: studentId,
    name: studentName,
    tenantId: currentUser?.schoolId || currentUser?.tenantId || 'OIC-MAIN',
  });

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(studentId);
    showToast('success', `User ID (${studentId}) copied to clipboard.`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Digital QR Attendance Pass"
      subtitle="Present this personal QR code to your class teacher during attendance scanning."
      maxWidth="md"
    >
      <div className="ag-student-qr-modal-body space-y-6">
        {/* Digital Pass Card View */}
        <div className="ag-hologram-pass text-white p-6 shadow-2xl space-y-6 text-center">
          {/* Header Identity */}
          <div className="flex justify-between items-start border-b border-indigo-800/40 pb-4 text-left">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-bold uppercase tracking-wider">
                <Building2 size={14} />
                <span>{schoolName}</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">{studentName}</h2>
              <p className="text-xs text-indigo-200">{className} — {section} | Roll No: {rollNumber}</p>
            </div>
            <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
              ACTIVE STUDENT
            </Badge>
          </div>

          {/* Render Crisp High-Resolution QR Canvas */}
          <div className="py-2 flex flex-col items-center">
            <QRCanvas value={qrPayload} size={220} fgColor="#090d16" bgColor="#ffffff" />
            <div className="mt-3 flex items-center gap-2 text-xs text-indigo-200 font-mono bg-indigo-900/50 px-3 py-1.5 rounded-lg border border-indigo-700/50">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>User ID: {studentId}</span>
            </div>
          </div>

          <p className="text-xs text-indigo-300/80 max-w-xs mx-auto">
            Scan using teacher attendance camera to verify enrollment and log attendance.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Copy size={14} />}
            onClick={handleCopyUserId}
          >
            Copy User ID
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Pass
          </Button>
        </div>
      </div>
    </Modal>
  );
};
