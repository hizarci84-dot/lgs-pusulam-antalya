import fs from 'fs';

const html = fs.readFileSync('scraped_antalya.html', 'utf-8');
const trs = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

function parseCellValues(cellHtml) {
  let normalized = cellHtml.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1<br>');
  let parts = normalized.split(/<br\s*\/?>/i).map(s => s.replace(/<[^>]+>/g, '').trim()).filter(s => s.length > 0);
  return parts;
}

const parsedSchools = [];

for(let i = 1; i < trs.length; i++) {
  const tds = [...trs[i][1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
  if (tds.length < 6) continue;

  const rawTitle = tds[0][1].replace(/<[^>]+>/g, '').trim();
  const duration = tds[1][1].replace(/<[^>]+>/g, '').trim();
  const years = parseCellValues(tds[2][1]);
  const quotas = parseCellValues(tds[3][1]);
  const scores = parseCellValues(tds[4][1]);
  const percentiles = parseCellValues(tds[5][1]);

  // Title format typically: ANTALYA / İLÇE / Okul Adı / Alan / Okul Türü / Yabancı Dil
  // Or: ANTALYA / İLÇE / Okul Adı / Okul Türü / Yabancı Dil
  const titleParts = rawTitle.split('/').map(s => s.trim());

  parsedSchools.push({
    index: i,
    rawTitle,
    titleParts,
    duration,
    years,
    quotas,
    scores,
    percentiles
  });
}

console.log(`Successfully parsed ${parsedSchools.length} schools.`);

// Print first 10 schools
parsedSchools.slice(0, 10).forEach(s => {
  console.log(`[${s.index}] ${s.rawTitle}`);
  console.log(`    Duration: ${s.duration}`);
  console.log(`    Years: ${s.years.join(', ')}`);
  console.log(`    Quotas: ${s.quotas.join(', ')}`);
  console.log(`    Scores: ${s.scores.join(', ')}`);
  console.log(`    Percentiles: ${s.percentiles.join(', ')}`);
});
