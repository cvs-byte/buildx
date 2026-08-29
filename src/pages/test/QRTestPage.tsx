import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserQRCodeReader, BarcodeFormat, IScannerControls } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';
import { Camera, RefreshCw, Play, Square, Upload, ShieldCheck, ShieldAlert, Cpu, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { decodeQRFromImageFile, ImageQRDecodeResult } from '../../utils/qrImageDecoder';

export const QRTestPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // STEP 3: Mandatory Camera & System Diagnostics
  const [isSecure, setIsSecure] = useState<boolean>(true);
  const [cameraPermission, setCameraPermission] = useState<'GRANTED' | 'DENIED' | 'UNKNOWN'>('UNKNOWN');
  const [cameraState, setCameraState] = useState<'INITIALIZING' | 'READY' | 'ERROR' | 'STOPPED'>('STOPPED');
  const [videoResolution, setVideoResolution] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [decoderState, setDecoderState] = useState<'STARTING' | 'RUNNING' | 'STOPPED'>('STOPPED');
  const [qrState, setQrState] = useState<'SEARCHING' | 'DETECTED'>('SEARCHING');

  // Diagnostics & Devices
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rawQRResult, setRawQRResult] = useState<string | null>(null);
  const [imageQRResult, setImageQRResult] = useState<string | null>(null);
  const [heartbeatCount, setHeartbeatCount] = useState<number>(0);

  // Sample Test QR text generator helper
  const [sampleQRText, setSampleQRText] = useState<string>('QR-TEST-123456');

  // 1. Verify Secure Context (HTTPS or localhost)
  useEffect(() => {
    const secure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    setIsSecure(secure);
  }, []);

  // STEP 9: Stop Camera & Stream Track Cleanup
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
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn('[MEDIASTREAM TRACK STOP WARN]', err);
      }
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      try {
        BrowserQRCodeReader.cleanVideoSource(videoRef.current);
      } catch (err) {
        console.warn('[CLEAN VIDEO SOURCE WARN]', err);
      }
    }

    setCameraState('STOPPED');
    setDecoderState('STOPPED');
    setVideoResolution({ width: 0, height: 0 });
  }, []);

  // STEP 4, 6 & 10: Start Camera & Enumerate Devices
  const startCameraStream = useCallback(async (targetDeviceId?: string) => {
    stopCameraStream();
    setErrorMessage(null);
    setRawQRResult(null);
    setCameraState('INITIALIZING');
    setDecoderState('STARTING');
    setQrState('SEARCHING');

    try {
      // High-precision ZXing options
      const hints = new Map();
      hints.set(DecodeHintType.TRY_HARDER, true);
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);

      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserQRCodeReader(hints, {
          delayBetweenScanAttempts: 80,
          delayBetweenScanSuccess: 1000,
        });
      }

      // STEP 10: Enumerate Video Inputs
      let devices: MediaDeviceInfo[] = [];
      try {
        devices = await BrowserQRCodeReader.listVideoInputDevices();
        setAvailableDevices(devices);
        console.log('[MEDIA DEVICES ENUMERATED]', devices);
      } catch (err) {
        console.warn('[ENUMERATE DEVICES WARN]', err);
      }

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
        setErrorMessage('Video DOM element not found.');
        setCameraState('ERROR');
        return;
      }

      // Ensure video element properties for mobile & browser compatibility
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

      // Direct getUserMedia call to verify stream & resolution first (STEP 4)
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      setCameraPermission('GRANTED');

      videoElement.srcObject = stream;
      await videoElement.play();

      // Verify videoWidth & videoHeight > 0 (STEP 4 & 6)
      let verifyRetries = 0;
      while ((videoElement.readyState < 2 || videoElement.videoWidth === 0) && verifyRetries < 25) {
        await new Promise((r) => setTimeout(r, 100));
        verifyRetries++;
      }

      const width = videoElement.videoWidth || 0;
      const height = videoElement.videoHeight || 0;
      setVideoResolution({ width, height });

      console.log('Camera ready:', {
        readyState: videoElement.readyState,
        width,
        height,
      });

      if (width === 0 || height === 0) {
        setErrorMessage('Camera stream returned 0x0 video dimensions. Video preview failed.');
        setCameraState('ERROR');
        return;
      }

      setCameraState('READY');

      // STEP 6: Start ZXing continuous decoder only after video is ready
      const controls = await codeReaderRef.current.decodeFromVideoElement(
        videoElement,
        (result, error) => {
          if (result) {
            const rawText = result.getText();
            // STEP 7: Log every successful decode
            console.log('[QR SUCCESS]', JSON.stringify(rawText));
            setRawQRResult(rawText);
            setQrState('DETECTED');
          }
          // STEP 8: Missed frame errors (NotFoundException) are handled silently
        }
      );

      controlsRef.current = controls;
      setDecoderState('RUNNING');
    } catch (err: any) {
      console.error('[QR TEST CAMERA INIT ERROR]', err);
      setCameraState('ERROR');
      setDecoderState('STOPPED');

      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCameraPermission('DENIED');
        setErrorMessage('Camera permission denied. Allow camera access in browser settings and press Start Camera.');
      } else {
        setErrorMessage(err?.message || 'Failed to initialize camera stream.');
      }
    }
  }, [selectedDeviceId, stopCameraStream]);

  // STEP 9: Restart Camera Helper
  const restartCameraStream = useCallback(async () => {
    stopCameraStream();
    await new Promise((r) => setTimeout(r, 300));
    await startCameraStream();
  }, [stopCameraStream, startCameraStream]);

  // Heartbeat logger for diagnostics (STEP 3)
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartbeatCount((prev) => prev + 1);
      const v = videoRef.current;
      if (v && v.readyState >= 2) {
        setVideoResolution({ width: v.videoWidth, height: v.videoHeight });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [testADiagnostics, setTestADiagnostics] = useState<ImageQRDecodeResult | null>(null);

  // STEP 11 & 12: Test A — Image QR Upload Decoder Test
  const handleTestImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTestADiagnostics(null);
    setImageQRResult(null);

    try {
      const res = await decodeQRFromImageFile(file);
      setTestADiagnostics(res);

      if (res.success && res.text) {
        console.log('[IMAGE QR SUCCESS]', res.text);
        setImageQRResult(res.text);
      } else {
        alert('Unable to decode this QR image.');
      }
    } catch (err: any) {
      console.warn('[IMAGE QR FAILED]', err);
      alert('Unable to decode QR from image file.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-400 font-mono flex items-center gap-2">
            <Cpu size={24} /> STANDALONE QR CAMERA DIAGNOSTIC PAGE (/qr-test)
          </h1>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-3 py-1 rounded-full font-mono font-bold">
            ZERO API DEPENDENCY
          </span>
        </div>
        <p className="text-xs text-slate-400">
          This diagnostic page isolates the camera pipeline (<code className="text-cyan-300">CAMERA → VIDEO → ZXing → RAW TEXT</code>) from Users API, Attendance API, and backend servers.
        </p>
      </div>

      {/* STEP 3 & 16: Mandatory Camera & System Diagnostics Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="block text-[10px] text-slate-400 uppercase font-mono font-bold">Secure Context</span>
          <span className={`block text-xs font-bold ${isSecure ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isSecure ? '✓ YES (HTTPS/localhost)' : '✕ NO'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="block text-[10px] text-slate-400 uppercase font-mono font-bold">Camera Permission</span>
          <span className={`block text-xs font-bold ${cameraPermission === 'GRANTED' ? 'text-emerald-400' : cameraPermission === 'DENIED' ? 'text-rose-400' : 'text-amber-400'}`}>
            {cameraPermission}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="block text-[10px] text-slate-400 uppercase font-mono font-bold">Camera Stream</span>
          <span className={`block text-xs font-bold ${cameraState === 'READY' ? 'text-emerald-400' : cameraState === 'ERROR' ? 'text-rose-400' : 'text-amber-400'}`}>
            {cameraState}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="block text-[10px] text-slate-400 uppercase font-mono font-bold">Video Resolution</span>
          <span className="block text-xs font-bold text-cyan-300 font-mono">
            {videoResolution.width} × {videoResolution.height}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="block text-[10px] text-slate-400 uppercase font-mono font-bold">Decoder State</span>
          <span className={`block text-xs font-bold ${decoderState === 'RUNNING' ? 'text-cyan-400' : 'text-slate-400'}`}>
            {decoderState}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="block text-[10px] text-slate-400 uppercase font-mono font-bold">QR Search State</span>
          <span className={`block text-xs font-bold ${qrState === 'DETECTED' ? 'text-emerald-400' : 'text-purple-300'}`}>
            {qrState} ({heartbeatCount})
          </span>
        </div>
      </div>

      {/* STEP 9 & 10: Camera Control Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Play size={14} />}
            onClick={() => startCameraStream()}
            disabled={cameraState === 'READY'}
          >
            START CAMERA
          </Button>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Square size={14} />}
            onClick={stopCameraStream}
            disabled={cameraState === 'STOPPED'}
            className="text-slate-300 border-slate-700"
          >
            STOP CAMERA
          </Button>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw size={14} />}
            onClick={restartCameraStream}
            className="text-indigo-400 border-indigo-500/40"
          >
            RESTART CAMERA
          </Button>
        </div>

        {/* Camera Device Selector Dropdown */}
        {availableDevices.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Camera:</span>
            <select
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
              value={selectedDeviceId}
              onChange={(e) => {
                setSelectedDeviceId(e.target.value);
                startCameraStream(e.target.value);
              }}
            >
              {availableDevices.map((d, idx) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* STEP 5: FULL UNCROPPED VIDEO PREVIEW */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
          <Camera size={16} className="text-indigo-400" />
          Full Uncropped Camera Feed (No CSS Crop / No Canvas Mask)
        </h3>

        <div className="relative w-full bg-black rounded-xl overflow-hidden min-h-[300px] border border-slate-800 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto max-h-[600px] object-contain"
          />

          {cameraState === 'STOPPED' && (
            <div className="absolute inset-0 bg-slate-950/90 text-white flex flex-col items-center justify-center p-4 text-center space-y-3">
              <Camera size={40} className="text-slate-600" />
              <p className="text-xs text-slate-400 font-mono">Camera is currently stopped.</p>
              <Button size="sm" variant="primary" onClick={() => startCameraStream()}>
                START CAMERA
              </Button>
            </div>
          )}

          {cameraState === 'ERROR' && (
            <div className="absolute inset-0 bg-slate-950/95 text-white flex flex-col items-center justify-center p-4 text-center space-y-3">
              <AlertTriangle size={40} className="text-amber-400" />
              <p className="text-xs text-slate-200 max-w-md font-mono">{errorMessage}</p>
              <Button size="sm" variant="outline" onClick={() => startCameraStream()}>
                RETRY CAMERA
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* STEP 7 & 14: RAW QR DECODED CONTENT DISPLAY BOX */}
      {rawQRResult ? (
        <div className="bg-emerald-950/80 border-2 border-emerald-500 p-5 rounded-2xl space-y-3 shadow-2xl animate-pulse">
          <div className="flex justify-between items-center text-emerald-400 font-mono font-black text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={20} /> ====================================
            </span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
          <h2 className="text-lg font-black text-emerald-300 font-mono">QR DETECTED ✓</h2>
          <div className="space-y-1">
            <span className="block text-xs font-bold text-emerald-400 font-mono">RAW QR CONTENT:</span>
            <pre className="p-4 bg-slate-950 rounded-xl border border-emerald-800 text-white font-mono text-sm break-all font-bold whitespace-pre-wrap">
              {rawQRResult}
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center text-xs text-slate-400 font-mono">
          Point any QR code at the camera. Raw decoded content will appear here instantly.
        </div>
      )}

      {/* STEP 11 & 12: TEST A — IMAGE QR FILE UPLOAD DECODER TEST */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-indigo-300 font-mono flex items-center gap-2">
            <Upload size={16} /> TEST A: SCAN QR FROM UPLOADED IMAGE FILE
          </h3>
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
          >
            Upload QR Image File
          </Button>
        </div>

        {testADiagnostics && (
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs text-slate-200 text-left">
            <div className="flex justify-between items-center font-bold text-indigo-400 border-b border-slate-800 pb-1">
              <span>TEST A DECODER DIAGNOSTICS</span>
              <span className={testADiagnostics.success ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {testADiagnostics.success ? '✓ DECODED' : '✕ FAILED'}
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <div>Image loaded: <strong className="text-emerald-400">YES</strong></div>
              <div>Image dimensions: <strong>{testADiagnostics.dimensions.width} × {testADiagnostics.dimensions.height}</strong></div>
              {testADiagnostics.attempts.map((att) => (
                <div key={att.attemptIndex} className="flex justify-between items-center py-0.5 border-b border-slate-800/40">
                  <span className="text-slate-400">Decoder attempt {att.attemptIndex} ({att.engine}):</span>
                  <strong className={att.status === 'SUCCESS' ? 'text-emerald-400' : 'text-slate-500'}>
                    {att.status}
                  </strong>
                </div>
              ))}
            </div>
            {testADiagnostics.success && testADiagnostics.text && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <span className="block font-bold text-emerald-400">Decoded:</span>
                <div className="p-2 bg-slate-900 rounded border border-emerald-800 text-white break-all font-bold">
                  {testADiagnostics.text}
                </div>
              </div>
            )}
          </div>
        )}

        {imageQRResult && (
          <div className="p-3 bg-purple-950/60 border border-purple-800 rounded-xl text-left space-y-1 font-mono text-xs text-purple-200">
            <span className="block font-bold text-purple-300">✓ IMAGE QR RESULT (TEST A):</span>
            <div className="break-all font-bold text-white bg-slate-950 p-2.5 rounded border border-purple-900">
              {imageQRResult}
            </div>
          </div>
        )}
      </div>

      {/* STEP 13: KNOWN-GOOD TEST QR SAMPLE CODES */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
          <KeyRound size={16} className="text-indigo-400" />
          TEST BENCH KNOWN-GOOD SAMPLES
        </h3>
        <p className="text-xs text-slate-400">
          Use the text below to generate or test a sample QR code string:
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setSampleQRText('QR-TEST-123456')}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 hover:bg-slate-700"
          >
            Sample 1: "QR-TEST-123456"
          </button>
          <button
            onClick={() => setSampleQRText('STU001')}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 hover:bg-slate-700"
          >
            Sample 2: "STU001"
          </button>
          <button
            onClick={() => setSampleQRText('{"v":1,"type":"student","studentId":"STU001"}')}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 hover:bg-slate-700"
          >
            Sample 3: Preferred JSON
          </button>
        </div>
        <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-indigo-300 break-all">
          Active Test Payload: {sampleQRText}
        </div>
      </div>
    </div>
  );
};
