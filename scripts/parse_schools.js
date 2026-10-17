import fs from 'fs';

const html = fs.readFileSync('scraped_antalya.html', 'utf-8');
const trs = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

function parseCellValues(cellHtml) {
  // Replace <span ...>value</span> with value<br>
  let normalized = cellHtml.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1<br>');
  // Split by <br> or <br/>
  let parts = normalized.split(/<br\s*\/?>/i).map(s => s.replace(/<[^>]+>/g, '').trim()).filter(s => s.length > 0);
  return parts;
}

console.log('Total trs:', trs.length);

const tds = [...trs[1][1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
console.log('Raw TD2:', tds[2][1]);
console.log('Parsed TD2:', parseCellValues(tds[2][1]));

const testTd4 = tds[4][1];
console.log('Raw TD4:', testTd4);
console.log('Parsed TD4:', parseCellValues(testTd4));

const testTd5 = tds[5][1];
console.log('Raw TD5:', testTd5);
console.log('Parsed TD5:', parseCellValues(testTd5));
