import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db, mutate } from "./store.mjs";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password, encoded) {
  const [salt, hash] = String(encoded).split(":");
  if (!salt || !hash) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function ensureDevelopmentUsers() {
  const defaultUsername = process.env.DEV_ADMIN_USERNAME || "xz2026";
  const defaultPassword = process.env.DEV_ADMIN_PASSWORD || "xz2026";
  if (db().users.length) {
    mutate(store => {
      store.users = store.users.map(user => {
        if (user.username !== defaultUsername || user.mustChangePassword !== undefined) return user;
        const isDefaultPassword = !process.env.DEV_ADMIN_PASSWORD && verifyPassword("xz2026", user.passwordHash);
        return { ...user, mustChangePassword: isDefaultPassword, updatedAt: new Date().toISOString() };
      });
    });
    return;
  }
  const now = new Date().toISOString();
  mutate(store => {
    store.users.push({
      id: "user-admin",
      username: defaultUsername,
      passwordHash: hashPassword(defaultPassword),
      displayName: "陶老师",
      role: "super_admin",
      department: "教师教育学院",
      status: "active",
      mustChangePassword: !process.env.DEV_ADMIN_PASSWORD,
      createdAt: now
    });
  });
}

export function createSession(userId, persistent = false) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + (persistent ? SESSION_TTL_MS : 12 * 60 * 60 * 1000)).toISOString();
  const tokenHash = sessionTokenHash(token);
  mutate(store => {
    store.sessions = store.sessions.filter(session => !session.token && new Date(session.expiresAt) > new Date());
    store.sessions.push({ tokenHash, userId, expiresAt });
  });
  return { token, expiresAt };
}

export function migrateSessionStorage() {
  let removed = 0;
  mutate(store => {
    const before = store.sessions.length;
    store.sessions = store.sessions.filter(session => !session.token && session.tokenHash);
    removed = before - store.sessions.length;
  });
  return { legacySessionsRemoved: removed };
}

export function createOAuthState(provider = "oidc") {
  const state = randomBytes(24).toString("base64url");
  const nonce = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  mutate(store => {
    store.oauthStates = (store.oauthStates || []).filter(item => new Date(item.expiresAt) > new Date());
    store.oauthStates.push({ state, nonce, provider, expiresAt });
  });
  return { state, nonce, expiresAt };
}

export function consumeOAuthState(state, provider = "oidc") {
  const existing = (db().oauthStates || []).find(item => item.state === state && item.provider === provider && new Date(item.expiresAt) > new Date());
  mutate(store => {
    store.oauthStates = (store.oauthStates || []).filter(item => item.state !== state);
  });
  return existing || null;
}

export function upsertSsoUser(profile, options = {}) {
  const now = new Date().toISOString();
  const username = String(profile.username || "").trim().toLowerCase();
  if (!username) throw new Error("SSO profile does not contain a username");
  const existing = db().users.find(user => user.username.toLowerCase() === username);
  const role = ["teacher", "agent_admin", "alumni_reviewer", "super_admin"].includes(options.defaultRole)
    ? options.defaultRole
    : "teacher";
  const next = existing ? {
    ...existing,
    displayName: profile.displayName || existing.displayName || username,
    department: profile.department || existing.department || "南京晓庄学院",
    status: existing.status || "active",
    ssoProvider: options.provider || "oidc",
    ssoSubject: profile.subject || existing.ssoSubject || username,
    ssoEmail: profile.email || existing.ssoEmail || "",
    updatedAt: now
  } : {
    id: `user-sso-${randomBytes(8).toString("hex")}`,
    username,
    passwordHash: hashPassword(randomBytes(32).toString("base64url")),
    displayName: profile.displayName || username,
    role,
    department: profile.department || "南京晓庄学院",
    status: "active",
    mustChangePassword: false,
    ssoProvider: options.provider || "oidc",
    ssoSubject: profile.subject || username,
    ssoEmail: profile.email || "",
    createdAt: now,
    updatedAt: now
  };
  mutate(store => {
    if (existing) store.users = store.users.map(user => user.id === existing.id ? next : user);
    else store.users.push(next);
  });
  return next;
}

export function destroySession(token) {
  const tokenHash = sessionTokenHash(token);
  mutate(store => {
    store.sessions = store.sessions.filter(session => !session.token && session.tokenHash !== tokenHash);
  });
}

export function userFromRequest(request) {
  const cookies = parseCookies(request.headers.cookie || "");
  const token = cookies.xz_session;
  if (!token) return null;
  const tokenHash = sessionTokenHash(token);
  const session = db().sessions.find(item => item.tokenHash === tokenHash && new Date(item.expiresAt) > new Date());
  return session ? db().users.find(user => user.id === session.userId) || null : null;
}

function sessionTokenHash(token) {
  const secret = process.env.SESSION_SECRET || process.env.DEV_ADMIN_PASSWORD || "development-session-secret";
  return createHmac("sha256", secret).update(String(token)).digest("hex");
}

export function parseCookies(value) {
  return Object.fromEntries(value.split(";").map(item => item.trim()).filter(Boolean).map(item => {
    const separator = item.indexOf("=");
    return [decodeURIComponent(item.slice(0, separator)), decodeURIComponent(item.slice(separator + 1))];
  }));
}

export function sessionCookie(token, expiresAt) {
  const sameSite = normalizedSameSite();
  const secure = process.env.NODE_ENV === "production" || sameSite === "None" ? "; Secure" : "";
  return `xz_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=${sameSite}; Expires=${new Date(expiresAt).toUTCString()}${secure}`;
}

export function clearSessionCookie() {
  const sameSite = normalizedSameSite();
  const secure = process.env.NODE_ENV === "production" || sameSite === "None" ? "; Secure" : "";
  return `xz_session=; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=0${secure}`;
}

function normalizedSameSite() {
  const configured = process.env.COOKIE_SAMESITE || (process.env.FRONTEND_ORIGINS ? "None" : "Strict");
  const value = String(configured).trim().toLowerCase();
  if (value === "none") return "None";
  if (value === "lax") return "Lax";
  return "Strict";
}

export function publicUser(user) {
  return user && {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    department: user.department,
    status: user.status || "active",
    mustChangePassword: Boolean(user.mustChangePassword)
  };
}

export function canManage(user) {
  return ["super_admin", "agent_admin"].includes(user?.role);
}

export function canReviewAlumni(user) {
  return ["super_admin", "alumni_reviewer"].includes(user?.role);
}
