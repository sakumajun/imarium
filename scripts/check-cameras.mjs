import fs from 'node:fs/promises';

const file = new URL('../src/data/cameras.json', import.meta.url);
const cameras = JSON.parse(await fs.readFile(file, 'utf8'));
const apiKey = process.env.YOUTUBE_API_KEY;
if (!apiKey) {
  console.error('WINDOW HEALTH: YOUTUBE_API_KEY is required.');
  process.exit(1);
}

const now = new Date().toISOString();
const ids = cameras.map(c => c.videoId).filter(Boolean);
const videoState = new Map();

for (let i = 0; i < ids.length; i += 50) {
  const batch = ids.slice(i, i + 50);
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'snippet,liveStreamingDetails,status');
  url.searchParams.set('id', batch.join(','));
  url.searchParams.set('key', apiKey);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube videos API failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  for (const item of data.items ?? []) videoState.set(item.id, item);
}

let unhealthy = 0;
for (const camera of cameras) {
  const item = videoState.get(camera.videoId);
  camera.lastCheckedAt = now;
  if (!item) {
    camera.status = 'review';
    camera.healthReason = 'video_not_found';
    unhealthy++;
    continue;
  }
  const broadcast = item.snippet?.liveBroadcastContent;
  const embeddable = item.status?.embeddable !== false;
  if (broadcast === 'live' && embeddable) {
    camera.status = 'live';
    camera.healthReason = null;
  } else {
    camera.status = 'review';
    camera.healthReason = !embeddable ? 'embedding_disabled' : `broadcast_${broadcast ?? 'unknown'}`;
    unhealthy++;
  }
}

await fs.writeFile(file, JSON.stringify(cameras, null, 2) + '\n');
console.log(`WINDOW HEALTH: checked ${cameras.length}; ${unhealthy} require review.`);
