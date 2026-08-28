import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { RefreshCw, Camera, AlertTriangle, SwitchCamera, ShieldAlert } from 'lucide-react';
import { Button } from '../common/Button';

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

  const [availableDevices, setAvailableDevices] = useState<CameraDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSecure, setIsSecure] = useState<boolean>(true);

  // Check Secure Context (HTTPS or localhost)
  useEffect(() => {
    const secure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    setIsSecure(secure);
    if (!secure) {
      const err = 'Camera access requires HTTPS context. Please load over https://';
      setCameraError(err);
      if (onError) onError(err);
    }
  }, [onError]);

  // Clean up media tracks and ZXing controls completely
  const stopCameraStream = useCallback(() => {
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
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
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

  // Main Camera Scanner Initialization
  const startCamera = useCallback(
    async (targetDeviceId?: string) => {
      stopCameraStream();
      setCameraError(null);
      setIsInitializing(true);
      if (onStatusChange) onStatusChange('Initializing camera...');

      if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        const err = 'Camera permission denied or non-HTTPS environment.';
        setCameraError(err);
        setIsInitializing(false);
        if (onStatusChange) onStatusChange('Camera unavailable');
        return;
      }

      try {
        if (!codeReaderRef.current) {
          codeReaderRef.current = new BrowserQRCodeReader();
        }

        // List video input devices
        let devices: MediaDeviceInfo[] = [];
        try {
          devices = await BrowserQRCodeReader.listVideoInputDevices();
          const mappedDevices: CameraDeviceInfo[] = devices.map((d, idx) => ({
            deviceId: d.deviceId,
            label: d.label || `Camera ${idx + 1}`,
          }));
          setAvailableDevices(mappedDevices);
        } catch {
          // Device listing warning
        }

        // Determine device to use (prefer rear/environment camera)
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

        // Media Constraints preferring facingMode: environment
        const constraints: MediaStreamConstraints = {
          video: chosenDeviceId
            ? { deviceId: { exact: chosenDeviceId } }
            : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          if (onStatusChange) onStatusChange('Camera ready — scan a student QR');
          setIsInitializing(false);

          // Decode continuous frames using ZXing
          const controls = await codeReaderRef.current.decodeFromVideoElement(
            videoRef.current,
            (result, error, controls) => {
              if (result) {
                const text = result.getText();
                if (text && text.trim() !== '') {
                  onScan(text.trim());
                }
              }
            }
          );
          controlsRef.current = controls;
        }
      } catch (err: any) {
        console.error('[ZXING CAMERA INIT ERROR]', err);
        setIsInitializing(false);

        let userMsg = 'Camera initialization failed.';
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          userMsg = 'Camera permission denied. Please allow camera access in browser settings.';
          if (onStatusChange) onStatusChange('Camera permission denied');
        } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
          userMsg = 'No camera device found on this device.';
          if (onStatusChange) onStatusChange('Camera unavailable');
        } else {
          if (onStatusChange) onStatusChange('Camera unavailable');
        }

        setCameraError(userMsg);
        if (onError) onError(userMsg);
      }
    },
    [selectedDeviceId, stopCameraStream, onScan, onError, onStatusChange]
  );

  // Handle Switch Camera Device
  const handleSwitchCamera = () => {
    if (availableDevices.length <= 1) return;
    const currentIndex = availableDevices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % availableDevices.length;
    const nextDevice = availableDevices[nextIndex];
    setSelectedDeviceId(nextDevice.deviceId);
    startCamera(nextDevice.deviceId);
  };

  // Manage start/stop lifecycle based on active / isPaused props
  useEffect(() => {
    if (active && !isPaused && !cameraError) {
      startCamera();
    } else if (isPaused) {
      if (controlsRef.current) {
        try {
          controlsRef.current.stop();
        } catch {}
      }
    }
    return () => {
      stopCameraStream();
    };
  }, [active, isPaused]);

  return (
    <div className="relative w-full aspect-square max-h-[300px] mx-auto bg-black rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-2xl flex items-center justify-center">
      {/* HTML Video Viewport */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isInitializing || cameraError || !isSecure ? 'opacity-20' : 'opacity-100'
        }`}
      />

      {/* Target Framing Overlay */}
      {!cameraError && isSecure && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
          {/* Outer Dim Mask */}
          <div className="relative w-4/5 aspect-square border-2 border-indigo-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] flex items-center justify-center overflow-hidden">
            {/* Animated Laser Scanning Beam */}
            {!isPaused && !isInitializing && (
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse" />
            )}

            {/* Corner Target Markers */}
            <div className="absolute top-2 left-2 w-5 h-5 border-t-4 border-l-4 border-cyan-400 rounded-tl-sm" />
            <div className="absolute top-2 right-2 w-5 h-5 border-t-4 border-r-4 border-cyan-400 rounded-tr-sm" />
            <div className="absolute bottom-2 left-2 w-5 h-5 border-b-4 border-l-4 border-cyan-400 rounded-bl-sm" />
            <div className="absolute bottom-2 right-2 w-5 h-5 border-b-4 border-r-4 border-cyan-400 rounded-br-sm" />
          </div>
        </div>
      )}

      {/* Camera Loading Spinner */}
      {isInitializing && !cameraError && (
        <div className="absolute inset-0 bg-slate-950/80 text-white flex flex-col items-center justify-center p-4 text-center space-y-2 z-10">
          <Camera size={32} className="text-indigo-400 animate-bounce" />
          <p className="text-xs font-semibold text-slate-200">Initializing camera...</p>
        </div>
      )}

      {/* Insecure Context Warning */}
      {!isSecure && (
        <div className="absolute inset-0 bg-slate-950/95 text-white flex flex-col items-center justify-center p-4 text-center space-y-3 z-20">
          <ShieldAlert size={36} className="text-rose-400" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-300">HTTPS Required</h4>
            <p className="text-xs text-slate-300 max-w-xs">
              Browsers restrict camera access to HTTPS connections.
            </p>
          </div>
        </div>
      )}

      {/* Camera Failure Error State */}
      {cameraError && isSecure && (
        <div className="absolute inset-0 bg-slate-950/90 text-white flex flex-col items-center justify-center p-4 text-center space-y-3 z-20">
          <AlertTriangle size={36} className="text-amber-400" />
          <p className="text-xs text-slate-200 font-medium max-w-xs">{cameraError}</p>
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={() => startCamera()}>
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
  );
};
