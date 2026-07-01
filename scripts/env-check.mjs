import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shouldWrite = process.argv.includes("--write");

const environment = [
  ["PORT", "runtime", "required", "Node 服务监听端口，默认 8080。"],
  ["NODE_ENV", "runtime", "required", "生产环境必须为 production，确保 Cookie Secure 等安全策略生效。"],
  ["DEMO_MODE", "runtime", "recommended", "Demo 验收模式；仅用于本地或演示环境，允许健康检查忽略真实模型 Key 和官方素材缺口。"],
  ["DATA_DIR", "runtime", "required", "SQLite、上传证明和工作流成果的持久化目录。"],
  ["MODEL_MAX_OUTPUT_TOKENS", "models", "required", "单次模型调用最大输出 Token 数。"],
  ["FRONTEND_ORIGINS", "runtime", "recommended", "允许跨域访问 Node 服务端的前端来源，多个来源用逗号分隔，例如 GitHub Pages 域名。"],
  ["PUBLIC_FRONTEND_URL", "runtime", "recommended", "公开前端根地址，用于学校统一身份认证回调后跳回 GitHub Pages 或正式门户。"],
  ["COOKIE_SAMESITE", "security", "recommended", "会话 Cookie SameSite 策略；前端与 Node 服务不同站点时需配合 HTTPS 设置为 None。"],
  ["DEV_ADMIN_USERNAME", "security", "required", "首次启动的超级管理员账号名，生产环境应替换默认值。"],
  ["DEV_ADMIN_PASSWORD", "security", "required", "首次启动的超级管理员强密码，生产环境不得使用 xz2026 或 change-me。"],
  ["SESSION_SECRET", "security", "required", "服务端会话签名密钥，用于 Cookie token HMAC 摘要和强制会话失效；生产环境必须随机生成并安全保管。"],
  ["SSO_ENABLED", "sso", "recommended", "是否启用学校统一身份认证 OIDC 登录。"],
  ["SSO_LOGIN_LABEL", "sso", "recommended", "登录页统一身份认证按钮文案。"],
  ["SSO_ISSUER", "sso", "recommended", "学校统一身份认证服务商标识或 issuer。"],
  ["SSO_AUTHORIZATION_URL", "sso", "recommended", "OIDC authorization endpoint。"],
  ["SSO_TOKEN_URL", "sso", "recommended", "OIDC token endpoint。"],
  ["SSO_USERINFO_URL", "sso", "recommended", "OIDC userinfo endpoint。"],
  ["SSO_CLIENT_ID", "sso", "recommended", "平台在学校统一身份认证系统登记的 Client ID。"],
  ["SSO_CLIENT_SECRET", "sso", "recommended", "平台在学校统一身份认证系统登记的 Client Secret，只能放服务端。"],
  ["SSO_REDIRECT_URI", "sso", "recommended", "OIDC 回调地址，通常为 https://域名/api/auth/sso/callback。"],
  ["SSO_SCOPE", "sso", "recommended", "OIDC 授权范围，默认 openid profile email。"],
  ["SSO_USERNAME_CLAIM", "sso", "recommended", "映射到平台 username 的 userinfo claim。"],
  ["SSO_DISPLAY_NAME_CLAIM", "sso", "recommended", "映射到平台显示姓名的 userinfo claim。"],
  ["SSO_DEPARTMENT_CLAIM", "sso", "recommended", "映射到平台部门的 userinfo claim。"],
  ["SSO_DEFAULT_ROLE", "sso", "recommended", "SSO 首次登录自动创建账号时的默认角色，默认 teacher。"],
  ["ALUMNI_ASSOCIATION_VERIFY_URL", "alumni", "recommended", "校友会联合认证接口；未配置时进入人工审核。"],
  ["ALUMNI_ASSOCIATION_API_KEY", "alumni", "recommended", "调用校友会联合认证接口的服务端密钥。"],
  ["MOONSHOT_API_KEY", "models", "required", "Kimi / Moonshot，用于长文本、PDF 和长上下文。"],
  ["MOONSHOT_API_URL", "models", "required", "Kimi / Moonshot OpenAI 兼容接口地址。"],
  ["MOONSHOT_MODEL", "models", "required", "Kimi / Moonshot 模型名称。"],
  ["DEEPSEEK_API_KEY", "models", "required", "DeepSeek，用于教案、课程设计和教学评价。"],
  ["DEEPSEEK_API_URL", "models", "required", "DeepSeek OpenAI 兼容接口地址。"],
  ["DEEPSEEK_MODEL", "models", "required", "DeepSeek 模型名称。"],
  ["QWEN_API_KEY", "models", "recommended", "通义千问，用于中文通用教育任务。"],
  ["QWEN_API_URL", "models", "recommended", "通义千问 OpenAI 兼容接口地址。"],
  ["QWEN_MODEL", "models", "recommended", "通义千问模型名称。"],
  ["OPENAI_API_KEY", "models", "required", "ChatGPT，用于 PPT 大纲、讲稿和 HTML 演示。"],
  ["OPENAI_API_URL", "models", "required", "OpenAI Responses API 地址。"],
  ["OPENAI_MODEL", "models", "required", "OpenAI / ChatGPT 模型名称。"],
  ["GEMINI_API_KEY", "models", "required", "Gemini，用于图片理解和多模态任务。"],
  ["GEMINI_API_URL", "models", "required", "Gemini API 基础地址。"],
  ["GEMINI_MODEL", "models", "required", "Gemini 模型名称。"],
  ["COZE_API_KEY", "models", "required", "Coze Workflow 服务端密钥，用于网页动画工作流。"],
  ["COZE_API_URL", "models", "required", "Coze Workflow 调用地址。"],
  ["COZE_WORKFLOW_ID", "models", "required", "Coze 网页动画工作流 ID。"],
  ["DOUBAO_API_KEY", "models", "recommended", "豆包模型密钥，作为中文通用或备用模型。"],
  ["DOUBAO_API_URL", "models", "recommended", "豆包 OpenAI 兼容接口地址。"],
  ["DOUBAO_MODEL", "models", "recommended", "豆包模型名称。"],
  ["GLM_API_KEY", "models", "recommended", "智谱 GLM 密钥，用于知识任务备用。"],
  ["GLM_API_URL", "models", "recommended", "智谱 GLM OpenAI 兼容接口地址。"],
  ["GLM_MODEL", "models", "recommended", "智谱 GLM 模型名称。"],
  ["ERNIE_API_KEY", "models", "recommended", "文心一言密钥，用于教育政策和知识任务。"],
  ["ERNIE_API_URL", "models", "recommended", "文心一言 OpenAI 兼容接口地址。"],
  ["ERNIE_MODEL", "models", "recommended", "文心一言模型名称。"],
  ["HUNYUAN_API_KEY", "models", "recommended", "腾讯混元密钥，作为服务故障备用。"],
  ["HUNYUAN_API_URL", "models", "recommended", "腾讯混元 OpenAI 兼容接口地址。"],
  ["HUNYUAN_MODEL", "models", "recommended", "腾讯混元模型名称。"]
];

const declared = new Set(environment.map(([name]) => name));
const used = await usedEnvironmentVariables();
const example = await envKeys(".env.example");
const productionExample = await envKeys(".env.production.example");
const failures = [];

for (const name of used) {
  if (!declared.has(name)) failures.push(`环境变量 ${name} 在服务端被使用，但未写入 scripts/env-check.mjs 清单。`);
}
for (const [name,, level] of environment) {
  if (!example.has(name)) failures.push(`.env.example 缺少 ${name}。`);
  if (!productionExample.has(name)) failures.push(`.env.production.example 缺少 ${name}。`);
  if (level === "required" && name.endsWith("_API_KEY") && name !== "ALUMNI_ASSOCIATION_API_KEY") {
    const relatedUrl = name.replace("_API_KEY", "_API_URL");
    if (declared.has(relatedUrl) && !productionExample.has(relatedUrl)) {
      failures.push(`.env.production.example 缺少 ${relatedUrl}。`);
    }
  }
}

const report = renderEnvironmentDoc();

if (shouldWrite) {
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(path.join(root, "docs", "ENVIRONMENT.md"), report, "utf8");
  console.log("Environment configuration guide written to docs/ENVIRONMENT.md");
}

if (failures.length) {
  console.error("Environment check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Environment check passed: ${environment.length} variables documented and templated`);

async function usedEnvironmentVariables() {
  const files = [
    "server/auth.mjs",
    "server/index.mjs",
    "server/models.mjs",
    "server/store.mjs"
  ];
  const names = new Set();
  for (const file of files) {
    const text = await readFile(path.join(root, file), "utf8");
    for (const match of text.matchAll(/process\.env\.([A-Z0-9_]+)/g)) names.add(match[1]);
    for (const match of text.matchAll(/process\.env\[(?:config\.)?([a-zA-Z0-9_]+)\]/g)) {
      if (/^[A-Z0-9_]+$/.test(match[1])) names.add(match[1]);
    }
  }
  return names;
}

async function envKeys(relativePath) {
  try {
    const text = await readFile(path.join(root, relativePath), "utf8");
    return new Set(text.split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#") && line.includes("="))
      .map(line => line.slice(0, line.indexOf("=")).trim()));
  } catch {
    return new Set();
  }
}

function renderEnvironmentDoc() {
  const generatedAt = new Date().toISOString();
  const rows = environment.map(([name, group, level, description]) =>
    `| \`${name}\` | ${group} | ${level === "required" ? "必填" : "建议"} | ${description} |`
  ).join("\n");
  return `# 百年晓庄智慧教育平台环境变量清单

生成时间：${generatedAt}

本清单由 \`npm run check:env:report\` 生成，用于学校信息化部门、云平台运维或项目组交接生产配置。所有密钥只允许配置在服务端 \`.env\`、容器运行环境或云平台 Secret 中，不得写入浏览器、GitHub Pages 静态产物、智能体导出文件或前端源码。

## 使用方式

\`\`\`powershell
Copy-Item .env.production.example .env
npm run check:env
npm run check:deploy
\`\`\`

生产上线前，\`NODE_ENV\` 必须为 \`production\`，\`DEV_ADMIN_PASSWORD\` 必须替换为强密码，且关键模型 Key、Coze Workflow ID、授权素材和校友会接口需完成配置或在上线自检报告中登记为待办。

## 变量表

| 变量 | 分组 | 级别 | 用途 |
| --- | --- | --- | --- |
${rows}
`;
}
