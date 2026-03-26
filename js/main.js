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
    titleZh: '智能文章写作', titleEn: 'AI Article Writer',
    descZh: '描述主题与受众，AI 自动生成结构完整的长文章，无需从零开始。', descEn: 'Describe your topic and audience — AI generates a fully structured long-form article.',
    skillsZh: '- 文本生成 MCP\n- 提示词工程', skillsEn: '- Text generation MCP\n- Prompt engineering',
    usageZh: '1. 描述文章主题和目标读者\n2. 可选：指定风格（严肃 / 轻松 / 专业）和字数\n3. AI 输出完整草稿，可继续对话修改',
    usageEn: '1. Describe the topic and target audience\n2. Optional: specify tone and word count\n3. AI outputs a full draft; continue the conversation to refine',
    featuresZh: '- 根据关键词一键生成带大纲的完整文章\n- 自定义写作风格：严肃、轻松、专业、通俗\n- 先生成大纲，确认后再逐段展开\n- 快速产出多个版本供比较选择',
    featuresEn: '- Generate complete articles with outlines from keywords\n- Customize tone: formal, casual, professional\n- Generate outline first, then expand section by section\n- Produce multiple versions for comparison',
    tipsZh: '- 提供具体主题比泛泛关键词效果更好\n- 指定目标读者有助于 AI 调整写作风格\n- 可以先让 AI 列大纲，确认思路后再展开正文',
    tipsEn: '- Specific topics work better than vague keywords\n- Specifying the target reader helps AI adjust tone\n- Ask for an outline first to confirm structure before expanding',
    githubUrl: '',
  },
  {
    filename: 'demo-video-script.md', category: 'creative-building',
    titleZh: '短视频脚本生成', titleEn: 'Video Script Generator',
    descZh: '输入视频主题和时长，AI 自动生成含口播文案与画面描述的分段脚本。', descEn: 'Enter your video topic and duration — AI generates a segmented script with voiceover and shot descriptions.',
    skillsZh: '- 脚本创作 MCP\n- 文本生成', skillsEn: '- Script writing MCP\n- Text generation',
    usageZh: '1. 输入视频主题、目标时长和目标平台\n2. AI 生成含口播 + 画面说明的完整脚本\n3. 按需调整后直接用于拍摄',
    usageEn: '1. Enter topic, target duration, and platform\n2. AI generates a full script with voiceover and shot notes\n3. Adjust as needed and use directly for filming',
    featuresZh: '- 生成完整短视频脚本（口播 + 分镜画面描述）\n- 支持多平台风格：抖音、B站、YouTube Shorts\n- 自动按时间段拆分镜头\n- 批量生成系列视频脚本',
    featuresEn: '- Full short video scripts (voiceover + shot descriptions)\n- Multi-platform styles: TikTok, YouTube Shorts, etc.\n- Auto-split into timed segments\n- Batch generate series scripts',
    tipsZh: '- 明确视频时长（15秒 / 1分钟 / 3分钟）有助于控制篇幅\n- 提供参考视频描述可帮助 AI 理解目标风格\n- 批量生成时建议先生成一个样本确认满意后再批量',
    tipsEn: '- Specify duration (15s / 1min / 3min) to control length\n- Describe a reference video to help AI match the style\n- Generate one sample first to confirm quality before batching',
    githubUrl: '',
  },
  {
    filename: 'demo-email-writer.md', category: 'productivity',
    titleZh: '智能邮件助手', titleEn: 'Smart Email Assistant',
    descZh: '粘贴收到的邮件，AI 自动分析意图并生成专业、得体的回复草稿。', descEn: 'Paste an incoming email — AI analyzes intent and drafts a professional reply.',
    skillsZh: '- 邮件处理 MCP\n- 上下文理解', skillsEn: '- Email MCP\n- Context understanding',
    usageZh: '1. 粘贴收到的邮件原文\n2. 可选：说明回复要求（简短 / 详细 / 拒绝 / 跟进）\n3. AI 生成回复草稿，发送前可继续修改',
    usageEn: '1. Paste the received email\n2. Optional: specify reply intent (brief / detailed / decline / follow-up)\n3. AI drafts a reply; refine before sending',
    featuresZh: '- 自动识别邮件意图并生成对应回复\n- 支持多种语气：正式、友好、强硬\n- 批量处理收件箱中的同类邮件\n- 生成邮件模板供反复复用',
    featuresEn: '- Auto-detect email intent and draft matching replies\n- Multiple tones: formal, friendly, assertive\n- Batch-process similar emails in bulk\n- Generate reusable email templates',
    tipsZh: '- 说明具体回复目的（同意 / 拒绝 / 询问）效果更好\n- 可要求 AI 同时生成 2-3 个备选版本\n- 敏感邮件建议发送前人工复核',
    tipsEn: '- Specify intent (agree / decline / inquire) for better results\n- Ask AI to generate 2-3 alternatives at once\n- Always review sensitive emails before sending',
    githubUrl: '',
  },
  {
    filename: 'demo-summarizer.md', category: 'productivity',
    titleZh: '长文总结工具', titleEn: 'Document Summarizer',
    descZh: '粘贴长文章、报告或会议记录，AI 提炼核心要点并生成结构化摘要。', descEn: 'Paste long articles, reports, or meeting notes — AI extracts key points into a structured summary.',
    skillsZh: '- 文本分析 MCP\n- 摘要提取', skillsEn: '- Text analysis MCP\n- Summary extraction',
    usageZh: '1. 粘贴需要总结的长文本\n2. 可选：指定摘要长度或关注点\n3. AI 输出要点列表 + 核心结论',
    usageEn: '1. Paste the long text to summarize\n2. Optional: specify summary length or focus area\n3. AI outputs bullet points + key conclusions',
    featuresZh: '- 提炼长文章、报告、会议记录的核心要点\n- 输出结构化摘要（标题 + 要点 + 结论）\n- 支持指定关注维度（风险 / 机会 / 行动项）\n- 多文档对比总结',
    featuresEn: '- Extract key points from articles, reports, meeting notes\n- Structured output (title + bullets + conclusion)\n- Focus on specific dimensions (risks / opportunities / action items)\n- Compare and summarize multiple documents',
    tipsZh: '- 指定摘要用途（内部汇报 / 客户简报）有助于调整表达\n- 可要求 AI 给出「一句话总结」和「详细要点」两个层次\n- 超长文档建议分段提交',
    tipsEn: '- Specifying the use case (internal report / client brief) improves tone\n- Ask for both a one-sentence summary and detailed bullets\n- For very long docs, submit in sections',
    githubUrl: '',
  },
  {
    filename: 'demo-research-organizer.md', category: 'research-learning',
    titleZh: '多源资料整合', titleEn: 'Multi-Source Research Organizer',
    descZh: '输入来自多个渠道的信息片段，AI 自动去重、归类并整合为有条理的研究笔记。', descEn: 'Input snippets from multiple sources — AI deduplicates, categorizes, and organizes them into research notes.',
    skillsZh: '- 信息整合 MCP\n- 结构化输出', skillsEn: '- Information synthesis MCP\n- Structured output',
    usageZh: '1. 粘贴来自不同来源的内容片段（网页 / 论文 / 笔记）\n2. 描述整理目标（按主题 / 时间 / 重要性）\n3. AI 输出整合后的结构化研究资料',
    usageEn: '1. Paste content snippets from various sources (web / papers / notes)\n2. Describe the organization goal (by topic / time / importance)\n3. AI outputs organized, structured research notes',
    featuresZh: '- 自动去除重复信息，提炼独特观点\n- 按主题或来源重新组织内容\n- 生成带引用的结构化笔记\n- 输出可直接用于报告的素材',
    featuresEn: '- Auto-deduplicate and extract unique insights\n- Reorganize by topic or source\n- Generate structured notes with citations\n- Output material ready for reports',
    tipsZh: '- 标注每段内容的来源有助于 AI 生成引用\n- 告诉 AI 最终用途（写报告 / 做PPT）有助于调整格式\n- 可分多轮逐步添加新资料',
    tipsEn: '- Label each snippet with its source for proper citations\n- State the final use (report / slides) to adjust formatting\n- Add new material in multiple rounds',
    githubUrl: '',
  },
  {
    filename: 'demo-trend-analysis.md', category: 'research-learning',
    titleZh: '行业趋势分析', titleEn: 'Industry Trend Analyzer',
    descZh: '描述行业或话题，AI 汇总当前发展趋势、关键信号和未来预测。', descEn: 'Describe an industry or topic — AI synthesizes current trends, key signals, and forecasts.',
    skillsZh: '- 网络搜索 MCP\n- 数据解读、领域分析', skillsEn: '- Web search MCP\n- Data interpretation, domain analysis',
    usageZh: '1. 输入行业名称或研究话题\n2. 可选：指定分析维度（技术 / 市场 / 竞争格局）\n3. AI 生成结构化趋势报告',
    usageEn: '1. Enter the industry or topic\n2. Optional: specify dimensions (tech / market / competitive landscape)\n3. AI generates a structured trend report',
    featuresZh: '- 汇总行业最新动态和关键信号\n- 识别增长机会与潜在风险\n- 对比多个细分赛道的发展态势\n- 生成可分享的趋势简报',
    featuresEn: '- Synthesize the latest industry developments and signals\n- Identify growth opportunities and risks\n- Compare trends across sub-sectors\n- Generate shareable trend briefs',
    tipsZh: '- 缩小分析范围（如「AI 在医疗的应用」）比宽泛话题效果更好\n- 可要求 AI 给出信心评级（高 / 中 / 低）\n- 建议定期更新，捕捉最新变化',
    tipsEn: '- Narrow the scope (e.g., "AI in healthcare") for better results\n- Ask AI to rate its confidence (high / medium / low)\n- Run regularly to catch the latest shifts',
    githubUrl: '',
  },
  {
    filename: 'demo-code-generator.md', category: 'infrastructure-devops',
    titleZh: '自然语言代码生成', titleEn: 'Natural Language Code Generator',
    descZh: '用中文描述功能需求，AI 自动生成可运行代码，并附带注释和使用说明。', descEn: 'Describe requirements in plain language — AI generates runnable code with comments and usage notes.',
    skillsZh: '- 代码生成 MCP\n- 提示词工程', skillsEn: '- Code generation MCP\n- Prompt engineering',
    usageZh: '1. 用自然语言描述需要实现的功能\n2. 可选：指定编程语言和框架\n3. AI 输出完整代码 + 使用示例',
    usageEn: '1. Describe the feature in plain language\n2. Optional: specify language and framework\n3. AI outputs complete code + usage examples',
    featuresZh: '- 将需求描述转化为完整可运行代码\n- 支持多种编程语言（Python / JS / Go 等）\n- 自动添加注释，说明代码逻辑\n- 生成单元测试和使用示例',
    featuresEn: '- Convert requirements into complete runnable code\n- Supports multiple languages (Python / JS / Go, etc.)\n- Auto-adds comments explaining logic\n- Generates unit tests and usage examples',
    tipsZh: '- 描述输入输出格式比描述实现方式效果更好\n- 提供示例数据有助于生成更准确的代码\n- 可要求 AI 同时生成测试用例',
    tipsEn: '- Describe input/output format rather than implementation details\n- Provide sample data for more accurate code\n- Ask AI to generate test cases alongside the code',
    githubUrl: '',
  },
  {
    filename: 'demo-code-explainer.md', category: 'infrastructure-devops',
    titleZh: '代码逻辑解析', titleEn: 'Code Logic Explainer',
    descZh: '粘贴任意代码片段，AI 用中文逐层解释逻辑，帮助快速读懂陌生代码库。', descEn: 'Paste any code — AI explains the logic layer by layer, helping you quickly understand unfamiliar codebases.',
    skillsZh: '- 代码分析 MCP\n- 自然语言解释', skillsEn: '- Code analysis MCP\n- Natural language explanation',
    usageZh: '1. 粘贴需要理解的代码\n2. 可选：说明关注点（整体逻辑 / 某个函数 / 潜在 Bug）\n3. AI 输出分层次的中文解释',
    usageEn: '1. Paste the code you want to understand\n2. Optional: specify focus (overall logic / a specific function / potential bugs)\n3. AI outputs a layered explanation',
    featuresZh: '- 逐行或逻辑层次解释代码\n- 识别潜在 Bug 和性能问题\n- 生成代码流程图文字描述\n- 对比新旧代码，说明改动影响',
    featuresEn: '- Explain code line-by-line or by logical layers\n- Identify potential bugs and performance issues\n- Generate textual flowchart descriptions\n- Compare old and new code to explain change impact',
    tipsZh: '- 说明代码所属项目背景有助于更准确的解释\n- 可以分段提交超长代码\n- 可要求 AI 用类比方式解释复杂逻辑',
    tipsEn: '- Providing project context leads to more accurate explanations\n- Submit very long code in sections\n- Ask AI to use analogies for complex logic',
    githubUrl: '',
  },
  {
    filename: 'demo-daily-brief.md', category: 'productivity',
    titleZh: '个性化每日简报', titleEn: 'Personalized Daily Brief',
    descZh: '设定关注话题和信息源，AI 每天自动汇总生成专属信息摘要，节省信息筛选时间。', descEn: 'Set your topics and sources — AI auto-generates your personalized daily digest every morning.',
    skillsZh: '- 网络搜索 MCP\n- 信息筛选、摘要生成', skillsEn: '- Web search MCP\n- Information filtering, summary generation',
    usageZh: '1. 配置关注的话题、行业或关键词\n2. 可选：设定信息源优先级\n3. 每日运行后获得结构化摘要推送',
    usageEn: '1. Configure topics, industries, or keywords\n2. Optional: set source priorities\n3. Run daily to receive a structured digest',
    featuresZh: '- 自动汇聚多个信息源的最新内容\n- 去除噪声，只保留与你相关的信息\n- 生成带优先级的每日行动建议\n- 支持定时自动触发',
    featuresEn: '- Auto-aggregate the latest content from multiple sources\n- Filter noise and keep only relevant information\n- Generate prioritized daily action suggestions\n- Supports scheduled auto-triggering',
    tipsZh: '- 关键词越具体，筛选质量越高\n- 可要求 AI 给每条信息标注重要性评级\n- 建议每周调整一次关键词，避免信息茧房',
    tipsEn: '- More specific keywords yield better filtering quality\n- Ask AI to tag each item with an importance rating\n- Adjust keywords weekly to avoid information bubbles',
    githubUrl: '',
  },
  {
    filename: 'demo-workflow-automation.md', category: 'productivity',
    titleZh: '重复工作流自动化', titleEn: 'Workflow Automation',
    descZh: '描述你的重复性工作流程，AI 自动拆分为可执行步骤，逐一调用工具完成任务。', descEn: 'Describe your repetitive workflow — AI breaks it into executable steps and completes each one using tools.',
    skillsZh: '- 任务规划\n- 工具调用 MCP', skillsEn: '- Task planning\n- Tool calling MCP',
    usageZh: '1. 描述需要自动化的重复工作流\n2. AI 自动拆分步骤并确认执行计划\n3. 逐步调用工具完成任务，全程可见',
    usageEn: '1. Describe the repetitive workflow to automate\n2. AI breaks it into steps and confirms the plan\n3. Executes step-by-step with full visibility',
    featuresZh: '- 将复杂流程拆解为独立可执行步骤\n- 自动调用合适的工具完成每个步骤\n- 遇到异常时暂停并提示人工介入\n- 记录执行日志，便于复盘',
    featuresEn: '- Break complex processes into independent executable steps\n- Auto-invoke the right tools for each step\n- Pause and alert on exceptions for human review\n- Log execution for retrospective review',
    tipsZh: '- 先从小流程开始测试，再扩展到完整工作流\n- 明确描述每个步骤的输入输出\n- 对涉及外部系统的步骤要做好异常处理预案',
    tipsEn: '- Start with small flows before expanding to full workflows\n- Clearly describe input/output for each step\n- Plan for error handling on steps involving external systems',
    githubUrl: '',
  },
  {
    filename: 'demo-earnings-tracker.md', category: 'finance-trading',
    titleZh: '财报追踪助手', titleEn: 'Earnings Tracker',
    descZh: '自动追踪上市公司财报并生成分析摘要', descEn: 'Automatically track earnings reports and generate analysis summaries.',
    skillsZh: '数据抓取、财务分析、结构化输出', skillsEn: 'Data scraping, financial analysis, structured output',
    usageZh: '输入股票代码或公司名称，自动获取最新财报数据并生成关键指标分析', usageEn: 'Enter a ticker or company name to fetch the latest earnings and generate key metric analysis.',
    githubUrl: 'https://github.com/hesamsheikh/awesome-openclaw-usecases/blob/main/usecases/earnings-tracker.md',
    sourceFile: 'earnings-tracker.md',
  },
  {
    filename: 'demo-market-sentiment.md', category: 'finance-trading',
    titleZh: '市场情绪分析', titleEn: 'Market Sentiment Analyzer',
    descZh: '聚合多源资讯，量化市场情绪指数', descEn: 'Aggregate multi-source news and quantify market sentiment scores.',
    skillsZh: '新闻聚合、情感分析、趋势判断', skillsEn: 'News aggregation, sentiment analysis, trend detection',
    usageZh: '输入资产名称或板块，汇总近期新闻与社区讨论，输出情绪评分与风险提示', usageEn: 'Enter an asset or sector to aggregate recent news and community posts into a sentiment score with risk signals.',
    githubUrl: 'https://github.com/hesamsheikh/awesome-openclaw-usecases/blob/main/usecases/polymarket-autopilot.md',
    sourceFile: 'polymarket-autopilot.md',
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
