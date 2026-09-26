import fs from 'node:fs/promises';

const file = new URL('../src/data/cameras.json', import.meta.url);
const historyFile = new URL('../src/data/camera-history.json', import.meta.url);
const cameras = JSON.parse(await fs.readFile(file, 'utf8'));
let history = [];
try { history = JSON.parse(await fs.readFile(historyFile, 'utf8')); } catch {}
const apiKey = process.env.YOUTUBE_API_KEY;
if (!apiKey) throw new Error('WINDOW HEALTH: YOUTUBE_API_KEY is required.');
const now = new Date().toISOString();

async function youtube(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [k,v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  url.searchParams.set('key', apiKey);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube ${endpoint} API failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function getVideo(videoId) {
  const data = await youtube('videos', { part:'snippet,liveStreamingDetails,status', id:videoId });
  return data.items?.[0] ?? null;
}

function tokens(camera) {
  return [...new Set([camera.city, camera.area, camera.name, ...(camera.matchKeywords ?? [])]
    .filter(Boolean).flatMap(v => String(v).toLowerCase().split(/[\s・/／＠@_-]+/)).filter(v => v.length >= 2))];
}

function scoreCandidate(camera, item, expectedChannelId) {
  const text = `${item.snippet?.title ?? ''} ${item.snippet?.description ?? ''}`.toLowerCase();
  const keys = tokens(camera);
  const hits = keys.filter(k => text.includes(k));
  let score = Math.min(60, hits.length * 20);
  if (expectedChannelId && item.snippet?.channelId === expectedChannelId) score += 30;
  if (item.snippet?.liveBroadcastContent === 'live') score += 10;
  return { score, hits };
}

async function discoverSuccessor(camera, channelId) {
  if (!channelId) return null;
  const data = await youtube('search', {
    part:'snippet', channelId, eventType:'live', type:'video', order:'date', maxResults:10
  });
  const ranked = (data.items ?? []).map(item => ({ item, ...scoreCandidate(camera,item,channelId) }))
    .sort((a,b) => b.score-a.score);
  const best = ranked[0];
  if (!best || best.score < 70) return null;
  const id = best.item.id?.videoId;
  if (!id || id === camera.videoId) return null;
  const video = await getVideo(id);
  if (!video || video.snippet?.liveBroadcastContent !== 'live' || video.status?.embeddable === false) return null;
  return { video, score:best.score, hits:best.hits };
}

let unhealthy = 0, replaced = 0;
for (const camera of cameras) {
  const item = await getVideo(camera.videoId);
  camera.lastCheckedAt = now;

  if (item?.snippet?.channelId) {
    camera.channelId = item.snippet.channelId;
    camera.channelName = item.snippet.channelTitle ?? camera.channelName;
    camera.verification ??= {};
    camera.verification.channelIdStatus = 'verified';
    camera.verification.method = 'youtube-data-api';
  }

  const broadcast = item?.snippet?.liveBroadcastContent;
  const embeddable = item?.status?.embeddable !== false;
  if (item && broadcast === 'live' && embeddable) {
    camera.status = 'live';
    camera.healthReason = null;
    continue;
  }

  const reason = !item ? 'video_not_found' : !embeddable ? 'embedding_disabled' : `broadcast_${broadcast ?? 'unknown'}`;
  const successor = await discoverSuccessor(camera, item?.snippet?.channelId || (camera.channelId?.startsWith('UC') ? camera.channelId : null));
  if (successor) {
    const oldVideoId = camera.videoId;
    camera.videoId = successor.video.id;
    camera.status = 'live';
    camera.healthReason = null;
    camera.lastReplacedAt = now;
    history.push({ cameraId:camera.cameraId, changedAt:now, fromVideoId:oldVideoId, toVideoId:camera.videoId, reason, confidence:successor.score, matchedKeywords:successor.hits, channelId:camera.channelId });
    console.log(`${camera.cameraId}: successor ${oldVideoId} -> ${camera.videoId} (${successor.score})`);
    replaced++;
  } else {
    camera.status = 'review';
    camera.healthReason = reason;
    unhealthy++;
  }
}

await fs.writeFile(file, JSON.stringify(cameras, null, 2) + '\n');
await fs.writeFile(historyFile, JSON.stringify(history.slice(-500), null, 2) + '\n');
console.log(`WINDOW HEALTH: checked ${cameras.length}; replaced ${replaced}; ${unhealthy} require review.`);
