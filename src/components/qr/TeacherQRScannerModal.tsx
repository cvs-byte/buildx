import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
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
  Upload,
  RefreshCw,
  SwitchCamera,
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

export type ScannerStatusState =
  | 'IDLE'
  | 'REQUESTING_CAMERA'
  | 'CAMERA_READY'
  | 'SCANNING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'INVALID_QR'
  | 'STUDENT_NOT_FOUND'
  | 'WRONG_CLASS'
  | 'ALREADY_PRESENT'
  | 'CAMERA_ERROR';

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
  const [lastScannedRaw, setLastScannedRaw] = useState<string | null>(null);
  const [parsedUserId, setParsedUserId] = useState<string | null>(null);

  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [scannerStatus, setScannerStatus] = useState<ScannerStatusState>('IDLE');

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const processingRef = useRef<boolean>(false);

  const stopScanner = useCallback(async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
        html5QrcodeRef.current.clear();
      } catch (err) {
        console.warn('[HTML5QRCODE STOP WARN]', err);
      } finally {
        html5QrcodeRef.current = null;
      }
    }
  }, []);

  const handleProcessScan = useCallback(
    async (rawQRString: string) => {
      if (processingRef.current) return;
      if (!rawQRString || rawQRString.trim() === '') return;

      processingRef.current = true;
      setIsValidating(true);
      setScannerStatus('PROCESSING');
      setVerificationResult(null);

      console.log('[QR RAW]', rawQRString);
      setLastScannedRaw(rawQRString);

      const parsed = parseStudentQR(rawQRString);
      console.log('[QR PARSED]', parsed);
      if (parsed?.userId) {
        setParsedUserId(parsed.userId);
      }

      try {
        const result = await attendanceApi.validateStudentQRScan({
          rawQR: rawQRString.trim(),
          selectedClass,
          selectedSection,
          date: attendanceDate,
        });

        setVerificationResult(result);

        if (result.success && result.status === 'PRESENT') {
          setScannerStatus('SUCCESS');
          showToast('success', `✓ Verified! ${result.student?.name || 'Student'} marked PRESENT.`);
          if (onScanSuccess) onScanSuccess(result);
        } else if (result.status === 'ALREADY_RECORDED') {
          setScannerStatus('ALREADY_PRESENT');
          showToast('error', `Error: Attendance already marked for ${result.student?.name || 'student'} today.`);
        } else if (result.status === 'WRONG_CLASS') {
          setScannerStatus('WRONG_CLASS');
          showToast('error', result.message);
        } else if (result.status === 'USER_NOT_FOUND') {
          setScannerStatus('STUDENT_NOT_FOUND');
          showToast('error', result.message);
        } else {
          setScannerStatus('INVALID_QR');
          showToast('error', result.message);
        }
      } catch (err: any) {
        setScannerStatus('INVALID_QR');
        setVerificationResult({
          success: false,
          status: 'INVALID_TOKEN',
          message: err.message || 'Error processing student QR scan.',
        });
        showToast('error', 'Scan verification error.');
      } finally {
        setIsValidating(false);
        setTimeout(() => {
          processingRef.current = false;
        }, 1800);
      }
    },
    [selectedClass, selectedSection, attendanceDate, onScanSuccess, showToast]
  );

  const startScanner = useCallback(
    async (targetCameraId?: string) => {
      await stopScanner();

      const element = document.getElementById('teacher-qr-reader');
      if (!element) return;

      setScannerStatus('REQUESTING_CAMERA');

      try {
        const html5Qrcode = new Html5Qrcode('teacher-qr-reader', false);
        html5QrcodeRef.current = html5Qrcode;

        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            setAvailableCameras(devices);
            if (!targetCameraId && !selectedCameraId) {
              const backCam = devices.find(
                (d) =>
                  d.label.toLowerCase().includes('back') ||
                  d.label.toLowerCase().includes('rear') ||
                  d.label.toLowerCase().includes('environment')
              );
              const defaultCamId = backCam ? backCam.id : devices[0].id;
              setSelectedCameraId(defaultCamId);
              targetCameraId = defaultCamId;
            }
          }
        } catch {
          // Camera list query fallback
        }

        const cameraConfig = targetCameraId
          ? targetCameraId
          : selectedCameraId
          ? selectedCameraId
          : { facingMode: 'environment' };

        await html5Qrcode.start(
          cameraConfig,
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleProcessScan(decodedText);
          },
          () => {
            // Normal scan frame miss
          }
        );

        setScannerStatus('SCANNING');
      } catch (err: any) {
        console.error('[HTML5QRCODE START ERROR]', err);
        setScannerStatus('CAMERA_ERROR');
      }
    },
    [selectedCameraId, stopScanner, handleProcessScan]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const tempScanner = new Html5Qrcode('teacher-qr-reader', false);
      const decodedText = await tempScanner.scanFile(file, true);
      console.log('[UPLOADED QR RAW]', decodedText);
      handleProcessScan(decodedText);
    } catch {
      showToast('error', 'Unable to read student QR code from uploaded image.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleSwitchCamera = () => {
    if (availableCameras.length <= 1) return;
    const currentIndex = availableCameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamId = availableCameras[nextIndex].id;
    setSelectedCameraId(nextCamId);
    startScanner(nextCamId);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'CAMERA') {
      const timer = setTimeout(() => {
        startScanner();
      }, 100);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, activeTab, startScanner, stopScanner]);

  const renderVerificationCard = (res: StudentQRVerificationResult) => {
    switch (res.status) {
      case 'PRESENT':
        return (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-bold text-emerald-800 dark:text-emerald-300">
                ✓ Student Verified & Marked PRESENT
              </span>
              <span className="block text-sm font-black text-slate-800 dark:text-slate-100">
                {res.student?.name}
              </span>
              <span className="block text-[10px] text-emerald-700 dark:text-emerald-400">
                User ID: {res.student?.userId || res.student?.id} | Roll: {res.student?.rollNumber || 'CS-2026'} | Time:{' '}
                {res.markedAt || 'Just now'}
              </span>
            </div>
          </div>
        );

      case 'ALREADY_RECORDED':
        return (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">
              <UserCheck size={24} />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-bold text-blue-800 dark:text-blue-300">✓ Already Marked Present</span>
              <span className="block text-sm font-black text-slate-800 dark:text-slate-100">{res.student?.name || 'Student'}</span>
              <span className="block text-[10px] text-blue-700 dark:text-blue-400">
                Attendance was already recorded for this session today.
              </span>
            </div>
          </div>
        );

      case 'WRONG_CLASS':
        return (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-bold text-amber-800 dark:text-amber-300">Student Not In This Class!</span>
              <span className="block text-xs text-amber-700 dark:text-amber-400">{res.message}</span>
            </div>
          </div>
        );

      case 'UNAUTHORIZED':
        return (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-bold text-rose-800 dark:text-rose-300">Cross-Tenant Access Denied!</span>
              <span className="block text-xs text-rose-700 dark:text-rose-400">{res.message}</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold shrink-0">
              <XCircle size={24} />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-bold text-rose-800 dark:text-rose-300">Verification Failed</span>
              <span className="block text-xs text-rose-700 dark:text-rose-400">{res.message}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Teacher QR Camera Scanner"
      subtitle={`Scan students' personal QR codes for ${selectedClass} - Section ${selectedSection}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Scanned Live Progress Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Users size={14} className="text-indigo-500" />
            Roster Scan Progress:
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            {scannedCount} / {totalStudents} Scanned
          </span>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'CAMERA' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
            }`}
            onClick={() => setActiveTab('CAMERA')}
          >
            <Camera size={14} /> Live Camera Scanner
          </button>
          <button
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'MANUAL' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
            }`}
            onClick={() => setActiveTab('MANUAL')}
          >
            <KeyRound size={14} /> Enter User ID
          </button>
        </div>

        {/* Dynamic Verification Result Banner */}
        {verificationResult && renderVerificationCard(verificationResult)}

        {/* Viewport */}
        {activeTab === 'CAMERA' ? (
          <div className="space-y-3">
            <div className="relative aspect-square max-h-[280px] w-full mx-auto bg-black rounded-2xl overflow-hidden border-2 border-indigo-500/30 flex items-center justify-center shadow-xl">
              <div id="teacher-qr-reader" className="w-full h-full object-cover" />

              {scannerStatus === 'CAMERA_ERROR' && (
                <div className="absolute inset-0 bg-slate-900/90 text-white flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <AlertTriangle size={32} className="text-amber-400" />
                  <p className="text-xs font-medium">Camera access unavailable or permission denied.</p>
                  <Button size="sm" variant="outline" onClick={() => startScanner()}>
                    <RefreshCw size={14} className="mr-1" /> Retry Camera
                  </Button>
                </div>
              )}
            </div>

            {/* Camera Controls & File Upload Toolbar */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Upload size={14} />}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload QR Image
              </Button>

              {availableCameras.length > 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<SwitchCamera size={14} />}
                  onClick={handleSwitchCamera}
                >
                  Switch Camera ({availableCameras.length})
                </Button>
              )}
            </div>

            {/* Live Scan Debug Status Banner */}
            {lastScannedRaw && (
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 space-y-1">
                <div className="flex justify-between items-center text-indigo-400 font-bold">
                  <span>QR DETECTED & DECODED</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="truncate">Payload: <span className="text-slate-200 font-semibold">{lastScannedRaw}</span></div>
                {parsedUserId && (
                  <div>Parsed Student User ID: <span className="text-emerald-400 font-bold">{parsedUserId}</span></div>
                )}
              </div>
            )}
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
              placeholder="e.g. student-001 or rahul@school.edu"
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
              TEST ATTENDANCE WITH STUDENT ID
            </Button>
          </form>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Done Scanning
          </Button>
        </div>
      </div>
    </Modal>
  );
};
