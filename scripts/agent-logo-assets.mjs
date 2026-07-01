import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAgentCatalog } from "../server/catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logoDir = path.join(root, "assets", "agents");
const shouldWrite = process.argv.includes("--write");
const agents = buildAgentCatalog();
const failures = [];

if (shouldWrite) await mkdir(logoDir, { recursive: true });

for (const [index, agent] of agents.entries()) {
  const relativePath = `assets/agents/${agent.id}.svg`;
  const absolutePath = path.join(root, relativePath);
  const expected = renderLogo(agent, index);
  if (agent.logoImage !== relativePath) {
    failures.push(`${agent.id} logoImage should be ${relativePath}`);
  }
  if (shouldWrite) {
    await writeFile(absolutePath, expected, "utf8");
    continue;
  }
  try {
    const actual = await readFile(absolutePath, "utf8");
    if (actual !== expected) failures.push(`${relativePath} is out of date; run npm run logos:generate`);
  } catch {
    failures.push(`${relativePath} is missing; run npm run logos:generate`);
  }
}

if (agents.length !== 100) failures.push(`Expected 100 agents, found ${agents.length}`);

if (failures.length) {
  console.error("Agent logo asset check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(shouldWrite
  ? `Generated ${agents.length} agent logo SVG assets in assets/agents`
  : `Agent logo asset check passed: ${agents.length} SVG assets match the catalog`);

function renderLogo(agent, index) {
  const text = escapeXml(agent.logoText || agent.name.slice(0, 1));
  const category = escapeXml(agent.category);
  const id = escapeXml(agent.id);
  const color = normalizeColor(agent.color, "#8b2332");
  const bg = normalizeColor(agent.bg, "#f6f1ea");
  const shape = index % 6;
  const accent = renderAccent(shape, color);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-labelledby="title desc" data-agent-id="${id}">
  <title>${escapeXml(agent.name)} Logo</title>
  <desc>${category} intelligent agent logo for 百年晓庄智慧教育平台</desc>
  <rect width="128" height="128" rx="18" fill="${bg}"/>
  <rect x="0" y="0" width="128" height="18" fill="${color}"/>
  <rect x="10" y="24" width="108" height="94" rx="14" fill="#fffaf2" opacity=".82"/>
  ${accent}
  <text x="64" y="77" text-anchor="middle" font-family="SimSun, STSong, serif" font-size="44" font-weight="800" fill="${color}">${text}</text>
  <text x="64" y="100" text-anchor="middle" font-family="Microsoft YaHei, Arial, sans-serif" font-size="10" font-weight="700" fill="#4a4138">${category}</text>
  <text x="64" y="116" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" letter-spacing="1.4" fill="#8d8174">${id.toUpperCase()}</text>
</svg>
`;
}

function renderAccent(shape, color) {
  const common = `fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".92"`;
  if (shape === 0) return `<circle cx="64" cy="58" r="31" ${common}/>`;
  if (shape === 1) return `<path d="M64 27 96 58 64 89 32 58Z" ${common}/>`;
  if (shape === 2) return `<path d="M34 76c12-34 48-46 60-14 6 15-6 30-24 30H45" ${common}/>`;
  if (shape === 3) return `<path d="M35 39h58v42H35zM47 93h34" ${common}/>`;
  if (shape === 4) return `<path d="M35 83c12-36 26-48 58-58M35 45c18 6 35 5 58-4" ${common}/>`;
  return `<path d="M32 63h64M64 31v64M42 41l44 44M86 41 42 85" ${common}/>`;
}

function normalizeColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? value : fallback;
}

function escapeXml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&apos;"
  })[char]);
}
