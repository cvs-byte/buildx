import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { ZXingQRScannerEngine } from './ZXingQRScannerEngine';
import { attendanceApi } from '../../api/attendance.api';
import { useToast } from '../../hooks/useToast';
import { parseStudentQR } from '../../utils/qrParser';
import type { QRValidateResponse } from '../../types/attendance.types';
import {
  Camera,
  CheckCircle2,
  XCircle,
  RefreshCw,
  KeyRound,
  Clock,
  ShieldAlert,
  Play,
  Square,
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

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isStopped, setIsStopped] = useState<boolean>(false);
  const [, setStatusText] = useState<string>('Initializing camera...');

  const isProcessingRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      isProcessingRef.current = false;
      setIsPaused(false);
      setIsStopped(false);
      setScanResult(null);
      setStatusText('Initializing camera...');
    }
  }, [isOpen]);

  const handleValidateToken = useCallback(
    async (tokenToValidate: string) => {
      if (isProcessingRef.current || isStopped) return;
      if (!tokenToValidate || tokenToValidate.trim() === '') {
        showToast('error', 'Please provide a valid QR session token.');
        return;
      }

      isProcessingRef.current = true;
      setIsPaused(true);
      setIsValidating(true);
      setScanResult(null);

      console.log('[QR] Raw decoded value:', tokenToValidate);
      const parsed = parseStudentQR(tokenToValidate);
      console.log('[QR] Parsed data:', parsed);

      try {
        const response = await attendanceApi.validateQR({ token: tokenToValidate.trim() });
        console.log('[ATTENDANCE] Response:', response);
        setScanResult(response);

        if (response.success && response.status === 'PRESENT') {
          showToast('success', 'Attendance marked PRESENT!');
          if (onSuccess) onSuccess();
        } else if (response.status === 'ALREADY_RECORDED') {
          showToast('info', 'Attendance already recorded for this session today.');
        } else {
          showToast('error', response.message || 'QR validation failed.');
        }
      } catch (err: any) {
        setScanResult({
          success: false,
          status: 'INVALID_TOKEN',
          message: err.message || 'Network error while validating attendance. Please try again.',
        });
        showToast('error', 'Unable to connect to attendance server. Please try again.');
      } finally {
        setIsValidating(false);
      }
    },
    [onSuccess, showToast, isStopped]
  );

  const handleResetScan = () => {
    setScanResult(null);
    setManualToken('');
    isProcessingRef.current = false;
    setIsPaused(false);
    setIsStopped(false);
    setStatusText('Camera ready — scan a student QR');
  };

  const renderResultCard = (res: QRValidateResponse) => {
    switch (res.status) {
      case 'PRESENT':
        return (
          <div className="p-6 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-center space-y-3 text-emerald-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">✓ Attendance Marked</h3>
            <p className="text-sm font-semibold text-emerald-300">
              You are marked PRESENT.
            </p>
            <div className="text-xs text-emerald-400 bg-emerald-900/40 p-3 rounded-lg flex justify-around">
              <span>Class: {res.className || 'Class 10'} - {res.section || 'A'}</span>
              <span>Time: {res.markedAt || new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        );

      case 'ALREADY_RECORDED':
        return (
          <div className="p-6 bg-blue-950/60 border border-blue-800 rounded-2xl text-center space-y-3 text-blue-200">
            <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">✓ Already Recorded</h3>
            <p className="text-sm text-blue-300">
              Your attendance was already marked for this session.
            </p>
          </div>
        );

      case 'EXPIRED':
        return (
          <div className="p-6 bg-amber-950/60 border border-amber-800 rounded-2xl text-center space-y-3 text-amber-200">
            <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
              <Clock size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">QR Code Expired</h3>
            <p className="text-sm text-amber-300">
              Ask your teacher to generate a new classroom QR code.
            </p>
          </div>
        );

      case 'WRONG_CLASS':
      case 'UNAUTHORIZED':
        return (
          <div className="p-6 bg-rose-950/60 border border-rose-800 rounded-2xl text-center space-y-3 text-rose-200">
            <div className="w-14 h-14 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto shadow-md">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">Attendance Not Allowed</h3>
            <p className="text-sm text-rose-300">
              {res.message || 'You are not enrolled in this class or section.'}
            </p>
          </div>
        );

      default:
        return (
          <div className="p-6 bg-red-950/60 border border-red-800 rounded-2xl text-center space-y-3 text-red-200">
            <div className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto shadow-md">
              <XCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">Invalid QR Code</h3>
            <p className="text-sm text-red-300">
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
      title="SCAN STUDENT QR"
      subtitle="Scan your classroom QR code to log your present status."
      maxWidth="md"
    >
      <ErrorBoundary
        fallbackTitle="Scanner Interface Error"
        fallbackMessage="An unexpected error occurred. Please try again."
        onRetry={handleResetScan}
      >
        <div className="space-y-4">
          {!scanResult && (
            <div className="flex bg-slate-800 p-1 rounded-xl">
              <button
                className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'CAMERA' ? 'bg-slate-700 text-indigo-400 shadow' : 'text-slate-400'
                }`}
                onClick={() => setActiveTab('CAMERA')}
              >
                <Camera size={16} /> Live Scanner
              </button>
              <button
                className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'MANUAL' ? 'bg-slate-700 text-indigo-400 shadow' : 'text-slate-400'
                }`}
                onClick={() => setActiveTab('MANUAL')}
              >
                <KeyRound size={16} /> Code Token Entry
              </button>
            </div>
          )}

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
              <ZXingQRScannerEngine
                active={isOpen && activeTab === 'CAMERA' && !isStopped}
                isPaused={isPaused}
                onScan={handleValidateToken}
                onStatusChange={(st) => setStatusText(st)}
              />

              <div className="flex items-center justify-between gap-2 pt-1">
                {isPaused || isStopped ? (
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Play size={14} />}
                    onClick={handleResetScan}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                  >
                    Scan Another QR
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Square size={14} />}
                    onClick={() => setIsStopped(true)}
                    className="flex-1 text-slate-300 border-slate-700 hover:bg-slate-800"
                  >
                    Stop Scanner
                  </Button>
                )}
              </div>
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
      </ErrorBoundary>
    </Modal>
  );
};
