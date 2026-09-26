import fs from 'node:fs';
import path from 'node:path';
import cameras from '../src/data/cameras.json' with { type: 'json' };

const root = path.resolve('dist');
const cityMap = [
  { slug: 'sapporo', match: ['札幌市', '札幌市ほか'] },
  { slug: 'hakodate', match: ['函館市'] },
  { slug: 'otaru', match: ['小樽市'] },
  { slug: 'asahikawa', match: ['旭川市'] },
  { slug: 'chitose', match: ['千歳市'] },
  { slug: 'wakkanai', match: ['稚内市'] },
  { slug: 'furano', match: ['富良野市'] },
  { slug: 'niseko', match: ['ニセコ町', '倶知安町'] },
  { slug: 'obihiro', match: ['帯広市'] },
  { slug: 'kushiro', match: ['釧路市'] }
];

const missing = [];
for (const camera of cameras) {
  const file = path.join(root, 'live', camera.cameraId, 'index.html');
  if (!fs.existsSync(file)) missing.push(`/live/${camera.cameraId}/`);
}
for (const city of cityMap) {
  if (!cameras.some(c => city.match.includes(c.city))) continue;
  const file = path.join(root, 'explore', 'hokkaido', city.slug, 'index.html');
  if (!fs.existsSync(file)) missing.push(`/explore/hokkaido/${city.slug}/`);
}
if (missing.length) {
  console.error('Missing generated routes:');
  for (const route of missing) console.error(`- ${route}`);
  process.exit(1);
}
console.log(`Route integrity OK: ${cameras.length} LIVE WINDOW routes and all registered city routes exist.`);
