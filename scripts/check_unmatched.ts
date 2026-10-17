import fs from 'fs';
import { ANTALYA_SCHOOL_PROGRAMS } from '../src/data/antalyaSchools.ts';

const html = fs.readFileSync('scraped_antalya.html', 'utf-8');
const trs = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

const scrapedNames = [];
for(let i = 1; i < trs.length; i++) {
  const tds = [...trs[i][1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
  if (tds.length < 6) continue;
  const rawTitle = tds[0][1].replace(/<[^>]+>/g, '').trim();
  const parts = rawTitle.split('/').map(s => s.trim());
  scrapedNames.push(parts[2] || '');
}

function normalizeStr(s: string) {
  return (s || '').toLowerCase().replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim();
}

ANTALYA_SCHOOL_PROGRAMS.forEach(ex => {
  const exNorm = normalizeStr(ex.schoolName);
  const found = scrapedNames.some(sn => {
    const scNorm = normalizeStr(sn);
    return scNorm === exNorm || scNorm.includes(exNorm) || exNorm.includes(scNorm);
  });
  if (!found) {
    console.log('Unmatched existing school:', ex.schoolName, '(', ex.district, ')', 'Admission:', ex.admissionType);
  }
});
