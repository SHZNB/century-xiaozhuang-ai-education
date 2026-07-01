import { buildAgentCatalog } from "../server/catalog.mjs";
import { routeById } from "../server/models.mjs";
import { teachingWorkflows } from "../server/workflows.mjs";

const agents = buildAgentCatalog();
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

assert(agents.length === 100, `Expected exactly 100 default agents, found ${agents.length}`);

const ids = new Set();
const names = new Set();
const categories = new Map();

for (let index = 0; index < agents.length; index += 1) {
  const agent = agents[index];
  const expectedId = `agent-${String(index + 1).padStart(3, "0")}`;
  assert(agent.id === expectedId, `Agent ${index + 1} should use id ${expectedId}, found ${agent.id}`);
  assert(!ids.has(agent.id), `Duplicate agent id: ${agent.id}`);
  assert(!names.has(agent.name), `Duplicate agent name: ${agent.name}`);
  ids.add(agent.id);
  names.add(agent.name);
  categories.set(agent.category, (categories.get(agent.category) || 0) + 1);

  assert(agent.name && agent.name.length <= 50, `${agent.id} has invalid name`);
  assert(agent.logoText || agent.logoImage, `${agent.id} must have a logoText or logoImage`);
  assert(agent.logoImage === `assets/agents/${agent.id}.svg`, `${agent.id} must point to its generated SVG logo asset`);
  assert(/^https:\/\/www\.coze\.cn\/store\/agent\/xiaozhuang-century-[0-9]{3}$/.test(agent.cozeUrl || ""), `${agent.id} must have a Coze published agent URL placeholder`);
  assert(agent.icon, `${agent.id} must have a lucide icon`);
  assert(/^#[0-9a-f]{6}$/i.test(agent.color), `${agent.id} must have a valid primary color`);
  assert(/^#[0-9a-f]{6,8}$/i.test(agent.bg), `${agent.id} must have a valid logo background color`);
  assert(agent.owner, `${agent.id} must have an owner`);
  assert(agent.description && agent.description.length >= 20, `${agent.id} description is too short`);
  assert(agent.mode === "local", `${agent.id} should default to local mode`);
  assert(["published", "draft", "offline"].includes(agent.status), `${agent.id} has invalid status`);
  assert(routeById(agent.routeHint), `${agent.id} has invalid routeHint ${agent.routeHint}`);
  assert(agent.systemPrompt && agent.systemPrompt.length >= 40, `${agent.id} needs a production-grade systemPrompt`);
  assert(Array.isArray(agent.prompts) && agent.prompts.length >= 3, `${agent.id} should include starter prompts`);
}

assert(categories.size === 10, `Expected 10 categories, found ${categories.size}`);
for (const [category, count] of categories) {
  assert(count === 10, `Category ${category} should contain 10 agents, found ${count}`);
}

const requiredWorkflowRoutes = {
  lesson: "deepseek",
  ppt: "chatgpt",
  document: "kimi",
  animation: "coze",
  image: "gemini"
};

assert(teachingWorkflows.length >= 6, `Expected at least 6 teaching workflows, found ${teachingWorkflows.length}`);

const workflowIds = new Set();
for (const workflow of teachingWorkflows) {
  assert(!workflowIds.has(workflow.id), `Duplicate workflow id: ${workflow.id}`);
  workflowIds.add(workflow.id);
  assert(workflow.title && workflow.summary, `${workflow.id} needs title and summary`);
  assert(routeById(workflow.routeHint), `${workflow.id} has invalid routeHint ${workflow.routeHint}`);
  assert(workflow.artifactType, `${workflow.id} needs artifactType`);
  assert(workflow.status === "published", `${workflow.id} should ship as published`);
  assert(workflow.systemPrompt && workflow.systemPrompt.length >= 30, `${workflow.id} needs a production-grade systemPrompt`);
  assert(Array.isArray(workflow.inputFields) && workflow.inputFields.length >= 4, `${workflow.id} needs structured input fields`);
  assert(Array.isArray(workflow.outputSections) && workflow.outputSections.length >= 4, `${workflow.id} needs structured output sections`);
  assert(Array.isArray(workflow.qualityChecklist) && workflow.qualityChecklist.length >= 3, `${workflow.id} needs quality checklist items`);
}

for (const [id, route] of Object.entries(requiredWorkflowRoutes)) {
  const workflow = teachingWorkflows.find(item => item.id === id);
  assert(workflow, `Missing required workflow ${id}`);
  assert(workflow?.routeHint === route, `Workflow ${id} should route to ${route}, found ${workflow?.routeHint}`);
}

if (failures.length) {
  console.error("Catalog validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Catalog validation passed");
console.log("100 logo-bearing agents, 10 categories, valid routes, and structured teaching workflow specs");
