import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAgentCatalog } from "../server/catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shouldWrite = process.argv.includes("--write");
const agents = buildAgentCatalog().sort((a, b) => a.id.localeCompare(b.id, "zh-CN", { numeric: true }));
const csvRows = [[
  "id",
  "name",
  "category",
  "currentCozeUrl",
  "cozeUrl",
  "owner",
  "note"
]];

for (const agent of agents) {
  csvRows.push([
    agent.id,
    agent.name,
    agent.category,
    agent.cozeUrl || "",
    "",
    agent.owner || "",
    "Fill cozeUrl with the published Coze agent page. Only coze.cn and coze.com public URLs are accepted."
  ]);
}

const csv = `\uFEFF${csvRows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
const docs = `# Coze 智能体发布页回填模板

本文件配套 \`docs/coze-links-template.csv\` 使用，用于把 100 个教育智能体在 Coze 上发布后的公开页面批量回填到平台。

## 使用步骤

1. 将 \`docs/coze-links-template.csv\` 发给 Coze 智能体发布负责人。
2. 不修改 \`id\`、\`name\`、\`category\`、\`currentCozeUrl\`、\`owner\` 列。
3. 在 \`cozeUrl\` 列填写正式发布页，例如 \`https://www.coze.cn/store/agent/...\`。
4. 登录平台后台，进入“应用管理”，点击“Coze 链接”，上传填好的 CSV。
5. 上传后导出“质量台账”，确认不再出现“缺Coze链接”或“Coze占位链接”。

## 字段说明

| 字段 | 说明 |
| --- | --- |
| id | 平台智能体 ID，必须保留。 |
| name | 智能体名称，用于人工核对。 |
| category | 教育应用分类，用于分派发布责任。 |
| currentCozeUrl | 当前平台内保存的链接，多数为占位链接。 |
| cozeUrl | 需要回填的正式 Coze 发布页。 |
| owner | 默认责任部门或岗位。 |
| note | 填写提醒，可删除但不建议改动。 |

## 安全规则

- 只接受 \`https://coze.cn\`、\`https://www.coze.cn\`、\`https://coze.com\`、\`https://www.coze.com\` 域名。
- 不要在 CSV 中填写 API Key、Workflow ID、Cookie、Token 或任何密钥。
- Coze Workflow 服务端调用仍通过 \`COZE_API_KEY\`、\`COZE_API_URL\`、\`COZE_WORKFLOW_ID\` 配置，不进入浏览器。
- 每次批量回填会写入版本历史和 \`agent.coze-links\` 审计日志。

## 模板状态

- 智能体数量：${agents.length}
- 默认占位链接数量：${agents.filter(agent => /\/xiaozhuang-century-[0-9]{3}$/i.test(agent.cozeUrl || "")).length}
- 生成命令：\`npm run coze:template:report\`
`;

if (shouldWrite) {
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(path.join(root, "docs", "coze-links-template.csv"), csv, "utf8");
  await writeFile(path.join(root, "docs", "COZE_LINKS.md"), docs, "utf8");
  console.log("Coze link template written to docs/COZE_LINKS.md and docs/coze-links-template.csv");
}

if (agents.length !== 100) {
  console.error(`Coze link template check failed: expected 100 agents, found ${agents.length}`);
  process.exit(1);
}

if (!csv.includes("agent-001") || !csv.includes("cozeUrl")) {
  console.error("Coze link template check failed: CSV template is missing required fields");
  process.exit(1);
}

console.log(`Coze link template check passed: ${agents.length} agents`);

function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
