import { access, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import process from "node:process";
import { buildWorkflowMessage, teachingWorkflows } from "../server/workflows.mjs";

const root = path.resolve(import.meta.dirname, "..");
const dataDir = await mkdtemp(path.join(os.tmpdir(), "xiaozhuang-api-"));
const port = 8091;
const mockModelPort = 8092;
const base = `http://127.0.0.1:${port}`;
const mockModel = createServer(async (request, response) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString("utf8");
  let body = {};
  if (rawBody) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = Object.fromEntries(new URLSearchParams(rawBody));
    }
  }
  if (request.url === "/external-agent") {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(request.method === "HEAD" ? "" : "<!doctype html><title>External Agent</title>");
    return;
  }
  if (request.url === "/agent-api") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ answer: `pong:${body.agentId || ""}` }));
    return;
  }
  if (request.url === "/alumni/verify") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({
      verified: body.phone === "13900000000",
      reference: "alumni-association-mock"
    }));
    return;
  }
  if (request.url === "/oidc/token") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ access_token: `mock-access-${body.code || "code"}`, token_type: "Bearer" }));
    return;
  }
  if (request.url === "/oidc/userinfo") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({
      sub: "sso-subject-001",
      preferred_username: "sso.teacher",
      name: "统一认证教师",
      department: "教师教育学院",
      email: "sso.teacher@example.edu.cn"
    }));
    return;
  }
  const prompt = body.messages?.at(-1)?.content || "";
  await new Promise(resolve => setTimeout(resolve, 100));
  if (prompt.includes("trigger-failure") && body.model === "deepseek-test") {
    response.writeHead(500, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: { message: "Mock provider failure" } }));
    return;
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify({
    model: "deepseek-test",
    choices: [{ message: { content: "娴嬭瘯妯″瀷鍥炵瓟" } }],
    usage: { prompt_tokens: 100, completion_tokens: Math.min(Number(body.max_tokens || 1), 120) }
  }));
});
await new Promise(resolve => mockModel.listen(mockModelPort, "127.0.0.1", resolve));
const serverEnvironment = {
    ...process.env,
    PORT: String(port),
    DATA_DIR: dataDir,
    DEMO_MODE: "true",
    DEV_ADMIN_PASSWORD: "xz2026",
    SESSION_SECRET: "test-session-secret-for-xiaozhuang-platform-2026",
    FRONTEND_ORIGINS: "https://example.github.io",
    PUBLIC_FRONTEND_URL: "https://example.github.io/xiaozhuang/",
    COOKIE_SAMESITE: "None",
    DEEPSEEK_API_KEY: "test-key",
    DEEPSEEK_API_URL: `http://127.0.0.1:${mockModelPort}/chat/completions`,
    DEEPSEEK_MODEL: "deepseek-test",
    QWEN_API_KEY: "test-key",
    QWEN_API_URL: `http://127.0.0.1:${mockModelPort}/chat/completions`,
    QWEN_MODEL: "qwen-test",
    COZE_API_KEY: "test-key",
    COZE_API_URL: `http://127.0.0.1:${mockModelPort}/coze/workflow`,
    COZE_WORKFLOW_ID: "coze-workflow-test",
    ALUMNI_ASSOCIATION_VERIFY_URL: `http://127.0.0.1:${mockModelPort}/alumni/verify`,
    ALUMNI_ASSOCIATION_API_KEY: "association-test-key",
    SSO_ENABLED: "true",
    SSO_AUTHORIZATION_URL: `http://127.0.0.1:${mockModelPort}/oidc/authorize`,
    SSO_TOKEN_URL: `http://127.0.0.1:${mockModelPort}/oidc/token`,
    SSO_USERINFO_URL: `http://127.0.0.1:${mockModelPort}/oidc/userinfo`,
    SSO_CLIENT_ID: "xiaozhuang-client",
    SSO_CLIENT_SECRET: "xiaozhuang-secret",
    SSO_DEFAULT_ROLE: "teacher",
    MODEL_MAX_OUTPUT_TOKENS: "800000"
};
let server = spawn(process.execPath, ["server/index.mjs"], {
  cwd: root,
  stdio: "ignore",
  env: serverEnvironment
});

let cookie = "";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(pathname, options = {}) {
  const response = await fetch(`${base}${pathname}`, {
    ...options,
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(options.headers || {}) }
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  const data = await response.json();
  return { response, data };
}

try {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const health = await fetch(`${base}/api/health`);
      if (health.ok) break;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  let result = await request("/api/health");
  assert(
    result.response.ok
      && result.data.service === "century-xiaozhuang-ai-education"
      && result.data.catalog.agents >= 100
      && result.data.catalog.workflows >= 6
      && result.data.providers.configured >= 1
      && result.data.mode === "demo"
      && result.data.checks.some(item => item.name === "uploads" && item.ok)
      && !JSON.stringify(result.data).includes("API_KEY")
      && !JSON.stringify(result.data).includes("test-key"),
    "Public health check should expose operational status without secrets"
  );
  const corsHealth = await fetch(`${base}/api/health`, { headers: { Origin: "https://example.github.io" } });
  assert(
    corsHealth.ok
      && corsHealth.headers.get("access-control-allow-origin") === "https://example.github.io"
      && corsHealth.headers.get("access-control-allow-credentials") === "true",
    "Configured static front-end origin should be allowed to read the Node API with credentials"
  );
  const corsPreflight = await fetch(`${base}/api/auth/login`, {
    method: "OPTIONS",
    headers: {
      Origin: "https://example.github.io",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "Content-Type"
    }
  });
  assert(
    corsPreflight.status === 204
      && corsPreflight.headers.get("access-control-allow-origin") === "https://example.github.io",
    "Configured static front-end origin should pass API preflight checks"
  );

  result = await request("/api/auth/sso/config");
  assert(result.response.ok && result.data.enabled && result.data.label, "SSO config should be public when OIDC is configured");

  const ssoStart = await fetch(`${base}/api/auth/sso`, { redirect: "manual" });
  const authorizeLocation = ssoStart.headers.get("location");
  assert(ssoStart.status === 302 && authorizeLocation?.includes("/oidc/authorize"), "SSO start should redirect to the configured OIDC authorization endpoint");
  const state = new URL(authorizeLocation).searchParams.get("state");
  assert(state && new URL(authorizeLocation).searchParams.get("client_id") === "xiaozhuang-client", "SSO authorization redirect should include client id and state");
  const ssoCallback = await fetch(`${base}/api/auth/sso/callback?code=mock-code&state=${encodeURIComponent(state)}`, { redirect: "manual" });
  const ssoCookie = ssoCallback.headers.get("set-cookie");
  assert(
    ssoCallback.status === 302
      && ssoCookie?.includes("xz_session=")
      && ssoCallback.headers.get("location") === "https://example.github.io/xiaozhuang/?sso=ok",
    "SSO callback should create a platform session and return to the configured static front end"
  );
  cookie = ssoCookie.split(";")[0];
  result = await request("/api/auth/me");
  assert(result.response.ok && result.data.user.username === "sso.teacher" && result.data.user.role === "teacher", "SSO login should provision a teacher account");
  result = await request("/api/admin/users");
  assert(result.response.status === 403, "SSO teacher accounts must not manage users by default");
  cookie = "";

  result = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "xz2026", password: "xz2026", remember: true })
  });
  assert(result.response.ok && result.data.user.role === "super_admin", "Admin login failed");
  assert(
    /SameSite=None/.test(result.response.headers.get("set-cookie") || "") && /Secure/.test(result.response.headers.get("set-cookie") || ""),
    "Cross-site static front-end login should receive SameSite=None Secure session cookie"
  );

  result = await request("/api/admin/providers");
  const deepseekProvider = result.data.providers.find(provider => provider.id === "deepseek");
  const kimiProvider = result.data.providers.find(provider => provider.id === "kimi");
  assert(
    result.response.ok
      && deepseekProvider?.configured
      && Array.isArray(deepseekProvider.envNames)
      && deepseekProvider.envNames.includes("DEEPSEEK_API_KEY")
      && deepseekProvider.missingEnv.length === 0
      && kimiProvider
      && !kimiProvider.configured
      && kimiProvider.missingEnv.includes("MOONSHOT_API_KEY")
      && !JSON.stringify(result.data).includes("test-key"),
    "Admin provider status should expose redacted env names and missing configuration without leaking secrets"
  );

  const signedInAdminCookie = cookie;
  cookie = "";
  let throttledLogin;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    throttledLogin = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "throttle.target", password: "wrong-password" })
    });
  }
  assert(throttledLogin.response.status === 429 && throttledLogin.data.retryAfterSeconds > 0, "Repeated failed logins should be temporarily throttled");
  cookie = signedInAdminCookie;
  result = await request("/api/admin/audit-logs");
  assert(
    result.response.ok
      && result.data.logs.some(log => log.action === "auth.login.failed")
      && result.data.logs.some(log => log.action === "auth.login.locked"),
    "Failed and throttled logins should be visible in audit logs"
  );

  result = await request("/api/agents");
  assert(result.response.ok && result.data.agents.length === 100, "Server catalog must contain exactly 100 agents");
  assert(
    result.data.agents.every(agent => /^https:\/\/www\.coze\.cn\/store\/agent\/xiaozhuang-century-[0-9]{3}$/.test(agent.cozeUrl || "")),
    "Default agents must expose Coze published-page URL placeholders"
  );
  result = await request("/api/admin/agents/coze-links", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      links: [
        { id: "agent-001", cozeUrl: "https://www.coze.cn/store/agent/real-xiaozhuang-001" },
        { id: "agent-002", cozeUrl: "https://www.coze.com/store/agent/real-xiaozhuang-002" },
        { id: "agent-999", cozeUrl: "https://www.coze.cn/store/agent/missing" },
        { id: "agent-003", cozeUrl: "https://evil.example/agent-003" }
      ]
    })
  });
  assert(
    result.response.ok
      && result.data.updated === 2
      && result.data.missing.includes("agent-999")
      && result.data.rejected.some(item => item.id === "agent-003")
      && result.data.agents.find(agent => agent.id === "agent-001")?.cozeUrl === "https://www.coze.cn/store/agent/real-xiaozhuang-001",
    "Admins should bulk import official Coze published-page links and reject unsafe URLs"
  );

  result = await request("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "weak.password",
      displayName: "弱密码账号",
      password: "short7",
      role: "teacher",
      department: "智慧教育中心"
    })
  });
  assert(result.response.status === 400, "Admin-created initial passwords must be at least 8 characters");

  result = await request("/api/admin/users/user-admin", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "disabled" })
  });
  assert(result.response.status === 400, "The last active super admin must not be disabled");

  result = await request("/api/admin/users/user-admin", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "teacher" })
  });
  assert(result.response.status === 400, "The last active super admin must not be demoted");

  result = await request("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "backup.super",
      displayName: "备用超级管理员",
      password: "backup123",
      role: "super_admin",
      department: "智慧教育中心"
    })
  });
  assert(result.response.status === 201 && result.data.user.role === "super_admin", "Super admin should create a backup super admin account");
  const backupSuperId = result.data.user.id;

  result = await request(`/api/admin/users/${backupSuperId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "teacher" })
  });
  assert(result.response.ok && result.data.user.role === "teacher", "Super admins may demote another super admin when one active super admin remains");

  result = await request("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "teacher.test",
      displayName: "娴嬭瘯鏁欏笀",
      password: "teacher123",
      role: "teacher",
      department: "鏁欏笀鏁欒偛瀛﹂櫌"
    })
  });
  assert(result.response.status === 201 && result.data.user.role === "teacher", "Super admin should create teacher accounts");
  const teacherUserId = result.data.user.id;

  let adminCookie = cookie;
  cookie = "";
  result = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "teacher.test", password: "teacher123" })
  });
  assert(result.response.ok && result.data.user.role === "teacher" && result.data.user.mustChangePassword, "Teacher login should require initial password change");
  result = await request("/api/agents");
  assert(result.response.status === 428 && result.data.requiresPasswordChange, "Accounts with initial passwords must be blocked from platform APIs");
  result = await request("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword: "teacher123", newPassword: "teacher12345" })
  });
  assert(result.response.ok && !result.data.user.mustChangePassword, "Teacher should change initial password before using the platform");
  result = await request("/api/admin/users");
  assert(result.response.status === 403, "Teacher accounts must not manage users");

  cookie = adminCookie;
  result = await request(`/api/admin/users/${teacherUserId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "agent_admin", password: "teacher456" })
  });
  assert(result.response.ok && result.data.user.role === "agent_admin", "Super admin should update roles and reset passwords");

  result = await request(`/api/admin/users/${teacherUserId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "disabled" })
  });
  assert(result.response.ok && result.data.user.status === "disabled", "Super admin should disable accounts");

  cookie = "";
  result = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "teacher.test", password: "teacher456" })
  });
  assert(result.response.status === 403, "Disabled accounts must not login");
  cookie = adminCookie;

  result = await request("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "agent.admin",
      displayName: "应用管理员",
      password: "agent123",
      role: "agent_admin",
      department: "智慧教育中心"
    })
  });
  assert(result.response.status === 201 && result.data.user.role === "agent_admin", "Super admin should create agent admin accounts");
  cookie = "";
  result = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "agent.admin", password: "agent123" })
  });
  assert(result.response.ok && result.data.user.mustChangePassword, "Agent admin login should require initial password change");
  result = await request("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword: "agent123", newPassword: "agent12345" })
  });
  assert(result.response.ok, "Agent admin should change initial password");
  result = await request("/api/admin/users");
  assert(result.response.status === 403, "Agent admins must not manage accounts");
  result = await request("/api/admin/users.csv");
  assert(result.response.status === 403, "Agent admins must not export the user account ledger");
  result = await request("/api/admin/agents-quality.csv");
  assert(result.response.status === 403, "Agent admins must not export the agent quality ledger");
  result = await request("/api/admin/workflows-quality.csv");
  assert(result.response.status === 403, "Agent admins must not export the workflow quality ledger");
  result = await request("/api/admin/version-history.csv");
  assert(result.response.status === 403, "Agent admins must not export the version history ledger");
  result = await request("/api/admin/token-ledger.csv");
  assert(result.response.status === 403, "Agent admins must not export the full token ledger");
  result = await request("/api/admin/token-adjustments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "user-admin", amount: 1000, reason: "forbidden adjustment" })
  });
  assert(result.response.status === 403, "Agent admins must not adjust token grants");
  result = await request("/api/admin/model-runs.csv");
  assert(result.response.status === 403, "Agent admins must not export full model run ledger");
  result = await request("/api/admin/providers.csv");
  assert(result.response.status === 403, "Agent admins must not export provider status ledger");
  result = await request("/api/admin/audit-logs.csv");
  assert(result.response.status === 403, "Agent admins must not export full audit logs");
  result = await request("/api/admin/feedback.csv");
  assert(result.response.status === 403, "Agent admins must not export feedback CSV");
  result = await request("/api/admin/alumni/applications.csv");
  assert(result.response.status === 403, "Agent admins must not export alumni applications CSV");
  result = await request("/api/admin/artifacts.csv");
  assert(result.response.status === 403, "Agent admins must not export artifact inventory CSV");
  result = await request("/api/admin/branding", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platformName: "越权品牌修改" })
  });
  assert(result.response.status === 403, "Agent admins must not update platform branding");
  result = await request("/api/admin/backup");
  assert(result.response.status === 403, "Agent admins must not export platform backups");
  result = await request("/api/admin/maintenance", { method: "POST" });
  assert(result.response.status === 403, "Agent admins must not run platform maintenance");
  result = await request("/api/admin/agents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "应用管理员测试智能体",
      category: "教学支持",
      owner: "应用管理员",
      description: "验证应用管理员可以维护智能体目录",
      routeHint: "deepseek",
      systemPrompt: "你是应用管理员权限测试智能体，请说明自己只用于验证目录维护权限。"
    })
  });
  assert(result.response.status === 201 && result.data.agent.id, "Agent admins should still maintain agent applications");
  cookie = adminCookie;

  result = await request("/api/admin/agents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "服务端测试智能体",
      category: "教学支持",
      owner: "测试",
      description: "API CRUD test",
      routeHint: "deepseek",
      systemPrompt: "你是服务端测试智能体，请用一句话回答，并说明自己正在走平台统一模型网关。"
    })
  });
  assert(result.response.status === 201 && result.data.agent.id, `Agent creation failed: ${result.response.status} ${JSON.stringify(result.data)}`);
  const createdAgentId = result.data.agent.id;
  assert(result.data.agent.status === "draft", "Created agents should start as drafts unless explicitly published");

  result = await request(`/api/admin/agents/${createdAgentId}/duplicate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "agent-server-test-copy", name: "服务端测试智能体副本" })
  });
  assert(
    result.response.status === 201
      && result.data.agent.id === "agent-server-test-copy"
      && result.data.agent.status === "draft"
      && result.data.agent.routeHint === "deepseek"
      && result.data.agent.mode === "local",
    "Admin should duplicate agents as editable draft copies"
  );

  result = await request("/api/admin/agents/agent-server-test-copy", {
    method: "DELETE"
  });
  assert(result.response.ok, "Admin should delete duplicated agents");

  result = await request("/api/admin/agents/bulk", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: [createdAgentId], status: "offline" })
  });
  assert(
    result.response.ok
      && result.data.updated === 1
      && result.data.agents.find(item => item.id === createdAgentId)?.status === "offline",
    "Admin should bulk update selected agent status"
  );

  result = await request("/api/admin/agents/bulk", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: [createdAgentId], routeHint: "qwen" })
  });
  assert(
    result.response.ok
      && result.data.updated === 1
      && result.data.routeHint === "qwen"
      && result.data.agents.find(item => item.id === createdAgentId)?.routeHint === "qwen",
    "Admin should bulk update selected agent model routes"
  );

  result = await request("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "浣跨敤闂",
      content: "鏅鸿兘浣撴祴璇曞弽棣堝簲杩涘叆杩愯惀闃熷垪",
      email: "teacher@example.com"
    })
  });
  assert(result.response.status === 201 && result.data.item.status === "open", "Feedback submission should create an open item");
  const feedbackId = result.data.item.id;

  result = await request("/api/admin/feedback");
  assert(result.response.ok && result.data.items.some(item => item.id === feedbackId), "Admin should list feedback items");

  result = await request("/api/admin/providers/deepseek/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "妯″瀷杩炴帴娴嬭瘯" })
  });
  assert(
    result.response.ok
      && result.data.provider.id === "deepseek"
      && result.data.model === "deepseek-test",
    "Admin should test configured model providers"
  );

  result = await request("/api/admin/providers/kimi/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}"
  });
  assert(result.response.status === 503 && result.data.route.id === "kimi", "Unconfigured provider tests should fail truthfully");

  result = await request("/api/admin/readiness");
  assert(
    result.response.ok
      && result.data.readiness.summary.fail >= 1
      && result.data.readiness.checks.some(item => item.name === "DeepSeek lesson plans" && item.level === "ok")
      && result.data.readiness.checks.some(item => item.name === "Kimi long context" && item.level === "fail")
      && result.data.readiness.checks.some(item => item.name === "Coze workflow endpoint" && item.level === "ok")
      && result.data.readiness.checks.some(item => item.name === "Official school mark")
      && result.data.readiness.checks.some(item => item.name === "Agent catalog size" && item.detail.includes("/100 agents"))
      && result.data.readiness.checks.some(item => item.name === "Coze published agent links" && item.level === "warn")
      && result.data.readiness.checks.some(item => item.name === "Agent quality governance")
      && result.data.readiness.checks.some(item => item.name === "Agent version governance")
      && result.data.readiness.checks.some(item => item.name === "Teaching workflows" && item.level === "ok")
      && result.data.readiness.checks.some(item => item.name === "Workflow quality governance")
      && result.data.readiness.checks.some(item => item.name === "Workflow version governance")
      && result.data.readiness.checks.some(item => item.name === "Backup cadence" && item.level === "warn")
      && result.data.readiness.checks.some(item => item.name === "Maintenance cadence" && item.owner === "云平台运维负责人")
      && result.data.readiness.checks.every(item => item.owner),
    "Admin readiness should report production launch blockers without exposing secrets"
  );

  result = await request("/api/branding");
  assert(result.response.ok && result.data.branding.platformName && !JSON.stringify(result.data).includes("API_KEY"), "Public branding should be readable without secrets");

  result = await request("/api/admin/branding", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      platformName: "鐧惧勾鏅撳簞鏅烘収鏁欒偛骞冲彴",
      schoolName: "鍗椾含鏅撳簞瀛﹂櫌",
      logoUrl: "https://assets.example.edu.cn/xzc-logo.svg",
      heroImageUrl: "https://assets.example.edu.cn/xzc-hero.jpg",
      primaryColor: "#8b2332",
      goldColor: "#c59a3d",
      assetStatus: "official",
      authorizationNote: "Mock official authorization"
    })
  });
  assert(result.response.ok && result.data.branding.assetStatus === "official", "Admin should update production branding assets");

  result = await request("/api/admin/readiness");
  assert(
    result.response.ok && result.data.readiness.checks.some(item => item.name === "Branding authorization" && item.level === "ok"),
    "Readiness should reflect official branding configuration"
  );

  result = await request(`/api/admin/feedback/${feedbackId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "closed", note: "娴嬭瘯鍏抽棴" })
  });
  assert(result.response.ok && result.data.item.status === "closed", "Admin should close feedback items");

  result = await request(`/api/admin/agents/${createdAgentId}/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Test draft agent" })
  });
  assert(
    result.response.ok
      && result.data.testRun === true
      && result.data.agent.id === createdAgentId
      && result.data.route.provider === "qwen"
      && result.data.usage.chargedTokens === 0,
    "Admin should test draft local agents through the unified gateway without quota charge"
  );

  await access(path.join(dataDir, "platform.sqlite"));

  server.kill("SIGTERM");
  await new Promise(resolve => server.once("exit", resolve));
  server = spawn(process.execPath, ["server/index.mjs"], {
    cwd: root,
    stdio: "ignore",
    env: serverEnvironment
  });
  cookie = "";
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      if ((await fetch(`${base}/api/health`)).ok) break;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  result = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "xz2026", password: "xz2026" })
  });
  assert(result.response.ok, "Login after restart failed");
  result = await request("/api/agents");
  assert(
    result.data.agents.length === 102 && result.data.agents.some(agent => agent.id === createdAgentId),
    "Custom agents must survive a server restart without resetting the catalog"
  );

  const exportedAgents = result.data.agents;
  result = await request("/api/admin/agents/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      strategy: "replace",
      agents: [
        ...exportedAgents,
        {
          id: "agent-imported-secure",
          name: "导入安全测试智能体",
          category: "鏁欏鏀寔",
          owner: "娴嬭瘯",
          description: "Import test",
          status: "draft",
          mode: "local",
          logoText: "导",
          color: "#9e1f32",
          systemPrompt: "你是导入安全测试智能体，请不要暴露任何密钥字段。",
          apiToken: "must-not-persist"
        }
      ]
    })
  });
  assert(
    result.response.ok
      && result.data.imported === 103
      && result.data.agents.length === 103
      && !("apiToken" in result.data.agents.find(agent => agent.id === "agent-imported-secure")),
    "Server import should persist agents and strip secret fields"
  );

  result = await request("/api/admin/agents/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      strategy: "merge",
      agents: [{
        id: "agent-imported-merge",
        name: "合并导入智能体",
        category: "教学支持",
        owner: "测试",
        description: "Merge import test",
        status: "draft",
        mode: "local",
        logoText: "合",
        routeHint: "qwen",
        systemPrompt: "你是合并导入测试智能体，请验证导入不会覆盖现有目录。"
      }]
    })
  });
  assert(
    result.response.ok
      && result.data.strategy === "merge"
      && result.data.agents.length === 104
      && result.data.agents.some(agent => agent.id === createdAgentId)
      && result.data.agents.some(agent => agent.id === "agent-imported-merge"),
    "Agent import should support merge strategy without deleting existing agents"
  );

  result = await request("/api/admin/backup");
  assert(
    result.response.ok
      && result.data.backup.agents.length === 104
      && result.data.backup.branding.assetStatus === "official"
      && result.data.backup.manifest?.schema === "xiaozhuang-platform-backup-v2"
      && result.data.backup.manifest.counts.agents === result.data.backup.agents.length
      && /^[a-f0-9]{64}$/.test(result.data.backup.manifest.sha256 || "")
      && result.data.backup.feedbackItems.some(item => item.id === feedbackId)
      && !JSON.stringify(result.data.backup).includes("passwordHash")
      && !("sessions" in result.data.backup),
    "Platform backup should export configuration manifest without password hashes or sessions"
  );
  const backup = result.data.backup;

  result = await request("/api/admin/restore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ backup: { ...backup, version: 999 } })
  });
  assert(result.response.status === 400, "Restore must reject backup files from newer unsupported versions");

  result = await request("/api/admin/restore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ backup: { ...backup, agents: [{ ...backup.agents[0], apiToken: "must-not-restore" }] } })
  });
  assert(result.response.status === 400, "Restore must reject backup files containing sensitive fields");

  result = await request("/api/admin/restore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ backup: { ...backup, agents: backup.agents.slice(0, 100) } })
  });
  assert(result.response.status === 400, "Restore must reject backups whose manifest checksum does not match their contents");

  result = await request("/api/admin/agents/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ strategy: "replace", agents: backup.agents.slice(0, 100) })
  });
  assert(result.response.ok && result.data.agents.length === 100, "Pre-restore mutation should change the catalog");

  result = await request("/api/admin/restore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ backup })
  });
  assert(result.response.ok && result.data.restored.agents === 104, "Platform restore should recover the backed-up catalog");

  result = await request("/api/admin/maintenance", { method: "POST" });
  assert(
    result.response.ok
      && Number.isInteger(result.data.maintenance.sessionsRemoved)
      && Number.isInteger(result.data.maintenance.legacySessionsRemoved)
      && Number.isInteger(result.data.maintenance.oauthStatesRemoved)
      && Number.isInteger(result.data.maintenance.tokenReservationsRemoved),
    "Super admin should run platform maintenance and receive cleanup counts"
  );
  result = await request("/api/admin/readiness");
  assert(
    result.response.ok
      && result.data.readiness.checks.some(item => item.name === "Backup cadence" && item.level === "ok")
      && result.data.readiness.checks.some(item => item.name === "Maintenance cadence" && item.level === "ok"),
    "Readiness should confirm recent backup and maintenance audit records"
  );

  result = await request("/api/agents");
  assert(
    result.data.agents.length === 104
      && result.data.agents.some(agent => agent.id === "agent-imported-secure")
      && result.data.agents.some(agent => agent.id === "agent-imported-merge"),
    "Restored catalog should be active"
  );

  result = await request(`/api/admin/agents/${createdAgentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "published",
      routeHint: "deepseek",
      systemPrompt: "你是服务端测试智能体，请用一句话回答，并说明自己正在走平台统一模型网关。"
    })
  });
  assert(result.response.ok && result.data.agent.status === "published", "Publishing a configured local agent failed");

  result = await request(`/api/admin/agents/${createdAgentId}/versions`);
  assert(result.response.ok && result.data.versions.length >= 2, "Agent version history must record create and publish/update");
  const latestAgentVersion = result.data.versions[0].version;

  result = await request(`/api/admin/agents/${createdAgentId}/versions/diff?from=1&to=${latestAgentVersion}`);
  assert(
    result.response.ok
      && result.data.diff.from.version === 1
      && result.data.diff.to.version === latestAgentVersion
      && result.data.diff.changes.some(change => change.field === "status" && change.before === "draft" && change.after === "published"),
    "Agent version diff should summarize editable field changes between versions"
  );

  result = await request(`/api/admin/agents/${createdAgentId}/versions/1/restore`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}"
  });
  assert(result.response.ok && result.data.agent.status === "draft", "Admin should restore an agent from a previous version");

  result = await request(`/api/admin/agents/${createdAgentId}/versions`);
  assert(
    result.response.ok && result.data.versions[0].action === "restore:v1",
    "Agent restore should create a new version entry"
  );

  result = await request(`/api/admin/agents/${createdAgentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "published" })
  });
  assert(result.response.ok && result.data.agent.status === "published", "Republishing a restored agent failed");

  result = await request("/api/admin/agents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "閰嶇疆涓嶅畬鏁存櫤鑳戒綋",
      category: "鏁欏鏀寔",
      owner: "娴嬭瘯",
      description: "Should not publish",
      status: "published",
      mode: "local",
      systemPrompt: "澶煭"
    })
  });
  assert(result.response.status === 400, "Publishing an incomplete local agent must be blocked");

  result = await request("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "请用一句话介绍你的工作流", agentId: createdAgentId })
  });
  assert(result.response.ok && result.data.agent.id === createdAgentId && result.data.route.provider === "deepseek", "Local agents must execute through the unified model gateway");

  result = await request("/api/admin/agents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "External Web Agent",
      category: "鏁欏鏀寔",
      owner: "娴嬭瘯",
      description: "External agent connection test",
      status: "draft",
      mode: "external",
      url: `http://127.0.0.1:${mockModelPort}/external-agent`,
      logoText: "外",
      routeHint: "qwen",
      systemPrompt: ""
    })
  });
  assert(result.response.status === 201, "Draft external agents with valid URLs should be accepted");
  const externalAgentId = result.data.agent.id;
  result = await request(`/api/admin/agents/${externalAgentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "published" })
  });
  assert(result.response.status === 400, "External agents must pass a connection test before publishing");
  result = await request(`/api/admin/agents/${externalAgentId}/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}"
  });
  assert(
    result.response.ok
      && result.data.ok
      && result.data.status === 200
      && result.data.agent.lastTestStatus === "passed",
    "External web agents should support and persist server-side connection tests"
  );
  result = await request(`/api/admin/agents/${externalAgentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "published" })
  });
  assert(result.response.ok && result.data.agent.status === "published", "External agents should publish after a passing connection test");
  result = await request(`/api/admin/agents/${externalAgentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: `http://127.0.0.1:${mockModelPort}/external-agent?changed=1` })
  });
  assert(
    result.response.ok
      && result.data.agent.lastTestStatus === "untested"
      && result.data.agent.lastTestMessage === "configuration changed",
    "Agent connection changes should invalidate the previous passing test result"
  );
  result = await request(`/api/admin/agents/${externalAgentId}/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}"
  });
  assert(result.response.ok && result.data.agent.lastTestStatus === "passed", "External web agent should pass after retesting updated configuration");

  result = await request("/api/admin/agents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "API Agent",
      category: "鏁欏鏀寔",
      owner: "娴嬭瘯",
      description: "API agent connection test",
      status: "draft",
      mode: "api",
      apiUrl: `http://127.0.0.1:${mockModelPort}/agent-api`,
      providerAlias: "mock-api",
      logoText: "A",
      routeHint: "qwen",
      systemPrompt: ""
    })
  });
  assert(result.response.status === 201, "Draft API agents with valid URLs should be accepted");
  const apiAgentId = result.data.agent.id;
  result = await request(`/api/admin/agents/${apiAgentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "published" })
  });
  assert(result.response.status === 400, "API agents must pass a connection test before publishing");
  result = await request(`/api/admin/agents/${apiAgentId}/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}"
  });
  assert(
    result.response.ok
      && result.data.ok
      && result.data.status === 200
      && result.data.agent.lastTestStatus === "passed",
    "API agents should support and persist server-side JSON ping tests"
  );
  result = await request(`/api/admin/agents/${apiAgentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "published" })
  });
  assert(result.response.ok && result.data.agent.status === "published", "API agents should publish after a passing connection test");

  result = await request("/api/admin/readiness");
  assert(
    result.response.ok
      && result.data.readiness.checks.some(item => item.name === "External/API connection tests" && item.level === "ok"),
    "Readiness should use persisted connection test status for connected agents"
  );

  result = await request("/api/workflows");
  assert(result.response.ok && result.data.workflows.length >= 6, "Teaching workflow catalog should be served by the backend");
  const lessonMessage = buildWorkflowMessage(teachingWorkflows.find(workflow => workflow.id === "lesson"), { prompt: "测试教案工作流路由", subject: "语文", grade: "五年级" });
  assert(
    lessonMessage.includes("建议输入字段")
      && lessonMessage.includes("输出必须包含")
      && lessonMessage.includes("质量检查清单"),
    "Workflow messages should carry structured input, output and quality requirements"
  );

  result = await request("/api/admin/workflows", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: "workflow-custom-audit",
      title: "瀛︽儏鍒嗘瀽",
      routeHint: "deepseek",
      artifactType: "learning-profile",
      summary: "鐢熸垚鐝骇瀛︽儏鐢诲儚銆佸樊寮傛敮鎸佸拰鏁欏璋冩暣寤鸿",
      status: "draft",
      systemPrompt: "你是学情分析工作流，请输出可执行、可审核、适合真实课堂的分析结果。"
    })
  });
  assert(result.response.status === 201 && result.data.workflow.id === "workflow-custom-audit", "Admin should create custom workflows");
  assert(
    Array.isArray(result.data.workflow.inputFields)
      && result.data.workflow.inputFields.length >= 2
      && Array.isArray(result.data.workflow.outputSections)
      && result.data.workflow.outputSections.length >= 3
      && Array.isArray(result.data.workflow.qualityChecklist)
      && result.data.workflow.qualityChecklist.length >= 2,
    "Custom workflows should receive structured input, output and quality specs"
  );

  result = await request("/api/admin/workflows/workflow-custom-audit/duplicate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "workflow-custom-copy", title: "学情分析副本" })
  });
  assert(
    result.response.status === 201
      && result.data.workflow.id === "workflow-custom-copy"
      && result.data.workflow.status === "draft"
      && result.data.workflow.routeHint === "deepseek",
    "Admin should duplicate workflows as editable draft copies"
  );

  result = await request("/api/admin/workflows/workflow-custom-copy", {
    method: "DELETE"
  });
  assert(result.response.ok, "Admin should delete duplicated workflows");

  result = await request("/api/admin/workflows/workflow-custom-audit", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "published" })
  });
  assert(result.response.status === 400, "Custom workflows must pass a route test before publishing");

  result = await request("/api/admin/workflows/workflow-custom-audit/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "测试自定义学情分析工作流" })
  });
  assert(result.response.ok && result.data.workflow.id === "workflow-custom-audit", "Admin should test custom workflows before publishing");

  result = await request("/api/admin/workflows/workflow-custom-audit", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "published" })
  });
  assert(result.response.ok && result.data.workflow.status === "published", "Admin should publish custom workflows");

  result = await request("/api/admin/workflows/workflow-custom-audit/versions");
  assert(result.response.ok && result.data.versions.length >= 2, "Workflow version history must record create and publish/update");
  const latestWorkflowVersion = result.data.versions[0].version;

  result = await request(`/api/admin/workflows/workflow-custom-audit/versions/diff?from=1&to=${latestWorkflowVersion}`);
  assert(
    result.response.ok
      && result.data.diff.from.version === 1
      && result.data.diff.to.version === latestWorkflowVersion
      && result.data.diff.changes.some(change => change.field === "status" && change.before === "draft" && change.after === "published"),
    "Workflow version diff should summarize route, status and structured spec changes between versions"
  );

  result = await request("/api/admin/workflows/workflow-custom-audit/versions");
  assert(result.response.ok && result.data.versions.length >= 2, "Workflow version history must record create and publish/update");

  result = await request("/api/admin/workflows/workflow-custom-audit/versions/1/restore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}"
  });
  assert(result.response.ok && result.data.workflow.status === "draft", "Admin should restore a workflow from a previous version");

  result = await request("/api/admin/workflows/workflow-custom-audit/versions");
  assert(
    result.response.ok && result.data.versions[0].action === "restore:v1",
    "Workflow restore should create a new version entry"
  );

  result = await request("/api/admin/workflows/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      strategy: "merge",
      workflows: [{
        id: "workflow-imported-audit",
        title: "听评课",
        routeHint: "deepseek",
        artifactType: "observation-report",
        summary: "鐢熸垚璇惧爞瑙傚療璁板綍銆佷寒鐐硅瘖鏂拰鏀硅繘寤鸿",
        status: "draft",
        systemPrompt: "你是听评课工作流，请基于课堂观察信息输出客观、可执行、尊重教师专业成长的评价建议。"
      }]
    })
  });
  assert(
    result.response.ok
      && result.data.imported === 1
      && result.data.workflows.some(workflow => workflow.id === "workflow-imported-audit"),
    "Workflow import should support merge strategy"
  );

  result = await request("/api/admin/workflows/workflow-imported-audit", {
    method: "DELETE"
  });
  assert(result.response.ok, "Admin should delete imported workflows");

  result = await request("/api/admin/workflows/bulk", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: ["lesson", "workflow-custom-audit"], routeHint: "qwen" })
  });
  assert(
    result.response.ok
      && result.data.updated === 2
      && result.data.workflows.find(workflow => workflow.id === "lesson")?.routeHint === "qwen"
      && result.data.workflows.find(workflow => workflow.id === "workflow-custom-audit")?.routeHint === "qwen",
    "Admin should bulk update workflow model routes"
  );

  result = await request("/api/admin/workflows/lesson", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ routeHint: "qwen" })
  });
  assert(result.response.ok && result.data.workflow.routeHint === "qwen", "Admin should update workflow route");

  result = await request("/api/admin/workflows/lesson", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ routeHint: "deepseek", status: "offline" })
  });
  assert(result.response.ok && result.data.workflow.status === "offline", "Admin should take workflow offline");

  result = await request("/api/workflows/lesson/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "Offline workflow should not run" })
  });
  assert(result.response.status === 404, "Offline workflow must not execute");

  result = await request("/api/admin/workflows/lesson", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "published" })
  });
  assert(result.response.status === 400, "Workflows must pass a route test before publishing");

  result = await request("/api/admin/workflows/lesson/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "测试教案工作流路由", subject: "语文", grade: "五年级" })
  });
  assert(
    result.response.ok
      && result.data.workflow.id === "lesson"
      && result.data.route.provider === "deepseek"
      && result.data.testRun === true
      && result.data.usage.chargedTokens === 0
      && result.data.artifact === null,
    "Admin workflow tests should verify routing without quota charge or artifact output"
  );
  result = await request("/api/admin/workflows/lesson", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "published" })
  });
  assert(result.response.ok && result.data.workflow.status === "published", "Admin should republish workflow after a passing route test");
  result = await request("/api/admin/workflows");
  assert(
    result.response.ok
      && result.data.workflows.find(workflow => workflow.id === "lesson")?.lastTestStatus === "passed"
      && result.data.workflows.find(workflow => workflow.id === "lesson")?.lastTestDurationMs >= 0,
    "Workflow test results should be persisted on the workflow record"
  );
  const testedLessonWorkflow = result.data.workflows.find(workflow => workflow.id === "lesson");
  result = await request("/api/admin/workflows/lesson", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt: `${testedLessonWorkflow.systemPrompt}\n请在测试后保持教学目标、活动和评价一致。` })
  });
  assert(
    result.response.ok
      && result.data.workflow.lastTestStatus === "untested"
      && result.data.workflow.lastTestMessage === "configuration changed",
    "Workflow configuration changes should invalidate the previous passing test result"
  );
  result = await request("/api/admin/readiness");
  assert(
    result.response.ok
      && result.data.readiness.checks.some(item => item.name === "Workflow route tests")
      && result.data.readiness.checks.some(item => item.name === "Workflow quality governance"),
    "Readiness should report workflow route test and quality governance coverage"
  );

  result = await request("/api/workflows/lesson/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "为五年级语文设计一节完整教案", subject: "语文", grade: "五年级" })
  });
  assert(
    result.response.ok
      && result.data.workflow.id === "lesson"
      && result.data.route.provider === "deepseek"
      && result.data.artifact.type === "lesson-plan",
    "Lesson workflow must execute through the backend workflow router"
  );
  assert(result.data.artifact.downloadUrl, "Workflow artifact should expose a server download URL");
  const lessonArtifactId = result.data.artifact.id;
  const lessonArtifactDownloadUrl = result.data.artifact.downloadUrl;
  const artifactDownload = await fetch(`${base}${lessonArtifactDownloadUrl}`, {
    headers: { Cookie: cookie }
  });
  assert(artifactDownload.ok && artifactDownload.headers.get("content-type").includes("text/html"), "Workflow artifact download failed");
  assert((await artifactDownload.text()).includes("鐧惧勾鏅撳簞鏅烘収鏁欒偛骞冲彴"), "Downloaded workflow artifact should contain platform branding");

  result = await request("/api/artifacts");
  assert(
    result.response.ok
      && result.data.artifacts.some(item => item.id === lessonArtifactId && item.downloadUrl && item.workflowId === "lesson"),
    "User artifact library should list generated workflow artifacts"
  );

  result = await request("/api/workflows/animation/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "生成一个课堂互动网页动画", subject: "科学", grade: "五年级" })
  });
  assert(
    result.response.ok
      && result.data.workflow.id === "animation"
      && result.data.route.provider === "coze"
      && result.data.artifact.downloadType === "zip",
    "Animation workflow should return a ZIP download artifact"
  );
  const zipArtifactId = result.data.artifact.id;
  const zipArtifactDownloadUrl = result.data.artifact.downloadUrl;
  const zipDownload = await fetch(`${base}${zipArtifactDownloadUrl}`, {
    headers: { Cookie: cookie }
  });
  const zipBuffer = Buffer.from(await zipDownload.arrayBuffer());
  assert(zipDownload.ok && zipDownload.headers.get("content-type") === "application/zip", "Animation artifact ZIP download failed");
  assert(zipBuffer.subarray(0, 2).toString("utf8") === "PK" && zipBuffer.includes(Buffer.from("index.html")), "Animation ZIP should contain index.html");

  result = await request("/api/artifacts");
  assert(
    result.response.ok
      && result.data.artifacts.some(item => item.downloadType === "zip" && item.workflowId === "animation")
      && result.data.artifacts.length >= 2,
    "Artifact library should include HTML and ZIP workflow outputs"
  );

  const artifactExport = await fetch(`${base}/api/admin/artifacts.csv`, {
    headers: { Cookie: adminCookie }
  });
  const artifactCsv = await artifactExport.text();
  assert(
    artifactExport.ok
      && artifactExport.headers.get("content-type").includes("text/csv")
      && artifactCsv.includes("\"createdAt\",\"id\",\"title\",\"type\",\"downloadType\",\"contentType\",\"fileName\",\"userId\",\"username\",\"displayName\",\"workflowId\",\"workflowTitle\",\"downloadUrl\"")
      && artifactCsv.includes(`"${zipArtifactId}"`)
      && artifactCsv.includes("\"animation\"")
      && !artifactCsv.includes("model-output.txt keeps the original model output"),
    "Super admin should export workflow artifact inventory metadata as CSV"
  );

  result = await request(`/api/artifacts/${lessonArtifactId}`, { method: "DELETE" });
  assert(result.response.ok && result.data.deletedId === lessonArtifactId, "Users should delete their own workflow artifacts");
  const deletedArtifactDownload = await fetch(`${base}${lessonArtifactDownloadUrl}`, {
    headers: { Cookie: cookie }
  });
  assert(deletedArtifactDownload.status === 404, "Deleted workflow artifact downloads should stop working");
  result = await request("/api/artifacts");
  assert(
    result.response.ok && !result.data.artifacts.some(item => item.id === lessonArtifactId),
    "Deleted workflow artifacts should disappear from the user artifact library"
  );

  result = await request("/api/admin/metrics");
  assert(
    result.response.ok
      && result.data.metrics.totals.agentRuns >= 1
      && result.data.metrics.totals.workflowRuns >= 1
      && result.data.metrics.totals.artifacts >= 1
      && result.data.metrics.totals.modelRuns >= 1
      && result.data.metrics.quota
      && Number.isInteger(result.data.metrics.quota.activeGrants)
      && result.data.metrics.topWorkflows.some(item => item.id === "lesson"),
    "Admin metrics should aggregate agent runs, workflow runs and artifacts"
  );
  result = await request("/api/admin/metrics?days=30");
  assert(result.response.ok && result.data.metrics.windowDays === 30, "Admin metrics should support selectable 30 day windows");

  result = await request("/api/admin/artifacts/cleanup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ olderThanDays: 0 })
  });
  assert(result.response.ok && result.data.deleted >= 1, "Super admin should bulk clean old workflow artifacts");
  const cleanedArtifactDownload = await fetch(`${base}${zipArtifactDownloadUrl}`, {
    headers: { Cookie: cookie }
  });
  assert(cleanedArtifactDownload.status === 404, "Bulk-cleaned artifact downloads should stop working");
  result = await request("/api/artifacts");
  assert(
    result.response.ok && !result.data.artifacts.some(item => item.id === zipArtifactId),
    "Bulk-cleaned workflow artifacts should disappear from the artifact library"
  );

  result = await request("/api/admin/model-runs");
  assert(
    result.response.ok
      && result.data.runs.some(run => run.status === "success" && run.actualRoute)
      && result.data.runs.some(run => run.source === "provider-test")
      && !JSON.stringify(result.data.runs).includes("test-key")
      && !JSON.stringify(result.data.runs).includes("trigger-failure"),
    "Admin model run ledger should expose model execution metadata without prompts or secrets"
  );

  result = await request("/api/admin/catalog/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope: "all" })
  });
  assert(
    result.response.ok
      && result.data.reset.agents === 100
      && result.data.reset.workflows >= 6
      && result.data.agents.length === 100
      && result.data.workflows.some(workflow => workflow.id === "lesson"),
    "Super admin should reset the editable catalog back to the default 100 agents and teaching workflows"
  );

  result = await request("/api/admin/audit-logs");
  assert(
    result.response.ok
      && result.data.logs.some(log => log.action === "agent.test")
      && result.data.logs.some(log => log.action === "agent.connection.test")
      && result.data.logs.some(log => log.action === "feedback.submit")
      && result.data.logs.some(log => log.action === "feedback.update")
      && result.data.logs.some(log => log.action === "provider.test")
      && result.data.logs.some(log => log.action === "agent.import")
      && result.data.logs.some(log => log.action === "agent.bulk-route")
      && result.data.logs.some(log => log.action === "workflow.import")
      && result.data.logs.some(log => log.action === "workflow.bulk-route")
      && result.data.logs.some(log => log.action === "workflow.test")
      && result.data.logs.some(log => log.action === "auth.sso.login")
      && result.data.logs.some(log => log.action === "artifact.delete")
      && result.data.logs.some(log => log.action === "artifact.cleanup")
      && result.data.logs.some(log => log.action === "artifact.export")
      && result.data.logs.some(log => log.action === "platform.maintenance")
      && result.data.logs.some(log => log.action === "catalog.reset")
      && !JSON.stringify(result.data.logs).includes("must-not-persist"),
    "Audit logs should expose operational events without sensitive import fields"
  );

  result = await request("/api/files", {
    method: "POST",
    headers: { "Content-Type": "application/pdf", "X-File-Name": "proof.pdf" },
    body: Buffer.from("%PDF-1.4 test")
  });
  assert(result.response.status === 201 && result.data.file.id, "Proof upload failed");
  const proofFileId = result.data.file.id;

  result = await request("/api/files", {
    method: "POST",
    headers: { "Content-Type": "application/pdf", "X-File-Name": "fake-proof.pdf" },
    body: Buffer.from("not a real PDF")
  });
  assert(result.response.status === 415, "Server must reject uploads whose bytes do not match the declared file type");
  result = await request("/api/admin/audit-logs");
  assert(result.response.ok && result.data.logs.some(log => log.action === "file.upload.rejected"), "Rejected uploads should be visible in audit logs");

  result = await request("/api/alumni/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "娴嬭瘯鏍″弸",
      graduationYear: "2012",
      college: "鏁欏笀鏁欒偛瀛﹂櫌",
      major: "灏忓鏁欒偛",
      phone: "13800000000",
      email: "alumni@example.com",
      proofFileId
    })
  });
  assert(result.response.status === 201, "Alumni application failed");
  const applicationId = result.data.application.id;

  const proofResponse = await fetch(`${base}/api/admin/files/${proofFileId}`, {
    headers: { Cookie: cookie }
  });
  assert(proofResponse.ok && proofResponse.headers.get("content-type") === "application/pdf", "Reviewer proof access failed");
  assert((await proofResponse.text()).startsWith("%PDF-1.4"), "Reviewer proof content mismatch");
  const anonymousProofResponse = await fetch(`${base}/api/admin/files/${proofFileId}`);
  assert(anonymousProofResponse.status === 401, "Anonymous users must not access alumni proof files");

  const reviewerCookie = cookie;
  result = await request("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "alumni.auto",
      displayName: "鑷姩璁よ瘉鏍″弸",
      password: "alumni123",
      role: "teacher",
      department: "校友会"
    })
  });
  assert(result.response.status === 201, "Super admin should create alumni auto verification account");

  cookie = "";
  result = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "alumni.auto", password: "alumni123" })
  });
  assert(result.response.ok && result.data.user.mustChangePassword, "Auto alumni account login should require password change");
  result = await request("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword: "alumni123", newPassword: "alumni12345" })
  });
  assert(result.response.ok && !result.data.user.mustChangePassword, "Auto alumni account should change initial password");

  result = await request("/api/files", {
    method: "POST",
    headers: { "Content-Type": "application/pdf", "X-File-Name": "auto-proof.pdf" },
    body: Buffer.from("%PDF-1.4 auto test")
  });
  assert(result.response.status === 201 && result.data.file.id, "Auto alumni proof upload failed");
  const autoProofFileId = result.data.file.id;

  result = await request("/api/alumni/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "鑷姩璁よ瘉鏍″弸",
      graduationYear: "2016",
      college: "鏁欏笀鏁欒偛瀛﹂櫌",
      major: "灏忓鏁欒偛",
      phone: "13900000000",
      email: "auto-alumni@example.com",
      proofFileId: autoProofFileId
    })
  });
  assert(
    result.response.status === 201
      && result.data.application.status === "approved"
      && result.data.application.approvalSource === "association"
      && result.data.quota.remaining === 1000000,
    "Joint alumni verification should auto-approve and grant tokens"
  );
  const autoAlumniCookie = cookie;
  result = await request("/api/alumni/ledger");
  assert(result.data.ledger.some(item => item.description.includes("Alumni association")), "Joint verification grant should be written to ledger");

  cookie = adminCookie;
  result = await request("/api/admin/token-adjustments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "alumni.auto", amount: 5000, reason: "误扣补偿测试" })
  });
  assert(result.response.ok && result.data.quota.remaining === 1005000, "Super admin should add manual tokens to an active grant");
  result = await request("/api/admin/token-adjustments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "alumni.auto", amount: -2000, reason: "人工扣减测试" })
  });
  assert(result.response.ok && result.data.quota.remaining === 1003000, "Super admin should deduct manual tokens from an active grant");
  result = await request("/api/admin/token-adjustments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "alumni.auto", amount: -1000000, reason: "大额扣减测试" })
  });
  assert(result.response.ok && result.data.quota.remaining === 3000, "Manual deduction should update quota through the ledger");
  result = await request("/api/admin/token-adjustments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "alumni.auto", amount: -5000, reason: "越额扣减测试" })
  });
  assert(result.response.status === 400 && result.data.remaining === 3000, "Manual token deductions must not overdraw the remaining grant");
  cookie = autoAlumniCookie;
  result = await request("/api/alumni/quota");
  assert(result.response.ok && result.data.remaining === 3000, "Adjusted user quota should reflect manual ledger corrections");
  cookie = reviewerCookie;

  result = await request("/api/admin/audit-logs");
  assert(
    result.response.ok && result.data.logs.some(log => log.action === "alumni.association.verify"),
    "Joint alumni verification should be written to audit logs"
  );

  result = await request(`/api/admin/alumni/applications/${applicationId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}"
  });
  assert(result.response.ok && result.data.quota.remaining === 1000000, "Alumni token grant failed");

  result = await request(`/api/admin/alumni/applications/${applicationId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}"
  });
  assert(result.response.ok && result.data.quota.remaining === 1000000, "Approval must be idempotent");

  result = await request("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "请编写教案 trigger-failure", attachments: [] })
  });
  assert(
    result.response.ok
      && result.data.route.provider === "qwen"
      && result.data.route.fallbackUsed === true
      && result.data.route.attempts.some(item => item.id === "deepseek" && item.ok === false),
    "Provider failure should automatically fall back to the configured domestic route"
  );
  const fallbackCharged = result.data.usage.chargedTokens;
  assert(fallbackCharged > 0, "Successful fallback requests should consume domestic quota");

  result = await request("/api/alumni/quota");
  assert(result.data.remaining === 1000000 - fallbackCharged, "Fallback model request should settle quota exactly once");

  const concurrentOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "请编写一份五年级语文教案", attachments: [] })
  };
  const concurrentResults = await Promise.all([
    request("/api/chat/stream", concurrentOptions),
    request("/api/chat/stream", concurrentOptions)
  ]);
  assert(concurrentResults.every(item => item.response.ok), "Concurrent model requests failed");
  const totalCharged = concurrentResults.reduce((sum, item) => sum + item.data.usage.chargedTokens, 0);
  assert(totalCharged > 0 && totalCharged <= 1000000, "Concurrent requests must never charge beyond the grant");

  result = await request("/api/alumni/quota");
  assert(
    result.data.remaining === 1000000 - fallbackCharged - totalCharged && result.data.reserved === 0,
    "Concurrent reservations must settle against actual usage and fully release"
  );

  const usersExport = await fetch(`${base}/api/admin/users.csv`, {
    headers: { Cookie: adminCookie }
  });
  const usersCsv = await usersExport.text();
  assert(
    usersExport.ok
      && usersExport.headers.get("content-type").includes("text/csv")
      && usersCsv.includes("\"createdAt\",\"updatedAt\",\"id\",\"username\",\"displayName\",\"role\",\"department\",\"status\",\"ssoProvider\",\"ssoSubject\",\"email\",\"mustChangePassword\"")
      && usersCsv.includes("\"xz2026\"")
      && usersCsv.includes("\"agent.admin\"")
      && usersCsv.includes("\"sso.teacher\"")
      && !usersCsv.includes("passwordHash")
      && !usersCsv.includes("teacher456")
      && !usersCsv.includes("xz2026:"),
    "Super admin should export a redacted user account ledger as CSV"
  );

  const agentQualityExport = await fetch(`${base}/api/admin/agents-quality.csv`, {
    headers: { Cookie: adminCookie }
  });
  const agentQualityCsv = await agentQualityExport.text();
  assert(
    agentQualityExport.ok
      && agentQualityExport.headers.get("content-type").includes("text/csv")
      && agentQualityCsv.includes("\"id\",\"name\",\"category\",\"owner\",\"status\",\"mode\",\"routeHint\",\"routeName\",\"routeConfigured\",\"routeMissingEnv\",\"routeEnvNames\",\"fallbackRoutes\",\"lastTestStatus\"")
      && agentQualityCsv.includes("\"qualityStatus\"")
      && agentQualityCsv.includes("\"qualityIssues\"")
      && agentQualityCsv.includes("\"agent-001\"")
      && agentQualityCsv.includes("MOONSHOT_API_KEY")
      && !agentQualityCsv.includes("test-key")
      && !agentQualityCsv.includes("apiToken"),
    "Super admin should export agent quality governance CSV without secrets"
  );

  const workflowQualityExport = await fetch(`${base}/api/admin/workflows-quality.csv`, {
    headers: { Cookie: adminCookie }
  });
  const workflowQualityCsv = await workflowQualityExport.text();
  assert(
    workflowQualityExport.ok
      && workflowQualityExport.headers.get("content-type").includes("text/csv")
      && workflowQualityCsv.includes("\"id\",\"title\",\"status\",\"routeHint\",\"routeName\",\"routeConfigured\",\"routeMissingEnv\",\"routeEnvNames\",\"fallbackRoutes\",\"artifactType\",\"lastTestStatus\"")
      && workflowQualityCsv.includes("\"qualityStatus\"")
      && workflowQualityCsv.includes("\"qualityIssues\"")
      && workflowQualityCsv.includes("\"lesson\"")
      && workflowQualityCsv.includes("MOONSHOT_API_KEY")
      && !workflowQualityCsv.includes("test-key"),
    "Super admin should export workflow quality governance CSV"
  );

  const versionHistoryExport = await fetch(`${base}/api/admin/version-history.csv`, {
    headers: { Cookie: adminCookie }
  });
  const versionHistoryCsv = await versionHistoryExport.text();
  assert(
    versionHistoryExport.ok
      && versionHistoryExport.headers.get("content-type").includes("text/csv")
      && versionHistoryCsv.includes("\"createdAt\",\"type\",\"itemId\",\"itemName\",\"version\",\"action\",\"actorId\"")
      && versionHistoryCsv.includes("\"agent\"")
      && versionHistoryCsv.includes("\"workflow\"")
      && versionHistoryCsv.includes("\"workflow-custom-audit\"")
      && !versionHistoryCsv.includes("passwordHash")
      && !versionHistoryCsv.includes("must-not-persist"),
    "Super admin should export redacted agent and workflow version history as CSV"
  );

  const ledgerExport = await fetch(`${base}/api/admin/token-ledger.csv`, {
    headers: { Cookie: adminCookie }
  });
  const ledgerCsv = await ledgerExport.text();
  assert(
    ledgerExport.ok
      && ledgerExport.headers.get("content-type").includes("text/csv")
      && ledgerCsv.includes("\"createdAt\",\"userId\",\"username\",\"displayName\",\"amount\",\"type\",\"model\"")
      && ledgerCsv.includes("\"charge\"")
      && ledgerCsv.includes("\"AI "),
    "Admin should export token grants and model consumption as CSV"
  );

  const modelRunsExport = await fetch(`${base}/api/admin/model-runs.csv`, {
    headers: { Cookie: adminCookie }
  });
  const modelRunsCsv = await modelRunsExport.text();
  assert(
    modelRunsExport.ok
      && modelRunsExport.headers.get("content-type").includes("text/csv")
      && modelRunsCsv.includes("\"createdAt\",\"status\",\"source\",\"userId\",\"username\",\"displayName\",\"requestedRoute\",\"actualRoute\"")
      && modelRunsCsv.includes("\"provider-test\"")
      && !modelRunsCsv.includes("test-key")
      && !modelRunsCsv.includes("trigger-failure"),
    "Super admin should export model run metadata as redacted CSV"
  );

  const providerStatusExport = await fetch(`${base}/api/admin/providers.csv`, {
    headers: { Cookie: adminCookie }
  });
  const providerStatusCsv = await providerStatusExport.text();
  assert(
    providerStatusExport.ok
      && providerStatusExport.headers.get("content-type").includes("text/csv")
      && providerStatusCsv.includes("\"id\",\"name\",\"domestic\",\"type\",\"configured\",\"model\",\"envNames\",\"missingEnv\",\"hasDefaultUrl\",\"hasDefaultModel\",\"fallbackRoutes\"")
      && providerStatusCsv.includes("MOONSHOT_API_KEY")
      && providerStatusCsv.includes("HUNYUAN_API_URL")
      && !providerStatusCsv.includes("test-key"),
    "Super admin should export redacted provider status CSV"
  );

  const auditExport = await fetch(`${base}/api/admin/audit-logs.csv`, {
    headers: { Cookie: adminCookie }
  });
  const auditCsv = await auditExport.text();
  assert(
    auditExport.ok
      && auditExport.headers.get("content-type").includes("text/csv")
      && auditCsv.includes("\"at\",\"action\",\"targetId\",\"actorId\",\"username\",\"displayName\",\"role\",\"department\",\"meta\"")
      && auditCsv.includes("\"agent.create\"")
      && !auditCsv.includes("must-not-persist"),
    "Super admin should export redacted audit logs as CSV"
  );

  const feedbackExport = await fetch(`${base}/api/admin/feedback.csv`, {
    headers: { Cookie: adminCookie }
  });
  const feedbackCsv = await feedbackExport.text();
  assert(
    feedbackExport.ok
      && feedbackExport.headers.get("content-type").includes("text/csv")
      && feedbackCsv.includes("\"createdAt\",\"updatedAt\",\"id\",\"userId\",\"username\",\"displayName\",\"type\",\"content\",\"email\",\"status\",\"assignee\",\"note\"")
      && feedbackCsv.includes("\"teacher@example.com\"")
      && feedbackCsv.includes("\"closed\""),
    "Super admin should export user feedback queue as CSV"
  );

  const alumniExport = await fetch(`${base}/api/admin/alumni/applications.csv`, {
    headers: { Cookie: adminCookie }
  });
  const alumniCsv = await alumniExport.text();
  assert(
    alumniExport.ok
      && alumniExport.headers.get("content-type").includes("text/csv")
      && alumniCsv.includes("\"submittedAt\",\"updatedAt\",\"id\",\"status\",\"userId\",\"username\",\"displayName\",\"name\",\"graduationYear\"")
      && alumniCsv.includes("\"approved\"")
      && alumniCsv.includes("\"1000000\"")
      && alumniCsv.includes("\"manual_review\""),
    "Super admin should export alumni applications, review status and token grants as CSV"
  );

  result = await request("/api/admin/audit-logs");
  assert(
    result.response.ok
      && result.data.logs.some(log => log.action === "user.export")
      && result.data.logs.some(log => log.action === "agent.quality.export")
      && result.data.logs.some(log => log.action === "workflow.quality.export")
      && result.data.logs.some(log => log.action === "version-history.export")
      && result.data.logs.some(log => log.action === "provider.export")
      && result.data.logs.some(log => log.action === "token.adjust")
      && result.data.logs.some(log => log.action === "feedback.export")
      && result.data.logs.some(log => log.action === "alumni.export"),
    "User, agent/workflow/provider quality, feedback and alumni CSV exports should be recorded in audit logs"
  );

  console.log("Server integration tests passed");
  console.log("Auth, accounts, 100 agents, SQLite persistence, import/export hardening, backup/restore, versions, publish gate, unified gateway, workflows, artifacts, metrics, proof review and quota settlement");
} finally {
  if (server.exitCode === null) {
    server.kill("SIGTERM");
    await new Promise(resolve => server.once("exit", resolve));
  }
  await new Promise(resolve => mockModel.close(resolve));
  await rm(dataDir, { recursive: true, force: true });
}
