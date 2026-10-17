import fs from 'fs';

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

const allRows = [];

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
  const city = parts[0] || 'ANTALYA';
  const district = parts[1] || '';
  const schoolName = parts[2] || '';

  // Determine programName, schoolType, foreignLanguages
  // Example: ANTALYA / DÖŞEMEALTI / Yusuf Ziya Öner Fen Lisesi / FEN BİLİMLERİ ALANI (FEN LİS.) / Fen Lisesi / İngilizce
  // Example: ANTALYA / MURATPAŞA / Antalya Anadolu Lisesi / Anadolu Lisesi / İngilizce
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

  // Placement mappings
  const placements = {};
  for(let yIdx = 0; yIdx < years.length; yIdx++) {
    const yr = years[yIdx];
    placements[yr] = {
      quota: parseQuota(quotas[yIdx]),
      minScore: parseNumber(scores[yIdx]),
      maxPercentile: parseNumber(percentiles[yIdx])
    };
  }

  allRows.push({
    index: i,
    rawTitle,
    city,
    district,
    schoolName,
    programName,
    rawSchoolType,
    language,
    duration,
    hasPrepClass: duration.toLowerCase().includes('hazırlık'),
    placements
  });
}

console.log('Total schools parsed:', allRows.length);
console.log('Sample school 1:');
console.dir(allRows[0], { depth: null });
console.log('Sample school 97 (last):');
console.dir(allRows[allRows.length - 1], { depth: null });

// Print summary by district
const districtCounts = {};
allRows.forEach(r => {
  districtCounts[r.district] = (districtCounts[r.district] || 0) + 1;
});
console.log('District counts:', districtCounts);
