/* ============================================================
   main.js — Qun-OpenClaw Use Cases
   双阶段渲染 | 动态分类 | 搜索 | 懒加载 | i18n
   ============================================================ */

'use strict';

// ── 常量 ──────────────────────────────────────────────────────────────────
const SESSION_KEY = 'qunclawweb-cases';
const LANG_KEY    = 'qunclawweb-lang';

const categoryMap = {
  'social-media':          { zh: '社交媒体',           en: 'Social Media' },
  'creative-building':     { zh: '创意与构建',          en: 'Creative & Building' },
  'infrastructure-devops': { zh: '基础设施与 DevOps',   en: 'Infrastructure & DevOps' },
  'productivity':          { zh: '生产力工具',           en: 'Productivity' },
  'research-learning':     { zh: '研究与学习',           en: 'Research & Learning' },
  'finance-trading':       { zh: '金融与交易',           en: 'Finance & Trading' },
};

// ── 示例案例（本地静态，始终展示） ────────────────────────────────────────
const DEMO_CASES = [
  {
    filename: 'demo-article-writer.md', category: 'creative-building',
    titleZh: '写文章', titleEn: 'Article Writer',
    descZh: '根据主题生成完整文章', descEn: 'Generate a full article from a topic prompt.',
    skillsZh: '提示词工程、文本生成', skillsEn: 'Prompt engineering, text generation',
    usageZh: '输入主题关键词，AI 自动生成结构完整的长文章', usageEn: 'Enter a topic keyword and the AI generates a well-structured long-form article.',
    githubUrl: '',
  },
  {
    filename: 'demo-video-script.md', category: 'creative-building',
    titleZh: '视频脚本', titleEn: 'Video Script',
    descZh: '生成短视频脚本', descEn: 'Generate short-form video scripts.',
    skillsZh: '脚本创作、文本生成', skillsEn: 'Script writing, text generation',
    usageZh: '描述视频主题，自动生成分段脚本内容', usageEn: 'Describe the video topic and get a segmented script automatically.',
    githubUrl: '',
  },
  {
    filename: 'demo-email-writer.md', category: 'productivity',
    titleZh: '邮件生成', titleEn: 'Email Generator',
    descZh: '自动写邮件回复', descEn: 'Automatically draft email replies.',
    skillsZh: '邮件写作、上下文理解', skillsEn: 'Email writing, context understanding',
    usageZh: '粘贴收到的邮件，自动生成合适的回复内容', usageEn: 'Paste a received email and get a suitable reply drafted automatically.',
    githubUrl: '',
  },
  {
    filename: 'demo-summarizer.md', category: 'productivity',
    titleZh: '总结工具', titleEn: 'Summarizer',
    descZh: '总结长文本内容', descEn: 'Summarize long documents and articles.',
    skillsZh: '文本分析、摘要提取', skillsEn: 'Text analysis, summary extraction',
    usageZh: '粘贴长文章或报告，生成简洁的要点摘要', usageEn: 'Paste a long article or report to get a concise bullet-point summary.',
    githubUrl: '',
  },
  {
    filename: 'demo-research-organizer.md', category: 'research-learning',
    titleZh: '资料整理', titleEn: 'Research Organizer',
    descZh: '整理多来源信息', descEn: 'Organize information from multiple sources.',
    skillsZh: '信息整合、结构化输出', skillsEn: 'Information synthesis, structured output',
    usageZh: '输入多个来源的内容片段，整合为有条理的研究资料', usageEn: 'Input snippets from multiple sources and get organized, structured research notes.',
    githubUrl: '',
  },
  {
    filename: 'demo-trend-analysis.md', category: 'research-learning',
    titleZh: '趋势分析', titleEn: 'Trend Analysis',
    descZh: '总结某领域趋势', descEn: 'Summarize trends in a specific domain.',
    skillsZh: '数据解读、领域分析', skillsEn: 'Data interpretation, domain analysis',
    usageZh: '描述某个行业或话题，生成当前趋势总结报告', usageEn: 'Describe an industry or topic to get a current trend summary report.',
    githubUrl: '',
  },
  {
    filename: 'demo-code-generator.md', category: 'infrastructure-devops',
    titleZh: '代码生成', titleEn: 'Code Generator',
    descZh: '根据需求生成代码', descEn: 'Generate code from natural language requirements.',
    skillsZh: '提示词工程、代码生成', skillsEn: 'Prompt engineering, code generation',
    usageZh: '用自然语言描述功能需求，自动输出可运行代码', usageEn: 'Describe a feature in natural language and get runnable code output.',
    githubUrl: '',
  },
  {
    filename: 'demo-code-explainer.md', category: 'infrastructure-devops',
    titleZh: '代码解释', titleEn: 'Code Explainer',
    descZh: '解释已有代码逻辑', descEn: 'Explain the logic of existing code.',
    skillsZh: '代码分析、自然语言解释', skillsEn: 'Code analysis, natural language explanation',
    usageZh: '粘贴代码片段，获取逐行或逻辑层面的中文解释', usageEn: 'Paste a code snippet and get a line-by-line or logic-level explanation.',
    githubUrl: '',
  },
  {
    filename: 'demo-daily-brief.md', category: 'productivity',
    titleZh: '每日简报', titleEn: 'Daily Brief',
    descZh: '自动生成信息摘要', descEn: 'Automatically generate a daily news digest.',
    skillsZh: '信息筛选、摘要生成', skillsEn: 'Information filtering, summary generation',
    usageZh: '输入订阅源或关键词，每日自动生成信息摘要推送', usageEn: 'Input RSS feeds or keywords to auto-generate a daily information digest.',
    githubUrl: '',
  },
  {
    filename: 'demo-workflow-automation.md', category: 'productivity',
    titleZh: '工作流自动化', titleEn: 'Workflow Automation',
    descZh: '自动执行任务流程', descEn: 'Automate repetitive task workflows.',
    skillsZh: '任务规划、工具调用', skillsEn: 'Task planning, tool calling',
    usageZh: '描述重复性工作流程，自动拆分并执行各步骤', usageEn: 'Describe a repetitive workflow and let the AI break it down and execute each step.',
    githubUrl: '',
  },
  {
    filename: 'demo-earnings-tracker.md', category: 'finance-trading',
    titleZh: '财报追踪助手', titleEn: 'Earnings Tracker',
    descZh: '自动追踪上市公司财报并生成分析摘要', descEn: 'Automatically track earnings reports and generate analysis summaries.',
    skillsZh: '数据抓取、财务分析、结构化输出', skillsEn: 'Data scraping, financial analysis, structured output',
    usageZh: '输入股票代码或公司名称，自动获取最新财报数据并生成关键指标分析', usageEn: 'Enter a ticker or company name to fetch the latest earnings and generate key metric analysis.',
    githubUrl: 'https://github.com/hesamsheikh/awesome-openclaw-usecases/blob/main/usecases/earnings-tracker.md',
  },
  {
    filename: 'demo-market-sentiment.md', category: 'finance-trading',
    titleZh: '市场情绪分析', titleEn: 'Market Sentiment Analyzer',
    descZh: '聚合多源资讯，量化市场情绪指数', descEn: 'Aggregate multi-source news and quantify market sentiment scores.',
    skillsZh: '新闻聚合、情感分析、趋势判断', skillsEn: 'News aggregation, sentiment analysis, trend detection',
    usageZh: '输入资产名称或板块，汇总近期新闻与社区讨论，输出情绪评分与风险提示', usageEn: 'Enter an asset or sector to aggregate recent news and community posts into a sentiment score with risk signals.',
    githubUrl: 'https://github.com/hesamsheikh/awesome-openclaw-usecases/blob/main/usecases/polymarket-autopilot.md',
  },
];
// 让 case.js 也能查到 demo 案例的元数据
localStorage.setItem('qunclawweb-demo-cases', JSON.stringify(DEMO_CASES));

// ── 状态 ──────────────────────────────────────────────────────────────────
let lang            = localStorage.getItem(LANG_KEY) || 'zh';
let activeCategory  = 'all';
let searchQuery     = '';
let allCases        = [];
let cardObserver    = null;

// ── DOM 引用（延迟初始化） ────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── i18n ─────────────────────────────────────────────────────────────────
function applyLang() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-zh]').forEach(el => {
    el.textContent = el.dataset[lang] ?? el.dataset.zh;
  });
  const btn = $('lang-toggle');
  if (btn) btn.textContent = lang === 'zh' ? 'EN' : '中';
}

function toggleLang() {
  lang = lang === 'zh' ? 'en' : 'zh';
  localStorage.setItem(LANG_KEY, lang);
  applyLang();
  renderCards(filterCases());
}

// ── 分类 label ────────────────────────────────────────────────────────────
function catLabel(slug) {
  const entry = categoryMap[slug];
  if (entry) return entry[lang];
  return slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

// ── 搜索 + 筛选 ────────────────────────────────────────────────────────────
function filterCases() {
  let list = allCases;

  if (activeCategory !== 'all') {
    list = list.filter(c => c.category === activeCategory);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(c =>
      (c.titleZh  || '').toLowerCase().includes(q) ||
      (c.titleEn  || '').toLowerCase().includes(q) ||
      (c.descZh   || '').toLowerCase().includes(q) ||
      (c.descEn   || '').toLowerCase().includes(q)
    );
  }

  return list;
}

// ── 骨架屏 ───────────────────────────────────────────────────────────────
function renderSkeletons(count = 8) {
  const grid = $('card-grid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: count }, () => `
    <div class="card skeleton" aria-hidden="true">
      <div class="sk-badge"></div>
      <div class="sk-title"></div>
      <div class="sk-sub"></div>
      <div class="sk-desc"></div>
      <div class="sk-desc short"></div>
    </div>
  `).join('');
}

// ── 卡片渲染 ─────────────────────────────────────────────────────────────
function renderCards(cases) {
  const grid = $('card-grid');
  if (!grid) return;

  if (!cases.length) {
    grid.innerHTML = `<p class="no-results" data-zh="暂无匹配案例" data-en="No matching cases found.">
      ${lang === 'zh' ? '暂无匹配案例' : 'No matching cases found.'}
    </p>`;
    return;
  }

  grid.innerHTML = cases.map(c => `
    <article class="card card-animate" data-file="${encodeURIComponent(c.filename)}">
      <span class="badge" data-category="${c.category}">${catLabel(c.category)}</span>
      <h3 class="card-title">${lang === 'zh' ? c.titleZh : c.titleEn}</h3>
      <p class="card-sub">${lang === 'zh' ? c.titleEn : c.titleZh}</p>
      <p class="card-desc">${lang === 'zh' ? c.descZh : c.descEn}</p>
      <a class="card-link" href="case.html?file=${encodeURIComponent(c.filename)}"
         data-zh="查看详情 →" data-en="View Details →">
        ${lang === 'zh' ? '查看详情 →' : 'View Details →'}
      </a>
    </article>
  `).join('');

  // 点击整张卡片也可跳转
  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.tagName === 'A') return;
      const file = card.dataset.file;
      if (file) {
        document.body.classList.add('page-exit');
        setTimeout(() => { window.location.href = `case.html?file=${file}`; }, 200);
      }
    });
    card.style.cursor = 'pointer';
  });

  attachLazyLoad();
}

// ── IntersectionObserver 懒加载 ───────────────────────────────────────────
function attachLazyLoad() {
  if (cardObserver) cardObserver.disconnect();
  cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.card-animate').forEach(el => cardObserver.observe(el));
}

// ── 分类 Tab 构建 ────────────────────────────────────────────────────────
function buildCategoryTabs(cases) {
  const tabBar = $('tab-bar');
  if (!tabBar) return;

  // 从数据中提取真实分类
  const categoryOrder = Object.keys(categoryMap);
  const presentCategories = [...new Set(cases.map(c => c.category))]
    .sort((a, b) => {
      const ia = categoryOrder.indexOf(a);
      const ib = categoryOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

  const tabs = [
    { slug: 'all', zh: '全部', en: 'All' },
    ...presentCategories.map(slug => ({
      slug,
      zh: categoryMap[slug]?.zh || slug,
      en: categoryMap[slug]?.en || slug,
    })),
  ];

  tabBar.innerHTML = tabs.map(t => `
    <button class="tab${t.slug === activeCategory ? ' active' : ''}"
            data-category="${t.slug}"
            data-zh="${t.zh}" data-en="${t.en}">
      ${t[lang]}
    </button>
  `).join('');

  tabBar.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      tabBar.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCards(filterCases());
    });
  });
}

// ── 搜索框 ────────────────────────────────────────────────────────────────
function initSearch() {
  const input = $('search-input');
  if (!input) return;

  input.addEventListener('input', () => {
    searchQuery = input.value.trim();
    renderCards(filterCases());
  });
}

// ── 案例总数 ──────────────────────────────────────────────────────────────
function updateCount(n) {
  const el = $('case-count');
  if (el) el.textContent = n;
}

// ── 数据加载（双阶段） ────────────────────────────────────────────────────
async function loadCases() {
  // 阶段一：sessionStorage 秒开
  const cached = sessionStorage.getItem(SESSION_KEY);
  if (cached) {
    try {
      const { cases } = JSON.parse(cached);
      allCases = [...cases, ...DEMO_CASES];
      updateCount(allCases.length);
      buildCategoryTabs(allCases);
      renderCards(filterCases());
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } else {
    renderSkeletons();
  }

  // 阶段二：后台拉取最新数据
  try {
    const res = await fetch('/api/cases');
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    if (!data.cases?.length) throw new Error('Empty response');

    const fresh = JSON.stringify(data);
    const prev  = sessionStorage.getItem(SESSION_KEY);

    // 数据有变化才触发重渲染
    if (fresh !== prev) {
      sessionStorage.setItem(SESSION_KEY, fresh);
      allCases = [...data.cases, ...DEMO_CASES];
      updateCount(allCases.length);
      buildCategoryTabs(allCases);
      renderCards(filterCases());
    }
  } catch (err) {
    console.error('[loadCases]', err);
    if (!allCases.length) {
      allCases = [...DEMO_CASES];
      updateCount(allCases.length);
      buildCategoryTabs(allCases);
      renderCards(filterCases());
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

// ── 语言切换按钮 ─────────────────────────────────────────────────────────
function initLangToggle() {
  const btn = $('lang-toggle');
  if (btn) btn.addEventListener('click', toggleLang);
}

// ── 导航栏滚动效果 ────────────────────────────────────────────────────────
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

// ── 入口 ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyLang();
  initLangToggle();
  initNavScroll();
  initSearch();
  pageEnter();
  loadCases();
});
