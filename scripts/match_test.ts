import fs from 'fs';
import { ANTALYA_SCHOOL_PROGRAMS } from '../src/data/antalyaSchools.ts';

const html = fs.readFileSync('scraped_antalya.html', 'utf-8');
const trs = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

function parseCellValues(cellHtml) {
  let normalized = cellHtml.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1<br>');
  let parts = normalized.split(/<br\s*\/?>/i).map(s => s.replace(/<[^>]+>/g, '').trim()).filter(s => s.length > 0);
  return parts;
}

function parseNumber(str) {
  if (!str || str === '-' || str === '--') return null;
  const cleaned = str.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseQuota(str) {
  if (!str || str === '-' || str === '--') return 0;
  const num = parseInt(str, 10);
  return isNaN(num) ? 0 : num;
}

function normalizeStr(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('Existing schools:', ANTALYA_SCHOOL_PROGRAMS.length);

const scraped = [];
for(let i = 1; i < trs.length; i++) {
  const tds = [...trs[i][1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
  if (tds.length < 6) continue;

  const rawTitle = tds[0][1].replace(/<[^>]+>/g, '').trim();
  const duration = tds[1][1].replace(/<[^>]+>/g, '').trim();
  const years = parseCellValues(tds[2][1]);
  const quotas = parseCellValues(tds[3][1]);
  const scores = parseCellValues(tds[4][1]);
  const percentiles = parseCellValues(tds[5][1]);

  const parts = rawTitle.split('/').map(s => s.trim());
  const district = parts[1] || '';
  const schoolName = parts[2] || '';

  scraped.push({
    rawTitle,
    district,
    schoolName,
    duration,
    years,
    quotas,
    scores,
    percentiles
  });
}

console.log('Scraped count:', scraped.length);

let matchedCount = 0;
scraped.forEach(sc => {
  const matched = ANTALYA_SCHOOL_PROGRAMS.find(ex => {
    const scNorm = normalizeStr(sc.schoolName);
    const exNorm = normalizeStr(ex.schoolName);
    return scNorm === exNorm || scNorm.includes(exNorm) || exNorm.includes(scNorm);
  });
  if (matched) {
    matchedCount++;
  } else {
    // console.log('Unmatched:', sc.schoolName, '(', sc.district, ')');
  }
});

console.log('Matched count:', matchedCount, 'out of', scraped.length);
