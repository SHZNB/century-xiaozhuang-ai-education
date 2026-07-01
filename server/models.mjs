const routes = [
  { id: "kimi", name: "Kimi", reason: "长文本与 PDF 上下文分析", domestic: true, patterns: [/pdf|文档|长文|论文|总结|提炼|分析材料/i] },
  { id: "deepseek", name: "DeepSeek", reason: "教案与教学设计", domestic: true, patterns: [/教案|教学设计|课程设计|课堂|评价量规|说课|作业设计/i] },
  { id: "chatgpt", name: "ChatGPT", reason: "PPT 结构与 HTML 演示生成", domestic: false, patterns: [/ppt|课件|幻灯片|演示|讲稿/i] },
  { id: "coze", name: "Coze Workflow", reason: "HTML 网页与交互动画", domestic: true, patterns: [/html|网页|动画|交互|可视化|小游戏/i] },
  { id: "gemini", name: "Gemini", reason: "图片与图表理解", domestic: false, patterns: [/图片|照片|图表|看图|识图/i] },
  { id: "ernie", name: "文心一言", reason: "教育政策与中文知识", domestic: true, patterns: [/政策|文件精神|法规|制度|通知解读/i] },
  { id: "qwen", name: "通义千问", reason: "中文通用教育任务", domestic: true, patterns: [/.*/] }
];

const providerConfig = {
  kimi: {
    type: "chat-completions",
    key: "MOONSHOT_API_KEY",
    url: "MOONSHOT_API_URL",
    model: "MOONSHOT_MODEL",
    defaultUrl: "https://api.moonshot.cn/v1/chat/completions",
    defaultModel: "moonshot-v1-32k"
  },
  deepseek: {
    type: "chat-completions",
    key: "DEEPSEEK_API_KEY",
    url: "DEEPSEEK_API_URL",
    model: "DEEPSEEK_MODEL",
    defaultUrl: "https://api.deepseek.com/v1/chat/completions",
    defaultModel: "deepseek-chat"
  },
  qwen: {
    type: "chat-completions",
    key: "QWEN_API_KEY",
    url: "QWEN_API_URL",
    model: "QWEN_MODEL",
    defaultUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    defaultModel: "qwen-plus"
  },
  doubao: { type: "chat-completions", key: "DOUBAO_API_KEY", url: "DOUBAO_API_URL", model: "DOUBAO_MODEL" },
  glm: { type: "chat-completions", key: "GLM_API_KEY", url: "GLM_API_URL", model: "GLM_MODEL" },
  ernie: { type: "chat-completions", key: "ERNIE_API_KEY", url: "ERNIE_API_URL", model: "ERNIE_MODEL" },
  hunyuan: { type: "chat-completions", key: "HUNYUAN_API_KEY", url: "HUNYUAN_API_URL", model: "HUNYUAN_MODEL" },
  chatgpt: {
    type: "openai-responses",
    key: "OPENAI_API_KEY",
    url: "OPENAI_API_URL",
    model: "OPENAI_MODEL",
    defaultUrl: "https://api.openai.com/v1/responses",
    defaultModel: "gpt-5"
  },
  gemini: {
    type: "gemini",
    key: "GEMINI_API_KEY",
    url: "GEMINI_API_URL",
    model: "GEMINI_MODEL",
    defaultUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    defaultModel: "gemini-2.5-flash"
  },
  coze: { type: "coze", key: "COZE_API_KEY", url: "COZE_API_URL", model: "COZE_WORKFLOW_ID" }
};

const fallbackMap = {
  kimi: ["qwen", "hunyuan"],
  deepseek: ["qwen", "hunyuan"],
  chatgpt: ["gemini", "qwen", "hunyuan"],
  coze: ["qwen", "hunyuan"],
  gemini: ["qwen", "hunyuan"],
  ernie: ["glm", "qwen", "hunyuan"],
  glm: ["qwen", "hunyuan"],
  qwen: ["hunyuan"],
  doubao: ["qwen", "hunyuan"]
};

const routeMetadata = {
  qwen: { id: "qwen", name: "通义千问", reason: "中文通用教育任务", domestic: true },
  gemini: { id: "gemini", name: "Gemini", reason: "海外多模态备用模型", domestic: false },
  glm: { id: "glm", name: "智谱 GLM", reason: "中文知识任务备用模型", domestic: true },
  hunyuan: { id: "hunyuan", name: "腾讯混元", reason: "平台故障备用模型", domestic: true }
};

export function chooseRoute(message, attachments = [], hint = "") {
  const trustedHint = routes.find(route => route.id === hint);
  const hasPdf = attachments.some(file => file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf"));
  const hasImage = attachments.some(file => file.type?.startsWith("image/"));
  if (hasPdf) return routes[0];
  if (hasImage) return routes[4];
  if (trustedHint && trustedHint.patterns.some(pattern => pattern.test(message))) return trustedHint;
  return routes.find(route => route.patterns.some(pattern => pattern.test(message))) || routes.at(-1);
}

export function routeById(id) {
  return routes.find(route => route.id === id) || routeMetadata[id] || null;
}

export function providerStatuses() {
  return Object.entries(providerConfig).map(([id, config]) => {
    const missingEnv = [
      process.env[config.key] ? "" : config.key,
      process.env[config.url] || config.defaultUrl ? "" : config.url,
      process.env[config.model] || config.defaultModel ? "" : config.model
    ].filter(Boolean);
    return {
      id,
      configured: missingEnv.length === 0,
      model: process.env[config.model] || config.defaultModel || "",
      type: config.type,
      envNames: [config.key, config.url, config.model].filter(Boolean),
      missingEnv,
      hasDefaultUrl: Boolean(config.defaultUrl),
      hasDefaultModel: Boolean(config.defaultModel),
      fallbacks: fallbackMap[id] || []
    };
  });
}

export function providerEnvironment(id) {
  const config = providerConfig[id];
  if (!config) return null;
  return {
    id,
    type: config.type,
    key: config.key,
    url: config.url,
    model: config.model,
    defaultUrl: config.defaultUrl || "",
    defaultModel: config.defaultModel || "",
    fallbacks: fallbackMap[id] || []
  };
}

export async function callModel(route, messages, options = {}) {
  const config = providerConfig[route.id];
  if (!config) throw providerError(route, "该模型提供方尚未配置适配器");
  const apiKey = process.env[config.key];
  const url = process.env[config.url] || config.defaultUrl;
  const model = process.env[config.model] || config.defaultModel;
  if (!apiKey || !url || !model) throw providerError(route, `服务端未配置 ${route.name} 的密钥、地址或模型`);

  if (config.type === "openai-responses") return callOpenAiResponses(url, apiKey, model, messages, options);
  if (config.type === "gemini") return callGemini(url, apiKey, model, messages, options);
  if (config.type === "coze") return callCoze(url, apiKey, model, messages, options);
  return callChatCompletions(url, apiKey, model, messages, options);
}

export async function callModelWithFallback(route, messages, options = {}) {
  const attempts = [];
  try {
    const result = await callModel(route, messages, options);
    return { ...result, route, fallbackUsed: false, attempts: [{ id: route.id, ok: true }] };
  } catch (primaryError) {
    attempts.push({ id: route.id, ok: false, error: primaryError.message });
    for (const fallbackId of fallbackMap[route.id] || []) {
      const fallback = routeById(fallbackId);
      if (!fallback || !isConfigured(fallbackId)) {
        attempts.push({ id: fallbackId, ok: false, error: "not configured" });
        continue;
      }
      try {
        const result = await callModel(fallback, messages, options);
        attempts.push({ id: fallback.id, ok: true });
        return {
          ...result,
          route: { ...fallback, reason: `${route.name} 暂不可用，已切换至 ${fallback.name}` },
          primaryRoute: route,
          primaryError: primaryError.message,
          fallbackUsed: true,
          attempts
        };
      } catch (fallbackError) {
        attempts.push({ id: fallback.id, ok: false, error: fallbackError.message });
      }
    }
    primaryError.attempts = attempts;
    throw primaryError;
  }
}

function isConfigured(id) {
  const config = providerConfig[id];
  return Boolean(config && process.env[config.key] && (process.env[config.url] || config.defaultUrl) && (process.env[config.model] || config.defaultModel));
}

async function callChatCompletions(url, apiKey, model, messages, options) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: options.maxOutputTokens })
  });
  const data = await parseResponse(response);
  return {
    answer: data.choices?.[0]?.message?.content || "",
    usage: normalizeUsage(data.usage),
    model: data.model || model
  };
}

async function callOpenAiResponses(url, apiKey, model, messages, options) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      input: messages.map(message => ({ role: message.role, content: message.content })),
      max_output_tokens: options.maxOutputTokens
    })
  });
  const data = await parseResponse(response);
  const answer = data.output_text || data.output?.flatMap(item => item.content || []).find(item => item.type === "output_text")?.text || "";
  return {
    answer,
    usage: {
      inputTokens: data.usage?.input_tokens || 0,
      outputTokens: data.usage?.output_tokens || 0
    },
    model: data.model || model
  };
}

async function callGemini(baseUrl, apiKey, model, messages, options) {
  const url = `${baseUrl.replace(/\/$/, "")}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: messages.map(message => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }]
      })),
      generationConfig: { maxOutputTokens: options.maxOutputTokens }
    })
  });
  const data = await parseResponse(response);
  return {
    answer: data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") || "",
    usage: {
      inputTokens: data.usageMetadata?.promptTokenCount || 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount || 0
    },
    model
  };
}

async function callCoze(url, apiKey, workflowId, messages, options) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      workflow_id: workflowId,
      parameters: { prompt: messages.at(-1)?.content || "", messages, max_output_tokens: options.maxOutputTokens }
    })
  });
  const data = await parseResponse(response);
  const answer = data.data?.output || data.output || data.message || JSON.stringify(data.data || data);
  return { answer, usage: normalizeUsage(data.usage), model: workflowId };
}

async function parseResponse(response) {
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }
  if (!response.ok) {
    const error = new Error(data.error?.message || data.message || `模型接口返回 HTTP ${response.status}`);
    error.status = 502;
    error.providerResponse = data;
    throw error;
  }
  return data;
}

function normalizeUsage(usage = {}) {
  return {
    inputTokens: usage.prompt_tokens || usage.input_tokens || 0,
    outputTokens: usage.completion_tokens || usage.output_tokens || 0
  };
}

function providerError(route, message) {
  const error = new Error(message);
  error.status = 503;
  error.expose = true;
  error.route = route;
  return error;
}

export function estimateUsage(text) {
  return Math.max(1, Math.ceil(String(text).length * 1.6));
}
