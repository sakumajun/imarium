import fs from 'node:fs/promises';

const cameras = JSON.parse(await fs.readFile(new URL('../src/data/cameras.json', import.meta.url), 'utf8'));
const ids = new Set();
let failed = false;
for (const c of cameras) {
  const required = ['cameraId','name','region','prefecture','city','channelId','videoId','status'];
  for (const key of required) if (!c[key]) { console.error(`${c.cameraId ?? '(unknown)'}: missing ${key}`); failed = true; }
  if (ids.has(c.cameraId)) { console.error(`${c.cameraId}: duplicate cameraId`); failed = true; }
  ids.add(c.cameraId);
}
if (failed) process.exit(1);
console.log(`Validated ${cameras.length} camera(s).`);
