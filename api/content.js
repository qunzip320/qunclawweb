import { ghHeaders } from './_utils.js';
import Anthropic from '@anthropic-ai/sdk';

const OWNER   = 'hesamsheikh';
const REPO    = 'awesome-openclaw-usecases';
const FILE_RE = /^[a-zA-Z0-9\-_.]+\.md$/;

async function translateMarkdown(markdown) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `将以下 Markdown 文档翻译成中文。要求：
1. 保留所有 Markdown 格式（标题、列表、代码块、链接等）不变
2. 代码块内的代码不翻译，只翻译代码块外的说明文字
3. 保留所有 URL 和代码不变
4. 直接输出翻译后的 Markdown，不要添加任何说明

${markdown}`,
    }],
  });
  return message.content[0].type === 'text' ? message.content[0].text : markdown;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  const { file, lang } = req.query;

  if (!file || !FILE_RE.test(file)) {
    return res.status(400).json({ error: 'Invalid file parameter.' });
  }

  try {
    const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/usecases/${file}`;
    const upstream = await fetch(url, { headers: ghHeaders() });

    if (upstream.status === 404) return res.status(404).json({ error: 'File not found.' });
    if (!upstream.ok) throw new Error(`GitHub raw: HTTP ${upstream.status}`);

    let content = await upstream.text();

    if (lang === 'zh' && process.env.ANTHROPIC_API_KEY) {
      try {
        content = await translateMarkdown(content);
      } catch (transErr) {
        console.error('[/api/content] translation failed, returning original:', transErr);
        // fallback to original English content
      }
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(content);

  } catch (err) {
    console.error('[/api/content]', err);
    return res.status(503).json({ error: 'Failed to fetch content. Please try again later.' });
  }
}
