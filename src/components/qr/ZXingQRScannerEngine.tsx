import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserQRCodeReader, BarcodeFormat, IScannerControls } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';
import jsQR from 'jsqr';
import { Camera, AlertTriangle, SwitchCamera, ShieldAlert, Upload, RefreshCw, KeyRound, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { decodeQRFromImageFile, ImageQRDecodeResult } from '../../utils/qrImageDecoder';

export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
}

export interface ZXingQRScannerEngineProps {
  onScan: (decodedText: string) => void;
  onError?: (errorMessage: string) => void;
  onStatusChange?: (status: string) => void;
  isPaused?: boolean;
  active?: boolean;
}

export const ZXingQRScannerEngine: React.FC<ZXingQRScannerEngineProps> = ({
  onScan,
  onError,
  onStatusChange,
  isPaused = false,
  active = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsQRIntervalRef = useRef<number | null>(null);

  const [availableDevices, setAvailableDevices] = useState<CameraDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSecure, setIsSecure] = useState<boolean>(true);

  // Diagnostics & Heartbeat state (Section 5 & 9 & 11)
  const [rawDecodedText, setRawDecodedText] = useState<string | null>(null);
  const [scanAttempts, setScanAttempts] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [cameraStateText, setCameraStateText] = useState<string>('Initializing');
  const [manualTestInput, setManualTestInput] = useState<string>('');
  const [imageDecodeInfo, setImageDecodeInfo] = useState<ImageQRDecodeResult | null>(null);
  const [isDecodingImage, setIsDecodingImage] = useState<boolean>(false);

  const detectedLockRef = useRef<boolean>(false);

  // Check Secure Context (HTTPS or localhost)
  useEffect(() => {
    const secure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    setIsSecure(secure);
    if (!secure) {
      const err = 'Camera access requires HTTPS context. Please load site over https://';
      setCameraError(err);
      if (onError) onError(err);
    }
  }, [onError]);

  // Clean up media streams, timers, and ZXing controls completely (Section 26 & 27)
  const stopScannerControls = useCallback(() => {
    if (jsQRIntervalRef.current !== null) {
      clearInterval(jsQRIntervalRef.current);
      jsQRIntervalRef.current = null;
    }

    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (err) {
        console.warn('[ZXING CONTROLS STOP WARN]', err);
      }
      controlsRef.current = null;
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn('[MEDIASTREAM STOP WARN]', err);
      }
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch (err) {
        console.warn('[VIDEO SRC CLEAR WARN]', err);
      }
    }
  }, []);

  const handleQRDetected = useCallback(
    (text: string) => {
      if (detectedLockRef.current || isPaused) return;
      const cleanText = text.trim();
      if (!cleanText) return;

      detectedLockRef.current = true;
      console.log('[QR DETECTED]', cleanText);
      console.log('[QR RAW]', JSON.stringify(cleanText));
      setRawDecodedText(cleanText);
      onScan(cleanText);
    },
    [isPaused, onScan]
  );

  // Main Camera Scanner Initialization using ZXing + jsQR dual-engine (Section 3, 4, 5, 6, 7)
  const startCameraScanner = useCallback(
    async (targetDeviceId?: string) => {
      stopScannerControls();
      detectedLockRef.current = false;
      setCameraError(null);
      setIsInitializing(true);
      setCameraStateText('Initializing camera...');
      if (onStatusChange) onStatusChange('Initializing camera...');

      if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        const err = 'Camera permission denied or non-HTTPS environment.';
        setCameraError(err);
        setIsInitializing(false);
        setCameraStateText('Camera unavailable');
        if (onStatusChange) onStatusChange('Camera unavailable');
        return;
      }

      try {
        // High-precision ZXing hints: TRY_HARDER = true for low contrast / tilted codes
        const hints = new Map();
        hints.set(DecodeHintType.TRY_HARDER, true);
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);

        if (!codeReaderRef.current) {
          codeReaderRef.current = new BrowserQRCodeReader(hints, {
            delayBetweenScanAttempts: 80,
            delayBetweenScanSuccess: 1000,
          });
        }

        // List available camera devices (Section 4)
        let devices: MediaDeviceInfo[] = [];
        try {
          devices = await BrowserQRCodeReader.listVideoInputDevices();
          const mappedDevices: CameraDeviceInfo[] = devices.map((d, idx) => ({
            deviceId: d.deviceId,
            label: d.label || `Camera ${idx + 1}`,
          }));
          setAvailableDevices(mappedDevices);
        } catch (err) {
          console.warn('[DEVICE LIST WARN]', err);
        }

        // Prefer rear/environment camera
        let chosenDeviceId = targetDeviceId || selectedDeviceId;
        if (!chosenDeviceId && devices.length > 0) {
          const rearCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment') ||
              d.label.toLowerCase().includes('facing back')
          );
          chosenDeviceId = rearCam ? rearCam.deviceId : devices[devices.length - 1].deviceId;
        }
        setSelectedDeviceId(chosenDeviceId || '');

        const videoElement = videoRef.current;
        if (!videoElement) {
          setIsInitializing(false);
          setCameraError('Video element not mounted.');
          return;
        }

        videoElement.setAttribute('autoplay', 'true');
        videoElement.setAttribute('playsinline', 'true');
        videoElement.setAttribute('muted', 'true');

        const constraints: MediaStreamConstraints = {
          video: chosenDeviceId
            ? { deviceId: { exact: chosenDeviceId } }
            : {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 },
              },
          audio: false,
        };

        // 1. Start stream & ZXing continuous decoder
        const controls = await codeReaderRef.current.decodeFromConstraints(
          constraints,
          videoElement,
          (result, error) => {
            setScanAttempts((prev) => prev + 1);

            if (result) {
              const text = result.getText();
              if (text && text.trim() !== '') {
                handleQRDetected(text);
              }
            }
            // Non-fatal missed frame errors (NotFoundException) are handled silently
          }
        );

        controlsRef.current = controls;

        // 2. Camera Health Check & Readiness verification (Section 5)
        let verifyRetries = 0;
        while ((videoElement.readyState < 2 || videoElement.videoWidth === 0) && verifyRetries < 25) {
          await new Promise((r) => setTimeout(r, 80));
          verifyRetries++;
        }

        const width = videoElement.videoWidth || 0;
        const height = videoElement.videoHeight || 0;
        setVideoDimensions({ width, height });

        console.log('Camera ready:', {
          readyState: videoElement.readyState,
          width,
          height,
        });

        // 3. Parallel jsQR 60fps canvas sampling engine for instant sub-100ms detection
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        jsQRIntervalRef.current = window.setInterval(() => {
          if (detectedLockRef.current || isPaused || !videoElement || videoElement.readyState < 2) return;
          if (ctx && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });
            if (code && code.data && code.data.trim() !== '') {
              handleQRDetected(code.data);
            }
          }
        }, 100);

        setIsInitializing(false);
        setCameraStateText('Camera ready — scan a student QR');
        if (onStatusChange) onStatusChange('Camera ready — scan a student QR');
      } catch (err: any) {
        console.error('[ZXING CAMERA INIT ERROR]', err);
        setIsInitializing(false);

        let userMsg = 'Camera initialization failed.';
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          userMsg = 'Camera permission denied. Please allow camera access in browser settings and press Retry.';
          if (onStatusChange) onStatusChange('Camera permission denied');
        } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
          userMsg = 'No camera device found on this device.';
          if (onStatusChange) onStatusChange('Camera unavailable');
        } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
          userMsg = 'Camera is currently in use by another application.';
          if (onStatusChange) onStatusChange('Camera unavailable');
        } else {
          if (onStatusChange) onStatusChange('Camera unavailable');
        }

        setCameraError(userMsg);
        setCameraStateText(userMsg);
        if (onError) onError(userMsg);
      }
    },
    [selectedDeviceId, stopScannerControls, handleQRDetected, onError, onStatusChange, isPaused]
  );

  // Section 9: DECODER HEARTBEAT DIAGNOSTICS
  useEffect(() => {
    let frameAttempts = 0;
    const heartbeat = setInterval(() => {
      frameAttempts++;
      const v = videoRef.current;
      if (v) {
        console.log('[QR SCANNER]', {
          attempts: frameAttempts,
          videoWidth: v.videoWidth,
          videoHeight: v.videoHeight,
          readyState: v.readyState,
        });
      }
    }, 2000);

    return () => clearInterval(heartbeat);
  }, []);

  // Manage start/stop lifecycle based on active / isPaused props
  useEffect(() => {
    if (active && !isPaused && !cameraError) {
      startCameraScanner();
    } else if (isPaused) {
      stopScannerControls();
    }
    return () => {
      stopScannerControls();
    };
  }, [active, isPaused]);

  // Handle Switch Camera Device (Section 4 & 18)
  const handleSwitchCamera = () => {
    if (availableDevices.length <= 1) return;
    const currentIndex = availableDevices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % availableDevices.length;
    const nextDevice = availableDevices[nextIndex];
    setSelectedDeviceId(nextDevice.deviceId);
    startCameraScanner(nextDevice.deviceId);
  };

  // Section 10 & 32: IMAGE DECODER TEST (Scan QR from Image)
  const handleTestImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecodingImage(true);
    setImageDecodeInfo(null);

    try {
      console.log('[IMAGE DECODER INITIATED] Processing uploaded file:', file.name, file.type, file.size, 'bytes');
      const res = await decodeQRFromImageFile(file);
      setImageDecodeInfo(res);

      if (res.success && res.text) {
        console.log('[IMAGE QR DECODE SUCCESS]', res.text);
        setRawDecodedText(res.text);
        onScan(res.text);
      } else {
        console.warn('[IMAGE QR DECODE FAILED]', res.error);
        if (onError) onError('Unable to decode this QR image.');
      }
    } catch (err: any) {
      console.error('[IMAGE QR DECODE ERROR]', err);
      if (onError) onError('Unable to decode this QR image.');
    } finally {
      setIsDecodingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* HTML Video Viewport */}
      <div className="relative w-full aspect-square max-h-[320px] mx-auto bg-black rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-2xl flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isInitializing || cameraError || !isSecure ? 'opacity-20' : 'opacity-100'
          }`}
        />

        {/* Large Scanning Target Overlay (Section 8) */}
        {!cameraError && isSecure && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
            <div className="relative w-5/6 aspect-square border-2 border-indigo-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] flex items-center justify-center overflow-hidden">
              {!isPaused && !isInitializing && (
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_14px_#38bdf8] animate-pulse" />
              )}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-sm" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-sm" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-sm" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-sm" />

              <div className="absolute bottom-3 inset-x-0 text-center text-[11px] font-semibold text-cyan-300 bg-slate-950/70 py-1 px-2 rounded-full mx-auto w-fit border border-cyan-500/30">
                Move QR inside the frame • Hold steady
              </div>
            </div>
          </div>
        )}

        {/* Camera Loading State */}
        {isInitializing && !cameraError && (
          <div className="absolute inset-0 bg-slate-950/80 text-white flex flex-col items-center justify-center p-4 text-center space-y-2 z-10">
            <Camera size={32} className="text-indigo-400 animate-bounce" />
            <p className="text-xs font-semibold text-slate-200">Initializing camera stream...</p>
          </div>
        )}

        {/* Insecure Context Warning */}
        {!isSecure && (
          <div className="absolute inset-0 bg-slate-950/95 text-white flex flex-col items-center justify-center p-4 text-center space-y-3 z-20">
            <ShieldAlert size={36} className="text-rose-400" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-300">HTTPS Required</h4>
              <p className="text-xs text-slate-300 max-w-xs">
                Camera scanning requires HTTPS context. Please load site over https://
              </p>
            </div>
          </div>
        )}

        {/* Camera Error State (Section 24) */}
        {cameraError && isSecure && (
          <div className="absolute inset-0 bg-slate-950/90 text-white flex flex-col items-center justify-center p-4 text-center space-y-3 z-20">
            <AlertTriangle size={36} className="text-amber-400" />
            <p className="text-xs text-slate-200 font-medium max-w-xs">{cameraError}</p>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => startCameraScanner()}>
                <RefreshCw size={14} className="mr-1" /> Retry Camera
              </Button>
              {availableDevices.length > 1 && (
                <Button size="sm" variant="outline" onClick={handleSwitchCamera}>
                  <SwitchCamera size={14} className="mr-1" /> Switch Cam
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Diagnostics Status Banner (Section 5, 9, 11) */}
      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs font-mono text-slate-300 flex flex-wrap justify-between items-center gap-2">
        <div>
          Camera: <span className="text-emerald-400 font-bold">{videoDimensions.width > 0 ? `READY (${videoDimensions.width}×${videoDimensions.height})` : 'INITIALIZING'}</span>
        </div>
        <div>
          Decoder: <span className="text-cyan-400 font-bold">{isPaused ? 'PAUSED' : 'RUNNING'}</span>
        </div>
        <div>
          QR: <span className="text-purple-300">{rawDecodedText ? 'DETECTED ✓' : 'SEARCHING'}</span>
        </div>
      </div>

      {/* Standalone Raw Decoded Output Display Box (Section 3 & 31) */}
      {rawDecodedText && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-left space-y-1 font-mono text-xs text-emerald-200 shadow-lg">
          <div className="flex justify-between items-center font-bold text-emerald-400">
            <span>✓ RAW QR DECODER OUTPUT</span>
            <span className="text-[10px] text-emerald-500">{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="break-all font-bold text-white bg-slate-900/80 p-2 rounded border border-emerald-900">
            RAW: {rawDecodedText}
          </div>
        </div>
      )}

      {/* Section 7: Image Decoding Diagnostic Display Panel (Dev Mode & Diagnostic toolbar) */}
      {imageDecodeInfo && (
        <div className="p-3.5 bg-slate-900 border border-slate-700 rounded-xl space-y-2 font-mono text-xs text-slate-200 shadow-xl text-left">
          <div className="flex justify-between items-center font-bold text-indigo-400 border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Upload size={14} className="text-cyan-400" /> IMAGE QR DECODER DIAGNOSTICS
            </span>
            <span className={imageDecodeInfo.success ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-rose-400 font-bold flex items-center gap-1'}>
              {imageDecodeInfo.success ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              {imageDecodeInfo.success ? '✓ DECODED' : '✕ FAILED'}
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-300">
            <div>Image loaded: <strong className="text-emerald-400">YES</strong></div>
            <div>Image dimensions: <strong>{imageDecodeInfo.dimensions.width} × {imageDecodeInfo.dimensions.height}</strong></div>
            {imageDecodeInfo.attempts.map((att) => (
              <div key={att.attemptIndex} className="flex justify-between items-center py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">Decoder attempt {att.attemptIndex} ({att.engine}):</span>
                <strong className={att.status === 'SUCCESS' ? 'text-emerald-400' : 'text-slate-500'}>
                  {att.status}
                </strong>
              </div>
            ))}
          </div>

          {imageDecodeInfo.success && imageDecodeInfo.text && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="block font-bold text-emerald-400">Decoded:</span>
              <div className="p-2 bg-slate-950 rounded border border-emerald-800 text-white break-all font-bold">
                {imageDecodeInfo.text}
              </div>
            </div>
          )}

          {!imageDecodeInfo.success && (
            <div className="pt-1 text-rose-400 font-bold text-center">
              Unable to decode this QR image.
            </div>
          )}
        </div>
      )}

      {/* Development Diagnostic Toolbar (Section 10 & 32) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleTestImageUpload}
        />
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Upload size={14} />}
          onClick={() => fileInputRef.current?.click()}
          className="text-xs"
        >
          Scan QR from Image
        </Button>

        {availableDevices.length > 1 && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<SwitchCamera size={14} />}
            onClick={handleSwitchCamera}
            className="text-xs"
          >
            Switch Camera ({availableDevices.length})
          </Button>
        )}
      </div>

      {/* Section 33: Manual QR Text Test Input */}
      {import.meta.env.DEV && (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-left">
          <div className="text-[11px] font-bold text-indigo-400 font-mono flex items-center gap-1">
            <KeyRound size={12} /> TEST DECODED QR TEXT INPUT (DEV DIAGNOSTIC)
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
              placeholder='e.g. STU001 or {"v":1,"type":"student","studentId":"STU001"}'
              value={manualTestInput}
              onChange={(e) => setManualTestInput(e.target.value)}
            />
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                if (manualTestInput.trim()) {
                  console.log('[TEST MANUAL QR TEXT]', manualTestInput.trim());
                  handleQRDetected(manualTestInput.trim());
                }
              }}
            >
              Test Process
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
