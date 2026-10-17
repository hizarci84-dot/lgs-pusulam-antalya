import fs from 'fs';
const html = fs.readFileSync('scraped_antalya.html', 'utf-8');
const trs = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
const rawTypes = new Set();
const allData = [];

for(let i = 1; i < trs.length; i++) {
  const tds = [...trs[i][1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
  if (tds.length < 6) continue;
  const rawTitle = tds[0][1].replace(/<[^>]+>/g, '').trim();
  const parts = rawTitle.split('/').map(s => s.trim());
  let st = parts[parts.length - 2];
  rawTypes.add(st);
  allData.push({ rawTitle, parts, st });
}
console.log('Unique raw types:', Array.from(rawTypes));

// Check any anomalous ones
allData.filter(d => !['Fen Lisesi', 'Anadolu Lisesi', 'Sosyal Bilimler Lisesi', 'Anadolu İmam Hatip Lisesi', 'Mesleki ve Teknik Anadolu Lisesi'].includes(d.st)).forEach(d => {
  console.log('Anomalous:', d.st, '-->', d.rawTitle);
});
