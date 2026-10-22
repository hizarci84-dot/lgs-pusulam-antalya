import { describe, expect, it } from 'vitest';
import { cleanImageDataPixels } from '../src/services/imageUtils';

describe('Otomatik Karalama ve Kurşun Kalem Temizleme Motoru (cleanImageDataPixels)', () => {
  it('1. Beyaz kağıt üzerindeki kurşun kalem karalamalarını ve şık işaretlerini beyaza dönüştürmelidir', () => {
    // 64x64 test image
    const width = 64;
    const height = 64;
    const data = new Uint8ClampedArray(width * height * 4);

    // Fill with paper background (slightly off-white / yellowish phone photo lighting: R=230, G=225, B=215)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 230;
      data[i + 1] = 225;
      data[i + 2] = 215;
      data[i + 3] = 255;
    }

    // Add a dark printed letter in the center (R=25, G=25, B=25)
    const printedIdx = (30 * width + 30) * 4;
    data[printedIdx] = 25;
    data[printedIdx + 1] = 25;
    data[printedIdx + 2] = 25;

    // Add a pencil graphite circle / scribble around it (graphite: R=155, G=155, B=155)
    const pencilIdx = (30 * width + 40) * 4;
    data[pencilIdx] = 155;
    data[pencilIdx + 1] = 155;
    data[pencilIdx + 2] = 155;

    cleanImageDataPixels(data, width, height, { mode: 'balanced', cleanBorders: false });

    // The printed letter must remain dark ink
    expect(data[printedIdx]).toBeLessThanOrEqual(35);
    expect(data[printedIdx + 1]).toBeLessThanOrEqual(35);
    expect(data[printedIdx + 2]).toBeLessThanOrEqual(35);

    // The pencil scribble must be completely erased to pure white (255, 255, 255)
    expect(data[pencilIdx]).toBe(255);
    expect(data[pencilIdx + 1]).toBe(255);
    expect(data[pencilIdx + 2]).toBe(255);

    // The paper background itself must become pure crisp white (255, 255, 255)
    const paperIdx = (10 * width + 10) * 4;
    expect(data[paperIdx]).toBe(255);
    expect(data[paperIdx + 1]).toBe(255);
    expect(data[paperIdx + 2]).toBe(255);
  });

  it('2. Öğrencinin mavi veya kırmızı tükenmez kalemle çizdiği işaretleri ve daireleri temizlemelidir', () => {
    const width = 64;
    const height = 64;
    const data = new Uint8ClampedArray(width * height * 4);

    // White paper
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 245;
      data[i + 1] = 245;
      data[i + 2] = 245;
      data[i + 3] = 255;
    }

    // Blue pen circle: R=30, G=70, B=200
    const blueIdx = (25 * width + 25) * 4;
    data[blueIdx] = 30;
    data[blueIdx + 1] = 70;
    data[blueIdx + 2] = 200;

    // Red pen underline: R=210, G=40, B=50
    const redIdx = (35 * width + 35) * 4;
    data[redIdx] = 210;
    data[redIdx + 1] = 40;
    data[redIdx + 2] = 50;

    cleanImageDataPixels(data, width, height, { removeColorPen: true, cleanBorders: false });

    // Both blue and red marks must be cleaned to pure white
    expect(data[blueIdx]).toBe(255);
    expect(data[blueIdx + 1]).toBe(255);
    expect(data[blueIdx + 2]).toBe(255);

    expect(data[redIdx]).toBe(255);
    expect(data[redIdx + 1]).toBe(255);
    expect(data[redIdx + 2]).toBe(255);
  });

  it('3. Kenar sınır gölgelerini (kamera vinyeti) temizlemelidir', () => {
    const width = 64;
    const height = 64;
    const data = new Uint8ClampedArray(width * height * 4);

    // Frame with dark edges
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 50;
      data[i + 1] = 50;
      data[i + 2] = 50;
      data[i + 3] = 255;
    }

    cleanImageDataPixels(data, width, height, { cleanBorders: true });

    // Outermost 1px border must be cleaned to pure white
    const borderIdx = 0; // (0, 0)
    expect(data[borderIdx]).toBe(255);
    expect(data[borderIdx + 1]).toBe(255);
    expect(data[borderIdx + 2]).toBe(255);
  });

  it('4. Renkli soru çizimlerini (güller, vazolar, yapraklar) aslına sadık korumalı, kurşun kalem yazılarını temizlemelidir', () => {
    const width = 64;
    const height = 64;
    const data = new Uint8ClampedArray(width * height * 4);

    // Light paper background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 235;
      data[i + 1] = 232;
      data[i + 2] = 228;
      data[i + 3] = 255;
    }

    // Red rose pixel: R=210, G=30, B=40 (chroma = 180)
    const roseIdx = (20 * width + 20) * 4;
    data[roseIdx] = 210;
    data[roseIdx + 1] = 30;
    data[roseIdx + 2] = 40;

    // Terracotta vase pixel: R=185, G=105, B=60 (chroma = 125)
    const vaseIdx = (20 * width + 35) * 4;
    data[vaseIdx] = 185;
    data[vaseIdx + 1] = 105;
    data[vaseIdx + 2] = 60;

    // Graphite pencil mark: R=155, G=155, B=155 (chroma = 0)
    const pencilIdx = (40 * width + 20) * 4;
    data[pencilIdx] = 155;
    data[pencilIdx + 1] = 155;
    data[pencilIdx + 2] = 155;

    cleanImageDataPixels(data, width, height, {
      preserveIllustrations: true,
      cleanBorders: false,
    });

    // The red rose must NOT be turned to white! Its red color must be preserved
    expect(data[roseIdx]).toBeGreaterThan(180);
    expect(data[roseIdx + 1]).toBeLessThan(70);
    expect(data[roseIdx + 2]).toBeLessThan(80);

    // The terracotta vase color must be preserved
    expect(data[vaseIdx]).toBeGreaterThan(160);
    expect(data[vaseIdx + 1]).toBeGreaterThan(80);

    // The graphite pencil marking must be completely erased to pure white
    expect(data[pencilIdx]).toBe(255);
    expect(data[pencilIdx + 1]).toBe(255);
    expect(data[pencilIdx + 2]).toBe(255);
  });

  it('5. buildHybridCleanSvg fonksiyonu kurşun kalem yazılarını temizlenmiş, şıkları ve orijinal görseli kusursuz oluşturmalıdır', async () => {
    const { buildHybridCleanSvg } = await import('../src/services/imageUtils');

    const svg = buildHybridCleanSvg({
      questionNumber: '2.',
      headerText: 'Bir çiçekçi elindeki 96 adet gülün tamamını her birinde eşit sayıda gül olacak şekilde vazolara koyacaktır.',
      stemText: 'Çiçekçinin 20 tane vazosu olup bir vazoya mümkün olan en az sayıda gül koymuştur. Buna göre çiçekçinin kullanmadığı vazo sayısı kaçtır?',
      choices: ['A) 2', 'B) 4', 'C) 6', 'D) 8'],
      illustrationDataUrl: 'data:image/jpeg;base64,mockFlowerData',
      illustrationHeight: 200,
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('Bir çiçekçi elindeki 96 adet gülün tamamını');
    expect(svg).toContain('Çiçekçinin 20 tane vazosu olup');
    // Ensure choices prefix 'A) A)' is not duplicated
    expect(svg).not.toContain('A) A)');
    expect(svg).toContain('A) <tspan font-weight="normal" fill="#334155">2</tspan>');
    expect(svg).toContain('B) <tspan font-weight="normal" fill="#334155">4</tspan>');
    expect(svg).toContain('C) <tspan font-weight="normal" fill="#334155">6</tspan>');
    expect(svg).toContain('D) <tspan font-weight="normal" fill="#334155">8</tspan>');
    // Ensure authentic illustration image is embedded
    expect(svg).toContain('href="data:image/jpeg;base64,mockFlowerData"');
  });

  it('6. inpaintHandwritingRegions: Yalnızca belirlenen karalama kutusundaki kurşun kalem yazılarını temizlemeli, dışındaki pikselleri %100 korumalıdır', async () => {
    const { inpaintHandwritingRegions } = await import('../src/services/imageUtils');

    const width = 100;
    const height = 100;
    const pixels = new Uint8ClampedArray(width * height * 4);

    // Fill with natural paper background (R=240, G=238, B=235)
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 240;
      pixels[i + 1] = 238;
      pixels[i + 2] = 235;
      pixels[i + 3] = 255;
    }

    // A critical printed mathematical formula OUTSIDE the handwriting box: e.g. "√48 - 2^5" at (15, 15)
    const printedMathIdx = (15 * width + 15) * 4;
    pixels[printedMathIdx] = 20;
    pixels[printedMathIdx + 1] = 20;
    pixels[printedMathIdx + 2] = 20;

    // Student pencil scribble INSIDE the handwriting box [500, 500, 800, 800] -> at (60, 60)
    const scribbleIdx = (60 * width + 60) * 4;
    pixels[scribbleIdx] = 140; // graphite pencil
    pixels[scribbleIdx + 1] = 140;
    pixels[scribbleIdx + 2] = 140;

    // Inpaint ONLY box [500, 500, 800, 800] (normalized 0..1000)
    const result = inpaintHandwritingRegions(pixels, width, height, [
      [500, 500, 800, 800],
    ]);

    expect(result.modifiedPixelCount).toBeGreaterThan(0);

    // 1. Printed math outside the box MUST BE 100% BIT-FOR-BIT UNTOUCHED!
    expect(pixels[printedMathIdx]).toBe(20);
    expect(pixels[printedMathIdx + 1]).toBe(20);
    expect(pixels[printedMathIdx + 2]).toBe(20);

    // 2. The pencil scribble inside the box must be inpainted to paper texture (>= 220)
    expect(pixels[scribbleIdx]).toBeGreaterThanOrEqual(220);
    expect(pixels[scribbleIdx + 1]).toBeGreaterThanOrEqual(220);
    expect(pixels[scribbleIdx + 2]).toBeGreaterThanOrEqual(220);
  });

  it('7. validateCleanedImageQuality: Boş veya bozuk görüntüleri ve örtüşme riskini tespit etmelidir', async () => {
    const { validateCleanedImageQuality } = await import('../src/services/imageUtils');

    const width = 100;
    const height = 100;

    // 1. Solid pure white image (washed out / deleted content)
    const blankPixels = new Uint8ClampedArray(width * height * 4).fill(255);
    const blankCheck = validateCleanedImageQuality(blankPixels, width, height);
    expect(blankCheck.passed).toBe(false);

    // 2. Normal question image with text and paper
    const normalPixels = new Uint8ClampedArray(width * height * 4).fill(245);
    for (let i = 0; i < 500; i++) {
      normalPixels[i * 4] = 20; // dark printed text
      normalPixels[i * 4 + 1] = 20;
      normalPixels[i * 4 + 2] = 20;
    }
    const normalCheck = validateCleanedImageQuality(normalPixels, width, height);
    expect(normalCheck.passed).toBe(true);

    // 3. Overlap warning check: karalama basılı yazının üzerine geldiğinde tüm işlem reddedilmemeli; kısmi temizleme (partial) olarak onaylanmalıdır
    const overlapCheck = validateCleanedImageQuality(
      normalPixels,
      width,
      height,
      true,
      'Basılı yazı veya şekille yoğun çakışan alanlar soruyu bozmamak için korundu.'
    );
    expect(overlapCheck.passed).toBe(true);
    expect(overlapCheck.status).toBe('partial');
    expect(overlapCheck.isOverlapRisk).toBe(true);
    expect(overlapCheck.reason).toContain('korundu');
  });

  it('8. transformBoxToRotatedCrop: Koordinat dönüşümünü ve rotasyonları doğru hesaplamalıdır', async () => {
    const { transformBoxToRotatedCrop } = await import('../src/services/imageUtils');

    // Case 1: No crop, no rotation (identity)
    const box1: [number, number, number, number] = [100, 200, 300, 400];
    const res1 = transformBoxToRotatedCrop(box1, [0, 0, 1000, 1000], 0);
    expect(res1).toEqual([100, 200, 300, 400]);

    // Case 2: Sub-crop (question is in [500, 500, 1000, 1000]), mark is at [600, 600, 800, 800]
    // In local crop coords: 600 is (600-500)/500 = 0.2 -> 200, 800 is (800-500)/500 = 0.6 -> 600
    const res2 = transformBoxToRotatedCrop([600, 600, 800, 800], [500, 500, 1000, 1000], 0);
    expect(res2).toEqual([200, 200, 600, 600]);

    // Case 3: Mark outside the crop box
    const res3 = transformBoxToRotatedCrop([100, 100, 200, 200], [500, 500, 1000, 1000], 0);
    expect(res3).toBeNull();

    // Case 4: 90 degree clockwise rotation
    // Top-left box in crop [100, 100, 200, 200]
    // Rotated 90 deg clockwise -> should move to top-right: y: [100, 200], x: [1000-200, 1000-100] = [800, 900]
    const res4 = transformBoxToRotatedCrop([100, 100, 200, 200], [0, 0, 1000, 1000], 90);
    expect(res4).toEqual([100, 800, 200, 900]);
  });

  it('9. 3-Kademeli Bölge Mantığı (Safe, Recoverable, High-Risk): Güvenli alanları silmeli, yüksek riskli matematiksel formülleri korumalı ve kısmi başarı bildirmelidir', async () => {
    const { inpaintHandwritingRegions } = await import('../src/services/imageUtils');

    const width = 100;
    const height = 100;
    const pixels = new Uint8ClampedArray(width * height * 4);

    // Light paper background
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 240;
      pixels[i + 1] = 238;
      pixels[i + 2] = 235;
      pixels[i + 3] = 255;
    }

    // Safe region at (20, 20): margin scribble (pencil: 140, 140, 140)
    const safeScribbleIdx = (20 * width + 20) * 4;
    pixels[safeScribbleIdx] = 140;
    pixels[safeScribbleIdx + 1] = 140;
    pixels[safeScribbleIdx + 2] = 140;

    // High-risk region at (70, 70): student heavily scribbled over a complex formula
    // We want the formula pixels (e.g. dark formula symbol) to be PRESERVED, not corrupted
    const highRiskFormulaIdx = (70 * width + 70) * 4;
    pixels[highRiskFormulaIdx] = 25;
    pixels[highRiskFormulaIdx + 1] = 25;
    pixels[highRiskFormulaIdx + 2] = 25;

    const boxes = [
      { ymin: 100, xmin: 100, ymax: 300, xmax: 300, type: 'safe' as const, description: 'Kenar karalaması' },
      { ymin: 600, xmin: 600, ymax: 800, xmax: 800, type: 'high_risk' as const, description: 'Karmaşık formül üzeri karalama' },
    ];

    const result = inpaintHandwritingRegions(pixels, width, height, boxes);

    // 1. Safe scribble is cleaned
    expect(result.cleanedBoxesCount).toBeGreaterThanOrEqual(1);
    expect(result.modifiedPixelCount).toBeGreaterThan(0);
    expect(pixels[safeScribbleIdx]).toBeGreaterThanOrEqual(220);

    // 2. High-risk box is skipped/preserved, NOT corrupted or deleted!
    expect(result.preservedHighRiskBoxesCount).toBe(1);
    expect(pixels[highRiskFormulaIdx]).toBe(25);
    expect(pixels[highRiskFormulaIdx + 1]).toBe(25);
    expect(pixels[highRiskFormulaIdx + 2]).toBe(25);
  });

  it('10. Düşük ışıklı (loş/oda aydınlatması ~138 lum) fotoğraflarda adaptif kağıt örneklemesi ile karalamaları pürüzsüz temizlemelidir', async () => {
    const { inpaintHandwritingRegions } = await import('../src/services/imageUtils');

    const width = 100;
    const height = 100;
    const pixels = new Uint8ClampedArray(width * height * 4);

    // Indoor lighting: paper is around lum 138 (R=140, G=138, B=135)
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 140;
      pixels[i + 1] = 138;
      pixels[i + 2] = 135;
      pixels[i + 3] = 255;
    }

    // Diagonal pencil mark inside [400, 400, 700, 700] -> at (55, 55): graphite lum 85 (R=85, G=85, B=85)
    const pencilIdx = (55 * width + 55) * 4;
    pixels[pencilIdx] = 85;
    pixels[pencilIdx + 1] = 85;
    pixels[pencilIdx + 2] = 85;

    const result = inpaintHandwritingRegions(pixels, width, height, [
      { ymin: 400, xmin: 400, ymax: 700, xmax: 700, type: 'safe', description: 'Boşluktaki çapraz karalama' },
    ]);

    expect(result.modifiedPixelCount).toBeGreaterThan(0);
    // Inpainted pixel must blend adaptively to local paper (around 130-145), NOT jump to pure white 255 or flat 0!
    expect(pixels[pencilIdx]).toBeGreaterThanOrEqual(125);
    expect(pixels[pencilIdx]).toBeLessThanOrEqual(150);
  });

  it('11. Şık daireleme işaretinde: Çevreleyen kurşun kalem halkasını silmeli, ortadaki basılı A/B/C/D harfini %100 korumalıdır', async () => {
    const { inpaintHandwritingRegions } = await import('../src/services/imageUtils');

    const width = 100;
    const height = 100;
    const pixels = new Uint8ClampedArray(width * height * 4);

    // White paper (R=245, G=245, B=245)
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 245;
      pixels[i + 1] = 245;
      pixels[i + 2] = 245;
      pixels[i + 3] = 255;
    }

    // Box is [200, 200, 400, 400] -> x: 20..40, y: 20..40
    // Centered printed choice letter 'A' at (30, 30): dark ink (R=25, G=25, B=25)
    const letterCenterIdx = (30 * width + 30) * 4;
    pixels[letterCenterIdx] = 25;
    pixels[letterCenterIdx + 1] = 25;
    pixels[letterCenterIdx + 2] = 25;

    // Outer circle loop at top perimeter (22, 30): pencil stroke (R=130, G=130, B=130)
    const circleLoopIdx = (22 * width + 30) * 4;
    pixels[circleLoopIdx] = 130;
    pixels[circleLoopIdx + 1] = 130;
    pixels[circleLoopIdx + 2] = 130;

    const result = inpaintHandwritingRegions(pixels, width, height, [
      {
        ymin: 200,
        xmin: 200,
        ymax: 400,
        xmax: 400,
        type: 'recoverable',
        description: 'A şıkkı etrafındaki kurşun kalem dairesi',
      },
    ]);

    expect(result.modifiedPixelCount).toBeGreaterThan(0);
    // Center choice letter must be 100% PRESERVED
    expect(pixels[letterCenterIdx]).toBe(25);
    expect(pixels[letterCenterIdx + 1]).toBe(25);
    expect(pixels[letterCenterIdx + 2]).toBe(25);

    // Outer circle loop must be inpainted to paper texture (>= 230)
    expect(pixels[circleLoopIdx]).toBeGreaterThanOrEqual(230);
  });

  it('12. Alt çizgi işaretinde: Metnin altındaki kurşun kalem çizgisini silmeli, üstteki soru metnini %100 korumalıdır', async () => {
    const { inpaintHandwritingRegions } = await import('../src/services/imageUtils');

    const width = 100;
    const height = 100;
    const pixels = new Uint8ClampedArray(width * height * 4);

    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 245;
      pixels[i + 1] = 245;
      pixels[i + 2] = 245;
      pixels[i + 3] = 255;
    }

    // Box is [100, 100, 300, 500] -> x: 10..50, y: 10..30
    // Printed text line in upper portion (y=15, x=30): dark ink (R=20, G=20, B=20)
    const textIdx = (15 * width + 30) * 4;
    pixels[textIdx] = 20;
    pixels[textIdx + 1] = 20;
    pixels[textIdx + 2] = 20;

    // Student underline in lower portion (y=26, x=30): pencil stroke (R=120, G=120, B=120)
    const underlineIdx = (26 * width + 30) * 4;
    pixels[underlineIdx] = 120;
    pixels[underlineIdx + 1] = 120;
    pixels[underlineIdx + 2] = 120;

    const result = inpaintHandwritingRegions(pixels, width, height, [
      {
        ymin: 100,
        xmin: 100,
        ymax: 300,
        xmax: 500,
        type: 'recoverable',
        description: 'Soru metninin altındaki çizgi',
      },
    ]);

    expect(result.modifiedPixelCount).toBeGreaterThan(0);
    // Upper text line must be 100% PRESERVED
    expect(pixels[textIdx]).toBe(20);
    expect(pixels[textIdx + 1]).toBe(20);
    expect(pixels[textIdx + 2]).toBe(20);

    // Lower underline must be inpainted to paper texture
    expect(pixels[underlineIdx]).toBeGreaterThanOrEqual(230);
  });
});
