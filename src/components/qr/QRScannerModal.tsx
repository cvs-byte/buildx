import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { attendanceApi } from '../../api/attendance.api';
import { useToast } from '../../hooks/useToast';
import { parseStudentQR } from '../../utils/qrParser';
import type { QRValidateResponse } from '../../types/attendance.types';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Upload,
  KeyRound,
  Clock,
  ShieldAlert,
  SwitchCamera,
} from 'lucide-react';

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

  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [hasCameraError, setHasCameraError] = useState<boolean>(false);

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

  const handleValidateToken = useCallback(
    async (tokenToValidate: string) => {
      if (processingRef.current) return;
      if (!tokenToValidate || tokenToValidate.trim() === '') {
        showToast('error', 'Please provide a valid QR session token.');
        return;
      }

      processingRef.current = true;
      setIsValidating(true);
      setScanResult(null);

      console.log('[QR RAW]', tokenToValidate);
      const parsed = parseStudentQR(tokenToValidate);
      console.log('[QR PARSED]', parsed);

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
        setTimeout(() => {
          processingRef.current = false;
        }, 1500);
      }
    },
    [onSuccess, showToast]
  );

  const startScanner = useCallback(
    async (targetCameraId?: string) => {
      await stopScanner();
      setHasCameraError(false);

      const element = document.getElementById('student-qr-reader');
      if (!element) return;

      try {
        const html5Qrcode = new Html5Qrcode('student-qr-reader', false);
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
          // Camera list fallback
        }

        const cameraConfig = targetCameraId
          ? targetCameraId
          : selectedCameraId
          ? selectedCameraId
          : { facingMode: 'environment' };

        await html5Qrcode.start(
          cameraConfig,
          {
            fps: 25,
            qrbox: (w, h) => ({
              width: Math.floor(w * 0.95),
              height: Math.floor(h * 0.95),
            }),
            aspectRatio: 1.0,
          },
          (decodedText) => {
            stopScanner();
            handleValidateToken(decodedText);
          },
          () => {
            // Normal scan frame miss
          }
        );
      } catch (err: any) {
        console.error('[STUDENT QR SCANNER ERROR]', err);
        setHasCameraError(true);
      }
    },
    [selectedCameraId, stopScanner, handleValidateToken]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const tempScanner = new Html5Qrcode('student-qr-reader', false);
      const decodedText = await tempScanner.scanFile(file, true);
      console.log('[UPLOADED STUDENT QR RAW]', decodedText);
      handleValidateToken(decodedText);
    } catch {
      showToast('error', 'Unable to read QR code from uploaded image.');
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

  const handleResetScan = () => {
    setScanResult(null);
    setManualToken('');
    if (activeTab === 'CAMERA') {
      startScanner();
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
          <div className="space-y-3">
            {/* Live Camera Viewport */}
            <div className="relative aspect-square max-h-[280px] w-full mx-auto bg-black rounded-2xl overflow-hidden flex items-center justify-center border-2 border-indigo-500/30 shadow-xl">
              <div id="student-qr-reader" className="w-full h-full object-cover" />

              {hasCameraError && (
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
