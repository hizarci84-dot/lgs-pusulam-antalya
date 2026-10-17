import fs from 'fs';
const html = fs.readFileSync('scraped_antalya.html', 'utf-8');
const textMatches = [...html.matchAll(/<(p|div|h1|h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi)]
  .map(m => m[2].replace(/<[^>]+>/g, '').trim())
  .filter(s => s.length > 20 && (s.includes('2026') || s.includes('Taban') || s.includes('LGS')));
console.log('Found notes:', textMatches.slice(0, 10));
