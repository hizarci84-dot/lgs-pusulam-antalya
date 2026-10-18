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
});
