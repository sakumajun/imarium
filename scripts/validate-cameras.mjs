import fs from 'node:fs/promises';

const cameras = JSON.parse(await fs.readFile(new URL('../src/data/cameras.json', import.meta.url), 'utf8'));
const ids = new Set();
const videoIds = new Map();
const allowedStatuses = new Set(['live', 'review', 'pending', 'disabled']);
let failed = false;
let live = 0;
let review = 0;
let hidden = 0;

for (const c of cameras) {
  const label = c.cameraId ?? '(unknown)';
  const required = ['cameraId','name','region','prefecture','city','channelId','videoId','status'];
  for (const key of required) {
    if (!c[key]) {
      console.error(`${label}: missing ${key}`);
      failed = true;
    }
  }

  if (ids.has(c.cameraId)) {
    console.error(`${label}: duplicate cameraId`);
    failed = true;
  }
  ids.add(c.cameraId);

  if (!allowedStatuses.has(c.status)) {
    console.error(`${label}: unsupported status "${c.status}"`);
    failed = true;
  }

  if (c.videoId) {
    const previous = videoIds.get(c.videoId);
    if (previous) {
      console.error(`${label}: duplicate videoId ${c.videoId} (already used by ${previous})`);
      failed = true;
    } else {
      videoIds.set(c.videoId, label);
    }
  }

  if (c.status === 'live') {
    live++;
    if (c.embedEnabled !== true) {
      console.error(`${label}: live camera must have embedEnabled=true`);
      failed = true;
    }
    if (!c.channelId?.startsWith('UC')) {
      console.error(`${label}: live camera must have a verified YouTube channelId`);
      failed = true;
    }
    if (c.healthReason) {
      console.error(`${label}: live camera must not have healthReason (${c.healthReason})`);
      failed = true;
    }
    if (c.verification?.channelIdStatus !== 'verified') {
      console.error(`${label}: live camera must have verification.channelIdStatus=verified`);
      failed = true;
    }
  } else if (c.status === 'review' || c.status === 'pending') {
    review++;
    if (!c.healthReason && c.status === 'review') {
      console.warn(`${label}: review camera has no healthReason`);
    }
  } else {
    hidden++;
  }
}

if (failed) process.exit(1);
console.log(`Validated ${cameras.length} camera(s): ${live} live, ${review} review/pending, ${hidden} disabled.`);
