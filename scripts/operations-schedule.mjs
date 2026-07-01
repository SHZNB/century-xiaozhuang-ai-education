import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shouldWrite = process.argv.includes("--write");

const tasks = [
  ["每日", "上线自检阻断项复核", "检查后台上线自检和 docs/DEPLOYMENT_CHECK.md，确认新增 FAIL 项是否需要立即处理。", "平台项目负责人", "readiness"],
  ["每日", "模型供应商连接巡检", "批量测试已配置模型供应商，核对 DeepSeek、Kimi、ChatGPT、Gemini、Coze 和国产备用链路。", "模型服务负责人", "provider.test"],
  ["每日", "校友认证待审处理", "筛选待审核校友申请，核对证明材料、联合认证状态和重复领取风险。", "校友审核负责人", "alumni"],
  ["每日", "用户反馈闭环", "处理待办反馈，标记处理中或已关闭，并记录处理备注。", "平台运营负责人", "feedback"],
  ["每日", "服务健康与告警巡检", "检查 /api/health、Prometheus/blackbox 告警、HTTPS 证书到期和部署后烟测状态。", "云平台运维负责人", "monitoring"],
  ["每日", "审计风险线索", "筛选登录失败、删除、恢复、导出、上传拒绝等风险动作。", "平台安全管理员", "audit"],
  ["每周", "100 个智能体质量复核", "导出智能体质量 CSV，分派缺 Logo、简介短、提示词短、路由或接入地址异常等整改。", "智能体应用管理员", "agents-quality"],
  ["每周", "教学工作流质量复核", "导出工作流质量 CSV，复核测试状态、输入输出规范、质检清单和路由。", "教学工作流管理员", "workflows-quality"],
  ["每周", "模型调用与 Token 账本核对", "导出模型调用台账和 Token 账本，核对失败释放、备用链路触发和异常消耗。", "模型服务负责人", "model-runs"],
  ["每周", "成果库空间治理", "导出成果资产清单，清理无效或超过保留期的成果文件。", "云平台运维负责人", "artifact.cleanup"],
  ["每周", "平台备份", "导出平台备份，核对 manifest 计数与校验，并对 SQLite、上传证明和成果文件所在数据目录做文件级加密备份。", "云平台运维负责人", "platform.backup"],
  ["每月", "热门智能体与工作流复盘", "使用 30 天统计窗口复盘高频应用、失败率和反馈，确定优化或下架整改清单。", "平台项目负责人", "metrics"],
  ["每月", "账号角色复核", "导出账号台账，复核超级管理员、应用管理员、校友审核员和 SSO 本地授权角色。", "平台安全管理员", "users"],
  ["每月", "校友权益结算", "导出校友认证和 Token 账本，复核 100 万 Token 发放、到期、补扣和重复领取风险。", "校友会接口负责人", "token-ledger"],
  ["每季度", "品牌素材授权复核", "核对校徽、校庆标识、校园照片和校史素材是否仍为授权版本。", "品牌与宣传素材负责人", "branding"],
  ["每季度", "灾备恢复演练", "按 docs/DISASTER_RECOVERY.md 使用脱敏备份在隔离环境演练恢复流程，确认 DATA_DIR 校验、平台 JSON manifest、烟测和敏感字段拦截仍有效。", "云平台运维负责人", "restore"]
];

const requiredFrequencies = new Set(["每日", "每周", "每月", "每季度"]);
const operationsDoc = await readFile(path.join(root, "docs/OPERATIONS.md"), "utf8").catch(() => "");
const failures = [];

for (const frequency of requiredFrequencies) {
  if (!tasks.some(task => task[0] === frequency)) failures.push(`缺少 ${frequency} 运营任务。`);
}
for (const [frequency, title, action, owner, evidence] of tasks) {
  if (!requiredFrequencies.has(frequency)) failures.push(`${title} 使用了未知周期 ${frequency}。`);
  if (!title || !action || !owner || !evidence) failures.push(`${title || "未命名任务"} 缺少标题、动作、责任方或证据。`);
}
for (const token of ["智能体目录质量治理", "工作流测试状态筛选", "备份与恢复", "校友认证审核筛选", "模型调用台账筛选"]) {
  if (!operationsDoc.includes(token)) failures.push(`docs/OPERATIONS.md 缺少 ${token}，无法支撑运营清单。`);
}

if (failures.length) {
  console.error("Operations schedule check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const report = renderReport();

if (shouldWrite) {
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(path.join(root, "docs/OPERATIONS_SCHEDULE.md"), report, "utf8");
  console.log("Operations schedule written to docs/OPERATIONS_SCHEDULE.md");
}

console.log(`Operations schedule check passed: ${tasks.length} recurring tasks across ${requiredFrequencies.size} cadences`);

function renderReport() {
  const generatedAt = new Date().toISOString();
  const rows = tasks.map(([frequency, title, action, owner, evidence]) =>
    `| ${frequency} | ${title} | ${owner} | ${action} | ${evidence} |`
  ).join("\n");
  const grouped = [...requiredFrequencies].map(frequency => {
    const items = tasks
      .filter(task => task[0] === frequency)
      .map(task => `- ${task[1]}：${task[3]}，${task[2]}`)
      .join("\n");
    return `### ${frequency}\n\n${items}`;
  }).join("\n\n");
  return `# 百年晓庄智慧教育平台周期运营清单

生成时间：${generatedAt}

本清单由 \`npm run operations:schedule:report\` 生成，用于上线后把后台能力转化为固定运维节奏。清单只包含任务、责任方和证据来源，不包含用户正文、API Key、密码、上传证明或模型生成内容。

## 任务总表

| 周期 | 任务 | 责任方 | 执行动作 | 证据来源 |
| --- | --- | --- | --- | --- |
${rows}

## 分周期执行

${grouped}

## 留档要求

1. 每次导出的 CSV、部署自检、上线交接包和备份文件应按日期归档。
2. 涉及校友证明、用户反馈、Token 账本和模型调用记录时，只留存必要元数据，不外传用户正文和证明原件。
3. 发现阻断项、异常扣费、登录风险、模型大面积失败或成果文件异常增长时，应在当日完成审计追溯并登记处理结论。
4. 每月复盘后更新智能体和工作流的负责人、提示词、路由、发布状态和质量台账。
`;
}
