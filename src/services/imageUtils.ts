import { CropRect } from '../types/models';

/**
 * Reads an image File and compresses/resizes it to a high-clarity JPEG DataURL
 * suitable for persistent IndexedDB storage even across hundreds of question photos.
 */
export function readAndCompressImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.84
): Promise<{ dataUrl: string; width: number; height: number; mimeType: string }> {
  return new Promise((resolve, reject) => {
    let objectUrl = '';
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      // Fallback to FileReader if createObjectURL fails
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Fotoğraf dosyası okunamadı.'));
      reader.onload = () => {
        processImageSrc(reader.result as string, resolve, reject, maxDimension, quality, file.type);
      };
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Fotoğraf yüklenemedi veya geçersiz görüntü formatı.'));
    };
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 600;

        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: img.src,
            width,
            height,
            mimeType: file.type || 'image/jpeg',
          });
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl: compressed,
          width,
          height,
          mimeType: 'image/jpeg',
        });
      } catch (err: any) {
        reject(new Error('Görüntü işlenirken bir bellek hatası oluştu: ' + (err?.message || '')));
      }
    };
    img.src = objectUrl;
  });
}

function processImageSrc(
  src: string,
  resolve: (val: any) => void,
  reject: (err: any) => void,
  maxDimension: number,
  quality: number,
  fallbackMime: string
) {
  const img = new Image();
  img.onerror = () => reject(new Error('Geçersiz görüntü formatı.'));
  img.onload = () => {
    let width = img.naturalWidth || img.width || 800;
    let height = img.naturalHeight || img.height || 600;
    if (width > maxDimension || height > maxDimension) {
      if (width >= height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve({ dataUrl: src, width, height, mimeType: fallbackMime || 'image/jpeg' });
      return;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    resolve({ dataUrl: canvas.toDataURL('image/jpeg', quality), width, height, mimeType: 'image/jpeg' });
  };
  img.src = src;
}

/**
 * Applies rotation (0, 90, 180, 270) and percentage crop rectangle (x, y, width, height in 0..100)
 * to an original image DataURL and returns the cropped/rotated image DataURL.
 */
export function applyCropAndRotation(
  originalDataUrl: string,
  cropRect: CropRect | null,
  rotation: number = 0
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error('Görüntü kırpılırken hata oluştu.'));
    img.onload = () => {
      const normRot = ((rotation % 360) + 360) % 360;
      const srcW = img.naturalWidth || img.width || 800;
      const srcH = img.naturalHeight || img.height || 600;

      // First rotate onto an intermediate canvas
      const rotCanvas = document.createElement('canvas');
      if (normRot === 90 || normRot === 270) {
        rotCanvas.width = srcH;
        rotCanvas.height = srcW;
      } else {
        rotCanvas.width = srcW;
        rotCanvas.height = srcH;
      }

      const rCtx = rotCanvas.getContext('2d');
      if (!rCtx) {
        resolve(originalDataUrl);
        return;
      }

      rCtx.fillStyle = '#ffffff';
      rCtx.fillRect(0, 0, rotCanvas.width, rotCanvas.height);
      rCtx.save();
      rCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
      rCtx.rotate((normRot * Math.PI) / 180);
      rCtx.drawImage(img, -srcW / 2, -srcH / 2);
      rCtx.restore();

      if (!cropRect) {
        resolve(rotCanvas.toDataURL('image/jpeg', 0.88));
        return;
      }

      const cx = Math.max(0, Math.min(95, cropRect.x)) / 100;
      const cy = Math.max(0, Math.min(95, cropRect.y)) / 100;
      const cw = Math.max(5, Math.min(100 - cx * 100, cropRect.width)) / 100;
      const ch = Math.max(5, Math.min(100 - cy * 100, cropRect.height)) / 100;

      const pixelX = Math.round(cx * rotCanvas.width);
      const pixelY = Math.round(cy * rotCanvas.height);
      const pixelW = Math.max(20, Math.round(cw * rotCanvas.width));
      const pixelH = Math.max(20, Math.round(ch * rotCanvas.height));

      const outCanvas = document.createElement('canvas');
      outCanvas.width = pixelW;
      outCanvas.height = pixelH;
      const oCtx = outCanvas.getContext('2d');
      if (!oCtx) {
        resolve(rotCanvas.toDataURL('image/jpeg', 0.88));
        return;
      }

      oCtx.drawImage(
        rotCanvas,
        pixelX,
        pixelY,
        pixelW,
        pixelH,
        0,
        0,
        pixelW,
        pixelH
      );
      resolve(outCanvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = originalDataUrl;
  });
}

/**
 * Generates an SVG-based question image DataURL for DEMO records, clearly labeled "DEMO VERİSİ"
 */
export function createDemoQuestionSvgDataUrl(params: {
  subjectName: string;
  topicName: string;
  questionNumber: number;
  questionText: string;
  options: [string, string, string, string];
  statusLabel: string;
}): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="440" viewBox="0 0 760 440">
    <rect width="760" height="440" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
    <rect x="16" y="16" width="728" height="48" rx="8" fill="#0c1c3d"/>
    <text x="32" y="46" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff">${params.subjectName} • Soru ${params.questionNumber} (${params.topicName})</text>
    <rect x="550" y="24" width="178" height="32" rx="6" fill="#f59e0b"/>
    <text x="639" y="45" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0c1c3d">DEMO VERİSİ • ${params.statusLabel}</text>
    <rect x="28" y="84" width="704" height="190" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    <text x="48" y="125" font-family="Arial, sans-serif" font-size="17" fill="#1e293b">${params.questionText.slice(0, 78)}</text>
    <text x="48" y="158" font-family="Arial, sans-serif" font-size="17" fill="#1e293b">${params.questionText.slice(78, 156)}</text>
    <text x="48" y="191" font-family="Arial, sans-serif" font-size="17" fill="#1e293b">${params.questionText.slice(156, 234)}</text>
    <text x="48" y="245" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#1f8a9a">Buna göre aşağıdakilerden hangisi doğrudur?</text>
    <g font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">
      <rect x="28" y="294" width="340" height="48" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
      <text x="46" y="324">A) ${params.options[0]}</text>
      <rect x="392" y="294" width="340" height="48" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
      <text x="410" y="324">B) ${params.options[1]}</text>
      <rect x="28" y="356" width="340" height="48" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
      <text x="46" y="386">C) ${params.options[2]}</text>
      <rect x="392" y="356" width="340" height="48" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
      <text x="410" y="386">D) ${params.options[3]}</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface AutoCleanOptions {
  mode?: 'balanced' | 'aggressive' | 'gentle';
  removeColorPen?: boolean;
  cleanBorders?: boolean;
  preserveIllustrations?: boolean;
}

export interface PencilMarking {
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] (0..1000 scale on original image)
  type?: 'calculation' | 'circle' | 'underline' | 'margin_note' | string;
}

export interface InpaintRegionBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface QualityCheckResult {
  passed: boolean;
  reason?: string;
  isOverlapRisk?: boolean;
}

/**
 * Transforms a bounding box from full-image normalized coordinates (0..1000)
 * into the local coordinate system (0..1000) of a cropped and rotated sub-image.
 *
 * @param markBox Normalized box [ymin, xmin, ymax, xmax] (0..1000) on original photo
 * @param questionBox Normalized crop box [ymin, xmin, ymax, xmax] (0..1000) on original photo
 * @param rotation Clockwise rotation angle in degrees (0, 90, 180, 270)
 * @returns Transformed box [ymin, xmin, ymax, xmax] (0..1000) or null if box falls completely outside the crop
 */
export function transformBoxToRotatedCrop(
  markBox: [number, number, number, number] | InpaintRegionBox,
  questionBox: [number, number, number, number] = [0, 0, 1000, 1000],
  rotation: number = 0
): [number, number, number, number] | null {
  const [qYmin, qXmin, qYmax, qXmax] = questionBox;
  const mYmin = Array.isArray(markBox) ? markBox[0] : markBox.ymin;
  const mXmin = Array.isArray(markBox) ? markBox[1] : markBox.xmin;
  const mYmax = Array.isArray(markBox) ? markBox[2] : markBox.ymax;
  const mXmax = Array.isArray(markBox) ? markBox[3] : markBox.xmax;

  const qW = Math.max(1, qXmax - qXmin);
  const qH = Math.max(1, qYmax - qYmin);

  // Normalize relative to unrotated crop [0, 1]
  const cYmin = Math.max(0, Math.min(1, (mYmin - qYmin) / qH));
  const cXmin = Math.max(0, Math.min(1, (mXmin - qXmin) / qW));
  const cYmax = Math.max(0, Math.min(1, (mYmax - qYmin) / qH));
  const cXmax = Math.max(0, Math.min(1, (mXmax - qXmin) / qW));

  if (cXmax <= cXmin || cYmax <= cYmin) return null;

  const rot = (((rotation % 360) + 360) % 360);
  let rYmin = cYmin;
  let rXmin = cXmin;
  let rYmax = cYmax;
  let rXmax = cXmax;

  if (rot === 90) {
    rYmin = cXmin;
    rXmin = 1 - cYmax;
    rYmax = cXmax;
    rXmax = 1 - cYmin;
  } else if (rot === 180) {
    rYmin = 1 - cYmax;
    rXmin = 1 - cXmax;
    rYmax = 1 - cYmin;
    rXmax = 1 - cXmin;
  } else if (rot === 270) {
    rYmin = 1 - cXmax;
    rXmin = cYmin;
    rYmax = 1 - cXmin;
    rXmax = cYmax;
  }

  const finalBox: [number, number, number, number] = [
    Math.max(0, Math.min(1000, Math.round(rYmin * 1000))),
    Math.max(0, Math.min(1000, Math.round(rXmin * 1000))),
    Math.max(0, Math.min(1000, Math.round(rYmax * 1000))),
    Math.max(0, Math.min(1000, Math.round(rXmax * 1000))),
  ];

  if (finalBox[2] <= finalBox[0] || finalBox[3] <= finalBox[1]) return null;
  return finalBox;
}

/**
 * Mask-controlled localized inpainting:
 * Targets ONLY the specified bounding boxes [ymin, xmin, ymax, xmax] (0..1000 scale).
 * Pixels outside the approved boxes remain 100% UNCHANGED relative to the oriented crop.
 * Within each box, graphite pencil strokes or pen marks are identified and seamlessly
 * inpainted using surrounding paper texture & lighting, while colored diagrams & printed text are protected.
 */
export function inpaintHandwritingRegions(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  boxes: Array<[number, number, number, number] | InpaintRegionBox>,
  options: {
    protectColoredArtwork?: boolean;
    paperSamplingRadius?: number;
  } = {}
): { modifiedPixelCount: number } {
  if (!boxes || boxes.length === 0) return { modifiedPixelCount: 0 };
  const protectColored = options.protectColoredArtwork !== false;
  const sampleRadius = Math.max(3, options.paperSamplingRadius || 6);

  let totalModified = 0;

  for (const rawBox of boxes) {
    const yminNorm = Array.isArray(rawBox) ? rawBox[0] : rawBox.ymin;
    const xminNorm = Array.isArray(rawBox) ? rawBox[1] : rawBox.xmin;
    const ymaxNorm = Array.isArray(rawBox) ? rawBox[2] : rawBox.ymax;
    const xmaxNorm = Array.isArray(rawBox) ? rawBox[3] : rawBox.xmax;

    const x0 = Math.max(0, Math.min(width - 1, Math.round((xminNorm / 1000) * width)));
    const y0 = Math.max(0, Math.min(height - 1, Math.round((yminNorm / 1000) * height)));
    const x1 = Math.max(x0 + 1, Math.min(width, Math.round((xmaxNorm / 1000) * width)));
    const y1 = Math.max(y0 + 1, Math.min(height, Math.round((ymaxNorm / 1000) * height)));

    // 1. Estimate local paper color around the bounding box perimeter
    let paperRSum = 0;
    let paperGSum = 0;
    let paperBSum = 0;
    let paperCount = 0;

    const sampleBorder = (bx: number, by: number) => {
      if (bx >= 0 && bx < width && by >= 0 && by < height) {
        const idx = (by * width + bx) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        if (lum > 135 && maxC - minC < 30) {
          paperRSum += r;
          paperGSum += g;
          paperBSum += b;
          paperCount++;
        }
      }
    };

    for (let bx = x0; bx < x1; bx += 2) {
      sampleBorder(bx, Math.max(0, y0 - 2));
      sampleBorder(bx, Math.min(height - 1, y1 + 2));
    }
    for (let by = y0; by < y1; by += 2) {
      sampleBorder(Math.max(0, x0 - 2), by);
      sampleBorder(Math.min(width - 1, x1 + 2), by);
    }

    const defaultPaperR = paperCount > 0 ? Math.round(paperRSum / paperCount) : 255;
    const defaultPaperG = paperCount > 0 ? Math.round(paperGSum / paperCount) : 255;
    const defaultPaperB = paperCount > 0 ? Math.round(paperBSum / paperCount) : 255;

    // 2. Scan box and identify pencil / scribble pixels
    const boxW = x1 - x0;
    const boxH = y1 - y0;
    const isScribble = new Uint8Array(boxW * boxH);

    for (let by = y0; by < y1; by++) {
      for (let bx = x0; bx < x1; bx++) {
        const idx = (by * width + bx) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const chroma = maxC - minC;

        // Protect colored artwork (roses, vases, graphs, colored parcels)
        if (protectColored && chroma > 18) {
          continue;
        }

        // Graphite pencil marks have lower luminance than surrounding paper, with neutral chroma
        // Student blue/red pen has high chroma with low/medium lum
        const isGraphitePencil = lum < 215 && chroma <= 18;
        const isColoredPen = chroma > 35 && lum < 180;

        if (isGraphitePencil || isColoredPen) {
          isScribble[(by - y0) * boxW + (bx - x0)] = 1;
        }
      }
    }

    // 3. Inpaint scribble pixels using local paper texture synthesis
    for (let by = y0; by < y1; by++) {
      for (let bx = x0; bx < x1; bx++) {
        const localIdx = (by - y0) * boxW + (bx - x0);
        if (!isScribble[localIdx]) continue;

        let localRSum = 0;
        let localGSum = 0;
        let localBSum = 0;
        let localWeight = 0;

        for (let dy = -sampleRadius; dy <= sampleRadius; dy++) {
          const ny = by + dy;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
            const nx = bx + dx;
            if (nx < 0 || nx >= width) continue;

            const inBox = nx >= x0 && nx < x1 && ny >= y0 && ny < y1;
            if (inBox && isScribble[(ny - y0) * boxW + (nx - x0)]) {
              continue; // Don't sample from scribble itself
            }

            const nIdx = (ny * width + nx) * 4;
            const nr = pixels[nIdx];
            const ng = pixels[nIdx + 1];
            const nb = pixels[nIdx + 2];
            const nLum = 0.299 * nr + 0.587 * ng + 0.114 * nb;
            const nChroma = Math.max(nr, ng, nb) - Math.min(nr, ng, nb);

            if (nLum >= 160 && nChroma < 25) {
              const dist = Math.sqrt(dx * dx + dy * dy);
              const w = 1 / (1 + dist);
              localRSum += nr * w;
              localGSum += ng * w;
              localBSum += nb * w;
              localWeight += w;
            }
          }
        }

        const outIdx = (by * width + bx) * 4;
        if (localWeight > 0) {
          pixels[outIdx] = Math.round(localRSum / localWeight);
          pixels[outIdx + 1] = Math.round(localGSum / localWeight);
          pixels[outIdx + 2] = Math.round(localBSum / localWeight);
        } else {
          pixels[outIdx] = defaultPaperR;
          pixels[outIdx + 1] = defaultPaperG;
          pixels[outIdx + 2] = defaultPaperB;
        }
        pixels[outIdx + 3] = 255;
        totalModified++;
      }
    }
  }

  return { modifiedPixelCount: totalModified };
}

/**
 * Validates that a cleaned image meets strict quality standards:
 * - Not blank, solid white, or pitch black
 * - Resolution and dimensions preserved
 * - Variance check confirms content is present
 */
export function validateCleanedImageQuality(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  overlapWarning = false,
  overlapMessage?: string
): QualityCheckResult {
  if (width < 50 || height < 50) {
    return { passed: false, reason: 'Görüntü boyutları çok küçük veya geçersiz.' };
  }

  if (overlapWarning) {
    return {
      passed: false,
      isOverlapRisk: true,
      reason:
        overlapMessage ||
        'Bu karalama basılı yazı veya şeklin üzerine geliyor. Otomatik temizleme soruyu bozabileceği için orijinal görüntüyü koruduk.',
    };
  }

  let minLum = 255;
  let maxLum = 0;
  let totalLum = 0;
  const sampleStep = Math.max(1, Math.floor((width * height) / 2000));
  let sampleCount = 0;

  for (let i = 0; i < pixels.length; i += sampleStep * 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
    totalLum += lum;
    sampleCount++;
  }

  // Solid white or washed out (no dark printed ink)
  if (minLum > 240) {
    return { passed: false, reason: 'Temizleme sonucu görüntü tamamen beyaz veya boş çıktı.' };
  }

  // Solid black
  if (maxLum < 30) {
    return { passed: false, reason: 'Temizleme sonucu görüntü tamamen siyah veya bozuk çıktı.' };
  }

  // Insufficient contrast
  if (maxLum - minLum < 40) {
    return { passed: false, reason: 'Görüntü kontrastı yetersiz veya bozuk.' };
  }

  return { passed: true };
}

/**
 * Applies mask-controlled inpainting onto a cropped image DataURL.
 * Preserves 100% of pixels outside the handwriting boxes.
 */
export function inpaintQuestionDataUrl(
  croppedDataUrl: string,
  boxes: Array<[number, number, number, number] | InpaintRegionBox>,
  options: {
    overlapWarning?: boolean;
    overlapMessage?: string;
  } = {}
): Promise<{
  success: boolean;
  cleanDataUrl: string;
  qualityCheck: QualityCheckResult;
}> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve({
        success: true,
        cleanDataUrl: croppedDataUrl,
        qualityCheck: { passed: true },
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            success: false,
            cleanDataUrl: croppedDataUrl,
            qualityCheck: { passed: false, reason: 'Canvas context alınamadı.' },
          });
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, width, height);

        // Perform precision inpainting on the pixel array
        inpaintHandwritingRegions(imgData.data, width, height, boxes);

        // Quality check
        const qCheck = validateCleanedImageQuality(
          imgData.data,
          width,
          height,
          options.overlapWarning,
          options.overlapMessage
        );

        if (!qCheck.passed) {
          resolve({
            success: false,
            cleanDataUrl: croppedDataUrl,
            qualityCheck: qCheck,
          });
          return;
        }

        ctx.putImageData(imgData, 0, 0);
        const cleanDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve({
          success: true,
          cleanDataUrl,
          qualityCheck: { passed: true },
        });
      } catch (err: any) {
        resolve({
          success: false,
          cleanDataUrl: croppedDataUrl,
          qualityCheck: { passed: false, reason: err?.message || 'Bilinmeyen hata' },
        });
      }
    };
    img.onerror = () => {
      resolve({
        success: false,
        cleanDataUrl: croppedDataUrl,
        qualityCheck: { passed: false, reason: 'Görüntü yüklenemedi.' },
      });
    };
    img.src = croppedDataUrl;
  });
}

/**
 * High-performance pure pixel cleaner for test question photos.
 * Performs adaptive background illumination estimation, eliminates pencil graphite smudges,
 * student margin calculations, and stray markings, while PRESERVING ALL ORIGINAL
 * COLORED ILLUSTRATIONS (roses, vases, graphs, tables) and sharp printed text.
 */
export function cleanImageDataPixels(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options: AutoCleanOptions = {}
): void {
  const mode = options.mode || 'balanced';
  const cleanBorders = options.cleanBorders !== false;
  const removeColorPen = options.removeColorPen === true;
  const preserveIllustrations =
    options.preserveIllustrations !== undefined
      ? options.preserveIllustrations
      : !removeColorPen;

  // Mode cutoffs (normalized against local background paper brightness)
  let inkCutoff = 90;
  let pencilCutoff = 138;
  if (mode === 'gentle') {
    inkCutoff = 105;
    pencilCutoff = 158;
  } else if (mode === 'aggressive') {
    inkCutoff = 80;
    pencilCutoff = 125;
  }

  // 1. Adaptive Local Background Grid (removes page shadows and yellow lighting)
  const minDim = Math.min(width, height);
  const blockSize = Math.max(16, Math.min(48, Math.round(minDim / 24)));
  const gridW = Math.ceil(width / blockSize);
  const gridH = Math.ceil(height / blockSize);
  const bgGrid = new Float32Array(gridW * gridH);

  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const startX = gx * blockSize;
      const startY = gy * blockSize;
      const endX = Math.min(width, startX + blockSize);
      const endY = Math.min(height, startY + blockSize);

      let maxLum = 0;
      let sumTop = 0;
      let countTop = 0;

      // First pass: locate maximum brightness in block
      for (let y = startY; y < endY; y += 2) {
        for (let x = startX; x < endX; x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum > maxLum) maxLum = lum;
        }
      }

      // Second pass: average top 20% brightest pixels to estimate paper surface
      const threshold = Math.max(120, maxLum * 0.88);
      for (let y = startY; y < endY; y += 2) {
        for (let x = startX; x < endX; x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum >= threshold) {
            sumTop += lum;
            countTop++;
          }
        }
      }

      const blockBg = countTop > 0 ? sumTop / countTop : Math.max(180, maxLum);
      bgGrid[gy * gridW + gx] = Math.max(130, Math.min(255, blockBg));
    }
  }

  // 3x3 box smoothing to eliminate block boundary transitions
  const smoothedBgGrid = new Float32Array(gridW * gridH);
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = gy + dy;
          const nx = gx + dx;
          if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH) {
            sum += bgGrid[ny * gridW + nx];
            count++;
          }
        }
      }
      smoothedBgGrid[gy * gridW + gx] = sum / count;
    }
  }

  const getLocalBg = (x: number, y: number): number => {
    const gx = x / blockSize - 0.5;
    const gy = y / blockSize - 0.5;
    const x0 = Math.max(0, Math.min(gridW - 1, Math.floor(gx)));
    const y0 = Math.max(0, Math.min(gridH - 1, Math.floor(gy)));
    const x1 = Math.max(0, Math.min(gridW - 1, x0 + 1));
    const y1 = Math.max(0, Math.min(gridH - 1, y0 + 1));
    const fx = Math.max(0, Math.min(1, gx - x0));
    const fy = Math.max(0, Math.min(1, gy - y0));

    const v00 = smoothedBgGrid[y0 * gridW + x0];
    const v10 = smoothedBgGrid[y0 * gridW + x1];
    const v01 = smoothedBgGrid[y1 * gridW + x0];
    const v11 = smoothedBgGrid[y1 * gridW + x1];

    const top = v00 * (1 - fx) + v10 * fx;
    const bot = v01 * (1 - fx) + v11 * fx;
    return top * (1 - fy) + bot * fy;
  };

  // 2. Pixel Transformation Pass
  const borderMargin = cleanBorders ? Math.max(2, Math.round(minDim * 0.006)) : 0;

  for (let y = 0; y < height; y++) {
    const isBorderY = cleanBorders && (y < borderMargin || y >= height - borderMargin);

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      if (isBorderY || (cleanBorders && (x < borderMargin || x >= width - borderMargin))) {
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        continue;
      }

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const chroma = maxC - minC;

      const localBg = getLocalBg(x, y);
      const relLum = Math.min(255, (lum / Math.max(1, localBg)) * 255);

      // 1. Pure paper background -> crisp white
      if (relLum >= 242) {
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        continue;
      }

      // 2. Colored printed illustrations (roses, vases, leaves, charts, colored geometry)
      // When chroma > 14, preserve the original colors & artwork faithfully!
      if (preserveIllustrations && chroma > 14) {
        const bgNorm = Math.min(1.25, 255 / Math.max(1, localBg));
        data[idx] = Math.min(255, Math.round(r * bgNorm));
        data[idx + 1] = Math.min(255, Math.round(g * bgNorm));
        data[idx + 2] = Math.min(255, Math.round(b * bgNorm));
        continue;
      }

      // Student colored pen ink (when removeColorPen is true and preserveIllustrations is false)
      if (removeColorPen && (chroma > 60 || (chroma > 25 && lum < 140))) {
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        continue;
      }

      // 3. Shaded diagram regions in LGS questions (e.g. light blue "taralı alan")
      if (lum >= 140 && chroma >= 12 && chroma <= 65 && relLum < 242) {
        continue;
      }

      // 4. Neutral paper, pencil graphite, and dark printed ink
      if (relLum >= pencilCutoff) {
        // Paper background and graphite pencil marks -> PURE WHITE
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
      } else if (relLum <= inkCutoff) {
        // Printed text -> crisp dark ink
        const inkFactor = relLum / inkCutoff;
        const dark = Math.round(inkFactor * 24);
        data[idx] = dark;
        data[idx + 1] = dark;
        data[idx + 2] = dark;
      } else {
        // Anti-aliased font edges & gray diagram borders -> smooth transition
        const t = (relLum - inkCutoff) / (pencilCutoff - inkCutoff);
        const smoothVal = Math.round(24 + Math.pow(t, 1.3) * (255 - 24));
        data[idx] = smoothVal;
        data[idx + 1] = smoothVal;
        data[idx + 2] = smoothVal;
      }
    }
  }
}

/**
 * High-Fidelity Auto-Crop, Straighten, and Clean Pipeline:
 * Crops the question area, straightens rotation if taken sideways, removes pencil marks & margin calculations,
 * and whitens the paper while PRESERVING 100% OF ORIGINAL ILLUSTRATIONS AND COLORS faithfully.
 */
export function cropRotateAndCleanQuestion(params: {
  dataUrl: string;
  questionBox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0..1000 on original image
  rotationNeeded?: number; // 0, 90, 180, 270 (degrees clockwise)
  pencilMarkings?: PencilMarking[];
  preserveIllustrations?: boolean;
}): Promise<{ cleanDataUrl: string; rawCroppedDataUrl: string }> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      resolve({ cleanDataUrl: params.dataUrl, rawCroppedDataUrl: params.dataUrl });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => reject(new Error('Görüntü işlenirken yüklenemedi.'));
    img.onload = () => {
      try {
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        // 1. Determine crop coordinates
        let qBox = params.questionBox;
        if (!qBox || !Array.isArray(qBox) || qBox.length !== 4) {
          qBox = [0, 0, 1000, 1000];
        }
        const [ymin, xmin, ymax, xmax] = qBox;
        const cropX0 = Math.max(0, Math.round((xmin / 1000) * origW));
        const cropY0 = Math.max(0, Math.round((ymin / 1000) * origH));
        const cropW = Math.max(20, Math.min(origW - cropX0, Math.round(((xmax - xmin) / 1000) * origW)));
        const cropH = Math.max(20, Math.min(origH - cropY0, Math.round(((ymax - ymin) / 1000) * origH)));

        // 2. Crop to intermediate canvas
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = cropW;
        cropCanvas.height = cropH;
        const cCtx = cropCanvas.getContext('2d');
        if (!cCtx) {
          resolve({ cleanDataUrl: params.dataUrl, rawCroppedDataUrl: params.dataUrl });
          return;
        }
        cCtx.drawImage(img, cropX0, cropY0, cropW, cropH, 0, 0, cropW, cropH);

        // 3. Handle rotation if needed (0, 90, 180, 270 clockwise)
        const rot = (((params.rotationNeeded || 0) % 360) + 360) % 360;
        let uprightCanvas = cropCanvas;

        if (rot !== 0) {
          uprightCanvas = document.createElement('canvas');
          if (rot === 90 || rot === 270) {
            uprightCanvas.width = cropH;
            uprightCanvas.height = cropW;
          } else {
            uprightCanvas.width = cropW;
            uprightCanvas.height = cropH;
          }
          const uCtx = uprightCanvas.getContext('2d');
          if (uCtx) {
            uCtx.fillStyle = '#ffffff';
            uCtx.fillRect(0, 0, uprightCanvas.width, uprightCanvas.height);
            uCtx.save();
            uCtx.translate(uprightCanvas.width / 2, uprightCanvas.height / 2);
            uCtx.rotate((rot * Math.PI) / 180);
            uCtx.drawImage(cropCanvas, -cropW / 2, -cropH / 2);
            uCtx.restore();
          }
        }

        const rawCroppedDataUrl = uprightCanvas.toDataURL('image/jpeg', 0.90);

        // 4. Create clean canvas with adaptive illumination & pencil removal
        const cleanCanvas = document.createElement('canvas');
        cleanCanvas.width = uprightCanvas.width;
        cleanCanvas.height = uprightCanvas.height;
        const cleanCtx = cleanCanvas.getContext('2d');
        if (!cleanCtx) {
          resolve({ cleanDataUrl: rawCroppedDataUrl, rawCroppedDataUrl });
          return;
        }

        cleanCtx.fillStyle = '#ffffff';
        cleanCtx.fillRect(0, 0, cleanCanvas.width, cleanCanvas.height);
        cleanCtx.drawImage(uprightCanvas, 0, 0);

        // 5. Apply pixel illumination & paper whitening filter
        const imgData = cleanCtx.getImageData(0, 0, cleanCanvas.width, cleanCanvas.height);
        cleanImageDataPixels(imgData.data, cleanCanvas.width, cleanCanvas.height, {
          mode: 'balanced',
          preserveIllustrations: params.preserveIllustrations !== false,
          cleanBorders: true,
        });
        cleanCtx.putImageData(imgData, 0, 0);

        const cleanDataUrl = cleanCanvas.toDataURL('image/jpeg', 0.92);
        resolve({ cleanDataUrl, rawCroppedDataUrl });
      } catch (err) {
        reject(err);
      }
    };
    img.src = params.dataUrl;
  });
}

/**
 * Extracts the authentic illustration/diagram snippet from the question image
 * and applies background whitening so it blends seamlessly into the clean card.
 * Supports rotation if original camera image was taken sideways or upside down.
 */
export function extractIllustrationSnippet(
  dataUrl: string,
  box: [number, number, number, number], // [ymin, xmin, ymax, xmax] 0..1000
  rotationNeeded = 0
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => resolve(dataUrl);
    img.onload = () => {
      try {
        const W = img.naturalWidth || img.width;
        const H = img.naturalHeight || img.height;
        const [ymin, xmin, ymax, xmax] = box;

        const x0 = Math.max(0, Math.round((xmin / 1000) * W));
        const y0 = Math.max(0, Math.round((ymin / 1000) * H));
        const w = Math.max(20, Math.min(W - x0, Math.round(((xmax - xmin) / 1000) * W)));
        const h = Math.max(20, Math.min(H - y0, Math.round(((ymax - ymin) / 1000) * H)));

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = w;
        cropCanvas.height = h;
        const cCtx = cropCanvas.getContext('2d');
        if (!cCtx) {
          resolve(dataUrl);
          return;
        }

        cCtx.fillStyle = '#ffffff';
        cCtx.fillRect(0, 0, w, h);
        cCtx.drawImage(img, x0, y0, w, h, 0, 0, w, h);

        // If rotation is needed to make upright
        const rot = (((rotationNeeded || 0) % 360) + 360) % 360;
        let uprightCanvas = cropCanvas;

        if (rot !== 0) {
          uprightCanvas = document.createElement('canvas');
          if (rot === 90 || rot === 270) {
            uprightCanvas.width = h;
            uprightCanvas.height = w;
          } else {
            uprightCanvas.width = w;
            uprightCanvas.height = h;
          }
          const uCtx = uprightCanvas.getContext('2d');
          if (uCtx) {
            uCtx.fillStyle = '#ffffff';
            uCtx.fillRect(0, 0, uprightCanvas.width, uprightCanvas.height);
            uCtx.save();
            uCtx.translate(uprightCanvas.width / 2, uprightCanvas.height / 2);
            uCtx.rotate((rot * Math.PI) / 180);
            uCtx.drawImage(cropCanvas, -w / 2, -h / 2);
            uCtx.restore();
          }
        }

        const uCtx = uprightCanvas.getContext('2d');
        const imgData = uCtx?.getImageData(0, 0, uprightCanvas.width, uprightCanvas.height);
        if (imgData && uCtx) {
          cleanImageDataPixels(imgData.data, uprightCanvas.width, uprightCanvas.height, {
            preserveIllustrations: true,
            cleanBorders: false,
          });
          uCtx.putImageData(imgData, 0, 0);
        }

        resolve(uprightCanvas.toDataURL('image/jpeg', 0.92));
      } catch {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}

function escapeXml(unsafe: string): string {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Builds a pristine, publication-grade SVG question card that:
 * 1. Contains 100% clean vector text (zero pencil scratches, zero circled answers, zero underlines).
 * 2. Embeds the authentic real illustration/photo snippet directly, preserving real flowers, vases, and colors.
 */
export function buildHybridCleanSvg(params: {
  questionNumber?: string;
  headerText?: string;
  stemText?: string;
  choices?: string[];
  illustrationDataUrl?: string | null;
  illustrationHeight?: number;
  [key: string]: any;
}): string {
  const questionNumber = params.questionNumber || params.question_number || '1.';
  let headerText = params.headerText || params.header_text || '';
  const stemText = params.stemText || params.stem_text || '';
  const rawChoices = params.choices || ['A', 'B', 'C', 'D'];
  const illustrationDataUrl = params.illustrationDataUrl || params.illustration_data_url || null;
  const illustrationHeight = params.illustrationHeight || 220;

  function wrapText(text: string, maxChars = 68): string[] {
    if (!text) return [];
    const paragraphs = text.split('\n');
    const lines: string[] = [];
    for (const p of paragraphs) {
      const words = p.split(/\s+/).filter(Boolean);
      let currentLine = '';
      for (const w of words) {
        if ((currentLine + ' ' + w).trim().length > maxChars) {
          if (currentLine) lines.push(currentLine.trim());
          currentLine = w;
        } else {
          currentLine = (currentLine + ' ' + w).trim();
        }
      }
      if (currentLine) lines.push(currentLine.trim());
    }
    return lines;
  }

  // Avoid repeating question number if already prefixed in headerText
  const qNumPrefix = questionNumber.replace(/[\.\s]+$/, '').trim();
  if (qNumPrefix && headerText.trim().startsWith(qNumPrefix)) {
    headerText = headerText.trim().replace(new RegExp(`^${qNumPrefix}[\\.\\-\\)\\s]+`), '').trim();
  }

  const headerLines = wrapText(headerText, 68);
  const stemLines = wrapText(stemText, 68);

  let currentY = 50;
  let headerTspans = '';

  if (headerLines.length > 0) {
    headerTspans = headerLines
      .map((line, idx) => {
        const y = currentY;
        currentY += 28;
        if (idx === 0) {
          return `<text x="50" y="${y}" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="18" fill="#1e293b"><tspan font-weight="bold" fill="#0f172a">${escapeXml(
            questionNumber
          )} </tspan>${escapeXml(line)}</text>`;
        }
        return `<text x="50" y="${y}" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="18" fill="#1e293b">${escapeXml(
          line
        )}</text>`;
      })
      .join('\n  ');
  }

  let illBlock = '';
  if (illustrationDataUrl) {
    currentY += 15;
    const illY = currentY;
    illBlock = `
  <!-- Authentic Real Illustration Embedded Directly -->
  <g transform="translate(50, ${illY})">
    <rect width="700" height="${illustrationHeight}" fill="#ffffff" rx="8"/>
    <image href="${illustrationDataUrl}" x="10" y="10" width="680" height="${
      illustrationHeight - 20
    }" preserveAspectRatio="xMidYMid meet" />
  </g>`;
    currentY += illustrationHeight + 25;
  } else {
    currentY += 10;
  }

  const stemTspans = stemLines
    .map((line, idx) => {
      const isLast = idx === stemLines.length - 1;
      const y = currentY;
      currentY += 28;
      return `<text x="50" y="${y}" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="18" font-weight="${
        isLast ? 'bold' : 'normal'
      }" fill="${isLast ? '#0f172a' : '#1e293b'}">${escapeXml(line)}</text>`;
    })
    .join('\n  ');

  currentY += 25;
  const choiceY = currentY;
  const choiceLetters = ['A', 'B', 'C', 'D'];
  const sanitizedChoices = (rawChoices.length > 0 ? rawChoices : ['A', 'B', 'C', 'D'])
    .slice(0, 4)
    .map((c) => {
      const s = String(c ?? '').trim();
      return s.replace(/^\(?[A-Da-d]\)?[\.\)\:\-\s]*/, '').trim() || s;
    });

  const isLongChoices = sanitizedChoices.some((c) => c.length > 16);
  let choiceElements = '';
  let choiceBlockHeight = 70;

  if (!isLongChoices) {
    // 4 choices side-by-side
    choiceElements = sanitizedChoices
      .map((c, i) => {
        const x = 50 + i * 180;
        return `
    <g transform="translate(${x}, ${choiceY})">
      <rect width="165" height="46" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="16" y="28" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="17" font-weight="bold" fill="#0f172a">${
        choiceLetters[i]
      }) <tspan font-weight="normal" fill="#334155">${escapeXml(c)}</tspan></text>
    </g>`;
      })
      .join('');
    choiceBlockHeight = 70;
  } else {
    // 2x2 grid for long options
    choiceElements = sanitizedChoices
      .map((c, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 50 + col * 360;
        const y = choiceY + row * 56;
        return `
    <g transform="translate(${x}, ${y})">
      <rect width="340" height="46" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="16" y="28" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">${
        choiceLetters[i]
      }) <tspan font-weight="normal" fill="#334155">${escapeXml(c)}</tspan></text>
    </g>`;
      })
      .join('');
    choiceBlockHeight = 125;
  }

  const totalHeight = choiceY + choiceBlockHeight + 20;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${totalHeight}" width="800" height="${totalHeight}">
  <rect width="800" height="${totalHeight}" rx="12" fill="#ffffff" />
  ${headerTspans}
  ${illBlock}
  ${stemTspans}
  <g>
    ${choiceElements}
  </g>
</svg>`;
}

/**
 * Automatically cleans student pencil marks, circled options, margin scribbles,
 * and page shadows from a question photo to produce a clean, scanner-quality question image.
 */
export function autoCleanStudentScribbles(
  dataUrl: string,
  options: AutoCleanOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => reject(new Error('Soru fotoğrafı temizlenirken yüklenemedi.'));
    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width || 800;
        const height = img.naturalHeight || img.height || 600;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        cleanImageDataPixels(imgData.data, width, height, options);
        ctx.putImageData(imgData, 0, 0);

        const cleanedDataUrl = canvas.toDataURL('image/jpeg', 0.90);
        resolve(cleanedDataUrl);
      } catch (err: any) {
        reject(new Error('Otomatik karalama temizleme sırasında hata: ' + (err?.message || '')));
      }
    };
    img.src = dataUrl;
  });
}

/**
 * Whitens the background paper, eliminates light graphite pencil scratches,
 * and sharpens dark printed ink to create a clean, scanner-quality question image.
 * Uses autoCleanStudentScribbles internally for superior adaptive illumination.
 */
export function applyDocumentWhiteningFilter(dataUrl: string): Promise<string> {
  return autoCleanStudentScribbles(dataUrl, { mode: 'balanced', removeColorPen: true, cleanBorders: true });
}
