import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { ZXingQRScannerEngine } from './ZXingQRScannerEngine';
import { attendanceApi } from '../../api/attendance.api';
import { useToast } from '../../hooks/useToast';
import type { StudentQRVerificationResult } from '../../types/attendance.types';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  KeyRound,
  ShieldAlert,
  Users,
  UserCheck,
  Play,
  Square,
  WifiOff,
  RefreshCw,
  Mail,
  User as UserIcon,
} from 'lucide-react';

export interface TeacherQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: string;
  selectedSection: string;
  attendanceDate?: string;
  onScanSuccess?: (result: StudentQRVerificationResult) => void;
  scannedCount?: number;
  totalStudents?: number;
}

export type StatusDisplayText =
  | 'Initializing camera...'
  | 'Camera ready — scan a student QR'
  | 'QR detected'
  | 'Validating student...'
  | 'Marking attendance...'
  | '✓ QR VERIFIED'
  | 'ALREADY MARKED'
  | 'INVALID QR'
  | 'STUDENT NOT FOUND'
  | 'WRONG CLASS / SECTION'
  | 'Camera permission denied'
  | 'Camera unavailable'
  | 'Network error';

export const TeacherQRScannerModal: React.FC<TeacherQRScannerModalProps> = ({
  isOpen,
  onClose,
  selectedClass,
  selectedSection,
  attendanceDate,
  onScanSuccess,
  scannedCount = 0,
  totalStudents = 0,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'CAMERA' | 'MANUAL'>('CAMERA');
  const [manualInput, setManualInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [verificationResult, setVerificationResult] = useState<StudentQRVerificationResult | null>(null);

  const [statusText, setStatusText] = useState<StatusDisplayText>('Initializing camera...');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isStopped, setIsStopped] = useState<boolean>(false);

  // Session duplicate protection: cache by raw scanned QR text so a repeat scan of the same
  // physical QR code within this session resolves instantly without another network round-trip.
  const isProcessingRef = useRef<boolean>(false);
  const scannedStudentsRef = useRef<Set<string>>(new Set());
  const lastResultByKeyRef = useRef<Map<string, StudentQRVerificationResult>>(new Map());

  // Reset modal session state on open, and whenever the attendance context (class/section/date)
  // changes — a cached "already marked" result must never leak across a different class context.
  useEffect(() => {
    if (isOpen) {
      isProcessingRef.current = false;
      scannedStudentsRef.current.clear();
      lastResultByKeyRef.current.clear();
      setIsPaused(false);
      setIsStopped(false);
      setVerificationResult(null);
      setStatusText('Initializing camera...');
    }
  }, [isOpen, selectedClass, selectedSection, attendanceDate]);

  const handleProcessScan = useCallback(
    async (rawDecodedText: string) => {
      if (isProcessingRef.current || isStopped) return;
      if (!rawDecodedText || rawDecodedText.trim() === '') return;

      isProcessingRef.current = true;
      setIsPaused(true);
      setIsValidating(true);
      setVerificationResult(null);
      setStatusText('QR detected');

      console.log('[QR RAW]', JSON.stringify(rawDecodedText.trim()));
      console.log('[QR] Raw decoded value:', rawDecodedText.trim());

      setStatusText('Validating student...');

      // Fast client-side duplicate check: if this exact QR text was already verified as
      // PRESENT/ALREADY_RECORDED earlier in this session, skip the network round-trip and
      // show the cached result instantly instead of hammering the backend with a repeat request.
      const scanKey = rawDecodedText.trim();
      if (scannedStudentsRef.current.has(scanKey)) {
        const cached = lastResultByKeyRef.current.get(scanKey);
        setVerificationResult(
          cached || {
            success: false,
            status: 'ALREADY_RECORDED',
            message: 'ALREADY MARKED\nThis QR has already been scanned this session.',
          }
        );
        setStatusText('ALREADY MARKED');
        setIsValidating(false);
        return;
      }

      try {
        const response = await attendanceApi.validateStudentQRScan({
          rawQR: rawDecodedText.trim(),
          selectedClass,
          selectedSection,
          date: attendanceDate,
        });

        console.log('[ATTENDANCE VERIFICATION RESULT]', response);
        setVerificationResult(response);

        if (response.success && response.status === 'PRESENT') {
          const canonicalUserId = response.student?.userId || response.student?.id || '';
          scannedStudentsRef.current.add(scanKey);
          if (canonicalUserId) scannedStudentsRef.current.add(canonicalUserId);
          lastResultByKeyRef.current.set(scanKey, response);
          setStatusText('✓ QR VERIFIED');
          showToast('success', `✓ QR Verified! ${response.student?.name || 'Student'} marked PRESENT.`);
          if (onScanSuccess) onScanSuccess(response);
        } else if (response.status === 'ALREADY_RECORDED') {
          const canonicalUserId = response.student?.userId || response.student?.id || '';
          scannedStudentsRef.current.add(scanKey);
          if (canonicalUserId) scannedStudentsRef.current.add(canonicalUserId);
          lastResultByKeyRef.current.set(scanKey, response);
          setStatusText('ALREADY MARKED');
          showToast('info', response.message || 'Already marked');
        } else if (response.status === 'WRONG_CLASS') {
          setStatusText('WRONG CLASS / SECTION');
          showToast('error', response.message);
        } else if (response.status === 'USER_NOT_FOUND') {
          setStatusText('STUDENT NOT FOUND');
          showToast('error', response.message);
        } else if (response.status === 'INVALID_TOKEN') {
          setStatusText('INVALID QR');
          showToast('error', response.message || 'INVALID QR: This QR does not contain a valid student email.');
        } else {
          setStatusText('INVALID QR');
          showToast('error', response.message || 'Invalid student QR');
        }
      } catch (err: any) {
        console.error('[ATTENDANCE RESPONSE ERROR]', err);
        setStatusText('Network error');
        setVerificationResult({
          success: false,
          status: 'INVALID_TOKEN',
          message: err?.message || 'Attendance was NOT marked. Unable to connect to attendance server. Please try again.',
        });
        showToast('error', 'Attendance was NOT marked. Network error.');
      } finally {
        setIsValidating(false);
        // Note: isProcessingRef remains true while paused on result card,
        // it resets to false when user clicks "Scan Next Student" or resumes scanner
      }
    },
    [selectedClass, selectedSection, attendanceDate, onScanSuccess, showToast, isStopped]
  );

  const handleNextScan = () => {
    setVerificationResult(null);
    isProcessingRef.current = false;
    setIsPaused(false);
    setIsStopped(false);
    setStatusText('Camera ready — scan a student QR');
  };

  const handleStopScanner = () => {
    setIsStopped(true);
    setIsPaused(true);
    setStatusText('Camera unavailable');
  };

  const handleResumeScanner = () => {
    setIsStopped(false);
    setIsPaused(false);
    isProcessingRef.current = false;
    setStatusText('Camera ready — scan a student QR');
  };

  const renderStatusBadge = () => {
    let colorClasses = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    if (statusText === '✓ QR VERIFIED') colorClasses = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    else if (statusText === 'ALREADY MARKED') colorClasses = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    else if (statusText === 'Validating student...' || statusText === 'Marking attendance...' || statusText === 'QR detected')
      colorClasses = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    else if (
      statusText === 'INVALID QR' ||
      statusText === 'STUDENT NOT FOUND' ||
      statusText === 'WRONG CLASS / SECTION' ||
      statusText === 'Camera permission denied' ||
      statusText === 'Camera unavailable' ||
      statusText === 'Network error'
    )
      colorClasses = 'bg-rose-500/20 text-rose-300 border-rose-500/40';

    return (
      <div className={`p-3 rounded-xl border text-xs font-semibold text-center transition-colors ${colorClasses}`}>
        Status: <strong>{statusText}</strong>
      </div>
    );
  };

  const renderVerificationResultCard = (res: StudentQRVerificationResult) => {
    switch (res.status) {
      case 'PRESENT':
        return (
          <div className="p-4 bg-emerald-950/70 border border-emerald-700 rounded-2xl space-y-3 text-emerald-100 shadow-xl">
            <div className="flex items-center gap-3 border-b border-emerald-800/60 pb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg">
                <CheckCircle2 size={24} />
              </div>
              <div className="flex-1 text-left">
                <span className="block text-xs font-black tracking-wider text-emerald-300 uppercase">✓ QR VERIFIED</span>
                <span className="block text-base font-black text-white">{res.student?.name}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-900/80 p-3 rounded-xl border border-emerald-900">
              <div className="flex items-center gap-1.5 text-slate-200">
                <UserIcon size={14} className="text-emerald-400" />
                <span>User ID: <strong>{res.student?.userId || res.student?.id}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-200 truncate">
                <Mail size={14} className="text-emerald-400" />
                <span className="truncate">Email: <strong>{res.student?.email}</strong></span>
              </div>
              <div className="text-[11px] text-emerald-400 col-span-full pt-1">
                Class: {selectedClass} - Section {selectedSection} | Time: {res.markedAt || 'Just now'}
              </div>
            </div>
          </div>
        );

      case 'ALREADY_RECORDED':
        return (
          <div className="p-4 bg-blue-950/70 border border-blue-700 rounded-2xl flex items-center gap-3 text-blue-100 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg">
              <UserCheck size={24} />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-black tracking-wider text-blue-300 uppercase">ALREADY MARKED</span>
              <span className="block text-sm font-bold text-white">{res.student?.name || 'Student'}</span>
              <span className="block text-xs text-blue-300">Attendance has already been recorded.</span>
            </div>
          </div>
        );

      case 'WRONG_CLASS':
        return (
          <div className="p-4 bg-amber-950/70 border border-amber-700 rounded-2xl flex items-center gap-3 text-amber-100 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-black tracking-wider text-amber-300 uppercase">WRONG CLASS / SECTION</span>
              <span className="block text-xs text-amber-200 whitespace-pre-line">{res.message}</span>
            </div>
          </div>
        );

      case 'USER_NOT_FOUND':
        return (
          <div className="p-4 bg-rose-950/70 border border-rose-700 rounded-2xl flex items-center gap-3 text-rose-100 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg">
              <XCircle size={24} />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-black tracking-wider text-rose-300 uppercase">STUDENT NOT FOUND</span>
              <span className="block text-xs text-rose-200">No registered student matches this QR.</span>
            </div>
          </div>
        );

      case 'UNAUTHORIZED':
        return (
          <div className="p-4 bg-rose-950/70 border border-rose-700 rounded-2xl flex items-center gap-3 text-rose-100 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg">
              <ShieldAlert size={24} />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-black tracking-wider text-rose-300 uppercase">ACCESS DENIED</span>
              <span className="block text-xs text-rose-200">{res.message}</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-rose-950/70 border border-rose-700 rounded-2xl flex items-center gap-3 text-rose-100 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg">
              {statusText === 'Network error' ? <WifiOff size={24} /> : <XCircle size={24} />}
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-black tracking-wider text-rose-300 uppercase">
                {res.status === 'INVALID_TOKEN' ? 'INVALID QR' : statusText}
              </span>
              <span className="block text-xs text-rose-200 whitespace-pre-line">{res.message}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SCAN STUDENT QR"
      subtitle={`Scanning student attendance for ${selectedClass} - Section ${selectedSection}`}
      maxWidth="md"
    >
      <ErrorBoundary
        fallbackTitle="Scanner Interface Error"
        fallbackMessage="An unexpected error occurred in the scanner. Please retry."
        onRetry={handleNextScan}
      >
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex justify-between items-center text-xs text-slate-200">
            <span className="font-semibold flex items-center gap-1.5">
              <Users size={14} className="text-indigo-400" />
              Roster Scan Progress:
            </span>
            <span className="font-bold text-emerald-400 text-sm">
              {scannedCount} / {totalStudents} Scanned
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-800 p-1 rounded-xl">
            <button
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'CAMERA' ? 'bg-slate-700 text-indigo-400 shadow' : 'text-slate-400'
              }`}
              onClick={() => setActiveTab('CAMERA')}
            >
              <Camera size={14} /> Live Camera Scanner
            </button>
            <button
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'MANUAL' ? 'bg-slate-700 text-indigo-400 shadow' : 'text-slate-400'
              }`}
              onClick={() => setActiveTab('MANUAL')}
            >
              <KeyRound size={14} /> Enter Student Email / ID
            </button>
          </div>

          {/* Live Status Indicator */}
          {renderStatusBadge()}

          {/* Verification Result Notification Card */}
          {verificationResult && renderVerificationResultCard(verificationResult)}

          {/* Camera Viewport & Decoder Engine */}
          {activeTab === 'CAMERA' ? (
            <div className="space-y-3">
              <ZXingQRScannerEngine
                active={isOpen && activeTab === 'CAMERA' && !isStopped}
                isPaused={isPaused}
                onScan={handleProcessScan}
                onStatusChange={(st) => {
                  if (!isProcessingRef.current) {
                    setStatusText(st as StatusDisplayText);
                  }
                }}
                onError={(err) => {
                  if (err.includes('permission')) setStatusText('Camera permission denied');
                  else setStatusText('Camera unavailable');
                }}
              />

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-2 pt-1">
                {isPaused || isStopped ? (
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Play size={14} />}
                    onClick={handleNextScan}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                  >
                    Scan Next Student
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Square size={14} />}
                    onClick={handleStopScanner}
                    className="flex-1 text-slate-300 border-slate-700 hover:bg-slate-800"
                  >
                    Stop Scanner
                  </Button>
                )}

                {isStopped && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<RefreshCw size={14} />}
                    onClick={handleResumeScanner}
                    className="text-indigo-400 border-indigo-500/40"
                  >
                    Resume Scanner
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessScan(manualInput);
              }}
              className="space-y-3 py-2"
            >
              <Input
                label="Student Email Address"
                placeholder="e.g. rahul@school.edu or student@example.com"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isValidating}
                leftIcon={<CheckCircle2 size={16} />}
              >
                Validate & Mark Attendance
              </Button>
            </form>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <Button variant="outline" onClick={onClose}>
              Done Scanning
            </Button>
          </div>
        </div>
      </ErrorBoundary>
    </Modal>
  );
};
