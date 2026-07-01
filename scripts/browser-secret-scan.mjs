import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = [
  "index.html",
  "config.js",
  "config.example.js",
  "app.js",
  "styles.css",
  "pages-dist/index.html",
  "pages-dist/config.js",
  "pages-dist/config.example.js",
  "pages-dist/app.js",
  "pages-dist/styles.css",
  "pages-dist/DEPLOYMENT-NOTE.txt"
];
const secretNames = [
  "MOONSHOT_API_KEY",
  "DEEPSEEK_API_KEY",
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
  "COZE_API_KEY",
  "COZE_WORKFLOW_ID",
  "QWEN_API_KEY",
  "DOUBAO_API_KEY",
  "GLM_API_KEY",
  "ERNIE_API_KEY",
  "HUNYUAN_API_KEY",
  "ALUMNI_ASSOCIATION_API_KEY",
  "SSO_CLIENT_SECRET"
];
const secretValuePatterns = [
  /sk-[A-Za-z0-9_-]{20,}/,
  /sk-proj-[A-Za-z0-9_-]{20,}/,
  /AIza[0-9A-Za-z_-]{20,}/,
  /Bearer\s+[A-Za-z0-9._-]{20,}/i,
  /api[_-]?key\s*[:=]\s*["'][^"']{8,}["']/i,
  /client[_-]?secret\s*[:=]\s*["'][^"']{8,}["']/i
];
const failures = [];

for (const target of await existingTargets()) {
  const text = await readFile(path.join(root, target), "utf8");
  for (const name of secretNames) {
    if (text.includes(name)) failures.push(`${target} contains server-only variable ${name}`);
  }
  for (const pattern of secretValuePatterns) {
    const match = text.match(pattern);
    if (match) failures.push(`${target} contains possible secret value pattern ${pattern}: ${redact(match[0])}`);
  }
}

if (failures.length) {
  console.error("Browser secret scan failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Browser secret scan passed: ${targets.length} browser/static files checked`);

async function existingTargets() {
  const found = [];
  for (const target of targets) {
    try {
      await readFile(path.join(root, target), "utf8");
      found.push(target);
    } catch {
      failures.push(`${target} is missing; run npm run build:pages before scanning static output`);
    }
  }
  await assertNoExtraStaticScripts(found);
  return found;
}

async function assertNoExtraStaticScripts(found) {
  try {
    const entries = await readdir(path.join(root, "pages-dist"), { recursive: true, withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const relative = path.join("pages-dist", entry.parentPath ? path.relative(path.join(root, "pages-dist"), path.join(entry.parentPath, entry.name)) : entry.name).replaceAll("\\", "/");
      if (/\.(html|js|css|txt)$/i.test(relative) && !found.includes(relative)) {
        found.push(relative);
      }
    }
  } catch {
    failures.push("pages-dist is missing; run npm run build:pages before scanning static output");
  }
}

function redact(value) {
  if (value.length <= 10) return "***";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
