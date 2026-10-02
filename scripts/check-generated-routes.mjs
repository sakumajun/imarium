import fs from 'node:fs';
import path from 'node:path';
import cameras from '../src/data/cameras.json' with { type: 'json' };

const root = path.resolve('dist');
const isPublished = camera => camera.status === 'live' && camera.embedEnabled === true;
const publishedCameras = cameras.filter(isPublished);
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

const requiredStaticRoutes = ['/', '/explore/', '/explore/hokkaido/', '/explore/aomori/', '/favorites/', '/multiview/', '/404.html'];

const routeToFile = route => {
  if (route === '/') return path.join(root, 'index.html');
  if (route === '/404.html') return path.join(root, '404.html');
  return path.join(root, route.replace(/^\//, ''), 'index.html');
};

const missing = [];
for (const route of requiredStaticRoutes) if (!fs.existsSync(routeToFile(route))) missing.push(route);
for (const camera of publishedCameras) {
  const route = `/live/${camera.cameraId}/`;
  if (!fs.existsSync(routeToFile(route))) missing.push(route);
}
for (const city of cityMap) {
  if (!publishedCameras.some(c => city.match.includes(c.city))) continue;
  const route = `/explore/hokkaido/${city.slug}/`;
  if (!fs.existsSync(routeToFile(route))) missing.push(route);
}
if (missing.length) {
  console.error('Missing generated routes:');
  for (const route of missing) console.error(`- ${route}`);
  process.exit(1);
}

const unexpectedlyPublished = cameras.filter(c => !isPublished(c) && fs.existsSync(routeToFile(`/live/${c.cameraId}/`)));
if (unexpectedlyPublished.length) {
  console.error('Non-live WINDOW routes must not be generated:');
  for (const camera of unexpectedlyPublished) console.error(`- /live/${camera.cameraId}/ (${camera.status})`);
  process.exit(1);
}

const htmlFiles = [];
const walk = dir => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
  }
};
walk(root);

const broken = [];
const legacyExploreLinks = [];
const hrefPattern = /<a\b[^>]*\bhref=["']([^"'#?]+)["']/gi;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = hrefPattern.exec(html))) {
    const href = match[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    if (href.includes('${') || href.includes('{') || href.includes('}')) continue;
    if (href === '/explore/') legacyExploreLinks.push(path.relative(root, file));
    const target = routeToFile(href);
    if (!fs.existsSync(target)) broken.push(`${path.relative(root, file)} -> ${href}`);
  }
}

if (broken.length) {
  console.error('Broken internal navigation links detected:');
  for (const item of [...new Set(broken)]) console.error(`- ${item}`);
  process.exit(1);
}
if (legacyExploreLinks.length) {
  console.error('Legacy /explore/ navigation links detected. EXPLORE must point to /.');
  for (const item of [...new Set(legacyExploreLinks)]) console.error(`- ${item}`);
  process.exit(1);
}

const registeredCities = cityMap.filter(city => publishedCameras.some(c => city.match.includes(c.city))).length;
console.log(`Route integrity OK: ${publishedCameras.length} verified LIVE WINDOW routes, ${registeredCities} published city routes, static routes, and internal navigation links verified.`);
