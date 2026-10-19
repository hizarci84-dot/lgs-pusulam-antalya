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
}

/**
 * High-performance pure pixel cleaner for test question photos.
 * Performs adaptive background illumination estimation, eliminates pencil graphite smudges,
 * circles around options (A, B, C, D), student margin scribbles, and blue/red pen marks,
 * while preserving dark printed ink, Turkish characters, punctuation, and diagrams.
 */
export function cleanImageDataPixels(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options: AutoCleanOptions = {}
): void {
  const mode = options.mode || 'balanced';
  const removeColorPen = options.removeColorPen !== false;
  const cleanBorders = options.cleanBorders !== false;

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

      // 1. Pure paper background (brightest areas close to local paper lighting) -> crisp white
      if (relLum >= 242) {
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        continue;
      }

      // 2. Shaded diagram regions in LGS questions (e.g. light blue "taralı alan" with lum >= 140 and moderate chroma)
      // Must be strictly preserved in original full color!
      if (lum >= 140 && chroma >= 14 && chroma <= 65 && relLum < 242) {
        continue;
      }

      // 3. Student colored pen ink (deep blue ballpoint, bright red pen, neon highlighter)
      if (removeColorPen && (chroma > 60 || (chroma > 25 && lum < 140))) {
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        continue;
      }

      // 4. Other colored printed items (diagram lines, logos)
      if (chroma > 20) {
        continue;
      }

      // 5. Neutral paper, pencil graphite, and dark printed ink
      if (relLum >= pencilCutoff) {
        // Paper background and pencil graphite scribbles -> PURE WHITE
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
      } else if (relLum <= inkCutoff) {
        // Printed black ink -> crisp deep dark
        const inkFactor = relLum / inkCutoff;
        const dark = Math.round(inkFactor * 32);
        data[idx] = dark;
        data[idx + 1] = dark;
        data[idx + 2] = dark;
      } else {
        // Anti-aliased font edges & gray diagram borders -> smooth transition
        const t = (relLum - inkCutoff) / (pencilCutoff - inkCutoff);
        const smoothVal = Math.round(32 + Math.pow(t, 1.4) * (255 - 32));
        data[idx] = smoothVal;
        data[idx + 1] = smoothVal;
        data[idx + 2] = smoothVal;
      }
    }
  }
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
