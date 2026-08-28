import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { attendanceApi } from '../../api/attendance.api';
import { useToast } from '../../hooks/useToast';
import type { StudentQRVerificationResult, ScanResultCode } from '../../types/attendance.types';
import { Camera, CheckCircle2, AlertTriangle, XCircle, RefreshCw, KeyRound, ShieldAlert, Clock, Users, UserCheck } from 'lucide-react';

import jsQR from 'jsqr';
import { parseStudentQR } from '../../utils/qrParser';

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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const isCooldownRef = useRef<boolean>(false);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleProcessScan = useCallback(
    async (rawQRString: string) => {
      if (isCooldownRef.current) return;
      if (!rawQRString || rawQRString.trim() === '') return;

      isCooldownRef.current = true;
      setIsValidating(true);
      setVerificationResult(null);

      try {
        const result = await attendanceApi.validateStudentQRScan({
          rawQR: rawQRString.trim(),
          selectedClass,
          selectedSection,
          date: attendanceDate,
        });

        setVerificationResult(result);

        if (result.success && result.status === 'PRESENT') {
          showToast('success', `✓ Verified! ${result.student?.name || 'Student'} marked PRESENT.`);
          if (onScanSuccess) onScanSuccess(result);
        } else if (result.status === 'ALREADY_RECORDED') {
          showToast('error', `Error: Attendance already marked for ${result.student?.name || 'student'} today.`);
        } else {
          showToast('error', result.message);
        }
      } catch (err: any) {
        setVerificationResult({
          success: false,
          status: 'INVALID_TOKEN',
          message: err.message || 'Error processing student QR scan.',
        });
        showToast('error', 'Scan verification error.');
      } finally {
        setIsValidating(false);
        // Resumes scanner loop automatically after 1.8s
        setTimeout(() => {
          isCooldownRef.current = false;
        }, 1800);
      }
    },
    [selectedClass, selectedSection, attendanceDate, onScanSuccess, showToast]
  );

  const startCamera = useCallback(async () => {
    stopCameraStream();
    setHasCameraPermission(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        setActiveTab('MANUAL');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setHasCameraPermission(true);
    } catch {
      setHasCameraPermission(false);
    }
  }, [stopCameraStream]);

  // Frame scanning loop using jsQR + BarcodeDetector fallback
  useEffect(() => {
    let animFrameId: number;

    if (isOpen && activeTab === 'CAMERA' && hasCameraPermission) {
      const scanFrame = async () => {
        if (!isCooldownRef.current && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (video && canvas) {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              let detectedVal: string | null = null;
              if ('BarcodeDetector' in window) {
                try {
                  const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
                  const barcodes = await detector.detect(video);
                  if (barcodes.length > 0) {
                    detectedVal = barcodes[0].rawValue;
                  }
                } catch {
                  // Fall back to jsQR
                }
              }

              if (!detectedVal) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                  inversionAttempts: 'dontInvert',
                });
                if (code && code.data) {
                  detectedVal = code.data;
                }
              }

              if (detectedVal) {
                setLastScannedRaw(detectedVal);
                const parsed = parseStudentQR(detectedVal);
                if (parsed?.userId) {
                  setParsedUserId(parsed.userId);
                }
                handleProcessScan(detectedVal);
              }
            }
          }
        }
        animFrameId = requestAnimationFrame(scanFrame);
      };

      scanFrame();
    }

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [isOpen, activeTab, hasCameraPermission, handleProcessScan]);

  useEffect(() => {
    if (isOpen && activeTab === 'CAMERA') {
      startCamera();
    } else {
      stopCameraStream();
    }
    return () => stopCameraStream();
  }, [isOpen, activeTab, startCamera, stopCameraStream]);

  const renderVerificationCard = (res: StudentQRVerificationResult) => {
    switch (res.status) {
      case 'PRESENT':
        return (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xs font-bold text-emerald-800 dark:text-emerald-300">✓ Student Verified & Marked PRESENT</span>
              <span className="block text-sm font-black text-slate-800 dark:text-slate-100">{res.student?.name}</span>
              <span className="block text-[10px] text-emerald-700 dark:text-emerald-400">
                User ID: {res.student?.userId || res.student?.id} | Roll: {res.student?.rollNumber || 'CS-2026'} | Time: {res.markedAt || 'Just now'}
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
          <div className="space-y-2">
            <div className="ag-scan-viewport relative aspect-square max-h-[270px] w-full mx-auto bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />

              {/* Laser Scan Beam Animation */}
              <div className="ag-scan-beam-line" />

              {/* Target Guide Corners */}
              <div className="absolute inset-8 border border-indigo-400/50 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-2xl">
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-2 border-l-2 border-cyan-400" />
                  <div className="w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
                </div>
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
                  <div className="w-5 h-5 border-b-2 border-r-2 border-cyan-400" />
                </div>
              </div>

              {hasCameraPermission === false && (
                <div className="absolute inset-0 bg-slate-900/90 text-white flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <AlertTriangle size={32} className="text-amber-400" />
                  <p className="text-xs font-medium">Camera access unavailable or permission denied.</p>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('MANUAL')}>
                    Switch to Manual User ID Entry
                  </Button>
                </div>
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
            <p className="text-[11px] text-slate-400 text-center">
              Point camera at student's personal QR pass. Next scan ready automatically.
            </p>
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
              Lookup & Verify Student
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
