import React, { useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { QRCanvas } from '../../components/qr/QRCanvas';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import {
  QrCode,
  ShieldCheck,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  Copy,
  Building2,
  UserCheck,
  GraduationCap,
} from 'lucide-react';

export const StudentQRPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const u = user as any;
  const userId = u?.userId || u?.id || '';
  const userName = u?.name || `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || 'Authenticated Student';
  const schoolName = u?.schoolName || u?.tenantName || 'AcademyGrowth School';
  const className = u?.gradeLevel || u?.classIds?.[0] || 'Class 10';
  const section = u?.section || 'A';
  const rollNumber = u?.rollNumber || `CS-2026-${String(userId).slice(-4).toUpperCase()}`;

  const hasValidUserId = Boolean(userId && String(userId).trim() !== '');

  // Canonical attendance QR payload
  const qrPayload = JSON.stringify({
    type: 'ACADEMY_STUDENT',
    version: 1,
    studentId: String(userId),
    userId: String(userId),
  });

  const handleCopyUserId = () => {
    if (!userId) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(userId)).catch(() => {});
    }
    showToast('success', `User ID (${userId}) copied to clipboard.`);
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

  return (
    <div className="ag-page-container space-y-6">
      {/* Header */}
      <div className="ag-page-header ag-no-print">
        <div>
          <h1 className="ag-page-title">My Digital Attendance QR Pass</h1>
          <p className="ag-page-subtitle">
            Present this official QR identity to your teacher for classroom scan check-in.
          </p>
        </div>
        <div className="ag-header-actions">
          <Button variant="outline" leftIcon={<Printer size={16} />} onClick={handlePrint}>
            Print Pass
          </Button>
          <Button variant="primary" leftIcon={<Download size={16} />} onClick={handleDownloadPNG}>
            Download PNG
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="ag-grid-stats ag-no-print">
        <StatCard
          title="Student User ID"
          value={userId || 'N/A'}
          icon={<ShieldCheck size={24} />}
          variant="purple"
        />
        <StatCard
          title="Enrolled Class"
          value={`${className} (${section})`}
          icon={<GraduationCap size={24} />}
          variant="emerald"
        />
        <StatCard
          title="Institution / Tenant"
          value={schoolName}
          icon={<Building2 size={24} />}
          variant="blue"
        />
      </div>

      {/* Pass Display */}
      {!hasValidUserId ? (
        <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl space-y-2 ag-no-print">
          <QrCode size={40} className="text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-red-400">QR unavailable</h3>
          <p className="text-sm text-red-300">
            This user has no valid user ID. Unable to generate official attendance QR identity.
          </p>
        </div>
      ) : (
        <div className="max-w-xl mx-auto">
          <div
            ref={printRef}
            className="ag-printable-qr-card ag-hologram-pass p-8 text-white rounded-3xl shadow-2xl flex flex-col items-center text-center space-y-6"
          >
            {/* Header info */}
            <div className="w-full flex justify-between items-start border-b border-indigo-800/40 pb-4 text-left">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-bold uppercase tracking-wider">
                  <Building2 size={14} />
                  <span>{schoolName}</span>
                </div>
                <h2 className="text-2xl font-black text-white mt-1">{userName}</h2>
                <p className="text-xs text-indigo-200">
                  {className} — Section {section} | Roll No: {rollNumber}
                </p>
              </div>
              <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                ACTIVE STUDENT
              </Badge>
            </div>

            {/* Crisp High-Res QR Canvas */}
            <div className="py-2 flex flex-col items-center">
              <QRCanvas value={qrPayload} size={250} fgColor="#090d16" bgColor="#ffffff" />
            </div>

            {/* Security Label */}
            <div className="w-full bg-indigo-950/60 p-4 rounded-xl border border-indigo-800/50 text-xs font-mono text-indigo-200 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-sm">
                <ShieldCheck size={16} />
                <span>ACADEMY ATTENDANCE IDENTITY</span>
              </div>
              <p>Student: <strong>{userName}</strong> | User ID: <strong>{userId}</strong></p>
              <p className="text-[11px] text-indigo-300/80 font-sans">
                This QR identifies the account for attendance scanning.
              </p>
            </div>

            {/* Action buttons */}
            <div className="ag-no-print flex flex-wrap gap-3 justify-center w-full pt-2">
              <Button
                variant="outline"
                leftIcon={<Download size={16} />}
                onClick={handleDownloadPNG}
              >
                Download PNG
              </Button>
              <Button
                variant="outline"
                leftIcon={<Printer size={16} />}
                onClick={handlePrint}
              >
                Print Pass
              </Button>
              <Button
                variant="outline"
                leftIcon={<Maximize2 size={16} />}
                onClick={() => setIsFullscreen(true)}
              >
                Fullscreen View
              </Button>
              <Button
                variant="ghost"
                leftIcon={<Copy size={16} />}
                onClick={handleCopyUserId}
              >
                Copy User ID
              </Button>
            </div>
          </div>
        </div>
      )}

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
            <QRCanvas value={qrPayload} size={380} fgColor="#000000" bgColor="#ffffff" />
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
    </div>
  );
};

export default StudentQRPage;
