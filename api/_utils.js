// ── GitHub 请求头 ───────────────────────────────────────────────────────────
export function ghHeaders() {
  const h = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) h.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  return h;
}

// ── Front-matter 解析 ────────────────────────────────────────────────────────
export function parseFrontMatter(raw) {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const data = {};

  if (fmMatch) {
    for (const line of fmMatch[1].split('\n')) {
      const colon = line.indexOf(':');
      if (colon === -1) continue;
      const key = line.slice(0, colon).trim();
      const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
      if (key) data[key] = val;
    }
    return { data, body: raw.slice(fmMatch[0].length) };
  }

  // No front-matter: extract from content
  const titleMatch = raw.match(/^#\s+(.+)/m);
  if (titleMatch) data.title = titleMatch[1].trim();
  const lines = raw.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  if (lines.length) data.description = lines[0].trim().replace(/[*_`]/g, '');

  return { data, body: raw };
}

// ── 文件名 → 分类推导 ────────────────────────────────────────────────────────
const HINTS = [
  [/(social|twitter|instagram|tiktok|linkedin|reddit|facebook)/i, 'social-media'],
  [/(creative|art|music|game|build|design|generat)/i,             'creative-building'],
  [/(infra|devops|docker|k8s|kubernetes|ci|cd|deploy|terraform)/i,'infrastructure-devops'],
  [/(product|task|note|calendar|email|workflow|automat)/i,        'productivity'],
  [/(research|learn|study|paper|educat|science|analys)/i,         'research-learning'],
  [/(financ|trade|stock|crypto|invest|market|portfolio)/i,        'finance-trading'],
];

export function deriveCategory(filename, title = '') {
  const text = `${filename} ${title}`.toLowerCase();
  for (const [re, cat] of HINTS) if (re.test(text)) return cat;
  return 'productivity';
}

// ── 并发 Map（带上限） ────────────────────────────────────────────────────────
export async function concurrentMap(items, fn, limit = 8) {
  const results = new Array(items.length).fill(null);
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      try   { results[i] = await fn(items[i], i); }
      catch (err) { console.error(`task ${i} failed:`, err.message); }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
