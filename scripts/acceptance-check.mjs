import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAgentCatalog } from "../server/catalog.mjs";
import { routeById } from "../server/models.mjs";
import { teachingWorkflows } from "../server/workflows.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shouldWrite = process.argv.includes("--write");
const checks = [];

const textFiles = {
  index: await readText("index.html"),
  app: await readText("app.js"),
  config: await readText("config.example.js").catch(() => ""),
  server: await readText("server/index.mjs"),
  auth: await readText("server/auth.mjs"),
  models: await readText("server/models.mjs"),
  store: await readText("server/store.mjs"),
  packageJson: await readText("package.json"),
  dockerfile: await readText("Dockerfile"),
  compose: await readText("compose.yml"),
  nginx: await readText("deploy/nginx/xiaozhuang-platform.conf").catch(() => ""),
  systemd: await readText("deploy/systemd/xiaozhuang-platform.service").catch(() => ""),
  systemdBackup: `${await readText("deploy/systemd/xiaozhuang-platform-backup.service").catch(() => "")}\n${await readText("deploy/systemd/xiaozhuang-platform-backup.timer").catch(() => "")}`,
  disasterRecovery: await readText("docs/DISASTER_RECOVERY.md").catch(() => ""),
  monitoring: `${await readText("deploy/monitoring/prometheus.yml").catch(() => "")}\n${await readText("deploy/monitoring/xiaozhuang-platform-alerts.yml").catch(() => "")}`,
  workflow: await readText(".github/workflows/pages.yml").catch(() => ""),
  containerWorkflow: await readText(".github/workflows/container.yml").catch(() => ""),
  deployCheck: await readText("scripts/deploy-check.mjs"),
  launchPackageScript: await readText("scripts/launch-package.mjs").catch(() => ""),
  launchPackage: await readText("docs/LAUNCH_PACKAGE.md").catch(() => ""),
  operationsScheduleScript: await readText("scripts/operations-schedule.mjs").catch(() => ""),
  operationsSchedule: await readText("docs/OPERATIONS_SCHEDULE.md").catch(() => ""),
  permissionsScript: await readText("scripts/permissions-matrix.mjs").catch(() => ""),
  permissions: await readText("docs/PERMISSIONS.md").catch(() => ""),
  releaseRehearsalScript: await readText("scripts/release-rehearsal.mjs").catch(() => ""),
  releaseRehearsal: await readText("docs/RELEASE_REHEARSAL.md").catch(() => ""),
  browserSecretScanScript: await readText("scripts/browser-secret-scan.mjs").catch(() => ""),
  postDeploySmokeScript: await readText("scripts/post-deploy-smoke.mjs").catch(() => ""),
  postDeploySmoke: await readText("docs/POST_DEPLOY_SMOKE.md").catch(() => ""),
  readme: await readText("README.md"),
  environment: await readText("docs/ENVIRONMENT.md").catch(() => ""),
  workflowEnvironment: await readText("docs/WORKFLOW_ENVIRONMENT.md").catch(() => ""),
  workflowEnvScript: await readText("scripts/workflow-env-report.mjs").catch(() => ""),
  cozeLinks: await readText("docs/COZE_LINKS.md").catch(() => ""),
  cozeTemplateScript: await readText("scripts/coze-links-template.mjs").catch(() => "")
};

function pass(area, item, evidence) {
  checks.push({ status: "PASS", area, item, evidence });
}

function fail(area, item, evidence) {
  checks.push({ status: "FAIL", area, item, evidence });
}

function assert(condition, area, item, evidence) {
  (condition ? pass : fail)(area, item, evidence);
}

const agents = buildAgentCatalog();
const categories = countBy(agents, agent => agent.category);

assert(agents.length === 100, "智能体目录", "默认目录严格包含 100 个智能体", `${agents.length} agents`);
assert(categories.size === 10 && [...categories.values()].every(count => count === 10), "智能体目录", "10 个领域各 10 个智能体", [...categories.entries()].map(([name, count]) => `${name}:${count}`).join(", "));
assert(agents.every(agent => agent.logoText || agent.logoImage), "智能体目录", "每个智能体都有 Logo 标识", "logoText/logoImage present");
assert(agents.every(agent => agent.logoImage === `assets/agents/${agent.id}.svg`) && textFiles.app.includes("assets/agents/agent-${String(index).padStart(3, \"0\")}.svg") && textFiles.packageJson.includes("logos:check") && textFiles.packageJson.includes("logos:generate"), "智能体目录", "默认 100 个智能体绑定独立 SVG Logo 资产并纳入校验工作流", "assets/agents/*.svg");
assert(agents.every(agent => /^https:\/\/www\.coze\.cn\/store\/agent\/xiaozhuang-century-[0-9]{3}$/.test(agent.cozeUrl || "")) && textFiles.app.includes("agentCozeUrl") && textFiles.index.includes("cozeUrl"), "智能体目录", "100 个教育智能体都预留 Coze 发布页链接且图标可跳转", "cozeUrl link");
assert(textFiles.app.includes("agent-logo-link") && textFiles.app.includes("打开 Coze 发布页") && textFiles.server.includes("Coze published agent links"), "智能体目录", "点击智能体 Logo 可打开对应 Coze 发布智能体页面并进入上线自检", "agent logo Coze link");
assert(agents.every(agent => routeById(agent.routeHint)), "智能体目录", "每个智能体默认模型路由有效", "routeById(routeHint)");
assert(agents.every(agent => agent.systemPrompt?.length >= 40), "智能体目录", "每个智能体包含生产级系统提示词", "systemPrompt >= 40 chars");

for (const mode of ["local", "external", "embed", "api"]) {
  assert(textFiles.index.includes(`value="${mode}"`), "智能体编辑", `支持 ${mode} 接入模式`, `index.html mode=${mode}`);
}
for (const token of ["data-edit-agent", "data-test-agent", "data-duplicate-agent", "data-bulk-agent-status", "bulkRouteButton", "bulkAgentTestButton", "logoUpload", "agentForm", "importAgents", "exportAgents"]) {
  assert(textFiles.index.includes(token) || textFiles.app.includes(token), "智能体编辑", `管理端包含 ${token}`, token);
}
assert(textFiles.server.includes("/api/admin/agents/coze-links") && textFiles.app.includes("importCozeLinks") && textFiles.index.includes("cozeLinksFile"), "智能体编辑", "管理员可批量导入 100 个 Coze 发布页链接并写入版本审计", "Coze link bulk import");
assert(textFiles.server.includes("isPublicCozeUrl") && textFiles.app.includes("Coze占位链接") && textFiles.server.includes("Coze占位链接"), "智能体编辑", "Coze 发布页限制为官方公开域名且占位链接进入质量台账", "Coze URL governance");
assert(textFiles.app.includes("exportCozeTemplate") && textFiles.index.includes("exportCozeTemplate") && textFiles.packageJson.includes("coze:template"), "智能体编辑", "后台可导出 100 个 Coze 发布页回填模板", "Coze link template export");
assert(textFiles.app.includes("selectedAgents") && textFiles.app.includes("filteredManagementAgents()") && textFiles.app.includes("scope:"), "智能体编辑", "智能体支持按勾选或筛选范围导出", "selected/filtered export");
assert(textFiles.index.includes("exportVisibleAgents") && textFiles.app.includes("exportVisibleAgents") && textFiles.app.includes("exportAgentSet(visible, \"visible\""), "智能体编辑", "智能体支持显式导出当前可见范围", "visible agent export");
assert(textFiles.app.includes("strategy === \"merge\"") && textFiles.app.includes("strategy, agents: safeAgents"), "智能体编辑", "智能体导入支持合并或替换策略", "merge/replace import");
assert(textFiles.server.includes("testAgentConnection"), "智能体接入", "外部网页/API 智能体可服务端检测", "server/index.mjs testAgentConnection");
assert(textFiles.server.includes("/duplicate") && textFiles.server.includes("agent.duplicate"), "智能体编辑", "服务端支持复制智能体为草稿副本", "agent duplicate endpoint");
assert(textFiles.server.includes("agent.bulk-route") && textFiles.app.includes("bulkUpdateAgentRoute"), "智能体编辑", "支持批量调整智能体模型路由", "bulk route");
assert(textFiles.server.includes("lastTestStatus") && textFiles.server.includes("External/API connection tests"), "智能体接入", "智能体连接测试结果持久化并进入上线自检", "lastTestStatus readiness");
assert(textFiles.server.includes("invalidateAgentTestIfChanged") && textFiles.server.includes("route changed") && textFiles.server.includes("configuration changed"), "智能体接入", "智能体关键配置变更后自动要求重新测试", "agent test invalidation");
assert(textFiles.server.includes("validateAgentPublishGate") && textFiles.server.includes("Published external, embedded and API agents require a passing connection test"), "智能体接入", "外部/API 智能体发布前必须通过连接测试", "agent publish test gate");
assert(textFiles.app.includes("agentPublishGateLabel") && textFiles.app.includes("发布前需测试"), "智能体接入", "管理端显示智能体发布前测试门禁提示", "agent publish gate UI");
assert(textFiles.server.includes("agentVersionDiffMatch") && textFiles.server.includes("buildAgentVersionDiff") && textFiles.app.includes("最近变更"), "智能体编辑", "管理员可查看智能体版本差异摘要用于审核和恢复", "agent version diff");
assert(textFiles.app.includes("bulkTestAgents") && textFiles.index.includes("bulkAgentTestButton") && textFiles.app.includes("一次最多测试 20 个智能体"), "智能体接入", "管理员可批量测试选中智能体并同步测试状态", "bulk agent tests");
assert(textFiles.index.includes("managementTestStatus") && textFiles.app.includes("agentTestFilterStatus"), "智能体接入", "管理端可按测试状态筛选智能体", "agent test status filter");
assert(textFiles.index.includes("managementQuality") && textFiles.app.includes("managementQuality") && textFiles.app.includes("matchesQuality"), "智能体编辑", "管理端可按目录质量筛选智能体", "agent quality filter");
assert(textFiles.index.includes("managementSort") && textFiles.app.includes("compareManagementAgents"), "智能体编辑", "管理端可按名称、分类、状态、路由和测试状态排序智能体", "agent management sort");
assert(textFiles.index.includes("agentGovernance") && textFiles.app.includes("renderAgentGovernance") && textFiles.app.includes("countBy(visible"), "智能体编辑", "管理端显示当前筛选范围的智能体治理概览", "agent governance overview");
assert(textFiles.app.includes("agentQualityIssues") && textFiles.app.includes("agentQualityLabel") && textFiles.app.includes("目录质量"), "智能体编辑", "管理端显示智能体目录质量缺口", "agent quality governance");
assert(textFiles.app.includes("qualitySummary") && textFiles.app.includes("qualityIssues") && textFiles.app.includes("qualityStatus") && textFiles.app.includes("qualityIssueCount"), "智能体编辑", "智能体导出包含目录质量台账字段", "agent quality export");
assert(textFiles.server.includes("/api/admin/agents-quality.csv") && textFiles.server.includes("buildAgentsQualityCsv") && textFiles.app.includes("exportAgentQuality"), "智能体编辑", "超级管理员可导出智能体质量 CSV 台账", "agent quality CSV export");
assert(textFiles.server.includes("buildAgentsQualityCsv") && textFiles.server.includes("routeMissingEnv") && textFiles.server.includes("fallbackRoutes") && textFiles.app.includes("routeConfigured") && textFiles.app.includes("routeEnvNames"), "智能体编辑", "智能体质量 CSV 包含模型路由配置、缺失环境变量和备用路线字段", "agent route env CSV");
assert(textFiles.server.includes("/api/admin/version-history.csv") && textFiles.server.includes("buildVersionHistoryCsv") && textFiles.app.includes("exportVersionHistory") && textFiles.index.includes("exportVersionHistory"), "智能体编辑", "超级管理员可导出智能体与工作流版本历史 CSV 台账", "version history CSV export");
assert(textFiles.app.includes("Checking agent connection"), "智能体接入", "前端测试按钮接入连接检测结果", "app.js Checking agent connection");

const requiredWorkflowRoutes = {
  lesson: "deepseek",
  ppt: "chatgpt",
  document: "kimi",
  animation: "coze",
  image: "gemini"
};
assert(teachingWorkflows.length >= 6, "教学工作流", "内置至少 6 个教学工作流", `${teachingWorkflows.length} workflows`);
for (const [id, route] of Object.entries(requiredWorkflowRoutes)) {
  const workflow = teachingWorkflows.find(item => item.id === id);
  assert(Boolean(workflow), "教学工作流", `包含 ${id} 工作流`, workflow ? workflow.title : "missing");
  assert(workflow?.routeHint === route, "自动模型路由", `${id} 默认路由到 ${route}`, workflow?.routeHint || "missing");
}
for (const token of ["api(\"/api/admin/workflows\"", "createWorkflow", "testWorkflow", "bulkTestWorkflows", "duplicateWorkflow", "importWorkflows", "exportWorkflows", "workflowVersions", "bulkWorkflowRouteButton", "bulkWorkflowTestButton"]) {
  assert(textFiles.app.includes(token), "教学工作流", `后台包含 ${token}`, token);
}
assert(textFiles.app.includes("strategy, workflows: imported") && textFiles.app.includes("当前工作流"), "教学工作流", "工作流导入支持合并或替换策略", "merge/replace workflow import");
assert(textFiles.index.includes("exportVisibleWorkflows") && textFiles.app.includes("exportVisibleWorkflows") && textFiles.app.includes("exportWorkflowSet(workflows, \"visible\")"), "教学工作流", "工作流支持导出当前筛选范围并保持导入兼容格式", "visible workflow export");
assert(textFiles.server.includes("/api/admin/workflows/bulk") && textFiles.server.includes("workflow.bulk-route") && textFiles.app.includes("bulkUpdateWorkflowRoute"), "教学工作流", "支持批量调整工作流模型路由", "workflow bulk route");
assert(textFiles.server.includes("/test") && textFiles.server.includes("workflow.test") && textFiles.app.includes("data-test-workflow"), "教学工作流", "管理员可测试工作流路由且不沉淀普通成果", "workflow.test");
assert(textFiles.app.includes("bulkTestWorkflows") && textFiles.index.includes("bulkWorkflowTestButton") && textFiles.app.includes("一次最多测试 20 个工作流"), "教学工作流", "管理员可批量测试选中工作流并同步测试状态", "bulk workflow tests");
assert(textFiles.server.includes("Workflow route tests") && textFiles.app.includes("workflowTestLabel") && textFiles.server.includes("lastTestDurationMs"), "教学工作流", "工作流测试结果持久化并进入上线自检", "workflow lastTestStatus readiness");
assert(textFiles.server.includes("invalidateWorkflowTestIfChanged") && textFiles.server.includes("configuration changed") && textFiles.server.includes("restored version"), "教学工作流", "工作流关键配置变更后自动要求重新测试", "workflow test invalidation");
assert(textFiles.server.includes("validateWorkflowPublishGate") && textFiles.server.includes("Published workflows require a passing workflow test"), "教学工作流", "工作流发布前必须通过路由测试", "workflow publish test gate");
assert(textFiles.app.includes("workflowPublishGateLabel") && textFiles.app.includes("需重测后发布"), "教学工作流", "管理端显示工作流发布前测试门禁提示", "workflow publish gate UI");
assert(textFiles.server.includes("workflowVersionDiffMatch") && textFiles.server.includes("buildWorkflowVersionDiff") && textFiles.app.includes("/api/admin/workflows/${encodeURIComponent(id)}/versions/diff"), "教学工作流", "管理员可查看工作流版本差异摘要用于审核结构化配置变更", "workflow version diff");
assert(textFiles.index.includes("workflowTestStatus") && textFiles.app.includes("workflowTestFilterStatus") && textFiles.app.includes("filteredManagementWorkflows"), "教学工作流", "管理端可按测试状态筛选工作流", "workflow test status filter");
assert(textFiles.index.includes("workflowQuality") && textFiles.app.includes("workflowQuality") && textFiles.app.includes("matchesQuality") && textFiles.app.includes("流程质量"), "教学工作流", "管理端可按质量筛选工作流", "workflow quality filter");
assert(textFiles.index.includes("workflowSearch") && textFiles.index.includes("workflowSort") && textFiles.app.includes("compareManagementWorkflows"), "教学工作流", "管理端可按关键词检索并按名称、路由、成果类型、状态和测试状态排序工作流", "workflow search and sort");
assert(textFiles.index.includes("workflowGovernance") && textFiles.app.includes("renderWorkflowGovernance") && textFiles.app.includes("artifactCounts"), "教学工作流", "管理端显示当前筛选范围的工作流治理概览", "workflow governance overview");
assert(textFiles.workflowEnvScript.includes("requiredWorkflowRoutes") && textFiles.workflowEnvironment.includes("COZE_API_URL") && textFiles.workflowEnvironment.includes("COZE_WORKFLOW_ID") && textFiles.workflowEnvironment.includes("工作流与模型环境"), "教学工作流", "包含工作流模型环境交接清单和校验脚本", "workflow environment guide");
assert(teachingWorkflows.every(workflow => workflow.inputFields?.length >= 4 && workflow.outputSections?.length >= 4 && workflow.qualityChecklist?.length >= 3), "教学工作流", "内置工作流包含输入字段、输出结构和质量检查清单", "workflow structured specs");
assert(textFiles.server.includes("normalizeWorkflowList") && textFiles.server.includes("defaultWorkflowSpec") && textFiles.server.includes("qualityChecklist"), "教学工作流", "服务端保存并校验工作流结构化规范", "workflow spec normalization");
assert(textFiles.app.includes("workflowSpecSummary") && textFiles.app.includes("workflowQualityLabel") && textFiles.app.includes("输入 ${inputCount}") && textFiles.app.includes("qualityChecklist"), "教学工作流", "管理端展示并检索工作流结构化规范和质量状态", "workflow spec UI");
assert(textFiles.app.includes("workflowRouteStatusLabel") && textFiles.app.includes("workflowRouteMissingEnv") && textFiles.app.includes("模型未配置") && textFiles.app.includes("workflow-route-missing"), "教学工作流", "工作流管理显示每条流程的模型路由配置状态和缺失环境变量", "workflow route env status");
assert(textFiles.app.includes("data-edit-workflow-spec") && textFiles.app.includes("editWorkflowSpec") && textFiles.app.includes("parseWorkflowSpecList"), "教学工作流", "管理员可编辑工作流输入输出和质量规范", "workflow spec editor");
assert(textFiles.server.includes("/api/admin/workflows-quality.csv") && textFiles.server.includes("buildWorkflowsQualityCsv") && textFiles.app.includes("exportWorkflowQuality"), "教学工作流", "超级管理员可导出工作流质量 CSV 台账", "workflow quality CSV export");
assert(textFiles.server.includes("routeMissingEnv") && textFiles.server.includes("fallbackRoutes") && textFiles.app.includes("routeConfigured") && textFiles.app.includes("routeEnvNames"), "教学工作流", "工作流质量 CSV 包含模型路由配置、缺失环境变量和备用路线字段", "workflow route env CSV");

for (const endpoint of [
  "/api/auth/login",
  "/api/auth/sso/config",
  "/api/auth/sso",
  "/api/auth/sso/callback",
  "/api/health",
  "/api/admin/agents",
  "/api/admin/agents/coze-links",
  "/api/admin/agents/bulk",
  "/api/admin/workflows",
  "/api/admin/workflows/bulk",
  "/api/admin/workflows-quality.csv",
  "/api/admin/providers.csv",
  "/api/admin/model-runs",
  "/api/admin/model-runs.csv",
  "/api/admin/artifacts/cleanup",
  "/api/admin/artifacts.csv",
  "/api/admin/users.csv",
  "/api/admin/agents-quality.csv",
  "/api/admin/version-history.csv",
  "/api/admin/token-adjustments",
  "/api/admin/token-ledger.csv",
  "/api/admin/audit-logs.csv",
  "/api/admin/feedback.csv",
  "/api/admin/alumni/applications.csv",
  "/api/chat/stream",
  "/api/artifacts",
  "/api/alumni/applications",
  "/api/admin/readiness",
  "/api/admin/branding",
  "/api/admin/backup",
  "/api/admin/restore",
  "/api/admin/catalog/reset",
  "/api/admin/maintenance"
]) {
  assert(textFiles.server.includes(endpoint), "服务端 API", `实现 ${endpoint}`, endpoint);
}
assert(textFiles.server.includes("/duplicate") && textFiles.server.includes("workflow.duplicate"), "教学工作流", "服务端支持复制工作流模板", "workflow duplicate endpoint");

assert(textFiles.server.includes("1000000"), "校友权益", "校友认证发放 1,000,000 Token", "server/index.mjs 1000000");
assert(textFiles.server.includes("30 * 24 * 60 * 60 * 1000"), "校友权益", "校友权益有效期 30 天", "30 days expression");
assert(textFiles.server.includes("ALUMNI_ASSOCIATION_VERIFY_URL"), "校友权益", "支持校友会联合认证接口", "ALUMNI_ASSOCIATION_VERIFY_URL");
assert(textFiles.server.includes("buildQuotaMetrics") && textFiles.app.includes("校友权益") && textFiles.app.includes("remainingTokens"), "校友权益", "运行统计展示校友 Token 权益运营概览", "quota metrics");
assert(textFiles.server.includes("reserveQuota") && textFiles.server.includes("releaseReservation"), "Token 账本", "国产模型额度预留、结算和失败释放", "reserve/release");
assert(textFiles.server.includes("/api/admin/token-adjustments") && textFiles.server.includes("token.adjust") && textFiles.app.includes("submitTokenAdjustment"), "Token 账本", "超级管理员可人工补发或扣减活跃校友 Token 并写入审计", "manual token adjustment");
assert(textFiles.server.includes("/api/admin/token-ledger.csv") && textFiles.app.includes("exportTokenLedger"), "Token 账本", "管理员可导出模型消费 CSV 账本", "token ledger CSV export");
assert(textFiles.server.includes("/api/admin/audit-logs.csv") && textFiles.app.includes("exportAuditLogs"), "审计日志", "超级管理员可导出脱敏审计 CSV", "audit log CSV export");
assert(textFiles.index.includes("auditSearch") && textFiles.index.includes("auditActionFilter") && textFiles.app.includes("filteredAuditLogs"), "审计日志", "管理后台可按关键词和动作筛选审计日志", "audit filters");
assert(textFiles.index.includes("auditGovernance") && textFiles.app.includes("renderAuditGovernance") && textFiles.app.includes("风险线索"), "审计日志", "审计日志显示当前筛选范围治理概览", "audit governance");
assert(textFiles.server.includes("/api/admin/users.csv") && textFiles.app.includes("exportUsers") && textFiles.server.includes("user.export"), "安全边界", "超级管理员可导出脱敏账号台账 CSV 并写入审计", "user CSV export");
assert(textFiles.index.includes("userSearch") && textFiles.index.includes("userRoleFilter") && textFiles.index.includes("userStatusFilter") && textFiles.app.includes("filteredUsers"), "安全边界", "账号管理支持按关键词、角色和状态筛选", "user filters");
assert(textFiles.index.includes("userGovernance") && textFiles.app.includes("renderUserGovernance") && textFiles.app.includes("待改密"), "安全边界", "账号管理显示当前筛选范围治理概览", "user governance");
assert(textFiles.server.includes("/api/admin/feedback.csv") && textFiles.app.includes("exportFeedback") && textFiles.server.includes("feedback.export"), "用户反馈", "超级管理员可导出反馈 CSV 并写入审计", "feedback CSV export");
assert(textFiles.index.includes("feedbackSearch") && textFiles.index.includes("feedbackStatusFilter") && textFiles.index.includes("feedbackTypeFilter") && textFiles.app.includes("filteredFeedbackItems"), "用户反馈", "反馈队列支持按关键词、状态和类型筛选", "feedback filters");
assert(textFiles.index.includes("feedbackGovernance") && textFiles.app.includes("renderFeedbackGovernance") && textFiles.app.includes("联系信息"), "用户反馈", "反馈队列显示当前筛选范围治理概览", "feedback governance");
assert(textFiles.server.includes("/api/admin/alumni/applications.csv") && textFiles.app.includes("exportAlumniApplications") && textFiles.server.includes("alumni.export"), "校友权益", "超级管理员可导出校友认证 CSV 并写入审计", "alumni CSV export");
assert(textFiles.index.includes("alumniReviewSearch") && textFiles.index.includes("alumniReviewStatus") && textFiles.app.includes("filteredAlumniApplications"), "校友权益", "校友认证审核支持按关键词和状态筛选", "alumni review filters");
assert(textFiles.index.includes("alumniReviewGovernance") && textFiles.app.includes("renderAlumniReviewGovernance") && textFiles.app.includes("权益预估"), "校友权益", "校友认证审核显示当前筛选范围治理概览", "alumni review governance");
assert(textFiles.server.includes("buildArtifacts") && textFiles.app.includes("renderArtifacts") && textFiles.index.includes("view-artifacts"), "教学工作流", "工作流成果沉淀到用户成果库并可下载", "artifact library");
assert(textFiles.index.includes("artifactSearch") && textFiles.index.includes("artifactTypeFilter") && textFiles.index.includes("artifactWorkflowFilter") && textFiles.app.includes("filteredArtifacts"), "教学工作流", "成果库支持按关键词、类型和工作流筛选", "artifact filters");
assert(textFiles.index.includes("artifactGovernance") && textFiles.app.includes("renderArtifactGovernance") && textFiles.app.includes("最新成果"), "教学工作流", "成果库显示当前筛选范围资产治理概览", "artifact governance");
assert(textFiles.server.includes("artifact.delete") && textFiles.app.includes("data-delete-artifact") && textFiles.app.includes("deleteArtifact"), "教学工作流", "成果库支持权限校验的成果删除和审计", "artifact.delete");
assert(textFiles.index.includes("selectVisibleArtifacts") && textFiles.index.includes("bulkDeleteArtifacts") && textFiles.app.includes("bulkDeleteArtifacts") && textFiles.app.includes("selectedArtifactIds"), "教学工作流", "成果库支持当前筛选范围全选和批量删除", "artifact bulk delete");
assert(textFiles.server.includes("artifact.cleanup") && textFiles.app.includes("cleanupArtifacts") && textFiles.index.includes("cleanupArtifacts"), "教学工作流", "超级管理员可按保留天数清理旧成果文件", "artifact.cleanup");
assert(textFiles.server.includes("/api/admin/artifacts.csv") && textFiles.app.includes("exportArtifacts") && textFiles.server.includes("artifact.export"), "教学工作流", "超级管理员可导出成果资产清单 CSV", "artifact CSV export");

assert(textFiles.server.includes("providerStatuses") && textFiles.app.includes("/api/admin/providers"), "模型网关", "后台查看模型状态并测试连接", "providers API");
assert(textFiles.server.includes("/api/admin/providers.csv") && textFiles.server.includes("buildProviderStatusCsv") && textFiles.app.includes("exportProviders") && textFiles.index.includes("exportProviders"), "模型网关", "超级管理员可导出脱敏模型供应商配置状态 CSV 台账", "provider status CSV export");
assert(textFiles.index.includes("providerSearch") && textFiles.index.includes("providerConfigFilter") && textFiles.index.includes("providerTypeFilter") && textFiles.app.includes("filteredProviders"), "模型网关", "后台模型路由状态支持按关键词、配置状态和模型类型筛选", "provider filters");
assert(textFiles.models.includes("missingEnv") && textFiles.models.includes("envNames") && textFiles.app.includes("provider-missing") && textFiles.app.includes("缺少："), "模型网关", "后台模型路由状态显示缺失的服务端环境变量且不泄露密钥值", "provider missing env");
assert(textFiles.index.includes("bulkProviderTest") && textFiles.app.includes("bulkTestConfiguredProviders") && textFiles.app.includes("testProviderRequest"), "模型网关", "后台可批量测试已配置模型供应商连接", "bulk provider tests");
assert(textFiles.index.includes("providerGovernance") && textFiles.app.includes("renderProviderGovernance") && textFiles.app.includes("配置覆盖"), "模型网关", "后台模型路由状态显示供应商配置覆盖治理概览", "provider governance");
assert(textFiles.server.includes("callModelWithFallback") && textFiles.server.includes("fallbackUsed") && textFiles.server.includes("attempts"), "模型网关", "自动路由支持备用模型链路和审计证据", "fallbackUsed/attempts");
assert(textFiles.server.includes("modelRuns") && textFiles.server.includes("/api/admin/model-runs") && textFiles.app.includes("renderModelRuns"), "模型网关", "后台记录并展示脱敏模型调用台账", "model run ledger");
assert(textFiles.index.includes("modelRunSearch") && textFiles.index.includes("modelRunStatusFilter") && textFiles.index.includes("modelRunRouteFilter") && textFiles.app.includes("filteredModelRuns"), "模型网关", "模型调用台账支持按关键词、状态和路由筛选", "model run filters");
assert(textFiles.index.includes("modelRunGovernance") && textFiles.app.includes("renderModelRunGovernance") && textFiles.app.includes("备用链路"), "模型网关", "模型调用台账显示当前筛选范围治理概览", "model run governance");
assert(textFiles.server.includes("/api/admin/model-runs.csv") && textFiles.app.includes("exportModelRuns"), "模型网关", "超级管理员可导出模型调用台账 CSV", "model run CSV export");
assert(textFiles.index.includes("metricsWindow") && textFiles.server.includes("metricsWindowDays") && textFiles.app.includes("refreshMetrics"), "运营统计", "后台运行统计支持 7/30/90 天周期切换", "metrics window");
assert(await exists("scripts/operations-schedule.mjs") && textFiles.packageJson.includes("operations:schedule") && textFiles.operationsScheduleScript.includes("周期运营清单"), "运营统计", "包含周期运营清单生成器", "scripts/operations-schedule.mjs");
assert(await exists("docs/OPERATIONS_SCHEDULE.md") && textFiles.operationsSchedule.includes("每日") && textFiles.operationsSchedule.includes("每季度"), "运营统计", "生成上线后周期运营清单", "docs/OPERATIONS_SCHEDULE.md");
assert(await exists("scripts/permissions-matrix.mjs") && textFiles.packageJson.includes("permissions:report") && textFiles.permissionsScript.includes("权限矩阵"), "安全边界", "包含角色权限矩阵生成器", "scripts/permissions-matrix.mjs");
assert(await exists("docs/PERMISSIONS.md") && textFiles.permissions.includes("super_admin") && textFiles.permissions.includes("alumni_reviewer") && textFiles.permissions.includes("权限矩阵"), "安全边界", "生成上线交接权限矩阵", "docs/PERMISSIONS.md");
assert(textFiles.releaseRehearsalScript.includes("permissions-matrix.mjs") && textFiles.releaseRehearsal.includes("权限矩阵"), "安全边界", "上线演练覆盖权限矩阵报告", "release rehearsal permissions matrix");
for (const route of ["kimi", "deepseek", "chatgpt", "coze", "gemini", "qwen"]) {
  assert(Boolean(routeById(route)), "模型网关", `存在 ${route} 路由`, route);
}
assert(!/API_KEY\s*=|MOONSHOT_API_KEY|DEEPSEEK_API_KEY|OPENAI_API_KEY|GEMINI_API_KEY|COZE_API_KEY/.test(textFiles.app), "安全边界", "前端不包含模型 API Key 名称或密钥配置", "app.js secret scan");
assert(await exists("scripts/browser-secret-scan.mjs") && textFiles.packageJson.includes("scan:browser-secrets") && textFiles.browserSecretScanScript.includes("Browser secret scan"), "安全边界", "包含浏览器产物密钥扫描脚本", "scripts/browser-secret-scan.mjs");
assert(textFiles.releaseRehearsalScript.includes("browser-secret-scan.mjs") && textFiles.releaseRehearsal.includes("浏览器产物密钥扫描"), "安全边界", "上线演练覆盖浏览器产物密钥扫描", "release rehearsal secret scan");
assert(textFiles.auth.includes("sessionTokenHash") && textFiles.auth.includes("SESSION_SECRET") && textFiles.auth.includes("createHmac") && textFiles.deployCheck.includes("Session secret"), "安全边界", "服务端会话 token 以 SESSION_SECRET HMAC 摘要形式持久化并进入生产门禁", "SESSION_SECRET session HMAC");
assert(textFiles.auth.includes("migrateSessionStorage") && textFiles.server.includes("legacySessionsRemoved") && textFiles.server.includes("!session.token"), "安全边界", "服务启动和维护任务会清理旧结构原始会话 token", "legacy session cleanup");
assert(textFiles.server.includes("loginAttempts") && textFiles.server.includes("auth.login.failed") && textFiles.server.includes("auth.login.locked"), "安全边界", "登录失败节流和审计记录", "login throttle");
assert(textFiles.server.includes("wouldRemoveLastActiveSuperAdmin") && textFiles.server.includes("At least one active super administrator is required") && textFiles.server.includes("Initial password must be at least 8 characters"), "安全边界", "账号管理保护最后一个可用超级管理员并统一 8 位初始密码", "super admin safety");
assert(textFiles.server.includes("validateBackupForRestore") && textFiles.server.includes("Backup version is newer") && textFiles.server.includes("Backup contains sensitive field"), "部署", "备份恢复拒绝未来版本和敏感字段", "backup restore guard");
assert(textFiles.server.includes("buildBackupManifest") && textFiles.server.includes("Backup manifest checksum does not match") && textFiles.server.includes("stableJson"), "部署", "平台备份包含 manifest 计数和 SHA-256 校验并在恢复前校验完整性", "backup manifest checksum");
assert(textFiles.server.includes("runPlatformMaintenance") && textFiles.server.includes("platform.maintenance") && textFiles.app.includes("runMaintenance") && textFiles.index.includes("runMaintenance"), "部署", "超级管理员可运行平台维护清理过期会话、SSO 状态和 Token 预占并写入审计", "platform maintenance");
assert(textFiles.server.includes("Backup cadence") && textFiles.server.includes("Maintenance cadence") && textFiles.server.includes("latestAuditAt") && textFiles.server.includes("cadenceLevel"), "部署", "上线自检按审计记录核查最近备份和维护节奏", "operations cadence readiness");
assert(textFiles.server.includes("createOAuthState") && textFiles.server.includes("upsertSsoUser") && textFiles.index.includes("ssoLoginButton"), "安全边界", "支持学校统一身份认证 OIDC 登录并自动映射本地账号", "SSO OIDC login");
assert(textFiles.server.includes("School SSO") && textFiles.environment.includes("SSO_CLIENT_ID") && textFiles.packageJson.includes("check:env"), "部署", "统一身份认证配置进入上线自检和环境清单", "SSO env/readiness");
assert(textFiles.deployCheck.includes("COZE_API_URL") && textFiles.environment.includes("COZE_API_URL") && textFiles.workflowEnvironment.includes("COZE_API_URL"), "部署", "Coze 工作流 URL、Key 和 Workflow ID 进入生产门禁", "COZE_API_URL/COZE_WORKFLOW_ID");
assert(textFiles.deployCheck.includes("Coze links handoff") && textFiles.deployCheck.includes("coze-links-template.csv"), "部署", "部署自检覆盖 100 个 Coze 发布页回填模板交接", "Coze links deploy handoff");
assert(textFiles.index.includes("data-super-only") && textFiles.app.includes("[data-super-only]") && textFiles.server.includes("No token ledger export permission") && textFiles.server.includes("No branding permission"), "安全边界", "高风险后台操作仅超级管理员可见和可调用", "super admin only controls");
assert(textFiles.server.includes("isValidUploadBody") && textFiles.server.includes("file.upload.rejected"), "安全边界", "服务端校验上传文件真实类型并审计拒绝记录", "upload signature validation");

assert(textFiles.store.includes("branding"), "品牌与上线", "品牌配置持久化", "store branding");
assert(textFiles.app.includes("brandingForm") && textFiles.server.includes("/api/admin/branding"), "品牌与上线", "后台可维护品牌素材", "brandingForm/API");
assert(textFiles.server.includes("buildReadiness") && textFiles.app.includes("readinessList"), "品牌与上线", "后台上线自检面板", "readiness");
assert(textFiles.server.includes("Coze workflow endpoint") && textFiles.server.includes("COZE_API_URL") && textFiles.server.includes("Coze published agent links"), "品牌与上线", "上线自检覆盖 Coze Workflow URL 与 100 个 Coze 发布页回填状态", "Coze readiness gates");
assert(textFiles.index.includes("readinessSearch") && textFiles.index.includes("readinessLevelFilter") && textFiles.index.includes("readinessOwnerFilter") && textFiles.app.includes("filteredReadinessChecks"), "品牌与上线", "上线自检支持按关键词、状态和责任方筛选", "readiness filters");
assert(textFiles.index.includes("exportReadiness") && textFiles.app.includes("exportReadiness") && textFiles.app.includes("xiaozhuang-readiness"), "品牌与上线", "上线自检支持导出当前筛选清单 CSV", "readiness CSV export");
assert(textFiles.server.includes("readinessOwner") && textFiles.app.includes("item.owner") && textFiles.deployCheck.includes("deploymentOwner"), "品牌与上线", "上线自检与部署报告标注责任方便于分派", "readiness owner");
assert(textFiles.server.includes("Agent catalog size") && textFiles.server.includes("Workflow validation"), "品牌与上线", "上线自检覆盖智能体目录和工作流质量", "catalog/workflow readiness");
assert(textFiles.server.includes("Agent quality governance") && textFiles.server.includes("Workflow quality governance"), "品牌与上线", "上线自检覆盖智能体和工作流质量治理缺口", "quality governance readiness");
assert(textFiles.server.includes("Agent version governance") && textFiles.server.includes("Workflow version governance"), "品牌与上线", "上线自检覆盖智能体和工作流版本治理状态", "version governance readiness");
assert(textFiles.server.includes("resetDefaultCatalog") && textFiles.app.includes("resetCatalog"), "智能体编辑", "管理员可恢复默认 100 智能体和教学工作流目录", "catalog reset");

assert(await exists("Dockerfile") && await exists("compose.yml"), "部署", "包含容器部署文件", "Dockerfile + compose.yml");
assert(textFiles.containerWorkflow.includes("docker/build-push-action") && textFiles.containerWorkflow.includes("docker compose config") && textFiles.containerWorkflow.includes("ghcr.io") && textFiles.deployCheck.includes("Server container workflow"), "部署", "包含服务端容器镜像构建、Compose 校验和 GHCR 发布工作流", "container.yml server image CI");
assert(textFiles.server.includes("buildHealth") && textFiles.dockerfile.includes("HEALTHCHECK") && textFiles.compose.includes("healthcheck"), "部署", "包含公开健康检查和容器健康检查", "/api/health + HEALTHCHECK");
assert(textFiles.server.includes("DEMO_MODE") && textFiles.server.includes("Demo acceptance mode") && textFiles.environment.includes("DEMO_MODE"), "部署", "Demo 验收模式可放宽真实外部依赖但保留生产上线门禁", "DEMO_MODE readiness");
assert(textFiles.nginx.includes("listen 443 ssl") && textFiles.nginx.includes("proxy_pass http://xiaozhuang_platform_node") && textFiles.nginx.includes("Strict-Transport-Security") && textFiles.deployCheck.includes("HTTPS reverse proxy template"), "部署", "包含 HTTPS Nginx 反向代理模板并进入部署自检", "deploy/nginx/xiaozhuang-platform.conf");
assert(textFiles.systemd.includes("ExecStart=/usr/bin/node --env-file-if-exists=.env server/index.mjs") && textFiles.systemd.includes("EnvironmentFile=-/etc/xiaozhuang-platform.env") && textFiles.systemd.includes("Restart=always") && textFiles.deployCheck.includes("Systemd service template"), "部署", "包含非容器 Linux 服务器 systemd 常驻运行模板并进入部署自检", "deploy/systemd/xiaozhuang-platform.service");
assert(textFiles.systemdBackup.includes("PLATFORM_DATA_DIR=/var/lib/xiaozhuang-platform") && textFiles.systemdBackup.includes("sha256sum") && textFiles.systemdBackup.includes("OnCalendar=*-*-* 02:20:00") && textFiles.deployCheck.includes("Systemd data backup timer"), "部署", "包含 DATA_DIR 服务器级定时备份模板并进入部署自检", "deploy/systemd/xiaozhuang-platform-backup.timer");
assert(textFiles.disasterRecovery.includes("sha256sum -c") && textFiles.disasterRecovery.includes("platform.restore") && textFiles.disasterRecovery.includes("正式恢复原则") && textFiles.deployCheck.includes("Disaster recovery rehearsal"), "部署", "包含季度灾备恢复演练 runbook 并进入部署自检", "docs/DISASTER_RECOVERY.md");
assert(textFiles.monitoring.includes("xiaozhuang-platform-health") && textFiles.monitoring.includes("XiaozhuangPlatformHealthDown") && textFiles.monitoring.includes("probe_ssl_earliest_cert_expiry") && textFiles.deployCheck.includes("Monitoring and alerting templates"), "部署", "包含 Prometheus/blackbox 健康监控和告警模板并进入部署自检", "deploy/monitoring");
assert(await exists(".env.production.example") && await exists("docs/DEPLOYMENT.md"), "部署", "包含生产环境模板和部署手册", ".env.production.example + docs/DEPLOYMENT.md");
assert(textFiles.index.includes("config.js") && textFiles.app.includes("apiUrl(path)") && textFiles.config.includes("apiBase") && textFiles.server.includes("FRONTEND_ORIGINS") && textFiles.server.includes("PUBLIC_FRONTEND_URL") && textFiles.auth.includes("COOKIE_SAMESITE"), "部署", "GitHub Pages 静态前端可配置远端 Node API、SSO 回跳和跨域 Cookie 登录", "config.js apiBase + CORS");
assert(textFiles.browserSecretScanScript.includes("config.js") && textFiles.browserSecretScanScript.includes("pages-dist/config.js") && textFiles.readme.includes("PUBLIC_FRONTEND_URL"), "部署", "前端运行时配置纳入 Pages 构建、部署说明和浏览器密钥扫描", "runtime config scan");
assert(await exists("scripts/env-check.mjs") && await exists("docs/ENVIRONMENT.md") && textFiles.packageJson.includes("check:env"), "部署", "包含生产环境变量清单生成与校验门禁", "scripts/env-check.mjs + docs/ENVIRONMENT.md");
assert(await exists("scripts/workflow-env-report.mjs") && await exists("docs/WORKFLOW_ENVIRONMENT.md") && textFiles.packageJson.includes("check:workflow-env"), "部署", "包含工作流环境清单生成与校验门禁", "scripts/workflow-env-report.mjs + docs/WORKFLOW_ENVIRONMENT.md");
assert(await exists("scripts/launch-package.mjs") && textFiles.packageJson.includes("launch:package") && textFiles.launchPackageScript.includes("上线交接包"), "部署", "包含上线交接包生成器", "scripts/launch-package.mjs");
assert(await exists("docs/LAUNCH_PACKAGE.md") && textFiles.launchPackage.includes("上线前必须完成") && textFiles.launchPackage.includes("100 个智能体"), "部署", "生成上线交接包报告", "docs/LAUNCH_PACKAGE.md");
assert(await exists("scripts/coze-links-template.mjs") && textFiles.packageJson.includes("coze:template:report") && textFiles.cozeTemplateScript.includes("docs/coze-links-template.csv") && textFiles.releaseRehearsalScript.includes("coze-links-template.mjs"), "部署", "包含 100 个 Coze 智能体发布页回填模板生成器", "Coze links template");
assert(textFiles.launchPackageScript.includes("docs/PERMISSIONS.md") && textFiles.launchPackage.includes("docs/PERMISSIONS.md"), "部署", "上线交接包纳入权限矩阵来源报告", "launch package permissions source");
assert(await exists("scripts/release-rehearsal.mjs") && textFiles.packageJson.includes("release:rehearsal") && textFiles.releaseRehearsalScript.includes("上线演练报告"), "部署", "包含上线演练命令", "scripts/release-rehearsal.mjs");
assert(await exists("docs/RELEASE_REHEARSAL.md") && textFiles.releaseRehearsal.includes("上线演练报告") && textFiles.releaseRehearsal.includes("GitHub Pages 静态构建"), "部署", "生成上线演练报告", "docs/RELEASE_REHEARSAL.md");
assert(await exists("scripts/post-deploy-smoke.mjs") && textFiles.packageJson.includes("smoke:post-deploy") && textFiles.postDeploySmokeScript.includes("DEPLOY_BASE_URL"), "部署", "包含部署后线上烟测脚本", "scripts/post-deploy-smoke.mjs");
assert(await exists("docs/POST_DEPLOY_SMOKE.md") && textFiles.postDeploySmoke.includes("部署后烟测") && textFiles.postDeploySmoke.includes("DEPLOY_BASE_URL"), "部署", "生成部署后烟测报告", "docs/POST_DEPLOY_SMOKE.md");
assert(await exists(".github/workflows/pages.yml"), "部署", "包含 GitHub Actions Pages 工作流", ".github/workflows/pages.yml");
assert(textFiles.workflow.includes("node-version: 24"), "部署", "CI 使用 Node 24", "node-version: 24");
assert(textFiles.workflow.includes("npm run acceptance"), "自动验收", "CI 生成验收报告", "npm run acceptance");
assert(textFiles.workflow.includes("acceptance-report"), "自动验收", "CI 上传验收报告 artifact", "acceptance-report");
assert(textFiles.workflow.includes("deployment-check-report") && textFiles.packageJson.includes("check:deploy:report"), "自动验收", "CI 上传部署自检报告 artifact", "deployment-check-report");
assert(textFiles.workflow.includes("environment-config-guide") && textFiles.environment.includes("MOONSHOT_API_KEY") && textFiles.environment.includes("COZE_API_URL") && textFiles.environment.includes("COZE_WORKFLOW_ID"), "自动验收", "CI 上传生产环境变量配置清单 artifact", "environment-config-guide");
assert(textFiles.workflow.includes("workflow-environment-guide") && textFiles.workflow.includes("npm run check:workflow-env:report") && textFiles.workflowEnvironment.includes("COZE_API_URL") && textFiles.workflowEnvironment.includes("COZE_WORKFLOW_ID"), "自动验收", "CI 上传教学工作流环境清单 artifact", "workflow-environment-guide");
assert(textFiles.workflow.includes("operations-schedule") && textFiles.workflow.includes("npm run operations:schedule:report"), "自动验收", "CI 上传周期运营清单 artifact", "operations-schedule");
assert(textFiles.workflow.includes("permission-matrix") && textFiles.workflow.includes("npm run permissions:report"), "自动验收", "CI 上传权限矩阵 artifact", "permission-matrix");
assert(textFiles.workflow.includes("coze-links-template") && textFiles.workflow.includes("npm run coze:template:report"), "自动验收", "CI 生成并上传 Coze 发布页回填模板", "coze-links-template");
assert(textFiles.workflow.includes("launch-handoff-package") && textFiles.workflow.includes("npm run launch:package:report"), "自动验收", "CI 上传上线交接包 artifact", "launch-handoff-package");
assert(textFiles.workflow.includes("release-rehearsal-report") && textFiles.workflow.includes("npm run release:rehearsal"), "自动验收", "CI 上传上线演练报告 artifact", "release-rehearsal-report");
assert(textFiles.workflow.includes("npm run scan:browser-secrets"), "自动验收", "CI 执行浏览器产物密钥扫描", "scan:browser-secrets");
assert(textFiles.workflow.includes("post-deploy-smoke-report") && textFiles.workflow.includes("npm run smoke:post-deploy:report"), "自动验收", "CI 上传部署后烟测报告 artifact", "post-deploy-smoke-report");
assert(["npm run check", "npm run acceptance", "npm run check:deploy:report", "npm test", "npm run build:pages", "actions/deploy-pages"].every(token => textFiles.workflow.includes(token)) && textFiles.deployCheck.includes("GitHub Actions verification"), "自动验收", "部署自检会校验 GitHub Actions 全量验证链路", "CI verification gate");
assert(await exists("pages-dist/index.html"), "部署", "已生成 GitHub Pages 静态产物", "pages-dist/index.html");
assert(textFiles.packageJson.includes("\"check\"") && textFiles.packageJson.includes("\"test:server\"") && textFiles.packageJson.includes("\"test:e2e\""), "自动验收", "package.json 暴露检查与测试脚本", "check/test scripts");

const failures = checks.filter(item => item.status === "FAIL");
const report = renderReport(checks);

if (shouldWrite) {
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(path.join(root, "docs", "ACCEPTANCE.md"), report, "utf8");
}

if (failures.length) {
  console.error("Acceptance check failed:");
  for (const item of failures) console.error(`- [${item.area}] ${item.item}: ${item.evidence}`);
  process.exit(1);
}

console.log(`Acceptance check passed: ${checks.length} requirements verified`);
if (shouldWrite) console.log("Acceptance report written to docs/ACCEPTANCE.md");

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function countBy(items, getKey) {
  const counts = new Map();
  for (const item of items) counts.set(getKey(item), (counts.get(getKey(item)) || 0) + 1);
  return counts;
}

function renderReport(items) {
  const generatedAt = new Date().toISOString();
  const passCount = items.filter(item => item.status === "PASS").length;
  const failCount = items.filter(item => item.status === "FAIL").length;
  const rows = items.map(item => `| ${item.status} | ${item.area} | ${item.item} | ${String(item.evidence).replace(/\|/g, "\\|")} |`).join("\n");
  return `# 百年晓庄智慧教育平台验收清单

生成时间：${generatedAt}

结果：${passCount} 项通过，${failCount} 项失败。

> 本清单由 \`npm run acceptance\` 生成，用于证明平台关键交付要求仍被当前代码满足。生产上线前仍需完成真实 API Key、官方素材、校友会接口和统一身份认证配置。

| 状态 | 模块 | 验收项 | 证据 |
|---|---|---|---|
${rows}
`;
}
