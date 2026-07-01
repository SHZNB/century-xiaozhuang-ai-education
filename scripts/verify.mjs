import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = path.resolve(import.meta.dirname, "..");
const node = process.execPath;
const testDataDir = await mkdtemp(path.join(os.tmpdir(), "xiaozhuang-e2e-"));
const port = await getAvailablePort();
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn(node, ["server/index.mjs"], {
  cwd: root,
  stdio: "ignore",
  env: { ...process.env, PORT: String(port), DATA_DIR: testDataDir, DEV_ADMIN_PASSWORD: "xz2026", DEMO_MODE: "true" }
});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const screenshotDir = path.join(root, "screenshots");
await mkdir(screenshotDir, { recursive: true });

try {
  await waitForServer(baseUrl);
  const launchOptions = { headless: true };
  if (process.env.CHROME_PATH) launchOptions.executablePath = process.env.CHROME_PATH;
  else if (process.platform === "win32") launchOptions.executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", message => {
    if (message.type() === "error"
      && !message.text().includes("503 (Service Unavailable)")
      && !message.text().includes("401 (Unauthorized)")) consoleErrors.push(message.text());
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator("#appShell:not([hidden])").waitFor();
  await page.getByRole("heading", { name: /陶老师/ }).waitFor();
  await openManagement(page);
  await Promise.race([
    page.locator("#view-management.active").waitFor({ timeout: 5000 }).catch(() => null),
    page.locator("#loginScreen.active").waitFor({ timeout: 5000 }).catch(() => null)
  ]);
  if (await page.locator("#loginScreen.active").isVisible().catch(() => false)) {
    await page.locator("#username").fill("xz2026");
    await page.locator("#password").fill("xz2026");
    await page.getByRole("button", { name: "登录平台" }).click();
    await page.locator("#loginScreen.active").waitFor({ state: "hidden" });
    await openManagement(page);
  }
  await page.locator("#view-management.active").waitFor();
  await page.getByRole("heading", { name: "智能体应用管理" }).waitFor();
  await page.screenshot({ path: path.join(screenshotDir, "dashboard-desktop.png"), fullPage: true });
  await page.getByText("100", { exact: true }).first().waitFor();
  await page.locator("#managementTestStatus").waitFor({ state: "visible" });
  await page.locator("#managementQuality").waitFor({ state: "visible" });
  await page.locator("#managementSort").waitFor({ state: "visible" });
  await page.locator("#managementQuality").selectOption("ready");
  await page.locator("#managementQuality").selectOption("all");
  await page.locator("#managementSort").selectOption("category-asc");
  await page.locator("#managementSort").selectOption("id-asc");
  await page.locator("#agentGovernance").waitFor();
  await page.locator("#agentGovernance").getByText("目录质量").waitFor();
  await page.locator("#managementTable").getByText(/目录达标|待补/).first().waitFor();
  await page.locator("#exportAgentQuality").waitFor();
  await page.locator("#exportVisibleAgents").waitFor();
  await page.locator("#bulkAgentTestButton").waitFor();
  await page.locator("#workflowTestStatus").waitFor();
  await page.locator("#workflowQuality").waitFor();
  await page.locator("#workflowSearch").waitFor();
  await page.locator("#workflowSort").waitFor();
  await page.locator("#workflowQuality").selectOption("needs_attention");
  await page.locator("#workflowQuality").selectOption("all");
  await page.locator("#workflowSearch").fill("PPT");
  await page.locator("#workflowSort").selectOption("route-asc");
  await page.locator("#workflowSearch").fill("");
  await page.locator("#workflowSort").selectOption("id-asc");
  await page.locator("#workflowGovernance").waitFor();
  await page.locator("#workflowGovernance").getByText("流程质量").waitFor();
  await page.locator("#workflowManagement").getByText(/输入 \d+ · 输出 \d+ · 质检 \d+/).first().waitFor();
  await page.locator("#workflowManagement").getByText(/流程达标|待补/).first().waitFor();
  await page.locator("[data-edit-workflow-spec]").first().waitFor();
  await page.locator("#exportWorkflowQuality").waitFor();
  await page.locator("#exportVisibleWorkflows").waitFor();
  await page.locator("#bulkWorkflowRouteButton").waitFor();
  await page.locator("#bulkWorkflowTestButton").waitFor();
  await page.locator("#exportUsers").waitFor();
  await page.locator("#userSearch").waitFor();
  await page.locator("#userRoleFilter").waitFor();
  await page.locator("#userStatusFilter").waitFor();
  await page.locator("#userSearch").fill("xz2026");
  await page.locator("#userRoleFilter").selectOption("super_admin");
  await page.locator("#userStatusFilter").selectOption("active");
  await page.locator("#userResultCount").waitFor();
  await page.locator("#userGovernance").waitFor();
  await page.locator("#userSearch").fill("");
  await page.locator("#userRoleFilter").selectOption("all");
  await page.locator("#userStatusFilter").selectOption("all");
  await page.locator("#tokenAdjustmentForm").waitFor();
  await page.locator("#tokenAdjustUser").waitFor();
  await page.locator("#metricsWindow").waitFor();
  await page.locator("#metricsWindow").selectOption("30");
  await page.locator("#metricsWindow").selectOption("90");
  await page.locator("#metricsWindow").selectOption("7");
  await page.locator("#modelRunSearch").waitFor();
  await page.locator("#modelRunStatusFilter").waitFor();
  await page.locator("#modelRunRouteFilter").waitFor();
  await page.locator("#modelRunGovernance").waitFor();
  await page.locator("#providerSearch").waitFor();
  await page.locator("#bulkProviderTest").waitFor();
  await page.locator("#providerConfigFilter").waitFor();
  await page.locator("#providerTypeFilter").waitFor();
  await page.locator("#providerGovernance").waitFor();
  await page.locator("#providerSearch").fill("Kimi");
  await page.locator("#providerConfigFilter").selectOption("missing");
  await page.locator("#providerTypeFilter").selectOption("domestic");
  await page.locator("#providerResultCount").waitFor();
  await page.locator("#providerSearch").fill("");
  await page.locator("#providerConfigFilter").selectOption("all");
  await page.locator("#providerTypeFilter").selectOption("all");
  await page.locator("#exportAlumni").waitFor();
  await page.locator("#alumniReviewSearch").waitFor();
  await page.locator("#alumniReviewStatus").waitFor();
  await page.locator("#alumniReviewGovernance").waitFor();
  await page.locator("#exportFeedback").waitFor();
  await page.locator("#auditSearch").waitFor();
  await page.locator("#auditActionFilter").waitFor();
  await page.locator("#auditGovernance").waitFor();
  await page.locator("#readinessSearch").waitFor();
  await page.locator("#readinessLevelFilter").waitFor();
  await page.locator("#readinessOwnerFilter").waitFor();
  await page.locator("#exportReadiness").waitFor();
  await page.locator("#readinessSearch").fill("API");
  await page.locator("#readinessLevelFilter").selectOption("fail");
  await page.locator("#readinessOwnerFilter").selectOption({ index: 1 });
  await page.locator("#readinessResultCount").waitFor();
  await page.locator("#readinessSearch").fill("");
  await page.locator("#readinessLevelFilter").selectOption("all");
  await page.locator("#readinessOwnerFilter").selectOption("all");
  await page.locator("#feedbackSearch").waitFor();
  await page.locator("#feedbackStatusFilter").waitFor();
  await page.locator("#feedbackTypeFilter").waitFor();
  await page.locator("#feedbackGovernance").waitFor();
  await page.locator(".management-row small", { hasText: "未测试" }).first().waitFor();
  await page.screenshot({ path: path.join(screenshotDir, "management-desktop.png"), fullPage: true });

  await page.locator('[data-view="artifacts"]').click();
  await page.locator("#exportArtifacts").waitFor();
  await page.locator("#artifactSearch").waitFor();
  await page.locator("#artifactTypeFilter").waitFor();
  await page.locator("#artifactWorkflowFilter").waitFor();
  await page.locator("#artifactGovernance").waitFor();
  await page.locator("#selectVisibleArtifacts").waitFor();
  await page.locator("#bulkDeleteArtifacts").waitFor();

  await page.getByRole("button", { name: "AI 教育助手" }).click();
  await page.getByRole("heading", { name: "人工智能＋教育" }).waitFor();
  await page.getByPlaceholder("输入教学问题，或上传 PDF、图片…").fill("请为小学五年级编写一份完整教案");
  await page.getByRole("button", { name: "发送" }).click();
  await page.locator("#aiMessages").getByText(/DeepSeek · 教案与教学设计/).waitFor();
  await page.getByText(/本次失败不会扣减 Token/).waitFor();
  await page.screenshot({ path: path.join(screenshotDir, "ai-chat-desktop.png"), fullPage: true });

  await page.getByRole("button", { name: "校友认证" }).click();
  const alumniForm = page.locator("#alumniForm");
  await alumniForm.getByLabel("姓名").fill("测试校友");
  await alumniForm.getByLabel("毕业年份").fill("2012");
  await alumniForm.getByLabel("院系").fill("教师教育学院");
  await alumniForm.getByLabel("专业").fill("小学教育");
  await alumniForm.getByLabel("联系电话").fill("13800000000");
  await alumniForm.getByLabel("电子邮箱").fill("alumni@example.com");
  await alumniForm.getByLabel(/我同意/).check();
  await page.setInputFiles("#alumniProof", {
    name: "proof.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 test")
  });
  await page.getByRole("button", { name: "提交认证申请" }).click();
  await page.getByText("审核中").waitFor();
  await page.getByRole("button", { name: "应用管理" }).click();
  const proofLink = page.getByRole("link", { name: "查看证明" });
  await proofLink.waitFor();
  const proofHref = await proofLink.getAttribute("href");
  const proofResponse = await context.request.get(new URL(proofHref, page.url()).href);
  if (!proofResponse.ok() || proofResponse.headers()["content-type"] !== "application/pdf") {
    throw new Error("Alumni reviewer could not securely open the proof PDF");
  }
  await page.screenshot({ path: path.join(screenshotDir, "alumni-review-desktop.png"), fullPage: true });
  await page.getByRole("button", { name: "审核通过" }).click();
  await page.getByRole("button", { name: "校友认证" }).click();
  await page.getByText("已认证校友").waitFor();
  await page.getByText("+1,000,000").waitFor();
  await page.screenshot({ path: path.join(screenshotDir, "alumni-desktop.png"), fullPage: true });

  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  if (desktopOverflow) {
    const offenders = await page.evaluate(() => [...document.querySelectorAll("*")]
      .filter(element => element.getBoundingClientRect().right > window.innerWidth + 1)
      .slice(0, 8)
      .map(element => `${element.tagName}.${element.className}[type=${element.getAttribute("type") || ""}][name=${element.getAttribute("name") || ""}] right=${Math.round(element.getBoundingClientRect().right)}`));
    throw new Error(`Desktop has horizontal overflow: ${offenders.join(" | ")}`);
  }

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(baseUrl, { waitUntil: "networkidle" });
  await mobile.screenshot({ path: path.join(screenshotDir, "dashboard-mobile.png"), fullPage: true });
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  if (mobileOverflow) throw new Error("Mobile has horizontal overflow");
  if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);

  console.log("Verification passed");
  console.log("100 agents, AI routing, alumni review, token grant, desktop and mobile layouts");
  await browser.close();
} finally {
  if (server.exitCode === null) {
    server.kill("SIGTERM");
    await new Promise(resolve => server.once("exit", resolve));
  }
  await rm(testDataDir, { recursive: true, force: true });
}

async function getAvailablePort() {
  return await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();
    probe.on("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() => resolve(address.port));
    });
  });
}

async function waitForServer(url) {
  let lastError;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Server exited before verification started with code ${server.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(150);
  }
  throw new Error(`Server did not become ready at ${url}: ${lastError?.message || "unknown error"}`);
}

async function openManagement(page) {
  const nav = page.locator(".admin-nav").first();
  await nav.waitFor({ state: "attached" });
  await nav.click().catch(async () => {
    await nav.evaluate(element => element.click());
  });
}
