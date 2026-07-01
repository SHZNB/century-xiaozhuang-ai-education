import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const steps = [
  ["环境变量清单", ["scripts/env-check.mjs", "--write"]],
  ["工作流环境清单", ["scripts/workflow-env-report.mjs", "--write"]],
  ["周期运营清单", ["scripts/operations-schedule.mjs", "--write"]],
  ["权限矩阵报告", ["scripts/permissions-matrix.mjs", "--write"]],
  ["Coze 链接交接模板", ["scripts/coze-links-template.mjs", "--write"]],
  ["验收报告", ["scripts/acceptance-check.mjs", "--write"]],
  ["部署自检报告", ["scripts/deploy-check.mjs", "--write"]],
  ["上线交接包", ["scripts/launch-package.mjs", "--write"]],
  ["100 智能体与工作流目录校验", ["scripts/catalog-check.mjs"]],
  ["100 智能体 Logo 资产校验", ["scripts/agent-logo-assets.mjs"]],
  ["服务端集成测试", ["scripts/server-test.mjs"]],
  ["GitHub Pages 静态构建", ["scripts/build-pages.mjs"]],
  ["浏览器产物密钥扫描", ["scripts/browser-secret-scan.mjs"]],
  ["部署后烟测报告", ["scripts/post-deploy-smoke.mjs", "--write"]]
];

const results = [];

await mkdir(path.join(root, "docs"), { recursive: true });
await writeFile(path.join(root, "docs/RELEASE_REHEARSAL.md"), renderReport(results), "utf8");

for (const [name, args] of steps) {
  const startedAt = Date.now();
  const result = await runNode(args);
  results.push({
    name,
    command: `node ${args.join(" ")}`,
    status: result.code === 0 ? "PASS" : "FAIL",
    durationMs: Date.now() - startedAt,
    output: compactOutput(`${result.stdout}\n${result.stderr}`)
  });
  const mark = result.code === 0 ? "OK" : "FAIL";
  console.log(`${mark.padEnd(4)} ${name} (${Date.now() - startedAt} ms)`);
  if (result.code !== 0) break;
}

await writeFile(path.join(root, "docs/RELEASE_REHEARSAL.md"), renderReport(results), "utf8");
console.log("Release rehearsal report written to docs/RELEASE_REHEARSAL.md");

if (results.some(item => item.status === "FAIL")) {
  console.error("Release rehearsal failed.");
  process.exit(1);
}

console.log(`Release rehearsal passed: ${results.length} steps`);

function runNode(args) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, args, {
      cwd: root,
      env: process.env,
      shell: false,
      windowsHide: true
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk.toString(); });
    child.stderr.on("data", chunk => { stderr += chunk.toString(); });
    child.on("close", code => resolve({ code, stdout, stderr }));
  });
}

function compactOutput(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .slice(-12)
    .join(" / ")
    .replace(/\|/g, "\\|");
}

function renderReport(items) {
  const generatedAt = new Date().toISOString();
  const passCount = items.filter(item => item.status === "PASS").length;
  const failCount = items.filter(item => item.status === "FAIL").length;
  const pending = steps.slice(items.length).map(([name, args]) => ({
    name,
    command: `node ${args.join(" ")}`,
    status: "PENDING",
    durationMs: "",
    output: "待执行"
  }));
  const rows = [...items, ...pending].map(item =>
    `| ${item.status} | ${item.name} | \`${item.command}\` | ${item.durationMs} | ${item.output || "无输出"} |`
  ).join("\n");
  return `# 百年晓庄智慧教育平台上线演练报告

生成时间：${generatedAt}

本报告由 \`npm run release:rehearsal\` 生成，用于在提交、部署或交接前按固定顺序演练关键工作流。演练会刷新环境清单、工作流环境清单、周期运营清单、验收报告、部署自检、上线交接包、部署后烟测报告和 Pages 静态产物，并运行 100 智能体目录校验、服务端集成测试和浏览器产物密钥扫描。

## 汇总

- 通过：${passCount}
- 失败：${failCount}
- 步骤：${items.length}/${steps.length}

## 步骤

| 状态 | 步骤 | 命令 | 耗时 ms | 输出摘要 |
| --- | --- | --- | ---: | --- |
${rows}

## 说明

- \`部署自检报告\` 使用非 strict 模式，会保留真实生产 Key、官方素材、SSO 和校友会接口等外部待办，但不会阻断演练。
- 正式上线前仍需单独运行 \`npm run check:deploy:strict\`，并在生产环境补齐所有阻断项。
- 部署后可设置 \`DEPLOY_BASE_URL\` 再运行 \`npm run smoke:post-deploy:report\`，验证线上 Pages 或 Node 服务端地址。
- 浏览器端响应式与核心交互仍由 \`npm run test:e2e\` 或 CI 的 Playwright 步骤覆盖。
`;
}
