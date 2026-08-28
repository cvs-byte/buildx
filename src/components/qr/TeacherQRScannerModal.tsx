import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { ZXingQRScannerEngine } from './ZXingQRScannerEngine';
import { attendanceApi } from '../../api/attendance.api';
import { useToast } from '../../hooks/useToast';
import { parseStudentQR } from '../../utils/qrParser';
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
  | 'Attendance marked successfully'
  | 'Already marked'
  | 'Invalid student QR'
  | 'Student not found'
  | 'Student does not belong to selected class/section'
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

  const [lastScannedRaw, setLastScannedRaw] = useState<string | null>(null);
  const [parsedStudentId, setParsedStudentId] = useState<string | null>(null);

  // Session duplicate protection
  const isProcessingRef = useRef<boolean>(false);
  const scannedStudentsRef = useRef<Set<string>>(new Set());

  // Reset modal session state on open
  useEffect(() => {
    if (isOpen) {
      isProcessingRef.current = false;
      scannedStudentsRef.current.clear();
      setIsPaused(false);
      setIsStopped(false);
      setVerificationResult(null);
      setLastScannedRaw(null);
      setParsedStudentId(null);
      setStatusText('Initializing camera...');
    }
  }, [isOpen]);

  const handleProcessScan = useCallback(
    async (rawDecodedText: string) => {
      if (isProcessingRef.current || isStopped) return;
      if (!rawDecodedText || rawDecodedText.trim() === '') return;

      isProcessingRef.current = true;
      setIsPaused(true);
      setIsValidating(true);
      setVerificationResult(null);
      setStatusText('QR detected');

      // Section 12 & Section 25 REQUIRED DEBUG LOG: [QR RAW]
      console.log('[QR RAW]', JSON.stringify(rawDecodedText.trim()));
      console.log('[QR] Raw decoded value:', rawDecodedText.trim());
      setLastScannedRaw(rawDecodedText.trim());

      // Parse payload using centralized parser
      const qrData = parseStudentQR(rawDecodedText.trim());
      console.log('[QR] Parsed data:', qrData);

      if (!qrData || !qrData.studentId) {
        setStatusText('Invalid student QR');
        showToast('error', 'Invalid student QR code format.');
        setIsValidating(false);
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 1500);
        return;
      }

      const studentId = qrData.studentId;
      console.log('[QR] Student ID:', studentId);
      setParsedStudentId(studentId);

      // Section 14: Duplicate Scan Protection for session
      if (scannedStudentsRef.current.has(studentId)) {
        setStatusText('Already marked');
        showToast('warning', `Student (${studentId}) already scanned in this session.`);
        setVerificationResult({
          success: false,
          status: 'ALREADY_RECORDED',
          message: 'Already marked in this scan session.',
        });
        setIsValidating(false);
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 1500);
        return;
      }

      setStatusText('Validating student...');

      const payload = {
        studentId,
        classId: selectedClass,
        sectionId: selectedSection,
        date: attendanceDate || new Date().toISOString().split('T')[0],
        status: 'PRESENT',
      };

      console.log('[ATTENDANCE] Request:', payload);
      setStatusText('Marking attendance...');

      try {
        const response = await attendanceApi.validateStudentQRScan({
          rawQR: rawDecodedText.trim(),
          selectedClass,
          selectedSection,
          date: attendanceDate,
        });

        console.log('[ATTENDANCE] Response:', response);
        setVerificationResult(response);

        if (response.success && response.status === 'PRESENT') {
          scannedStudentsRef.current.add(studentId);
          setStatusText('Attendance marked successfully');
          showToast('success', `✓ Attendance marked successfully for ${response.student?.name || studentId}`);
          if (onScanSuccess) onScanSuccess(response);
        } else if (response.status === 'ALREADY_RECORDED') {
          scannedStudentsRef.current.add(studentId);
          setStatusText('Already marked');
          showToast('info', response.message || 'Already marked');
        } else if (response.status === 'WRONG_CLASS') {
          setStatusText('Student does not belong to selected class/section');
          showToast('error', response.message);
        } else if (response.status === 'USER_NOT_FOUND') {
          setStatusText('Student not found');
          showToast('error', response.message);
        } else {
          setStatusText('Invalid student QR');
          showToast('error', response.message || 'Invalid student QR');
        }
      } catch (err: any) {
        console.error('[ATTENDANCE RESPONSE ERROR]', err);
        setStatusText('Network error');
        setVerificationResult({
          success: false,
          status: 'INVALID_TOKEN',
          message: err?.message || 'Unable to connect to attendance server. Scan was not marked. Please try again.',
        });
        showToast('error', 'Network error. Attendance NOT marked.');
      } finally {
        setIsValidating(false);
      }
    },
    [selectedClass, selectedSection, attendanceDate, onScanSuccess, showToast, isStopped]
  );

  const handleNextScan = () => {
    setVerificationResult(null);
    setLastScannedRaw(null);
    setParsedStudentId(null);
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
    if (statusText === 'Attendance marked successfully') colorClasses = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    else if (statusText === 'Already marked') colorClasses = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    else if (statusText === 'Validating student...' || statusText === 'Marking attendance...' || statusText === 'QR detected')
      colorClasses = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    else if (
      statusText === 'Invalid student QR' ||
      statusText === 'Student not found' ||
      statusText === 'Student does not belong to selected class/section' ||
      statusText === 'Camera permission denied' ||
      statusText === 'Camera unavailable' ||
      statusText === 'Network error'
    )
      colorClasses = 'bg-rose-500/20 text-rose-300 border-rose-500/40';

    return (
      <div className={`p-3 rounded-xl border text-xs font-semibold text-center transition-colors ${colorClasses}`}>
        Live Status: <strong>{statusText}</strong>
      </div>
    );
  };

  const renderVerificationResultCard = (res: StudentQRVerificationResult) => {
    switch (res.status) {
      case 'PRESENT':
        return (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-200">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-bold text-emerald-300">✓ Attendance Marked Successfully</span>
              <span className="block text-sm font-black text-white">{res.student?.name}</span>
              <span className="block text-[11px] text-emerald-400">
                User ID: {res.student?.userId || res.student?.id} | Time: {res.markedAt || 'Just now'}
              </span>
            </div>
          </div>
        );

      case 'ALREADY_RECORDED':
        return (
          <div className="p-4 bg-blue-950/60 border border-blue-800 rounded-xl flex items-center gap-3 text-blue-200">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">
              <UserCheck size={24} />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-bold text-blue-300">Already Marked</span>
              <span className="block text-sm font-black text-white">{res.student?.name || 'Student'}</span>
              <span className="block text-[11px] text-blue-400">Attendance was already recorded for today's date.</span>
            </div>
          </div>
        );

      case 'WRONG_CLASS':
        return (
          <div className="p-4 bg-amber-950/60 border border-amber-800 rounded-xl flex items-center gap-3 text-amber-200">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-bold text-amber-300">Student Does Not Belong to Selected Class/Section</span>
              <span className="block text-xs text-amber-400">{res.message}</span>
            </div>
          </div>
        );

      case 'UNAUTHORIZED':
        return (
          <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl flex items-center gap-3 text-rose-200">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-bold text-rose-300">Access Denied</span>
              <span className="block text-xs text-rose-400">{res.message}</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl flex items-center gap-3 text-rose-200">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold shrink-0">
              {statusText === 'Network error' ? <WifiOff size={24} /> : <XCircle size={24} />}
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-bold text-rose-300">{statusText}</span>
              <span className="block text-xs text-rose-400">{res.message}</span>
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
              <KeyRound size={14} /> Enter Student ID
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
                label="Student User ID or Email"
                placeholder="e.g. STU001 or rahul@school.edu"
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
                Submit Student ID
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
