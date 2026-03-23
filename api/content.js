import { kv } from '@vercel/kv';

const OWNER = 'hesamsheikh';
const REPO = 'awesome-openclaw-usecases';
const CACHE_KEY_PREFIX = 'content-';
const CASES_CACHE_KEY = 'cases-list';
const CACHE_TTL = 3600;
const FILE_RE = /^[a-zA-Z0-9\-_.]+\.md$/;

// ── rate limiter ────────────────────────────────────────────────────────────
async function checkRateLimit(ip) {
  const window = Math.floor(Date.now() / 60000);
  const key = `rl:${ip}:${window}`;
  try {
    const count = await kv.incr(key);
    if (count === 1) await kv.expire(key, 60);
    return count <= 30;
  } catch {
    return true;
  }
}

// ── whitelist check against KV cases-list ──────────────────────────────────
async function isWhitelisted(filename) {
  try {
    const cached = await kv.get(CASES_CACHE_KEY);
    if (!cached?.cases) return false;
    return cached.cases.some(c => c.filename === filename);
  } catch {
    // KV unavailable: fall back to format-only check (fail open)
    return FILE_RE.test(filename);
  }
}

// ── main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress
    || 'unknown';

  if (!(await checkRateLimit(ip))) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please try again.' });
  }

  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  const { file } = req.query;

  // ── format validation ───────────────────────────────────────────────────
  if (!file || !FILE_RE.test(file)) {
    return res.status(400).json({ error: 'Invalid file parameter.' });
  }

  // ── whitelist validation (security gate) ───────────────────────────────
  if (!(await isWhitelisted(file))) {
    return res.status(403).json({ error: 'File not permitted.' });
  }

  const cacheKey = `${CACHE_KEY_PREFIX}${file}`;

  try {
    // ── cache hit ───────────────────────────────────────────────────────────
    const cached = await kv.get(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).send(cached);
    }

    // ── fetch from GitHub raw ───────────────────────────────────────────────
    const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/usecases/${file}`;
    const headers = { Accept: 'text/plain' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;

    const upstream = await fetch(url, { headers });

    if (upstream.status === 404) {
      return res.status(404).json({ error: 'File not found.' });
    }
    if (!upstream.ok) {
      throw new Error(`GitHub raw: HTTP ${upstream.status}`);
    }

    const content = await upstream.text();

    // ── store in KV ─────────────────────────────────────────────────────────
    await kv.set(cacheKey, content, { ex: CACHE_TTL });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).send(content);

  } catch (err) {
    console.error('[/api/content]', err);
    return res.status(503).json({ error: 'Failed to fetch content. Please try again later.' });
  }
}
