import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { QRCanvas } from './QRCanvas';
import { useToast } from '../../hooks/useToast';
import type { User } from '../../types/user.types';
import { Copy, Download, Printer, Maximize2, Minimize2, ShieldCheck, AlertCircle, Building2 } from 'lucide-react';

export interface UserQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null | undefined;
}

export const UserQRModal: React.FC<UserQRModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { showToast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const userId = user?.userId || user?.id;
  const userName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Academy User';
  const schoolName = user?.schoolName || user?.tenantName || 'AcademyGrowth Institution';
  const className = user?.gradeLevel || user?.classIds?.[0] || 'Class 10';
  const section = user?.section || 'A';
  const rollNumber = user?.rollNumber || 'N/A';
  const role = user?.role || 'STUDENT';

  const hasValidUserId = Boolean(userId && String(userId).trim() !== '');

  // Canonical student attendance QR payload (Standard Format)
  const qrPayload = JSON.stringify({
    v: 1,
    type: 'student',
    studentId: String(userId || ''),
  });

  const handleCopyUserId = () => {
    if (!userId) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(userId)).catch(() => {});
    }
    showToast('success', `Copied User ID (${userId}) to clipboard.`);
  };

  const handleDownloadPNG = () => {
    if (!hasValidUserId) return;
    const svgElement = printRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 50, 50, 300, 300);
      }
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `academy-attendance-${userId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      showToast('success', `Downloaded QR as academy-attendance-${userId}.png`);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen && !isFullscreen}
        onClose={onClose}
        title="Student Attendance QR Pass"
        subtitle="Official QR identity derived from canonical backend User ID."
        maxWidth="md"
      >
        <div className="ag-user-qr-modal-body space-y-6">
          {!hasValidUserId ? (
            <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl space-y-3">
              <AlertCircle size={40} className="text-red-500 mx-auto" />
              <h3 className="text-lg font-bold text-red-400">QR unavailable</h3>
              <p className="text-sm text-red-300">
                This user has no valid user ID. Unable to generate official attendance QR identity.
              </p>
            </div>
          ) : (
            <div
              ref={printRef}
              className="ag-printable-qr-card p-6 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl flex flex-col items-center text-center space-y-4"
            >
              {/* Card Header */}
              <div className="w-full flex justify-between items-start border-b border-slate-800 pb-4 text-left">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold uppercase tracking-wider">
                    <Building2 size={14} />
                    <span>{schoolName}</span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">{userName}</h2>
                  <p className="text-xs text-slate-400">
                    {className} — Section {section} {rollNumber !== 'N/A' ? `| Roll No: ${rollNumber}` : ''}
                  </p>
                </div>
                <Badge variant={role === 'STUDENT' ? 'purple' : 'info'}>
                  {role}
                </Badge>
              </div>

              {/* QR Canvas */}
              <div className="py-2 flex flex-col items-center">
                <QRCanvas value={qrPayload} size={220} fgColor="#0f172a" bgColor="#ffffff" />
              </div>

              {/* Security Label */}
              <div className="w-full bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1 font-mono">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold">
                  <ShieldCheck size={16} />
                  <span>ACADEMY ATTENDANCE</span>
                </div>
                <p>Student: <strong>{userName}</strong> | User ID: <strong>{userId}</strong></p>
                <p className="text-[11px] text-slate-400 font-sans">
                  This QR identifies the account for attendance scanning.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="ag-no-print flex flex-wrap gap-2 justify-center w-full pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download size={14} />}
                  onClick={handleDownloadPNG}
                >
                  Download PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer size={14} />}
                  onClick={handlePrint}
                >
                  Print Pass
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Maximize2 size={14} />}
                  onClick={() => setIsFullscreen(true)}
                >
                  Fullscreen
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Copy size={14} />}
                  onClick={handleCopyUserId}
                >
                  Copy User ID
                </Button>
              </div>
            </div>
          )}

          <div className="ag-no-print flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-white space-y-6">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-white"
          >
            <Minimize2 size={24} />
          </button>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black">{userName}</h2>
            <p className="text-slate-400 font-mono">User ID: {userId}</p>
          </div>
          <div className="p-6 bg-white rounded-3xl shadow-2xl">
            <QRCanvas value={qrPayload} size={360} fgColor="#000000" bgColor="#ffffff" />
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleDownloadPNG} leftIcon={<Download size={16} />}>
              Download PNG
            </Button>
            <Button variant="outline" onClick={handleCopyUserId} leftIcon={<Copy size={16} />}>
              Copy User ID
            </Button>
            <Button variant="primary" onClick={() => setIsFullscreen(false)}>
              Exit Fullscreen
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
