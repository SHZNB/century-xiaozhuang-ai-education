# 百年晓庄智慧教育平台上线演练报告

生成时间：2026-06-20T11:16:17.814Z

本报告由 `npm run release:rehearsal` 生成，用于在提交、部署或交接前按固定顺序演练关键工作流。演练会刷新环境清单、工作流环境清单、周期运营清单、验收报告、部署自检、上线交接包、部署后烟测报告和 Pages 静态产物，并运行 100 智能体目录校验、服务端集成测试和浏览器产物密钥扫描。

## 汇总

- 通过：14
- 失败：0
- 步骤：14/14

## 步骤

| 状态 | 步骤 | 命令 | 耗时 ms | 输出摘要 |
| --- | --- | --- | ---: | --- |
| PASS | 环境变量清单 | `node scripts/env-check.mjs --write` | 220 | Environment configuration guide written to docs/ENVIRONMENT.md / Environment check passed: 57 variables documented and templated |
| PASS | 工作流环境清单 | `node scripts/workflow-env-report.mjs --write` | 143 | Workflow environment guide written to docs/WORKFLOW_ENVIRONMENT.md / Workflow environment check passed: 6 workflows mapped to server-side model configuration |
| PASS | 周期运营清单 | `node scripts/operations-schedule.mjs --write` | 151 | Operations schedule written to docs/OPERATIONS_SCHEDULE.md / Operations schedule check passed: 16 recurring tasks across 4 cadences |
| PASS | 权限矩阵报告 | `node scripts/permissions-matrix.mjs --write` | 155 | Permission matrix written to docs/PERMISSIONS.md / Permission matrix check passed: 4 roles, 23 permission rows |
| PASS | Coze 链接交接模板 | `node scripts/coze-links-template.mjs --write` | 135 | Coze link template written to docs/COZE_LINKS.md and docs/coze-links-template.csv / Coze link template check passed: 100 agents |
| PASS | 验收报告 | `node scripts/acceptance-check.mjs --write` | 207 | Acceptance check passed: 240 requirements verified / Acceptance report written to docs/ACCEPTANCE.md |
| PASS | 部署自检报告 | `node scripts/deploy-check.mjs --write` | 165 | OK   HTTPS reverse proxy template: Nginx template covers TLS, health checks, upload limits and security headers / OK   Systemd service template: systemd template covers env injection, persistent data directory, restart policy and hardening / OK   Systemd data backup timer: Daily data-directory backup timer archives DATA_DIR, writes SHA-256 checksums and prunes old archives / OK   Disaster recovery rehearsal: Runbook covers backup checksum, DATA_DIR restore, JSON restore, smoke test and evidence capture / OK   Monitoring and alerting templates: Prometheus blackbox templates cover /api/health availability, latency and TLS expiry alerts / OK   Environment handoff: Environment and workflow configuration guides exist / OK   Launch handoff package: Launch package generator and report exist / OK   Coze links handoff: 100-agent Coze published-page template exists / OK   Operations schedule: Recurring operations schedule exists / OK   Post-deploy smoke: Post-deploy smoke script and report exist / Deployment check summary: 16 ok, 10 warnings, 10 failures / Deployment check report written to docs/DEPLOYMENT_CHECK.md |
| PASS | 上线交接包 | `node scripts/launch-package.mjs --write` | 167 | Launch handoff package written to docs/LAUNCH_PACKAGE.md / Launch package check passed: 100 agents, 6 workflows, 8 source reports |
| PASS | 100 智能体与工作流目录校验 | `node scripts/catalog-check.mjs` | 151 | Catalog validation passed / 100 logo-bearing agents, 10 categories, valid routes, and structured teaching workflow specs |
| PASS | 100 智能体 Logo 资产校验 | `node scripts/agent-logo-assets.mjs` | 248 | Agent logo asset check passed: 100 SVG assets match the catalog |
| PASS | 服务端集成测试 | `node scripts/server-test.mjs` | 3979 | Server integration tests passed / Auth, accounts, 100 agents, SQLite persistence, import/export hardening, backup/restore, versions, publish gate, unified gateway, workflows, artifacts, metrics, proof review and quota settlement |
| PASS | GitHub Pages 静态构建 | `node scripts/build-pages.mjs` | 393 | GitHub Pages static artifact written to F:\4.xiaozhuang\pages-dist |
| PASS | 浏览器产物密钥扫描 | `node scripts/browser-secret-scan.mjs` | 169 | Browser secret scan passed: 11 browser/static files checked |
| PASS | 部署后烟测报告 | `node scripts/post-deploy-smoke.mjs --write` | 181 | Post-deploy smoke report written to docs/POST_DEPLOY_SMOKE.md / Post-deploy smoke prepared: 1 checks, 0 failures |

## 说明

- `部署自检报告` 使用非 strict 模式，会保留真实生产 Key、官方素材、SSO 和校友会接口等外部待办，但不会阻断演练。
- 正式上线前仍需单独运行 `npm run check:deploy:strict`，并在生产环境补齐所有阻断项。
- 部署后可设置 `DEPLOY_BASE_URL` 再运行 `npm run smoke:post-deploy:report`，验证线上 Pages 或 Node 服务端地址。
- 浏览器端响应式与核心交互仍由 `npm run test:e2e` 或 CI 的 Playwright 步骤覆盖。
