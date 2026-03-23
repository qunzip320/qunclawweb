import { kv } from '@vercel/kv';

const OWNER = 'hesamsheikh';
const REPO = 'awesome-openclaw-usecases';
const CACHE_KEY = 'cases-list';
const CACHE_TTL = 3600;
const CONCURRENCY = 8;

// ── front-matter parser ─────────────────────────────────────────────────────
function parseFrontMatter(raw) {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const data = {};

  if (fmMatch) {
    for (const line of fmMatch[1].split('\n')) {
      const colon = line.indexOf(':');
      if (colon === -1) continue;
      const key = line.slice(0, colon).trim();
      let val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
      if (key) data[key] = val;
    }
    return { data, body: raw.slice(fmMatch[0].length) };
  }

  // No front-matter: extract title from first # heading
  const titleMatch = raw.match(/^#\s+(.+)/m);
  if (titleMatch) data.title = titleMatch[1].trim();

  // Extract first non-heading paragraph as description
  const lines = raw.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  if (lines.length) data.description = lines[0].trim().replace(/[*_`]/g, '');

  return { data, body: raw };
}

// ── category derivation ─────────────────────────────────────────────────────
const FILE_CATEGORY_HINTS = [
  [/(social|twitter|instagram|tiktok|linkedin|reddit|facebook)/i, 'social-media'],
  [/(creative|art|music|game|build|design|generat)/i, 'creative-building'],
  [/(infra|devops|docker|k8s|kubernetes|ci|cd|deploy|terraform|ansible|linux)/i, 'infrastructure-devops'],
  [/(product|task|note|calendar|email|workflow|automat)/i, 'productivity'],
  [/(research|learn|study|paper|educat|science|analys)/i, 'research-learning'],
  [/(financ|trade|stock|crypto|invest|market|portfolio)/i, 'finance-trading'],
];

function deriveCategory(filename, title = '') {
  const text = `${filename} ${title}`.toLowerCase();
  for (const [regex, cat] of FILE_CATEGORY_HINTS) {
    if (regex.test(text)) return cat;
  }
  return 'productivity'; // safe default
}

// ── rate limiter ────────────────────────────────────────────────────────────
async function checkRateLimit(ip) {
  const window = Math.floor(Date.now() / 60000);
  const key = `rl:${ip}:${window}`;
  try {
    const count = await kv.incr(key);
    if (count === 1) await kv.expire(key, 60);
    return count <= 30;
  } catch {
    return true; // fail open if KV is unavailable
  }
}

// ── concurrent map ──────────────────────────────────────────────────────────
async function concurrentMap(items, fn, limit = CONCURRENCY) {
  const results = new Array(items.length).fill(null);
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      try {
        results[i] = await fn(items[i], i);
      } catch (err) {
        console.error(`concurrentMap task ${i} failed:`, err.message);
        results[i] = null;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// ── GitHub helpers ──────────────────────────────────────────────────────────
function ghHeaders() {
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: ghHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
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

  try {
    // ── cache hit ───────────────────────────────────────────────────────────
    const cached = await kv.get(CACHE_KEY);
    if (cached) {
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }

    // ── fetch file tree via GitHub Tree API ─────────────────────────────────
    const treeRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/main?recursive=1`,
      { headers: ghHeaders() }
    );
    if (!treeRes.ok) throw new Error(`GitHub Tree API: HTTP ${treeRes.status}`);
    const tree = await treeRes.json();

    const mdFiles = (tree.tree || []).filter(
      item => item.type === 'blob'
        && item.path.startsWith('usecases/')
        && item.path.endsWith('.md')
    );

    // ── fetch + parse each file ─────────────────────────────────────────────
    const cases = (await concurrentMap(mdFiles, async item => {
      const filename = item.path.replace('usecases/', '');
      const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${item.path}`;
      const raw = await fetchText(rawUrl);
      const { data } = parseFrontMatter(raw);

      const titleEn = data.title_en || data.titleEn || data.title || filename.replace(/[-_]/g, ' ').replace('.md', '');
      const titleZh = data.title_zh || data.titleZh || titleEn;
      const descEn  = data.description_en || data.descriptionEn || data.description || '';
      const descZh  = data.description_zh || data.descriptionZh || descEn;
      const category = data.category || deriveCategory(filename, titleEn);

      return {
        filename,
        category,
        titleZh,
        titleEn,
        descZh,
        descEn,
        githubUrl: `https://github.com/${OWNER}/${REPO}/blob/main/usecases/${filename}`,
        sha: item.sha,
      };
    })).filter(Boolean);

    // ── store in KV ─────────────────────────────────────────────────────────
    const payload = {
      version: tree.sha,
      updatedAt: new Date().toISOString(),
      cases,
    };
    await kv.set(CACHE_KEY, payload, { ex: CACHE_TTL });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(payload);

  } catch (err) {
    console.error('[/api/cases]', err);
    return res.status(503).json({ error: 'Failed to fetch cases. Please try again later.' });
  }
}
