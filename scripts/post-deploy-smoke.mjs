import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shouldWrite = process.argv.includes("--write");
const baseUrl = normalizedUrl(argumentValue("--url") || process.env.DEPLOY_BASE_URL || "");
const checks = [];

if (!baseUrl) {
  checks.push({
    status: "PENDING",
    name: "DEPLOY_BASE_URL",
    target: "线上地址",
    detail: "未设置 DEPLOY_BASE_URL；部署后使用 DEPLOY_BASE_URL=https://你的域名 npm run smoke:post-deploy:report 执行线上烟测。"
  });
} else {
  await checkPage("/", "首页", text =>
    text.includes("百年晓庄智慧教育平台") && text.includes("agent")
      ? "首页包含平台名称和智能体前端脚本"
      : "首页未包含平台名称或前端脚本线索"
  );
  await checkPage("/DEPLOYMENT-NOTE.txt", "GitHub Pages 静态说明", text =>
    text.includes("static front-end preview")
      ? "检测到 GitHub Pages 静态预览说明"
      : "未检测到静态预览说明；若是 Node 服务端部署可忽略"
  , { optional: true });
  await checkJson("/api/health", "Node 服务健康检查", data =>
    data && data.service === "century-xiaozhuang-ai-education"
      ? `服务 ${data.service} 状态 ${data.status || data.ok}`
      : "未检测到完整 Node 服务健康信息；若只部署 GitHub Pages 静态预览可忽略"
  , { optional: true });
}

if (shouldWrite) {
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(path.join(root, "docs/POST_DEPLOY_SMOKE.md"), renderReport(), "utf8");
  console.log("Post-deploy smoke report written to docs/POST_DEPLOY_SMOKE.md");
}

const failures = checks.filter(item => item.status === "FAIL");
if (failures.length) {
  console.error("Post-deploy smoke failed:");
  for (const failure of failures) console.error(`- ${failure.name}: ${failure.detail}`);
  process.exit(1);
}

console.log(`Post-deploy smoke ${baseUrl ? "checked" : "prepared"}: ${checks.length} checks, ${failures.length} failures`);

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  const inline = process.argv.find(arg => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : "";
}

function normalizedUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString().replace(/\/$/, "");
  } catch {
    checks.push({ status: "FAIL", name: "DEPLOY_BASE_URL", target: value, detail: "线上地址不是有效 URL" });
    return "";
  }
}

async function checkPage(relativePath, name, inspect, options = {}) {
  const target = `${baseUrl}${relativePath}`;
  try {
    const response = await fetch(target);
    const text = await response.text();
    const secretLeak = /(?:MOONSHOT|DEEPSEEK|OPENAI|GEMINI|COZE|QWEN|HUNYUAN|SSO_CLIENT_SECRET|ALUMNI_ASSOCIATION_API_KEY|sk-[A-Za-z0-9_-]{20,})/.test(text);
    if (secretLeak) {
      checks.push({ status: "FAIL", name, target, detail: "响应疑似包含服务端密钥名称或明文密钥" });
      return;
    }
    const detail = inspect(text);
    const ok = response.ok && !/^未检测到|首页未/.test(detail);
    checks.push({ status: ok ? "PASS" : options.optional ? "WARN" : "FAIL", name, target, detail: response.ok ? detail : `HTTP ${response.status}` });
  } catch (error) {
    checks.push({ status: options.optional ? "WARN" : "FAIL", name, target, detail: error.message });
  }
}

async function checkJson(relativePath, name, inspect, options = {}) {
  const target = `${baseUrl}${relativePath}`;
  try {
    const response = await fetch(target);
    const text = await response.text();
    if (/API_KEY|SECRET|sk-[A-Za-z0-9_-]{20,}/.test(text)) {
      checks.push({ status: "FAIL", name, target, detail: "JSON 响应疑似泄露密钥字段" });
      return;
    }
    const data = safeJson(text);
    const detail = inspect(data);
    checks.push({ status: response.ok && data ? "PASS" : options.optional ? "WARN" : "FAIL", name, target, detail: response.ok ? detail : `HTTP ${response.status}` });
  } catch (error) {
    checks.push({ status: options.optional ? "WARN" : "FAIL", name, target, detail: error.message });
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function renderReport() {
  const rows = checks.map(item => `| ${item.status} | ${item.name} | ${item.target} | ${String(item.detail).replace(/\|/g, "\\|")} |`).join("\n");
  const counts = {
    pass: checks.filter(item => item.status === "PASS").length,
    warn: checks.filter(item => item.status === "WARN").length,
    pending: checks.filter(item => item.status === "PENDING").length,
    fail: checks.filter(item => item.status === "FAIL").length
  };
  return `# 百年晓庄智慧教育平台部署后烟测

生成时间：${new Date().toISOString()}

本报告由 \`npm run smoke:post-deploy:report\` 生成。设置 \`DEPLOY_BASE_URL\` 后可检查 GitHub Pages 静态预览或 Node 服务端线上地址；不设置时只生成待执行报告，便于交接给云平台运维。

## 汇总

- 通过：${counts.pass}
- 提醒：${counts.warn}
- 待执行：${counts.pending}
- 失败：${counts.fail}

## 检查项

| 状态 | 项目 | 地址 | 结果 |
| --- | --- | --- | --- |
${rows}

## 使用方式

\`\`\`powershell
$env:DEPLOY_BASE_URL="https://你的域名"
npm run smoke:post-deploy:report
\`\`\`

GitHub Pages 静态预览至少应通过首页检查；完整 Node 服务端还应通过 \`/api/health\` 检查。
`;
}
