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
      allCases = cases;
      updateCount(cases.length);
      buildCategoryTabs(cases);
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
      allCases = data.cases;
      updateCount(data.cases.length);
      buildCategoryTabs(data.cases);
      renderCards(filterCases());
    }
  } catch (err) {
    console.error('[loadCases]', err);
    if (!allCases.length) {
      const grid = $('card-grid');
      if (grid) grid.innerHTML = `
        <p class="error-msg">
          ${lang === 'zh' ? '加载失败，请稍后刷新重试。' : 'Failed to load. Please refresh.'}
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
