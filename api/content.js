import { ghHeaders } from './_utils.js';

const OWNER   = 'hesamsheikh';
const REPO    = 'awesome-openclaw-usecases';
const FILE_RE = /^[a-zA-Z0-9\-_.]+\.md$/;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  const { file } = req.query;

  if (!file || !FILE_RE.test(file)) {
    return res.status(400).json({ error: 'Invalid file parameter.' });
  }

  try {
    const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/usecases/${file}`;
    const upstream = await fetch(url, { headers: ghHeaders() });

    if (upstream.status === 404) return res.status(404).json({ error: 'File not found.' });
    if (!upstream.ok) throw new Error(`GitHub raw: HTTP ${upstream.status}`);

    const content = await upstream.text();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(content);

  } catch (err) {
    console.error('[/api/content]', err);
    return res.status(503).json({ error: 'Failed to fetch content. Please try again later.' });
  }
}
