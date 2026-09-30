import type { APIRoute } from 'astro';
import cameras from '../data/cameras.json';
import { information } from '../data/information';

const site = 'https://imarium.live';

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
  { slug: 'kushiro', match: ['釧路市'] },
];

const published = cameras.filter(
  (camera) => camera.status === 'live' && camera.embedEnabled === true,
);

const staticPaths = [
  '/',
  '/explore/',
  '/explore/hokkaido/',
  '/favorites/',
  '/multiview/',
  '/about/',
  '/operator/',
  '/contact/',
  '/privacy/',
  '/terms/',
  '/information/',
];

const cityPaths = cityMap
  .filter((city) => published.some((camera) => city.match.includes(camera.city)))
  .map((city) => `/explore/hokkaido/${city.slug}/`);

const livePaths = published.map((camera) => `/live/${camera.cameraId}/`);
const informationPaths = information.map((item) => `/information/${item.slug}/`);

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const GET: APIRoute = () => {
  const paths = [...new Set([...staticPaths, ...cityPaths, ...livePaths, ...informationPaths])];
  const urls = paths
    .map((path) => `  <url><loc>${escapeXml(new URL(path, site).href)}</loc></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
