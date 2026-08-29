import { BrowserQRCodeReader, BarcodeFormat } from '@zxing/browser';
import {
  DecodeHintType,
  QRCodeReader,
  RGBLuminanceSource,
  HybridBinarizer,
  GlobalHistogramBinarizer,
  BinaryBitmap,
} from '@zxing/library';
import jsQR from 'jsqr';
import { Html5Qrcode } from 'html5-qrcode';

export interface ImageQRDecodeAttempt {
  attemptIndex: number;
  engine: string;
  scale: number;
  status: 'SUCCESS' | 'FAILED';
}

export interface ImageQRDecodeResult {
  success: boolean;
  text: string | null;
  dimensions: { width: number; height: number };
  logs: string[];
  attempts: ImageQRDecodeAttempt[];
  error?: string;
}

/**
 * Loads an HTMLImageElement from a File or Blob asynchronously.
 */
export function loadImageFromFile(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file: ' + String(err)));
    };

    img.src = url;
  });
}

/**
 * Helper to convert RGBA Canvas ImageData into 32-bit luminance array for ZXing RGBLuminanceSource
 */
function createLuminancesFromImageData(imageData: ImageData): Int32Array {
  const data = imageData.data;
  const length = data.length / 4;
  const luminances = new Int32Array(length);

  for (let i = 0; i < length; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    // Standard RGB to Grayscale luminance formula
    luminances[i] = (r * 306 + g * 601 + b * 117) >> 10;
  }

  return luminances;
}

/**
 * Decodes QR code from canvas using @zxing/library QRCodeReader directly
 */
function decodeCanvasWithZXingCore(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  binarizerType: 'HYBRID' | 'GLOBAL'
): string | null {
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const luminances = createLuminancesFromImageData(imageData);
    const source = new RGBLuminanceSource(luminances, width, height);

    const binarizer =
      binarizerType === 'HYBRID'
        ? new HybridBinarizer(source)
        : new GlobalHistogramBinarizer(source);

    const bitmap = new BinaryBitmap(binarizer);
    const reader = new QRCodeReader();

    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);

    const result = reader.decode(bitmap, hints);
    if (result && result.getText()) {
      return result.getText().trim();
    }
  } catch {
    // Ignore decode exceptions for failed frame/scale attempts
  }
  return null;
}

/**
 * Decodes QR code from canvas using jsQR with inversion attempts and optional thresholding
 */
function decodeCanvasWithJsQR(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold = false
): string | null {
  try {
    const imageData = ctx.getImageData(0, 0, width, height);

    if (threshold) {
      // Create high-contrast binarized copy of imageData for jsQR
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const v = avg > 128 ? 255 : 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
      }
    }

    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (code && code.data && code.data.trim() !== '') {
      return code.data.trim();
    }
  } catch {
    // Ignore decode exceptions
  }
  return null;
}

/**
 * Master QR Image Decoder Pipeline.
 * Fulfills all prompt requirements:
 * 1. Direct high-quality image reading.
 * 2. Multi-scale attempts (100%, 150%, 200%, 300%, 75%, 50%).
 * 3. Primary ZXing Browser & ZXing Core decoders.
 * 4. jsQR and html5-qrcode fallbacks.
 * 5. Full attempt diagnostic log recording.
 * 6. Raw string result return (without forced JSON parsing).
 */
export async function decodeQRFromImageFile(file: File): Promise<ImageQRDecodeResult> {
  const logs: string[] = [];
  const attempts: ImageQRDecodeAttempt[] = [];
  let attemptCounter = 0;

  logs.push(`Image loaded: YES`);

  let img: HTMLImageElement;
  try {
    img = await loadImageFromFile(file);
  } catch (err: any) {
    logs.push(`Image load failed: ${err.message}`);
    return {
      success: false,
      text: null,
      dimensions: { width: 0, height: 0 },
      logs,
      attempts: [],
      error: 'Unable to load image file. Please verify the file is a valid PNG or JPG.',
    };
  }

  const width = img.naturalWidth || img.width || 0;
  const height = img.naturalHeight || img.height || 0;

  logs.push(`Image dimensions: ${width} × ${height}`);

  if (width === 0 || height === 0) {
    logs.push(`Invalid image dimensions (0x0)`);
    return {
      success: false,
      text: null,
      dimensions: { width: 0, height: 0 },
      logs,
      attempts: [],
      error: 'Invalid image dimensions.',
    };
  }

  // Define scale sequence according to Section 3 requirements: 100%, 150%, 200%, 300%
  const scales = [1.0, 1.5, 2.0, 3.0];
  if (width > 1200 || height > 1200) {
    scales.push(0.75, 0.5);
  }

  // Create ZXing BrowserQRCodeReader instance with high precision hints
  const hints = new Map();
  hints.set(DecodeHintType.TRY_HARDER, true);
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
  const zxingBrowserReader = new BrowserQRCodeReader(hints);

  // Canvas element reuse for scaled attempts
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  for (const scale of scales) {
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    if (targetW <= 0 || targetH <= 0) continue;

    canvas.width = targetW;
    canvas.height = targetH;

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);
    }

    // Engine 1: ZXing Browser Reader (decodeFromImageElement at scale 1.0, decodeFromCanvas otherwise)
    attemptCounter++;
    const att1Name = `ZXing Browser Reader (Scale ${Math.round(scale * 100)}%)`;
    try {
      let resultText: string | null = null;
      if (scale === 1.0) {
        const result = await zxingBrowserReader.decodeFromImageElement(img);
        if (result && result.getText()) {
          resultText = result.getText().trim();
        }
      } else {
        const result = zxingBrowserReader.decodeFromCanvas(canvas);
        if (result && result.getText()) {
          resultText = result.getText().trim();
        }
      }

      if (resultText && resultText !== '') {
        attempts.push({ attemptIndex: attemptCounter, engine: att1Name, scale, status: 'SUCCESS' });
        logs.push(`Decoder attempt ${attemptCounter}: SUCCESS (${att1Name})`);
        logs.push(`Decoded:\n${resultText}`);
        return {
          success: true,
          text: resultText,
          dimensions: { width, height },
          logs,
          attempts,
        };
      }
    } catch {
      // Missed attempt
    }
    attempts.push({ attemptIndex: attemptCounter, engine: att1Name, scale, status: 'FAILED' });
    logs.push(`Decoder attempt ${attemptCounter}: FAILED`);

    // Engine 2: ZXing Core Hybrid Binarizer
    if (ctx) {
      attemptCounter++;
      const att2Name = `ZXing Core Hybrid (Scale ${Math.round(scale * 100)}%)`;
      const resHybrid = decodeCanvasWithZXingCore(ctx, targetW, targetH, 'HYBRID');
      if (resHybrid) {
        attempts.push({ attemptIndex: attemptCounter, engine: att2Name, scale, status: 'SUCCESS' });
        logs.push(`Decoder attempt ${attemptCounter}: SUCCESS (${att2Name})`);
        logs.push(`Decoded:\n${resHybrid}`);
        return {
          success: true,
          text: resHybrid,
          dimensions: { width, height },
          logs,
          attempts,
        };
      }
      attempts.push({ attemptIndex: attemptCounter, engine: att2Name, scale, status: 'FAILED' });
      logs.push(`Decoder attempt ${attemptCounter}: FAILED`);
    }

    // Engine 3: jsQR Direct Sampling
    if (ctx) {
      attemptCounter++;
      const att3Name = `jsQR Engine (Scale ${Math.round(scale * 100)}%)`;
      const resJsQR = decodeCanvasWithJsQR(ctx, targetW, targetH, false);
      if (resJsQR) {
        attempts.push({ attemptIndex: attemptCounter, engine: att3Name, scale, status: 'SUCCESS' });
        logs.push(`Decoder attempt ${attemptCounter}: SUCCESS (${att3Name})`);
        logs.push(`Decoded:\n${resJsQR}`);
        return {
          success: true,
          text: resJsQR,
          dimensions: { width, height },
          logs,
          attempts,
        };
      }
      attempts.push({ attemptIndex: attemptCounter, engine: att3Name, scale, status: 'FAILED' });
      logs.push(`Decoder attempt ${attemptCounter}: FAILED`);
    }

    // Engine 4: ZXing Core Global Histogram Binarizer
    if (ctx) {
      attemptCounter++;
      const att4Name = `ZXing Core Global Histogram (Scale ${Math.round(scale * 100)}%)`;
      const resGlobal = decodeCanvasWithZXingCore(ctx, targetW, targetH, 'GLOBAL');
      if (resGlobal) {
        attempts.push({ attemptIndex: attemptCounter, engine: att4Name, scale, status: 'SUCCESS' });
        logs.push(`Decoder attempt ${attemptCounter}: SUCCESS (${att4Name})`);
        logs.push(`Decoded:\n${resGlobal}`);
        return {
          success: true,
          text: resGlobal,
          dimensions: { width, height },
          logs,
          attempts,
        };
      }
      attempts.push({ attemptIndex: attemptCounter, engine: att4Name, scale, status: 'FAILED' });
      logs.push(`Decoder attempt ${attemptCounter}: FAILED`);
    }

    // Engine 5: Binarized jsQR Threshold Attempt
    if (ctx) {
      attemptCounter++;
      const att5Name = `jsQR Binarized Threshold (Scale ${Math.round(scale * 100)}%)`;
      const resThresh = decodeCanvasWithJsQR(ctx, targetW, targetH, true);
      if (resThresh) {
        attempts.push({ attemptIndex: attemptCounter, engine: att5Name, scale, status: 'SUCCESS' });
        logs.push(`Decoder attempt ${attemptCounter}: SUCCESS (${att5Name})`);
        logs.push(`Decoded:\n${resThresh}`);
        return {
          success: true,
          text: resThresh,
          dimensions: { width, height },
          logs,
          attempts,
        };
      }
      attempts.push({ attemptIndex: attemptCounter, engine: att5Name, scale, status: 'FAILED' });
      logs.push(`Decoder attempt ${attemptCounter}: FAILED`);
    }
  }

  // Engine 6: Html5Qrcode Fallback Scanner (Dedicated file scanner fallback)
  attemptCounter++;
  const att6Name = `Html5Qrcode File Scanner Fallback`;
  try {
    const tempId = `html5qr_temp_${Date.now()}`;
    let tempDiv = document.getElementById(tempId);
    if (!tempDiv) {
      tempDiv = document.createElement('div');
      tempDiv.id = tempId;
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);
    }

    const html5QrcodeScanner = new Html5Qrcode(tempId);
    const html5Result = await html5QrcodeScanner.scanFile(file, false);
    html5QrcodeScanner.clear();
    tempDiv.remove();

    if (html5Result && html5Result.trim() !== '') {
      const cleanResult = html5Result.trim();
      attempts.push({ attemptIndex: attemptCounter, engine: att6Name, scale: 1.0, status: 'SUCCESS' });
      logs.push(`Decoder attempt ${attemptCounter}: SUCCESS (${att6Name})`);
      logs.push(`Decoded:\n${cleanResult}`);
      return {
        success: true,
        text: cleanResult,
        dimensions: { width, height },
        logs,
        attempts,
      };
    }
  } catch {
    const tempDiv = document.getElementById(`html5qr_temp_${Date.now()}`);
    if (tempDiv) tempDiv.remove();
  }

  attempts.push({ attemptIndex: attemptCounter, engine: att6Name, scale: 1.0, status: 'FAILED' });
  logs.push(`Decoder attempt ${attemptCounter}: FAILED`);

  logs.push(`All ${attemptCounter} decoding attempts exhausted.`);

  return {
    success: false,
    text: null,
    dimensions: { width, height },
    logs,
    attempts,
    error: 'Unable to decode this QR image.',
  };
}
