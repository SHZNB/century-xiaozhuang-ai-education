import { access, mkdir, readFile, rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { buildAgentCatalog } from "./catalog.mjs";
import { teachingWorkflows } from "./workflows.mjs";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(serverDir, "data");
const databasePath = path.join(dataDir, "platform.sqlite");
const legacyStorePath = path.join(dataDir, "store.json");

const initialStore = () => ({
  version: 2,
  users: [],
  sessions: [],
  oauthStates: [],
  branding: defaultBranding(),
  agents: buildAgentCatalog(),
  conversations: [],
  alumniApplications: [],
  alumniIdentities: [],
  tokenGrants: [],
  tokenLedger: [],
  tokenReservations: [],
  modelRuns: [],
  workflows: teachingWorkflows,
  workflowVersions: [],
  artifacts: [],
  agentVersions: [],
  feedbackItems: [],
  auditLogs: []
});

function defaultBranding() {
  return {
    platformName: "百年晓庄智慧教育平台",
    schoolName: "南京晓庄学院",
    logoUrl: "assets/njxzc-seal.png",
    heroImageUrl: "assets/xiaozhuang-century.png",
    primaryColor: "#971728",
    goldColor: "#c99a3f",
    assetStatus: "placeholder",
    authorizationNote: "正式上线前请替换为学校提供的官方校徽、百年校庆标志和授权校园影像。",
    updatedAt: "2026-06-16T00:00:00.000Z"
  };
}

let writeChain = Promise.resolve();
let database;
let state;

export async function initStore() {
  await mkdir(dataDir, { recursive: true });
  database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = FULL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS platform_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      schema_version INTEGER NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const row = database.prepare("SELECT schema_version, payload FROM platform_state WHERE id = 1").get();
  if (row) {
    state = JSON.parse(row.payload);
  } else {
    state = await loadLegacyStore() || initialStore();
    await persist();
    await archiveLegacyStore();
  }

  let changed = false;
  for (const [key, fallback] of Object.entries(initialStore())) {
    if (state[key] === undefined) {
      state[key] = fallback;
      changed = true;
    }
  }
  // The catalog is seeded once. User-created, deleted, or edited agents survive every restart.
  if (!Array.isArray(state.agents) || state.agents.length === 0) {
    state.agents = buildAgentCatalog();
    changed = true;
  }
  if (!Array.isArray(state.workflows) || state.workflows.length === 0) {
    state.workflows = teachingWorkflows;
    changed = true;
  }
  if (state.version !== 2) {
    state.version = 2;
    changed = true;
  }
  if (changed) await persist();
  return state;
}

export function db() {
  if (!state) throw new Error("Store has not been initialized");
  return state;
}

export function mutate(mutator) {
  const result = mutator(state);
  writeChain = writeChain.then(persist);
  return result;
}

export async function flush() {
  await writeChain;
}

export function closeStore() {
  database?.close();
  database = undefined;
}

async function persist() {
  if (!database) throw new Error("Database has not been initialized");
  const payload = JSON.stringify(state);
  const updatedAt = new Date().toISOString();
  database.exec("BEGIN IMMEDIATE");
  try {
    database.prepare(`
      INSERT INTO platform_state (id, schema_version, payload, updated_at)
      VALUES (1, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        schema_version = excluded.schema_version,
        payload = excluded.payload,
        updated_at = excluded.updated_at
    `).run(state.version || 2, payload, updatedAt);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

async function loadLegacyStore() {
  try {
    return JSON.parse(await readFile(legacyStorePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw new Error(`无法迁移旧数据文件 ${legacyStorePath}: ${error.message}`);
  }
}

async function archiveLegacyStore() {
  try {
    await access(legacyStorePath);
    const archivePath = `${legacyStorePath}.migrated-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    await rename(legacyStorePath, archivePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

export { dataDir, databasePath };
