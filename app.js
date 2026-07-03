const STORAGE = {
  agents: "xz-platform-agents-v2",
  favorites: "xz-favorites",
  history: "xz-history",
  conversations: "xz-ai-conversations-v1",
  alumni: "xz-alumni-application-v1",
  quota: "xz-alumni-quota-v1",
  session: "xz-session",
  remember: "xz-remember"
};

const categoryCatalog = [
  {
    name: "校史文化", color: "#8b2332", bg: "#f4e8ea", icon: "landmark",
    owner: "档案馆", items: [
      ["晓庄校史智库", "史"], ["陶行知思想问答", "陶"], ["百年校史时间轴", "年"], ["校园建筑导览", "筑"],
      ["晓庄人物志", "人"], ["红色校史研学", "研"], ["校友故事馆", "友"], ["校史资料检索", "档"],
      ["行知名言助手", "言"], ["百年校庆策划", "庆"]
    ]
  },
  {
    name: "教学支持", color: "#a7192e", bg: "#fae8e6", icon: "notebook-tabs",
    owner: "教务处", items: [
      ["教学设计助手", "教"], ["课件创意工坊", "课"], ["课堂活动设计师", "活"], ["课程标准解读", "标"],
      ["教学评价助手", "评"], ["作业设计助手", "业"], ["说课训练导师", "说"], ["微课脚本助手", "微"],
      ["跨学科课程助手", "跨"], ["教学反思伙伴", "思"]
    ]
  },
  {
    name: "学生发展", color: "#b57b22", bg: "#fff1cf", icon: "sprout",
    owner: "学生工作处", items: [
      ["学生成长导师", "长"], ["生涯规划顾问", "涯"], ["学业规划助手", "学"], ["心理健康陪伴", "心"],
      ["奖助政策向导", "助"], ["社团活动顾问", "社"], ["志愿服务助手", "志"], ["创新创业教练", "创"],
      ["教师资格备考", "证"], ["实习实践导师", "实"]
    ]
  },
  {
    name: "科研创新", color: "#8b1728", bg: "#fae8e6", icon: "microscope",
    owner: "科研处", items: [
      ["行知科研助手", "研"], ["教育数据分析师", "数"], ["课题选题顾问", "题"], ["文献综述助手", "文"],
      ["研究方法顾问", "法"], ["问卷设计助手", "卷"], ["学术写作教练", "写"], ["项目申报助手", "项"],
      ["成果转化顾问", "果"], ["科研伦理助手", "伦"]
    ]
  },
  {
    name: "校园服务", color: "#925f27", bg: "#f6ecdf", icon: "map-pinned",
    owner: "校长办公室", items: [
      ["校园服务向导", "校"], ["公文写作助手", "公"], ["会议纪要助手", "会"], ["办事流程导航", "办"],
      ["图书馆智询", "图"], ["校园安全助手", "安"], ["后勤报修向导", "修"], ["场馆预约助手", "馆"],
      ["校园活动日历", "日"], ["迎新服务助手", "新"]
    ]
  },
  {
    name: "教师发展", color: "#7e1020", bg: "#f7dedb", icon: "graduation-cap",
    owner: "教师发展中心", items: [
      ["教师发展顾问", "师"], ["职称申报助手", "职"], ["教学竞赛教练", "赛"], ["师德师风助手", "德"],
      ["新教师成长营", "新"], ["公开课磨课助手", "磨"], ["教师数字素养", "智"], ["班主任工作助手", "班"],
      ["教育叙事助手", "叙"], ["教师培训策划", "培"]
    ]
  },
  {
    name: "师范教育", color: "#a06f20", bg: "#f5eddd", icon: "school",
    owner: "教师教育学院", items: [
      ["师范生技能训练", "技"], ["三字一话教练", "字"], ["模拟授课导师", "授"], ["教育见习助手", "见"],
      ["教育实习助手", "习"], ["班级管理顾问", "管"], ["家校沟通助手", "家"], ["儿童发展顾问", "童"],
      ["特殊教育助手", "特"], ["乡村教育智库", "乡"]
    ]
  },
  {
    name: "数字创作", color: "#c99832", bg: "#fff4dc", icon: "palette",
    owner: "信息工程学院", items: [
      ["海报文案助手", "海"], ["短视频脚本助手", "视"], ["数字人讲解助手", "数"], ["校园新闻编辑", "闻"],
      ["摄影创作顾问", "影"], ["视觉设计助手", "视"], ["播客策划助手", "播"], ["融媒体运营助手", "融"],
      ["文化创意助手", "文"], ["展览策划助手", "展"]
    ]
  },
  {
    name: "专业学习", color: "#9a6a1f", bg: "#fff1cf", icon: "book-open-check",
    owner: "各二级学院", items: [
      ["语文学习导师", "语"], ["数学解题导师", "数"], ["英语口语伙伴", "英"], ["科学探究助手", "科"],
      ["音乐教学助手", "音"], ["美术创作导师", "美"], ["体育训练顾问", "体"], ["地理学习助手", "地"],
      ["历史学习助手", "史"], ["计算机学习助手", "计"]
    ]
  },
  {
    name: "治理决策", color: "#620b18", bg: "#fae8e6", icon: "chart-spline",
    owner: "发展规划处", items: [
      ["发展规划助手", "规"], ["教育政策解读", "政"], ["质量监测助手", "质"], ["专业认证助手", "认"],
      ["数据填报助手", "报"], ["招生咨询助手", "招"], ["就业数据分析", "就"], ["资产管理助手", "资"],
      ["采购政策向导", "采"], ["风险研判助手", "险"]
    ]
  }
];

const descriptions = {
  "校史文化": "基于晓庄校史与行知教育思想，为校史学习、文化传播和百年校庆提供专业支持。",
  "教学支持": "面向真实课堂场景，辅助教师完成教学设计、资源制作、课堂实施与学习评价。",
  "学生发展": "为学生提供学业、生涯、实践和身心成长方面的个性化建议与行动支持。",
  "科研创新": "覆盖教育研究全流程，辅助选题、文献、方法、数据分析与成果表达。",
  "校园服务": "聚合校园办事信息和服务流程，帮助师生快速解决日常事务问题。",
  "教师发展": "服务教师专业成长、教学能力提升与职业发展，沉淀可复用的成长路径。",
  "师范教育": "围绕师范生培养和教育实践，强化教学技能、育人能力与职业认同。",
  "数字创作": "支持校园融媒体与数字内容生产，提供策划、文案、视觉和传播建议。",
  "专业学习": "面向不同学科提供启发式学习支持，帮助学生理解知识并开展自主探究。",
  "治理决策": "辅助学校管理部门进行政策理解、数据分析、质量治理与科学决策。"
};

function buildDefaultAgents() {
  let index = 0;
  return categoryCatalog.flatMap((category, categoryIndex) =>
    category.items.map(([name, logoText], itemIndex) => {
      index += 1;
      return {
        id: `agent-${String(index).padStart(3, "0")}`,
        name,
        logoText,
        category: category.name,
        icon: category.icon,
        description: descriptions[category.name],
        color: category.color,
        bg: category.bg,
        owner: category.owner,
        status: index % 17 === 0 ? "draft" : index % 29 === 0 ? "offline" : "published",
        mode: "local",
        url: "",
        cozeUrl: `https://www.coze.cn/store/agent/xiaozhuang-century-${String(index).padStart(3, "0")}`,
        apiUrl: "",
        providerAlias: "",
        routeHint: routeForCategory(category.name),
        systemPrompt: `你是“${name}”，服务于南京晓庄学院百年晓庄智慧教育平台。你的领域是${category.name}。请结合晓庄“教学做合一”的教育精神，给出准确、可执行、适合真实校园场景的回答；涉及学校事实、政策、数据时不得编造。`,
        logoImage: `assets/agents/agent-${String(index).padStart(3, "0")}.svg`,
        featured: itemIndex === 0 && categoryIndex < 8,
        prompts: [
          `请介绍${name}可以提供哪些帮助`,
          `帮我完成一个与${category.name}相关的任务`,
          `给我一份可以马上执行的建议`
        ],
        createdAt: "2026-06-14",
        updatedAt: "2026-06-14"
      };
    })
  );
}

function routeForCategory(category) {
  return {
    校史文化: "kimi",
    教学支持: "deepseek",
    学生发展: "qwen",
    科研创新: "kimi",
    校园服务: "qwen",
    教师发展: "deepseek",
    师范教育: "deepseek",
    数字创作: "coze",
    专业学习: "qwen",
    治理决策: "ernie"
  }[category] || "qwen";
}

function loadAgents() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE.agents) || "null");
    const source = Array.isArray(saved) && saved.length ? saved : buildDefaultAgents();
    return source.map(({ apiToken, ...agent }) => ({
      routeHint: routeForCategory(agent.category),
      systemPrompt: `你是“${agent.name}”，服务于南京晓庄学院百年晓庄智慧教育平台。请给出准确、可执行、适合真实校园场景的回答。`,
      ...agent
    }));
  } catch {
    return buildDefaultAgents();
  }
}

let agents = loadAgents();

const state = {
  apiAvailable: false,
  serverMode: false,
  currentUser: null,
  sso: { enabled: false, label: "学校统一身份认证" },
  category: "全部",
  query: "",
  managementQuery: "",
  managementStatus: "all",
  managementQuality: "all",
  managementTestStatus: "all",
  managementSort: "id-asc",
  artifactQuery: "",
  artifactType: "all",
  artifactWorkflow: "all",
  auditQuery: "",
  auditAction: "all",
  modelRunQuery: "",
  modelRunStatus: "all",
  modelRunRoute: "all",
  providerQuery: "",
  providerConfig: "all",
  providerType: "all",
  userQuery: "",
  userRole: "all",
  userStatus: "all",
  feedbackQuery: "",
  feedbackStatus: "all",
  feedbackType: "all",
  alumniReviewQuery: "",
  alumniReviewStatus: "pending",
  readinessQuery: "",
  readinessLevel: "all",
  readinessOwner: "all",
  metricsWindow: "7",
  workflowQuery: "",
  workflowSort: "id-asc",
  workflowTestStatus: "all",
  workflowQuality: "all",
  favorites: JSON.parse(localStorage.getItem(STORAGE.favorites) || '["agent-001","agent-011"]'),
  history: JSON.parse(localStorage.getItem(STORAGE.history) || "[]"),
  conversations: JSON.parse(localStorage.getItem(STORAGE.conversations) || "[]"),
  alumni: JSON.parse(localStorage.getItem(STORAGE.alumni) || "null"),
  quota: JSON.parse(localStorage.getItem(STORAGE.quota) || '{"total":1000000,"remaining":1000000,"expiresAt":null,"ledger":[]}'),
  workflows: [],
  artifacts: [],
  users: [],
  auditLogs: [],
  modelRuns: [],
  feedbackItems: [],
  readiness: null,
  selectedAgentIds: new Set(),
  selectedWorkflowIds: new Set(),
  selectedArtifactIds: new Set(),
  branding: {
    platformName: "百年晓庄智慧教育平台",
    schoolName: "南京晓庄学院",
    logoUrl: "assets/njxzc-seal.png",
    heroImageUrl: "assets/xiaozhuang-century.png",
    primaryColor: "#971728",
    goldColor: "#c99a3f",
    assetStatus: "placeholder",
    authorizationNote: ""
  },
  aiAttachments: [],
  activeConversationId: null,
  activeAgent: null,
  editingAgentId: null
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function apiBase() {
  const configured = window.XZ_PLATFORM_CONFIG?.apiBase || document.querySelector('meta[name="xz-api-base"]')?.content || "";
  return String(configured).replace(/\/+$/, "");
}

function apiUrl(path) {
  if (/^https?:\/\//i.test(path || "")) return path;
  const normalized = String(path || "").startsWith("/") ? String(path || "") : `/${path || ""}`;
  return `${apiBase()}${normalized}`;
}

async function api(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof Blob) && !(options.body instanceof ArrayBuffer) ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    const error = new Error(data?.error || `请求失败（${response.status}）`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function connectPlatform() {
  try {
    const health = await api("/api/health");
    state.apiAvailable = true;
    await syncSsoConfig();
    try {
      const { user } = await api("/api/auth/me");
      state.currentUser = user;
      state.serverMode = true;
      if (user.mustChangePassword) {
        showPasswordGate();
        return;
      }
      await syncServerState();
      login();
    } catch (error) {
      if (error.status !== 401) throw error;
    }
  } catch {
    state.apiAvailable = false;
    state.serverMode = false;
  }
  updateConnectionBadge();
}

async function demoPreviewLogin() {
  const result = await api("/api/auth/demo-preview", { method: "POST", body: "{}" });
  state.currentUser = result.user;
  state.serverMode = true;
  $("#loginError").textContent = "";
  await syncServerState();
  login();
  showToast("Demo 预审模式已自动进入完整平台");
}

async function syncSsoConfig() {
  try {
    const config = await api("/api/auth/sso/config");
    state.sso = config;
    const button = $("#ssoLoginButton");
    if (button) {
      button.hidden = !config.enabled;
      button.querySelector("span").textContent = config.label || "学校统一身份认证登录";
    }
  } catch {
    state.sso = { enabled: false, label: "学校统一身份认证" };
    const button = $("#ssoLoginButton");
    if (button) button.hidden = true;
  }
}

async function syncBranding() {
  try {
    const { branding } = await api("/api/branding");
    state.branding = { ...state.branding, ...branding };
  } catch {
    // Static preview keeps bundled placeholder assets.
  }
  applyBranding();
}

function applyBranding() {
  const branding = state.branding || {};
  document.documentElement.style.setProperty("--red", branding.primaryColor || "#971728");
  document.documentElement.style.setProperty("--gold", branding.goldColor || "#c99a3f");
  const theme = document.querySelector('meta[name="theme-color"]');
  if (theme) theme.setAttribute("content", branding.primaryColor || "#971728");
  const icon = document.querySelector('link[rel="icon"]');
  if (icon && branding.logoUrl) icon.setAttribute("href", branding.logoUrl);
  $$("[data-brand-logo]").forEach(image => {
    image.src = branding.logoUrl || "assets/njxzc-seal.png";
    image.alt = branding.schoolName || "";
  });
  $$("[data-brand-hero]").forEach(image => {
    image.src = branding.heroImageUrl || "assets/xiaozhuang-century.png";
  });
  $$(".brand strong").forEach(element => {
    element.textContent = branding.schoolName || element.textContent;
  });
  $$(".brand small, .mobile-brand strong").forEach(element => {
    element.textContent = branding.platformName || element.textContent;
  });
}

async function syncServerState() {
  if (!state.serverMode) return;
  const requests = [
    api("/api/agents"),
    api("/api/conversations"),
    api("/api/alumni/status"),
    api("/api/alumni/quota"),
    api("/api/alumni/ledger"),
    api("/api/workflows"),
    api("/api/artifacts").catch(() => ({ artifacts: [] }))
  ];
  const [{ agents: remoteAgents }, { conversations }, { application }, quota, { ledger }, { workflows }, { artifacts }] = await Promise.all(requests);
  agents = remoteAgents;
  state.workflows = workflows;
  state.artifacts = artifacts;
  state.conversations = conversations;
  state.activeConversationId = conversations[0]?.id || null;
  state.alumni = application;
  state.quota = { ...quota, ledger };
  applyRoleVisibility();
  renderAll();
  renderConversations();
  renderAiMessages();
  renderAlumni();
  renderTokenLedger();
  updateQuotaDisplay();
  await syncAdminData();
}

function applyRoleVisibility() {
  const role = state.currentUser?.role;
  const canOpenAdminConsole = ["super_admin", "agent_admin", "alumni_reviewer"].includes(role);
  const canManageApplications = ["super_admin", "agent_admin"].includes(role);
  $$(".admin-nav").forEach(element => element.hidden = state.serverMode && !canOpenAdminConsole);
  $$("[data-agent-admin-only]").forEach(element => {
    element.hidden = state.serverMode && !canManageApplications;
  });
  $$("[data-super-only]").forEach(element => {
    element.hidden = state.serverMode && role !== "super_admin";
  });
}

function hasAdminConsoleAccess() {
  if (state.serverMode) return ["super_admin", "agent_admin", "alumni_reviewer"].includes(state.currentUser?.role);
  return Boolean(state.currentUser?.role || sessionStorage.getItem(STORAGE.session) || localStorage.getItem(STORAGE.remember));
}

function canManageAgentCatalog() {
  if (state.serverMode) return ["super_admin", "agent_admin"].includes(state.currentUser?.role);
  return hasAdminConsoleAccess();
}

async function syncAdminData() {
  if (!state.serverMode || !["super_admin", "agent_admin", "alumni_reviewer"].includes(state.currentUser?.role)) return;
  try {
    const [{ providers }, { applications }, { workflows }, { metrics }, { runs }, { users }, { logs }, { items }, { readiness }] = await Promise.all([
      api("/api/admin/providers").catch(() => ({ providers: [] })),
      api("/api/admin/alumni/applications").catch(() => ({ applications: [] })),
      api("/api/admin/workflows").catch(() => ({ workflows: state.workflows || [] })),
      api(`/api/admin/metrics?days=${encodeURIComponent(state.metricsWindow)}`).catch(() => ({ metrics: null })),
      api("/api/admin/model-runs").catch(() => ({ runs: [] })),
      api("/api/admin/users").catch(() => ({ users: [] })),
      api("/api/admin/audit-logs").catch(() => ({ logs: [] })),
      api("/api/admin/feedback").catch(() => ({ items: [] })),
      api("/api/admin/readiness").catch(() => ({ readiness: null }))
    ]);
    state.providerStatuses = providers;
    state.reviewApplications = applications;
    state.workflows = workflows;
    state.metrics = metrics;
    state.modelRuns = runs;
    state.users = users;
    state.auditLogs = logs;
    state.feedbackItems = items;
    state.readiness = readiness;
    renderOperations();
  } catch {
    // Role-specific panels remain available in offline mode.
  }
}

function updateConnectionBadge() {
  const badge = $(".service-status");
  if (!badge) return;
  badge.classList.toggle("connected", state.serverMode);
  badge.innerHTML = `<span></span>${state.serverMode ? "学校模型网关已连接" : "模型网关待连接"}`;
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
}

function escapeHtml(text = "") {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function saveAgents() {
  localStorage.setItem(STORAGE.agents, JSON.stringify(agents));
}

const MODEL_ROUTES = [
  { id: "kimi", name: "Kimi", provider: "Moonshot", reason: "长文本与 PDF 上下文分析", domestic: true, tests: [/pdf|文档|长文|论文|总结|提炼|分析材料/i] },
  { id: "deepseek", name: "DeepSeek", provider: "DeepSeek", reason: "教案与教学设计", domestic: true, tests: [/教案|教学设计|课程设计|课堂|评价量规|说课|作业设计/i] },
  { id: "chatgpt", name: "ChatGPT", provider: "OpenAI", reason: "PPT 结构与 HTML 演示生成", domestic: false, tests: [/ppt|课件|幻灯片|演示|讲稿/i] },
  { id: "coze", name: "Coze Workflow", provider: "字节跳动", reason: "HTML 网页与交互动画", domestic: true, tests: [/html|网页|动画|交互|可视化|小游戏/i] },
  { id: "gemini", name: "Gemini", provider: "Google", reason: "图片与图表理解", domestic: false, tests: [/图片|照片|图表|看图|识图/i] },
  { id: "ernie", name: "文心一言", provider: "百度", reason: "教育政策与中文知识", domestic: true, tests: [/政策|文件精神|法规|制度|通知解读/i] },
  { id: "qwen", name: "通义千问", provider: "阿里云", reason: "中文通用教育任务", domestic: true, tests: [/.*/] }
];

const workflowPrompts = {
  lesson: "请帮我编写一份完整教案，包含学情分析、教学目标、重难点、教学活动、评价设计与课后反思。",
  ppt: "请制作一份课堂PPT方案，输出逐页标题、核心内容、讲稿与HTML演示。",
  quiz: "请按课程标准生成一套分层练习题，包含答案、解析和难度标记。",
  document: "请分析我上传的PDF长文档，提炼核心观点、证据和可引用内容。",
  animation: "请生成一个适合课堂使用的互动HTML网页动画，并提供在线预览与项目文件。",
  image: "请分析我上传的教学图片或图表，解释关键信息并给出课堂使用建议。"
};

function detectModel(text, attachments = []) {
  const hasPdf = attachments.some(file => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
  const hasImage = attachments.some(file => file.type.startsWith("image/"));
  if (hasPdf) return MODEL_ROUTES[0];
  if (hasImage) return MODEL_ROUTES[4];
  return MODEL_ROUTES.find(route => route.tests.some(test => test.test(text))) || MODEL_ROUTES.at(-1);
}

function saveConversations() {
  localStorage.setItem(STORAGE.conversations, JSON.stringify(state.conversations));
}

function currentConversation() {
  return state.conversations.find(item => item.id === state.activeConversationId);
}

function renderConversations() {
  const query = ($("#conversationSearch")?.value || "").trim().toLowerCase();
  const visible = state.conversations.filter(item => !query || item.title.toLowerCase().includes(query));
  $("#conversationList").innerHTML = visible.length ? visible.map(item => `
    <button class="conversation-item ${item.id === state.activeConversationId ? "active" : ""}" data-conversation="${item.id}">
      <i data-lucide="message-square"></i><span>${escapeHtml(item.title)}</span>
    </button>`).join("") : `<p class="conversation-empty">还没有对话</p>`;
  refreshIcons();
}

function renderAiMessages() {
  const conversation = currentConversation();
  const messages = conversation?.messages || [];
  $("#aiConversationTitle").textContent = conversation?.title || "人工智能＋教育";
  if (!messages.length) {
    $("#aiMessages").innerHTML = `
      <div class="ai-welcome">
        <span class="ai-welcome-mark"><i data-lucide="sparkles"></i></span>
        <h2>陶老师，今天一起做点什么？</h2>
        <p>描述教学任务即可。平台会判断意图，并自动调用更擅长的模型。</p>
        <div class="ai-suggestions">
          <button data-ai-prompt="为小学五年级设计一节《圆明园的毁灭》教学课，包含目标、活动和评价">设计一节完整教案</button>
          <button data-ai-prompt="制作一份关于陶行知生活教育理论的12页课堂演示">制作课堂演示</button>
          <button data-ai-prompt="生成一个展示抛物线运动的互动HTML网页动画">生成互动网页动画</button>
          <button data-ai-prompt="帮我分析上传的PDF，并整理核心观点与可引用内容">阅读并分析 PDF</button>
        </div>
      </div>`;
  } else {
    $("#aiMessages").innerHTML = messages.map(message => `
      <article class="ai-message ${message.role}">
        <span class="message-avatar">${message.role === "assistant" ? '<i data-lucide="sparkles"></i>' : "陶"}</span>
        <div class="message-body">
          ${message.route ? `<span class="route-info"><i data-lucide="route"></i>${escapeHtml(message.route.name)} · ${escapeHtml(message.route.reason)}</span>` : ""}
          ${escapeHtml(message.content)}
        </div>
      </article>`).join("");
  }
  refreshIcons();
  $("#aiMessages").scrollTop = $("#aiMessages").scrollHeight;
}

function createConversation() {
  const id = `conv-${Date.now().toString(36)}`;
  state.conversations.unshift({ id, title: "新对话", createdAt: new Date().toISOString(), messages: [] });
  state.activeConversationId = id;
  saveConversations();
  renderConversations();
  renderAiMessages();
  return currentConversation();
}

function updateQuotaDisplay() {
  const quota = state.quota;
  const percent = quota.total ? Math.max(0, Math.min(100, quota.remaining / quota.total * 100)) : 0;
  $("#quotaMiniValue").textContent = Number(quota.remaining || 0).toLocaleString("zh-CN");
  $("#quotaMiniBar").style.width = `${percent}%`;
}

function estimateTokens(text) {
  return Math.max(50, Math.ceil(text.length * 1.6));
}

function addLedgerEntry(description, amount, model) {
  state.quota.ledger.unshift({
    id: `ledger-${Date.now()}`,
    time: new Date().toLocaleString("zh-CN", { hour12: false }),
    description,
    amount,
    model
  });
  localStorage.setItem(STORAGE.quota, JSON.stringify(state.quota));
  renderTokenLedger();
  updateQuotaDisplay();
}

function renderTokenLedger() {
  const entries = state.quota.ledger;
  $("#tokenLedger").innerHTML = `
    <div class="ledger-table">
      <div class="ledger-row head"><span>时间</span><span>事项</span><span>额度变化</span><span>模型</span></div>
      ${entries.length ? entries.map(item => `
        <div class="ledger-row">
          <span>${escapeHtml(item.time || (item.createdAt ? new Date(item.createdAt).toLocaleString("zh-CN", { hour12: false }) : ""))}</span><span>${escapeHtml(item.description)}</span>
          <span class="${item.amount >= 0 ? "credit" : "debit"}">${item.amount >= 0 ? "+" : ""}${Number(item.amount).toLocaleString("zh-CN")}</span>
          <span>${escapeHtml(item.model || "系统")}</span>
        </div>`).join("") : `<div class="empty-state"><i data-lucide="receipt-text"></i><h3>暂无额度记录</h3><p>校友认证通过后，赠送额度与模型消费会显示在这里。</p></div>`}
    </div>`;
  refreshIcons();
}

function makeArtifact(route, prompt) {
  if (route.id === "chatgpt") {
    return {
      type: "slides",
      title: "课堂演示预览",
      html: `<div class="slide-deck"><section><small>百年晓庄智慧教育平台</small><h1>${escapeHtml(prompt.slice(0, 34))}</h1><p>课堂演示方案 · AI 辅助生成</p></section><section><h2>学习目标</h2><ol><li>理解核心概念</li><li>联系真实情境</li><li>形成迁移应用</li></ol></section><section><h2>课堂活动</h2><p>问题驱动 · 小组探究 · 展示评价</p></section></div>`
    };
  }
  if (route.id === "coze") {
    return {
      type: "html",
      title: "HTML 动画预览",
      html: `<div class="code-preview"><div class="orbit-demo"><span></span><b>互动教学动画</b></div><p>正式连接 Coze Workflow 后，此区域将运行返回的沙箱 HTML/CSS/JS，并提供 ZIP 下载。</p></div>`
    };
  }
  return null;
}

function showArtifact(artifact) {
  if (!artifact) return;
  state.currentArtifact = artifact;
  $("#artifactTitle").textContent = artifact.title;
  $("#artifactContent").innerHTML = artifact.html;
  $("#artifactPanel").hidden = false;
}

async function submitAiTask(text, workflowId = "") {
  let conversation = currentConversation() || createConversation();
  let route = detectModel(text, state.aiAttachments);
  if (workflowId) {
    const forcedRoute = {
      lesson: "deepseek",
      ppt: "chatgpt",
      quiz: "qwen",
      document: "kimi",
      animation: "coze",
      image: "gemini"
    }[workflowId];
    route = MODEL_ROUTES.find(item => item.id === forcedRoute) || route;
  }
  const attachmentNames = state.aiAttachments.map(file => file.name);
  conversation.title = conversation.messages.length ? conversation.title : text.slice(0, 20);
  conversation.messages.push({ role: "user", content: `${text}${attachmentNames.length ? `\n附件：${attachmentNames.join("、")}` : ""}` });
  conversation.messages.push({ role: "assistant", content: "正在连接学校 AI 模型网关…", route, pending: true });
  saveConversations();
  renderConversations();
  renderAiMessages();

  let uploadedAttachments = state.aiAttachments.map(file => ({ name: file.name, type: file.type, size: file.size }));
  let answer;
  try {
    if (!state.serverMode) throw new Error("offline");
    uploadedAttachments = await Promise.all(state.aiAttachments.map(async file => {
      const result = await api("/api/files", {
        method: "POST",
        headers: { "Content-Type": file.type, "X-File-Name": encodeURIComponent(file.name) },
        body: file
      });
      return result.file;
    }));
    const data = await api(workflowId ? `/api/workflows/${encodeURIComponent(workflowId)}/run` : "/api/chat/stream", {
      method: "POST",
      body: JSON.stringify({
        conversationId: conversation.id,
        message: text,
        prompt: text,
        attachments: uploadedAttachments,
        routeHint: route.id
      })
    });
    answer = data.answer || data.content;
    if (data.route) route = { ...route, ...data.route, id: data.route.provider || route.id };
    if (data.artifact) conversation.messages.at(-1).artifact = data.artifact;
    if (data.artifact && state.serverMode) {
      const artifactData = await api("/api/artifacts").catch(() => ({ artifacts: state.artifacts || [] }));
      state.artifacts = artifactData.artifacts || [];
      renderArtifacts();
    }
    if (data.quota) {
      state.quota = { ...state.quota, ...data.quota };
      const ledger = await api("/api/alumni/ledger");
      state.quota.ledger = ledger.ledger;
      renderTokenLedger();
      updateQuotaDisplay();
    }
  } catch (error) {
    const routed = error.data?.route || route;
    route = { ...route, ...routed };
    answer = state.serverMode
      ? `已识别为“${route.reason}”任务，计划由 ${route.name} 处理。\n\n${error.message}。请由平台管理员在服务端配置对应模型连接；本次失败不会扣减 Token。`
      : `已识别为“${route.reason}”任务，计划由 ${route.name} 处理。\n\n当前处于静态离线模式，没有伪造模型回答。请通过 Node 服务启动平台并配置 ${route.provider || route.name} 连接。`;
  }

  const assistant = conversation.messages.at(-1);
  assistant.content = answer;
  assistant.route = route;
  assistant.pending = false;
  const used = !state.serverMode && route.domestic ? estimateTokens(text + answer) : 0;
  if (used && state.quota.remaining > 0 && state.alumni?.status === "approved") {
    const charge = Math.min(used, state.quota.remaining);
    state.quota.remaining -= charge;
    addLedgerEntry(`AI 教育助手：${route.reason}`, -charge, route.name);
  }
  assistant.artifact = assistant.artifact || makeArtifact(route, text);
  saveConversations();
  renderAiMessages();
  if (assistant.artifact) showArtifact(assistant.artifact);
  state.aiAttachments = [];
  renderAttachments();
}

function renderAttachments() {
  $("#attachmentList").innerHTML = state.aiAttachments.map((file, index) => `
    <span class="attachment-chip"><i data-lucide="${file.type === "application/pdf" ? "file-text" : "image"}"></i>${escapeHtml(file.name)}
      <button class="icon-button" type="button" data-remove-attachment="${index}" aria-label="移除 ${escapeHtml(file.name)}"><i data-lucide="x"></i></button>
    </span>`).join("");
  refreshIcons();
}

function renderAlumni() {
  const application = state.alumni;
  const status = $("#alumniStatus");
  $$("#alumniForm input, #alumniForm button").forEach(control => control.disabled = false);
  if (!application) {
    status.className = "alumni-status pending";
    status.innerHTML = '<i data-lucide="clock-3"></i>未认证';
  } else if (application.status === "approved") {
    status.className = "alumni-status approved";
    status.innerHTML = '<i data-lucide="badge-check"></i>已认证校友';
  } else if (application.status === "pending") {
    status.className = "alumni-status pending";
    status.innerHTML = '<i data-lucide="hourglass"></i>审核中';
    $$("#alumniForm input, #alumniForm button").forEach(control => control.disabled = true);
  } else {
    status.className = "alumni-status pending";
    status.innerHTML = '<i data-lucide="rotate-ccw"></i>已退回';
  }
  refreshIcons();
}

function renderOperations() {
  const providers = [
    { id: "kimi", name: "Kimi", capability: "长文本 / PDF", mark: "K", domestic: true },
    { id: "deepseek", name: "DeepSeek", capability: "教案 / 推理", mark: "D", domestic: true },
    { id: "chatgpt", name: "ChatGPT", capability: "PPT / 演示", mark: "O", domestic: false },
    { id: "coze", name: "Coze", capability: "HTML 动画", mark: "C", domestic: true },
    { id: "gemini", name: "Gemini", capability: "图片理解", mark: "G", domestic: false },
    { id: "qwen", name: "通义千问", capability: "中文通用", mark: "Q", domestic: true },
    { id: "doubao", name: "豆包", capability: "快速问答", mark: "豆", domestic: true },
    { id: "glm", name: "智谱 GLM", capability: "知识任务", mark: "智", domestic: true },
    { id: "ernie", name: "文心一言", capability: "政策解读", mark: "文", domestic: true },
    { id: "hunyuan", name: "腾讯混元", capability: "故障备用", mark: "混", domestic: true }
  ];
  const statuses = Object.fromEntries((state.providerStatuses || []).map(item => [item.id, item]));
  const enrichedProviders = providers.map(provider => ({ ...provider, status: { domestic: provider.domestic, ...(statuses[provider.id] || {}) } }));
  const visibleProviders = filteredProviders(enrichedProviders);
  const providerCount = $("#providerResultCount");
  if (providerCount) providerCount.textContent = `显示 ${visibleProviders.length} / ${providers.length} 家`;
  renderProviderGovernance(visibleProviders, providers.length);
  $("#providerList").innerHTML = visibleProviders.map(provider => {
    const missing = provider.status.missingEnv || [];
    const envNames = provider.status.envNames || [];
    return `
      <div class="provider-item">
        <span class="provider-mark">${escapeHtml(provider.mark)}</span>
        <span>
          <strong>${escapeHtml(provider.name)}</strong>
          <small>${escapeHtml(provider.capability)}${provider.status.model ? ` · ${escapeHtml(provider.status.model)}` : ""} · ${provider.status.domestic === false ? "国际模型" : "国产模型"}</small>
          <small class="${missing.length ? "provider-missing" : "provider-env"}">${missing.length ? `缺少：${missing.map(escapeHtml).join(" / ")}` : `环境：${envNames.map(escapeHtml).join(" / ") || "已由服务端默认值补齐"}`}</small>
        </span>
        <i class="connection-dot ${provider.status.configured ? "ready" : ""}" title="${provider.status.configured ? "服务端已配置" : `等待服务端配置${missing.length ? `：${missing.join(" / ")}` : ""}`}"></i>
        <button class="icon-button" data-test-provider="${provider.id}" title="测试连接" aria-label="测试 ${escapeHtml(provider.name)} 连接"><i data-lucide="activity"></i></button>
      </div>`;
  }).join("") || `<div class="review-empty">暂无匹配模型</div>`;
  renderMetrics();
  renderModelRuns();
  renderReadiness();
  renderBrandingForm();
  renderUserManagement();
  renderTokenAdjustmentForm();
  renderAuditLogs();
  renderFeedbackManagement();
  renderAlumniReview();
  refreshIcons();
}

function filteredProviders(providers) {
  const query = state.providerQuery.trim().toLowerCase();
  return providers.filter(provider => {
    const configured = Boolean(provider.status.configured);
    const configMatches = state.providerConfig === "all"
      || (state.providerConfig === "configured" && configured)
      || (state.providerConfig === "missing" && !configured);
    const typeMatches = state.providerType === "all"
      || (state.providerType === "domestic" && provider.status.domestic !== false)
      || (state.providerType === "international" && provider.status.domestic === false);
    const haystack = [
      provider.id,
      provider.name,
      provider.capability,
      provider.status.model || "",
      (provider.status.envNames || []).join(" "),
      (provider.status.missingEnv || []).join(" "),
      configured ? "configured ready 已配置" : "missing waiting 未配置",
      provider.status.domestic === false ? "international 国际" : "domestic 国产"
    ].join(" ").toLowerCase();
    return configMatches && typeMatches && (!query || haystack.includes(query));
  });
}

function renderProviderGovernance(providers, total) {
  if (!$("#providerGovernance")) return;
  const configured = providers.filter(provider => provider.status.configured).length;
  const missing = providers.length - configured;
  const domestic = providers.filter(provider => provider.status.domestic !== false).length;
  const international = providers.length - domestic;
  const topCapabilities = providers
    .slice(0, 4)
    .map(provider => provider.capability)
    .filter(Boolean);
  $("#providerGovernance").innerHTML = `
    <section>
      <strong>当前范围</strong>
      <span>${providers.length}/${total} 家供应商</span>
    </section>
    <section>
      <strong>配置覆盖</strong>
      <span>已配置 ${configured} · 未配置 ${missing}</span>
    </section>
    <section>
      <strong>模型类型</strong>
      <span>国产 ${domestic} · 国际 ${international}</span>
    </section>
    <section>
      <strong>可测试能力</strong>
      <span>${configured} 家可批量测试${topCapabilities.length ? ` · ${topCapabilities.map(escapeHtml).join(" / ")}` : ""}</span>
    </section>`;
}

function filteredAlumniApplications() {
  const query = (state.alumniReviewQuery || "").trim().toLowerCase();
  const source = state.serverMode ? (state.reviewApplications || []) : (state.alumni ? [state.alumni] : []);
  return source.filter(item => {
    const haystack = [
      item.name,
      item.graduationYear,
      item.college,
      item.major,
      item.phone,
      item.email,
      item.status,
      item.associationStatus,
      item.associationReference,
      item.proofName,
      item.proofFileId,
      item.rejectionReason,
      item.approvalSource
    ].filter(Boolean).join(" ").toLowerCase();
    return (state.alumniReviewStatus === "all" || item.status === state.alumniReviewStatus)
      && (!query || haystack.includes(query));
  });
}

function renderAlumniReviewFilters() {
  if (!$("#alumniReviewStatus")) return;
  $("#alumniReviewStatus").value = state.alumniReviewStatus;
  $("#alumniReviewSearch").value = state.alumniReviewQuery;
}

function alumniReviewStatusLabel(status) {
  return { pending: "待人工审核", approved: "已通过", rejected: "已退回" }[status] || status || "待处理";
}

function alumniAssociationLabel(status) {
  return {
    verified: "联合认证通过",
    not_verified: "联合认证未通过",
    not_configured: "未接校友会",
    error: "联合认证异常"
  }[status] || status || "未核验";
}

function renderAlumniReview() {
  if (!$("#alumniReview")) return;
  renderAlumniReviewFilters();
  const allApplications = state.serverMode ? (state.reviewApplications || []) : (state.alumni ? [state.alumni] : []);
  const pendingCount = allApplications.filter(item => item.status === "pending").length;
  const visibleApplications = filteredAlumniApplications();
  $("#reviewCount").textContent = `${pendingCount} 项待处理 · ${visibleApplications.length}/${allApplications.length}`;
  if ($("#alumniReviewResultCount")) {
    $("#alumniReviewResultCount").textContent = `${visibleApplications.length} / ${allApplications.length} 条`;
  }
  renderAlumniReviewGovernance(visibleApplications, allApplications.length);
  $("#alumniReview").innerHTML = visibleApplications.length ? visibleApplications.map(item => `
    <article class="review-card">
      <header><h3>${escapeHtml(item.name)}</h3><span>${escapeHtml(alumniReviewStatusLabel(item.status))}</span></header>
      <div class="review-meta">
        <span>毕业年份：${escapeHtml(item.graduationYear)}</span>
        <span>院系：${escapeHtml(item.college)}</span>
        <span>专业：${escapeHtml(item.major)}</span>
        <span>证明：${escapeHtml(item.proofName || item.proofFileId || "已上传")}</span>
        <span>联合认证：${escapeHtml(alumniAssociationLabel(item.associationStatus))}</span>
        <span>联系方式：${escapeHtml(item.phone || item.email || "")}</span>
      </div>
      <div class="review-actions">
        ${state.serverMode && item.proofFileId ? `<a class="secondary-button" href="${escapeHtml(apiUrl(`/api/admin/files/${encodeURIComponent(item.proofFileId)}`))}" target="_blank" rel="noopener"><i data-lucide="file-search"></i>查看证明</a>` : ""}
        ${item.status === "pending" ? `<button class="primary-button" data-approve-alumni="${item.id}"><i data-lucide="badge-check"></i>审核通过</button>
        <button class="secondary-button" data-reject-alumni="${item.id}">退回申请</button>` : `<span class="review-note">${escapeHtml(item.approvedAt || item.rejectedAt || item.rejectionReason || "已归档")}</span>`}
      </div>
    </article>`).join("") : `<div class="review-empty">当前筛选条件下没有校友认证申请</div>`;
  refreshIcons();
}

function renderAlumniReviewGovernance(applications, total) {
  const panel = $("#alumniReviewGovernance");
  if (!panel) return;
  const statusCounts = countBy(applications, item => item.status || "pending");
  const associationCounts = countBy(applications, item => item.associationStatus || "not_configured");
  const pendingTokens = (statusCounts.pending || 0) * 1000000;
  panel.innerHTML = `
    <section>
      <strong>当前范围</strong>
      <span>${applications.length}/${total} 条申请</span>
    </section>
    <section>
      <strong>审核状态</strong>
      <span>待审 ${statusCounts.pending || 0} · 通过 ${statusCounts.approved || 0} · 退回 ${statusCounts.rejected || 0}</span>
    </section>
    <section>
      <strong>联合认证</strong>
      <span>通过 ${associationCounts.verified || 0} · 未接 ${associationCounts.not_configured || 0} · 异常 ${associationCounts.error || 0}</span>
    </section>
    <section>
      <strong>权益预估</strong>
      <span>待审最高 ${pendingTokens.toLocaleString("zh-CN")} tokens</span>
    </section>`;
}

function renderMetrics() {
  const metrics = state.metrics;
  if (!$("#metricsList")) return;
  if ($("#metricsWindow")) $("#metricsWindow").value = String(metrics?.windowDays || state.metricsWindow || "7");
  if (!metrics) {
    $("#metricsList").innerHTML = `<div class="review-empty">暂无运行统计</div>`;
    return;
  }
  const totals = metrics.totals;
  const quota = metrics.quota || {};
  $("#metricsList").innerHTML = `
    <div class="metric-window-note">统计周期：近 ${Number(metrics.windowDays || 7).toLocaleString("zh-CN")} 天</div>
    <div class="metrics-grid">
      <span><strong>${totals.agentRuns}</strong><small>智能体运行</small></span>
      <span><strong>${totals.workflowRuns}</strong><small>工作流运行</small></span>
      <span><strong>${Number(totals.modelRuns || 0).toLocaleString("zh-CN")}</strong><small>模型调用</small></span>
      <span><strong>${Number(totals.modelFailures || 0).toLocaleString("zh-CN")}</strong><small>调用失败</small></span>
      <span><strong>${Number(totals.chargedTokens).toLocaleString("zh-CN")}</strong><small>Token 消耗</small></span>
      <span><strong>${totals.artifacts}</strong><small>成果文件</small></span>
      <span><strong>${Number(quota.activeGrants || 0).toLocaleString("zh-CN")}</strong><small>活跃权益</small></span>
      <span><strong>${Number(quota.remainingTokens || 0).toLocaleString("zh-CN")}</strong><small>剩余额度</small></span>
    </div>
    <div class="metrics-block"><strong>校友权益</strong>
      <div class="metric-row"><span>权益状态</span><small>活跃 ${Number(quota.activeGrants || 0).toLocaleString("zh-CN")} · 过期 ${Number(quota.expiredGrants || 0).toLocaleString("zh-CN")} · 7天内到期 ${Number(quota.expiringSoon || 0).toLocaleString("zh-CN")}</small></div>
      <div class="metric-row"><span>额度池</span><small>总发放 ${Number(quota.totalTokens || 0).toLocaleString("zh-CN")} · 剩余 ${Number(quota.remainingTokens || 0).toLocaleString("zh-CN")} · 预留 ${Number(quota.reservedTokens || 0).toLocaleString("zh-CN")}</small></div>
    </div>
    <div class="metrics-block"><strong>热门智能体</strong>${metricItems(metrics.topAgents)}</div>
    <div class="metrics-block"><strong>热门工作流</strong>${metricItems(metrics.topWorkflows)}</div>
    <div class="metrics-block"><strong>最近运行</strong>${(metrics.recentRuns || []).map(run => `
      <div class="metric-row"><span>${escapeHtml(run.type)} · ${escapeHtml(run.name)}</span><small>${escapeHtml(run.route || "route")} · ${Number(run.charged || 0).toLocaleString("zh-CN")} tokens</small></div>
    `).join("") || '<p class="metric-empty">暂无运行记录</p>'}</div>`;
}

async function refreshMetrics() {
  if (!state.serverMode || !["super_admin", "agent_admin", "alumni_reviewer"].includes(state.currentUser?.role)) return;
  const { metrics } = await api(`/api/admin/metrics?days=${encodeURIComponent(state.metricsWindow)}`).catch(() => ({ metrics: null }));
  state.metrics = metrics;
  renderMetrics();
}

function metricItems(items = []) {
  return items.length ? items.map(item => `
    <div class="metric-row"><span>${escapeHtml(item.name)}</span><small>${item.count} 次</small></div>
  `).join("") : '<p class="metric-empty">暂无数据</p>';
}

function filteredModelRuns() {
  const query = (state.modelRunQuery || "").trim().toLowerCase();
  return (state.modelRuns || []).filter(run => {
    const status = run.status === "failed" ? "failed" : "success";
    const route = run.actualRoute || run.requestedRoute || "";
    const haystack = [
      run.workflowTitle,
      run.agentName,
      run.source,
      run.routeName,
      run.model,
      run.actualRoute,
      run.requestedRoute,
      run.username,
      run.displayName,
      run.error,
      run.fallbackUsed ? "备用 fallback" : ""
    ].filter(Boolean).join(" ").toLowerCase();
    return (state.modelRunStatus === "all" || status === state.modelRunStatus)
      && (state.modelRunRoute === "all" || route === state.modelRunRoute)
      && (!query || haystack.includes(query));
  });
}

function renderModelRunFilters() {
  if (!$("#modelRunRouteFilter")) return;
  const routes = [...new Set((state.modelRuns || []).map(run => run.actualRoute || run.requestedRoute).filter(Boolean))].sort();
  $("#modelRunRouteFilter").innerHTML = [
    `<option value="all">全部路由</option>`,
    ...routes.map(route => `<option value="${escapeHtml(route)}">${escapeHtml(route)}</option>`)
  ].join("");
  if (!routes.includes(state.modelRunRoute)) state.modelRunRoute = "all";
  $("#modelRunRouteFilter").value = state.modelRunRoute;
  $("#modelRunStatusFilter").value = state.modelRunStatus;
  $("#modelRunSearch").value = state.modelRunQuery;
}

function renderModelRuns() {
  if (!$("#modelRunList")) return;
  renderModelRunFilters();
  const runs = filteredModelRuns();
  if ($("#modelRunResultCount")) {
    $("#modelRunResultCount").textContent = `${runs.length} / ${(state.modelRuns || []).length} 条`;
  }
  renderModelRunGovernance(runs, (state.modelRuns || []).length);
  $("#modelRunList").innerHTML = runs.length ? runs.slice(0, 24).map(run => {
    const target = run.workflowTitle || run.agentName || run.source || "chat";
    const route = run.actualRoute || run.requestedRoute || "route";
    const status = run.status === "failed" ? "failed" : "success";
    const usage = `${Number(run.inputTokens || 0) + Number(run.outputTokens || 0)} tokens`;
    return `
      <div class="model-run-row ${status}">
        <span><strong>${escapeHtml(target)}</strong><small>${escapeHtml(route)} · ${escapeHtml(run.model || run.routeName || "")}${run.fallbackUsed ? " · 备用" : ""}</small></span>
        <span><strong>${status === "failed" ? "失败" : "成功"}</strong><small>${Number(run.durationMs || 0)} ms · ${usage}</small></span>
      </div>
    `;
  }).join("") : `<div class="review-empty">暂无模型调用记录</div>`;
}

function renderModelRunGovernance(runs, total) {
  const panel = $("#modelRunGovernance");
  if (!panel) return;
  const failed = runs.filter(run => run.status === "failed").length;
  const success = runs.length - failed;
  const fallback = runs.filter(run => run.fallbackUsed).length;
  const charged = runs.reduce((sum, run) => sum + Number(run.chargedTokens || 0), 0);
  const averageDuration = runs.length
    ? Math.round(runs.reduce((sum, run) => sum + Number(run.durationMs || 0), 0) / runs.length)
    : 0;
  panel.innerHTML = `
    <section>
      <strong>当前范围</strong>
      <span>${runs.length}/${total} 条调用</span>
    </section>
    <section>
      <strong>调用状态</strong>
      <span>成功 ${success} · 失败 ${failed}</span>
    </section>
    <section>
      <strong>备用链路</strong>
      <span>${fallback} 次触发备用模型</span>
    </section>
    <section>
      <strong>消耗与延迟</strong>
      <span>${charged.toLocaleString("zh-CN")} tokens · 均值 ${averageDuration} ms</span>
    </section>`;
}

function exportModelRuns() {
  if (state.serverMode) {
    window.open(apiUrl("/api/admin/model-runs.csv"), "_blank", "noopener,noreferrer");
    return;
  }
  const rows = [["createdAt", "status", "source", "route", "model", "tokens", "durationMs"]];
  for (const run of state.modelRuns || []) {
    rows.push([
      run.createdAt || "",
      run.status || "",
      run.source || "",
      run.actualRoute || run.requestedRoute || "",
      run.model || "",
      Number(run.inputTokens || 0) + Number(run.outputTokens || 0),
      run.durationMs || 0
    ]);
  }
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `xiaozhuang-model-runs-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportProviders() {
  if (state.serverMode) {
    window.open(apiUrl("/api/admin/providers.csv"), "_blank", "noopener,noreferrer");
    return;
  }
  const rows = [["id", "name", "domestic", "type", "configured", "model", "envNames", "missingEnv", "hasDefaultUrl", "hasDefaultModel", "fallbackRoutes"]];
  const statuses = Object.fromEntries((state.providerStatuses || []).map(item => [item.id, item]));
  for (const route of MODEL_ROUTES) {
    const provider = statuses[route.id] || {};
    rows.push([
      route.id,
      route.name,
      route.domestic === false ? "no" : "yes",
      provider.type || "",
      provider.configured ? "yes" : "no",
      provider.model || "",
      (provider.envNames || []).join("; "),
      (provider.missingEnv || []).join("; "),
      provider.hasDefaultUrl ? "yes" : "no",
      provider.hasDefaultModel ? "yes" : "no",
      (provider.fallbacks || []).join("; ")
    ]);
  }
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `xiaozhuang-provider-status-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportTokenLedger() {
  if (state.serverMode) {
    window.open(apiUrl("/api/admin/token-ledger.csv"), "_blank", "noopener,noreferrer");
    return;
  }
  const rows = [["time", "description", "amount", "model"]];
  for (const item of state.quota.ledger || []) {
    rows.push([item.time || item.createdAt || "", item.description || "", item.amount || 0, item.model || ""]);
  }
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `xiaozhuang-token-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function exportAuditLogs() {
  if (state.serverMode) {
    window.open(apiUrl("/api/admin/audit-logs.csv"), "_blank", "noopener,noreferrer");
    return;
  }
  const rows = [["at", "action", "targetId", "actor", "role", "meta"]];
  for (const log of state.auditLogs || []) {
    rows.push([
      log.at || "",
      log.action || "",
      log.targetId || "",
      log.actor?.displayName || log.actor?.username || "",
      log.actor?.role || "",
      JSON.stringify(log.meta || {})
    ]);
  }
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `xiaozhuang-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportUsers() {
  if (state.serverMode) {
    window.open(apiUrl("/api/admin/users.csv"), "_blank", "noopener,noreferrer");
    return;
  }
  const rows = [["createdAt", "updatedAt", "id", "username", "displayName", "role", "department", "status", "ssoProvider", "email", "mustChangePassword"]];
  for (const user of state.users || []) {
    rows.push([
      user.createdAt || "",
      user.updatedAt || "",
      user.id || "",
      user.username || "",
      user.displayName || "",
      user.role || "",
      user.department || "",
      user.status || "active",
      user.ssoProvider || "",
      user.email || "",
      user.mustChangePassword ? "yes" : "no"
    ]);
  }
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `xiaozhuang-users-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportVersionHistory() {
  if (state.serverMode) {
    window.open(apiUrl("/api/admin/version-history.csv"), "_blank", "noopener,noreferrer");
    return;
  }
  showToast("连接服务端后可导出版本历史台账");
}

function exportAgentQuality() {
  if (state.serverMode) {
    window.open(apiUrl("/api/admin/agents-quality.csv"), "_blank", "noopener,noreferrer");
    return;
  }
  const rows = [[
    "id",
    "name",
    "category",
    "owner",
    "status",
    "mode",
    "routeHint",
    "routeName",
    "routeConfigured",
    "routeMissingEnv",
    "routeEnvNames",
    "fallbackRoutes",
    "qualityStatus",
    "qualityIssueCount",
    "qualityIssues",
    "descriptionLength",
    "systemPromptLength",
    "promptCount",
    "hasLogo",
    "url",
    "cozeUrl",
    "apiUrl",
    "updatedAt"
  ]];
  for (const agent of agents) {
    const issues = agentQualityIssues(agent);
    const provider = providerStatusForRoute(agent.routeHint);
    rows.push([
      agent.id || "",
      agent.name || "",
      agent.category || "",
      agent.owner || "",
      agent.status || "",
      agent.mode || "",
      agent.routeHint || "",
      routeLabel(agent.routeHint),
      provider?.configured ? "yes" : "no",
      (provider?.missingEnv || []).join("; "),
      (provider?.envNames || []).join("; "),
      (provider?.fallbacks || []).join("; "),
      issues.length ? "needs_attention" : "ready",
      issues.length,
      issues.join("; "),
      String(agent.description || "").length,
      String(agent.systemPrompt || "").length,
      Array.isArray(agent.prompts) ? agent.prompts.length : 0,
      agent.logoText || agent.logoImage ? "yes" : "no",
      agent.url || "",
      agent.cozeUrl || "",
      agent.apiUrl || "",
      agent.updatedAt || ""
    ]);
  }
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `xiaozhuang-agents-quality-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportCozeTemplate() {
  const rows = [[
    "id",
    "name",
    "category",
    "currentCozeUrl",
    "cozeUrl",
    "owner",
    "note"
  ]];
  for (const agent of [...agents].sort((a, b) => String(a.id || "").localeCompare(String(b.id || ""), "zh-CN", { numeric: true }))) {
    rows.push([
      agent.id || "",
      agent.name || "",
      agent.category || "",
      agent.cozeUrl || "",
      "",
      agent.owner || "",
      "Fill cozeUrl with the published Coze agent page, for example https://www.coze.cn/store/agent/..."
    ]);
  }
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `xiaozhuang-coze-links-template-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast(`已导出 ${agents.length} 个智能体的 Coze 链接模板`);
}

function exportFeedback() {
  if (state.serverMode) {
    window.open(apiUrl("/api/admin/feedback.csv"), "_blank", "noopener,noreferrer");
    return;
  }
  const rows = [["createdAt", "updatedAt", "type", "content", "email", "status", "assignee", "note"]];
  for (const item of state.feedbackItems || []) {
    rows.push([
      item.createdAt || "",
      item.updatedAt || "",
      item.type || "",
      item.content || "",
      item.email || "",
      item.status || "",
      item.assignee || "",
      item.note || ""
    ]);
  }
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `xiaozhuang-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportAlumniApplications() {
  if (state.serverMode) {
    window.open(apiUrl("/api/admin/alumni/applications.csv"), "_blank", "noopener,noreferrer");
    return;
  }
  const rows = [["submittedAt", "status", "name", "graduationYear", "college", "major", "phone", "email", "proofFileId"]];
  const items = state.reviewApplications?.length ? state.reviewApplications : (state.alumni ? [state.alumni] : []);
  for (const item of items) {
    rows.push([
      item.submittedAt || item.createdAt || "",
      item.status || "",
      item.name || "",
      item.graduationYear || "",
      item.college || "",
      item.major || "",
      item.phone || "",
      item.email || "",
      item.proofFileId || ""
    ]);
  }
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `xiaozhuang-alumni-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportArtifacts() {
  if (state.serverMode) {
    window.open(apiUrl("/api/admin/artifacts.csv"), "_blank", "noopener,noreferrer");
    return;
  }
  const rows = [["createdAt", "id", "title", "type", "downloadType", "workflowId", "workflowTitle", "downloadUrl"]];
  for (const item of state.artifacts || []) {
    rows.push([
      item.createdAt || "",
      item.id || "",
      item.title || "",
      item.type || "",
      item.downloadType || "",
      item.workflowId || "",
      item.workflowTitle || "",
      item.downloadUrl || ""
    ]);
  }
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `xiaozhuang-artifacts-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportReadiness() {
  const readiness = state.readiness;
  if (!readiness) return showToast("连接服务端后可导出上线自检");
  const checks = filteredReadinessChecks();
  if (!checks.length) return showToast("当前筛选范围没有自检项");
  const rows = [["generatedAt", "level", "levelLabel", "group", "owner", "name", "detail"]];
  for (const item of checks) {
    rows.push([
      readiness.generatedAt || new Date().toISOString(),
      item.level || "",
      readinessLevelLabel(item.level),
      item.group || "",
      item.owner || "",
      item.name || "",
      item.detail || ""
    ]);
  }
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  const ownerPart = state.readinessOwner === "all" ? "all-owners" : state.readinessOwner.replace(/[^\w\u4e00-\u9fa5-]+/g, "-");
  anchor.download = `xiaozhuang-readiness-${state.readinessLevel}-${ownerPart}-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast(`已导出 ${checks.length} 项上线自检`);
}

function renderReadiness() {
  if (!$("#readinessList")) return;
  const readiness = state.readiness;
  if (!readiness) {
    $("#readinessSummary").textContent = "未连接";
    const readinessCount = $("#readinessResultCount");
    if (readinessCount) readinessCount.textContent = "0 项";
    $("#readinessList").innerHTML = `<div class="review-empty">连接服务端后显示上线自检结果</div>`;
    return;
  }
  const summary = readiness.summary || { ok: 0, warn: 0, fail: 0 };
  $("#readinessSummary").textContent = `${summary.fail} 阻断 / ${summary.warn} 提醒`;
  renderReadinessOwnerFilter();
  const checks = filteredReadinessChecks();
  const readinessCount = $("#readinessResultCount");
  if (readinessCount) readinessCount.textContent = `显示 ${checks.length} / ${(readiness.checks || []).length} 项`;
  $("#readinessList").innerHTML = checks.map(item => `
    <div class="readiness-row ${escapeHtml(item.level)}">
      <span class="readiness-dot"></span>
      <span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.group)} · ${escapeHtml(item.owner || "平台项目负责人")} · ${escapeHtml(item.detail)}</small></span>
      <b>${readinessLevelLabel(item.level)}</b>
    </div>
  `).join("") || `<div class="review-empty">暂无自检项目</div>`;
}

function filteredReadinessChecks() {
  const checks = state.readiness?.checks || [];
  const query = state.readinessQuery.trim().toLowerCase();
  return checks.filter(item => {
    const levelMatches = state.readinessLevel === "all" || item.level === state.readinessLevel;
    const ownerMatches = state.readinessOwner === "all" || (item.owner || "平台项目负责人") === state.readinessOwner;
    const haystack = [item.name, item.group, item.owner, item.detail, readinessLevelLabel(item.level)].join(" ").toLowerCase();
    return levelMatches && ownerMatches && (!query || haystack.includes(query));
  });
}

function renderReadinessOwnerFilter() {
  const select = $("#readinessOwnerFilter");
  if (!select) return;
  const owners = [...new Set((state.readiness?.checks || []).map(item => item.owner || "平台项目负责人"))]
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
  if (state.readinessOwner !== "all" && !owners.includes(state.readinessOwner)) state.readinessOwner = "all";
  const nextHtml = `<option value="all">全部责任方</option>${owners.map(owner => `<option value="${escapeHtml(owner)}">${escapeHtml(owner)}</option>`).join("")}`;
  if (select.innerHTML !== nextHtml) select.innerHTML = nextHtml;
  select.value = state.readinessOwner;
}

function readinessLevelLabel(level) {
  return { ok: "通过", warn: "提醒", fail: "阻断" }[level] || level;
}

function renderBrandingForm() {
  const form = $("#brandingForm");
  if (!form) return;
  const branding = state.branding || {};
  for (const field of ["platformName", "schoolName", "logoUrl", "heroImageUrl", "primaryColor", "goldColor", "assetStatus", "authorizationNote"]) {
    if (form.elements[field]) form.elements[field].value = branding[field] || "";
  }
}

async function saveBranding(event) {
  event.preventDefault();
  if (!state.serverMode) return showToast("请连接服务端后维护品牌素材");
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const { branding } = await api("/api/admin/branding", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    state.branding = branding;
    applyBranding();
    renderBrandingForm();
    await syncAdminData();
    showToast("品牌配置已保存");
  } catch (error) {
    showToast(`品牌配置保存失败：${error.message}`);
  }
}

function filteredAuditLogs() {
  const query = (state.auditQuery || "").trim().toLowerCase();
  return (state.auditLogs || []).filter(log => {
    const action = log.action || "";
    const metaText = Object.entries(log.meta || {}).map(([key, value]) => `${key}:${String(value)}`).join(" ");
    const haystack = [
      auditActionLabel(action),
      action,
      log.targetId,
      log.actor?.displayName,
      log.actor?.username,
      log.actor?.role,
      metaText
    ].filter(Boolean).join(" ").toLowerCase();
    return (state.auditAction === "all" || action === state.auditAction)
      && (!query || haystack.includes(query));
  });
}

function renderAuditFilters() {
  if (!$("#auditActionFilter")) return;
  const actions = [...new Set((state.auditLogs || []).map(log => log.action).filter(Boolean))].sort();
  $("#auditActionFilter").innerHTML = [
    `<option value="all">全部动作</option>`,
    ...actions.map(action => `<option value="${escapeHtml(action)}">${escapeHtml(auditActionLabel(action))}</option>`)
  ].join("");
  if (!actions.includes(state.auditAction)) state.auditAction = "all";
  $("#auditActionFilter").value = state.auditAction;
  $("#auditSearch").value = state.auditQuery;
}

function renderAuditLogs() {
  if (!$("#auditLogList")) return;
  renderAuditFilters();
  const logs = filteredAuditLogs();
  if ($("#auditResultCount")) {
    $("#auditResultCount").textContent = `${logs.length} / ${(state.auditLogs || []).length} 条`;
  }
  renderAuditGovernance(logs, (state.auditLogs || []).length);
  $("#auditLogList").innerHTML = logs.length ? logs.map(log => {
    const meta = Object.entries(log.meta || {})
      .slice(0, 3)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(" · ");
    return `
      <div class="audit-row">
        <span><strong>${escapeHtml(auditActionLabel(log.action))}</strong><small>${escapeHtml(log.targetId || "platform")}</small></span>
        <span><strong>${escapeHtml(log.actor?.displayName || log.actor?.username || "系统")}</strong><small>${escapeHtml(roleLabel(log.actor?.role || "system"))}</small></span>
        <span><strong>${new Date(log.at).toLocaleString("zh-CN")}</strong><small>${escapeHtml(meta || "已记录")}</small></span>
      </div>`;
  }).join("") : `<div class="review-empty">暂无审计记录</div>`;
}

function renderAuditGovernance(logs, total) {
  const panel = $("#auditGovernance");
  if (!panel) return;
  const actors = new Set(logs.map(log => log.actor?.username || log.actorId).filter(Boolean));
  const systemCount = logs.filter(log => !(log.actor?.username || log.actorId)).length;
  const riskCount = logs.filter(log => /(failed|locked|reject|delete|restore|cleanup|error)/i.test(log.action || "")).length;
  const actionCounts = countBy(logs, log => log.action || "unknown");
  const topActions = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1] || auditActionLabel(a[0]).localeCompare(auditActionLabel(b[0]), "zh-CN"))
    .slice(0, 4)
    .map(([action, count]) => `${escapeHtml(auditActionLabel(action))} ${count}`)
    .join(" · ");
  panel.innerHTML = `
    <section>
      <strong>当前范围</strong>
      <span>${logs.length}/${total} 条日志</span>
    </section>
    <section>
      <strong>动作分布</strong>
      <span>${topActions || "暂无日志"}</span>
    </section>
    <section>
      <strong>操作者</strong>
      <span>${actors.size} 个账号 · 系统 ${systemCount} 条</span>
    </section>
    <section>
      <strong>风险线索</strong>
      <span>${riskCount} 条失败/删除/恢复相关记录</span>
    </section>`;
}

function filteredFeedbackItems() {
  const query = (state.feedbackQuery || "").trim().toLowerCase();
  return (state.feedbackItems || []).filter(item => {
    const haystack = [
      item.type,
      item.content,
      item.email,
      item.status,
      item.assignee,
      item.note,
      item.userName,
      item.displayName,
      item.username
    ].filter(Boolean).join(" ").toLowerCase();
    return (state.feedbackStatus === "all" || item.status === state.feedbackStatus)
      && (state.feedbackType === "all" || item.type === state.feedbackType)
      && (!query || haystack.includes(query));
  });
}

function renderFeedbackFilters() {
  if (!$("#feedbackTypeFilter")) return;
  const types = [...new Set((state.feedbackItems || []).map(item => item.type).filter(Boolean))].sort();
  $("#feedbackTypeFilter").innerHTML = [
    `<option value="all">全部类型</option>`,
    ...types.map(type => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`)
  ].join("");
  if (!types.includes(state.feedbackType)) state.feedbackType = "all";
  $("#feedbackTypeFilter").value = state.feedbackType;
  $("#feedbackStatusFilter").value = state.feedbackStatus;
  $("#feedbackSearch").value = state.feedbackQuery;
}

function renderFeedbackManagement() {
  if (!$("#feedbackManagement")) return;
  renderFeedbackFilters();
  const items = filteredFeedbackItems();
  if ($("#feedbackResultCount")) {
    $("#feedbackResultCount").textContent = `${items.length} / ${(state.feedbackItems || []).length} 条`;
  }
  renderFeedbackGovernance(items, (state.feedbackItems || []).length);
  $("#feedbackManagement").innerHTML = items.length ? items.slice(0, 24).map(item => `
    <div class="feedback-row">
      <span><strong>${escapeHtml(item.type)}</strong><small>${escapeHtml(item.userName || item.email || "匿名用户")} · ${new Date(item.createdAt).toLocaleString("zh-CN")}</small></span>
      <span><strong>${escapeHtml(item.content)}</strong><small>${escapeHtml(item.note || "暂无处理备注")}</small></span>
      <b class="status-badge ${item.status === "closed" ? "offline" : item.status === "triaged" ? "draft" : "published"}">${feedbackStatusLabel(item.status)}</b>
      <span class="row-actions">
        <button class="icon-button" data-feedback-status="${escapeHtml(item.id)}" data-status="triaged" title="标记处理中" aria-label="标记反馈处理中"><i data-lucide="list-checks"></i></button>
        <button class="icon-button" data-feedback-status="${escapeHtml(item.id)}" data-status="closed" title="关闭反馈" aria-label="关闭反馈"><i data-lucide="check-check"></i></button>
      </span>
    </div>
  `).join("") : `<div class="review-empty">暂无用户反馈</div>`;
}

function renderFeedbackGovernance(items, total) {
  const panel = $("#feedbackGovernance");
  if (!panel) return;
  const statusCounts = countBy(items, item => item.status || "open");
  const typeCounts = countBy(items, item => item.type || "其他");
  const contacted = items.filter(item => item.email).length;
  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"))
    .slice(0, 4)
    .map(([type, count]) => `${escapeHtml(type)} ${count}`)
    .join(" · ");
  panel.innerHTML = `
    <section>
      <strong>当前范围</strong>
      <span>${items.length}/${total} 条反馈</span>
    </section>
    <section>
      <strong>处理状态</strong>
      <span>待处理 ${statusCounts.open || 0} · 处理中 ${statusCounts.triaged || 0} · 已关闭 ${statusCounts.closed || 0}</span>
    </section>
    <section>
      <strong>类型分布</strong>
      <span>${topTypes || "暂无反馈"}</span>
    </section>
    <section>
      <strong>联系信息</strong>
      <span>留邮箱 ${contacted} · 匿名 ${items.length - contacted}</span>
    </section>`;
}

function feedbackStatusLabel(status) {
  return { open: "待处理", triaged: "处理中", closed: "已关闭" }[status] || status;
}

async function updateFeedbackStatus(id, status) {
  const item = state.feedbackItems.find(entry => entry.id === id);
  if (!item) return;
  const note = status === "closed" ? window.prompt("处理备注", item.note || "已处理") : (item.note || "");
  if (status === "closed" && note === null) return;
  try {
    const result = await api(`/api/admin/feedback/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ ...item, status, note })
    });
    state.feedbackItems = state.feedbackItems.map(entry => entry.id === id ? result.item : entry);
    renderFeedbackManagement();
    await syncAdminData();
    showToast("反馈状态已更新");
  } catch (error) {
    showToast(error.message);
  }
}

async function testProvider(id) {
  if (!state.serverMode) return showToast("请连接服务端后测试模型");
  try {
    showToast("正在测试模型连接…");
    const result = await testProviderRequest(id);
    window.alert([
      `模型：${result.provider.name}`,
      `实际模型：${result.model || "未返回"}`,
      `Token：${Number(result.usage?.inputTokens || 0) + Number(result.usage?.outputTokens || 0)}`,
      "",
      result.answer
    ].join("\n"));
    await syncAdminData();
  } catch (error) {
    const route = error.data?.route;
    showToast(route ? `${route.name || route.id} 测试失败：${error.message}` : `模型测试失败：${error.message}`);
  }
}

function testProviderRequest(id) {
  return api(`/api/admin/providers/${encodeURIComponent(id)}/test`, {
    method: "POST",
    body: JSON.stringify({ message: "请用一句话确认模型连接测试成功。" })
  });
}

async function bulkTestConfiguredProviders() {
  if (!state.serverMode) return showToast("请连接服务端后批量测试模型");
  const configured = (state.providerStatuses || []).filter(provider => provider.configured);
  if (!configured.length) return showToast("暂无已配置模型可测试");
  if (!window.confirm(`将依次测试 ${configured.length} 个已配置模型供应商，测试不扣用户额度。继续吗？`)) return;
  showToast(`正在批量测试 ${configured.length} 个模型…`);
  const results = [];
  for (const provider of configured) {
    try {
      const result = await testProviderRequest(provider.id);
      results.push({ id: provider.id, name: result.provider?.name || provider.name || provider.id, ok: true });
    } catch (error) {
      results.push({ id: provider.id, name: provider.name || provider.id, ok: false, error: error.message });
    }
  }
  await syncAdminData();
  const success = results.filter(item => item.ok).length;
  const failed = results.length - success;
  const failedNames = results.filter(item => !item.ok).map(item => `${item.name}：${item.error}`).slice(0, 5).join("\n");
  window.alert([
    `模型批量测试完成`,
    `通过：${success}`,
    `失败：${failed}`,
    failedNames ? `\n失败明细：\n${failedNames}` : ""
  ].filter(Boolean).join("\n"));
}

function auditActionLabel(action) {
  return {
    "agent.create": "新建智能体",
    "agent.update": "更新智能体",
    "agent.delete": "删除智能体",
    "agent.duplicate": "复制智能体",
    "agent.import": "导入智能体",
    "agent.coze-links": "批量更新 Coze 链接",
    "agent.run": "运行智能体",
    "agent.test": "测试智能体",
    "agent.bulk-status": "批量更新智能体状态",
    "agent.bulk-route": "批量更新智能体模型",
    "agent.connection.test": "\u68c0\u6d4b\u667a\u80fd\u4f53\u63a5\u5165",
    "agent.restore": "恢复智能体版本",
    "workflow.create": "新建工作流",
    "workflow.update": "更新工作流",
    "workflow.delete": "删除工作流",
    "workflow.duplicate": "复制工作流",
    "workflow.import": "导入工作流",
    "workflow.run": "运行工作流",
    "workflow.test": "测试工作流",
    "workflow.restore": "恢复工作流版本",
    "version-history.export": "导出版本历史",
    "token-ledger.export": "导出Token账本",
    "token.adjust": "人工调整Token额度",
    "model-runs.export": "导出模型调用台账",
    "auth.login.failed": "登录失败",
    "auth.login.locked": "登录限流",
    "auth.sso.start": "发起统一认证",
    "auth.sso.login": "统一认证登录",
    "auth.sso.failed": "统一认证失败",
    "alumni.submit": "提交校友认证",
    "auth.password.change": "修改登录密码",
    "branding.update": "更新品牌素材",
    "alumni.association.verify": "校友会联合核验",
    "alumni.approve": "校友认证通过",
    "alumni.reject": "校友认证退回",
    "alumni.proof.view": "查看校友证明",
    "alumni.export": "导出校友认证",
    "file.upload": "上传文件",
    "file.upload.rejected": "拒绝上传",
    "platform.backup": "导出平台备份",
    "platform.restore": "恢复平台备份",
    "platform.maintenance": "运行平台维护",
    "artifact.delete": "删除成果文件",
    "artifact.cleanup": "批量清理成果",
    "artifact.export": "导出成果清单",
    "catalog.reset": "恢复默认目录",
    "feedback.submit": "提交反馈",
    "feedback.update": "处理反馈",
    "feedback.export": "导出反馈",
    "provider.test": "测试模型连接",
    "provider.export": "导出模型配置",
    "user.export": "导出账号台账",
    "user.create": "新建账号",
    "user.update": "更新账号"
  }[action] || action;
}

function roleLabel(role) {
  return {
    super_admin: "超级管理员",
    agent_admin: "应用管理员",
    alumni_reviewer: "校友审核员",
    teacher: "教师用户"
  }[role] || role;
}

function renderUserManagement() {
  if (!$("#userManagement")) return;
  const users = filteredUsers();
  const userCount = $("#userResultCount");
  if (userCount) userCount.textContent = `显示 ${users.length} / ${(state.users || []).length} 个`;
  renderUserGovernance(users, (state.users || []).length);
  const roleOptions = ["super_admin", "agent_admin", "alumni_reviewer", "teacher"]
    .map(role => `<option value="${role}">${roleLabel(role)}</option>`).join("");
  $("#userManagement").innerHTML = users.length ? users.map(user => `
    <div class="user-row">
      <span><strong>${escapeHtml(user.displayName)}</strong><small>${escapeHtml(user.username)} · ${escapeHtml(user.department || "未设置部门")}${user.ssoProvider ? " · 统一认证" : ""}</small></span>
      <select data-user-role="${escapeHtml(user.id)}">${roleOptions}</select>
      <b class="status-badge ${user.status === "disabled" ? "offline" : "published"}">${user.status === "disabled" ? "已停用" : "启用"}</b>
      <span class="row-actions">
        <button class="icon-button" data-save-user="${escapeHtml(user.id)}" title="保存角色" aria-label="保存 ${escapeHtml(user.displayName)}"><i data-lucide="save"></i></button>
        <button class="icon-button" data-toggle-user="${escapeHtml(user.id)}" title="${user.status === "disabled" ? "启用" : "停用"}" aria-label="${user.status === "disabled" ? "启用" : "停用"} ${escapeHtml(user.displayName)}"><i data-lucide="${user.status === "disabled" ? "user-check" : "user-x"}"></i></button>
        <button class="icon-button" data-reset-user="${escapeHtml(user.id)}" title="重置密码" aria-label="重置 ${escapeHtml(user.displayName)} 密码"><i data-lucide="key-round"></i></button>
      </span>
    </div>
  `).join("") : `<div class="review-empty">仅超级管理员可维护账号</div>`;
  users.forEach(user => {
    const select = $(`[data-user-role="${CSS.escape(user.id)}"]`);
    if (select) select.value = user.role;
  });
}

function filteredUsers() {
  const query = state.userQuery.trim().toLowerCase();
  return (state.users || []).filter(user => {
    const status = user.status || "active";
    const roleMatches = state.userRole === "all" || user.role === state.userRole;
    const statusMatches = state.userStatus === "all" || status === state.userStatus;
    const haystack = [
      user.username,
      user.displayName,
      user.department,
      user.role,
      roleLabel(user.role),
      status === "disabled" ? "disabled 已停用" : "active 启用",
      user.ssoProvider ? "sso unified 统一认证" : "local 本地账号",
      user.email || ""
    ].join(" ").toLowerCase();
    return roleMatches && statusMatches && (!query || haystack.includes(query));
  });
}

function renderUserGovernance(users, total) {
  const panel = $("#userGovernance");
  if (!panel) return;
  const statusCounts = countBy(users, user => user.status || "active");
  const roleCounts = countBy(users, user => user.role || "teacher");
  const ssoCount = users.filter(user => user.ssoProvider).length;
  const localCount = users.length - ssoCount;
  const mustChange = users.filter(user => user.mustChangePassword).length;
  const roleSummary = Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1] || roleLabel(a[0]).localeCompare(roleLabel(b[0]), "zh-CN"))
    .slice(0, 4)
    .map(([role, count]) => `${escapeHtml(roleLabel(role))} ${count}`)
    .join(" · ");
  panel.innerHTML = `
    <section>
      <strong>当前范围</strong>
      <span>${users.length}/${total} 个账号</span>
    </section>
    <section>
      <strong>账号状态</strong>
      <span>启用 ${statusCounts.active || 0} · 停用 ${statusCounts.disabled || 0}</span>
    </section>
    <section>
      <strong>角色分布</strong>
      <span>${roleSummary || "暂无账号"}</span>
    </section>
    <section>
      <strong>认证与改密</strong>
      <span>统一认证 ${ssoCount} · 本地 ${localCount} · 待改密 ${mustChange}</span>
    </section>`;
}

function renderTokenAdjustmentForm() {
  const select = $("#tokenAdjustUser");
  if (!select) return;
  const users = (state.users || []).filter(user => (user.status || "active") === "active");
  select.innerHTML = users.length ? users.map(user =>
    `<option value="${escapeHtml(user.id)}">${escapeHtml(user.displayName || user.username)} · ${escapeHtml(user.username)}</option>`
  ).join("") : `<option value="">暂无可调整用户</option>`;
}

async function submitTokenAdjustment(event) {
  event.preventDefault();
  if (!state.serverMode) return showToast("请连接服务端后调整额度");
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.amount = Number(payload.amount);
  try {
    const result = await api("/api/admin/token-adjustments", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    if (result.user?.id === state.currentUser?.id) {
      state.quota = { ...state.quota, ...result.quota };
      updateQuotaDisplay();
      const ledger = await api("/api/alumni/ledger");
      state.quota.ledger = ledger.ledger;
      renderTokenLedger();
    }
    form.reset();
    await syncAdminData();
    showToast(`额度已调整 ${Number(payload.amount).toLocaleString("zh-CN")} tokens`);
  } catch (error) {
    showToast(error.message);
  }
}

async function saveUser(id, patch = {}) {
  const user = state.users.find(item => item.id === id);
  if (!user) return;
  try {
    const result = await api(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ ...user, ...patch })
    });
    state.users = state.users.map(item => item.id === id ? result.user : item);
    renderUserManagement();
    showToast("账号已更新");
  } catch (error) {
    showToast(error.message);
  }
}

async function createUser() {
  const username = window.prompt("新账号用户名（英文、数字、点、横线或下划线）");
  if (!username) return;
  const displayName = window.prompt("显示姓名", username) || username;
  const password = window.prompt("初始密码（至少 8 位）");
  if (!password) return;
  try {
    const result = await api("/api/admin/users", {
      method: "POST",
      body: JSON.stringify({ username, displayName, password, role: "teacher", department: "南京晓庄学院" })
    });
    state.users.push(result.user);
    renderUserManagement();
    showToast("账号已创建");
  } catch (error) {
    showToast(error.message);
  }
}

async function approveAlumni(id) {
  if (state.serverMode) {
    try {
      await api(`/api/admin/alumni/applications/${encodeURIComponent(id)}/approve`, { method: "POST", body: "{}" });
      await syncServerState();
      showToast("校友认证已通过，1,000,000 Token 已发放");
    } catch (error) {
      showToast(error.message);
    }
    return;
  }
  if (!state.alumni || state.alumni.status !== "pending") return;
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  state.alumni.status = "approved";
  state.alumni.approvedAt = now.toISOString();
  state.alumni.expiresAt = expires.toISOString();
  state.alumni.benefitGranted = true;
  state.quota = {
    total: 1000000,
    remaining: 1000000,
    expiresAt: expires.toISOString(),
    ledger: [{
      id: `grant-${Date.now()}`,
      time: now.toLocaleString("zh-CN", { hour12: false }),
      description: "晓庄校友认证权益发放",
      amount: 1000000,
      model: "国产模型通用"
    }]
  };
  localStorage.setItem(STORAGE.alumni, JSON.stringify(state.alumni));
  localStorage.setItem(STORAGE.quota, JSON.stringify(state.quota));
  renderAlumni();
  renderTokenLedger();
  updateQuotaDisplay();
  renderOperations();
  showToast("校友认证已通过，1,000,000 Token 已发放");
}

async function rejectAlumni(id) {
  if (state.serverMode) {
    try {
      await api(`/api/admin/alumni/applications/${encodeURIComponent(id)}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: "资料需要补充" })
      });
      await syncServerState();
      showToast("申请已退回");
    } catch (error) {
      showToast(error.message);
    }
    return;
  }
  if (!state.alumni || state.alumni.status !== "pending") return;
  state.alumni.status = "rejected";
  state.alumni.rejectedAt = new Date().toISOString();
  localStorage.setItem(STORAGE.alumni, JSON.stringify(state.alumni));
  renderAlumni();
  renderOperations();
  showToast("申请已退回，用户可补充材料后重新提交");
}

function logoMarkup(agent, extraClass = "") {
  if (agent.logoImage) {
    return `<span class="agent-logo ${extraClass}" style="--logo-color:${agent.color};--logo-bg:${agent.bg}"><img src="${escapeHtml(agent.logoImage)}" alt=""></span>`;
  }
  return `<span class="agent-logo ${extraClass}" style="--logo-color:${agent.color};--logo-bg:${agent.bg}">
    <i data-lucide="${escapeHtml(agent.icon || "sparkles")}"></i><b>${escapeHtml(agent.logoText || agent.name.slice(0, 1))}</b>
  </span>`;
}

function agentCozeUrl(agent) {
  return /^https?:\/\//i.test(agent.cozeUrl || "") ? agent.cozeUrl : "";
}

function statusLabel(status) {
  return { published: "已发布", draft: "草稿", offline: "已下架" }[status] || "草稿";
}

function modeLabel(mode) {
  return { local: "平台对话", external: "外部网页", embed: "网页嵌入", api: "API 接口" }[mode] || "平台对话";
}

function connectionTestLabel(agent) {
  if (!["external", "embed", "api"].includes(agent.mode)) return "平台内置";
  if (agent.lastTestStatus === "passed") return `已验证 ${formatShortDate(agent.lastTestAt)}`;
  if (agent.lastTestStatus === "failed") return `验证失败 ${formatShortDate(agent.lastTestAt)}`;
  return "未验证";
}

function agentPublishGateLabel(agent) {
  if (agent.status === "published" || !["external", "embed", "api"].includes(agent.mode)) return "";
  if (agent.lastTestStatus === "passed") return "可发布";
  if (agent.lastTestStatus === "failed") return "需重测后发布";
  return "发布前需测试";
}

function workflowTestLabel(workflow) {
  if (workflow?.lastTestStatus === "passed") return `已测试 ${formatShortDate(workflow.lastTestAt)}`;
  if (workflow?.lastTestStatus === "failed") return `测试失败 ${formatShortDate(workflow.lastTestAt)}`;
  return "未测试";
}

function workflowPublishGateLabel(workflow) {
  if (workflow?.status === "published") return "";
  if (workflow?.lastTestStatus === "passed") return "可发布";
  if (workflow?.lastTestStatus === "failed") return "需重测后发布";
  return "发布前需测试";
}

function formatShortDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function agentCard(agent) {
  const favorite = state.favorites.includes(agent.id);
  const cozeUrl = agentCozeUrl(agent);
  const logo = logoMarkup(agent);
  return `
    <article class="agent-card">
      <div class="agent-card-head">
        ${cozeUrl ? `<a class="agent-logo-link" href="${escapeHtml(cozeUrl)}" target="_blank" rel="noopener noreferrer" title="打开 Coze 发布页" aria-label="打开 ${escapeHtml(agent.name)} 的 Coze 发布页">${logo}</a>` : logo}
        <button class="icon-button favorite-button ${favorite ? "active" : ""}" data-favorite="${agent.id}" title="${favorite ? "取消收藏" : "收藏"}" aria-label="${favorite ? "取消收藏" : "收藏"}">
          <i data-lucide="star"></i>
        </button>
      </div>
      <h3>${escapeHtml(agent.name)}</h3>
      <p>${escapeHtml(agent.description)}</p>
      <div class="agent-meta">
        <span class="agent-tag">${escapeHtml(agent.category)}</span>
        <button class="launch-button" data-launch="${agent.id}">立即使用 <i data-lucide="arrow-up-right"></i></button>
      </div>
    </article>`;
}

function publicAgents() {
  return agents.filter(agent => agent.status === "published");
}

function filteredAgents() {
  const query = state.query.trim().toLowerCase();
  return publicAgents().filter(agent => {
    const matchesCategory = state.category === "全部" || agent.category === state.category;
    const haystack = `${agent.name}${agent.category}${agent.description}${agent.owner}`.toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });
}

function renderAgents() {
  const featured = publicAgents().filter(agent => agent.featured).slice(0, 4);
  $("#featuredAgents").innerHTML = featured.map(agentCard).join("");
  const visible = filteredAgents();
  $("#allAgents").innerHTML = visible.map(agentCard).join("");
  $("#agentCount").textContent = `共 ${visible.length} 个已发布应用`;
  $("#agentEmpty").hidden = visible.length > 0;

  const favorites = publicAgents().filter(agent => state.favorites.includes(agent.id));
  $("#favoriteAgents").innerHTML = favorites.map(agentCard).join("");
  $("#favoriteEmpty").hidden = favorites.length > 0;
  refreshIcons();
}

function renderCategories() {
  const categories = ["全部", ...new Set(publicAgents().map(agent => agent.category))];
  $("#categoryFilters").innerHTML = categories.map(category =>
    `<button class="filter-button ${state.category === category ? "active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`
  ).join("");
  $("#categoryOptions").innerHTML = categoryCatalog.map(category => `<option value="${category.name}"></option>`).join("");
}

function renderHistory() {
  const history = state.history.map(item => ({ ...item, agent: agents.find(agent => agent.id === item.id) })).filter(item => item.agent);
  $("#historyTable").innerHTML = history.length ? history.map(item => `
    <div class="history-row">
      <div class="history-agent">${logoMarkup(item.agent, "small")}<strong>${escapeHtml(item.agent.name)}</strong></div>
      <span>${escapeHtml(item.agent.category)}</span>
      <span>${escapeHtml(item.time)}</span>
      <button class="launch-button" data-launch="${item.agent.id}">再次使用 <i data-lucide="arrow-right"></i></button>
    </div>
  `).join("") : `<div class="empty-state"><i data-lucide="history"></i><h3>暂无使用记录</h3><p>打开一个智能体后，记录会出现在这里。</p></div>`;

  const recent = history.slice(0, 3);
  const fallback = agents[0];
  $("#recentList").innerHTML = recent.length ? recent.map(item => `
    <button class="recent-item" data-launch="${item.agent.id}">
      ${logoMarkup(item.agent, "small")}
      <span><strong>${escapeHtml(item.agent.name)}</strong><small>${escapeHtml(item.time)} · ${escapeHtml(item.agent.category)}</small></span>
      <i data-lucide="chevron-right"></i>
    </button>
  `).join("") : `
    <button class="recent-item" data-launch="${fallback.id}">
      ${logoMarkup(fallback, "small")}
      <span><strong>${escapeHtml(fallback.name)}</strong><small>推荐体验 · ${escapeHtml(fallback.category)}</small></span>
      <i data-lucide="chevron-right"></i>
    </button>`;
  refreshIcons();
}

function filteredArtifacts() {
  const query = (state.artifactQuery || "").trim().toLowerCase();
  return (state.artifacts || []).filter(item => {
    const type = item.downloadType || "html";
    const workflow = item.workflowId || "";
    const haystack = [
      item.title,
      item.type,
      item.workflowTitle,
      item.workflowId,
      item.downloadType,
      item.username,
      item.displayName
    ].filter(Boolean).join(" ").toLowerCase();
    return (state.artifactType === "all" || type === state.artifactType)
      && (state.artifactWorkflow === "all" || workflow === state.artifactWorkflow)
      && (!query || haystack.includes(query));
  });
}

function renderArtifactFilters() {
  if (!$("#artifactWorkflowFilter")) return;
  const artifacts = state.artifacts || [];
  const workflows = new Map();
  artifacts.forEach(item => {
    if (item.workflowId) workflows.set(item.workflowId, item.workflowTitle || item.workflowId);
  });
  const workflowOptions = [["all", "全部工作流"], ...[...workflows.entries()].sort((a, b) => a[1].localeCompare(b[1]))];
  $("#artifactWorkflowFilter").innerHTML = workflowOptions.map(([id, title]) =>
    `<option value="${escapeHtml(id)}">${escapeHtml(title)}</option>`
  ).join("");
  $("#artifactWorkflowFilter").value = workflowOptions.some(([id]) => id === state.artifactWorkflow) ? state.artifactWorkflow : "all";
  state.artifactWorkflow = $("#artifactWorkflowFilter").value;
  $("#artifactTypeFilter").value = state.artifactType;
  $("#artifactSearch").value = state.artifactQuery;
}

function renderArtifacts() {
  if (!$("#artifactLibrary")) return;
  renderArtifactFilters();
  const artifacts = filteredArtifacts();
  state.selectedArtifactIds = new Set([...state.selectedArtifactIds].filter(id => (state.artifacts || []).some(item => item.id === id)));
  const selectedVisibleCount = artifacts.filter(item => state.selectedArtifactIds.has(item.id)).length;
  const selectedTotal = state.selectedArtifactIds.size;
  if ($("#artifactResultCount")) {
    $("#artifactResultCount").textContent = `${artifacts.length} / ${(state.artifacts || []).length} 个成果 · 已选 ${selectedTotal}`;
  }
  renderArtifactGovernance(artifacts, (state.artifacts || []).length, selectedTotal);
  if ($("#selectVisibleArtifacts")) {
    $("#selectVisibleArtifacts").checked = artifacts.length > 0 && selectedVisibleCount === artifacts.length;
    $("#selectVisibleArtifacts").indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < artifacts.length;
  }
  if ($("#bulkDeleteArtifacts")) {
    $("#bulkDeleteArtifacts").disabled = selectedTotal === 0;
  }
  $("#artifactLibrary").innerHTML = artifacts.length ? artifacts.map(item => `
    <article class="artifact-card">
      <label class="artifact-check"><input type="checkbox" data-select-artifact="${escapeHtml(item.id)}" ${state.selectedArtifactIds.has(item.id) ? "checked" : ""} aria-label="选择 ${escapeHtml(item.title || "成果文件")}"></label>
      <span class="artifact-type">${escapeHtml((item.downloadType || "html").toUpperCase())}</span>
      <div>
        <h2>${escapeHtml(item.title || "未命名成果")}</h2>
        <p>${escapeHtml(item.workflowTitle || item.type || "教学工作流成果")}</p>
        <small>${formatShortDate(item.createdAt)}${item.displayName ? ` · ${escapeHtml(item.displayName)}` : ""}</small>
      </div>
      <div class="artifact-actions">
        <a class="icon-button" href="${escapeHtml(apiUrl(item.downloadUrl))}" target="_blank" rel="noopener" title="下载" aria-label="下载 ${escapeHtml(item.title || "成果文件")}">
          <i data-lucide="download"></i>
        </a>
        <button class="icon-button danger" type="button" data-delete-artifact="${escapeHtml(item.id)}" title="删除" aria-label="删除 ${escapeHtml(item.title || "成果文件")}">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </article>
  `).join("") : `<div class="empty-state"><i data-lucide="folder-down"></i><h3>暂无成果文件</h3><p>在 AI 教育助手中运行教学工作流后，教案、课件和网页动画会沉淀在这里。</p></div>`;
  refreshIcons();
}

function renderArtifactGovernance(artifacts, total, selectedTotal) {
  const panel = $("#artifactGovernance");
  if (!panel) return;
  const typeCounts = countBy(artifacts, item => item.downloadType || "html");
  const workflowCounts = countBy(artifacts, item => item.workflowTitle || item.workflowId || "未关联工作流");
  const topWorkflows = Object.entries(workflowCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"))
    .slice(0, 4)
    .map(([workflow, count]) => `${escapeHtml(workflow)} ${count}`)
    .join(" · ");
  const latest = artifacts
    .map(item => new Date(item.createdAt).getTime())
    .filter(time => Number.isFinite(time))
    .sort((a, b) => b - a)[0];
  panel.innerHTML = `
    <section>
      <strong>当前范围</strong>
      <span>${artifacts.length}/${total} 个成果 · 已选 ${selectedTotal}</span>
    </section>
    <section>
      <strong>文件类型</strong>
      <span>HTML ${typeCounts.html || 0} · ZIP ${typeCounts.zip || 0}</span>
    </section>
    <section>
      <strong>工作流分布</strong>
      <span>${topWorkflows || "暂无成果"}</span>
    </section>
    <section>
      <strong>最新成果</strong>
      <span>${latest ? new Date(latest).toLocaleString("zh-CN") : "暂无"}</span>
    </section>`;
}

async function deleteArtifact(id) {
  const artifact = state.artifacts.find(item => item.id === id);
  if (!artifact) return;
  if (!window.confirm(`确认删除“${artifact.title || "成果文件"}”？删除后下载链接将失效。`)) return;
  if (!state.serverMode) {
    state.artifacts = state.artifacts.filter(item => item.id !== id);
    renderArtifacts();
    showToast("成果文件已从当前预览中移除");
    return;
  }
  try {
    await api(`/api/artifacts/${encodeURIComponent(id)}`, { method: "DELETE" });
    state.artifacts = state.artifacts.filter(item => item.id !== id);
    if (state.currentArtifact?.id === id) {
      state.currentArtifact = null;
      $("#artifactPanel").hidden = true;
    }
    renderArtifacts();
    showToast("成果文件已删除");
  } catch (error) {
    showToast(error.message);
  }
}

function selectVisibleArtifacts(checked) {
  const visible = filteredArtifacts();
  visible.forEach(item => {
    if (checked) state.selectedArtifactIds.add(item.id);
    else state.selectedArtifactIds.delete(item.id);
  });
  renderArtifacts();
}

async function bulkDeleteArtifacts() {
  const ids = [...state.selectedArtifactIds].filter(id => state.artifacts.some(item => item.id === id));
  if (!ids.length) return showToast("请先选择要删除的成果");
  if (!window.confirm(`确认删除已选的 ${ids.length} 个成果文件？删除后下载链接将失效。`)) return;
  if (!state.serverMode) {
    const idSet = new Set(ids);
    state.artifacts = state.artifacts.filter(item => !idSet.has(item.id));
    state.selectedArtifactIds.clear();
    renderArtifacts();
    showToast(`已从当前预览移除 ${ids.length} 个成果`);
    return;
  }
  let deleted = 0;
  for (const id of ids) {
    try {
      await api(`/api/artifacts/${encodeURIComponent(id)}`, { method: "DELETE" });
      deleted += 1;
      state.artifacts = state.artifacts.filter(item => item.id !== id);
    } catch (error) {
      showToast(`部分成果删除失败：${error.message}`);
      break;
    }
  }
  state.selectedArtifactIds.clear();
  if (state.currentArtifact && !state.artifacts.some(item => item.id === state.currentArtifact.id)) {
    state.currentArtifact = null;
    $("#artifactPanel").hidden = true;
  }
  await syncAdminData();
  renderArtifacts();
  showToast(`已删除 ${deleted} 个成果文件`);
}

async function cleanupArtifacts() {
  if (!state.serverMode) return showToast("连接服务端后才能清理成果文件");
  const value = window.prompt("清理多少天以前的成果文件？输入 0 会清理当前全部成果。", "30");
  if (value === null) return;
  const olderThanDays = Number(value);
  if (!Number.isFinite(olderThanDays) || olderThanDays < 0) {
    showToast("请输入不小于 0 的天数");
    return;
  }
  if (!window.confirm(`确认清理 ${olderThanDays} 天以前的成果文件？此操作会删除服务端文件和元数据。`)) return;
  try {
    const result = await api("/api/admin/artifacts/cleanup", {
      method: "POST",
      body: JSON.stringify({ olderThanDays })
    });
    const artifactData = await api("/api/artifacts").catch(() => ({ artifacts: [] }));
    state.artifacts = artifactData.artifacts || [];
    if (result.deleted && state.currentArtifact && !state.artifacts.some(item => item.id === state.currentArtifact.id)) {
      state.currentArtifact = null;
      $("#artifactPanel").hidden = true;
    }
    await syncAdminData();
    renderArtifacts();
    showToast(`已清理 ${result.deleted || 0} 个成果文件`);
  } catch (error) {
    showToast(error.message);
  }
}

function renderManagement() {
  const published = agents.filter(agent => agent.status === "published").length;
  const drafts = agents.filter(agent => agent.status === "draft").length;
  const connected = agents.filter(agent => agent.mode !== "local").length;
  const visible = filteredManagementAgents();
  $("#managementStats").innerHTML = `
    <article><span>应用总数</span><strong>${agents.length}</strong><small>平台目录</small></article>
    <article><span>已发布</span><strong>${published}</strong><small>师生可见</small></article>
    <article><span>待完善</span><strong>${drafts}</strong><small>草稿应用</small></article>
    <article><span>外部接入</span><strong>${connected}</strong><small>网页 / API</small></article>`;
  renderAgentGovernance(visible);

  state.selectedAgentIds = new Set([...state.selectedAgentIds].filter(id => agents.some(agent => agent.id === id)));
  const selectedVisibleCount = visible.filter(agent => state.selectedAgentIds.has(agent.id)).length;
  const selectedTotal = state.selectedAgentIds.size;

  $("#managementTable").innerHTML = `
    <div class="management-row management-row-head">
      <span></span><span>应用</span><span>分类 / 负责人</span><span>接入方式</span><span>状态</span><span>操作</span>
    </div>
    ${visible.map(agent => `
      <div class="management-row">
        <label class="row-check"><input type="checkbox" data-select-agent="${agent.id}" ${state.selectedAgentIds.has(agent.id) ? "checked" : ""} aria-label="选择 ${escapeHtml(agent.name)}"></label>
        <div class="management-agent">${logoMarkup(agent, "small")}<span><strong>${escapeHtml(agent.name)}</strong><small>${escapeHtml(agent.id)} · ${escapeHtml(agentQualityLabel(agent))}</small><small class="${agentCozeUrl(agent) ? "link-status ready" : "link-status missing"}">${agentCozeUrl(agent) ? "图标链接已设置" : "待添加图标链接"}</small></span></div>
        <span><strong>${escapeHtml(agent.category)}</strong><small>${escapeHtml(agent.owner)}</small></span>
        <span class="mode-badge"><i data-lucide="${agent.mode === "api" ? "braces" : agent.mode === "embed" ? "panel-top" : agent.mode === "external" ? "external-link" : "message-square"}"></i>${modeLabel(agent.mode)}<small>${connectionTestLabel(agent)}</small></span>
        <span><b class="status-badge ${agent.status}">${statusLabel(agent.status)}</b>${agentPublishGateLabel(agent) ? `<small>${escapeHtml(agentPublishGateLabel(agent))}</small>` : ""}</span>
        <span class="row-actions">
          <button class="icon-button" data-test-agent="${agent.id}" title="测试" aria-label="测试 ${escapeHtml(agent.name)}"><i data-lucide="flask-conical"></i></button>
          <button class="icon-button" data-duplicate-agent="${agent.id}" title="复制" aria-label="复制 ${escapeHtml(agent.name)}"><i data-lucide="copy-plus"></i></button>
          <button class="icon-button" data-agent-versions="${agent.id}" title="版本记录" aria-label="查看 ${escapeHtml(agent.name)} 版本"><i data-lucide="history"></i></button>
          <button class="icon-button" data-agent-admin-only data-edit-agent-link="${agent.id}" title="编辑图标超链接" aria-label="编辑 ${escapeHtml(agent.name)} 图标超链接"><i data-lucide="link"></i></button>
          <button class="icon-button" data-edit-agent="${agent.id}" title="编辑" aria-label="编辑 ${escapeHtml(agent.name)}"><i data-lucide="pencil"></i></button>
          <button class="icon-button" data-toggle-agent="${agent.id}" title="${agent.status === "published" ? "下架" : "发布"}" aria-label="${agent.status === "published" ? "下架" : "发布"} ${escapeHtml(agent.name)}"><i data-lucide="${agent.status === "published" ? "circle-pause" : "circle-play"}"></i></button>
        </span>
    </div>`).join("")}
    ${visible.length ? "" : '<div class="empty-state"><i data-lucide="search-x"></i><h3>没有匹配的应用</h3></div>'}`;
  if ($("#selectVisibleAgents")) {
    $("#selectVisibleAgents").checked = visible.length > 0 && selectedVisibleCount === visible.length;
    $("#selectVisibleAgents").indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visible.length;
  }
  if ($("#selectedAgentCount")) {
    $("#selectedAgentCount").textContent = `${selectedTotal} 已选`;
  }
  renderWorkflowManagement();
  applyRoleVisibility();
  refreshIcons();
}

function renderAgentGovernance(visible) {
  if (!$("#agentGovernance")) return;
  const statusCounts = countBy(visible, agent => agent.status || "draft");
  const testCounts = countBy(visible, agent => agentTestFilterStatus(agent));
  const routeCounts = countBy(visible, agent => agent.routeHint || "qwen");
  const readyCount = visible.filter(agent => agentQualityIssues(agent).length === 0).length;
  const issueCounts = countBy(visible.flatMap(agent => agentQualityIssues(agent)), issue => issue);
  const topRoutes = Object.entries(routeCounts)
    .sort((a, b) => b[1] - a[1] || routeLabel(a[0]).localeCompare(routeLabel(b[0]), "zh-CN"))
    .slice(0, 5);
  const topIssues = Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"))
    .slice(0, 4);
  $("#agentGovernance").innerHTML = `
    <section>
      <strong>当前范围</strong>
      <span>${visible.length}/${agents.length} 个智能体</span>
    </section>
    <section>
      <strong>发布状态</strong>
      <span>发布 ${statusCounts.published || 0} · 草稿 ${statusCounts.draft || 0} · 下架 ${statusCounts.offline || 0}</span>
    </section>
    <section>
      <strong>测试状态</strong>
      <span>通过 ${testCounts.passed || 0} · 失败 ${testCounts.failed || 0} · 未测 ${testCounts.untested || 0} · 受阻 ${testCounts.blocked || 0}</span>
    </section>
    <section>
      <strong>模型路由</strong>
      <span>${topRoutes.length ? topRoutes.map(([route, count]) => `${escapeHtml(routeLabel(route))} ${count}`).join(" · ") : "暂无"}</span>
    </section>
    <section>
      <strong>目录质量</strong>
      <span>达标 ${readyCount} · 待补 ${Math.max(0, visible.length - readyCount)}${topIssues.length ? ` · ${topIssues.map(([issue, count]) => `${escapeHtml(issue)} ${count}`).join(" · ")}` : ""}</span>
    </section>`;
}

function countBy(items, pick) {
  return items.reduce((counts, item) => {
    const key = pick(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function filteredManagementAgents() {
  const query = state.managementQuery.trim().toLowerCase();
  return agents.filter(agent => {
    const matchesStatus = state.managementStatus === "all" || agent.status === state.managementStatus;
    const matchesTestStatus = state.managementTestStatus === "all" || agentTestFilterStatus(agent) === state.managementTestStatus;
    const qualityStatus = agentQualityIssues(agent).length ? "needs_attention" : "ready";
    const matchesQuality = state.managementQuality === "all" || qualityStatus === state.managementQuality;
    const haystack = [
      agent.name,
      agent.category,
      agent.owner,
      agent.id,
      agent.routeHint || "",
      routeLabel(agent.routeHint),
      agent.description,
      agent.systemPrompt,
      ...(agent.prompts || []),
      ...agentQualityIssues(agent)
    ].join(" ").toLowerCase();
    return matchesStatus && matchesQuality && matchesTestStatus && (!query || haystack.includes(query));
  }).sort(compareManagementAgents);
}

function agentQualityIssues(agent) {
  const issues = [];
  if (!agent.logoText && !agent.logoImage) issues.push("缺Logo");
  if (!agent.description || agent.description.length < 20) issues.push("简介短");
  if (!agent.owner) issues.push("缺负责人");
  if (!MODEL_ROUTES.some(route => route.id === agent.routeHint)) issues.push("路由无效");
  if (!agent.cozeUrl) issues.push("缺Coze链接");
  else if (/\/xiaozhuang-century-[0-9]{3}$/i.test(agent.cozeUrl)) issues.push("Coze占位链接");
  if (providerStatusForRoute(agent.routeHint)?.configured === false) issues.push("模型未配置");
  if (agent.mode === "local" && (!agent.systemPrompt || agent.systemPrompt.length < 40)) issues.push("提示词短");
  if (!Array.isArray(agent.prompts) || agent.prompts.length < 3) issues.push("推荐问题少");
  if (["external", "embed"].includes(agent.mode) && !/^https?:\/\//i.test(agent.url || "")) issues.push("缺应用地址");
  if (agent.mode === "api" && !/^https?:\/\//i.test(agent.apiUrl || "")) issues.push("缺API地址");
  return issues;
}

function agentQualityLabel(agent) {
  const issues = agentQualityIssues(agent);
  return issues.length ? `待补：${issues.slice(0, 2).join("、")}${issues.length > 2 ? "等" : ""}` : "目录达标";
}

function compareManagementAgents(a, b) {
  const sort = state.managementSort || "id-asc";
  const statusOrder = { published: 0, draft: 1, offline: 2 };
  const testOrder = { blocked: 0, failed: 1, untested: 2, passed: 3 };
  const value = agent => ({
    "id-asc": agent.id,
    "name-asc": agent.name,
    "category-asc": `${agent.category}|${agent.name}`,
    "status-asc": `${statusOrder[agent.status] ?? 9}|${agent.name}`,
    "route-asc": `${agent.routeHint || ""}|${agent.name}`,
    "test-asc": `${testOrder[agentTestFilterStatus(agent)] ?? 9}|${agent.name}`
  })[sort] || agent.id;
  return String(value(a)).localeCompare(String(value(b)), "zh-CN", { numeric: true, sensitivity: "base" });
}

function agentTestFilterStatus(agent) {
  const gatedModes = ["external", "embed", "api"];
  const needsPublishGate = agent.status !== "published" && gatedModes.includes(agent.mode || "local");
  if (needsPublishGate && agent.lastTestStatus !== "passed") return "blocked";
  if (["passed", "failed"].includes(agent.lastTestStatus)) return agent.lastTestStatus;
  return "untested";
}

function renderWorkflowManagement() {
  const workflows = filteredManagementWorkflows();
  const routeOptions = MODEL_ROUTES.map(route => `<option value="${route.id}">${route.name}</option>`).join("");
  const allWorkflows = state.workflows || [];
  state.selectedWorkflowIds = new Set([...state.selectedWorkflowIds].filter(id => allWorkflows.some(workflow => workflow.id === id)));
  const selectedTotal = state.selectedWorkflowIds.size;
  const selectedVisibleCount = workflows.filter(workflow => state.selectedWorkflowIds.has(workflow.id)).length;
  $("#workflowCount").textContent = `${workflows.length}/${allWorkflows.length} 个流程`;
  renderWorkflowGovernance(workflows, allWorkflows.length);
  $("#workflowManagement").innerHTML = workflows.length ? `
    <div class="management-row workflow-row workflow-row-head">
      <span></span><span>工作流</span><span>首选模型</span><span>成果类型</span><span>状态</span><span>操作</span>
    </div>
    ${workflows.map(workflow => `
      <div class="management-row workflow-row">
        <label class="row-check"><input type="checkbox" data-select-workflow="${escapeHtml(workflow.id)}" ${state.selectedWorkflowIds.has(workflow.id) ? "checked" : ""} aria-label="选择 ${escapeHtml(workflow.title)}"></label>
        <span><strong>${escapeHtml(workflow.title)}</strong><small>${escapeHtml(workflow.summary)}</small><small>${workflowSpecSummary(workflow)} · ${escapeHtml(workflowQualityLabel(workflow))}</small></span>
        <span><select data-workflow-route="${escapeHtml(workflow.id)}">${routeOptions}</select><small class="${workflowRouteMissingEnv(workflow).length ? "workflow-route-missing" : "workflow-route-ready"}">${escapeHtml(workflowRouteStatusLabel(workflow))}</small></span>
        <span><strong>${escapeHtml(workflow.artifactType)}</strong><small>${escapeHtml(workflow.id)}</small></span>
        <span><b class="status-badge ${workflow.status || "published"}">${statusLabel(workflow.status || "published")}</b><small>${escapeHtml(workflowTestLabel(workflow))}${workflowPublishGateLabel(workflow) ? ` · ${escapeHtml(workflowPublishGateLabel(workflow))}` : ""}</small></span>
        <span class="row-actions">
          <button class="icon-button" data-edit-workflow-prompt="${escapeHtml(workflow.id)}" title="编辑提示词" aria-label="编辑 ${escapeHtml(workflow.title)} 提示词"><i data-lucide="file-pen-line"></i></button>
          <button class="icon-button" data-edit-workflow-spec="${escapeHtml(workflow.id)}" title="编辑输入输出规范" aria-label="编辑 ${escapeHtml(workflow.title)} 输入输出规范"><i data-lucide="list-checks"></i></button>
          <button class="icon-button" data-test-workflow="${escapeHtml(workflow.id)}" title="测试" aria-label="测试 ${escapeHtml(workflow.title)}"><i data-lucide="flask-conical"></i></button>
          <button class="icon-button" data-duplicate-workflow="${escapeHtml(workflow.id)}" title="复制" aria-label="复制 ${escapeHtml(workflow.title)}"><i data-lucide="copy-plus"></i></button>
          <button class="icon-button" data-workflow-versions="${escapeHtml(workflow.id)}" title="版本记录" aria-label="查看 ${escapeHtml(workflow.title)} 版本"><i data-lucide="history"></i></button>
          <button class="icon-button" data-save-workflow="${escapeHtml(workflow.id)}" title="保存路由" aria-label="保存 ${escapeHtml(workflow.title)} 路由"><i data-lucide="save"></i></button>
          <button class="icon-button" data-toggle-workflow="${escapeHtml(workflow.id)}" title="${workflow.status === "offline" ? "发布" : "停用"}" aria-label="${workflow.status === "offline" ? "发布" : "停用"} ${escapeHtml(workflow.title)}"><i data-lucide="${workflow.status === "offline" ? "circle-play" : "circle-pause"}"></i></button>
          <button class="icon-button danger" data-delete-workflow="${escapeHtml(workflow.id)}" title="删除" aria-label="删除 ${escapeHtml(workflow.title)}"><i data-lucide="trash-2"></i></button>
        </span>
      </div>`).join("")}` : `<div class="review-empty">暂无教学工作流模板</div>`;
  workflows.forEach(workflow => {
    const select = $(`[data-workflow-route="${CSS.escape(workflow.id)}"]`);
    if (select) select.value = workflow.routeHint || "qwen";
  });
  if ($("#selectVisibleWorkflows")) {
    $("#selectVisibleWorkflows").checked = workflows.length > 0 && selectedVisibleCount === workflows.length;
    $("#selectVisibleWorkflows").indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < workflows.length;
  }
  if ($("#selectedWorkflowCount")) {
    $("#selectedWorkflowCount").textContent = `${selectedTotal} 已选`;
  }
}

function renderWorkflowGovernance(workflows, total) {
  if (!$("#workflowGovernance")) return;
  const statusCounts = countBy(workflows, workflow => workflow.status || "published");
  const testCounts = countBy(workflows, workflow => workflowTestFilterStatus(workflow));
  const routeCounts = countBy(workflows, workflow => workflow.routeHint || "qwen");
  const artifactCounts = countBy(workflows, workflow => workflow.artifactType || "text");
  const readyCount = workflows.filter(workflow => workflowQualityIssues(workflow).length === 0).length;
  const issueCounts = countBy(workflows.flatMap(workflow => workflowQualityIssues(workflow)), issue => issue);
  const topRoutes = Object.entries(routeCounts)
    .sort((a, b) => b[1] - a[1] || routeLabel(a[0]).localeCompare(routeLabel(b[0]), "zh-CN"))
    .slice(0, 4);
  const topArtifacts = Object.entries(artifactCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"))
    .slice(0, 4);
  const topIssues = Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"))
    .slice(0, 3);
  $("#workflowGovernance").innerHTML = `
    <section>
      <strong>当前范围</strong>
      <span>${workflows.length}/${total} 个流程</span>
    </section>
    <section>
      <strong>发布状态</strong>
      <span>发布 ${statusCounts.published || 0} · 草稿 ${statusCounts.draft || 0} · 停用 ${statusCounts.offline || 0}</span>
    </section>
    <section>
      <strong>测试状态</strong>
      <span>通过 ${testCounts.passed || 0} · 失败 ${testCounts.failed || 0} · 未测 ${testCounts.untested || 0} · 受阻 ${testCounts.blocked || 0}</span>
    </section>
    <section>
      <strong>模型与成果</strong>
      <span>${topRoutes.length ? topRoutes.map(([route, count]) => `${escapeHtml(routeLabel(route))} ${count}`).join(" · ") : "暂无"} / ${topArtifacts.length ? topArtifacts.map(([type, count]) => `${escapeHtml(type)} ${count}`).join(" · ") : "暂无"}</span>
    </section>
    <section>
      <strong>流程质量</strong>
      <span>达标 ${readyCount} · 待补 ${Math.max(0, workflows.length - readyCount)}${topIssues.length ? ` · ${topIssues.map(([issue, count]) => `${escapeHtml(issue)} ${count}`).join(" · ")}` : ""}</span>
    </section>`;
}

function filteredManagementWorkflows() {
  const workflows = state.workflows || [];
  const query = state.workflowQuery.trim().toLowerCase();
  return workflows.filter(workflow => {
    const matchesTestStatus = state.workflowTestStatus === "all" || workflowTestFilterStatus(workflow) === state.workflowTestStatus;
    const qualityStatus = workflowQualityIssues(workflow).length ? "needs_attention" : "ready";
    const matchesQuality = state.workflowQuality === "all" || qualityStatus === state.workflowQuality;
    const haystack = [
      workflow.id,
      workflow.title,
      workflow.summary,
      workflow.routeHint,
      routeLabel(workflow.routeHint),
      workflowRouteStatusLabel(workflow),
      workflowRouteMissingEnv(workflow).join(" "),
      workflow.artifactType,
      ...(workflow.inputFields || []),
      ...(workflow.outputSections || []),
      ...(workflow.qualityChecklist || []),
      workflow.status || "published",
      workflowTestLabel(workflow)
    ].filter(Boolean).join(" ").toLowerCase();
    return matchesTestStatus && matchesQuality && (!query || haystack.includes(query));
  }).sort(compareManagementWorkflows);
}

function compareManagementWorkflows(a, b) {
  const sort = state.workflowSort || "id-asc";
  const statusOrder = { published: 0, draft: 1, offline: 2 };
  const testOrder = { blocked: 0, failed: 1, untested: 2, passed: 3 };
  const value = workflow => ({
    "id-asc": workflow.id,
    "title-asc": workflow.title,
    "route-asc": `${workflow.routeHint || ""}|${workflow.title}`,
    "artifact-asc": `${workflow.artifactType || ""}|${workflow.title}`,
    "status-asc": `${statusOrder[workflow.status || "published"] ?? 9}|${workflow.title}`,
    "test-asc": `${testOrder[workflowTestFilterStatus(workflow)] ?? 9}|${workflow.title}`
  })[sort] || workflow.id;
  return String(value(a)).localeCompare(String(value(b)), "zh-CN", { numeric: true, sensitivity: "base" });
}

function routeLabel(routeId) {
  return MODEL_ROUTES.find(route => route.id === routeId)?.name || routeId || "";
}

function workflowTestFilterStatus(workflow) {
  const needsPublishGate = workflow?.status !== "published";
  if (needsPublishGate && workflow?.lastTestStatus !== "passed") return "blocked";
  if (["passed", "failed"].includes(workflow?.lastTestStatus)) return workflow.lastTestStatus;
  return "untested";
}

function workflowSpecSummary(workflow) {
  const inputCount = (workflow.inputFields || []).length;
  const sectionCount = (workflow.outputSections || []).length;
  const checklistCount = (workflow.qualityChecklist || []).length;
  return `输入 ${inputCount} · 输出 ${sectionCount} · 质检 ${checklistCount}`;
}

function workflowQualityLabel(workflow) {
  const issues = workflowQualityIssues(workflow);
  return issues.length ? `待补：${issues.slice(0, 2).join("、")}${issues.length > 2 ? "等" : ""}` : "流程达标";
}

function providerStatusForRoute(routeId) {
  if (!Array.isArray(state.providerStatuses) || state.providerStatuses.length === 0) return null;
  return state.providerStatuses.find(provider => provider.id === routeId) || null;
}

function workflowRouteMissingEnv(workflow) {
  const status = providerStatusForRoute(workflow?.routeHint);
  return Array.isArray(status?.missingEnv) ? status.missingEnv : [];
}

function workflowRouteStatusLabel(workflow) {
  const status = providerStatusForRoute(workflow?.routeHint);
  if (!status) return "等待模型配置状态";
  const missing = workflowRouteMissingEnv(workflow);
  return status.configured ? "模型已配置，可测试" : `缺少 ${missing.join(" / ") || "服务端配置"}`;
}

function parseWorkflowSpecList(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

async function saveWorkflow(id, patch = {}) {
  const workflow = state.workflows.find(item => item.id === id);
  if (!workflow) return;
  try {
    const result = await api(`/api/admin/workflows/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ ...workflow, ...patch })
    });
    state.workflows = state.workflows.map(item => item.id === id ? result.workflow : item);
    renderWorkflowManagement();
    showToast("工作流配置已更新");
  } catch (error) {
    showToast(error.message);
  }
}

async function testWorkflow(id) {
  const workflow = state.workflows.find(item => item.id === id);
  if (!workflow) return;
  const prompt = window.prompt(`测试“${workflow.title}”工作流`, workflow.summary || workflow.title);
  if (prompt === null) return;
  try {
    showToast("正在测试工作流路由与提示词");
    const result = await api(`/api/admin/workflows/${encodeURIComponent(id)}/test`, {
      method: "POST",
      body: JSON.stringify({ prompt: prompt.trim() || workflow.summary || workflow.title })
    });
    await syncAdminData();
    showToast(`测试通过：${result.route?.name || result.model || "模型已响应"}`);
  } catch (error) {
    showToast(error.message);
  }
}

function editWorkflowPrompt(id) {
  const workflow = state.workflows.find(item => item.id === id);
  if (!workflow) return;
  const promptText = window.prompt(`编辑“${workflow.title}”系统提示词`, workflow.systemPrompt || "");
  if (promptText === null) return;
  saveWorkflow(id, { systemPrompt: promptText.trim() });
}

function editWorkflowSpec(id) {
  const workflow = state.workflows.find(item => item.id === id);
  if (!workflow) return;
  const inputText = window.prompt(`编辑“${workflow.title}”输入字段，每行一个`, (workflow.inputFields || []).join("\n"));
  if (inputText === null) return;
  const outputText = window.prompt(`编辑“${workflow.title}”输出结构，每行一个`, (workflow.outputSections || []).join("\n"));
  if (outputText === null) return;
  const checklistText = window.prompt(`编辑“${workflow.title}”质量检查清单，每行一个`, (workflow.qualityChecklist || []).join("\n"));
  if (checklistText === null) return;
  saveWorkflow(id, {
    inputFields: parseWorkflowSpecList(inputText),
    outputSections: parseWorkflowSpecList(outputText),
    qualityChecklist: parseWorkflowSpecList(checklistText)
  });
}

async function createWorkflow() {
  const title = window.prompt("工作流名称，例如：学情分析");
  if (!title) return;
  const id = window.prompt("工作流 ID，仅支持英文、数字、中划线和下划线", title.toLowerCase().replace(/\s+/g, "-"));
  if (!id) return;
  const summary = window.prompt("一句话说明这个工作流的用途");
  if (!summary) return;
  const artifactType = window.prompt("成果类型，例如 lesson-plan、html-slides、question-set", "text");
  if (!artifactType) return;
  const systemPrompt = window.prompt("系统提示词，发布状态至少 30 字", `你是“${title}”工作流。请面向南京晓庄学院真实教学场景，输出结构清晰、可执行、可审核的成果。`);
  if (!systemPrompt) return;
  const workflow = {
    id: id.trim(),
    title: title.trim(),
    summary: summary.trim(),
    artifactType: artifactType.trim(),
    routeHint: "deepseek",
    status: "draft",
    systemPrompt: systemPrompt.trim(),
    inputFields: ["主题", "对象", "目标", "补充要求"],
    outputSections: ["任务理解", "结构化结果", "行动建议"],
    qualityChecklist: ["结果准确", "结构清晰", "可执行"]
  };
  try {
    if (state.serverMode) {
      const result = await api("/api/admin/workflows", {
        method: "POST",
        body: JSON.stringify(workflow)
      });
      state.workflows = [result.workflow, ...state.workflows.filter(item => item.id !== result.workflow.id)];
    } else {
      if (state.workflows.some(item => item.id === workflow.id)) throw new Error("工作流 ID 已存在");
      state.workflows.unshift({ ...workflow, updatedAt: new Date().toISOString() });
    }
    renderWorkflowManagement();
    showToast("工作流已创建");
  } catch (error) {
    showToast(`创建失败：${error.message}`);
  }
}

function exportWorkflows() {
  exportWorkflowSet(state.workflows || [], "all");
}

function workflowQualityIssues(workflow) {
  const issues = [];
  if (!workflow.title || !workflow.summary) issues.push("基础信息缺失");
  if (!MODEL_ROUTES.some(route => route.id === workflow.routeHint)) issues.push("路由无效");
  if (workflowRouteMissingEnv(workflow).length) issues.push("模型未配置");
  if (!workflow.artifactType) issues.push("缺成果类型");
  if (!workflow.systemPrompt || workflow.systemPrompt.length < 30) issues.push("提示词短");
  if (!Array.isArray(workflow.inputFields) || workflow.inputFields.length < 2) issues.push("输入字段少");
  if (!Array.isArray(workflow.outputSections) || workflow.outputSections.length < 3) issues.push("输出结构少");
  if (!Array.isArray(workflow.qualityChecklist) || workflow.qualityChecklist.length < 2) issues.push("质检清单少");
  if (workflow.status !== "offline" && workflow.lastTestStatus !== "passed") issues.push("未通过测试");
  return issues;
}

function exportWorkflowQuality() {
  if (state.serverMode) {
    window.open(apiUrl("/api/admin/workflows-quality.csv"), "_blank", "noopener,noreferrer");
    return;
  }
  const rows = [[
    "id",
    "title",
    "status",
    "routeHint",
    "routeName",
    "routeConfigured",
    "routeMissingEnv",
    "routeEnvNames",
    "fallbackRoutes",
    "artifactType",
    "lastTestStatus",
    "lastTestAt",
    "qualityStatus",
    "qualityIssueCount",
    "qualityIssues",
    "inputFieldCount",
    "outputSectionCount",
    "qualityChecklistCount",
    "systemPromptLength",
    "updatedAt"
  ]];
  for (const workflow of state.workflows || []) {
    const issues = workflowQualityIssues(workflow);
    const provider = providerStatusForRoute(workflow.routeHint);
    rows.push([
      workflow.id || "",
      workflow.title || "",
      workflow.status || "",
      workflow.routeHint || "",
      routeLabel(workflow.routeHint),
      provider?.configured ? "yes" : "no",
      (provider?.missingEnv || []).join("; "),
      (provider?.envNames || []).join("; "),
      (provider?.fallbacks || []).join("; "),
      workflow.artifactType || "",
      workflow.lastTestStatus || "untested",
      workflow.lastTestAt || "",
      issues.length ? "needs_attention" : "ready",
      issues.length,
      issues.join("; "),
      Array.isArray(workflow.inputFields) ? workflow.inputFields.length : 0,
      Array.isArray(workflow.outputSections) ? workflow.outputSections.length : 0,
      Array.isArray(workflow.qualityChecklist) ? workflow.qualityChecklist.length : 0,
      String(workflow.systemPrompt || "").length,
      workflow.updatedAt || ""
    ]);
  }
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `xiaozhuang-workflows-quality-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportVisibleWorkflows() {
  const workflows = filteredManagementWorkflows();
  if (!workflows.length) return showToast("当前筛选范围没有可导出的工作流");
  exportWorkflowSet(workflows, "visible");
}

function exportWorkflowSet(workflows, scope) {
  const payload = {
    platform: "百年晓庄智慧教育平台",
    version: 2,
    exportedAt: new Date().toISOString(),
    scope,
    workflows
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `xiaozhuang-workflows-${scope}-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function importWorkflows(file) {
  try {
    const payload = JSON.parse(await file.text());
    const imported = Array.isArray(payload) ? payload : payload.workflows;
    if (!Array.isArray(imported) || !imported.length) throw new Error("文件中没有有效的 workflows 数组");
    if (!imported.every(workflow => workflow.id && workflow.title && workflow.summary)) throw new Error("工作流数据缺少 id、title 或 summary");
    const strategy = window.confirm(`准备导入 ${imported.length} 个工作流。\n\n选择“确定”合并到当前工作流；选择“取消”将替换全部工作流。`)
      ? "merge"
      : "replace";
    if (strategy === "replace" && !window.confirm("替换会覆盖当前教学工作流。确定继续吗？")) return;
    if (state.serverMode) {
      const result = await api("/api/admin/workflows/import", {
        method: "POST",
        body: JSON.stringify({ strategy, workflows: imported })
      });
      state.workflows = result.workflows;
    } else {
      if (strategy === "replace") {
        state.workflows = imported;
      } else {
        const incomingIds = new Set(imported.map(workflow => workflow.id));
        state.workflows = [...imported, ...state.workflows.filter(workflow => !incomingIds.has(workflow.id))];
      }
    }
    renderWorkflowManagement();
    showToast(`${strategy === "merge" ? "已合并导入" : "已替换导入"}，当前 ${state.workflows.length} 个工作流`);
  } catch (error) {
    showToast(`导入失败：${error.message}`);
  }
}

async function deleteWorkflow(id) {
  const workflow = state.workflows.find(item => item.id === id);
  if (!workflow || !window.confirm(`确定删除“${workflow.title}”工作流吗？`)) return;
  try {
    if (state.serverMode) {
      await api(`/api/admin/workflows/${encodeURIComponent(id)}`, { method: "DELETE" });
    }
    state.workflows = state.workflows.filter(item => item.id !== id);
    renderWorkflowManagement();
    showToast("工作流已删除");
  } catch (error) {
    showToast(`删除失败：${error.message}`);
  }
}

async function duplicateWorkflow(id) {
  const workflow = state.workflows.find(item => item.id === id);
  if (!workflow) return;
  const title = window.prompt("新工作流名称", `${workflow.title}副本`);
  if (!title) return;
  const defaultId = `${workflow.id}-copy`.replace(/[^a-zA-Z0-9_-]/g, "-");
  const newId = window.prompt("新工作流 ID，仅支持英文、数字、中划线和下划线", defaultId);
  if (!newId) return;
  try {
    if (state.serverMode) {
      const result = await api(`/api/admin/workflows/${encodeURIComponent(id)}/duplicate`, {
        method: "POST",
        body: JSON.stringify({ id: newId.trim(), title: title.trim() })
      });
      state.workflows = [result.workflow, ...state.workflows.filter(item => item.id !== result.workflow.id)];
    } else {
      if (state.workflows.some(item => item.id === newId.trim())) throw new Error("工作流 ID 已存在");
      state.workflows.unshift({
        ...workflow,
        id: newId.trim(),
        title: title.trim(),
        status: "draft",
        updatedAt: new Date().toISOString()
      });
    }
    renderWorkflowManagement();
    showToast("工作流副本已创建");
  } catch (error) {
    showToast(`复制失败：${error.message}`);
  }
}

async function showWorkflowVersions(id) {
  if (!state.serverMode) return showToast("连接服务端后可查看版本记录");
  try {
    const { versions } = await api(`/api/admin/workflows/${encodeURIComponent(id)}/versions`);
    if (!versions.length) return showToast("暂无版本记录");
    const { diff } = await api(`/api/admin/workflows/${encodeURIComponent(id)}/versions/diff`).catch(() => ({ diff: null }));
    const text = versions.slice(0, 6).map(item => `v${item.version} · ${item.action} · ${new Date(item.createdAt).toLocaleString("zh-CN")}`).join("\n");
    const diffText = diff?.changes?.length
      ? `\n\n最近变更：${diff.changes.slice(0, 5).map(item => `${item.label}：${item.before || "空"} -> ${item.after || "空"}`).join("；")}`
      : "";
    const target = window.prompt(`${text}${diffText}\n\n输入要恢复的版本号，留空仅查看`);
    if (!target) return;
    const version = Number(target);
    if (!Number.isInteger(version) || version <= 0) return showToast("版本号无效");
    const result = await api(`/api/admin/workflows/${encodeURIComponent(id)}/versions/${version}/restore`, {
      method: "POST",
      body: "{}"
    });
    state.workflows = state.workflows.some(item => item.id === id)
      ? state.workflows.map(item => item.id === id ? result.workflow : item)
      : [result.workflow, ...state.workflows];
    renderWorkflowManagement();
    await syncAdminData();
    showToast(`已恢复工作流 v${version}`);
  } catch (error) {
    showToast(error.message);
  }
}

async function showAgentVersions(id) {
  if (!state.serverMode) return showToast("连接服务端后可查看版本记录");
  try {
    const { versions } = await api(`/api/admin/agents/${encodeURIComponent(id)}/versions`);
    if (!versions.length) return showToast("暂无版本记录");
    const { diff } = await api(`/api/admin/agents/${encodeURIComponent(id)}/versions/diff`).catch(() => ({ diff: null }));
    const text = versions.slice(0, 6).map(item => `v${item.version} · ${item.action} · ${new Date(item.createdAt).toLocaleString("zh-CN")}`).join("\n");
    const diffText = diff?.changes?.length
      ? `\n\n最近变更：${diff.changes.slice(0, 5).map(item => `${item.label}：${item.before || "空"} -> ${item.after || "空"}`).join("；")}`
      : "";
    const target = window.prompt(`${text}${diffText}\n\n输入要恢复的版本号，留空仅查看`);
    if (!target) return;
    const version = Number(target);
    if (!Number.isInteger(version) || version <= 0) return showToast("版本号无效");
    const result = await api(`/api/admin/agents/${encodeURIComponent(id)}/versions/${version}/restore`, {
      method: "POST",
      body: "{}"
    });
    agents = agents.some(item => item.id === id)
      ? agents.map(item => item.id === id ? result.agent : item)
      : [result.agent, ...agents];
    saveAgents();
    renderAll();
    await syncAdminData();
    showToast(`已恢复智能体 v${version}`);
  } catch (error) {
    showToast(error.message);
  }
}

function renderAll() {
  renderCategories();
  renderAgents();
  renderArtifacts();
  renderHistory();
  renderManagement();
  renderOperations();
}

function setView(view) {
  $$(".view").forEach(section => section.classList.toggle("active", section.id === `view-${view}`));
  $$(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  $("#accountMenu").hidden = true;
  document.body.classList.remove("mobile-nav-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleFavorite(id) {
  state.favorites = state.favorites.includes(id)
    ? state.favorites.filter(item => item !== id)
    : [...state.favorites, id];
  localStorage.setItem(STORAGE.favorites, JSON.stringify(state.favorites));
  renderAgents();
  showToast(state.favorites.includes(id) ? "已加入我的收藏" : "已取消收藏");
}

function toggleAgentSelection(id, checked) {
  if (checked) state.selectedAgentIds.add(id);
  else state.selectedAgentIds.delete(id);
  renderManagement();
}

function toggleVisibleAgentSelection(checked) {
  const visible = filteredManagementAgents();
  for (const agent of visible) {
    if (checked) state.selectedAgentIds.add(agent.id);
    else state.selectedAgentIds.delete(agent.id);
  }
  renderManagement();
}

function toggleWorkflowSelection(id, checked) {
  if (checked) state.selectedWorkflowIds.add(id);
  else state.selectedWorkflowIds.delete(id);
  renderWorkflowManagement();
}

function toggleVisibleWorkflowSelection(checked) {
  for (const workflow of filteredManagementWorkflows()) {
    if (checked) state.selectedWorkflowIds.add(workflow.id);
    else state.selectedWorkflowIds.delete(workflow.id);
  }
  renderWorkflowManagement();
}

async function bulkUpdateWorkflowRoute() {
  const ids = [...state.selectedWorkflowIds];
  if (!ids.length) return showToast("请先选择要批量设置模型的工作流");
  const routeHint = $("#bulkWorkflowRoute")?.value || "qwen";
  const route = MODEL_ROUTES.find(item => item.id === routeHint);
  if (!route) return showToast("请选择有效模型路由");
  if (!window.confirm(`确定将 ${ids.length} 个工作流批量设为“${route.name}”吗？`)) return;
  if (state.serverMode) {
    try {
      const result = await api("/api/admin/workflows/bulk", {
        method: "PATCH",
        body: JSON.stringify({ ids, routeHint })
      });
      state.workflows = result.workflows;
      state.selectedWorkflowIds.clear();
      renderWorkflowManagement();
      await syncAdminData();
      const skipped = result.skipped?.length ? `，${result.skipped.length} 个未更新` : "";
      showToast(`已批量设置 ${result.updated} 个工作流模型${skipped}`);
    } catch (error) {
      showToast(error.message);
    }
    return;
  }
  state.workflows = (state.workflows || []).map(workflow => ids.includes(workflow.id)
    ? { ...workflow, routeHint, updatedAt: new Date().toISOString() }
    : workflow);
  state.selectedWorkflowIds.clear();
  renderWorkflowManagement();
  showToast(`离线预览已批量设为 ${route.name}`);
}

async function bulkTestWorkflows() {
  const ids = [...state.selectedWorkflowIds];
  if (!ids.length) return showToast("请先选择要测试的工作流");
  if (ids.length > 20) return showToast("一次最多测试 20 个工作流");
  if (!state.serverMode) return showToast("连接服务端后才能测试工作流");
  const prompt = window.prompt("批量测试提示词", "请用三句话验证该教学工作流的模型路由和提示词是否生效。");
  if (prompt === null) return;
  if (!window.confirm(`确认顺序测试 ${ids.length} 个工作流？测试不扣校友额度，也不会生成成果文件。`)) return;
  let passed = 0;
  let failed = 0;
  for (const id of ids) {
    try {
      await api(`/api/admin/workflows/${encodeURIComponent(id)}/test`, {
        method: "POST",
        body: JSON.stringify({ prompt: prompt.trim() || "请验证该工作流配置。" })
      });
      passed += 1;
    } catch {
      failed += 1;
    }
  }
  state.selectedWorkflowIds.clear();
  await syncAdminData();
  renderWorkflowManagement();
  showToast(`工作流批量测试完成：${passed} 通过，${failed} 失败`);
}

async function bulkUpdateAgentStatus(status) {
  const ids = [...state.selectedAgentIds];
  if (!ids.length) return showToast("请先选择要批量处理的智能体");
  const label = statusLabel(status);
  if (!window.confirm(`确定将 ${ids.length} 个智能体批量设为“${label}”吗？`)) return;
  if (state.serverMode) {
    try {
      const result = await api("/api/admin/agents/bulk", {
        method: "PATCH",
        body: JSON.stringify({ ids, status })
      });
      agents = result.agents;
      state.selectedAgentIds.clear();
      saveAgents();
      renderAll();
      await syncAdminData();
      const skipped = result.skipped?.length ? `，${result.skipped.length} 个因发布检查未通过被跳过` : "";
      showToast(`已批量更新 ${result.updated} 个智能体${skipped}`);
    } catch (error) {
      showToast(error.message);
    }
    return;
  }
  agents = agents.map(agent => ids.includes(agent.id) ? { ...agent, status, updatedAt: new Date().toISOString().slice(0, 10) } : agent);
  state.selectedAgentIds.clear();
  saveAgents();
  renderAll();
  showToast(`离线预览已批量设为${label}`);
}

async function bulkUpdateAgentRoute() {
  const ids = [...state.selectedAgentIds];
  if (!ids.length) return showToast("请先选择要批量设置模型的智能体");
  const routeHint = $("#bulkRouteHint")?.value || "qwen";
  const route = MODEL_ROUTES.find(item => item.id === routeHint);
  if (!route) return showToast("请选择有效模型路由");
  if (!window.confirm(`确定将 ${ids.length} 个智能体批量设为“${route.name}”吗？`)) return;
  if (state.serverMode) {
    try {
      const result = await api("/api/admin/agents/bulk", {
        method: "PATCH",
        body: JSON.stringify({ ids, routeHint })
      });
      agents = result.agents;
      state.selectedAgentIds.clear();
      saveAgents();
      renderAll();
      await syncAdminData();
      const skipped = result.skipped?.length ? `，${result.skipped.length} 个未更新` : "";
      showToast(`已批量设置 ${result.updated} 个智能体模型${skipped}`);
    } catch (error) {
      showToast(error.message);
    }
    return;
  }
  agents = agents.map(agent => ids.includes(agent.id) ? { ...agent, routeHint, updatedAt: new Date().toISOString().slice(0, 10) } : agent);
  state.selectedAgentIds.clear();
  saveAgents();
  renderAll();
  showToast(`离线预览已批量设为${route.name}`);
}

async function bulkTestAgents() {
  const ids = [...state.selectedAgentIds];
  if (!ids.length) return showToast("请先选择要测试的智能体");
  if (ids.length > 20) return showToast("一次最多测试 20 个智能体");
  if (!state.serverMode) return showToast("连接服务端后才能测试智能体");
  const message = window.prompt("平台对话型智能体测试问题", "请用两句话说明你能帮助教师完成什么任务。");
  if (message === null) return;
  let passed = 0;
  let failed = 0;
  for (const id of ids) {
    const agent = agents.find(item => item.id === id);
    if (!agent) continue;
    try {
      const result = await api(`/api/admin/agents/${encodeURIComponent(id)}/test`, {
        method: "POST",
        body: JSON.stringify({ message: agent.mode === "local" ? (message.trim() || "请说明你的能力。") : "ping" })
      });
      if (result.agent?.id) {
        agents = agents.map(item => item.id === result.agent.id ? { ...item, ...result.agent } : item);
      }
      passed += 1;
    } catch {
      failed += 1;
    }
  }
  state.selectedAgentIds.clear();
  saveAgents();
  await syncAdminData();
  renderManagement();
  showToast(`智能体批量测试完成：${passed} 通过，${failed} 失败`);
}

function addHistory(id) {
  const now = new Date();
  const time = `${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  state.history = [{ id, time }, ...state.history.filter(item => item.id !== id)].slice(0, 30);
  localStorage.setItem(STORAGE.history, JSON.stringify(state.history));
  renderHistory();
}

function openAgent(id) {
  const agent = agents.find(item => item.id === id);
  if (!agent || agent.status !== "published") return;
  state.activeAgent = agent;
  addHistory(id);

  if (agent.mode === "external" && agent.url) {
    window.open(agent.url, "_blank", "noopener,noreferrer");
    showToast(`正在打开 ${agent.name}`);
    return;
  }

  $("#workspaceTitle").textContent = agent.name;
  $("#workspaceIcon").outerHTML = logoMarkup(agent).replace("<span", '<span id="workspaceIcon"');
  const body = $(".workspace-body");
  body.innerHTML = `<div class="workspace-welcome" id="workspaceWelcome"></div><div class="chat-stream" id="chatStream"></div>`;

  if (agent.mode === "embed" && agent.url) {
    body.innerHTML = `<iframe class="agent-frame" src="${escapeHtml(agent.url)}" title="${escapeHtml(agent.name)}"></iframe>`;
    $(".chat-form").hidden = true;
  } else {
    $(".chat-form").hidden = false;
    $("#workspaceWelcome").innerHTML = `
      <h3>你好，我是${escapeHtml(agent.name)}</h3>
      <p>${escapeHtml(agent.description)}</p>
      <div class="suggestions">${agent.prompts.slice(0, 5).map(prompt => `<button class="suggestion" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join("")}</div>`;
  }

  $("#agentWorkspace").hidden = false;
  $("#drawerBackdrop").hidden = false;
  document.body.style.overflow = "hidden";
  refreshIcons();
  if (agent.mode !== "embed") setTimeout(() => $("#chatInput").focus(), 100);
}

function closeAgent() {
  $("#agentWorkspace").hidden = true;
  $("#drawerBackdrop").hidden = true;
  document.body.style.overflow = "";
}

async function sendMessage(text) {
  if (!text.trim() || !state.activeAgent) return;
  const agent = state.activeAgent;
  const stream = $("#chatStream");
  stream.insertAdjacentHTML("beforeend", `<div class="message user">${escapeHtml(text)}</div>`);
  const waitingId = `waiting-${Date.now()}`;
  stream.insertAdjacentHTML("beforeend", `<div class="message agent" id="${waitingId}">正在思考…</div>`);
  $(".workspace-body").scrollTop = $(".workspace-body").scrollHeight;

  if (agent.mode === "local" && state.serverMode) {
    try {
      const data = await api("/api/chat/stream", {
        method: "POST",
        body: JSON.stringify({ message: text, agentId: agent.id, routeHint: agent.routeHint || "qwen" })
      });
      const route = data.route ? `\n\n路由：${data.route.name} · ${data.route.reason}` : "";
      $(`#${waitingId}`).textContent = `${data.answer}${route}`;
    } catch (error) {
      $(`#${waitingId}`).textContent = `平台模型网关调用失败：${error.message}。失败请求不会扣减 Token。`;
    }
  } else if (agent.mode === "api" && agent.apiUrl) {
    try {
      const response = await fetch(agent.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text, agentId: agent.id, providerAlias: agent.providerAlias || "" })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      $(`#${waitingId}`).textContent = data.answer || data.message || data.content || JSON.stringify(data);
    } catch (error) {
      $(`#${waitingId}`).textContent = `接口调用失败：${error.message}。请在应用管理中检查 API 地址、跨域策略和认证配置。`;
    }
  } else {
    setTimeout(() => {
      const waiting = $(`#${waitingId}`);
      if (waiting) waiting.textContent = state.serverMode
        ? `${agent.name}已收到任务。当前应用配置尚未接入可执行通道，请在应用管理中完善接入。`
        : `${agent.name}已收到任务。静态预览模式不会调用服务端模型网关，部署 Node 服务后即可执行。`;
    }, 500);
  }
}

function updateModeFields() {
  const mode = new FormData($("#agentForm")).get("mode") || "local";
  $$("[data-mode-field]").forEach(field => {
    field.hidden = !field.dataset.modeField.split(" ").includes(mode);
  });
}

function updateLogoPreview() {
  const form = $("#agentForm");
  const data = new FormData(form);
  const preview = $("#logoPreview");
  const image = data.get("logoImage");
  const color = data.get("color") || "#8b2332";
  preview.style.setProperty("--preview-color", color);
  preview.style.setProperty("--preview-bg", `${color}18`);
  preview.innerHTML = image
    ? `<img src="${escapeHtml(image)}" alt="">`
    : `<i data-lucide="${escapeHtml(data.get("icon") || "sparkles")}"></i><b>${escapeHtml(data.get("logoText") || "智")}</b>`;
  refreshIcons();
}

function openEditor(id = null) {
  const form = $("#agentForm");
  form.reset();
  state.editingAgentId = id;
  const agent = id ? agents.find(item => item.id === id) : null;
  $("#editorTitle").textContent = agent ? "编辑智能体" : "新建智能体";
  $("#deleteAgent").hidden = !agent;

  const defaults = agent || {
    id: "", name: "", category: "教学支持", owner: "平台管理员", status: "draft",
    mode: "local", description: "", url: "", cozeUrl: "", apiUrl: "", providerAlias: "",
    routeHint: "deepseek",
    systemPrompt: "你是南京晓庄学院百年晓庄智慧教育平台的教学智能体。请围绕真实教育场景给出准确、可执行、可复用的建议。",
    logoText: "智", icon: "sparkles", color: "#8b2332", logoImage: "",
    prompts: ["请介绍你可以提供哪些帮助"]
  };

  Object.entries(defaults).forEach(([key, value]) => {
    const input = form.elements[key];
    if (!input) return;
    if (key === "mode") {
      const radio = form.querySelector(`[name="mode"][value="${value}"]`);
      if (radio) radio.checked = true;
    } else if (key === "prompts") {
      input.value = Array.isArray(value) ? value.join("\n") : value;
    } else {
      input.value = value ?? "";
    }
  });

  $("#agentEditor").hidden = false;
  $("#editorBackdrop").hidden = false;
  document.body.style.overflow = "hidden";
  updateModeFields();
  updateLogoPreview();
  refreshIcons();
}

function closeEditor() {
  $("#agentEditor").hidden = true;
  $("#editorBackdrop").hidden = true;
  document.body.style.overflow = "";
  state.editingAgentId = null;
}

async function saveAgentFromForm() {
  const data = Object.fromEntries(new FormData($("#agentForm")).entries());
  const existing = state.editingAgentId ? agents.find(agent => agent.id === state.editingAgentId) : null;
  const now = new Date().toISOString().slice(0, 10);
  const record = {
    ...(existing || {}),
    ...data,
    id: existing?.id || `agent-${Date.now().toString(36)}`,
    logoText: (data.logoText || data.name.slice(0, 1)).slice(0, 2),
    cozeUrl: (data.cozeUrl || "").trim(),
    prompts: data.prompts.split("\n").map(item => item.trim()).filter(Boolean).slice(0, 5),
    routeHint: data.routeHint || routeForCategory(data.category),
    systemPrompt: (data.systemPrompt || "").trim(),
    bg: `${data.color}18`,
    featured: existing?.featured || false,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
  if (state.serverMode) {
    try {
      const result = await api(existing ? `/api/admin/agents/${encodeURIComponent(existing.id)}` : "/api/admin/agents", {
        method: existing ? "PUT" : "POST",
        body: JSON.stringify(record)
      });
      if (existing) agents = agents.map(agent => agent.id === existing.id ? result.agent : agent);
      else agents.unshift(result.agent);
    } catch (error) {
      showToast(error.message);
      return;
    }
  } else if (existing) agents = agents.map(agent => agent.id === existing.id ? record : agent);
  else agents.unshift(record);
  saveAgents();
  renderAll();
  closeEditor();
  showToast(existing ? "智能体配置已更新" : "智能体已创建");
}

async function deleteCurrentAgent() {
  if (!state.editingAgentId) return;
  const agent = agents.find(item => item.id === state.editingAgentId);
  if (!agent || !window.confirm(`确定删除“${agent.name}”吗？此操作无法撤销。`)) return;
  if (state.serverMode) {
    try {
      await api(`/api/admin/agents/${encodeURIComponent(state.editingAgentId)}`, { method: "DELETE" });
    } catch (error) {
      showToast(error.message);
      return;
    }
  }
  agents = agents.filter(item => item.id !== state.editingAgentId);
  saveAgents();
  renderAll();
  closeEditor();
  showToast("智能体已删除");
}

async function toggleAgentStatus(id) {
  const existing = agents.find(agent => agent.id === id);
  if (!existing) return;
  const updated = { ...existing, status: existing.status === "published" ? "offline" : "published", updatedAt: new Date().toISOString().slice(0, 10) };
  if (state.serverMode) {
    try {
      const result = await api(`/api/admin/agents/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(updated) });
      agents = agents.map(agent => agent.id === id ? result.agent : agent);
    } catch (error) {
      showToast(error.message);
      return;
    }
  } else {
    agents = agents.map(agent => agent.id === id ? updated : agent);
  }
  saveAgents();
  renderAll();
  showToast("发布状态已更新");
}

async function editAgentIconLink(id) {
  if (!canManageAgentCatalog()) {
    showToast("当前账号没有维护智能体图标链接的权限");
    return;
  }
  const existing = agents.find(agent => agent.id === id);
  if (!existing) return;
  const value = window.prompt(`设置“${existing.name}”图标超链接。留空可清除当前链接。`, existing.cozeUrl || "");
  if (value === null) return;
  const cozeUrl = value.trim();
  if (cozeUrl && !/^https?:\/\//i.test(cozeUrl)) {
    showToast("请输入以 http:// 或 https:// 开头的链接");
    return;
  }
  const updated = { ...existing, cozeUrl, updatedAt: new Date().toISOString().slice(0, 10) };
  if (state.serverMode) {
    try {
      const result = await api(`/api/admin/agents/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(updated)
      });
      agents = agents.map(agent => agent.id === id ? result.agent : agent);
    } catch (error) {
      showToast(error.message);
      return;
    }
  } else {
    agents = agents.map(agent => agent.id === id ? updated : agent);
  }
  saveAgents();
  renderAll();
  showToast(cozeUrl ? "图标超链接已更新" : "图标超链接已清除");
}

async function duplicateAgent(id) {
  const existing = agents.find(agent => agent.id === id);
  if (!existing) return;
  const name = window.prompt("新智能体名称", `${existing.name}副本`);
  if (!name) return;
  const defaultId = `${existing.id}-copy`.replace(/[^a-zA-Z0-9_-]/g, "-");
  const newId = window.prompt("新智能体 ID，仅支持英文、数字、中划线和下划线", defaultId);
  if (!newId) return;
  try {
    if (state.serverMode) {
      const result = await api(`/api/admin/agents/${encodeURIComponent(id)}/duplicate`, {
        method: "POST",
        body: JSON.stringify({ id: newId.trim(), name: name.trim() })
      });
      agents = [result.agent, ...agents.filter(agent => agent.id !== result.agent.id)];
    } else {
      if (agents.some(agent => agent.id === newId.trim())) throw new Error("智能体 ID 已存在");
      agents.unshift({
        ...existing,
        id: newId.trim(),
        name: name.trim(),
        status: "draft",
        featured: false,
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10)
      });
    }
    saveAgents();
    renderAll();
    showToast("智能体副本已创建，可继续编辑后发布");
  } catch (error) {
    showToast(`复制失败：${error.message}`);
  }
}

async function testAgent(id) {
  const agent = agents.find(item => item.id === id);
  if (!agent) return;
  if (!state.serverMode) return showToast("Connect the server before testing agents");
  const message = agent.mode === "local"
    ? window.prompt(`Test ${agent.name}`, agent.prompts?.[0] || "Introduce what you can help with")
    : "ping";
  if (!message) return;
  try {
    showToast(agent.mode === "local" ? "Testing through the model gateway..." : "Checking agent connection...");
    const result = await api(`/api/admin/agents/${encodeURIComponent(id)}/test`, {
      method: "POST",
      body: JSON.stringify({ message })
    });
    if (result.agent?.id) {
      agents = agents.map(item => item.id === result.agent.id ? { ...item, ...result.agent } : item);
      saveAgents();
      renderManagement();
    }
    if (agent.mode === "local") {
      window.alert([
        `Agent: ${result.agent?.name || agent.name}`,
        `Route: ${result.route?.name || ""} - ${result.route?.reason || ""}`,
        "",
        result.answer
      ].join("\n"));
    } else {
      window.alert([
        `Agent: ${result.agent?.name || agent.name}`,
        `Mode: ${modeLabel(agent.mode)}`,
        `Status: ${result.ok ? "reachable" : "failed"}${result.status ? ` - HTTP ${result.status}` : ""}`,
        `Duration: ${result.durationMs || 0} ms`,
        result.contentType ? `Content-Type: ${result.contentType}` : ""
      ].filter(Boolean).join("\n"));
    }
    await syncAdminData();
  } catch (error) {
    const route = error.data?.route;
    showToast(route ? `${route.name || route.id} test failed: ${error.message}` : `Test failed: ${error.message}`);
  }
}

function exportAgents() {
  const selectedIds = new Set(state.selectedAgentIds);
  const visible = filteredManagementAgents();
  const selectedAgents = agents.filter(agent => selectedIds.has(agent.id));
  const exportScope = selectedAgents.length
    ? { label: "selected", title: "已勾选智能体", list: selectedAgents }
    : visible.length !== agents.length
      ? { label: "filtered", title: "当前筛选智能体", list: visible }
      : { label: "all", title: "全部智能体", list: agents };
  exportAgentSet(exportScope.list, exportScope.label, exportScope.title);
}

function exportVisibleAgents() {
  const visible = filteredManagementAgents();
  if (!visible.length) return showToast("当前筛选范围没有可导出的智能体");
  exportAgentSet(visible, "visible", "当前可见智能体");
}

function exportAgentSet(list, label, title) {
  const exportRows = list.map(agent => ({
    ...agent,
    qualityStatus: agentQualityIssues(agent).length ? "needs_attention" : "ready",
    qualityIssueCount: agentQualityIssues(agent).length,
    qualityIssues: agentQualityIssues(agent),
    qualityLabel: agentQualityLabel(agent)
  }));
  const payload = {
    platform: "百年晓庄智慧教育平台",
    version: 2,
    exportedAt: new Date().toISOString(),
    scope: title,
    total: list.length,
    qualitySummary: {
      ready: exportRows.filter(agent => agent.qualityStatus === "ready").length,
      needsAttention: exportRows.filter(agent => agent.qualityStatus !== "ready").length
    },
    agents: exportRows
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `xiaozhuang-agents-${label}-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast(`已导出 ${list.length} 个智能体`);
}

async function importAgents(file) {
  try {
    const payload = JSON.parse(await file.text());
    const imported = Array.isArray(payload) ? payload : payload.agents;
    if (!Array.isArray(imported) || !imported.length) throw new Error("文件中没有有效的 agents 数组");
    if (!imported.every(agent => agent.id && agent.name && agent.category)) throw new Error("应用数据缺少 id、name 或 category");
    const safeAgents = imported.map(({ apiToken, secret, key, qualityStatus, qualityIssueCount, qualityIssues, qualityLabel, ...agent }) => agent);
    const strategy = window.confirm(`准备导入 ${safeAgents.length} 个智能体。\n\n选择“确定”合并到当前目录；选择“取消”将替换全部目录。`)
      ? "merge"
      : "replace";
    if (strategy === "replace" && !window.confirm("替换会覆盖当前智能体目录。确定继续吗？")) return;
    if (state.serverMode) {
      const result = await api("/api/admin/agents/import", {
        method: "POST",
        body: JSON.stringify({ strategy, agents: safeAgents })
      });
      agents = result.agents;
    } else {
      if (strategy === "replace") {
        agents = safeAgents;
      } else {
        const incomingIds = new Set(safeAgents.map(agent => agent.id));
        agents = [...safeAgents, ...agents.filter(agent => !incomingIds.has(agent.id))];
      }
    }
    saveAgents();
    renderAll();
    showToast(`${strategy === "merge" ? "已合并导入" : "已替换导入"}，当前 ${agents.length} 个智能体`);
  } catch (error) {
    showToast(`导入失败：${error.message}`);
  }
}

function parseCozeLinkCsv(text) {
  const rows = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!rows.length) return [];
  const first = rows[0].split(",").map(cell => cell.trim().replace(/^"|"$/g, ""));
  const hasHeader = first.some(cell => ["id", "agentId", "cozeUrl", "url"].includes(cell));
  const idIndex = hasHeader ? first.findIndex(cell => ["id", "agentId"].includes(cell)) : 0;
  const urlIndex = hasHeader ? first.findIndex(cell => ["cozeUrl", "url"].includes(cell)) : 1;
  return rows.slice(hasHeader ? 1 : 0).map(line => {
    const cells = line.split(",").map(cell => cell.trim().replace(/^"|"$/g, ""));
    return { id: cells[idIndex] || "", cozeUrl: cells[urlIndex] || "" };
  }).filter(item => item.id && item.cozeUrl);
}

async function importCozeLinks(file) {
  try {
    const text = await file.text();
    let links;
    if (/\.csv$/i.test(file.name) || file.type.includes("csv")) {
      links = parseCozeLinkCsv(text);
    } else {
      const payload = JSON.parse(text);
      links = Array.isArray(payload) ? payload : payload.links;
    }
    if (!Array.isArray(links) || !links.length) throw new Error("文件中没有有效的 Coze 链接数据");
    const normalized = links.map(item => ({
      id: String(item.id || item.agentId || "").trim(),
      cozeUrl: String(item.cozeUrl || item.url || "").trim()
    })).filter(item => item.id && /^https:\/\/(?:www\.)?coze\.(?:cn|com)\//i.test(item.cozeUrl));
    if (!normalized.length) throw new Error("没有通过校验的 Coze 官方链接");
    if (!window.confirm(`准备更新 ${normalized.length} 个智能体的 Coze 发布页，确定继续吗？`)) return;
    if (state.serverMode) {
      const result = await api("/api/admin/agents/coze-links", {
        method: "PATCH",
        body: JSON.stringify({ links: normalized })
      });
      agents = result.agents;
      saveAgents();
      renderAll();
      await syncAdminData();
      const skipped = [result.missing?.length ? `${result.missing.length} 个 ID 未找到` : "", result.rejected?.length ? `${result.rejected.length} 行被拒绝` : ""].filter(Boolean).join("，");
      showToast(`已更新 ${result.updated} 个 Coze 发布页${skipped ? `，${skipped}` : ""}`);
      return;
    }
    const byId = new Map(normalized.map(item => [item.id, item.cozeUrl]));
    let updated = 0;
    agents = agents.map(agent => {
      if (!byId.has(agent.id)) return agent;
      updated += 1;
      return { ...agent, cozeUrl: byId.get(agent.id), updatedAt: new Date().toISOString().slice(0, 10) };
    });
    saveAgents();
    renderAll();
    showToast(`离线预览已更新 ${updated} 个 Coze 发布页`);
  } catch (error) {
    showToast(`Coze 链接导入失败：${error.message}`);
  }
}

async function backupPlatform() {
  if (!state.serverMode) return showToast("请连接服务端后再导出平台备份");
  try {
    const { backup } = await api("/api/admin/backup");
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `xiaozhuang-platform-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("平台备份已生成");
  } catch (error) {
    showToast(error.message);
  }
}

async function restorePlatform(file) {
  if (!state.serverMode) return showToast("请连接服务端后再恢复平台备份");
  if (!window.confirm("恢复会覆盖当前智能体、工作流和运营数据。确定继续吗？")) return;
  try {
    const backup = JSON.parse(await file.text());
    const result = await api("/api/admin/restore", {
      method: "POST",
      body: JSON.stringify({ backup })
    });
    await syncServerState();
    showToast(`已恢复 ${result.restored.agents} 个智能体、${result.restored.workflows} 个工作流`);
  } catch (error) {
    showToast(`恢复失败：${error.message}`);
  }
}

async function runMaintenance() {
  if (!state.serverMode) return showToast("请连接服务端后再运行维护任务");
  try {
    const { maintenance } = await api("/api/admin/maintenance", { method: "POST" });
    await loadAdminData();
    renderAll();
    showToast(`维护完成：清理会话 ${maintenance.sessionsRemoved}、认证状态 ${maintenance.oauthStatesRemoved}、Token 预占 ${maintenance.tokenReservationsRemoved}`);
  } catch (error) {
    showToast(`维护失败：${error.message}`);
  }
}

async function resetCatalog() {
  if (!state.serverMode) return showToast("请连接服务端后再恢复默认目录");
  const scopeInput = window.prompt("恢复范围：输入 all 恢复智能体和工作流，输入 agents 只恢复智能体，输入 workflows 只恢复工作流", "all");
  if (!scopeInput) return;
  const scope = scopeInput.trim().toLowerCase();
  if (!["all", "agents", "workflows"].includes(scope)) return showToast("恢复范围只能是 all、agents 或 workflows");
  if (!window.confirm("此操作会覆盖所选目录。建议先点击“备份”保存当前配置。确定继续吗？")) return;
  try {
    const result = await api("/api/admin/catalog/reset", {
      method: "POST",
      body: JSON.stringify({ scope })
    });
    agents = result.agents;
    state.workflows = result.workflows;
    state.selectedAgentIds.clear();
    saveAgents();
    renderAll();
    await syncAdminData();
    showToast(`已恢复默认目录：${result.reset.agents} 个智能体、${result.reset.workflows} 个工作流`);
  } catch (error) {
    showToast(`恢复默认目录失败：${error.message}`);
  }
}

function login() {
  $("#passwordGate").hidden = true;
  $("#loginScreen").hidden = true;
  $("#loginScreen").classList.remove("active");
  $("#appShell").hidden = false;
  refreshIcons();
}

function showLoginPrompt(message = "该功能需要登录后使用。") {
  $("#loginError").textContent = message;
  $("#loginScreen").hidden = false;
  $("#loginScreen").classList.add("active");
  $("#appShell").hidden = false;
  setTimeout(() => $("#username")?.focus(), 0);
  refreshIcons();
}

function showPasswordGate() {
  $("#appShell").hidden = true;
  $("#loginScreen").hidden = true;
  $("#passwordGate").hidden = false;
  $("#passwordChangeError").textContent = "";
  $("#currentPassword").value = "";
  $("#newPassword").value = "";
  $("#confirmPassword").value = "";
  setTimeout(() => $("#currentPassword").focus(), 0);
  refreshIcons();
}

async function submitPasswordChange() {
  const currentPassword = $("#currentPassword").value;
  const newPassword = $("#newPassword").value;
  const confirmPassword = $("#confirmPassword").value;
  if (newPassword.length < 8) {
    $("#passwordChangeError").textContent = "新密码至少 8 位。";
    return;
  }
  if (newPassword !== confirmPassword) {
    $("#passwordChangeError").textContent = "两次输入的新密码不一致。";
    return;
  }
  try {
    const result = await api("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword })
    });
    state.currentUser = result.user;
    state.serverMode = true;
    $("#passwordChangeError").textContent = "";
    await syncServerState();
    login();
    updateConnectionBadge();
    showToast("密码已更新，已进入平台");
  } catch (error) {
    $("#passwordChangeError").textContent = error.message;
  }
}

async function logout() {
  if (state.serverMode) {
    try {
      await api("/api/auth/logout", { method: "POST", body: "{}" });
    } catch {
      // Clear the local interface even when the server is unavailable.
    }
  }
  state.serverMode = false;
  state.currentUser = null;
  sessionStorage.removeItem(STORAGE.session);
  localStorage.removeItem(STORAGE.remember);
  $("#appShell").hidden = true;
  $("#appShell").hidden = false;
  $("#loginScreen").hidden = false;
  $("#loginScreen").classList.add("active");
  $("#passwordGate").hidden = true;
  $("#password").value = "";
  setView("home");
  refreshIcons();
}

function initHeroCarousel() {
  const root = $("[data-hero-carousel]");
  if (!root) return;
  const slides = $$(".hero-slide", root);
  const buttons = $$(".hero-carousel-nav button", root);
  const kicker = $("#heroKicker");
  const count = $("#heroCount");
  const title = $("#heroTitle");
  const lead = $("#heroLead");
  if (!slides.length || !buttons.length) return;

  let activeIndex = 0;
  let timer = null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setSlide = index => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === activeIndex));
    buttons.forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === activeIndex));
    const activeButton = buttons[activeIndex];
    if (kicker) kicker.textContent = activeButton.dataset.kicker || kicker.textContent;
    if (title) title.textContent = activeButton.dataset.title || title.textContent;
    if (lead) lead.textContent = activeButton.dataset.lead || lead.textContent;
    if (count) count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  };

  const start = () => {
    if (reducedMotion || timer) return;
    timer = window.setInterval(() => setSlide(activeIndex + 1), 5200);
  };
  const stop = () => {
    if (!timer) return;
    window.clearInterval(timer);
    timer = null;
  };

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      stop();
      setSlide(index);
      start();
    });
  });
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);
  setSlide(0);
  start();
}

const educationProjects = {
  century: {
    stage: "校庆课程项目",
    title: "百年晓庄校史课程包",
    summary: "围绕 1927-2027 校庆主题，把校史资料、陶行知教育思想、真实校园影像和课堂活动整合成可直接使用的教学资源。",
    progress: "72%",
    route: [
      ["Kimi", "校史长文档"],
      ["DeepSeek", "主题教案"],
      ["ChatGPT", "PPT 讲稿"],
      ["Coze", "互动展页"],
      ["Gemini", "图片解读"]
    ],
    outputs: [
      ["file-text", "百年晓庄主题教案", "Word", true],
      ["presentation", "校史课堂 PPT 大纲", "PPT", true],
      ["code-xml", "陶行知思想互动动画", "HTML", false],
      ["folder-down", "校史素材资源包", "ZIP", false]
    ]
  },
  teacher: {
    stage: "教师成长项目",
    title: "师范生课堂训练营",
    summary: "面向师范生微格教学训练，自动生成说课稿、课堂脚本、评价量表和教学反思，支持反复迭代。",
    progress: "64%",
    route: [
      ["DeepSeek", "说课与教案"],
      ["ChatGPT", "展示课件"],
      ["通义", "课堂问答"],
      ["Gemini", "课堂图片"],
      ["Kimi", "反思归档"]
    ],
    outputs: [
      ["notebook-pen", "10 分钟微格教学稿", "DOCX", true],
      ["list-checks", "课堂观察评价量表", "XLSX", true],
      ["presentation", "说课展示课件", "PPT", false],
      ["history", "教学反思记录", "PDF", false]
    ]
  },
  research: {
    stage: "科研申报项目",
    title: "教育课题申报助手",
    summary: "解析课题指南、形成选题建议、搭建研究框架，并把申报书、佐证材料和修改记录统一归档。",
    progress: "58%",
    route: [
      ["Kimi", "指南解析"],
      ["智谱 GLM", "政策知识"],
      ["DeepSeek", "研究设计"],
      ["ChatGPT", "汇报材料"],
      ["混元", "备用服务"]
    ],
    outputs: [
      ["file-search", "指南重点与选题建议", "MD", true],
      ["file-text", "课题申报书初稿", "DOCX", false],
      ["presentation", "立项汇报演示", "PPT", false],
      ["database-backup", "申报材料归档", "ZIP", false]
    ]
  },
  resource: {
    stage: "资源建设项目",
    title: "智慧课堂资源工坊",
    summary: "把题库、学案、图片素材、PDF 资料和网页动画统一组织为课堂资源包，便于复用、分享和二次编辑。",
    progress: "81%",
    route: [
      ["通义", "中文资源"],
      ["豆包", "课堂活动"],
      ["Gemini", "图片理解"],
      ["Coze", "网页动画"],
      ["ChatGPT", "资源说明"]
    ],
    outputs: [
      ["list-checks", "分层练习题库", "JSON", true],
      ["file-text", "学生学习任务单", "DOCX", true],
      ["scan-eye", "图片素材解读", "MD", true],
      ["code-xml", "课堂互动动画", "HTML", false]
    ]
  }
};

function renderProjectCommand(projectId = "century") {
  if (!$("#projectList")) return;
  const project = educationProjects[projectId] || educationProjects.century;
  $$("#projectList .project-card").forEach(button => button.classList.toggle("active", button.dataset.project === projectId));
  $("#projectStage").textContent = project.stage;
  $("#projectTitle").textContent = project.title;
  $("#projectSummary").textContent = project.summary;
  $("#projectProgress").textContent = project.progress;
  $("#projectRoute").innerHTML = project.route.map((item, index) => `
    <div class="routing-step">
      <i>${index + 1}</i>
      <strong>${escapeHtml(item[0])}</strong>
      <span>${escapeHtml(item[1])}</span>
    </div>`).join("");
  $("#projectOutputs").innerHTML = project.outputs.map(item => `
    <div class="deliverable-item ${item[3] ? "is-done" : ""}">
      <i data-lucide="${item[0]}"></i>
      <span><strong>${escapeHtml(item[1])}</strong><small>${item[3] ? "已生成，可预览" : "排队生成中"}</small></span>
      <b>${escapeHtml(item[2])}</b>
    </div>`).join("");
  refreshIcons();
}

function initProjectCommand() {
  if (!$("#projectList")) return;
  $$("#projectList .project-card").forEach(button => {
    button.addEventListener("click", () => renderProjectCommand(button.dataset.project));
  });
  renderProjectCommand($("#projectList .project-card.active")?.dataset.project || "century");
}

function initDonationDialog() {
  const dialog = $("#donationDialog");
  if (!dialog) return;
  const open = () => {
    dialog.hidden = false;
    refreshIcons();
  };
  const close = () => {
    dialog.hidden = true;
  };
  $("#donationEntry")?.addEventListener("click", open);
  $("#closeDonation")?.addEventListener("click", close);
  dialog.addEventListener("click", event => {
    if (event.target === dialog) close();
  });
  $$(".donation-options button, .donation-amounts button", dialog).forEach(button => {
    button.addEventListener("click", () => {
      $$("button", button.closest("div")).forEach(item => item.classList.remove("active"));
      button.classList.add("active");
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const now = new Date();
  $("#dateLine").textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 · 星期${"日一二三四五六"[now.getDay()]}`;
  const hour = now.getHours();
  $(".welcome-row h1").textContent = `陶老师，${hour < 11 ? "上午好" : hour < 14 ? "中午好" : hour < 18 ? "下午好" : "晚上好"}`;

  renderAll();
  if (state.conversations.length) state.activeConversationId = state.conversations[0].id;
  renderConversations();
  renderAiMessages();
  updateQuotaDisplay();
  renderTokenLedger();
  renderAlumni();
  refreshIcons();
  initHeroCarousel();
  initProjectCommand();
  initDonationDialog();
  await syncBranding();
  await connectPlatform();
  const ssoResult = new URLSearchParams(window.location.search);
  if (ssoResult.get("sso") === "failed") {
    $("#loginError").textContent = `统一身份认证失败：${ssoResult.get("reason") || "请稍后重试"}`;
    history.replaceState({}, "", location.pathname);
  } else if (ssoResult.get("sso") === "ok") {
    history.replaceState({}, "", location.pathname);
  }
  if (!state.apiAvailable && (sessionStorage.getItem(STORAGE.session) || localStorage.getItem(STORAGE.remember))) {
    state.currentUser = { id: "local-admin", username: "xz2026", displayName: "Demo 管理员", role: "super_admin" };
    login();
    applyRoleVisibility();
  }

  $("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    if (state.apiAvailable) {
      try {
        const result = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({
            username: $("#username").value.trim(),
            password: $("#password").value,
            remember: $("#rememberMe").checked
          })
        });
        state.currentUser = result.user;
        state.serverMode = true;
        $("#loginError").textContent = "";
        if (result.user.mustChangePassword) {
          showPasswordGate();
          updateConnectionBadge();
          return;
        }
        await syncServerState();
        login();
        updateConnectionBadge();
      } catch (error) {
        $("#loginError").textContent = error.message;
      }
      return;
    }
    const valid = $("#username").value.trim().toLowerCase() === "xz2026" && $("#password").value === "xz2026";
    if (!valid) {
      $("#loginError").textContent = "账号或密码不正确，请使用平台账号登录。";
      return;
    }
    $("#loginError").textContent = "";
    state.currentUser = { id: "local-admin", username: "xz2026", displayName: "Demo 管理员", role: "super_admin" };
    sessionStorage.setItem(STORAGE.session, "active");
    if ($("#rememberMe").checked) localStorage.setItem(STORAGE.remember, "active");
    login();
    applyRoleVisibility();
  });

  $("#passwordToggle").addEventListener("click", () => {
    const password = $("#password");
    password.type = password.type === "password" ? "text" : "password";
    $("#passwordToggle").innerHTML = `<i data-lucide="${password.type === "password" ? "eye" : "eye-off"}"></i>`;
    refreshIcons();
  });

  $("#ssoLoginButton").addEventListener("click", () => {
    if (!state.sso?.enabled) {
      $("#loginError").textContent = "统一身份认证暂未配置，请使用平台账号登录。";
      return;
    }
    window.location.href = apiUrl("/api/auth/sso");
  });

  $("#passwordChangeForm").addEventListener("submit", async event => {
    event.preventDefault();
    await submitPasswordChange();
  });

  document.addEventListener("click", event => {
    const viewButton = event.target.closest("[data-view]");
    const favoriteButton = event.target.closest("[data-favorite]");
    const launchButton = event.target.closest("[data-launch]");
    const categoryButton = event.target.closest("[data-category]");
    const toastButton = event.target.closest("[data-toast]");
    const promptButton = event.target.closest("[data-prompt]");
    const editButton = event.target.closest("[data-edit-agent]");
    const editAgentLinkButton = event.target.closest("[data-edit-agent-link]");
    const toggleButton = event.target.closest("[data-toggle-agent]");
    const testAgentButton = event.target.closest("[data-test-agent]");
    const duplicateAgentButton = event.target.closest("[data-duplicate-agent]");
    const agentVersionsButton = event.target.closest("[data-agent-versions]");
    const workflowButton = event.target.closest("[data-workflow]");
    const aiPromptButton = event.target.closest("[data-ai-prompt]");
    const conversationButton = event.target.closest("[data-conversation]");
    const removeAttachmentButton = event.target.closest("[data-remove-attachment]");
    const approveAlumniButton = event.target.closest("[data-approve-alumni]");
    const rejectAlumniButton = event.target.closest("[data-reject-alumni]");
    const saveWorkflowButton = event.target.closest("[data-save-workflow]");
    const toggleWorkflowButton = event.target.closest("[data-toggle-workflow]");
    const editWorkflowPromptButton = event.target.closest("[data-edit-workflow-prompt]");
    const editWorkflowSpecButton = event.target.closest("[data-edit-workflow-spec]");
    const testWorkflowButton = event.target.closest("[data-test-workflow]");
    const duplicateWorkflowButton = event.target.closest("[data-duplicate-workflow]");
    const workflowVersionsButton = event.target.closest("[data-workflow-versions]");
    const deleteWorkflowButton = event.target.closest("[data-delete-workflow]");
    const saveUserButton = event.target.closest("[data-save-user]");
    const toggleUserButton = event.target.closest("[data-toggle-user]");
    const resetUserButton = event.target.closest("[data-reset-user]");
    const feedbackStatusButton = event.target.closest("[data-feedback-status]");
    const testProviderButton = event.target.closest("[data-test-provider]");
    const selectAgentCheckbox = event.target.closest("[data-select-agent]");
    const selectWorkflowCheckbox = event.target.closest("[data-select-workflow]");
    const selectArtifactCheckbox = event.target.closest("[data-select-artifact]");
    const bulkAgentStatusButton = event.target.closest("[data-bulk-agent-status]");
    const deleteArtifactButton = event.target.closest("[data-delete-artifact]");
    if (viewButton) {
      const protectedViews = new Set(["management"]);
      if (protectedViews.has(viewButton.dataset.view) && !hasAdminConsoleAccess()) {
        showLoginPrompt("应用管理需要登录后使用。Demo 账号：xz2026 / xz2026");
      } else {
        setView(viewButton.dataset.view);
      }
    }
    if (favoriteButton) toggleFavorite(favoriteButton.dataset.favorite);
    if (launchButton) openAgent(launchButton.dataset.launch);
    if (categoryButton) {
      state.category = categoryButton.dataset.category;
      renderCategories();
      renderAgents();
    }
    if (toastButton) showToast(toastButton.dataset.toast);
    if (promptButton) {
      $("#chatInput").value = promptButton.dataset.prompt;
      $("#chatInput").focus();
    }
    if (editAgentLinkButton) editAgentIconLink(editAgentLinkButton.dataset.editAgentLink);
    if (editButton) {
      if (!canManageAgentCatalog()) showToast("当前账号没有编辑智能体目录的权限");
      else openEditor(editButton.dataset.editAgent);
    }
    if (toggleButton) {
      if (!canManageAgentCatalog()) showToast("当前账号没有发布或下架智能体的权限");
      else toggleAgentStatus(toggleButton.dataset.toggleAgent);
    }
    if (testAgentButton) testAgent(testAgentButton.dataset.testAgent);
    if (duplicateAgentButton) {
      if (!canManageAgentCatalog()) showToast("当前账号没有复制智能体的权限");
      else duplicateAgent(duplicateAgentButton.dataset.duplicateAgent);
    }
    if (agentVersionsButton) showAgentVersions(agentVersionsButton.dataset.agentVersions);
    if (selectAgentCheckbox) toggleAgentSelection(selectAgentCheckbox.dataset.selectAgent, selectAgentCheckbox.checked);
    if (selectWorkflowCheckbox) toggleWorkflowSelection(selectWorkflowCheckbox.dataset.selectWorkflow, selectWorkflowCheckbox.checked);
    if (selectArtifactCheckbox) {
      if (selectArtifactCheckbox.checked) state.selectedArtifactIds.add(selectArtifactCheckbox.dataset.selectArtifact);
      else state.selectedArtifactIds.delete(selectArtifactCheckbox.dataset.selectArtifact);
      renderArtifacts();
    }
    if (bulkAgentStatusButton) bulkUpdateAgentStatus(bulkAgentStatusButton.dataset.bulkAgentStatus);
    if (workflowButton) {
      setView("ai");
      const prompt = workflowPrompts[workflowButton.dataset.workflow] || "";
      $("#aiInput").value = prompt;
      $("#aiInput").focus();
      if (state.serverMode) {
        $("#aiInput").value = "";
        submitAiTask(prompt, workflowButton.dataset.workflow);
      }
    }
    if (aiPromptButton) {
      $("#aiInput").value = aiPromptButton.dataset.aiPrompt;
      $("#aiInput").focus();
    }
    if (conversationButton) {
      state.activeConversationId = conversationButton.dataset.conversation;
      renderConversations();
      renderAiMessages();
    }
    if (removeAttachmentButton) {
      state.aiAttachments.splice(Number(removeAttachmentButton.dataset.removeAttachment), 1);
      renderAttachments();
    }
    if (approveAlumniButton) approveAlumni(approveAlumniButton.dataset.approveAlumni);
    if (rejectAlumniButton) rejectAlumni(rejectAlumniButton.dataset.rejectAlumni);
    if (saveWorkflowButton) {
      const id = saveWorkflowButton.dataset.saveWorkflow;
      saveWorkflow(id, { routeHint: $(`[data-workflow-route="${CSS.escape(id)}"]`)?.value || "qwen" });
    }
    if (toggleWorkflowButton) {
      const workflow = state.workflows.find(item => item.id === toggleWorkflowButton.dataset.toggleWorkflow);
      if (workflow) saveWorkflow(workflow.id, { status: workflow.status === "offline" ? "published" : "offline" });
    }
    if (editWorkflowPromptButton) editWorkflowPrompt(editWorkflowPromptButton.dataset.editWorkflowPrompt);
    if (editWorkflowSpecButton) editWorkflowSpec(editWorkflowSpecButton.dataset.editWorkflowSpec);
    if (testWorkflowButton) testWorkflow(testWorkflowButton.dataset.testWorkflow);
    if (duplicateWorkflowButton) duplicateWorkflow(duplicateWorkflowButton.dataset.duplicateWorkflow);
    if (workflowVersionsButton) showWorkflowVersions(workflowVersionsButton.dataset.workflowVersions);
    if (deleteWorkflowButton) deleteWorkflow(deleteWorkflowButton.dataset.deleteWorkflow);
    if (saveUserButton) {
      const id = saveUserButton.dataset.saveUser;
      saveUser(id, { role: $(`[data-user-role="${CSS.escape(id)}"]`)?.value || "teacher" });
    }
    if (toggleUserButton) {
      const user = state.users.find(item => item.id === toggleUserButton.dataset.toggleUser);
      if (user) saveUser(user.id, { status: user.status === "disabled" ? "active" : "disabled" });
    }
    if (resetUserButton) {
      const password = window.prompt("输入新密码（至少 8 位）");
      if (password) saveUser(resetUserButton.dataset.resetUser, { password });
    }
    if (feedbackStatusButton) updateFeedbackStatus(feedbackStatusButton.dataset.feedbackStatus, feedbackStatusButton.dataset.status);
    if (testProviderButton) testProvider(testProviderButton.dataset.testProvider);
    if (deleteArtifactButton) deleteArtifact(deleteArtifactButton.dataset.deleteArtifact);
  });

  $("#globalSearch").addEventListener("input", event => {
    state.query = event.target.value;
    renderAgents();
    setView("agents");
  });
  $("#managementSearch").addEventListener("input", event => {
    state.managementQuery = event.target.value;
    renderManagement();
  });
  $("#managementStatus").addEventListener("change", event => {
    state.managementStatus = event.target.value;
    renderManagement();
  });
  $("#managementQuality").addEventListener("change", event => {
    state.managementQuality = event.target.value;
    renderManagement();
  });
  $("#managementTestStatus").addEventListener("change", event => {
    state.managementTestStatus = event.target.value;
    renderManagement();
  });
  $("#managementSort").addEventListener("change", event => {
    state.managementSort = event.target.value;
    renderManagement();
  });
  $("#selectVisibleAgents").addEventListener("change", event => {
    toggleVisibleAgentSelection(event.target.checked);
  });
  $("#bulkRouteButton").addEventListener("click", bulkUpdateAgentRoute);
  $("#bulkAgentTestButton").addEventListener("click", bulkTestAgents);
  $("#workflowSearch").addEventListener("input", event => {
    state.workflowQuery = event.target.value;
    renderWorkflowManagement();
  });
  $("#workflowTestStatus").addEventListener("change", event => {
    state.workflowTestStatus = event.target.value;
    renderWorkflowManagement();
  });
  $("#workflowQuality").addEventListener("change", event => {
    state.workflowQuality = event.target.value;
    renderWorkflowManagement();
  });
  $("#workflowSort").addEventListener("change", event => {
    state.workflowSort = event.target.value;
    renderWorkflowManagement();
  });
  $("#selectVisibleWorkflows").addEventListener("change", event => {
    toggleVisibleWorkflowSelection(event.target.checked);
  });
  $("#bulkWorkflowRouteButton").addEventListener("click", bulkUpdateWorkflowRoute);
  $("#bulkWorkflowTestButton").addEventListener("click", bulkTestWorkflows);
  $("#conversationSearch").addEventListener("input", renderConversations);
  $("#createUser").addEventListener("click", createUser);
  $("#exportUsers").addEventListener("click", exportUsers);
  $("#userSearch").addEventListener("input", event => {
    state.userQuery = event.target.value;
    renderUserManagement();
  });
  $("#userRoleFilter").addEventListener("change", event => {
    state.userRole = event.target.value;
    renderUserManagement();
  });
  $("#userStatusFilter").addEventListener("change", event => {
    state.userStatus = event.target.value;
    renderUserManagement();
  });
  $("#exportTokenLedger").addEventListener("click", exportTokenLedger);
  $("#metricsWindow").addEventListener("change", event => {
    state.metricsWindow = event.target.value;
    refreshMetrics();
  });
  $("#exportModelRuns").addEventListener("click", exportModelRuns);
  $("#exportProviders").addEventListener("click", exportProviders);
  $("#modelRunSearch").addEventListener("input", event => {
    state.modelRunQuery = event.target.value;
    renderModelRuns();
  });
  $("#modelRunStatusFilter").addEventListener("change", event => {
    state.modelRunStatus = event.target.value;
    renderModelRuns();
  });
  $("#modelRunRouteFilter").addEventListener("change", event => {
    state.modelRunRoute = event.target.value;
    renderModelRuns();
  });
  $("#bulkProviderTest").addEventListener("click", bulkTestConfiguredProviders);
  $("#providerSearch").addEventListener("input", event => {
    state.providerQuery = event.target.value;
    renderOperations();
  });
  $("#providerConfigFilter").addEventListener("change", event => {
    state.providerConfig = event.target.value;
    renderOperations();
  });
  $("#providerTypeFilter").addEventListener("change", event => {
    state.providerType = event.target.value;
    renderOperations();
  });
  $("#exportAuditLogs").addEventListener("click", exportAuditLogs);
  $("#auditSearch").addEventListener("input", event => {
    state.auditQuery = event.target.value;
    renderAuditLogs();
  });
  $("#auditActionFilter").addEventListener("change", event => {
    state.auditAction = event.target.value;
    renderAuditLogs();
  });
  $("#readinessSearch").addEventListener("input", event => {
    state.readinessQuery = event.target.value;
    renderReadiness();
  });
  $("#readinessLevelFilter").addEventListener("change", event => {
    state.readinessLevel = event.target.value;
    renderReadiness();
  });
  $("#readinessOwnerFilter").addEventListener("change", event => {
    state.readinessOwner = event.target.value;
    renderReadiness();
  });
  $("#exportReadiness").addEventListener("click", exportReadiness);
  $("#exportVersionHistory").addEventListener("click", exportVersionHistory);
  $("#exportFeedback").addEventListener("click", exportFeedback);
  $("#feedbackSearch").addEventListener("input", event => {
    state.feedbackQuery = event.target.value;
    renderFeedbackManagement();
  });
  $("#feedbackStatusFilter").addEventListener("change", event => {
    state.feedbackStatus = event.target.value;
    renderFeedbackManagement();
  });
  $("#feedbackTypeFilter").addEventListener("change", event => {
    state.feedbackType = event.target.value;
    renderFeedbackManagement();
  });
  $("#exportAlumni").addEventListener("click", exportAlumniApplications);
  $("#alumniReviewSearch").addEventListener("input", event => {
    state.alumniReviewQuery = event.target.value;
    renderAlumniReview();
  });
  $("#alumniReviewStatus").addEventListener("change", event => {
    state.alumniReviewStatus = event.target.value;
    renderAlumniReview();
  });
  $("#exportArtifacts").addEventListener("click", exportArtifacts);
  $("#cleanupArtifacts").addEventListener("click", cleanupArtifacts);
  $("#selectVisibleArtifacts").addEventListener("change", event => selectVisibleArtifacts(event.target.checked));
  $("#bulkDeleteArtifacts").addEventListener("click", bulkDeleteArtifacts);
  $("#artifactSearch").addEventListener("input", event => {
    state.artifactQuery = event.target.value;
    renderArtifacts();
  });
  $("#artifactTypeFilter").addEventListener("change", event => {
    state.artifactType = event.target.value;
    renderArtifacts();
  });
  $("#artifactWorkflowFilter").addEventListener("change", event => {
    state.artifactWorkflow = event.target.value;
    renderArtifacts();
  });
  $("#createWorkflow").addEventListener("click", createWorkflow);
  $("#exportWorkflows").addEventListener("click", exportWorkflows);
  $("#exportVisibleWorkflows").addEventListener("click", exportVisibleWorkflows);
  $("#importWorkflows").addEventListener("click", () => $("#workflowImportFile").click());

  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      $("#globalSearch").focus();
    }
    if (event.key === "Escape") {
      closeAgent();
      closeEditor();
      $("#accountMenu").hidden = true;
    }
  });

  $("#collapseSidebar").addEventListener("click", () => document.body.classList.toggle("sidebar-collapsed"));
  $("#mobileMenu").addEventListener("click", () => document.body.classList.toggle("mobile-nav-open"));
  $("#userMenu").addEventListener("click", () => {
    $("#accountMenu").hidden = !$("#accountMenu").hidden;
    $("#userMenu").setAttribute("aria-expanded", String(!$("#accountMenu").hidden));
  });
  $("#logoutButton").addEventListener("click", logout);
  $("#clearHistory").addEventListener("click", () => {
    state.history = [];
    localStorage.removeItem(STORAGE.history);
    renderHistory();
    showToast("使用记录已清空");
  });

  $("#closeWorkspace").addEventListener("click", closeAgent);
  $("#drawerBackdrop").addEventListener("click", closeAgent);
  $("#externalAgent").addEventListener("click", () => {
    const cozeUrl = agentCozeUrl(state.activeAgent || {});
    if (cozeUrl) window.open(cozeUrl, "_blank", "noopener,noreferrer");
    else if (state.activeAgent?.url) window.open(state.activeAgent.url, "_blank", "noopener,noreferrer");
    else showToast("此应用未配置外部地址");
  });
  $("#chatForm").addEventListener("submit", event => {
    event.preventDefault();
    sendMessage($("#chatInput").value);
    $("#chatInput").value = "";
  });
  $("#chatInput").addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      $("#chatForm").requestSubmit();
    }
  });

  $("#newChat").addEventListener("click", createConversation);
  $("#attachFile").addEventListener("click", () => $("#aiFileInput").click());
  $("#aiFileInput").addEventListener("change", event => {
    const files = [...event.target.files];
    const accepted = files.filter(file => {
      const allowed = file.type === "application/pdf" || file.type.startsWith("image/");
      if (!allowed) showToast(`${file.name} 不是支持的 PDF 或图片格式`);
      else if (file.size > 10 * 1024 * 1024) showToast(`${file.name} 超过 10MB`);
      return allowed && file.size <= 10 * 1024 * 1024;
    });
    state.aiAttachments.push(...accepted);
    renderAttachments();
    event.target.value = "";
  });
  $("#aiComposer").addEventListener("submit", event => {
    event.preventDefault();
    const text = $("#aiInput").value.trim();
    if (!text) return;
    $("#aiInput").value = "";
    submitAiTask(text);
  });
  $("#aiInput").addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      $("#aiComposer").requestSubmit();
    }
  });
  $("#previewArtifact").addEventListener("click", () => showToast("成果已在右侧预览"));
  $("#downloadArtifact").addEventListener("click", () => {
    const conversation = currentConversation();
    const artifact = state.currentArtifact || [...(conversation?.messages || [])].reverse().find(message => message.artifact)?.artifact;
    if (!artifact) return showToast("当前对话暂无可下载成果");
    if (artifact.downloadUrl) {
      window.open(apiUrl(artifact.downloadUrl), "_blank", "noopener,noreferrer");
      return;
    }
    const blob = new Blob([`<!doctype html><meta charset="utf-8"><title>${artifact.title}</title>${artifact.html}`], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${artifact.title}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  });

  $("#alumniForm").addEventListener("submit", async event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const proof = $("#alumniProof").files[0];
    if (state.serverMode) {
      try {
        const upload = await api("/api/files", {
          method: "POST",
          headers: { "Content-Type": proof.type, "X-File-Name": encodeURIComponent(proof.name) },
          body: proof
        });
        const result = await api("/api/alumni/applications", {
          method: "POST",
          body: JSON.stringify({
            name: data.name,
            graduationYear: data.graduationYear,
            college: data.college,
            major: data.major,
            phone: data.phone,
            email: data.email,
            proofFileId: upload.file.id
          })
        });
        state.alumni = result.application;
        if (result.quota) {
          state.quota = { ...state.quota, ...result.quota };
          const ledger = await api("/api/alumni/ledger");
          state.quota.ledger = ledger.ledger;
          updateQuotaDisplay();
          renderTokenLedger();
        }
        renderAlumni();
        await syncAdminData();
        showToast(result.application.status === "approved" ? "校友会联合认证已通过，1,000,000 Token 已发放" : "校友认证申请已提交，工作人员将进行人工审核");
      } catch (error) {
        showToast(error.message);
      }
      return;
    }
    state.alumni = {
      id: `alumni-${Date.now().toString(36)}`,
      status: "pending",
      name: data.name,
      graduationYear: data.graduationYear,
      college: data.college,
      major: data.major,
      phone: data.phone,
      email: data.email,
      proofName: proof?.name || "",
      submittedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE.alumni, JSON.stringify(state.alumni));
    renderAlumni();
    renderOperations();
    showToast("校友认证申请已提交，工作人员将进行人工审核");
  });

  $("#createAgent").addEventListener("click", () => openEditor());
  $("#closeEditor").addEventListener("click", closeEditor);
  $("#cancelEditor").addEventListener("click", closeEditor);
  $("#editorBackdrop").addEventListener("click", closeEditor);
  $("#deleteAgent").addEventListener("click", deleteCurrentAgent);
  $("#agentForm").addEventListener("submit", event => {
    event.preventDefault();
    saveAgentFromForm();
  });
  $("#modeSegments").addEventListener("change", updateModeFields);
  ["logoText", "icon", "color"].forEach(name => $("#agentForm").elements[name].addEventListener("input", updateLogoPreview));
  $("#logoUpload").addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 600 * 1024) {
      showToast("Logo 文件请控制在 600KB 以内");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      $("#agentForm").elements.logoImage.value = reader.result;
      updateLogoPreview();
    };
    reader.readAsDataURL(file);
  });
  $("#clearLogoImage").addEventListener("click", () => {
    $("#agentForm").elements.logoImage.value = "";
    $("#logoUpload").value = "";
    updateLogoPreview();
  });

  $("#exportAgents").addEventListener("click", exportAgents);
  $("#exportAgentQuality").addEventListener("click", exportAgentQuality);
  $("#exportVisibleAgents").addEventListener("click", exportVisibleAgents);
  $("#exportCozeTemplate").addEventListener("click", exportCozeTemplate);
  $("#importAgents").addEventListener("click", () => $("#importFile").click());
  $("#importCozeLinks").addEventListener("click", () => $("#cozeLinksFile").click());
  $("#backupPlatform").addEventListener("click", backupPlatform);
  $("#restorePlatform").addEventListener("click", () => $("#restoreFile").click());
  $("#runMaintenance").addEventListener("click", runMaintenance);
  $("#resetCatalog").addEventListener("click", resetCatalog);
  $("#importFile").addEventListener("change", event => {
    if (event.target.files[0]) importAgents(event.target.files[0]);
    event.target.value = "";
  });
  $("#cozeLinksFile").addEventListener("change", event => {
    if (event.target.files[0]) importCozeLinks(event.target.files[0]);
    event.target.value = "";
  });
  $("#restoreFile").addEventListener("change", event => {
    if (event.target.files[0]) restorePlatform(event.target.files[0]);
    event.target.value = "";
  });
  $("#brandingForm").addEventListener("submit", saveBranding);
  $("#tokenAdjustmentForm").addEventListener("submit", submitTokenAdjustment);
  $("#workflowImportFile").addEventListener("change", event => {
    if (event.target.files[0]) importWorkflows(event.target.files[0]);
    event.target.value = "";
  });
  $("#exportWorkflowQuality").addEventListener("click", exportWorkflowQuality);

  $("#feedbackForm").addEventListener("submit", async event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    if (state.serverMode) {
      try {
        await api("/api/feedback", {
          method: "POST",
          body: JSON.stringify(data)
        });
        event.target.reset();
        await syncAdminData();
        showToast("感谢反馈，已进入平台处理队列");
      } catch (error) {
        showToast(error.message);
      }
      return;
    }
    event.target.reset();
    showToast("静态预览模式不会保存反馈，请连接服务端后提交");
  });
  $("#profileForm").addEventListener("submit", event => {
    event.preventDefault();
    showToast("个人资料已保存");
  });
});
