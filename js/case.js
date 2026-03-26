/* ============================================================
   case.js — 详情页
   DOMPurify 强制净化 | highlight.js | 延迟 TOC | 页面动画
   ============================================================ */

'use strict';

const LANG_KEY = 'qunclawweb-lang';
const SESSION_KEY = 'qunclawweb-cases';

let lang = localStorage.getItem(LANG_KEY) || 'zh';

// ── i18n ─────────────────────────────────────────────────────────────────
function applyLang() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-zh]').forEach(el => {
    el.textContent = el.dataset[lang] ?? el.dataset.zh;
  });
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = lang === 'zh' ? 'EN' : '中';
}

function toggleLang() {
  lang = lang === 'zh' ? 'en' : 'zh';
  localStorage.setItem(LANG_KEY, lang);
  applyLang();
}

// ── UX 参数校验（仅前端 UX 层，安全校验在服务端） ─────────────────────────
function getFileParam() {
  const params = new URLSearchParams(window.location.search);
  const file = params.get('file') || '';
  if (!file || !/^[a-zA-Z0-9\-_.]+\.md$/.test(file)) return null;
  return file;
}

// ── 面包屑 ────────────────────────────────────────────────────────────────
function setCrumb(caseInfo) {
  const crumb = document.getElementById('breadcrumb');
  if (!crumb) return;

  const catSlug = caseInfo?.category || '';
  const catName = catSlug
    ? (lang === 'zh'
        ? (window.categoryMap?.[catSlug]?.zh || catSlug)
        : (window.categoryMap?.[catSlug]?.en || catSlug))
    : '';
  const title = lang === 'zh'
    ? (caseInfo?.titleZh || caseInfo?.titleEn || '')
    : (caseInfo?.titleEn || caseInfo?.titleZh || '');

  crumb.innerHTML = `
    <a href="/" data-zh="首页" data-en="Home">${lang === 'zh' ? '首页' : 'Home'}</a>
    ${catName ? `<span class="crumb-sep">›</span><span>${catName}</span>` : ''}
    ${title ? `<span class="crumb-sep">›</span><span class="crumb-current">${title}</span>` : ''}
  `;
}

// ── 双语结构化信息区 ──────────────────────────────────────────────────────
function renderCaseMeta(caseInfo) {
  const el = document.getElementById('case-meta-section');
  if (!el || !caseInfo) return;

  const row = (labelZh, labelEn, zh, en) => (zh || en) ? `
    <div class="case-meta-block">
      <div class="case-meta-row">
        <span class="case-meta-label">${labelZh}</span>
        <span>${zh || ''}</span>
      </div>
      <div class="case-meta-row case-meta-row-en">
        <span class="case-meta-label">${labelEn}</span>
        <span>${en || ''}</span>
      </div>
    </div>` : '';

  el.innerHTML = `
    <div class="case-meta-names">
      <span class="case-meta-zh">${caseInfo.titleZh || ''}</span>
      <span class="case-meta-sep"> / </span>
      <span class="case-meta-en">${caseInfo.titleEn || ''}</span>
    </div>
    ${row('功能说明', 'Description', caseInfo.descZh, caseInfo.descEn)}
    ${row('所需技能', 'Skills', caseInfo.skillsZh, caseInfo.skillsEn)}
    ${row('使用方法', 'How to Use', caseInfo.usageZh, caseInfo.usageEn)}
  `;
  el.style.display = 'block';
}

// ── TOC 生成（延迟执行） ──────────────────────────────────────────────────
function generateTOC() {
  const content = document.getElementById('markdown-content');
  const toc     = document.getElementById('toc');
  if (!content || !toc) return;

  const headings = content.querySelectorAll('h1, h2, h3');
  if (headings.length < 2) {
    toc.closest('.toc-panel')?.remove();
    return;
  }

  let html = '<nav aria-label="目录"><ul>';
  headings.forEach((h, i) => {
    const id = `heading-${i}`;
    h.id = id;
    const level = parseInt(h.tagName[1]);
    const indent = level - 1;
    html += `<li class="toc-item toc-level-${indent}">
      <a href="#${id}">${h.textContent}</a>
    </li>`;
  });
  html += '</ul></nav>';
  toc.innerHTML = html;

  // 滚动高亮当前节
  const tocLinks = toc.querySelectorAll('a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(a => a.classList.remove('active'));
        const active = toc.querySelector(`a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-10% 0px -80% 0px' });

  headings.forEach(h => observer.observe(h));
}

function deferTOC() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(generateTOC, { timeout: 500 });
  } else {
    setTimeout(generateTOC, 200);
  }
}

// ── highlight.js：仅作用于 code block ─────────────────────────────────────
function highlightCodeBlocks() {
  if (!window.hljs) return;
  document.querySelectorAll('#markdown-content pre code').forEach(block => {
    hljs.highlightElement(block);
  });
}

// ── markdown 渲染（marked + DOMPurify 强制净化） ──────────────────────────
function renderMarkdown(raw) {
  const content = document.getElementById('markdown-content');
  if (!content) return;

  if (!window.marked || !window.DOMPurify) {
    content.textContent = raw;
    return;
  }

  // marked 配置
  marked.setOptions({
    gfm: true,
    breaks: false,
    mangle: false,
    headerIds: false, // 由 generateTOC 自己打 id，避免冲突
  });

  const dirty = marked.parse(raw);

  // DOMPurify 强制净化：只允许安全的标签和属性
  const clean = DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  });

  content.innerHTML = clean;
  highlightCodeBlocks();
  deferTOC();
}

// ── 查找 sessionStorage 中的案例元数据 ────────────────────────────────────
function getCaseInfoFromSession(filename) {
  // 优先查 API 缓存
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const { cases } = JSON.parse(raw);
      const found = cases?.find(c => c.filename === filename);
      if (found) return found;
    }
  } catch {}
  // 回退查 demo 案例（由 main.js 存入 localStorage）
  try {
    const demoRaw = localStorage.getItem('qunclawweb-demo-cases');
    if (demoRaw) {
      const demos = JSON.parse(demoRaw);
      return demos?.find(c => c.filename === filename) || null;
    }
  } catch {}
  return null;
}

// ── 加载内容 ──────────────────────────────────────────────────────────────
async function loadContent() {
  const file = getFileParam();

  if (!file) {
    document.body.innerHTML = `
      <div class="error-page">
        <h1>404</h1>
        <p>${lang === 'zh' ? '无效的案例链接。' : 'Invalid case link.'}</p>
        <a href="/">${lang === 'zh' ? '返回首页' : 'Back to Home'}</a>
      </div>`;
    return;
  }

  // 元数据（面包屑 / 标题）
  const caseInfo = getCaseInfoFromSession(file);
  setCrumb(caseInfo);

  // 页面标题（双语）
  if (caseInfo) {
    document.title = `${caseInfo.titleZh} / ${caseInfo.titleEn} — Claw`;
    const pageTitle = document.getElementById('case-title');
    if (pageTitle) {
      pageTitle.innerHTML = `${caseInfo.titleZh || ''}<span class="case-title-en"> / ${caseInfo.titleEn || ''}</span>`;
    }
  }

  // 双语结构化信息区
  renderCaseMeta(caseInfo);

  // GitHub 链接
  const ghLink = document.getElementById('github-link');
  if (ghLink && caseInfo?.githubUrl) {
    ghLink.href = caseInfo.githubUrl;
    ghLink.style.display = 'inline-flex';
  }

  // 显示加载态
  const content = document.getElementById('markdown-content');
  if (content) {
    content.innerHTML = `
      <div class="sk-prose">
        ${Array.from({ length: 6 }, () => '<div class="sk-line"></div>').join('')}
      </div>`;
  }

  // demo 案例：有 sourceFile 的拉真实内容翻译，否则用元数据生成正文
  if (file.startsWith('demo-')) {
    const ghLink = document.getElementById('github-link');
    if (ghLink && caseInfo?.githubUrl) {
      ghLink.href = caseInfo.githubUrl;
      ghLink.style.display = 'inline-flex';
    }

    if (caseInfo?.sourceFile) {
      // 拉真实 GitHub 文件并翻译
      try {
        const cacheKey = `qunclawweb-md-${lang}-${caseInfo.sourceFile}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) { renderMarkdown(cached); return; }

        const apiUrl = lang === 'zh'
          ? `/api/content?file=${encodeURIComponent(caseInfo.sourceFile)}&lang=zh`
          : `/api/content?file=${encodeURIComponent(caseInfo.sourceFile)}`;
        const r = await fetch(apiUrl);
        if (!r.ok) throw new Error(`API ${r.status}`);
        const markdown = await r.text();
        try { sessionStorage.setItem(cacheKey, markdown); } catch {}
        renderMarkdown(markdown);
      } catch (err) {
        console.error('[demo sourceFile]', err);
        if (content) content.innerHTML = `<p class="error-msg">${lang === 'zh' ? '内容加载失败，请刷新重试。' : 'Failed to load content.'}</p>`;
      }
      return;
    }

    // 无 sourceFile：从元数据字段生成正文
    if (content && caseInfo) {
      const isZh = lang === 'zh';
      const pick = (zh, en) => isZh ? (zh || en || '') : (en || zh || '');
      const desc     = pick(caseInfo.descZh,     caseInfo.descEn);
      const features = pick(caseInfo.featuresZh,  caseInfo.featuresEn);
      const skills   = pick(caseInfo.skillsZh,    caseInfo.skillsEn);
      const usage    = pick(caseInfo.usageZh,     caseInfo.usageEn);
      const tips     = pick(caseInfo.tipsZh,      caseInfo.tipsEn);
      const h2 = (zh, en) => `## ${isZh ? zh : en}`;
      const parts = [desc];
      if (features) parts.push(h2('你可以做的事情', 'What You Can Do'), features);
      if (skills)   parts.push(h2('你需要的技能',   'Skills You Need'), skills);
      if (usage)    parts.push(h2('如何设置',       'How to Set Up'),   usage);
      if (tips)     parts.push(h2('提示',           'Tips'),            tips);
      renderMarkdown(parts.join('\n\n'));
    } else if (content) {
      content.innerHTML = '';
    }
    return;
  }

  try {
    // 中文模式：请求翻译版本，用 sessionStorage 按语言分别缓存
    const cacheKey = `qunclawweb-md-${lang}-${file}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      renderMarkdown(cached);
      return;
    }

    const apiUrl = lang === 'zh'
      ? `/api/content?file=${encodeURIComponent(file)}&lang=zh`
      : `/api/content?file=${encodeURIComponent(file)}`;

    const res = await fetch(apiUrl);

    if (res.status === 403 || res.status === 404) {
      window.location.href = '/404.html';
      return;
    }
    if (!res.ok) throw new Error(`API ${res.status}`);

    const markdown = await res.text();
    try { sessionStorage.setItem(cacheKey, markdown); } catch {}
    renderMarkdown(markdown);

  } catch (err) {
    console.error('[loadContent]', err);
    if (content) {
      content.innerHTML = `<p class="error-msg">
        ${lang === 'zh' ? '内容加载失败，请刷新重试。' : 'Failed to load content. Please refresh.'}
      </p>`;
    }
  }
}

// ── 页面入场动画 ──────────────────────────────────────────────────────────
function pageEnter() {
  document.body.classList.add('page-enter');
  document.body.addEventListener('animationend', () => {
    document.body.classList.remove('page-enter');
  }, { once: true });
}

// ── 导航栏滚动 ────────────────────────────────────────────────────────────
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

// ── 返回首页：带出场动画 ──────────────────────────────────────────────────
function initBackLink() {
  const back = document.getElementById('back-link');
  if (!back) return;
  back.addEventListener('click', e => {
    e.preventDefault();
    document.body.classList.add('page-exit');
    setTimeout(() => { window.location.href = '/'; }, 220);
  });
}

// ── 入口 ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyLang();
  document.getElementById('lang-toggle')?.addEventListener('click', toggleLang);
  initNavScroll();
  initBackLink();
  pageEnter();
  loadContent();
});
