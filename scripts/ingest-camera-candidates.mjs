import fs from 'node:fs';

const camerasPath = 'src/data/cameras.json';
const candidatesPath = 'src/data/camera-candidates.json';
const cameras = JSON.parse(fs.readFileSync(camerasPath, 'utf8'));
const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
const existing = new Set(cameras.map(c => c.cameraId));
const additions = candidates.filter(c => !existing.has(c.cameraId));
if (!additions.length) {
  console.log('No new camera candidates to ingest.');
  process.exit(0);
}
fs.writeFileSync(camerasPath, JSON.stringify([...cameras, ...additions], null, 2) + '\n');
console.log(`Ingested ${additions.length} camera candidate(s): ${additions.map(c => c.cameraId).join(', ')}`);
