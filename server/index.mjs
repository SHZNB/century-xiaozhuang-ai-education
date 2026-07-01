import { createServer } from "node:http";
import { access, mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  canManage,
  canReviewAlumni,
  clearSessionCookie,
  consumeOAuthState,
  createOAuthState,
  createSession,
  destroySession,
  ensureDevelopmentUsers,
  migrateSessionStorage,
  publicUser,
  sessionCookie,
  userFromRequest,
  hashPassword,
  upsertSsoUser,
  verifyPassword
} from "./auth.mjs";
import { closeStore, dataDir, db, flush, initStore, mutate } from "./store.mjs";
import { callModel, callModelWithFallback, chooseRoute, estimateUsage, providerStatuses, routeById } from "./models.mjs";
import { json, readBuffer, readJson, requestPath, safeId, serveStatic, text } from "./http-utils.mjs";
import { buildAgentCatalog } from "./catalog.mjs";
import { buildWorkflowMessage, teachingWorkflows, workflowArtifact, workflowById } from "./workflows.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uploadDir = path.join(dataDir, "uploads");
const artifactDir = path.join(dataDir, "artifacts");
const port = Number(process.env.PORT || 8080);
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 10 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;

await initStore();
ensureDevelopmentUsers();
migrateSessionStorage();
await flush();
await mkdir(uploadDir, { recursive: true });
await mkdir(artifactDir, { recursive: true });

const server = createServer(async (request, response) => {
  const pathname = requestPath(request);
  try {
    if (pathname.startsWith("/api/")) {
      applySecurityHeaders(response, request);
      if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }
      if (isMutation(request.method) && !sameOrigin(request)) return json(response, 403, { error: "Cross-site request blocked" });
      return await handleApi(request, response, pathname);
    }
    if (await serveStatic(response, root, pathname)) return;
    json(response, 404, { error: "Resource not found" });
  } catch (error) {
    console.error(error);
    json(response, error.status || 500, {
      error: error.expose || (error.status && error.status < 500) ? error.message : "鏈嶅姟鍣ㄥ鐞嗚姹傛椂鍙戠敓閿欒",
      detail: process.env.NODE_ENV === "production" ? undefined : error.message,
      route: error.route
    });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`鐧惧勾鏅撳簞鏅烘収鏁欒偛骞冲彴: http://localhost:${port}`);
});

async function handleApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/health") {
    return json(response, 200, await buildHealth());
  }

  if (request.method === "GET" && pathname === "/api/branding") {
    return json(response, 200, { branding: publicBranding(db().branding) });
  }

  if (request.method === "GET" && pathname === "/api/auth/sso/config") {
    const config = ssoConfig(request);
    return json(response, 200, {
      enabled: Boolean(config),
      label: process.env.SSO_LOGIN_LABEL || "学校统一身份认证"
    });
  }

  if (request.method === "GET" && pathname === "/api/auth/sso") {
    const config = ssoConfig(request);
    if (!config) return json(response, 503, { error: "SSO is not configured" });
    const state = createOAuthState("oidc");
    await flush();
    const authorizeUrl = new URL(config.authorizationUrl);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("client_id", config.clientId);
    authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
    authorizeUrl.searchParams.set("scope", config.scope);
    authorizeUrl.searchParams.set("state", state.state);
    authorizeUrl.searchParams.set("nonce", state.nonce);
    audit(null, "auth.sso.start", "oidc", { issuer: config.issuer || config.authorizationUrl });
    await flush();
    redirect(response, authorizeUrl.href);
    return;
  }

  if (request.method === "GET" && pathname === "/api/auth/sso/callback") {
    return handleSsoCallback(request, response);
  }

  if (request.method === "POST" && pathname === "/api/auth/login") {
    const body = await readJson(request);
    const username = String(body.username || "").trim().toLowerCase();
    const throttle = loginThrottleState(request, username);
    if (throttle.locked) {
      audit(null, "auth.login.locked", username || "unknown", { ip: requestIp(request), retryAfterSeconds: throttle.retryAfterSeconds });
      await flush();
      return json(response, 429, { error: "登录失败次数过多，请稍后再试", retryAfterSeconds: throttle.retryAfterSeconds }, { "Retry-After": String(throttle.retryAfterSeconds) });
    }
    const user = db().users.find(item => item.username.toLowerCase() === username);
    if (!user || !verifyPassword(String(body.password || ""), user.passwordHash)) {
      const failure = recordFailedLogin(request, username);
      audit(null, "auth.login.failed", username || "unknown", { ip: requestIp(request), attempts: failure.count });
      if (failure.locked) audit(null, "auth.login.locked", username || "unknown", { ip: requestIp(request), retryAfterSeconds: failure.retryAfterSeconds });
      await flush();
      if (failure.locked) {
        return json(response, 429, { error: "登录失败次数过多，请稍后再试", retryAfterSeconds: failure.retryAfterSeconds }, { "Retry-After": String(failure.retryAfterSeconds) });
      }
      return json(response, 401, { error: "璐﹀彿鎴栧瘑鐮佷笉姝ｇ‘" });
    }
    if ((user.status || "active") !== "active") {
      return json(response, 403, { error: "璐﹀彿宸插仠鐢紝璇疯仈绯诲钩鍙扮鐞嗗憳" });
    }
    clearFailedLogin(request, username);
    const session = createSession(user.id, Boolean(body.remember));
    await flush();
    audit(user, "auth.login", user.id);
    return json(response, 200, { user: publicUser(user) }, { "Set-Cookie": sessionCookie(session.token, session.expiresAt) });
  }

  if (request.method === "POST" && pathname === "/api/auth/demo-preview") {
    if (!isDemoMode()) return json(response, 404, { error: "Demo preview is disabled" });
    const demoUser = db().users.find(item => item.username === "xz2026" && (item.status || "active") === "active")
      || db().users.find(item => item.role === "super_admin" && (item.status || "active") === "active")
      || db().users.find(item => (item.status || "active") === "active");
    if (!demoUser) return json(response, 503, { error: "No demo user is available" });
    const session = createSession(demoUser.id, true);
    audit(demoUser, "auth.demo.preview", demoUser.id);
    await flush();
    return json(response, 200, { user: publicUser({ ...demoUser, mustChangePassword: false }), demo: true }, { "Set-Cookie": sessionCookie(session.token, session.expiresAt) });
  }

  if (request.method === "POST" && pathname === "/api/auth/logout") {
    const token = request.headers.cookie?.match(/(?:^|;\s*)xz_session=([^;]+)/)?.[1];
    if (token) destroySession(decodeURIComponent(token));
    await flush();
    return json(response, 200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
  }

  const user = userFromRequest(request);
  if (request.method === "GET" && pathname === "/api/auth/me") {
    return user ? json(response, 200, { user: publicUser(user) }) : json(response, 401, { error: "Not logged in" });
  }

  if (request.method === "POST" && pathname === "/api/auth/change-password") {
    if (!user) return json(response, 401, { error: "Login required" });
    const body = await readJson(request);
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "").trim();
    if (!verifyPassword(currentPassword, user.passwordHash)) return json(response, 403, { error: "Current password is incorrect" });
    if (newPassword.length < 8) return json(response, 400, { error: "New password must be at least 8 characters" });
    if (newPassword === currentPassword) return json(response, 400, { error: "New password must be different from the current password" });
    mutate(store => {
      store.users = store.users.map(item => item.id === user.id ? {
        ...item,
        passwordHash: hashPassword(newPassword),
        mustChangePassword: false,
        updatedAt: new Date().toISOString()
      } : item);
    });
    audit(user, "auth.password.change", user.id, { forced: Boolean(user.mustChangePassword) });
    await flush();
    return json(response, 200, { user: publicUser(db().users.find(item => item.id === user.id)) });
  }

  if (user?.mustChangePassword) {
    return json(response, 428, { error: "Initial password must be changed first", requiresPasswordChange: true });
  }

  if (request.method === "GET" && pathname === "/api/agents") {
    const agents = canManage(user) ? db().agents : db().agents.filter(agent => agent.status === "published");
    return json(response, 200, { agents });
  }

  if (!user) return json(response, 401, { error: "璇峰厛鐧诲綍" });

  if (request.method === "POST" && pathname === "/api/files") {
    const fileName = sanitizeFileName(request.headers["x-file-name"] || "upload.bin");
    const contentType = String(request.headers["content-type"] || "application/octet-stream");
    const uploadType = validateUploadType(contentType);
    if (!uploadType) {
      return json(response, 415, { error: "Only PDF, PNG, JPG and WebP are supported" });
    }
    const buffer = await readBuffer(request);
    if (!isValidUploadBody(buffer, uploadType.contentType)) {
      audit(user, "file.upload.rejected", "file", { fileName, contentType, reason: "signature_mismatch" });
      await flush();
      return json(response, 415, { error: "Uploaded file content does not match the declared file type" });
    }
    const id = `file-${randomUUID()}`;
    const storedName = `${id}${uploadType.extension}`;
    await writeFile(path.join(uploadDir, storedName), buffer);
    mutate(store => {
      store.auditLogs.push({
        id: randomUUID(),
        actorId: user.id,
        action: "file.upload",
        targetId: id,
        at: new Date().toISOString(),
        meta: { fileName, storedName, contentType: uploadType.contentType, size: buffer.length }
      });
    });
    await flush();
    return json(response, 201, { file: { id, name: fileName, type: uploadType.contentType, size: buffer.length } });
  }

  if (pathname === "/api/conversations" && request.method === "GET") {
    return json(response, 200, {
      conversations: db().conversations.filter(item => item.userId === user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    });
  }

  if (pathname === "/api/conversations" && request.method === "POST") {
    const body = await readJson(request);
    const conversation = {
      id: `conv-${randomUUID()}`,
      userId: user.id,
      title: String(body.title || "New conversation").slice(0, 80),
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mutate(store => store.conversations.push(conversation));
    await flush();
    return json(response, 201, { conversation });
  }

  const conversationMatch = pathname.match(/^\/api\/conversations\/([a-zA-Z0-9_-]+)$/);
  if (conversationMatch && request.method === "DELETE") {
    mutate(store => {
      store.conversations = store.conversations.filter(item => !(item.id === conversationMatch[1] && item.userId === user.id));
    });
    await flush();
    return json(response, 200, { ok: true });
  }

  if (pathname === "/api/chat/stream" && request.method === "POST") {
    return handleChat(request, response, user);
  }

  if (pathname === "/api/workflows" && request.method === "GET") {
    const workflows = canManage(user) ? db().workflows : db().workflows.filter(item => item.status !== "offline");
    return json(response, 200, { workflows });
  }

  const workflowRunMatch = pathname.match(/^\/api\/workflows\/([a-zA-Z0-9_-]+)\/run$/);
  if (workflowRunMatch && request.method === "POST") {
    return runWorkflow(request, response, user, workflowRunMatch[1]);
  }

  if (pathname === "/api/alumni/applications" && request.method === "POST") {
    return submitAlumniApplication(request, response, user);
  }

  if (pathname === "/api/alumni/status" && request.method === "GET") {
    const application = db().alumniApplications.filter(item => item.userId === user.id).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0] || null;
    return json(response, 200, { application });
  }

  if (pathname === "/api/alumni/quota" && request.method === "GET") {
    return json(response, 200, quotaForUser(user.id));
  }

  if (pathname === "/api/alumni/ledger" && request.method === "GET") {
    return json(response, 200, { ledger: db().tokenLedger.filter(item => item.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  }

  if (pathname === "/api/artifacts" && request.method === "GET") {
    return json(response, 200, { artifacts: buildArtifacts(user) });
  }

  const artifactDownloadMatch = pathname.match(/^\/api\/artifacts\/([a-zA-Z0-9_-]+)\/download$/);
  if (artifactDownloadMatch && request.method === "GET") {
    return serveArtifact(response, user, artifactDownloadMatch[1]);
  }

  const artifactMatch = pathname.match(/^\/api\/artifacts\/([a-zA-Z0-9_-]+)$/);
  if (artifactMatch && request.method === "DELETE") {
    return deleteArtifact(response, user, artifactMatch[1]);
  }

  if (pathname === "/api/feedback" && request.method === "POST") {
    return submitFeedback(request, response, user);
  }

  if (pathname === "/api/admin/providers" && request.method === "GET") {
    if (!canManage(user)) return json(response, 403, { error: "娌℃湁妯″瀷绠＄悊鏉冮檺" });
    return json(response, 200, { providers: providerStatuses() });
  }

  if (pathname === "/api/admin/providers.csv" && request.method === "GET") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No provider status export permission" });
    const csv = buildProviderStatusCsv();
    audit(user, "provider.export", "providers", { rows: providerStatuses().length });
    await flush();
    return text(response, 200, csv, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="xiaozhuang-provider-status-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store"
    });
  }

  const providerTestMatch = pathname.match(/^\/api\/admin\/providers\/([a-zA-Z0-9_-]+)\/test$/);
  if (providerTestMatch && request.method === "POST") {
    if (!canManage(user)) return json(response, 403, { error: "娌℃湁妯″瀷绠＄悊鏉冮檺" });
    const route = routeById(providerTestMatch[1]);
    if (!route) return json(response, 404, { error: "Model route not found" });
    const body = await readJson(request).catch(() => ({}));
    const message = String(body.message || "Please reply briefly: model connection test succeeded.").trim().slice(0, 300);
    const startedAt = Date.now();
    try {
      const result = await callModel(route, [
        { role: "system", content: "You are the model connection test assistant for the platform. Reply briefly and do not output sensitive information." },
        { role: "user", content: message }
      ], { maxOutputTokens: 128 });
      const inputTokens = result.usage?.inputTokens || estimateUsage(message);
      const outputTokens = result.usage?.outputTokens || estimateUsage(result.answer || "");
      mutate(store => recordModelRun(store, {
        user,
        status: "success",
        requestedRoute: route,
        actualRoute: route,
        result: { ...result, attempts: [{ id: route.id, ok: true }], fallbackUsed: false },
        inputTokens,
        outputTokens,
        charged: 0,
        startedAt,
        testRun: true,
        source: "provider-test"
      }));
      audit(user, "provider.test", route.id, { model: result.model });
      await flush();
      return json(response, 200, {
        provider: { id: route.id, name: route.name, domestic: route.domestic },
        answer: result.answer,
        model: result.model,
        usage: result.usage
      });
    } catch (error) {
      mutate(store => recordModelRun(store, {
        user,
        status: "failed",
        requestedRoute: route,
        actualRoute: route,
        result: { model: "", attempts: [{ id: route.id, ok: false, error: error.message }], fallbackUsed: false },
        inputTokens: estimateUsage(message),
        outputTokens: 0,
        charged: 0,
        startedAt,
        testRun: true,
        source: "provider-test",
        error: error.message
      }));
      await flush();
      throw error;
    }
  }

  if (pathname === "/api/admin/metrics" && request.method === "GET") {
    if (!canManage(user)) return json(response, 403, { error: "娌℃湁杩愯惀缁熻鏉冮檺" });
    return json(response, 200, { metrics: buildMetrics(metricsWindowDays(request)) });
  }

  if (pathname === "/api/admin/model-runs" && request.method === "GET") {
    if (!canManage(user)) return json(response, 403, { error: "No model run permission" });
    return json(response, 200, { runs: buildModelRuns(user) });
  }

  if (pathname === "/api/admin/model-runs.csv" && request.method === "GET") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No model run export permission" });
    audit(user, "model-runs.export", "model-runs", { rows: db().modelRuns.length });
    await flush();
    const csv = buildModelRunsCsv();
    response.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="xiaozhuang-model-runs-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(csv)
    });
    response.end(csv);
    return;
  }

  if (pathname === "/api/admin/token-ledger.csv" && request.method === "GET") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No token ledger export permission" });
    const csv = buildTokenLedgerCsv();
    audit(user, "token-ledger.export", "token-ledger", { rows: db().tokenLedger.length });
    await flush();
    response.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="xiaozhuang-token-ledger-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(csv)
    });
    response.end(csv);
    return;
  }

  if (pathname === "/api/admin/token-adjustments" && request.method === "POST") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No token adjustment permission" });
    return adjustTokenGrant(request, response, user);
  }

  if (pathname === "/api/admin/readiness" && request.method === "GET") {
    if (!canManage(user)) return json(response, 403, { error: "No readiness permission" });
    return json(response, 200, { readiness: await buildReadiness() });
  }

  if (pathname === "/api/admin/artifacts/cleanup" && request.method === "POST") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No artifact cleanup permission" });
    return cleanupArtifacts(request, response, user);
  }

  if (pathname === "/api/admin/artifacts.csv" && request.method === "GET") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No artifact export permission" });
    const csv = buildArtifactsCsv();
    audit(user, "artifact.export", "artifacts", { rows: db().artifacts.length });
    response.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="xiaozhuang-artifacts-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(csv)
    });
    response.end(csv);
    return;
  }

  if (pathname === "/api/admin/branding" && request.method === "PUT") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No branding permission" });
    const body = await readJson(request);
    const branding = normalizeBranding(body);
    mutate(store => {
      store.branding = branding;
    });
    audit(user, "branding.update", "branding", { assetStatus: branding.assetStatus });
    await flush();
    return json(response, 200, { branding: publicBranding(branding) });
  }

  if (pathname === "/api/admin/audit-logs" && request.method === "GET") {
    if (!canManage(user) && !canReviewAlumni(user)) return json(response, 403, { error: "娌℃湁瀹¤鏃ュ織鏌ョ湅鏉冮檺" });
    return json(response, 200, { logs: buildAuditLogs(user) });
  }

  if (pathname === "/api/admin/audit-logs.csv" && request.method === "GET") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No audit log export permission" });
    audit(user, "audit-logs.export", "audit-logs", { rows: db().auditLogs.length });
    await flush();
    const csv = buildAuditLogsCsv();
    response.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="xiaozhuang-audit-logs-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(csv)
    });
    response.end(csv);
    return;
  }

  if (pathname === "/api/admin/feedback.csv" && request.method === "GET") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No feedback export permission" });
    const csv = buildFeedbackCsv();
    audit(user, "feedback.export", "feedback", { rows: db().feedbackItems.length });
    response.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="xiaozhuang-feedback-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(csv)
    });
    response.end(csv);
    return;
  }

  if (pathname === "/api/admin/alumni/applications.csv" && request.method === "GET") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No alumni export permission" });
    const csv = buildAlumniApplicationsCsv();
    audit(user, "alumni.export", "alumni-applications", { rows: db().alumniApplications.length });
    response.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="xiaozhuang-alumni-applications-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(csv)
    });
    response.end(csv);
    return;
  }

  if (pathname === "/api/admin/feedback" && request.method === "GET") {
    if (!canManage(user)) return json(response, 403, { error: "娌℃湁鍙嶉澶勭悊鏉冮檺" });
    const items = db().feedbackItems.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return json(response, 200, { items });
  }

  const feedbackAdminMatch = pathname.match(/^\/api\/admin\/feedback\/([a-zA-Z0-9_-]+)$/);
  if (feedbackAdminMatch && request.method === "PUT") {
    if (!canManage(user)) return json(response, 403, { error: "娌℃湁鍙嶉澶勭悊鏉冮檺" });
    const existing = db().feedbackItems.find(item => item.id === feedbackAdminMatch[1]);
    if (!existing) return json(response, 404, { error: "Feedback not found" });
    const body = await readJson(request);
    const statuses = new Set(["open", "triaged", "closed"]);
    const next = {
      ...existing,
      status: statuses.has(body.status) ? body.status : existing.status,
      assignee: String(body.assignee || existing.assignee || "").trim().slice(0, 40),
      note: String(body.note || existing.note || "").trim().slice(0, 300),
      updatedAt: new Date().toISOString()
    };
    mutate(store => {
      store.feedbackItems = store.feedbackItems.map(item => item.id === existing.id ? next : item);
    });
    audit(user, "feedback.update", existing.id, { from: existing.status, to: next.status });
    await flush();
    return json(response, 200, { item: next });
  }

  if (pathname === "/api/admin/users" && request.method === "GET") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "娌℃湁璐﹀彿绠＄悊鏉冮檺" });
    return json(response, 200, { users: db().users.map(managedUser) });
  }

  if (pathname === "/api/admin/users.csv" && request.method === "GET") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No user export permission" });
    const csv = buildUsersCsv();
    audit(user, "user.export", "users", { rows: db().users.length });
    response.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="xiaozhuang-users-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(csv)
    });
    response.end(csv);
    return;
  }

  if (pathname === "/api/admin/agents-quality.csv" && request.method === "GET") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No agent quality export permission" });
    const csv = buildAgentsQualityCsv();
    audit(user, "agent.quality.export", "agents", { rows: db().agents.length });
    response.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="xiaozhuang-agents-quality-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(csv)
    });
    response.end(csv);
    return;
  }

  if (pathname === "/api/admin/workflows-quality.csv" && request.method === "GET") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No workflow quality export permission" });
    const csv = buildWorkflowsQualityCsv();
    audit(user, "workflow.quality.export", "workflows", { rows: db().workflows.length });
    response.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="xiaozhuang-workflows-quality-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(csv)
    });
    response.end(csv);
    return;
  }

  if (pathname === "/api/admin/version-history.csv" && request.method === "GET") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No version history export permission" });
    const csv = buildVersionHistoryCsv();
    audit(user, "version-history.export", "versions", { rows: db().agentVersions.length + db().workflowVersions.length });
    response.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="xiaozhuang-version-history-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(csv)
    });
    response.end(csv);
    return;
  }

  if (pathname === "/api/admin/backup" && request.method === "GET") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "娌℃湁骞冲彴澶囦唤鏉冮檺" });
    audit(user, "platform.backup", "platform");
    await flush();
    return json(response, 200, { backup: createBackup() });
  }

  if (pathname === "/api/admin/restore" && request.method === "POST") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "娌℃湁骞冲彴鎭㈠鏉冮檺" });
    const body = await readJson(request, 20 * 1024 * 1024);
    const backup = body.backup || body;
    const restored = restoreBackup(backup, user);
    await flush();
    return json(response, 200, { restored });
  }

  if (pathname === "/api/admin/catalog/reset" && request.method === "POST") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No catalog reset permission" });
    const body = await readJson(request).catch(() => ({}));
    const scope = body.scope === "agents" || body.scope === "workflows" ? body.scope : "all";
    const reset = resetDefaultCatalog(scope, user);
    await flush();
    return json(response, 200, { reset, agents: db().agents, workflows: db().workflows });
  }

  if (pathname === "/api/admin/maintenance" && request.method === "POST") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "No maintenance permission" });
    const maintenance = runPlatformMaintenance(user);
    await flush();
    return json(response, 200, { maintenance });
  }

  if (pathname === "/api/admin/users" && request.method === "POST") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "娌℃湁璐﹀彿绠＄悊鏉冮檺" });
    const body = await readJson(request);
    const account = normalizeUser(body, `user-${randomUUID()}`);
    const password = String(body.password || "").trim();
    if (password.length < 8) return json(response, 400, { error: "Initial password must be at least 8 characters" });
    if (db().users.some(item => item.username.toLowerCase() === account.username.toLowerCase())) {
      return json(response, 409, { error: "璐﹀彿鍚嶅凡瀛樺湪" });
    }
    account.passwordHash = hashPassword(password);
    account.mustChangePassword = true;
    account.createdAt = new Date().toISOString();
    mutate(store => store.users.push(account));
    audit(user, "user.create", account.id, { role: account.role });
    await flush();
    return json(response, 201, { user: managedUser(account) });
  }

  const userAdminMatch = pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)$/);
  if (userAdminMatch && request.method === "PUT") {
    if (!isSuperAdmin(user)) return json(response, 403, { error: "娌℃湁璐﹀彿绠＄悊鏉冮檺" });
    const existing = db().users.find(item => item.id === userAdminMatch[1]);
    if (!existing) return json(response, 404, { error: "User not found" });
    const updates = await readJson(request);
    const next = normalizeUser({ ...existing, ...updates }, existing.id);
    const password = String(updates.password || "").trim();
    if (password && password.length < 8) return json(response, 400, { error: "Reset password must be at least 8 characters" });
    if (wouldRemoveLastActiveSuperAdmin(existing, next)) {
      return json(response, 400, { error: "At least one active super administrator is required" });
    }
    mutate(store => {
      store.users = store.users.map(item => item.id === existing.id ? {
        ...existing,
        ...next,
        passwordHash: password ? hashPassword(password) : existing.passwordHash,
        mustChangePassword: password ? true : Boolean(existing.mustChangePassword),
        updatedAt: new Date().toISOString()
      } : item);
      if (next.status !== "active") {
        store.sessions = store.sessions.filter(session => session.userId !== existing.id);
      }
    });
    audit(user, "user.update", existing.id, { role: next.role, status: next.status, passwordReset: Boolean(password) });
    await flush();
    return json(response, 200, { user: managedUser(db().users.find(item => item.id === existing.id)) });
  }

  if (pathname === "/api/admin/workflows" && request.method === "GET") {
    if (!canManage(user)) return json(response, 403, { error: "No workflow permission" });
    return json(response, 200, { workflows: db().workflows });
  }

  if (pathname === "/api/admin/workflows" && request.method === "POST") {
    if (!canManage(user)) return json(response, 403, { error: "No workflow permission" });
    const body = await readJson(request);
    const requestedId = safeId(body.id) ? body.id : `workflow-${randomUUID()}`;
    if (db().workflows.some(item => item.id === requestedId)) return json(response, 409, { error: "Workflow ID already exists" });
    const workflow = normalizeWorkflow(body, requestedId);
    const validation = validateWorkflow(workflow);
    if (validation) return json(response, 400, { error: validation });
    const publishError = validateWorkflowPublishGate(null, workflow);
    if (publishError) return json(response, 400, { error: publishError });
    mutate(store => {
      store.workflows.unshift(workflow);
      recordWorkflowVersion(store, workflow, user, "create");
    });
    audit(user, "workflow.create", workflow.id, { status: workflow.status, routeHint: workflow.routeHint });
    await flush();
    return json(response, 201, { workflow });
  }

  if (pathname === "/api/admin/workflows/import" && request.method === "POST") {
    if (!canManage(user)) return json(response, 403, { error: "No workflow permission" });
    const body = await readJson(request, 5 * 1024 * 1024);
    const incoming = Array.isArray(body.workflows) ? body.workflows : [];
    const strategy = body.strategy === "merge" ? "merge" : "replace";
    if (!incoming.length || incoming.length > 80) return json(response, 400, { error: "瀵煎叆鏂囦欢闇€鍖呭惈 1-80 涓伐浣滄祦" });
    const seen = new Set();
    const workflows = incoming.map((item, index) => {
      const id = safeId(item.id) ? item.id : `workflow-imported-${index + 1}`;
      if (seen.has(id)) {
        const error = new Error(`宸ヤ綔娴?ID 閲嶅锛?{id}`);
        error.status = 400;
        error.expose = true;
        throw error;
      }
      seen.add(id);
      const workflow = normalizeWorkflow(item, id);
      const validation = validateWorkflow(workflow);
      if (validation) {
        const error = new Error(`宸ヤ綔娴佲€?{workflow.title || id}鈥濓細${validation}`);
        error.status = 400;
        error.expose = true;
        throw error;
      }
      const publishError = validateWorkflowPublishGate(null, workflow);
      if (publishError) {
        const error = new Error(`宸ヤ綔娴佲€?{workflow.title || id}鈥濓細${publishError}`);
        error.status = 400;
        error.expose = true;
        throw error;
      }
      return workflow;
    });
    mutate(store => {
      const next = strategy === "merge"
        ? [...workflows, ...store.workflows.filter(item => !seen.has(item.id))]
        : workflows;
      store.workflows = next;
      for (const workflow of workflows) recordWorkflowVersion(store, workflow, user, `import:${strategy}`);
    });
    audit(user, "workflow.import", "workflows", { count: workflows.length, strategy });
    await flush();
    return json(response, 200, { imported: workflows.length, workflows: db().workflows });
  }

  if (pathname === "/api/admin/workflows/bulk" && request.method === "PATCH") {
    if (!canManage(user)) return json(response, 403, { error: "No workflow permission" });
    const body = await readJson(request);
    const ids = Array.isArray(body.ids) ? [...new Set(body.ids.filter(safeId))] : [];
    if (!ids.length || ids.length > 80) return json(response, 400, { error: "Select 1-80 workflows" });
    const routeHint = String(body.routeHint || "");
    if (!routeById(routeHint)) return json(response, 400, { error: "Invalid workflow route" });
    const idSet = new Set(ids);
    const skipped = [];
    let updated = 0;
    mutate(store => {
      store.workflows = store.workflows.map(existing => {
        if (!idSet.has(existing.id)) return existing;
        const workflow = normalizeWorkflow({ ...existing, routeHint }, existing.id);
        const validation = validateWorkflow(workflow);
        if (validation) {
          skipped.push({ id: existing.id, reason: validation });
          return existing;
        }
        const nextWorkflow = invalidateWorkflowTestIfChanged(existing, workflow, "route changed");
        updated += 1;
        recordWorkflowVersion(store, nextWorkflow, user, `bulk:route:${routeHint}`);
        return nextWorkflow;
      });
    });
    audit(user, "workflow.bulk-route", "workflows", { ids, routeHint, updated, skipped: skipped.length });
    await flush();
    return json(response, 200, { workflows: db().workflows, updated, skipped, routeHint });
  }

  const workflowTestMatch = pathname.match(/^\/api\/admin\/workflows\/([a-zA-Z0-9_-]+)\/test$/);
  if (workflowTestMatch && request.method === "POST") {
    if (!canManage(user)) return json(response, 403, { error: "No workflow test permission" });
    return testWorkflow(response, user, workflowTestMatch[1], await readJson(request, 2 * 1024 * 1024).catch(() => ({})));
  }

  const workflowVersionsMatch = pathname.match(/^\/api\/admin\/workflows\/([a-zA-Z0-9_-]+)\/versions$/);
  if (workflowVersionsMatch && request.method === "GET") {
    if (!canManage(user)) return json(response, 403, { error: "No workflow permission" });
    const versions = db().workflowVersions
      .filter(item => item.workflowId === workflowVersionsMatch[1])
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return json(response, 200, { versions });
  }

  const workflowVersionDiffMatch = pathname.match(/^\/api\/admin\/workflows\/([a-zA-Z0-9_-]+)\/versions\/diff$/);
  if (workflowVersionDiffMatch && request.method === "GET") {
    if (!canManage(user)) return json(response, 403, { error: "No workflow version diff permission" });
    const url = new URL(request.url, requestOrigin(request));
    const diff = buildWorkflowVersionDiff(
      workflowVersionDiffMatch[1],
      Number(url.searchParams.get("from") || 0),
      Number(url.searchParams.get("to") || 0)
    );
    if (!diff) return json(response, 404, { error: "Workflow versions not found" });
    return json(response, 200, { diff });
  }

  const workflowRestoreMatch = pathname.match(/^\/api\/admin\/workflows\/([a-zA-Z0-9_-]+)\/versions\/([0-9]+)\/restore$/);
  if (workflowRestoreMatch && request.method === "POST") {
    if (!canManage(user)) return json(response, 403, { error: "No workflow permission" });
    const workflowId = workflowRestoreMatch[1];
    const version = Number(workflowRestoreMatch[2]);
    const snapshot = db().workflowVersions.find(item => item.workflowId === workflowId && item.version === version)?.snapshot;
    if (!snapshot) return json(response, 404, { error: "宸ヤ綔娴佺増鏈笉瀛樺湪" });
    const workflow = invalidateWorkflowTest(normalizeWorkflow(snapshot, workflowId), "restored version");
    const validation = validateWorkflow(workflow);
    if (validation) return json(response, 400, { error: validation });
    const publishError = validateWorkflowPublishGate(null, workflow);
    if (publishError) return json(response, 400, { error: publishError });
    mutate(store => {
      const exists = store.workflows.some(item => item.id === workflowId);
      store.workflows = exists
        ? store.workflows.map(item => item.id === workflowId ? workflow : item)
        : [workflow, ...store.workflows];
      recordWorkflowVersion(store, workflow, user, `restore:v${version}`);
    });
    audit(user, "workflow.restore", workflow.id, { version });
    await flush();
    return json(response, 200, { workflow });
  }

  const workflowDuplicateMatch = pathname.match(/^\/api\/admin\/workflows\/([a-zA-Z0-9_-]+)\/duplicate$/);
  if (workflowDuplicateMatch && request.method === "POST") {
    if (!canManage(user)) return json(response, 403, { error: "No workflow permission" });
    const existing = db().workflows.find(item => item.id === workflowDuplicateMatch[1]);
    if (!existing) return json(response, 404, { error: "Workflow not found" });
    const body = await readJson(request);
    const requestedId = safeId(body.id) ? body.id : uniqueWorkflowId(`${existing.id}-copy`);
    if (db().workflows.some(item => item.id === requestedId)) return json(response, 409, { error: "Workflow ID already exists" });
    const workflow = normalizeWorkflow({
      ...existing,
      ...body,
      title: body.title || `${existing.title}副本`,
      status: "draft",
      lastTestAt: "",
      lastTestStatus: "untested",
      lastTestMessage: "",
      lastTestDurationMs: 0
    }, requestedId);
    const validation = validateWorkflow(workflow);
    if (validation) return json(response, 400, { error: validation });
    mutate(store => {
      store.workflows.unshift(workflow);
      recordWorkflowVersion(store, workflow, user, `duplicate:${existing.id}`);
    });
    audit(user, "workflow.duplicate", workflow.id, { sourceId: existing.id, routeHint: workflow.routeHint });
    await flush();
    return json(response, 201, { workflow });
  }

  const workflowAdminMatch = pathname.match(/^\/api\/admin\/workflows\/([a-zA-Z0-9_-]+)$/);
  if (workflowAdminMatch && request.method === "PUT") {
    if (!canManage(user)) return json(response, 403, { error: "No workflow permission" });
    const existing = db().workflows.find(item => item.id === workflowAdminMatch[1]);
    if (!existing) return json(response, 404, { error: "宸ヤ綔娴佷笉瀛樺湪" });
    const workflow = invalidateWorkflowTestIfChanged(existing, normalizeWorkflow({ ...existing, ...(await readJson(request)) }, existing.id), "configuration changed");
    const validation = validateWorkflow(workflow);
    if (validation) return json(response, 400, { error: validation });
    const publishError = validateWorkflowPublishGate(existing, workflow);
    if (publishError) return json(response, 400, { error: publishError });
    mutate(store => {
      store.workflows = store.workflows.map(item => item.id === existing.id ? workflow : item);
      recordWorkflowVersion(store, workflow, user, existing.status === workflow.status ? "update" : `status:${workflow.status}`);
    });
    audit(user, "workflow.update", workflow.id, { from: existing.status, to: workflow.status });
    await flush();
    return json(response, 200, { workflow });
  }

  if (workflowAdminMatch && request.method === "DELETE") {
    if (!canManage(user)) return json(response, 403, { error: "No workflow permission" });
    const existing = db().workflows.find(item => item.id === workflowAdminMatch[1]);
    if (!existing) return json(response, 404, { error: "宸ヤ綔娴佷笉瀛樺湪" });
    mutate(store => {
      store.workflows = store.workflows.filter(item => item.id !== existing.id);
      recordWorkflowVersion(store, existing, user, "delete");
    });
    audit(user, "workflow.delete", existing.id, { title: existing.title });
    await flush();
    return json(response, 200, { ok: true });
  }

  if (workflowAdminMatch && request.method === "GET") {
    if (!canManage(user)) return json(response, 403, { error: "No workflow permission" });
    const workflow = db().workflows.find(item => item.id === workflowAdminMatch[1]);
    if (!workflow) return json(response, 404, { error: "宸ヤ綔娴佷笉瀛樺湪" });
    return json(response, 200, { workflow });
  }

  if (pathname === "/api/admin/alumni/applications" && request.method === "GET") {
    if (!canReviewAlumni(user)) return json(response, 403, { error: "娌℃湁鏍″弸瀹℃牳鏉冮檺" });
    return json(response, 200, { applications: db().alumniApplications.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)) });
  }

  const proofMatch = pathname.match(/^\/api\/admin\/files\/([a-zA-Z0-9_-]+)$/);
  if (proofMatch && request.method === "GET") {
    if (!canReviewAlumni(user)) return json(response, 403, { error: "娌℃湁鏍″弸瀹℃牳鏉冮檺" });
    return serveAlumniProof(response, user, proofMatch[1]);
  }

  const approveMatch = pathname.match(/^\/api\/admin\/alumni\/applications\/([a-zA-Z0-9_-]+)\/approve$/);
  if (approveMatch && request.method === "POST") {
    if (!canReviewAlumni(user)) return json(response, 403, { error: "娌℃湁鏍″弸瀹℃牳鏉冮檺" });
    return approveAlumni(response, user, approveMatch[1]);
  }

  const rejectMatch = pathname.match(/^\/api\/admin\/alumni\/applications\/([a-zA-Z0-9_-]+)\/reject$/);
  if (rejectMatch && request.method === "POST") {
    if (!canReviewAlumni(user)) return json(response, 403, { error: "娌℃湁鏍″弸瀹℃牳鏉冮檺" });
    return rejectAlumni(request, response, user, rejectMatch[1]);
  }

  if (pathname === "/api/admin/agents" && request.method === "POST") {
    if (!canManage(user)) return json(response, 403, { error: "娌℃湁搴旂敤绠＄悊鏉冮檺" });
    const agent = normalizeAgent(await readJson(request), `agent-${randomUUID()}`);
    const validation = validateAgentForStatus(agent);
    if (validation) return json(response, 400, { error: validation });
    const publishError = validateAgentPublishGate(null, agent);
    if (publishError) return json(response, 400, { error: publishError });
    mutate(store => {
      store.agents.unshift(agent);
      recordAgentVersion(store, agent, user, "create");
    });
    audit(user, "agent.create", agent.id, { status: agent.status });
    await flush();
    return json(response, 201, { agent });
  }

  if (pathname === "/api/admin/agents/import" && request.method === "POST") {
    if (!canManage(user)) return json(response, 403, { error: "娌℃湁搴旂敤绠＄悊鏉冮檺" });
    const body = await readJson(request, 12 * 1024 * 1024);
    const imported = Array.isArray(body) ? body : body.agents;
    const strategy = body.strategy === "merge" ? "merge" : "replace";
    if (!Array.isArray(imported) || !imported.length) return json(response, 400, { error: "瀵煎叆鏂囦欢涓病鏈夋湁鏁堟櫤鑳戒綋鏁扮粍" });
    if (imported.length > 300) return json(response, 400, { error: "鍗曟瀵煎叆鏈€澶?300 涓櫤鑳戒綋" });
    const seen = new Set();
    const normalized = imported.map((item, index) => {
      const sourceId = safeId(item.id) ? item.id : `agent-import-${index + 1}`;
      const id = seen.has(sourceId) ? `${sourceId}-${index + 1}` : sourceId;
      seen.add(id);
      const { apiToken, secret, key, ...safeInput } = item;
      void apiToken; void secret; void key;
      const agent = normalizeAgent(safeInput, id);
      const validation = validateAgentForStatus(agent);
      if (validation) {
        const error = new Error(`绗?${index + 1} 涓櫤鑳戒綋鏃犳晥锛?{validation}`);
        error.status = 400;
        error.expose = true;
        throw error;
      }
      const publishError = validateAgentPublishGate(null, agent);
      if (publishError) {
        const error = new Error(`绗?${index + 1} 涓櫤鑳戒綋鏃犳晥锛?{publishError}`);
        error.status = 400;
        error.expose = true;
        throw error;
      }
      return agent;
    });
    mutate(store => {
      if (strategy === "replace") store.agents = normalized;
      else {
        const incomingIds = new Set(normalized.map(agent => agent.id));
        store.agents = [...normalized, ...store.agents.filter(agent => !incomingIds.has(agent.id))];
      }
      normalized.forEach(agent => recordAgentVersion(store, agent, user, `import:${strategy}`));
    });
    audit(user, "agent.import", "agents", { count: normalized.length, strategy });
    await flush();
    return json(response, 200, { agents: db().agents, imported: normalized.length, strategy });
  }

  if (pathname === "/api/admin/agents/coze-links" && request.method === "PATCH") {
    if (!canManage(user)) return json(response, 403, { error: "No agent Coze link permission" });
    const body = await readJson(request, 512 * 1024);
    const links = Array.isArray(body) ? body : body.links;
    if (!Array.isArray(links) || !links.length) return json(response, 400, { error: "No valid Coze link rows provided" });
    if (links.length > 300) return json(response, 400, { error: "At most 300 Coze links can be imported at once" });
    const incoming = new Map();
    const rejected = [];
    links.forEach((item, index) => {
      const id = String(item.id || item.agentId || "").trim();
      const cozeUrl = String(item.cozeUrl || item.url || "").trim();
      if (!safeId(id)) {
        rejected.push({ row: index + 1, reason: "invalid id" });
        return;
      }
      if (!isPublicCozeUrl(cozeUrl)) {
        rejected.push({ row: index + 1, id, reason: "invalid Coze URL" });
        return;
      }
      incoming.set(id, cozeUrl);
    });
    if (!incoming.size) return json(response, 400, { error: "No valid Coze links found", rejected });
    const updated = [];
    const missing = [];
    mutate(store => {
      store.agents = store.agents.map(existing => {
        if (!incoming.has(existing.id)) return existing;
        const agent = normalizeAgent({ ...existing, cozeUrl: incoming.get(existing.id) }, existing.id);
        updated.push(agent);
        recordAgentVersion(store, agent, user, "coze-link");
        return agent;
      });
      for (const id of incoming.keys()) {
        if (!store.agents.some(agent => agent.id === id)) missing.push(id);
      }
    });
    audit(user, "agent.coze-links", "agents", { updated: updated.length, missing: missing.length, rejected: rejected.length });
    await flush();
    return json(response, 200, { agents: db().agents, updated: updated.length, missing, rejected });
  }

  if (pathname === "/api/admin/agents/bulk" && request.method === "PATCH") {
    if (!canManage(user)) return json(response, 403, { error: "No agent bulk permission" });
    const body = await readJson(request, 512 * 1024);
    const ids = Array.isArray(body.ids) ? [...new Set(body.ids.map(item => String(item)).filter(safeId))].slice(0, 300) : [];
    const status = String(body.status || "");
    const routeHint = routeById(body.routeHint)?.id || "";
    if (!ids.length) return json(response, 400, { error: "No valid agent ids selected" });
    if (status && !["published", "draft", "offline"].includes(status)) return json(response, 400, { error: "Bulk status is invalid" });
    if (!status && !routeHint) return json(response, 400, { error: "No bulk update fields provided" });
    const updated = [];
    const skipped = [];
    mutate(store => {
      store.agents = store.agents.map(existing => {
        if (!ids.includes(existing.id)) return existing;
        const agent = normalizeAgent({ ...existing, ...(status ? { status } : {}), ...(routeHint ? { routeHint } : {}) }, existing.id);
        const validation = validateAgentForStatus(agent);
        if (validation) {
          skipped.push({ id: existing.id, reason: validation });
          return existing;
        }
        const publishError = validateAgentPublishGate(existing, agent);
        if (publishError) {
          skipped.push({ id: existing.id, reason: publishError });
          return existing;
        }
        const nextAgent = routeHint ? invalidateAgentTestIfChanged(existing, agent, "route changed") : agent;
        updated.push(nextAgent);
        recordAgentVersion(store, nextAgent, user, status ? `bulk:${status}` : `bulk:route:${routeHint}`);
        return nextAgent;
      });
    });
    audit(user, status ? "agent.bulk-status" : "agent.bulk-route", "agents", { count: updated.length, skipped: skipped.length, status, routeHint });
    await flush();
    return json(response, 200, { agents: db().agents, updated: updated.length, skipped, status, routeHint });
  }

  const agentMatch = pathname.match(/^\/api\/admin\/agents\/([a-zA-Z0-9_-]+)$/);
  const agentTestMatch = pathname.match(/^\/api\/admin\/agents\/([a-zA-Z0-9_-]+)\/test$/);
  if (agentTestMatch && request.method === "POST") {
    if (!canManage(user)) return json(response, 403, { error: "娌℃湁搴旂敤娴嬭瘯鏉冮檺" });
    const agent = db().agents.find(item => item.id === agentTestMatch[1]);
    if (!agent) return json(response, 404, { error: "鏅鸿兘浣撲笉瀛樺湪" });
    if (agent.mode !== "local") return testAgentConnection(response, user, agent);
    const body = await readJson(request, 2 * 1024 * 1024);
    const message = String(body.message || "").trim();
    if (!message) return json(response, 400, { error: "娴嬭瘯娑堟伅涓嶈兘涓虹┖" });
    return executeChat(response, user, {
      message,
      routeHint: agent.routeHint,
      agentOverride: agent,
      systemPrompt: agent.systemPrompt,
      skipConversation: true,
      testRun: true
    });
  }

  const agentVersionsMatch = pathname.match(/^\/api\/admin\/agents\/([a-zA-Z0-9_-]+)\/versions$/);
  if (agentVersionsMatch && request.method === "GET") {
    if (!canManage(user)) return json(response, 403, { error: "娌℃湁搴旂敤绠＄悊鏉冮檺" });
    const agentId = agentVersionsMatch[1];
    const versions = db().agentVersions
      .filter(item => item.agentId === agentId)
      .sort((a, b) => b.version - a.version);
    return json(response, 200, { versions });
  }

  const agentVersionDiffMatch = pathname.match(/^\/api\/admin\/agents\/([a-zA-Z0-9_-]+)\/versions\/diff$/);
  if (agentVersionDiffMatch && request.method === "GET") {
    if (!canManage(user)) return json(response, 403, { error: "No agent version diff permission" });
    const url = new URL(request.url, requestOrigin(request));
    const diff = buildAgentVersionDiff(
      agentVersionDiffMatch[1],
      Number(url.searchParams.get("from") || 0),
      Number(url.searchParams.get("to") || 0)
    );
    if (!diff) return json(response, 404, { error: "Agent versions not found" });
    return json(response, 200, { diff });
  }

  const agentRestoreMatch = pathname.match(/^\/api\/admin\/agents\/([a-zA-Z0-9_-]+)\/versions\/([0-9]+)\/restore$/);
  if (agentRestoreMatch && request.method === "POST") {
    if (!canManage(user)) return json(response, 403, { error: "娌℃湁搴旂敤绠＄悊鏉冮檺" });
    const agentId = agentRestoreMatch[1];
    const version = Number(agentRestoreMatch[2]);
    const snapshot = db().agentVersions.find(item => item.agentId === agentId && item.version === version)?.snapshot;
    if (!snapshot) return json(response, 404, { error: "鏅鸿兘浣撶増鏈笉瀛樺湪" });
    const agent = invalidateAgentTest(normalizeAgent(snapshot, agentId), "restored version");
    const validation = validateAgentForStatus(agent);
    if (validation) return json(response, 400, { error: validation });
    const publishError = validateAgentPublishGate(null, agent);
    if (publishError) return json(response, 400, { error: publishError });
    mutate(store => {
      const exists = store.agents.some(item => item.id === agentId);
      store.agents = exists
        ? store.agents.map(item => item.id === agentId ? agent : item)
        : [agent, ...store.agents];
      recordAgentVersion(store, agent, user, `restore:v${version}`);
    });
    audit(user, "agent.restore", agent.id, { version });
    await flush();
    return json(response, 200, { agent });
  }

  const agentDuplicateMatch = pathname.match(/^\/api\/admin\/agents\/([a-zA-Z0-9_-]+)\/duplicate$/);
  if (agentDuplicateMatch && request.method === "POST") {
    if (!canManage(user)) return json(response, 403, { error: "No agent duplicate permission" });
    const existing = db().agents.find(item => item.id === agentDuplicateMatch[1]);
    if (!existing) return json(response, 404, { error: "Agent not found" });
    const body = await readJson(request);
    const requestedId = safeId(body.id) ? body.id : uniqueAgentId(`${existing.id}-copy`);
    if (db().agents.some(item => item.id === requestedId)) return json(response, 409, { error: "Agent ID already exists" });
    const agent = normalizeAgent({
      ...existing,
      ...body,
      name: body.name || `${existing.name}副本`,
      status: "draft",
      featured: false,
      lastTestAt: "",
      lastTestStatus: "untested",
      lastTestMessage: "",
      lastTestDurationMs: 0
    }, requestedId);
    const validation = validateAgentForStatus(agent);
    if (validation) return json(response, 400, { error: validation });
    mutate(store => {
      store.agents.unshift(agent);
      recordAgentVersion(store, agent, user, `duplicate:${existing.id}`);
    });
    audit(user, "agent.duplicate", agent.id, { sourceId: existing.id, routeHint: agent.routeHint, mode: agent.mode });
    await flush();
    return json(response, 201, { agent });
  }

  if (agentMatch && request.method === "PUT") {
    if (!canManage(user)) return json(response, 403, { error: "娌℃湁搴旂敤绠＄悊鏉冮檺" });
    const existing = db().agents.find(item => item.id === agentMatch[1]);
    if (!existing) return json(response, 404, { error: "鏅鸿兘浣撲笉瀛樺湪" });
    const agent = invalidateAgentTestIfChanged(existing, normalizeAgent({ ...existing, ...(await readJson(request)) }, existing.id), "configuration changed");
    const validation = validateAgentForStatus(agent);
    if (validation) return json(response, 400, { error: validation });
    const publishError = validateAgentPublishGate(existing, agent);
    if (publishError) return json(response, 400, { error: publishError });
    mutate(store => {
      store.agents = store.agents.map(item => item.id === existing.id ? agent : item);
      recordAgentVersion(store, agent, user, existing.status === agent.status ? "update" : `status:${agent.status}`);
    });
    audit(user, "agent.update", agent.id, { from: existing.status, to: agent.status });
    await flush();
    return json(response, 200, { agent });
  }

  if (agentMatch && request.method === "DELETE") {
    if (!canManage(user)) return json(response, 403, { error: "娌℃湁搴旂敤绠＄悊鏉冮檺" });
    mutate(store => {
      store.agents = store.agents.filter(item => item.id !== agentMatch[1]);
    });
    audit(user, "agent.delete", agentMatch[1]);
    await flush();
    return json(response, 200, { ok: true });
  }

  json(response, 404, { error: "API not found" });
}

async function handleChat(request, response, user) {
  const body = await readJson(request, 2 * 1024 * 1024);
  return executeChat(response, user, body);
}

async function runWorkflow(request, response, user, workflowId) {
  const configuredWorkflow = db().workflows.find(item => item.id === workflowId);
  const workflow = configuredWorkflow
    ? (configuredWorkflow.status === "offline" ? null : configuredWorkflow)
    : workflowById(workflowId);
  if (!workflow) return json(response, 404, { error: "鏁欏宸ヤ綔娴佷笉瀛樺湪" });
  const body = await readJson(request, 2 * 1024 * 1024);
  const message = buildWorkflowMessage(workflow, body);
  if (!message.trim()) return json(response, 400, { error: "Workflow message is required" });
  const result = await executeChat(response, user, {
    ...body,
    message,
    routeHint: workflow.routeHint,
    workflowId: workflow.id,
    workflowTitle: workflow.title,
    systemPrompt: workflow.systemPrompt
  });
  return result;
}

async function testWorkflow(response, user, workflowId, body = {}) {
  const workflow = db().workflows.find(item => item.id === workflowId) || workflowById(workflowId);
  if (!workflow) return json(response, 404, { error: "Workflow not found" });
  const message = buildWorkflowMessage(workflow, {
    ...body,
    prompt: String(body.prompt || body.message || `请测试“${workflow.title}”工作流，输出一段简短、可用于确认路由和提示词是否生效的结果。`)
  });
  if (!message.trim()) return json(response, 400, { error: "Workflow test message is required" });
  return executeChat(response, user, {
    ...body,
    message,
    routeHint: workflow.routeHint,
    workflowId: workflow.id,
    workflowTitle: workflow.title,
    systemPrompt: workflow.systemPrompt,
    skipConversation: true,
    testRun: true
  });
}

async function executeChat(response, user, body) {
  const message = String(body.message || "").trim();
  if (!message) return json(response, 400, { error: "娑堟伅涓嶈兘涓虹┖" });
  const attachments = Array.isArray(body.attachments) ? body.attachments : [];
  const agent = body.agentOverride || (body.agentId ? db().agents.find(item => item.id === body.agentId && item.status === "published") : null);
  if (body.agentId && !agent) return json(response, 404, { error: "Agent not found or not available" });
  const workflow = body.workflowId ? db().workflows.find(item => item.id === body.workflowId) || workflowById(body.workflowId) : null;
  const skipConversation = Boolean(body.skipConversation);
  const route = agent?.routeHint
    ? routeById(agent.routeHint) || chooseRoute(message, attachments, body.routeHint)
    : routeById(body.routeHint) || chooseRoute(message, attachments, body.routeHint);
  let conversation = db().conversations.find(item => item.id === body.conversationId && item.userId === user.id);
  const history = (conversation?.messages || []).slice(-12).map(item => ({ role: item.role, content: item.content }));
  const system = {
    role: "system",
    content: body.systemPrompt || agent?.systemPrompt || "You are the education assistant for the platform. Give accurate, actionable answers for real teaching scenarios and do not invent school facts or policies."
  };
  const messages = [system, ...history, { role: "user", content: message }];
  const estimatedInput = messages.reduce((sum, item) => sum + estimateUsage(item.content), 0);
  const configuredMaxOutput = Number(process.env.MODEL_MAX_OUTPUT_TOKENS || 8192);
  const defaultMaxOutput = Number.isFinite(configuredMaxOutput) ? Math.max(1, configuredMaxOutput) : 8192;
  const reservation = route.domestic && !body.testRun ? reserveQuota(user.id, estimatedInput, defaultMaxOutput) : null;
  if (reservation?.error) return json(response, 402, { error: reservation.error, route });
  const maxOutputTokens = reservation
    ? Math.max(1, reservation.amount - estimatedInput)
    : defaultMaxOutput;
  if (reservation) await flush();
  const modelRunStartedAt = Date.now();

  if (!conversation) {
    conversation = {
      id: safeId(body.conversationId) ? body.conversationId : `conv-${randomUUID()}`,
      userId: user.id,
      title: workflow ? `${workflow.title}锛?{message.slice(0, 36)}` : agent ? `${agent.name}锛?{message.slice(0, 40)}` : message.slice(0, 80),
      messages: [],
      agentId: agent?.id || "",
      workflowId: workflow?.id || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!skipConversation) mutate(store => store.conversations.push(conversation));
  }

  try {
    const result = await callModelWithFallback(
      route,
      messages,
      { maxOutputTokens }
    );
    const actualRoute = result.route || route;
    const inputTokens = result.usage.inputTokens || estimateUsage(message);
    const outputTokens = result.usage.outputTokens || estimateUsage(result.answer);
    const charged = reservation && actualRoute.domestic
      ? Math.min(reservation.amount, inputTokens + outputTokens)
      : 0;
    const artifact = workflow && !body.testRun ? await createArtifactAsset(user, workflow, message, result.answer) : null;
    mutate(store => {
      if (reservation) {
        store.tokenReservations = store.tokenReservations.filter(item => item.id !== reservation.id);
      }
      conversation.messages.push(
        { id: randomUUID(), role: "user", content: message, createdAt: new Date().toISOString() },
        { id: randomUUID(), role: "assistant", content: result.answer, route: actualRoute, model: result.model, usage: { inputTokens, outputTokens }, createdAt: new Date().toISOString() }
      );
      conversation.updatedAt = new Date().toISOString();
      if (charged) {
        store.tokenLedger.push({
          id: randomUUID(),
          userId: user.id,
          grantId: reservation.grantId,
          amount: -charged,
          description: `AI 鏁欒偛鍔╂墜锛?{actualRoute.reason}`,
          agentId: agent?.id || "",
          workflowId: workflow?.id || "",
          model: actualRoute.name,
          createdAt: new Date().toISOString()
        });
      }
      if (agent) {
        store.auditLogs.push({
          id: randomUUID(),
          actorId: user.id,
          action: body.testRun ? "agent.test" : "agent.run",
          targetId: agent.id,
          meta: { route: actualRoute.id, model: result.model, charged, fallbackUsed: Boolean(result.fallbackUsed), attempts: result.attempts || [] },
          at: new Date().toISOString()
        });
      }
      if (workflow) {
        if (body.testRun) {
          store.workflows = store.workflows.map(item => item.id === workflow.id ? {
            ...item,
            lastTestAt: new Date().toISOString(),
            lastTestStatus: "passed",
            lastTestMessage: `Route ${actualRoute.id} responded with ${result.model || "configured model"}`,
            lastTestDurationMs: Date.now() - modelRunStartedAt,
            updatedAt: new Date().toISOString()
          } : item);
        }
        store.auditLogs.push({
          id: randomUUID(),
          actorId: user.id,
          action: body.testRun ? "workflow.test" : "workflow.run",
          targetId: workflow.id,
          meta: { route: actualRoute.id, model: result.model, charged, fallbackUsed: Boolean(result.fallbackUsed), attempts: result.attempts || [] },
          at: new Date().toISOString()
        });
      }
      if (artifact) store.artifacts.push(artifact.record);
      recordModelRun(store, {
        user,
        status: "success",
        requestedRoute: route,
        actualRoute,
        result,
        inputTokens,
        outputTokens,
        charged,
        startedAt: modelRunStartedAt,
        agent,
        workflow,
        testRun: Boolean(body.testRun)
      });
    });
    await flush();
    return json(response, 200, {
      answer: result.answer,
      agent: agent ? { id: agent.id, name: agent.name } : null,
      workflow: workflow ? { id: workflow.id, title: workflow.title, artifactType: workflow.artifactType } : null,
      artifact: artifact?.publicArtifact || null,
      route: { provider: actualRoute.id, name: actualRoute.name, reason: actualRoute.reason, domestic: actualRoute.domestic, fallbackUsed: result.fallbackUsed, attempts: result.attempts || [] },
      model: result.model,
      usage: { inputTokens, outputTokens, chargedTokens: charged },
      quota: quotaForUser(user.id),
      testRun: Boolean(body.testRun)
    });
  } catch (error) {
    if (reservation) {
      releaseReservation(reservation.id);
      await flush();
    }
    mutate(store => {
      if (workflow && body.testRun) {
        store.workflows = store.workflows.map(item => item.id === workflow.id ? {
          ...item,
          lastTestAt: new Date().toISOString(),
          lastTestStatus: "failed",
          lastTestMessage: String(error.message || "Workflow test failed").slice(0, 160),
          lastTestDurationMs: Date.now() - modelRunStartedAt,
          updatedAt: new Date().toISOString()
        } : item);
        store.auditLogs.push({
          id: randomUUID(),
          actorId: user.id,
          action: "workflow.test",
          targetId: workflow.id,
          meta: { route: route.id, ok: false, error: String(error.message || "Workflow test failed").slice(0, 160), attempts: error.attempts || [] },
          at: new Date().toISOString()
        });
      }
      recordModelRun(store, {
        user,
        status: "failed",
        requestedRoute: route,
        actualRoute: route,
        result: { model: "", attempts: error.attempts || [], fallbackUsed: false },
        inputTokens: estimatedInput,
        outputTokens: 0,
        charged: 0,
        startedAt: modelRunStartedAt,
        agent,
        workflow,
        testRun: Boolean(body.testRun),
        error: error.message
      });
    });
    await flush();
    error.route = route;
    throw error;
  }
}

async function createArtifactAsset(user, workflow, prompt, answer) {
  const id = `artifact-${randomUUID()}`;
  const baseArtifact = workflowArtifact(workflow, prompt);
  const html = renderArtifactDocument(baseArtifact, workflow, answer);
  const isZip = workflow.artifactType === "html-animation";
  const fileName = `${id}.${isZip ? "zip" : "html"}`;
  const contentType = isZip ? "application/zip" : "text/html; charset=utf-8";
  const fileBody = isZip ? buildZipArtifact({
    "index.html": html,
    "model-output.txt": answer,
    "README.txt": [
      "Centennial Xiaozhuang Smart Education Platform",
      `${workflow.title} artifact package`,
      "",
      "Open index.html to preview the classroom web animation.",
      "model-output.txt keeps the original model output for editing.",
      ""
    ].join("\\n")
  }) : html;
  await writeFile(path.join(artifactDir, fileName), fileBody);
  const now = new Date().toISOString();
  const publicArtifact = {
    ...baseArtifact,
    id,
    downloadUrl: `/api/artifacts/${id}/download`,
    downloadType: isZip ? "zip" : "html",
    createdAt: now
  };
  return {
    publicArtifact,
    record: {
      id,
      userId: user.id,
      workflowId: workflow.id,
      title: baseArtifact.title,
      type: baseArtifact.type,
      fileName,
      contentType,
      createdAt: now
    }
  };
}

async function testAgentConnection(response, user, agent) {
  const target = agent.mode === "api" ? agent.apiUrl : agent.url;
  if (!/^https?:\/\//i.test(target || "")) return json(response, 400, { error: "Agent connection URL is missing or invalid" });
  const startedAt = Date.now();
  try {
    let probe;
    if (agent.mode === "api") {
      probe = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Xiaozhuang-Agent-Test": "true" },
        body: JSON.stringify({ message: "ping", agentId: agent.id, providerAlias: agent.providerAlias || "", testRun: true }),
        signal: AbortSignal.timeout(5000)
      });
    } else {
      probe = await fetch(target, { method: "HEAD", signal: AbortSignal.timeout(5000) });
      if (probe.status === 405 || probe.status === 403) {
        probe = await fetch(target, { method: "GET", signal: AbortSignal.timeout(5000) });
      }
    }
    const ok = probe.status >= 200 && probe.status < 400;
    const testMeta = {
      status: ok ? "passed" : "failed",
      message: ok ? `HTTP ${probe.status}` : `HTTP ${probe.status}`,
      statusCode: probe.status,
      durationMs: Date.now() - startedAt
    };
    updateAgentConnectionTest(agent.id, testMeta);
    audit(user, "agent.connection.test", agent.id, { mode: agent.mode, status: probe.status, ok });
    await flush();
    return json(response, ok ? 200 : 502, {
      ok,
      agent: connectionTestAgent(agent.id),
      status: probe.status,
      contentType: probe.headers.get("content-type") || "",
      durationMs: testMeta.durationMs
    });
  } catch (error) {
    const testMeta = {
      status: "failed",
      message: error.name === "TimeoutError" ? "Connection test timed out" : "Connection test failed",
      statusCode: 0,
      durationMs: Date.now() - startedAt
    };
    updateAgentConnectionTest(agent.id, testMeta);
    audit(user, "agent.connection.test", agent.id, { mode: agent.mode, ok: false, error: error.name || "connection_error" });
    await flush();
    return json(response, 502, {
      ok: false,
      agent: connectionTestAgent(agent.id),
      error: testMeta.message,
      durationMs: testMeta.durationMs
    });
  }
}

function updateAgentConnectionTest(agentId, meta) {
  mutate(store => {
    store.agents = store.agents.map(agent => agent.id === agentId ? {
      ...agent,
      lastTestAt: new Date().toISOString(),
      lastTestStatus: meta.status,
      lastTestMessage: meta.message,
      lastTestDurationMs: meta.durationMs,
      updatedAt: new Date().toISOString().slice(0, 10)
    } : agent);
  });
}

function connectionTestAgent(agentId) {
  const agent = db().agents.find(item => item.id === agentId);
  return agent ? {
    id: agent.id,
    name: agent.name,
    mode: agent.mode,
    lastTestAt: agent.lastTestAt || "",
    lastTestStatus: agent.lastTestStatus || "untested",
    lastTestMessage: agent.lastTestMessage || "",
    lastTestDurationMs: agent.lastTestDurationMs || 0
  } : { id: agentId };
}

function renderArtifactDocument(artifact, workflow, answer) {
  return `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtmlText(artifact.title)}</title>
<style>
body{margin:0;font-family:"Microsoft YaHei",Arial,sans-serif;background:#f7f4ee;color:#20251f}
main{max-width:960px;margin:0 auto;padding:32px}
.brand{color:#9e1f32;font-weight:800;letter-spacing:.08em}
.panel{background:#fff;border:1px solid #e0dbd2;padding:24px;margin-top:18px}
pre{white-space:pre-wrap;line-height:1.7;font-family:inherit}
</style>
<main>
<div class="brand">鐧惧勾鏅撳簞鏅烘収鏁欒偛骞冲彴</div>
<h1>${escapeHtmlText(artifact.title)}</h1>
<p>${escapeHtmlText(workflow.summary || "")}</p>
<section class="panel">${artifact.html}</section>
<section class="panel"><h2>妯″瀷鐢熸垚鍐呭</h2><pre>${escapeHtmlText(answer)}</pre></section>
</main>
</html>`;
}

async function serveArtifact(response, user, artifactId) {
  const artifact = db().artifacts.find(item => item.id === artifactId);
  if (!artifact) return json(response, 404, { error: "Artifact not found" });
  if (artifact.userId !== user.id && !canManage(user)) return json(response, 403, { error: "娌℃湁鎴愭灉鏂囦欢璁块棶鏉冮檺" });
  const fileName = path.basename(artifact.fileName);
  const buffer = await readFile(path.join(artifactDir, fileName));
  response.writeHead(200, {
    "Content-Type": artifact.contentType || "text/html; charset=utf-8",
    "Content-Length": buffer.length,
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`${artifact.title || artifact.id}.${artifact.contentType === "application/zip" ? "zip" : "html"}`)}`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(buffer);
}

async function deleteArtifact(response, user, artifactId) {
  const artifact = db().artifacts.find(item => item.id === artifactId);
  if (!artifact) return json(response, 404, { error: "Artifact not found" });
  if (artifact.userId !== user.id && !canManage(user)) return json(response, 403, { error: "娌℃湁鎴愭灉鏂囦欢绠＄悊鏉冮檺" });
  await deleteArtifactFile(artifact);
  mutate(store => {
    store.artifacts = store.artifacts.filter(item => item.id !== artifactId);
  });
  audit(user, "artifact.delete", artifact.id, {
    ownerId: artifact.userId,
    workflowId: artifact.workflowId,
    type: artifact.type,
    contentType: artifact.contentType || ""
  });
  await flush();
  return json(response, 200, { ok: true, deletedId: artifact.id });
}

async function deleteArtifactFile(artifact) {
  const fileName = path.basename(artifact.fileName || "");
  if (!fileName) return;
  try {
    await unlink(path.join(artifactDir, fileName));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function cleanupArtifacts(request, response, user) {
  const body = await readJson(request).catch(() => ({}));
  const olderThanDays = Number(body.olderThanDays);
  if (!Number.isFinite(olderThanDays) || olderThanDays < 0 || olderThanDays > 3650) {
    return json(response, 400, { error: "olderThanDays must be a number between 0 and 3650" });
  }
  const workflowId = String(body.workflowId || "").trim();
  const type = String(body.type || "").trim();
  const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
  const matches = db().artifacts.filter(item => {
    const createdAt = new Date(item.createdAt || 0).getTime();
    return Number.isFinite(createdAt)
      && createdAt <= cutoff
      && (!workflowId || item.workflowId === workflowId)
      && (!type || item.type === type);
  });
  for (const artifact of matches) await deleteArtifactFile(artifact);
  mutate(store => {
    const ids = new Set(matches.map(item => item.id));
    store.artifacts = store.artifacts.filter(item => !ids.has(item.id));
  });
  audit(user, "artifact.cleanup", "artifacts", {
    count: matches.length,
    olderThanDays,
    workflowId,
    type
  });
  await flush();
  return json(response, 200, {
    ok: true,
    deleted: matches.length,
    criteria: { olderThanDays, workflowId, type }
  });
}

function buildArtifacts(user) {
  const users = new Map(db().users.map(item => [item.id, item]));
  const workflows = new Map(db().workflows.map(item => [item.id, item]));
  return [...db().artifacts]
    .filter(item => canManage(user) || item.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, canManage(user) ? 200 : 80)
    .map(item => {
      const owner = users.get(item.userId);
      const workflow = workflows.get(item.workflowId) || workflowById(item.workflowId);
      return {
        id: item.id,
        title: item.title,
        type: item.type,
        workflowId: item.workflowId,
        workflowTitle: workflow?.title || item.workflowId || "",
        downloadType: item.contentType === "application/zip" ? "zip" : "html",
        downloadUrl: `/api/artifacts/${encodeURIComponent(item.id)}/download`,
        createdAt: item.createdAt,
        userId: canManage(user) ? item.userId : undefined,
        username: canManage(user) ? owner?.username || "" : undefined,
        displayName: canManage(user) ? owner?.displayName || "" : undefined
      };
    });
}

function buildZipArtifact(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const nameBuffer = Buffer.from(name, "utf8");
    const data = Buffer.from(String(content), "utf8");
    const crc = crc32(data);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, nameBuffer, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, nameBuffer);
    offset += localHeader.length + nameBuffer.length + data.length;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(Object.keys(files).length, 8);
  end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, ...centralParts, end]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function serveAlumniProof(response, reviewer, fileId) {
  const application = db().alumniApplications.find(item => item.proofFileId === fileId);
  const upload = db().auditLogs.find(log => log.action === "file.upload" && log.targetId === fileId);
  if (!application || !upload?.meta?.storedName) return json(response, 404, { error: "Proof file not found" });
  const storedName = path.basename(upload.meta.storedName);
  const buffer = await readFile(path.join(uploadDir, storedName));
  audit(reviewer, "alumni.proof.view", application.id, { fileId });
  await flush();
  const fileName = upload.meta.fileName || "proof";
  response.writeHead(200, {
    "Content-Type": upload.meta.contentType || "application/octet-stream",
    "Content-Length": buffer.length,
    "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(buffer);
}

async function submitAlumniApplication(request, response, user) {
  const body = await readJson(request);
  const required = ["name", "graduationYear", "college", "major", "phone", "email", "proofFileId"];
  if (required.some(key => !String(body[key] || "").trim())) return json(response, 400, { error: "Alumni application is incomplete" });
  const ownsProof = db().auditLogs.some(log => log.actorId === user.id && log.action === "file.upload" && log.targetId === body.proofFileId);
  if (!ownsProof) return json(response, 400, { error: "Proof file is missing or not owned by current user" });
  const existingPending = db().alumniApplications.find(item => item.userId === user.id && item.status === "pending");
  if (existingPending) return json(response, 409, { error: "A pending alumni application already exists" });
  const fingerprint = alumniFingerprint(body);
  if (db().tokenGrants.some(grant => grant.alumniFingerprint === fingerprint)) {
    return json(response, 409, { error: "璇ユ牎鍙嬭韩浠藉凡缁忛鍙栬繃璁よ瘉鏉冪泭" });
  }
  const application = {
    id: `alumni-${randomUUID()}`,
    userId: user.id,
    status: "pending",
    name: String(body.name).trim(),
    graduationYear: String(body.graduationYear).trim(),
    college: String(body.college).trim(),
    major: String(body.major).trim(),
    phone: String(body.phone).trim(),
    email: String(body.email).trim(),
    proofFileId: String(body.proofFileId),
    fingerprint,
    associationStatus: "not_configured",
    submittedAt: new Date().toISOString()
  };
  const association = await verifyAlumniAssociation(application);
  mutate(store => {
    store.alumniApplications.push(application);
    if (association?.verified) {
      application.associationStatus = "verified";
      application.associationReference = association.reference || "";
      grantAlumniBenefit(store, application, user.id, "association");
    } else if (association) {
      application.associationStatus = association.status;
      application.associationReference = association.reference || "";
    }
  });
  audit(user, "alumni.submit", application.id, { associationStatus: application.associationStatus });
  if (association) audit(user, "alumni.association.verify", application.id, { status: application.associationStatus, reference: application.associationReference || "" });
  await flush();
  return json(response, 201, { application, quota: quotaForUser(user.id) });
}

async function submitFeedback(request, response, user) {
  const body = await readJson(request, 128 * 1024);
  const type = String(body.type || "").trim().slice(0, 30);
  const content = String(body.content || "").trim().slice(0, 2000);
  const email = String(body.email || "").trim().slice(0, 120);
  if (!type || !content) return json(response, 400, { error: "Feedback type and content are required" });
  const item = {
    id: `feedback-${randomUUID()}`,
    userId: user.id,
    userName: user.displayName || user.username,
    type,
    content,
    email,
    status: "open",
    assignee: "",
    note: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mutate(store => store.feedbackItems.unshift(item));
  audit(user, "feedback.submit", item.id, { type });
  await flush();
  return json(response, 201, { item });
}

async function approveAlumni(response, reviewer, id) {
  const application = db().alumniApplications.find(item => item.id === id);
  if (!application) return json(response, 404, { error: "Application not found" });
  if (application.status === "approved") return json(response, 200, { application, quota: quotaForUser(application.userId) });
  if (db().tokenGrants.some(grant => grant.alumniFingerprint === application.fingerprint)) {
    return json(response, 409, { error: "璇ユ牎鍙嬭韩浠藉凡缁忛鍙栬繃鏉冪泭" });
  }
  mutate(store => {
    grantAlumniBenefit(store, application, reviewer.id, "manual_review");
  });
  audit(reviewer, "alumni.approve", application.id);
  await flush();
  return json(response, 200, { application, quota: quotaForUser(application.userId) });
}

async function rejectAlumni(request, response, reviewer, id) {
  const application = db().alumniApplications.find(item => item.id === id);
  if (!application) return json(response, 404, { error: "Application not found" });
  const body = await readJson(request);
  mutate(() => {
    application.status = "rejected";
    application.rejectionReason = String(body.reason || "Application materials need to be supplemented").slice(0, 300);
    application.rejectedAt = new Date().toISOString();
    application.reviewedBy = reviewer.id;
  });
  audit(reviewer, "alumni.reject", application.id);
  await flush();
  return json(response, 200, { application });
}

function grantAlumniBenefit(store, application, reviewerId, source) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const existingGrant = store.tokenGrants.find(grant => grant.alumniFingerprint === application.fingerprint);
  if (existingGrant) return existingGrant;
  const grant = {
    id: `grant-${randomUUID()}`,
    userId: application.userId,
    alumniFingerprint: application.fingerprint,
    total: 1000000,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString()
  };
  application.status = "approved";
  application.approvedAt = now.toISOString();
  application.reviewedBy = reviewerId;
  application.approvalSource = source;
  store.alumniIdentities.push({
    id: `identity-${randomUUID()}`,
    userId: application.userId,
    source,
    alumniFingerprint: application.fingerprint,
    verifiedAt: now.toISOString()
  });
  store.tokenGrants.push(grant);
  store.tokenLedger.push({
    id: randomUUID(),
    userId: application.userId,
    grantId: grant.id,
    amount: 1000000,
    description: source === "association" ? "Alumni association benefit grant" : "Manual alumni benefit grant",
    model: "鍥戒骇妯″瀷閫氱敤",
    createdAt: now.toISOString()
  });
  return grant;
}

async function verifyAlumniAssociation(application) {
  const url = process.env.ALUMNI_ASSOCIATION_VERIFY_URL;
  if (!url) return null;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.ALUMNI_ASSOCIATION_API_KEY ? { Authorization: `Bearer ${process.env.ALUMNI_ASSOCIATION_API_KEY}` } : {})
      },
      body: JSON.stringify({
        name: application.name,
        graduationYear: application.graduationYear,
        college: application.college,
        major: application.major,
        phone: application.phone,
        email: application.email
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { verified: false, status: "error", reference: data.requestId || data.reference || "" };
    const status = String(data.status || data.result || "").toLowerCase();
    const verified = data.verified === true || data.valid === true || ["verified", "approved", "matched", "valid"].includes(status);
    return {
      verified,
      status: verified ? "verified" : "not_verified",
      reference: String(data.reference || data.requestId || data.alumniId || "").slice(0, 120)
    };
  } catch {
    return { verified: false, status: "error", reference: "" };
  }
}

function quotaForUser(userId) {
  const grant = db().tokenGrants.filter(item => item.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] || null;
  if (!grant) return { grant: null, total: 0, remaining: 0, expiresAt: null, expired: false };
  const spent = db().tokenLedger.filter(item => item.grantId === grant.id && item.amount < 0).reduce((sum, item) => sum - item.amount, 0);
  const expired = new Date(grant.expiresAt) <= new Date();
  const now = Date.now();
  const reserved = db().tokenReservations
    .filter(item => item.grantId === grant.id && new Date(item.expiresAt).getTime() > now)
    .reduce((sum, item) => sum + item.amount, 0);
  return {
    grant,
    total: grant.total,
    remaining: expired ? 0 : Math.max(0, grant.total - spent - reserved),
    reserved,
    expiresAt: grant.expiresAt,
    expired
  };
}

async function adjustTokenGrant(request, response, admin) {
  const body = await readJson(request);
  const userIdOrName = String(body.userId || body.username || "").trim();
  const amount = Number(body.amount);
  const reason = String(body.reason || "").trim().slice(0, 240);
  if (!userIdOrName) return json(response, 400, { error: "Target user is required" });
  if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 1000000) {
    return json(response, 400, { error: "Adjustment amount must be a non-zero integer within 1,000,000 tokens" });
  }
  if (reason.length < 4) return json(response, 400, { error: "Adjustment reason is required" });
  const target = db().users.find(item => item.id === userIdOrName || item.username.toLowerCase() === userIdOrName.toLowerCase());
  if (!target) return json(response, 404, { error: "Target user not found" });
  const quota = quotaForUser(target.id);
  if (!quota.grant || quota.expired) return json(response, 400, { error: "Target user has no active token grant" });
  if (amount < 0 && quota.remaining < Math.abs(amount)) {
    return json(response, 400, { error: "Adjustment would make the remaining quota negative", remaining: quota.remaining });
  }
  const now = new Date().toISOString();
  mutate(store => {
    if (amount > 0) {
      store.tokenGrants = store.tokenGrants.map(grant => grant.id === quota.grant.id ? {
        ...grant,
        total: Number(grant.total || 0) + amount,
        updatedAt: now
      } : grant);
    }
    store.tokenLedger.push({
      id: randomUUID(),
      userId: target.id,
      grantId: quota.grant.id,
      amount,
      description: `Manual token adjustment: ${reason}`,
      model: "国产模型通用",
      createdAt: now,
      adjustedBy: admin.id
    });
  });
  audit(admin, "token.adjust", target.id, { amount, reason, grantId: quota.grant.id });
  await flush();
  return json(response, 200, {
    ok: true,
    user: managedUser(target),
    adjustment: { userId: target.id, amount, reason, grantId: quota.grant.id, createdAt: now },
    quota: quotaForUser(target.id)
  });
}

function buildMetrics(windowDays = 7) {
  const since = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  const logs = db().auditLogs.filter(log => new Date(log.at).getTime() >= since);
  const agentRuns = logs.filter(log => log.action === "agent.run");
  const workflowRuns = logs.filter(log => log.action === "workflow.run");
  const chargedTokens = db().tokenLedger
    .filter(item => item.amount < 0 && new Date(item.createdAt).getTime() >= since)
    .reduce((sum, item) => sum - item.amount, 0);
  const quota = buildQuotaMetrics();
  return {
    windowDays,
    totals: {
      agentRuns: agentRuns.length,
      workflowRuns: workflowRuns.length,
      chargedTokens,
      artifacts: db().artifacts.filter(item => new Date(item.createdAt).getTime() >= since).length,
      activeUsers: new Set(logs.filter(log => ["agent.run", "workflow.run"].includes(log.action)).map(log => log.actorId)).size,
      modelRuns: db().modelRuns.filter(item => new Date(item.createdAt).getTime() >= since).length,
      modelFailures: db().modelRuns.filter(item => item.status === "failed" && new Date(item.createdAt).getTime() >= since).length
    },
    quota,
    topAgents: topTargets(agentRuns, db().agents, "agent"),
    topWorkflows: topTargets(workflowRuns, db().workflows, "workflow"),
    recentRuns: [...agentRuns, ...workflowRuns]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 8)
      .map(log => ({
        id: log.id,
        type: log.action === "agent.run" ? "agent" : "workflow",
        targetId: log.targetId,
        name: nameForRun(log),
        route: log.meta?.route || "",
        charged: log.meta?.charged || 0,
        at: log.at
      }))
  };
}

function buildQuotaMetrics() {
  const now = Date.now();
  const soon = now + 7 * 24 * 60 * 60 * 1000;
  const spentByGrant = new Map();
  const reservedByGrant = new Map();
  for (const entry of db().tokenLedger) {
    if (entry.amount < 0 && entry.grantId) {
      spentByGrant.set(entry.grantId, (spentByGrant.get(entry.grantId) || 0) - Number(entry.amount || 0));
    }
  }
  for (const reservation of db().tokenReservations) {
    if (new Date(reservation.expiresAt).getTime() > now) {
      reservedByGrant.set(reservation.grantId, (reservedByGrant.get(reservation.grantId) || 0) + Number(reservation.amount || 0));
    }
  }
  return db().tokenGrants.reduce((summary, grant) => {
    const expiresAt = new Date(grant.expiresAt).getTime();
    const expired = expiresAt <= now;
    const spent = spentByGrant.get(grant.id) || 0;
    const reserved = reservedByGrant.get(grant.id) || 0;
    const remaining = expired ? 0 : Math.max(0, Number(grant.total || 0) - spent - reserved);
    summary.totalGrants += 1;
    summary.totalTokens += Number(grant.total || 0);
    summary.remainingTokens += remaining;
    summary.reservedTokens += expired ? 0 : reserved;
    if (expired) summary.expiredGrants += 1;
    else {
      summary.activeGrants += 1;
      if (expiresAt <= soon) summary.expiringSoon += 1;
    }
    return summary;
  }, {
    totalGrants: 0,
    activeGrants: 0,
    expiredGrants: 0,
    expiringSoon: 0,
    totalTokens: 0,
    remainingTokens: 0,
    reservedTokens: 0
  });
}

function metricsWindowDays(request) {
  const value = Number(new URL(request.url, `http://${request.headers.host || "localhost"}`).searchParams.get("days") || 7);
  return [7, 30, 90].includes(value) ? value : 7;
}

function recordModelRun(store, details) {
  const now = new Date().toISOString();
  const attempts = Array.isArray(details.result?.attempts)
    ? details.result.attempts.map(item => ({
      id: String(item.id || "").slice(0, 40),
      ok: Boolean(item.ok),
      error: sanitizeRunError(item.error).slice(0, 120)
    }))
    : [];
  store.modelRuns = [
    {
      id: `model-run-${randomUUID()}`,
      userId: details.user?.id || "anonymous",
      source: details.source || (details.workflow ? "workflow" : details.agent ? "agent" : "chat"),
      status: details.status,
      requestedRoute: details.requestedRoute?.id || "",
      actualRoute: details.actualRoute?.id || "",
      routeName: details.actualRoute?.name || details.requestedRoute?.name || "",
      model: String(details.result?.model || "").slice(0, 120),
      fallbackUsed: Boolean(details.result?.fallbackUsed),
      attempts,
      inputTokens: Number(details.inputTokens || 0),
      outputTokens: Number(details.outputTokens || 0),
      chargedTokens: Number(details.charged || 0),
      durationMs: Math.max(0, Date.now() - Number(details.startedAt || Date.now())),
      agentId: details.agent?.id || "",
      workflowId: details.workflow?.id || "",
      testRun: Boolean(details.testRun),
      error: sanitizeRunError(details.error).slice(0, 180),
      createdAt: now
    },
    ...(store.modelRuns || [])
  ].slice(0, 2000);
}

function sanitizeRunError(value = "") {
  return String(value)
    .replace(/(sk-[a-zA-Z0-9_-]{8,})/g, "[redacted]")
    .replace(/(api[_-]?key|token|secret|authorization)\s*[:=]\s*[^,\s}]+/gi, "$1=[redacted]");
}

function buildModelRuns(viewer) {
  const users = new Map(db().users.map(user => [user.id, user]));
  const agents = new Map(db().agents.map(agent => [agent.id, agent]));
  const workflows = new Map(db().workflows.map(workflow => [workflow.id, workflow]));
  return [...(db().modelRuns || [])]
    .slice(0, 100)
    .filter(run => canManage(viewer) || run.userId === viewer.id)
    .map(run => {
      const userRecord = users.get(run.userId);
      return {
        ...run,
        username: userRecord?.username || "",
        displayName: userRecord?.displayName || "",
        agentName: agents.get(run.agentId)?.name || "",
        workflowTitle: workflows.get(run.workflowId)?.title || "",
        attempts: (run.attempts || []).map(item => ({ id: item.id, ok: item.ok, error: item.error ? "failed" : "" }))
      };
    });
}

function buildModelRunsCsv() {
  const rows = [[
    "createdAt",
    "status",
    "source",
    "userId",
    "username",
    "displayName",
    "requestedRoute",
    "actualRoute",
    "routeName",
    "model",
    "fallbackUsed",
    "attempts",
    "inputTokens",
    "outputTokens",
    "chargedTokens",
    "durationMs",
    "agentId",
    "agentName",
    "workflowId",
    "workflowTitle",
    "testRun",
    "error"
  ]];
  const users = new Map(db().users.map(user => [user.id, user]));
  const agents = new Map(db().agents.map(agent => [agent.id, agent]));
  const workflows = new Map(db().workflows.map(workflow => [workflow.id, workflow]));
  for (const run of [...(db().modelRuns || [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const userRecord = users.get(run.userId);
    rows.push([
      run.createdAt || "",
      run.status || "",
      run.source || "",
      run.userId || "",
      userRecord?.username || "",
      userRecord?.displayName || "",
      run.requestedRoute || "",
      run.actualRoute || "",
      run.routeName || "",
      run.model || "",
      run.fallbackUsed ? "yes" : "no",
      JSON.stringify(run.attempts || []),
      run.inputTokens || 0,
      run.outputTokens || 0,
      run.chargedTokens || 0,
      run.durationMs || 0,
      run.agentId || "",
      agents.get(run.agentId)?.name || "",
      run.workflowId || "",
      workflows.get(run.workflowId)?.title || "",
      run.testRun ? "yes" : "no",
      run.error || ""
    ]);
  }
  return `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
}

function buildProviderStatusCsv() {
  const rows = [[
    "id",
    "name",
    "domestic",
    "type",
    "configured",
    "model",
    "envNames",
    "missingEnv",
    "hasDefaultUrl",
    "hasDefaultModel",
    "fallbackRoutes"
  ]];
  for (const provider of providerStatuses().sort((a, b) => a.id.localeCompare(b.id))) {
    const route = routeById(provider.id);
    rows.push([
      provider.id,
      route?.name || provider.id,
      route?.domestic === false ? "no" : "yes",
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
  return `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
}

function buildTokenLedgerCsv() {
  const rows = [[
    "createdAt",
    "userId",
    "username",
    "displayName",
    "amount",
    "type",
    "model",
    "agentId",
    "agentName",
    "workflowId",
    "workflowTitle",
    "grantId",
    "description"
  ]];
  const users = new Map(db().users.map(user => [user.id, user]));
  const agents = new Map(db().agents.map(agent => [agent.id, agent]));
  const workflows = new Map(db().workflows.map(workflow => [workflow.id, workflow]));
  for (const entry of [...db().tokenLedger].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const userRecord = users.get(entry.userId);
    const agent = agents.get(entry.agentId);
    const workflow = workflows.get(entry.workflowId);
    rows.push([
      entry.createdAt || "",
      entry.userId || "",
      userRecord?.username || "",
      userRecord?.displayName || "",
      entry.amount || 0,
      Number(entry.amount || 0) >= 0 ? "grant" : "charge",
      entry.model || "",
      entry.agentId || "",
      agent?.name || "",
      entry.workflowId || "",
      workflow?.title || "",
      entry.grantId || "",
      entry.description || ""
    ]);
  }
  return `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
}

function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

async function buildReadiness() {
  const checks = [];
  const add = (level, group, name, detail, owner = readinessOwner(group, name)) => checks.push({ level, group, owner, name, detail });
  const hasEnv = name => Boolean(process.env[name]);
  const demo = isDemoMode();
  const requiredEnv = (name, label) => add(hasEnv(name) ? "ok" : "fail", "models", label, hasEnv(name) ? "configured" : `${name} missing`);
  const recommendedEnv = (name, label) => add(hasEnv(name) ? "ok" : "warn", "models", label, hasEnv(name) ? "configured" : `${name} not configured`);

  add(demo ? "ok" : "warn", "runtime", "Demo acceptance mode", demo ? "DEMO_MODE=true: production-only external dependencies are not demo blockers" : "DEMO_MODE is off; production launch gates remain strict");
  add(process.env.NODE_ENV === "production" ? "ok" : "warn", "runtime", "NODE_ENV", process.env.NODE_ENV || "not set");
  add(process.env.DEV_ADMIN_PASSWORD && !["xz2026", "change-me"].includes(process.env.DEV_ADMIN_PASSWORD) ? "ok" : "fail", "security", "Admin password", "Set DEV_ADMIN_PASSWORD to a strong value");
  add(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32 && !["change-me", "change-me-random-32-plus-character-secret", "development-session-secret"].includes(process.env.SESSION_SECRET) ? "ok" : "fail", "security", "Session secret", "Set SESSION_SECRET to a random value of at least 32 characters");
  add(await pathExists(".env") ? "ok" : "warn", "runtime", ".env", "Local environment file");

  requiredEnv("DEEPSEEK_API_KEY", "DeepSeek lesson plans");
  requiredEnv("MOONSHOT_API_KEY", "Kimi long context");
  requiredEnv("OPENAI_API_KEY", "ChatGPT PPT and HTML");
  requiredEnv("COZE_API_KEY", "Coze web animation");
  requiredEnv("COZE_API_URL", "Coze workflow endpoint");
  requiredEnv("COZE_WORKFLOW_ID", "Coze workflow id");
  requiredEnv("GEMINI_API_KEY", "Gemini image understanding");
  recommendedEnv("QWEN_API_KEY", "Qwen Chinese tasks");
  recommendedEnv("DOUBAO_API_KEY", "Doubao fallback");
  recommendedEnv("GLM_API_KEY", "GLM knowledge tasks");
  recommendedEnv("ERNIE_API_KEY", "Ernie policy tasks");
  recommendedEnv("HUNYUAN_API_KEY", "Hunyuan service fallback");
  recommendedEnv("ALUMNI_ASSOCIATION_VERIFY_URL", "Alumni association verification");
  const ssoEnabled = ["1", "true", "yes"].includes(String(process.env.SSO_ENABLED || "").toLowerCase());
  const missingSso = ["SSO_AUTHORIZATION_URL", "SSO_TOKEN_URL", "SSO_USERINFO_URL", "SSO_CLIENT_ID", "SSO_CLIENT_SECRET"].filter(name => !process.env[name]);
  add(ssoEnabled ? (missingSso.length ? "fail" : "ok") : "warn", "security", "School SSO", ssoEnabled ? (missingSso.length ? `${missingSso.join(", ")} missing` : "OIDC login configured") : "Local platform accounts are active; enable SSO when school IdP details are ready");

  const branding = publicBranding(db().branding);
  add(branding.assetStatus === "official" ? "ok" : "fail", "assets", "Branding authorization", branding.assetStatus === "official" ? "Official assets confirmed in admin settings" : "Mark branding assets as official after school approval");

  if (/^https:\/\//i.test(branding.logoUrl || "")) {
    add(branding.assetStatus === "official" ? "ok" : "warn", "assets", "Official school mark", "External HTTPS logo configured");
  } else if (await pathExists(branding.logoUrl || "assets/njxzc-seal.png")) {
    const mark = await readFile(path.join(root, branding.logoUrl || "assets/njxzc-seal.png"), "utf8").catch(() => "");
    const looksPlaceholder = mark.length < 2000 && mark.includes("<text") && mark.includes("1927");
    add(looksPlaceholder ? "fail" : "ok", "assets", "Official school mark", looksPlaceholder ? "Replace placeholder with official SVG or PNG" : "Asset appears replaced");
  } else {
    add("fail", "assets", "Official school mark", `${branding.logoUrl || "assets/njxzc-seal.png"} missing`);
  }

  if (/^https:\/\//i.test(branding.heroImageUrl || "")) {
    add(branding.assetStatus === "official" ? "ok" : "warn", "assets", "Authorized hero image", "External HTTPS hero image configured");
  } else if (await pathExists(branding.heroImageUrl || "assets/xiaozhuang-century.png")) {
    const info = await stat(path.join(root, branding.heroImageUrl || "assets/xiaozhuang-century.png"));
    add(info.size > 100_000 ? "warn" : "fail", "assets", "Authorized hero image", "Replace concept art with school-authorized photography before production");
  } else {
    add("fail", "assets", "Authorized hero image", `${branding.heroImageUrl || "assets/xiaozhuang-century.png"} missing`);
  }

  const agents = db().agents;
  const publishedAgents = agents.filter(agent => agent.status === "published");
  const draftAgents = agents.filter(agent => agent.status === "draft");
  const invalidAgents = agents.map(agent => ({ agent, error: validateAgentForStatus(agent) })).filter(item => item.error);
  const missingProductionPrompt = agents.filter(agent => agent.mode === "local" && String(agent.systemPrompt || "").length < 40);
  const incompleteExternal = agents.filter(agent =>
    (agent.mode === "external" || agent.mode === "embed") && !/^https?:\/\//i.test(agent.url || "")
  );
  const incompleteApi = agents.filter(agent => agent.mode === "api" && !/^https?:\/\//i.test(agent.apiUrl || ""));
  const connectedAgents = agents.filter(agent => ["external", "embed", "api"].includes(agent.mode));
  const untestedConnections = connectedAgents.filter(agent => agent.lastTestStatus !== "passed");
  const agentQualityGaps = agents
    .map(agent => ({ agent, issues: agentQualityIssues(agent) }))
    .filter(item => item.issues.length);
  const cozeLinkPlaceholders = agents.filter(agent => /\/xiaozhuang-century-[0-9]{3}$/i.test(agent.cozeUrl || ""));
  const missingCozeLinks = agents.filter(agent => !agent.cozeUrl);
  const agentVersionedIds = new Set(db().agentVersions.map(version => version.agentId));
  add(agents.length === 100 ? "ok" : "fail", "catalog", "Agent catalog size", `${agents.length}/100 agents`);
  add(agents.every(agent => agent.logoText || agent.logoImage) ? "ok" : "fail", "catalog", "Agent logos", "Every agent needs logoText or logoImage");
  add(publishedAgents.length >= 80 ? "ok" : "warn", "catalog", "Published agents", `${publishedAgents.length} published, ${draftAgents.length} drafts`);
  add(invalidAgents.length ? "fail" : "ok", "catalog", "Agent publish validation", invalidAgents.length ? `${invalidAgents.length} agents need fixes` : "All agents pass status validation");
  add(missingProductionPrompt.length ? "warn" : "ok", "catalog", "Agent system prompts", missingProductionPrompt.length ? `${missingProductionPrompt.length} local agents have short prompts` : "Production prompts present");
  add(incompleteExternal.length + incompleteApi.length ? "warn" : "ok", "catalog", "External/API agent connections", `${incompleteExternal.length} external/embed and ${incompleteApi.length} API entries need URLs`);
  add(untestedConnections.length ? "warn" : "ok", "catalog", "External/API connection tests", untestedConnections.length ? `${untestedConnections.length}/${connectedAgents.length} connected agents need passing tests` : "All connected agents have passing tests");
  add(agentQualityGaps.length ? "warn" : "ok", "catalog", "Agent quality governance", agentQualityGaps.length ? `${agentQualityGaps.length}/${agents.length} agents need quality fixes` : "All agents meet the quality checklist");
  add(missingCozeLinks.length || cozeLinkPlaceholders.length ? "warn" : "ok", "catalog", "Coze published agent links", missingCozeLinks.length || cozeLinkPlaceholders.length ? `${missingCozeLinks.length} missing and ${cozeLinkPlaceholders.length} placeholder Coze links` : "All agents have production Coze published-page links");
  add(agentVersionedIds.size ? "ok" : "warn", "catalog", "Agent version governance", agentVersionedIds.size ? `${agentVersionedIds.size} agents have version history and diff review enabled` : "No edited agents have version history yet; edit or import through admin to create recoverable versions");

  const workflows = db().workflows;
  const publishedWorkflows = workflows.filter(workflow => workflow.status !== "offline");
  const invalidWorkflows = workflows.map(workflow => ({ workflow, error: validateWorkflow(workflow) })).filter(item => item.error);
  const untestedWorkflows = publishedWorkflows.filter(workflow => workflow.lastTestStatus !== "passed");
  const workflowQualityGaps = workflows
    .map(workflow => ({ workflow, issues: workflowQualityIssues(workflow) }))
    .filter(item => item.issues.length);
  const workflowVersionedIds = new Set(db().workflowVersions.map(version => version.workflowId));
  add(workflows.length >= 6 ? "ok" : "fail", "workflow", "Teaching workflows", `${workflows.length} configured`);
  add(publishedWorkflows.length >= 6 ? "ok" : "warn", "workflow", "Published workflows", `${publishedWorkflows.length} active`);
  add(invalidWorkflows.length ? "fail" : "ok", "workflow", "Workflow validation", invalidWorkflows.length ? `${invalidWorkflows.length} workflows need fixes` : "All workflows pass validation");
  add(workflows.every(workflow => routeById(workflow.routeHint)) ? "ok" : "fail", "workflow", "Workflow model routes", "Route hints resolve to configured model metadata");
  add(untestedWorkflows.length ? "warn" : "ok", "workflow", "Workflow route tests", untestedWorkflows.length ? `${untestedWorkflows.length}/${publishedWorkflows.length} published workflows need passing tests` : "All published workflows have passing tests");
  add(workflowQualityGaps.length ? "warn" : "ok", "workflow", "Workflow quality governance", workflowQualityGaps.length ? `${workflowQualityGaps.length}/${workflows.length} workflows need quality fixes` : "All workflows meet the quality checklist");
  add(workflowVersionedIds.size ? "ok" : "warn", "workflow", "Workflow version governance", workflowVersionedIds.size ? `${workflowVersionedIds.size} workflows have version history and diff review enabled` : "No edited workflows have version history yet; edit or import through admin to create recoverable versions");

  add(await pathExists("pages-dist/index.html") ? "ok" : "warn", "deployment", "GitHub Pages artifact", "Run build:pages before static deployment");
  add(await pathExists("Dockerfile") && await pathExists("compose.yml") ? "ok" : "fail", "deployment", "Container deployment", "Dockerfile and compose.yml");
  const latestBackupAt = latestAuditAt("platform.backup");
  const latestMaintenanceAt = latestAuditAt("platform.maintenance");
  add(cadenceLevel(latestBackupAt, 7), "operations", "Backup cadence", latestBackupAt ? `Last platform backup ${latestBackupAt}; weekly target` : "No platform backup audit record; export a backup before launch");
  add(cadenceLevel(latestMaintenanceAt, 7), "operations", "Maintenance cadence", latestMaintenanceAt ? `Last platform maintenance ${latestMaintenanceAt}; weekly target` : "No platform maintenance audit record; run maintenance before launch");

  const summary = {
    ok: checks.filter(item => item.level === "ok").length,
    warn: checks.filter(item => item.level === "warn").length,
    fail: checks.filter(item => item.level === "fail").length
  };
  return { generatedAt: new Date().toISOString(), summary, checks };
}

function latestAuditAt(action) {
  return db().auditLogs
    .filter(log => log.action === action && !Number.isNaN(new Date(log.at).getTime()))
    .sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime())[0]?.at || "";
}

function cadenceLevel(timestamp, maxAgeDays) {
  if (!timestamp) return "warn";
  const ageMs = Date.now() - new Date(timestamp).getTime();
  return ageMs <= maxAgeDays * 24 * 60 * 60 * 1000 ? "ok" : "warn";
}

function readinessOwner(group, name) {
  if (group === "models") {
    if (/Coze/i.test(name)) return "工作流平台负责人";
    if (/ChatGPT|Gemini/i.test(name)) return "国际模型服务负责人";
    return "国产模型服务负责人";
  }
  if (group === "security") return name === "School SSO" ? "学校统一身份认证管理员" : "平台安全管理员";
  if (group === "assets") return "品牌与宣传素材负责人";
  if (group === "catalog") return "智能体应用管理员";
  if (group === "workflow") return "教学工作流管理员";
  if (group === "operations") return "云平台运维负责人";
  if (group === "deployment" || group === "runtime") return "云平台运维负责人";
  return "平台项目负责人";
}

async function buildHealth() {
  const directoryChecks = await Promise.all([
    healthPath("data", dataDir),
    healthPath("uploads", uploadDir),
    healthPath("artifacts", artifactDir)
  ]);
  const providers = providerStatuses();
  const configuredProviders = providers.filter(provider => provider.configured).length;
  const demo = isDemoMode();
  const agents = db().agents;
  const workflows = db().workflows;
  const checks = [
    ...directoryChecks,
    { name: "agents", ok: agents.length >= 100, detail: `${agents.length} configured` },
    { name: "workflows", ok: workflows.length >= teachingWorkflows.length, detail: `${workflows.length} configured` },
    {
      name: "providers",
      ok: demo || configuredProviders > 0,
      detail: demo && configuredProviders === 0 ? `demo mode accepts ${configuredProviders}/${providers.length} configured providers` : `${configuredProviders}/${providers.length} configured`
    }
  ];
  return {
    ok: checks.every(check => check.ok),
    status: checks.every(check => check.ok) ? "ok" : "degraded",
    service: "century-xiaozhuang-ai-education",
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    checks,
    catalog: {
      agents: agents.length,
      publishedAgents: agents.filter(agent => agent.status === "published").length,
      workflows: workflows.length
    },
    providers: {
      total: providers.length,
      configured: configuredProviders
    },
    mode: demo ? "demo" : "production"
  };
}

function isDemoMode() {
  return ["1", "true", "yes"].includes(String(process.env.DEMO_MODE || "").toLowerCase());
}

async function healthPath(name, absolutePath) {
  try {
    await access(absolutePath);
    return { name, ok: true, detail: "accessible" };
  } catch {
    return { name, ok: false, detail: "not accessible" };
  }
}

async function pathExists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function buildAuditLogs(viewer) {
  const canSeeAll = canManage(viewer);
  const allowedForReviewer = new Set(["alumni.submit", "alumni.association.verify", "alumni.approve", "alumni.reject", "alumni.proof.view", "file.upload"]);
  return db().auditLogs
    .filter(log => canSeeAll || allowedForReviewer.has(log.action))
    .filter(log => log.action !== "auth.login")
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 80)
    .map(log => {
      const actor = db().users.find(item => item.id === log.actorId);
      return {
        id: log.id,
        action: log.action,
        targetId: log.targetId,
        actor: actor ? managedUser(actor) : { id: log.actorId, displayName: "绯荤粺", username: "system", role: "system", department: "", status: "active" },
        at: log.at,
        meta: redactAuditMeta(log.meta)
      };
    });
}

function buildAuditLogsCsv() {
  const rows = [["at", "action", "targetId", "actorId", "username", "displayName", "role", "department", "meta"]];
  for (const log of [...db().auditLogs].sort((a, b) => b.at.localeCompare(a.at))) {
    const actor = db().users.find(item => item.id === log.actorId);
    rows.push([
      log.at || "",
      log.action || "",
      log.targetId || "",
      log.actorId || "",
      actor?.username || "",
      actor?.displayName || "",
      actor?.role || "",
      actor?.department || "",
      JSON.stringify(redactAuditMeta(log.meta || {}))
    ]);
  }
  return `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
}

function buildUsersCsv() {
  const rows = [[
    "createdAt",
    "updatedAt",
    "id",
    "username",
    "displayName",
    "role",
    "department",
    "status",
    "ssoProvider",
    "ssoSubject",
    "email",
    "mustChangePassword"
  ]];
  for (const user of [...(db().users || [])].sort((a, b) => (a.username || "").localeCompare(b.username || ""))) {
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
      user.ssoSubject || "",
      user.email || "",
      user.mustChangePassword ? "yes" : "no"
    ]);
  }
  return `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
}

function buildAgentsQualityCsv() {
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
    "lastTestStatus",
    "lastTestAt",
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
  const providerStatusMap = new Map(providerStatuses().map(provider => [provider.id, provider]));
  for (const agent of [...(db().agents || [])].sort((a, b) => (a.id || "").localeCompare(b.id || "", "zh-CN", { numeric: true }))) {
    const issues = agentQualityIssues(agent);
    const route = routeById(agent.routeHint);
    const provider = providerStatusMap.get(agent.routeHint);
    rows.push([
      agent.id || "",
      agent.name || "",
      agent.category || "",
      agent.owner || "",
      agent.status || "",
      agent.mode || "",
      agent.routeHint || "",
      route?.name || "",
      provider?.configured ? "yes" : "no",
      (provider?.missingEnv || []).join("; "),
      (provider?.envNames || []).join("; "),
      (provider?.fallbacks || []).join("; "),
      agent.lastTestStatus || "untested",
      agent.lastTestAt || "",
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
  return `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
}

function agentQualityIssues(agent) {
  const issues = [];
  if (!agent.logoText && !agent.logoImage) issues.push("缺Logo");
  if (!agent.description || agent.description.length < 20) issues.push("简介短");
  if (!agent.owner) issues.push("缺负责人");
  if (!routeById(agent.routeHint)) issues.push("路由无效");
  if (!agent.cozeUrl) issues.push("缺Coze链接");
  else if (/\/xiaozhuang-century-[0-9]{3}$/i.test(agent.cozeUrl)) issues.push("Coze占位链接");
  const provider = providerStatuses().find(item => item.id === agent.routeHint);
  if (provider && !provider.configured) issues.push("模型未配置");
  if (agent.mode === "local" && (!agent.systemPrompt || agent.systemPrompt.length < 40)) issues.push("提示词短");
  if (!Array.isArray(agent.prompts) || agent.prompts.length < 3) issues.push("推荐问题少");
  if (["external", "embed"].includes(agent.mode) && !/^https?:\/\//i.test(agent.url || "")) issues.push("缺应用地址");
  if (agent.mode === "api" && !/^https?:\/\//i.test(agent.apiUrl || "")) issues.push("缺API地址");
  return issues;
}

function buildVersionHistoryCsv() {
  const users = new Map(db().users.map(user => [user.id, user]));
  const rows = [[
    "createdAt",
    "type",
    "itemId",
    "itemName",
    "version",
    "action",
    "actorId",
    "actorUsername",
    "actorName",
    "status",
    "routeHint",
    "routeName",
    "testStatus",
    "summary"
  ]];
  const items = [
    ...db().agentVersions.map(item => ({ type: "agent", item })),
    ...db().workflowVersions.map(item => ({ type: "workflow", item }))
  ].sort((a, b) => String(b.item.createdAt || "").localeCompare(String(a.item.createdAt || "")));
  for (const { type, item } of items) {
    const snapshot = item.snapshot || {};
    const actor = users.get(item.actorId);
    const route = routeById(snapshot.routeHint);
    rows.push([
      item.createdAt || "",
      type,
      item.agentId || item.workflowId || "",
      snapshot.name || snapshot.title || "",
      item.version || "",
      item.action || "",
      item.actorId || "",
      actor?.username || "",
      actor?.displayName || "",
      snapshot.status || "",
      snapshot.routeHint || "",
      route?.name || "",
      snapshot.lastTestStatus || "untested",
      versionSnapshotSummary(type, snapshot)
    ]);
  }
  return `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
}

function versionSnapshotSummary(type, snapshot) {
  if (type === "workflow") {
    return [
      `artifact:${snapshot.artifactType || ""}`,
      `inputs:${Array.isArray(snapshot.inputFields) ? snapshot.inputFields.length : 0}`,
      `outputs:${Array.isArray(snapshot.outputSections) ? snapshot.outputSections.length : 0}`,
      `quality:${Array.isArray(snapshot.qualityChecklist) ? snapshot.qualityChecklist.length : 0}`
    ].join("; ");
  }
  return [
    `category:${snapshot.category || ""}`,
    `mode:${snapshot.mode || ""}`,
    `prompts:${Array.isArray(snapshot.prompts) ? snapshot.prompts.length : 0}`,
    `logo:${snapshot.logoText || snapshot.logoImage ? "yes" : "no"}`
  ].join("; ");
}

function buildWorkflowsQualityCsv() {
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
  const providerStatusMap = new Map(providerStatuses().map(provider => [provider.id, provider]));
  for (const workflow of [...(db().workflows || [])].sort((a, b) => (a.id || "").localeCompare(b.id || "", "zh-CN", { numeric: true }))) {
    const issues = workflowQualityIssues(workflow);
    const route = routeById(workflow.routeHint);
    const provider = providerStatusMap.get(workflow.routeHint);
    rows.push([
      workflow.id || "",
      workflow.title || "",
      workflow.status || "",
      workflow.routeHint || "",
      route?.name || "",
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
  return `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
}

function workflowQualityIssues(workflow) {
  const issues = [];
  if (!workflow.title || !workflow.summary) issues.push("基础信息缺失");
  if (!routeById(workflow.routeHint)) issues.push("路由无效");
  const provider = providerStatuses().find(item => item.id === workflow.routeHint);
  if (provider && !provider.configured) issues.push("模型未配置");
  if (!workflow.artifactType) issues.push("缺成果类型");
  if (!workflow.systemPrompt || workflow.systemPrompt.length < 30) issues.push("提示词短");
  if (!Array.isArray(workflow.inputFields) || workflow.inputFields.length < 2) issues.push("输入字段少");
  if (!Array.isArray(workflow.outputSections) || workflow.outputSections.length < 3) issues.push("输出结构少");
  if (!Array.isArray(workflow.qualityChecklist) || workflow.qualityChecklist.length < 2) issues.push("质检清单少");
  if (workflow.status !== "offline" && workflow.lastTestStatus !== "passed") issues.push("未通过测试");
  return issues;
}

function buildFeedbackCsv() {
  const rows = [["createdAt", "updatedAt", "id", "userId", "username", "displayName", "type", "content", "email", "status", "assignee", "note"]];
  const users = new Map(db().users.map(user => [user.id, user]));
  for (const item of [...(db().feedbackItems || [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const userRecord = users.get(item.userId);
    rows.push([
      item.createdAt || "",
      item.updatedAt || "",
      item.id || "",
      item.userId || "",
      userRecord?.username || "",
      userRecord?.displayName || item.userName || "",
      item.type || "",
      item.content || "",
      item.email || "",
      item.status || "",
      item.assignee || "",
      item.note || ""
    ]);
  }
  return `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
}

function buildAlumniApplicationsCsv() {
  const rows = [[
    "submittedAt",
    "updatedAt",
    "id",
    "status",
    "userId",
    "username",
    "displayName",
    "name",
    "graduationYear",
    "college",
    "major",
    "phone",
    "email",
    "proofFileId",
    "proofName",
    "associationStatus",
    "associationReference",
    "reviewedBy",
    "approvedAt",
    "rejectedAt",
    "rejectionReason",
    "approvalSource",
    "grantId",
    "grantTotal",
    "grantExpiresAt"
  ]];
  const users = new Map(db().users.map(user => [user.id, user]));
  const grants = new Map(db().tokenGrants.map(grant => [grant.alumniFingerprint, grant]));
  for (const application of [...(db().alumniApplications || [])].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))) {
    const userRecord = users.get(application.userId);
    const grant = grants.get(application.fingerprint);
    rows.push([
      application.submittedAt || "",
      application.updatedAt || "",
      application.id || "",
      application.status || "",
      application.userId || "",
      userRecord?.username || "",
      userRecord?.displayName || "",
      application.name || "",
      application.graduationYear || "",
      application.college || "",
      application.major || "",
      application.phone || "",
      application.email || "",
      application.proofFileId || "",
      application.proofName || "",
      application.associationStatus || "",
      application.associationReference || "",
      application.reviewedBy || "",
      application.approvedAt || "",
      application.rejectedAt || "",
      application.rejectionReason || "",
      application.approvalSource || "",
      grant?.id || "",
      grant?.total || "",
      grant?.expiresAt || ""
    ]);
  }
  return `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
}

function buildArtifactsCsv() {
  const rows = [[
    "createdAt",
    "id",
    "title",
    "type",
    "downloadType",
    "contentType",
    "fileName",
    "userId",
    "username",
    "displayName",
    "workflowId",
    "workflowTitle",
    "downloadUrl"
  ]];
  const users = new Map(db().users.map(user => [user.id, user]));
  const workflows = new Map(db().workflows.map(workflow => [workflow.id, workflow]));
  for (const item of [...(db().artifacts || [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const userRecord = users.get(item.userId);
    const workflow = workflows.get(item.workflowId);
    rows.push([
      item.createdAt || "",
      item.id || "",
      item.title || "",
      item.type || "",
      item.downloadType || "",
      item.contentType || "",
      item.fileName || "",
      item.userId || "",
      userRecord?.username || "",
      userRecord?.displayName || "",
      item.workflowId || "",
      workflow?.title || "",
      `/api/artifacts/${encodeURIComponent(item.id)}/download`
    ]);
  }
  return `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\n")}\n`;
}

function publicBranding(input = {}) {
  return normalizeBranding(input);
}

function normalizeBranding(input = {}) {
  const assetStatuses = new Set(["placeholder", "pending", "official"]);
  const primaryColor = normalizeColor(input.primaryColor, "#8b2332");
  const goldColor = normalizeColor(input.goldColor, "#c59a3d");
  return {
    platformName: String(input.platformName || "百年晓庄智慧教育平台").trim().slice(0, 40),
    schoolName: String(input.schoolName || "南京晓庄学院").trim().slice(0, 40),
    logoUrl: normalizeAssetUrl(input.logoUrl, "assets/school-mark.svg"),
    heroImageUrl: normalizeAssetUrl(input.heroImageUrl, "assets/xiaozhuang-century.png"),
    primaryColor,
    goldColor,
    assetStatus: assetStatuses.has(input.assetStatus) ? input.assetStatus : "placeholder",
    authorizationNote: String(input.authorizationNote || "").trim().slice(0, 240),
    updatedAt: input.updatedAt || new Date().toISOString()
  };
}

function normalizeColor(value, fallback) {
  const color = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

function normalizeAssetUrl(value, fallback) {
  const raw = String(value || "").trim().replace(/\\/g, "/").slice(0, 240);
  if (!raw) return fallback;
  if (/^https:\/\/[^\s"'<>]+$/i.test(raw)) return raw;
  if (/^(?:[a-z]+:|\/|\.{2}(?:\/|$))/i.test(raw)) return fallback;
  return raw.replace(/[^a-zA-Z0-9._~:/?#\[\]@!$&'()*+,;=%-]/g, "");
}

function isPublicCozeUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" && ["www.coze.cn", "coze.cn", "www.coze.com", "coze.com"].includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function redactAuditMeta(meta = {}) {
  const safe = {};
  for (const [key, value] of Object.entries(meta || {})) {
    if (/password|token|secret|key/i.test(key)) continue;
    safe[key] = typeof value === "string" ? value.slice(0, 160) : value;
  }
  return safe;
}

function createBackup() {
  const { passwordHash, sessions, tokenReservations, ...ignored } = {};
  void passwordHash; void sessions; void tokenReservations; void ignored;
  const backup = {
    platform: "鐧惧勾鏅撳簞鏅烘収鏁欒偛骞冲彴",
    version: 2,
    exportedAt: new Date().toISOString(),
    branding: publicBranding(db().branding),
    agents: db().agents,
    workflows: db().workflows,
    users: db().users.map(managedUser),
    alumniApplications: db().alumniApplications,
    alumniIdentities: db().alumniIdentities,
    tokenGrants: db().tokenGrants,
    tokenLedger: db().tokenLedger,
    modelRuns: db().modelRuns,
    artifacts: db().artifacts,
    agentVersions: db().agentVersions,
    workflowVersions: db().workflowVersions,
    feedbackItems: db().feedbackItems,
    auditLogs: db().auditLogs.filter(log => !["auth.login"].includes(log.action))
  };
  backup.manifest = buildBackupManifest(backup);
  return backup;
}

function buildBackupManifest(backup) {
  const payload = backupWithoutManifest(backup);
  return {
    schema: "xiaozhuang-platform-backup-v2",
    generatedAt: backup.exportedAt || new Date().toISOString(),
    counts: {
      agents: payload.agents?.length || 0,
      workflows: payload.workflows?.length || 0,
      users: payload.users?.length || 0,
      alumniApplications: payload.alumniApplications?.length || 0,
      tokenGrants: payload.tokenGrants?.length || 0,
      tokenLedger: payload.tokenLedger?.length || 0,
      modelRuns: payload.modelRuns?.length || 0,
      artifacts: payload.artifacts?.length || 0,
      agentVersions: payload.agentVersions?.length || 0,
      workflowVersions: payload.workflowVersions?.length || 0,
      feedbackItems: payload.feedbackItems?.length || 0,
      auditLogs: payload.auditLogs?.length || 0
    },
    sha256: createHash("sha256").update(stableJson(payload)).digest("hex")
  };
}

function backupWithoutManifest(backup) {
  const { manifest, ...payload } = backup || {};
  void manifest;
  return payload;
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function runPlatformMaintenance(actor) {
  const now = Date.now();
  const grantById = new Map(db().tokenGrants.map(grant => [grant.id, grant]));
  const before = {
    sessions: db().sessions.length,
    legacySessions: db().sessions.filter(session => session.token || !session.tokenHash).length,
    oauthStates: (db().oauthStates || []).length,
    tokenReservations: (db().tokenReservations || []).length
  };
  mutate(store => {
    store.sessions = store.sessions.filter(session => !session.token && session.tokenHash && new Date(session.expiresAt).getTime() > now);
    store.oauthStates = (store.oauthStates || []).filter(state => new Date(state.expiresAt).getTime() > now);
    store.tokenReservations = (store.tokenReservations || []).filter(reservation => {
      const grant = grantById.get(reservation.grantId);
      if (!grant) return false;
      if (new Date(grant.expiresAt).getTime() <= now) return false;
      return new Date(reservation.expiresAt).getTime() > now;
    });
    store.auditLogs.push({
      id: randomUUID(),
      actorId: actor.id,
      action: "platform.maintenance",
      targetId: "platform",
      meta: {
        sessionsRemoved: before.sessions - store.sessions.length,
        legacySessionsRemoved: before.legacySessions,
        oauthStatesRemoved: before.oauthStates - store.oauthStates.length,
        tokenReservationsRemoved: before.tokenReservations - store.tokenReservations.length
      },
      at: new Date().toISOString()
    });
  });
  return {
    sessionsRemoved: before.sessions - db().sessions.length,
    legacySessionsRemoved: before.legacySessions,
    oauthStatesRemoved: before.oauthStates - (db().oauthStates || []).length,
    tokenReservationsRemoved: before.tokenReservations - (db().tokenReservations || []).length
  };
}

function restoreBackup(backup, actor) {
  validateBackupForRestore(backup);
  if (!backup || !Array.isArray(backup.agents) || !Array.isArray(backup.workflows)) {
    const error = new Error("Invalid backup file format");
    error.status = 400;
    error.expose = true;
    throw error;
  }
  const agents = backup.agents.map((agent, index) => normalizeAgent(agent, safeId(agent.id) ? agent.id : `agent-restored-${index + 1}`));
  const workflows = backup.workflows.map((workflow, index) => normalizeWorkflow(workflow, safeId(workflow.id) ? workflow.id : `workflow-restored-${index + 1}`));
  for (const agent of agents) {
    const validation = validateAgentForStatus(agent);
    if (validation) {
      const error = new Error(`Restore failed for agent ${agent.name}: ${validation}`);
      error.status = 400;
      error.expose = true;
      throw error;
    }
  }
  for (const workflow of workflows) {
    const validation = validateWorkflow(workflow);
    if (validation) {
      const error = new Error(`Restore failed for workflow ${workflow.title}: ${validation}`);
      error.status = 400;
      error.expose = true;
      throw error;
    }
  }
  mutate(store => {
    store.branding = publicBranding(backup.branding || store.branding);
    store.agents = agents;
    store.workflows = workflows;
    store.alumniApplications = Array.isArray(backup.alumniApplications) ? backup.alumniApplications : [];
    store.alumniIdentities = Array.isArray(backup.alumniIdentities) ? backup.alumniIdentities : [];
    store.tokenGrants = Array.isArray(backup.tokenGrants) ? backup.tokenGrants : [];
    store.tokenLedger = Array.isArray(backup.tokenLedger) ? backup.tokenLedger : [];
    store.modelRuns = Array.isArray(backup.modelRuns) ? backup.modelRuns : [];
    store.artifacts = Array.isArray(backup.artifacts) ? backup.artifacts : [];
    store.agentVersions = Array.isArray(backup.agentVersions) ? backup.agentVersions : [];
    store.workflowVersions = Array.isArray(backup.workflowVersions) ? backup.workflowVersions : [];
    store.feedbackItems = Array.isArray(backup.feedbackItems) ? backup.feedbackItems : [];
    store.auditLogs = [
      ...(Array.isArray(backup.auditLogs) ? backup.auditLogs : []),
      {
        id: randomUUID(),
        actorId: actor.id,
        action: "platform.restore",
        targetId: "platform",
        meta: { agents: agents.length, workflows: workflows.length },
        at: new Date().toISOString()
      }
    ];
  });
  return { agents: agents.length, workflows: workflows.length };
}

function validateBackupForRestore(backup) {
  if (!backup || typeof backup !== "object") {
    const error = new Error("Invalid backup file format");
    error.status = 400;
    throw error;
  }
  if (Number(backup.version || 1) > 2) {
    const error = new Error("Backup version is newer than this platform can restore");
    error.status = 400;
    throw error;
  }
  if (backup.manifest?.sha256) {
    const expected = buildBackupManifest(backup).sha256;
    if (backup.manifest.sha256 !== expected) {
      const error = new Error("Backup manifest checksum does not match backup contents");
      error.status = 400;
      throw error;
    }
  }
  const sensitivePath = findBackupSensitiveField(backup);
  if (sensitivePath) {
    const error = new Error(`Backup contains sensitive field: ${sensitivePath}`);
    error.status = 400;
    throw error;
  }
}

function findBackupSensitiveField(value, pathName = "backup") {
  if (!value || typeof value !== "object") return "";
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findBackupSensitiveField(value[index], `${pathName}[${index}]`);
      if (found) return found;
    }
    return "";
  }
  const forbidden = new Set(["passwordHash", "sessions", "session", "tokenReservations", "apiToken", "secret", "key"]);
  for (const [key, child] of Object.entries(value)) {
    if (forbidden.has(key)) return `${pathName}.${key}`;
    const found = findBackupSensitiveField(child, `${pathName}.${key}`);
    if (found) return found;
  }
  return "";
}

function resetDefaultCatalog(scope, actor) {
  const nextAgents = buildAgentCatalog();
  const nextWorkflows = teachingWorkflows.map(workflow => ({ ...workflow }));
  mutate(store => {
    if (scope === "all" || scope === "agents") {
      store.agents = nextAgents;
      for (const agent of nextAgents) recordAgentVersion(store, agent, actor, "reset:default");
    }
    if (scope === "all" || scope === "workflows") {
      store.workflows = nextWorkflows;
      for (const workflow of nextWorkflows) recordWorkflowVersion(store, workflow, actor, "reset:default");
    }
    store.auditLogs.push({
      id: randomUUID(),
      actorId: actor.id,
      action: "catalog.reset",
      targetId: scope,
      meta: { agents: (scope === "all" || scope === "agents") ? nextAgents.length : 0, workflows: (scope === "all" || scope === "workflows") ? nextWorkflows.length : 0 },
      at: new Date().toISOString()
    });
  });
  return {
    scope,
    agents: (scope === "all" || scope === "agents") ? nextAgents.length : db().agents.length,
    workflows: (scope === "all" || scope === "workflows") ? nextWorkflows.length : db().workflows.length
  };
}

function topTargets(logs, catalog, kind) {
  const counts = new Map();
  for (const log of logs) counts.set(log.targetId, (counts.get(log.targetId) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      id,
      name: catalog.find(item => item.id === id)?.[kind === "agent" ? "name" : "title"] || id,
      count
    }));
}

function nameForRun(log) {
  if (log.action === "agent.run") return db().agents.find(item => item.id === log.targetId)?.name || log.targetId;
  return db().workflows.find(item => item.id === log.targetId)?.title || log.targetId;
}

function reserveQuota(userId, estimatedInput, maxOutputTokens) {
  const quota = quotaForUser(userId);
  if (!quota.grant) return null;
  if (quota.expired || quota.remaining <= estimatedInput) {
    return { error: "鍥戒骇妯″瀷鍏嶈垂棰濆害宸茬敤灏姐€佸凡杩囨湡鎴栦笉瓒充互澶勭悊鏈璇锋眰" };
  }
  const amount = Math.min(quota.remaining, estimatedInput + maxOutputTokens);
  const reservation = {
    id: `reservation-${randomUUID()}`,
    userId,
    grantId: quota.grant.id,
    amount,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  };
  mutate(store => {
    const now = Date.now();
    store.tokenReservations = store.tokenReservations.filter(item => new Date(item.expiresAt).getTime() > now);
    store.tokenReservations.push(reservation);
  });
  return reservation;
}

function releaseReservation(id) {
  mutate(store => {
    store.tokenReservations = store.tokenReservations.filter(item => item.id !== id);
  });
}

function normalizeAgent(input, id) {
  const allowedStatuses = new Set(["published", "draft", "offline"]);
  const allowedModes = new Set(["local", "external", "embed", "api"]);
  return {
    id,
    name: String(input.name || "").trim().slice(0, 50),
    logoText: String(input.logoText || input.name?.slice(0, 1) || "智").slice(0, 2),
    category: String(input.category || "其他").trim().slice(0, 30),
    icon: String(input.icon || "sparkles").slice(0, 40),
    description: String(input.description || "").trim().slice(0, 300),
    color: /^#[0-9a-f]{6}$/i.test(input.color) ? input.color : "#9e1f32",
    bg: /^#[0-9a-f]{6,8}$/i.test(input.bg) ? input.bg : "#f5e8ea",
    owner: String(input.owner || "").trim().slice(0, 50),
    status: allowedStatuses.has(input.status) ? input.status : "draft",
    mode: allowedModes.has(input.mode) ? input.mode : "local",
    url: String(input.url || "").slice(0, 500),
    cozeUrl: String(input.cozeUrl || "").slice(0, 500),
    apiUrl: String(input.apiUrl || "").slice(0, 500),
    providerAlias: String(input.providerAlias || "").slice(0, 80),
    routeHint: routeById(input.routeHint)?.id || "qwen",
    systemPrompt: String(input.systemPrompt || "").trim().slice(0, 2000),
    logoImage: String(input.logoImage || "").slice(0, 800000),
    lastTestAt: String(input.lastTestAt || "").slice(0, 40),
    lastTestStatus: ["passed", "failed", "untested"].includes(input.lastTestStatus) ? input.lastTestStatus : "untested",
    lastTestMessage: String(input.lastTestMessage || "").trim().slice(0, 160),
    lastTestDurationMs: Number.isFinite(Number(input.lastTestDurationMs)) ? Number(input.lastTestDurationMs) : 0,
    featured: Boolean(input.featured),
    prompts: Array.isArray(input.prompts) ? input.prompts.slice(0, 5).map(item => String(item).slice(0, 200)) : [],
    createdAt: input.createdAt || new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10)
  };
}

function normalizeWorkflow(input, id) {
  const defaults = defaultWorkflowSpec(input.artifactType || "text");
  return {
    id,
    title: String(input.title || "").trim().slice(0, 40),
    routeHint: routeById(input.routeHint)?.id || "qwen",
    artifactType: String(input.artifactType || "text").trim().slice(0, 40),
    summary: String(input.summary || "").trim().slice(0, 180),
    systemPrompt: String(input.systemPrompt || "").trim().slice(0, 2000),
    inputFields: normalizeWorkflowList(input.inputFields, defaults.inputFields),
    outputSections: normalizeWorkflowList(input.outputSections, defaults.outputSections),
    qualityChecklist: normalizeWorkflowList(input.qualityChecklist, defaults.qualityChecklist),
    status: ["published", "draft", "offline"].includes(input.status) ? input.status : "published",
    lastTestAt: String(input.lastTestAt || "").slice(0, 40),
    lastTestStatus: ["passed", "failed", "untested"].includes(input.lastTestStatus) ? input.lastTestStatus : "untested",
    lastTestMessage: String(input.lastTestMessage || "").trim().slice(0, 160),
    lastTestDurationMs: Number.isFinite(Number(input.lastTestDurationMs)) ? Number(input.lastTestDurationMs) : 0,
    updatedAt: new Date().toISOString()
  };
}

function normalizeWorkflowList(value, fallback = []) {
  const source = Array.isArray(value) && value.length ? value : fallback;
  return source
    .map(item => String(item || "").trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, 12);
}

function defaultWorkflowSpec(artifactType = "text") {
  const specs = {
    "lesson-plan": {
      inputFields: ["学科/主题", "学段/年级", "课时/时长", "补充要求"],
      outputSections: ["学情分析", "教学目标", "教学过程", "评价设计"],
      qualityChecklist: ["目标、活动和评价一致", "活动可执行", "输出适合真实课堂"]
    },
    "html-slides": {
      inputFields: ["主题", "受众/年级", "页数", "授课时长"],
      outputSections: ["逐页大纲", "讲稿提示", "视觉建议", "HTML 演示结构"],
      qualityChecklist: ["页面结构清晰", "讲稿对应页面", "适合课堂展示"]
    },
    "question-set": {
      inputFields: ["学科/主题", "学段/年级", "知识点", "题量"],
      outputSections: ["题目清单", "答案", "解析", "评分标准"],
      qualityChecklist: ["题目覆盖知识点", "答案解析一致", "难度分层清楚"]
    },
    "document-brief": {
      inputFields: ["文档主题", "阅读目标", "重点问题", "补充要求"],
      outputSections: ["核心摘要", "证据链", "可引用观点", "待核验事实"],
      qualityChecklist: ["区分事实和推断", "标记不确定内容", "保留出处线索"]
    },
    "html-animation": {
      inputFields: ["教学主题", "互动目标", "适用年级", "交互方式"],
      outputSections: ["学习目标", "交互步骤", "HTML/CSS/JS 结构", "安全注意事项"],
      qualityChecklist: ["动效服务教学目标", "交互步骤可测", "可预览可下载"]
    },
    "image-analysis": {
      inputFields: ["图片/图表", "学科场景", "分析目标", "补充要求"],
      outputSections: ["可见元素", "关系与趋势", "教学价值", "课堂追问"],
      qualityChecklist: ["只描述可见或可推断内容", "说明不确定细节", "问题有层次"]
    }
  };
  return specs[artifactType] || {
    inputFields: ["主题", "目标", "对象", "补充要求"],
    outputSections: ["任务理解", "结构化结果", "行动建议"],
    qualityChecklist: ["结果准确", "结构清晰", "可执行"]
  };
}

function uniqueWorkflowId(base) {
  const cleanBase = safeId(base) ? base : "workflow-copy";
  const existing = new Set(db().workflows.map(item => item.id));
  if (!existing.has(cleanBase)) return cleanBase;
  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${cleanBase}-${index}`;
    if (!existing.has(candidate)) return candidate;
  }
  return `workflow-${randomUUID()}`;
}

function uniqueAgentId(base) {
  const cleanBase = safeId(base) ? base : "agent-copy";
  const existing = new Set(db().agents.map(item => item.id));
  if (!existing.has(cleanBase)) return cleanBase;
  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${cleanBase}-${index}`;
    if (!existing.has(candidate)) return candidate;
  }
  return `agent-${randomUUID()}`;
}

function normalizeUser(input, id) {
  const roles = new Set(["super_admin", "agent_admin", "alumni_reviewer", "teacher"]);
  const statuses = new Set(["active", "disabled"]);
  return {
    id,
    username: String(input.username || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 40),
    displayName: String(input.displayName || input.username || "").trim().slice(0, 40),
    role: roles.has(input.role) ? input.role : "teacher",
    department: String(input.department || "").trim().slice(0, 60),
    status: statuses.has(input.status) ? input.status : "active"
  };
}

function wouldRemoveLastActiveSuperAdmin(existing, next) {
  if (existing.role !== "super_admin" || (existing.status || "active") !== "active") return false;
  if (next.role === "super_admin" && (next.status || "active") === "active") return false;
  const activeSuperAdmins = db().users.filter(item => item.role === "super_admin" && (item.status || "active") === "active");
  return activeSuperAdmins.length <= 1;
}

function managedUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    department: user.department,
    status: user.status || "active",
    mustChangePassword: Boolean(user.mustChangePassword),
    ssoProvider: user.ssoProvider || "",
    createdAt: user.createdAt || ""
  };
}

function isSuperAdmin(user) {
  return user?.role === "super_admin";
}

function validateWorkflow(workflow) {
  if (!workflow.title || !workflow.summary) return "Workflow title and summary are required";
  if (!routeById(workflow.routeHint)) return "Workflow route is invalid";
  if (workflow.inputFields.length < 2) return "Workflow input fields require at least 2 items";
  if (workflow.outputSections.length < 3) return "Workflow output sections require at least 3 items";
  if (workflow.qualityChecklist.length < 2) return "Workflow quality checklist requires at least 2 items";
  if (workflow.status === "published" && workflow.systemPrompt.length < 30) return "Published workflows require a system prompt of at least 30 characters";
  return "";
}

function validateWorkflowPublishGate(previous, workflow) {
  if (previous?.status === "published" || workflow.status !== "published") return "";
  if (workflow.lastTestStatus !== "passed") return "Published workflows require a passing workflow test";
  return "";
}

function invalidateWorkflowTestIfChanged(previous, next, reason) {
  const keys = ["title", "routeHint", "artifactType", "summary", "systemPrompt", "inputFields", "outputSections", "qualityChecklist"];
  return keys.some(key => String(previous?.[key] || "") !== String(next?.[key] || ""))
    ? invalidateWorkflowTest(next, reason)
    : next;
}

function invalidateWorkflowTest(workflow, reason) {
  return {
    ...workflow,
    lastTestAt: "",
    lastTestStatus: "untested",
    lastTestMessage: reason,
    lastTestDurationMs: 0
  };
}

function invalidateAgentTestIfChanged(previous, next, reason) {
  const keys = [
    "name",
    "logoText",
    "category",
    "mode",
    "url",
    "cozeUrl",
    "apiUrl",
    "providerAlias",
    "routeHint",
    "systemPrompt",
    "logoImage"
  ];
  return keys.some(key => String(previous?.[key] || "") !== String(next?.[key] || ""))
    ? invalidateAgentTest(next, reason)
    : next;
}

function invalidateAgentTest(agent, reason) {
  return {
    ...agent,
    lastTestAt: "",
    lastTestStatus: "untested",
    lastTestMessage: reason,
    lastTestDurationMs: 0
  };
}

function recordWorkflowVersion(store, workflow, user, action) {
  const versions = store.workflowVersions.filter(item => item.workflowId === workflow.id);
  store.workflowVersions.push({
    id: `workflow-version-${randomUUID()}`,
    workflowId: workflow.id,
    version: versions.length + 1,
    action,
    snapshot: workflow,
    actorId: user.id,
    createdAt: new Date().toISOString()
  });
}

function buildWorkflowVersionDiff(workflowId, fromVersion = 0, toVersion = 0) {
  const versions = db().workflowVersions
    .filter(item => item.workflowId === workflowId)
    .sort((a, b) => a.version - b.version);
  if (versions.length < 2 && (!fromVersion || !toVersion)) return null;
  const from = fromVersion ? versions.find(item => item.version === fromVersion) : versions.at(-2);
  const to = toVersion ? versions.find(item => item.version === toVersion) : versions.at(-1);
  if (!from || !to) return null;
  const fields = [
    "title",
    "status",
    "routeHint",
    "artifactType",
    "summary",
    "systemPrompt",
    "inputFields",
    "outputSections",
    "qualityChecklist",
    "lastTestStatus"
  ];
  return {
    workflowId,
    from: versionSummary(from),
    to: versionSummary(to),
    changes: fields
      .filter(field => comparableValue(from.snapshot?.[field]) !== comparableValue(to.snapshot?.[field]))
      .map(field => ({
        field,
        label: workflowFieldLabel(field),
        before: summarizeDiffValue(from.snapshot?.[field]),
        after: summarizeDiffValue(to.snapshot?.[field])
      }))
  };
}

function workflowFieldLabel(field) {
  return {
    title: "名称",
    status: "发布状态",
    routeHint: "模型路由",
    artifactType: "成果类型",
    summary: "简介",
    systemPrompt: "系统提示词",
    inputFields: "输入字段",
    outputSections: "输出结构",
    qualityChecklist: "质检清单",
    lastTestStatus: "测试状态"
  }[field] || field;
}

function validateAgentForStatus(agent) {
  if (!agent.name || !agent.category || !agent.description || !agent.owner) return "Agent basic information is incomplete";
  if (!agent.logoText && !agent.logoImage) return "Agent must have a recognizable logo";
  if (!routeById(agent.routeHint)) return "Agent route is invalid";
  if (agent.cozeUrl && !isPublicCozeUrl(agent.cozeUrl)) return "Agent Coze URL must use an official Coze public domain";
  if (agent.status === "published") {
    if ((agent.mode === "external" || agent.mode === "embed") && !/^https?:\/\//i.test(agent.url)) return "Published external or embedded agents require a valid URL";
    if (agent.mode === "api" && !/^https?:\/\//i.test(agent.apiUrl)) return "Published API agents require a valid API URL";
    if (agent.mode === "local" && agent.systemPrompt.length < 20) return "Published local agents require a system prompt of at least 20 characters";
  }
  return "";
}

function validateAgentPublishGate(previous, agent) {
  if (previous?.status === "published" || agent.status !== "published") return "";
  if (["external", "embed", "api"].includes(agent.mode) && agent.lastTestStatus !== "passed") {
    return "Published external, embedded and API agents require a passing connection test";
  }
  return "";
}

function recordAgentVersion(store, agent, user, action) {
  const versions = store.agentVersions.filter(item => item.agentId === agent.id);
  store.agentVersions.push({
    id: `agent-version-${randomUUID()}`,
    agentId: agent.id,
    version: versions.length + 1,
    action,
    snapshot: agent,
    actorId: user.id,
    createdAt: new Date().toISOString()
  });
}

function buildAgentVersionDiff(agentId, fromVersion = 0, toVersion = 0) {
  const versions = db().agentVersions
    .filter(item => item.agentId === agentId)
    .sort((a, b) => a.version - b.version);
  if (versions.length < 2 && (!fromVersion || !toVersion)) return null;
  const from = fromVersion ? versions.find(item => item.version === fromVersion) : versions.at(-2);
  const to = toVersion ? versions.find(item => item.version === toVersion) : versions.at(-1);
  if (!from || !to) return null;
  const fields = [
    "name",
    "logoText",
    "logoImage",
    "category",
    "owner",
    "status",
    "mode",
    "url",
    "cozeUrl",
    "apiUrl",
    "providerAlias",
    "routeHint",
    "description",
    "systemPrompt",
    "prompts",
    "featured",
    "lastTestStatus"
  ];
  return {
    agentId,
    from: versionSummary(from),
    to: versionSummary(to),
    changes: fields
      .filter(field => comparableValue(from.snapshot?.[field]) !== comparableValue(to.snapshot?.[field]))
      .map(field => ({
        field,
        label: agentFieldLabel(field),
        before: summarizeDiffValue(from.snapshot?.[field]),
        after: summarizeDiffValue(to.snapshot?.[field])
      }))
  };
}

function versionSummary(version) {
  return {
    version: version.version,
    action: version.action,
    actorId: version.actorId,
    createdAt: version.createdAt
  };
}

function comparableValue(value) {
  return JSON.stringify(value ?? "");
}

function summarizeDiffValue(value) {
  const text = Array.isArray(value) ? value.join(" / ") : String(value ?? "");
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

function agentFieldLabel(field) {
  return {
    name: "名称",
    logoText: "Logo文字",
    logoImage: "Logo图片",
    category: "分类",
    owner: "负责人",
    status: "发布状态",
    mode: "接入方式",
    url: "应用地址",
    cozeUrl: "Coze发布页",
    apiUrl: "API地址",
    providerAlias: "供应商别名",
    routeHint: "模型路由",
    description: "简介",
    systemPrompt: "系统提示词",
    prompts: "推荐问题",
    featured: "首页推荐",
    lastTestStatus: "测试状态"
  }[field] || field;
}

function alumniFingerprint(body) {
  const normalized = [body.name, body.graduationYear, body.college, body.major, body.phone]
    .map(value => String(value || "").trim().toLowerCase().replace(/\s+/g, ""));
  return createHash("sha256").update(normalized.join("|")).digest("hex");
}

function audit(user, action, targetId, meta = {}) {
  mutate(store => store.auditLogs.push({
    id: randomUUID(),
    actorId: user?.id || "anonymous",
    action,
    targetId,
    meta,
    at: new Date().toISOString()
  }));
}

async function handleSsoCallback(request, response) {
  const config = ssoConfig(request);
  if (!config) return json(response, 503, { error: "SSO is not configured" });
  const url = new URL(request.url, requestOrigin(request));
  const error = url.searchParams.get("error");
  if (error) {
    audit(null, "auth.sso.failed", "oidc", { error: error.slice(0, 120) });
    await flush();
    redirect(response, frontendRedirectUrl(`/?sso=failed&reason=${encodeURIComponent(error.slice(0, 80))}`));
    return;
  }
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const stateRecord = state ? consumeOAuthState(state, "oidc") : null;
  await flush();
  if (!code || !stateRecord) {
    audit(null, "auth.sso.failed", "oidc", { reason: "invalid_state" });
    await flush();
    redirect(response, frontendRedirectUrl("/?sso=failed&reason=invalid_state"));
    return;
  }
  try {
    const token = await exchangeOidcCode(config, code);
    const profile = await fetchOidcProfile(config, token);
    const user = upsertSsoUser(profile, { provider: config.issuer || "oidc", defaultRole: config.defaultRole });
    if ((user.status || "active") !== "active") {
      audit(user, "auth.sso.failed", user.id, { reason: "disabled_account" });
      await flush();
      redirect(response, frontendRedirectUrl("/?sso=failed&reason=disabled_account"));
      return;
    }
    const session = createSession(user.id, true);
    audit(user, "auth.sso.login", user.id, { provider: config.issuer || "oidc", subject: profile.subject });
    await flush();
    redirect(response, frontendRedirectUrl("/?sso=ok"), { "Set-Cookie": sessionCookie(session.token, session.expiresAt) });
  } catch (callbackError) {
    audit(null, "auth.sso.failed", "oidc", { reason: callbackError.message });
    await flush();
    redirect(response, frontendRedirectUrl(`/?sso=failed&reason=${encodeURIComponent(callbackError.message.slice(0, 80))}`));
  }
}

function frontendRedirectUrl(target) {
  const base = process.env.PUBLIC_FRONTEND_URL || firstFrontendOrigin();
  if (!base) return target;
  try {
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    if (String(target).startsWith("/?")) return `${normalizedBase}${String(target).slice(2) ? `?${String(target).slice(2)}` : ""}`;
    return new URL(target, normalizedBase).href;
  } catch {
    return target;
  }
}

function firstFrontendOrigin() {
  return String(process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean)[0] || "";
}

function ssoConfig(request) {
  if (!["1", "true", "yes"].includes(String(process.env.SSO_ENABLED || "").toLowerCase())) return null;
  const authorizationUrl = process.env.SSO_AUTHORIZATION_URL;
  const tokenUrl = process.env.SSO_TOKEN_URL;
  const userinfoUrl = process.env.SSO_USERINFO_URL;
  const clientId = process.env.SSO_CLIENT_ID;
  const clientSecret = process.env.SSO_CLIENT_SECRET;
  if (!authorizationUrl || !tokenUrl || !userinfoUrl || !clientId || !clientSecret) return null;
  return {
    issuer: process.env.SSO_ISSUER || "",
    authorizationUrl,
    tokenUrl,
    userinfoUrl,
    clientId,
    clientSecret,
    redirectUri: process.env.SSO_REDIRECT_URI || `${requestOrigin(request)}/api/auth/sso/callback`,
    scope: process.env.SSO_SCOPE || "openid profile email",
    usernameClaim: process.env.SSO_USERNAME_CLAIM || "preferred_username",
    displayNameClaim: process.env.SSO_DISPLAY_NAME_CLAIM || "name",
    departmentClaim: process.env.SSO_DEPARTMENT_CLAIM || "department",
    defaultRole: process.env.SSO_DEFAULT_ROLE || "teacher"
  };
}

async function exchangeOidcCode(config, code) {
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret
  });
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form
  });
  const data = await response.json().catch(async () => ({ error_description: await response.text() }));
  if (!response.ok || !data.access_token) {
    const detail = data.error_description || data.error || `OIDC token endpoint returned HTTP ${response.status}`;
    const error = new Error(String(detail).slice(0, 160));
    error.status = 502;
    throw error;
  }
  return data;
}

async function fetchOidcProfile(config, token) {
  const response = await fetch(config.userinfoUrl, {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });
  const profile = await response.json().catch(async () => ({ error_description: await response.text() }));
  if (!response.ok) {
    const detail = profile.error_description || profile.error || `OIDC userinfo endpoint returned HTTP ${response.status}`;
    const error = new Error(String(detail).slice(0, 160));
    error.status = 502;
    throw error;
  }
  const username = String(profile[config.usernameClaim] || profile.email || profile.sub || "").trim().toLowerCase();
  return {
    subject: String(profile.sub || username),
    username: username.replace(/[^a-z0-9._@-]/g, "").slice(0, 80),
    displayName: String(profile[config.displayNameClaim] || profile.name || username).trim().slice(0, 40),
    department: String(profile[config.departmentClaim] || profile.organization || "南京晓庄学院").trim().slice(0, 60),
    email: String(profile.email || "").trim().slice(0, 120)
  };
}

function redirect(response, location, headers = {}) {
  response.writeHead(302, {
    Location: location,
    "Cache-Control": "no-store",
    ...headers
  });
  response.end();
}

function requestOrigin(request) {
  const proto = String(request.headers["x-forwarded-proto"] || "").split(",")[0].trim() || (process.env.NODE_ENV === "production" ? "https" : "http");
  const host = request.headers["x-forwarded-host"] || request.headers.host || `localhost:${port}`;
  return `${proto}://${host}`;
}

function loginThrottleState(request, username) {
  const key = loginAttemptKey(request, username);
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (!attempt) return { locked: false, retryAfterSeconds: 0 };
  if (attempt.lockedUntil && attempt.lockedUntil > now) {
    return { locked: true, retryAfterSeconds: Math.ceil((attempt.lockedUntil - now) / 1000) };
  }
  if (attempt.windowStartedAt + LOGIN_WINDOW_MS <= now) {
    loginAttempts.delete(key);
    return { locked: false, retryAfterSeconds: 0 };
  }
  return { locked: false, retryAfterSeconds: 0 };
}

function recordFailedLogin(request, username) {
  const key = loginAttemptKey(request, username);
  const now = Date.now();
  const existing = loginAttempts.get(key);
  const attempt = !existing || existing.windowStartedAt + LOGIN_WINDOW_MS <= now
    ? { count: 0, windowStartedAt: now, lockedUntil: 0 }
    : existing;
  attempt.count += 1;
  if (attempt.count >= LOGIN_MAX_FAILURES) attempt.lockedUntil = now + LOGIN_LOCK_MS;
  loginAttempts.set(key, attempt);
  return {
    count: attempt.count,
    locked: Boolean(attempt.lockedUntil && attempt.lockedUntil > now),
    retryAfterSeconds: attempt.lockedUntil ? Math.ceil((attempt.lockedUntil - now) / 1000) : 0
  };
}

function clearFailedLogin(request, username) {
  loginAttempts.delete(loginAttemptKey(request, username));
}

function loginAttemptKey(request, username) {
  return `${requestIp(request)}:${String(username || "unknown").toLowerCase().slice(0, 120)}`;
}

function requestIp(request) {
  const forwarded = String(request.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return (forwarded || request.socket?.remoteAddress || "unknown").slice(0, 80);
}

function validateUploadType(contentType) {
  const normalized = String(contentType || "").split(";")[0].trim().toLowerCase();
  return {
    "application/pdf": { contentType: "application/pdf", extension: ".pdf" },
    "image/png": { contentType: "image/png", extension: ".png" },
    "image/jpeg": { contentType: "image/jpeg", extension: ".jpg" },
    "image/webp": { contentType: "image/webp", extension: ".webp" }
  }[normalized] || null;
}

function isValidUploadBody(buffer, contentType) {
  if (!buffer?.length) return false;
  if (contentType === "application/pdf") return buffer.subarray(0, 5).toString("utf8") === "%PDF-";
  if (contentType === "image/png") return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (contentType === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (contentType === "image/webp") return buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

function applySecurityHeaders(response, request) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  const origin = allowedCorsOrigin(request);
  if (origin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Vary", "Origin");
  }
}

function sameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.host || Boolean(allowedCorsOrigin(request));
  } catch {
    return false;
  }
}

function allowedCorsOrigin(request) {
  const origin = request?.headers?.origin;
  if (!origin) return "";
  const allowed = String(process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map(item => item.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  const normalized = String(origin).replace(/\/+$/, "");
  return allowed.includes(normalized) ? origin : "";
}

function isMutation(method) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method);
}

function sanitizeFileName(value) {
  let decoded = String(value);
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Keep the raw header value when it is not URI encoded.
  }
  return path.basename(decoded).replace(/[^\p{L}\p{N}._-]/gu, "_").slice(0, 120);
}

function escapeHtmlText(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function shutdown() {
  server.close(async () => {
    await flush();
    closeStore();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
