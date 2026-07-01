import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { providerEnvironment, routeById } from "../server/models.mjs";
import { teachingWorkflows } from "../server/workflows.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shouldWrite = process.argv.includes("--write");

const workflowOwners = {
  lesson: "教务处/教师教育学院工作流负责人",
  ppt: "智慧教学与资源建设负责人",
  quiz: "教学质量与测评负责人",
  document: "图书馆/档案与长文本应用负责人",
  animation: "数字资源与 Coze 工作流负责人",
  image: "教育技术与多模态应用负责人"
};

const requiredWorkflowRoutes = {
  lesson: "deepseek",
  ppt: "chatgpt",
  document: "kimi",
  animation: "coze",
  image: "gemini"
};

const envTemplate = await readFile(path.join(root, ".env.production.example"), "utf8").catch(() => "");
const failures = [];
const rows = teachingWorkflows.map(workflow => workflowRow(workflow));

for (const [id, route] of Object.entries(requiredWorkflowRoutes)) {
  const workflow = teachingWorkflows.find(item => item.id === id);
  if (!workflow) failures.push(`缺少内置工作流 ${id}。`);
  if (workflow && workflow.routeHint !== route) failures.push(`${workflow.title} 应默认路由到 ${route}，当前为 ${workflow.routeHint}。`);
}

for (const row of rows) {
  for (const name of row.envNames) {
    if (!envTemplate.includes(`${name}=`)) failures.push(`.env.production.example 缺少 ${name}。`);
  }
}

if (!rows.some(row => row.id === "animation" && row.envNames.includes("COZE_WORKFLOW_ID"))) {
  failures.push("网页动画工作流必须声明 COZE_WORKFLOW_ID。");
}

const report = renderReport(rows);

if (shouldWrite) {
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(path.join(root, "docs", "WORKFLOW_ENVIRONMENT.md"), report, "utf8");
  console.log("Workflow environment guide written to docs/WORKFLOW_ENVIRONMENT.md");
}

if (failures.length) {
  console.error("Workflow environment check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Workflow environment check passed: ${rows.length} workflows mapped to server-side model configuration`);

function workflowRow(workflow) {
  const route = routeById(workflow.routeHint);
  const environment = providerEnvironment(workflow.routeHint);
  if (!route) failures.push(`${workflow.title} 使用了未知模型路由 ${workflow.routeHint}。`);
  if (!environment) failures.push(`${workflow.title} 缺少 ${workflow.routeHint} 的服务端环境变量映射。`);
  const envNames = environment ? [environment.key, environment.url, environment.model].filter(Boolean) : [];
  return {
    id: workflow.id,
    title: workflow.title,
    routeId: workflow.routeHint,
    routeName: route?.name || workflow.routeHint,
    reason: route?.reason || workflow.summary,
    artifactType: workflow.artifactType,
    owner: workflowOwners[workflow.id] || "平台项目负责人",
    envNames,
    defaultModel: environment?.defaultModel || "",
    fallbacks: environment?.fallbacks || [],
    inputFields: Array.isArray(workflow.inputFields) ? workflow.inputFields : [],
    outputSections: Array.isArray(workflow.outputSections) ? workflow.outputSections : [],
    qualityChecklist: Array.isArray(workflow.qualityChecklist) ? workflow.qualityChecklist : []
  };
}

function renderReport(items) {
  const generatedAt = new Date().toISOString();
  const workflowRows = items.map(item => {
    const fallbackNames = item.fallbacks.map(id => routeById(id)?.name || id).join("、") || "无";
    return `| ${item.id} | ${item.title} | ${item.routeName} | ${item.artifactType} | ${item.envNames.map(name => `\`${name}\``).join("<br>")} | ${item.defaultModel || "按服务端配置"} | ${fallbackNames} | ${item.outputSections.join("、")} | ${item.qualityChecklist.join("；")} | ${item.owner} |`;
  }).join("\n");
  const checklistRows = items.map(item =>
    `| ${item.title} | 后台执行“测试工作流” | 测试状态为“已测试”，上线自检中 Workflow route tests 为 OK | ${item.owner} |`
  ).join("\n");
  return `# 百年晓庄智慧教育平台工作流环境清单

生成时间：${generatedAt}

本清单由 \`npm run check:workflow-env:report\` 生成，用于把教学工作流、自动模型路由、服务端环境变量、备用链路和上线验收责任方对应起来。所有 API Key、Workflow ID 和 SSO/校友会密钥只能配置在服务端 \`.env\`、容器环境或云平台 Secret 中，不进入浏览器、GitHub Pages 静态产物或智能体导出文件。

## 工作流与模型环境

| 工作流 ID | 工作流 | 首选模型/平台 | 成果类型 | 必要环境变量 | 默认模型 | 备用链路 | 输出结构 | 质检清单 | 责任方 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${workflowRows}

## 上线验收动作

| 工作流 | 操作 | 通过标准 | 责任方 |
| --- | --- | --- | --- |
${checklistRows}

## 部署顺序

1. 复制 \`.env.production.example\` 为生产环境变量模板。
2. 先配置 DeepSeek、Kimi、ChatGPT、Gemini、Coze 的 Key、URL 和模型/Workflow ID。
3. 配置通义千问、豆包、智谱 GLM、文心一言、腾讯混元作为中文通用与备用链路。
4. 启动 Node 服务端后登录后台，逐个执行工作流测试。
5. 测试通过后发布工作流，并运行 \`npm run check:deploy:strict\` 做正式上线门禁。

## 安全边界

- 前端只展示路由结果、模型名称和测试状态，不保存 API Key。
- 工作流导入/导出只包含提示词、路由和发布状态，不包含任何密钥。
- Coze 网页动画必须通过服务端 \`COZE_API_KEY\` 与 \`COZE_WORKFLOW_ID\` 调用，浏览器只接收平台生成的预览和下载文件。
- 校友 Token 扣减以服务端模型调用台账和 Token 账本为准，失败调用会释放预留额度。
`;
}

export async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}
