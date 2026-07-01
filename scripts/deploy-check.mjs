import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");
const shouldWrite = process.argv.includes("--write");
const env = { ...process.env, ...await readEnvFile(path.join(root, ".env")) };
const checks = [];

function record(level, name, detail, owner = deploymentOwner(name)) {
  checks.push({ level, name, owner, detail });
}

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function requiredEnv(name, label = name) {
  if (env[name]) record("ok", label, `${name} configured`);
  else record("fail", label, `${name} is missing`);
}

function recommendedEnv(name, label = name) {
  if (env[name]) record("ok", label, `${name} configured`);
  else record("warn", label, `${name} is not configured`);
}

record("ok", "Node runtime", process.version);

if (await exists(".env")) record("ok", ".env", "Local environment file exists");
else record("warn", ".env", "Copy .env.production.example to .env before production deployment");

if (env.NODE_ENV === "production") record("ok", "NODE_ENV", "production");
else record("warn", "NODE_ENV", `Current NODE_ENV is ${env.NODE_ENV || "not set"}`);

if (env.DEV_ADMIN_PASSWORD && env.DEV_ADMIN_PASSWORD !== "xz2026" && env.DEV_ADMIN_PASSWORD !== "change-me") {
  record("ok", "Admin password", "Development default password has been changed");
} else {
  record("fail", "Admin password", "Set DEV_ADMIN_PASSWORD to a strong production value");
}

if (
  env.SESSION_SECRET
  && env.SESSION_SECRET.length >= 32
  && !["change-me", "change-me-random-32-plus-character-secret", "development-session-secret"].includes(env.SESSION_SECRET)
) {
  record("ok", "Session secret", "SESSION_SECRET configured");
} else {
  record("fail", "Session secret", "Set SESSION_SECRET to a random value of at least 32 characters");
}

const dataDir = env.DATA_DIR || "./server/data";
record("ok", "DATA_DIR", dataDir);

requiredEnv("DEEPSEEK_API_KEY", "DeepSeek for lesson plans");
requiredEnv("MOONSHOT_API_KEY", "Kimi for long context");
requiredEnv("OPENAI_API_KEY", "ChatGPT for PPT and HTML presentations");
requiredEnv("COZE_API_KEY", "Coze for web animation");
requiredEnv("COZE_API_URL", "Coze workflow endpoint");
requiredEnv("COZE_WORKFLOW_ID", "Coze workflow id");
requiredEnv("GEMINI_API_KEY", "Gemini for image understanding");
recommendedEnv("QWEN_API_KEY", "Qwen general Chinese tasks");
recommendedEnv("DOUBAO_API_KEY", "Doubao general fallback");
recommendedEnv("GLM_API_KEY", "GLM knowledge fallback");
recommendedEnv("ERNIE_API_KEY", "Ernie policy tasks");
recommendedEnv("HUNYUAN_API_KEY", "Hunyuan service fallback");
recommendedEnv("ALUMNI_ASSOCIATION_VERIFY_URL", "Alumni association joint verification");
if (["1", "true", "yes"].includes(String(env.SSO_ENABLED || "").toLowerCase())) {
  const missingSso = ["SSO_AUTHORIZATION_URL", "SSO_TOKEN_URL", "SSO_USERINFO_URL", "SSO_CLIENT_ID", "SSO_CLIENT_SECRET"]
    .filter(name => !env[name]);
  if (missingSso.length) record("fail", "School SSO", `SSO_ENABLED is true but ${missingSso.join(", ")} missing`);
  else record("ok", "School SSO", "OIDC login configured");
} else {
  record("warn", "School SSO", "SSO_ENABLED is not true; local platform accounts remain the login path");
}

if (await exists("assets/njxzc-seal.png")) {
  const schoolMark = await readFile(path.join(root, "assets/njxzc-seal.png"), "utf8");
  if (/资源位|正式上线时应替换/.test(schoolMark)) {
    record("fail", "Official school mark", "assets/njxzc-seal.png is still the development placeholder");
  } else {
    record("ok", "Official school mark", "School mark placeholder appears to be replaced");
  }
} else {
  record("fail", "Official school mark", "assets/njxzc-seal.png is missing");
}

if (await exists("assets/xiaozhuang-century.png")) {
  const imageStat = await stat(path.join(root, "assets/xiaozhuang-century.png"));
  record(imageStat.size > 100_000 ? "warn" : "fail", "Hero image authorization", "Replace concept image with school-authorized real photography before production");
} else {
  record("fail", "Hero image authorization", "assets/xiaozhuang-century.png is missing");
}

if (await exists("pages-dist/index.html")) record("ok", "GitHub Pages artifact", "pages-dist exists");
else record("warn", "GitHub Pages artifact", "Run npm run build:pages before Pages deployment");

if (await exists(".github/workflows/pages.yml")) {
  const workflow = await readFile(path.join(root, ".github/workflows/pages.yml"), "utf8");
  const requiredWorkflowTokens = [
    "node-version: 24",
    "npm run check",
    "npm run acceptance",
    "npm run check:deploy:report",
    "npm test",
    "npm run build:pages",
    "npm run scan:browser-secrets",
    "npm run smoke:post-deploy:report",
    "acceptance-report",
    "deployment-check-report",
    "environment-config-guide",
    "workflow-environment-guide",
    "npm run check:workflow-env:report",
    "npm run operations:schedule:report",
    "operations-schedule",
    "npm run permissions:report",
    "permission-matrix",
    "npm run launch:package:report",
    "launch-handoff-package",
    "release-rehearsal-report",
    "post-deploy-smoke-report",
    "verification-screenshots",
    "actions/deploy-pages"
  ];
  const missingWorkflowTokens = requiredWorkflowTokens.filter(token => !workflow.includes(token));
  if (missingWorkflowTokens.length) {
    record("fail", "GitHub Actions verification", `pages.yml missing ${missingWorkflowTokens.join(", ")}`);
  } else {
    record("ok", "GitHub Actions verification", "CI covers checks, reports, tests, screenshots and Pages deployment");
  }
} else {
  record("fail", "GitHub Actions verification", ".github/workflows/pages.yml is missing");
}

if (await exists(".github/workflows/container.yml")) {
  const containerWorkflow = await readFile(path.join(root, ".github/workflows/container.yml"), "utf8");
  const requiredContainerTokens = [
    "docker compose config",
    "docker/setup-buildx-action",
    "docker/build-push-action",
    "docker/login-action",
    "ghcr.io",
    "server-container-handoff",
    "Dockerfile",
    "compose.yml",
    "docs/DEPLOYMENT.md"
  ];
  const missingContainerTokens = requiredContainerTokens.filter(token => !containerWorkflow.includes(token));
  if (missingContainerTokens.length) {
    record("fail", "Server container workflow", `container.yml missing ${missingContainerTokens.join(", ")}`);
  } else {
    record("ok", "Server container workflow", "CI builds the Node server image, validates Compose and publishes GHCR images outside pull requests");
  }
} else {
  record("warn", "Server container workflow", ".github/workflows/container.yml is missing; Docker files exist but image publishing is manual");
}

if (await exists("compose.yml") && await exists("Dockerfile")) record("ok", "Container deployment", "Dockerfile and compose.yml exist");
else record("fail", "Container deployment", "Dockerfile or compose.yml is missing");

if (await exists("deploy/nginx/xiaozhuang-platform.conf")) {
  const nginxConfig = await readFile(path.join(root, "deploy/nginx/xiaozhuang-platform.conf"), "utf8");
  const requiredNginxTokens = [
    "listen 443 ssl",
    "proxy_pass http://xiaozhuang_platform_node",
    "client_max_body_size",
    "Strict-Transport-Security",
    "X-Forwarded-Proto https",
    "/api/health"
  ];
  const missingNginxTokens = requiredNginxTokens.filter(token => !nginxConfig.includes(token));
  if (missingNginxTokens.length) {
    record("fail", "HTTPS reverse proxy template", `Nginx template missing ${missingNginxTokens.join(", ")}`);
  } else {
    record("ok", "HTTPS reverse proxy template", "Nginx template covers TLS, health checks, upload limits and security headers");
  }
} else {
  record("warn", "HTTPS reverse proxy template", "deploy/nginx/xiaozhuang-platform.conf is missing");
}

if (await exists("deploy/systemd/xiaozhuang-platform.service")) {
  const systemdUnit = await readFile(path.join(root, "deploy/systemd/xiaozhuang-platform.service"), "utf8");
  const requiredSystemdTokens = [
    "ExecStart=/usr/bin/node --env-file-if-exists=.env server/index.mjs",
    "EnvironmentFile=-/etc/xiaozhuang-platform.env",
    "Environment=DATA_DIR=/var/lib/xiaozhuang-platform",
    "Restart=always",
    "NoNewPrivileges=true",
    "ReadWritePaths=/var/lib/xiaozhuang-platform"
  ];
  const missingSystemdTokens = requiredSystemdTokens.filter(token => !systemdUnit.includes(token));
  if (missingSystemdTokens.length) {
    record("fail", "Systemd service template", `systemd template missing ${missingSystemdTokens.join(", ")}`);
  } else {
    record("ok", "Systemd service template", "systemd template covers env injection, persistent data directory, restart policy and hardening");
  }
} else {
  record("warn", "Systemd service template", "deploy/systemd/xiaozhuang-platform.service is missing");
}

if (await exists("deploy/systemd/xiaozhuang-platform-backup.service") && await exists("deploy/systemd/xiaozhuang-platform-backup.timer")) {
  const backupService = await readFile(path.join(root, "deploy/systemd/xiaozhuang-platform-backup.service"), "utf8");
  const backupTimer = await readFile(path.join(root, "deploy/systemd/xiaozhuang-platform-backup.timer"), "utf8");
  const requiredBackupTokens = [
    "PLATFORM_DATA_DIR=/var/lib/xiaozhuang-platform",
    "PLATFORM_BACKUP_DIR=/var/backups/xiaozhuang-platform",
    "tar --warning=no-file-changed",
    "sha256sum",
    "-mtime +30",
    "OnCalendar=*-*-* 02:20:00",
    "Persistent=true"
  ];
  const backupText = `${backupService}\n${backupTimer}`;
  const missingBackupTokens = requiredBackupTokens.filter(token => !backupText.includes(token));
  if (missingBackupTokens.length) {
    record("fail", "Systemd data backup timer", `backup timer missing ${missingBackupTokens.join(", ")}`);
  } else {
    record("ok", "Systemd data backup timer", "Daily data-directory backup timer archives DATA_DIR, writes SHA-256 checksums and prunes old archives");
  }
} else {
  record("warn", "Systemd data backup timer", "deploy/systemd/xiaozhuang-platform-backup.service or .timer is missing");
}

if (await exists("docs/DISASTER_RECOVERY.md")) {
  const disasterRecovery = await readFile(path.join(root, "docs/DISASTER_RECOVERY.md"), "utf8");
  const requiredDisasterTokens = [
    "sha256sum -c",
    "tar -xzf",
    "platform.restore",
    "DEPLOY_BASE_URL=http://127.0.0.1:18080",
    "正式恢复原则"
  ];
  const missingDisasterTokens = requiredDisasterTokens.filter(token => !disasterRecovery.includes(token));
  if (missingDisasterTokens.length) {
    record("fail", "Disaster recovery rehearsal", `runbook missing ${missingDisasterTokens.join(", ")}`);
  } else {
    record("ok", "Disaster recovery rehearsal", "Runbook covers backup checksum, DATA_DIR restore, JSON restore, smoke test and evidence capture");
  }
} else {
  record("warn", "Disaster recovery rehearsal", "docs/DISASTER_RECOVERY.md is missing");
}

if (await exists("deploy/monitoring/prometheus.yml") && await exists("deploy/monitoring/xiaozhuang-platform-alerts.yml")) {
  const prometheus = await readFile(path.join(root, "deploy/monitoring/prometheus.yml"), "utf8");
  const alerts = await readFile(path.join(root, "deploy/monitoring/xiaozhuang-platform-alerts.yml"), "utf8");
  const requiredMonitoringTokens = [
    "xiaozhuang-platform-health",
    "blackbox-exporter:9115",
    "/api/health",
    "XiaozhuangPlatformHealthDown",
    "XiaozhuangPlatformTlsExpiring",
    "probe_success",
    "probe_ssl_earliest_cert_expiry"
  ];
  const monitoringText = `${prometheus}\n${alerts}`;
  const missingMonitoringTokens = requiredMonitoringTokens.filter(token => !monitoringText.includes(token));
  if (missingMonitoringTokens.length) {
    record("fail", "Monitoring and alerting templates", `monitoring templates missing ${missingMonitoringTokens.join(", ")}`);
  } else {
    record("ok", "Monitoring and alerting templates", "Prometheus blackbox templates cover /api/health availability, latency and TLS expiry alerts");
  }
} else {
  record("warn", "Monitoring and alerting templates", "deploy/monitoring/prometheus.yml or alert rules are missing");
}

if (await exists("docs/ENVIRONMENT.md") && await exists("docs/WORKFLOW_ENVIRONMENT.md") && await exists("scripts/env-check.mjs") && await exists("scripts/workflow-env-report.mjs")) {
  record("ok", "Environment handoff", "Environment and workflow configuration guides exist");
} else {
  record("fail", "Environment handoff", "Run npm run check:env:report and npm run check:workflow-env:report before production handoff");
}

if (await exists("scripts/launch-package.mjs") && await exists("docs/LAUNCH_PACKAGE.md")) {
  record("ok", "Launch handoff package", "Launch package generator and report exist");
} else {
  record("warn", "Launch handoff package", "Run npm run launch:package:report before production handoff");
}

if (await exists("scripts/coze-links-template.mjs") && await exists("docs/COZE_LINKS.md") && await exists("docs/coze-links-template.csv")) {
  record("ok", "Coze links handoff", "100-agent Coze published-page template exists");
} else {
  record("warn", "Coze links handoff", "Run npm run coze:template:report before production handoff");
}

if (await exists("scripts/operations-schedule.mjs") && await exists("docs/OPERATIONS_SCHEDULE.md")) {
  record("ok", "Operations schedule", "Recurring operations schedule exists");
} else {
  record("warn", "Operations schedule", "Run npm run operations:schedule:report before production handoff");
}

if (await exists("scripts/post-deploy-smoke.mjs") && await exists("docs/POST_DEPLOY_SMOKE.md")) {
  record("ok", "Post-deploy smoke", "Post-deploy smoke script and report exist");
} else {
  record("warn", "Post-deploy smoke", "Run npm run smoke:post-deploy:report before production handoff");
}

const counts = {
  ok: checks.filter(item => item.level === "ok").length,
  warn: checks.filter(item => item.level === "warn").length,
  fail: checks.filter(item => item.level === "fail").length
};

for (const item of checks) {
  const mark = item.level === "ok" ? "OK" : item.level === "warn" ? "WARN" : "FAIL";
  console.log(`${mark.padEnd(4)} ${item.name}: ${item.detail}`);
}
console.log(`Deployment check summary: ${counts.ok} ok, ${counts.warn} warnings, ${counts.fail} failures`);

if (shouldWrite) {
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(path.join(root, "docs", "DEPLOYMENT_CHECK.md"), renderReport(checks, counts), "utf8");
  console.log("Deployment check report written to docs/DEPLOYMENT_CHECK.md");
}

if (strict && counts.fail) {
  console.error("Strict deployment check failed.");
  process.exit(1);
}

async function readEnvFile(filePath) {
  try {
    const text = await readFile(filePath, "utf8");
    return Object.fromEntries(text.split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#") && line.includes("="))
      .map(line => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
        return [key, value];
      }));
  } catch {
    return {};
  }
}

function renderReport(items, counts) {
  const rows = items.map(item => `| ${item.level.toUpperCase()} | ${item.name} | ${item.owner || deploymentOwner(item.name)} | ${String(item.detail).replace(/\|/g, "\\|")} |`).join("\n");
  return `# 百年晓庄智慧教育平台部署自检

> 本报告由 \`npm run check:deploy:report\` 生成，用于生产部署前交接。FAIL 项需要在正式上线前处理；WARN 项可带说明上线或列入运维待办。

## 汇总

- 通过：${counts.ok}
- 提醒：${counts.warn}
- 阻断：${counts.fail}

## 检查项

| 状态 | 项目 | 责任方 | 证据 |
| --- | --- | --- | --- |
${rows}
`;
}

function deploymentOwner(name) {
  if (/DeepSeek|Kimi|Qwen|Doubao|GLM|Ernie|Hunyuan/i.test(name)) return "国产模型服务负责人";
  if (/ChatGPT|Gemini/i.test(name)) return "国际模型服务负责人";
  if (/Coze/i.test(name)) return "工作流平台负责人";
  if (/School SSO/i.test(name)) return "学校统一身份认证管理员";
  if (/Admin password|Session secret/i.test(name)) return "平台安全管理员";
  if (/Official school mark|Hero image/i.test(name)) return "品牌与宣传素材负责人";
  if (/Alumni/i.test(name)) return "校友会接口负责人";
  if (/GitHub|Container|DATA_DIR|Node runtime|NODE_ENV|Environment|Launch|Operations|Post-deploy|Smoke|Systemd|Nginx|HTTPS|proxy|Disaster|Monitoring|alert|\.env/i.test(name)) return "云平台运维负责人";
  return "平台项目负责人";
}
