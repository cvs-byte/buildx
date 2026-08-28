import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { attendanceApi } from '../../api/attendance.api';
import { useToast } from '../../hooks/useToast';
import type { QRValidateResponse, ScanResultCode } from '../../types/attendance.types';
import { Camera, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Upload, KeyRound, Clock, ShieldAlert } from 'lucide-react';

export interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'CAMERA' | 'MANUAL'>('CAMERA');
  const [manualToken, setManualToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [scanResult, setScanResult] = useState<QRValidateResponse | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleValidateToken = useCallback(
    async (tokenToValidate: string) => {
      if (!tokenToValidate || tokenToValidate.trim() === '') {
        showToast('error', 'Please provide a valid QR session token.');
        return;
      }

      setIsValidating(true);
      setScanResult(null);

      try {
        const response = await attendanceApi.validateQR({ token: tokenToValidate.trim() });
        setScanResult(response);

        if (response.success && response.status === 'PRESENT') {
          showToast('success', 'Attendance marked PRESENT!');
          if (onSuccess) onSuccess();
        } else if (response.status === 'ALREADY_RECORDED') {
          showToast('error', 'Error: Attendance already marked for this student today.');
        } else {
          showToast('error', response.message || 'QR validation failed.');
        }
      } catch (err: any) {
        setScanResult({
          success: false,
          status: 'INVALID_TOKEN',
          message: err.message || 'Network error while validating attendance. Please try again.',
        });
        showToast('error', 'Unable to process scan. Please check your connection.');
      } finally {
        setIsValidating(false);
      }
    },
    [onSuccess, showToast]
  );

  // Start Camera Stream
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

  // Native BarcodeDetector or Frame Scanner loop
  useEffect(() => {
    let animFrameId: number;

    if (isOpen && activeTab === 'CAMERA' && hasCameraPermission) {
      const scanFrame = async () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          // Native BarcodeDetector API in modern browsers
          if ('BarcodeDetector' in window) {
            try {
              const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const detectedVal = barcodes[0].rawValue;
                stopCameraStream();
                handleValidateToken(detectedVal);
                return;
              }
            } catch {
              // Ignore BarcodeDetector errors
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
  }, [isOpen, activeTab, hasCameraPermission, handleValidateToken, stopCameraStream]);

  useEffect(() => {
    if (isOpen && activeTab === 'CAMERA') {
      startCamera();
    } else {
      stopCameraStream();
    }
    return () => stopCameraStream();
  }, [isOpen, activeTab, startCamera, stopCameraStream]);

  const handleResetScan = () => {
    setScanResult(null);
    setManualToken('');
    if (activeTab === 'CAMERA') {
      startCamera();
    }
  };

  const renderResultCard = (res: QRValidateResponse) => {
    switch (res.status) {
      case 'PRESENT':
        return (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">✓ Attendance Marked</h3>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              You are marked PRESENT.
            </p>
            <div className="text-xs text-emerald-600 dark:text-emerald-500 bg-white/60 dark:bg-emerald-900/40 p-3 rounded-lg flex justify-around">
              <span>Class: {res.className || 'Class 10'} - {res.section || 'A'}</span>
              <span>Time: {res.markedAt || new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        );

      case 'ALREADY_RECORDED':
        return (
          <div className="p-6 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">✓ Already Recorded</h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Your attendance was already marked for this session.
            </p>
          </div>
        );

      case 'EXPIRED':
        return (
          <div className="p-6 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
              <Clock size={32} />
            </div>
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300">QR Code Expired</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Ask your teacher to generate a new classroom QR code.
            </p>
          </div>
        );

      case 'WRONG_CLASS':
      case 'UNAUTHORIZED':
        return (
          <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto shadow-md">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-xl font-bold text-rose-800 dark:text-rose-300">Attendance Not Allowed</h3>
            <p className="text-sm text-rose-700 dark:text-rose-400">
              {res.message || 'You are not enrolled in this class or section.'}
            </p>
          </div>
        );

      default:
        return (
          <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto shadow-md">
              <XCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-red-800 dark:text-red-300">Invalid QR Code</h3>
            <p className="text-sm text-red-700 dark:text-red-400">
              {res.message || 'Please scan the active classroom QR displayed by your teacher.'}
            </p>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student QR Attendance Check-In"
      subtitle="Scan your classroom QR code to log your present status."
      maxWidth="md"
    >
      <div className="ag-scanner-modal-content space-y-4">
        {/* Navigation Tabs */}
        {!scanResult && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'CAMERA' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
              }`}
              onClick={() => setActiveTab('CAMERA')}
            >
              <Camera size={16} /> Live Scanner
            </button>
            <button
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'MANUAL' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
              }`}
              onClick={() => setActiveTab('MANUAL')}
            >
              <KeyRound size={16} /> Code Token Entry
            </button>
          </div>
        )}

        {/* Display Validation Result Card */}
        {scanResult ? (
          <div className="space-y-4">
            {renderResultCard(scanResult)}
            <div className="flex justify-center gap-3">
              <Button variant="outline" leftIcon={<RefreshCw size={14} />} onClick={handleResetScan}>
                Scan Another QR
              </Button>
              <Button variant="primary" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : activeTab === 'CAMERA' ? (
          <div className="space-y-4">
            {/* Live Camera Viewport */}
            <div className="relative aspect-square max-h-[300px] w-full mx-auto bg-black rounded-2xl overflow-hidden flex items-center justify-center border-2 border-indigo-500/30">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Target Scan Frame */}
              <div className="absolute inset-8 border-2 border-indigo-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-2xl">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
                </div>
              </div>

              {hasCameraPermission === false && (
                <div className="absolute inset-0 bg-slate-900/90 text-white flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <AlertTriangle size={32} className="text-amber-400" />
                  <p className="text-xs font-medium">Camera access unavailable or permission denied.</p>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('MANUAL')}>
                    Switch to Manual Entry
                  </Button>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 text-center">
              Align classroom QR code within the view frame to scan automatically.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleValidateToken(manualToken);
            }}
            className="space-y-4 py-2"
          >
            <Input
              label="Classroom QR Token Code"
              placeholder="Paste or enter session token code (e.g. AG_QR_...)"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isValidating}
              leftIcon={<CheckCircle2 size={16} />}
            >
              Validate & Submit Scan
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
};
