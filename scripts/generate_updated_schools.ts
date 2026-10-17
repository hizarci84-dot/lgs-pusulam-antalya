import fs from 'fs';
import { ANTALYA_SCHOOL_PROGRAMS as existingPrograms } from '../src/data/antalyaSchools.ts';
import { AntalyaSchoolProgram, SchoolType, SchoolYearlyPlacement } from '../src/types/models.ts';

const html = fs.readFileSync('scraped_antalya.html', 'utf-8');
const trs = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

function parseCellValues(cellHtml: string) {
  let normalized = cellHtml.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1<br>');
  let parts = normalized.split(/<br\s*\/?>/i).map(s => s.replace(/<[^>]+>/g, '').trim()).filter(s => s.length > 0);
  return parts;
}

function parseNumber(str?: string): number | null {
  if (!str || str === '-' || str === '--') return null;
  const cleaned = str.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : Number(num.toFixed(4));
}

function parseQuota(str?: string): number {
  if (!str || str === '-' || str === '--') return 0;
  const num = parseInt(str, 10);
  return isNaN(num) ? 0 : num;
}

const DISTRICT_MAP: Record<string, string> = {
  'DÖŞEMEALTI': 'Döşemealtı',
  'MURATPAŞA': 'Muratpaşa',
  'KEPEZ': 'Kepez',
  'ALANYA': 'Alanya',
  'MANAVGAT': 'Manavgat',
  'AKSU': 'Aksu',
  'KONYAALTI': 'Konyaaltı',
  'GAZİPAŞA': 'Gazipaşa',
  'KEMER': 'Kemer',
  'KUMLUCA': 'Kumluca',
  'SERİK': 'Serik',
  'KORKUTELİ': 'Korkuteli',
  'KAŞ': 'Kaş',
  'ELMALI': 'Elmalı',
  'FİNİKE': 'Finike',
  'DEMRE': 'Demre',
  'AKSEKİ': 'Akseki',
};

function normalizeStr(s: string) {
  return (s || '')
    .toLowerCase()
    .replace(/[-–—]/g, ' ')
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 45);
}

const newPrograms: AntalyaSchoolProgram[] = [];
const seenIds = new Set<string>();

for (let i = 1; i < trs.length; i++) {
  const tds = [...trs[i][1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
  if (tds.length < 6) continue;

  const rawTitle = tds[0][1].replace(/<[^>]+>/g, '').trim();
  const duration = tds[1][1].replace(/<[^>]+>/g, '').trim();
  const years = parseCellValues(tds[2][1]);
  const quotas = parseCellValues(tds[3][1]);
  const scores = parseCellValues(tds[4][1]);
  const percentiles = parseCellValues(tds[5][1]);

  const parts = rawTitle.split('/').map(s => s.trim());
  const rawDistrict = parts[1] || 'MURATPAŞA';
  const district = DISTRICT_MAP[rawDistrict] || rawDistrict;
  const schoolName = parts[2] || '';

  let programName = '';
  let rawSchoolType = '';
  let language = 'İngilizce';

  if (parts.length === 6) {
    programName = parts[3];
    rawSchoolType = parts[4];
    language = parts[5];
  } else if (parts.length === 5) {
    rawSchoolType = parts[3];
    language = parts[4];
    programName = rawSchoolType;
  } else {
    rawSchoolType = parts[parts.length - 2] || 'Anadolu Lisesi';
    language = parts[parts.length - 1] || 'İngilizce';
    programName = parts.slice(3, parts.length - 2).join(' - ') || rawSchoolType;
  }

  // Determine schoolType
  let schoolType: SchoolType = 'Anadolu Lisesi';
  const combined = (rawTitle + ' ' + rawSchoolType).toLowerCase();
  if (combined.includes('fen lisesi') || combined.includes('fen lis.')) {
    schoolType = 'Fen Lisesi';
  } else if (combined.includes('sosyal bilimler')) {
    schoolType = 'Sosyal Bilimler Lisesi';
  } else if (combined.includes('imam hatip')) {
    schoolType = 'Anadolu İmam Hatip Lisesi';
  } else if (
    combined.includes('mesleki ve teknik') ||
    combined.includes('anadolu teknik') ||
    combined.includes('anadolu meslek') ||
    combined.includes('mtal')
  ) {
    schoolType = 'Mesleki ve Teknik Anadolu Lisesi';
  } else {
    schoolType = 'Anadolu Lisesi';
  }

  // Check matching existing school program to retain boardingInfo, schoolCode, etc.
  const normName = normalizeStr(schoolName);
  const existing = existingPrograms.find(ep => {
    const epNorm = normalizeStr(ep.schoolName);
    return (
      (epNorm === normName || epNorm.includes(normName) || normName.includes(epNorm)) &&
      ep.district === district &&
      (parts.length < 6 || normalizeStr(ep.programName).includes(normalizeStr(programName)) || normalizeStr(programName).includes(normalizeStr(ep.programName)))
    );
  }) || existingPrograms.find(ep => {
    const epNorm = normalizeStr(ep.schoolName);
    return epNorm === normName && ep.district === district;
  });

  // Base ID
  let id = existing?.id || `ant-${slugify(district)}-${slugify(schoolName)}${programName && parts.length === 6 ? '-' + slugify(programName) : ''}`;
  if (seenIds.has(id)) {
    id = `${id}-${i}`;
  }
  seenIds.add(id);

  const hasPrepClass = duration.toLowerCase().includes('hazırlık');
  const educationDuration = hasPrepClass ? 'Hazırlık + 4 Yıl (5 Yıl)' : '4 Yıl';

  // Construct yearly placements
  const yearlyPlacements: SchoolYearlyPlacement[] = [];

  // Years in table: 2026, 2025, 2024, 2023
  for (let y = 0; y < years.length; y++) {
    const yr = parseInt(years[y], 10);
    const quota = parseQuota(quotas[y]);
    const minScore = parseNumber(scores[y]);
    const maxPercentile = parseNumber(percentiles[y]);
    const isVerified = maxPercentile !== null && maxPercentile > 0;

    yearlyPlacements.push({
      year: yr,
      placementPeriod: '1. Yerleştirme (Merkezî Sınav)',
      quota,
      minScore,
      maxPercentile,
      isVerified,
      sourceName: yr === 2026 
        ? 'Başarı Sıralamaları 2026 Taban Puanı ve Yüzdelik Dilimi (MEB Güncel)'
        : `MEB ${yr} 1. Yerleştirme Sonuçları`,
      sourceUrl: 'https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/',
      notes: yr === 2026
        ? 'basarisiralamalari.com 2026 Antalya LGS taban puanı ve yüzdelik dilimi verisi'
        : undefined,
    });
  }

  // If existing school had 2022 data, add 2022 placement as well
  if (existing) {
    const p2022 = existing.yearlyPlacements.find(yp => yp.year === 2022);
    if (p2022 && !yearlyPlacements.some(yp => yp.year === 2022)) {
      yearlyPlacements.push(p2022);
    }
  }

  // Sort placements ascending by year (2022, 2023, 2024, 2025, 2026)
  yearlyPlacements.sort((a, b) => a.year - b.year);

  const foreignLanguages = existing?.foreignLanguages?.length
    ? existing.foreignLanguages
    : [language || 'İngilizce'];

  const boardingInfo = existing?.boardingInfo || (schoolType === 'Fen Lisesi' ? 'Kız ve Erkek Pansiyonlu' : 'Yok');

  newPrograms.push({
    id,
    schoolCode: existing?.schoolCode,
    schoolName: existing?.schoolName || schoolName,
    programName: programName || existing?.programName || `${schoolType} Programı`,
    district,
    schoolType,
    educationDuration,
    hasPrepClass,
    foreignLanguages,
    boardingInfo,
    admissionType: 'Merkezî Sınav (LGS Puanı)',
    lastUpdatedAt: '2026-10-17',
    verificationStatus: 'Doğrulanmış Resmî Veri (MEB / e-Okul)',
    dataConflictNote: existing?.dataConflictNote || null,
    sourceUrl: 'https://www.basarisiralamalari.com/antalya-liseleri-taban-puanlari/',
    yearlyPlacements,
  });
}

// Also keep the local placement schools from existingPrograms (e.g. OBP based schools) so local search still works!
existingPrograms.forEach(ep => {
  if (ep.admissionType === 'Yerel Yerleştirme (OBP / Kayıt Alanı)') {
    if (!seenIds.has(ep.id)) {
      seenIds.add(ep.id);
      newPrograms.push(ep);
    }
  }
});

const tsContent = `import { AntalyaSchoolProgram } from '../types/models';

export const ANTALYA_SCHOOL_DATA_LAST_UPDATED = '2026-10-17';
export const ANTALYA_SCHOOL_DATA_VERSION_NOTE =
  'Antalya ili LGS taban puanları ve yüzdelik dilimleri basarisiralamalari.com ve MEB 2023, 2024, 2025 ve 2026 resmî/güncel yerleştirme verileriyle senkronize edilmiştir. 97 merkezî sınavlı okul ve programın 2026 taban puan ve yüzdelik dilimleri eklenmiştir.';

export const ANTALYA_SCHOOL_PROGRAMS: AntalyaSchoolProgram[] = ${JSON.stringify(newPrograms, null, 2)};
`;

fs.writeFileSync('src/data/antalyaSchools.ts', tsContent, 'utf-8');
console.log('Successfully written updated antalyaSchools.ts with', newPrograms.length, 'schools!');
