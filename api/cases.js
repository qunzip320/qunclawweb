import { concurrentMap, ghHeaders, parseFrontMatter, deriveCategory } from './_utils.js';
import { TRANSLATIONS } from './_translations.js';

const OWNER = 'hesamsheikh';
const REPO  = 'awesome-openclaw-usecases';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  try {
    // Fetch file tree via GitHub Tree API
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

    // Fetch + parse each file with concurrency limit
    const cases = (await concurrentMap(mdFiles, async item => {
      const filename  = item.path.replace('usecases/', '');
      const rawUrl    = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${item.path}`;
      const rawRes    = await fetch(rawUrl, { headers: ghHeaders() });
      if (!rawRes.ok) throw new Error(`HTTP ${rawRes.status}: ${rawUrl}`);
      const raw       = await rawRes.text();
      const { data }  = parseFrontMatter(raw);

      const titleEn = data.title_en  || data.titleEn  || data.title || filename.replace(/[-_]/g, ' ').replace('.md', '');
      const titleZh = data.title_zh  || data.titleZh  || TRANSLATIONS[filename]?.titleZh || titleEn;
      const descEn  = data.description_en || data.descriptionEn || data.description || '';
      const descZh  = data.description_zh || data.descriptionZh || TRANSLATIONS[filename]?.descZh || descEn;

      return {
        filename,
        category: data.category || deriveCategory(filename, titleEn),
        titleZh, titleEn, descZh, descEn,
        githubUrl: `https://github.com/${OWNER}/${REPO}/blob/main/usecases/${filename}`,
        sha: item.sha,
      };
    }, 8)).filter(Boolean);

    return res.status(200).json({
      version:   tree.sha,
      updatedAt: new Date().toISOString(),
      cases,
    });

  } catch (err) {
    console.error('[/api/cases]', err);
    return res.status(503).json({ error: 'Failed to fetch cases. Please try again later.' });
  }
}
