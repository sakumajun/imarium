import fs from 'node:fs/promises';

// WINDOW HEALTH SYSTEM foundation.
// Live YouTube checks are enabled after YOUTUBE_API_KEY is configured.
const file = new URL('../src/data/cameras.json', import.meta.url);
const cameras = JSON.parse(await fs.readFile(file, 'utf8'));

if (!process.env.YOUTUBE_API_KEY) {
  console.log(`WINDOW HEALTH: ${cameras.length} camera(s) registered. YOUTUBE_API_KEY is not configured; live checks skipped.`);
  process.exit(0);
}

console.log(`WINDOW HEALTH: ready to check ${cameras.length} camera(s).`);
