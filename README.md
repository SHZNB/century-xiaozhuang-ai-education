# 百年晓庄智慧教育平台

面向南京晓庄学院百年校庆与智慧教育建设的智能体集成平台。平台不是单页演示，而是包含 Node 服务端、SQLite 持久化、账号与角色、100 个教育智能体、教学工作流、统一模型网关、校友认证与 Token 权益、后台运维和 GitHub Pages 静态预览的完整项目骨架。

## 已实现能力

- 100 个带独立 Logo 标识的教育智能体，覆盖 10 个领域，每类 10 个应用。
- 智能体新增、编辑、Logo 上传、模型路由、提示词、单个或批量测试、发布、下架、导入、导出、版本记录和历史恢复。
- 智能体名称、Logo、接入方式、地址、模型路由或提示词变化后，平台会自动清除旧测试状态并要求重新测试。
- 外部网页、嵌入页和 API 型智能体从草稿或下架状态发布前，必须通过连接测试。
- 管理后台会直接显示“发布前需测试 / 需重测后发布”等门禁提示，并可按“已通过 / 未测试 / 测试失败 / 发布受阻”和“目录达标 / 待补资料”筛选智能体，也可按名称、分类、状态、模型路由和测试状态排序 100 个智能体，支持当前范围治理概览、导出已勾选或当前可见范围。
- 智能体治理概览会显示当前范围的目录质量，提示缺 Logo、简介短、缺负责人、提示词短、推荐问题少、路由或接入地址异常等缺口。
- 智能体导出文件会附带目录质量台账字段，便于按负责人分派整改；再次导入时平台会剥离这些派生字段，不会污染正式配置。
- 超级管理员可导出智能体质量 CSV 台账，服务端会写入审计日志，适合正式上线前分派 100 个应用的整改任务。
- 支持四种智能体接入方式：平台对话、外部网页、网页嵌入、API 接口。
- 管理员可测试平台对话型智能体，也可检测外部网页、嵌入页和 API 型智能体接入是否可达。
- AI 教育统一聊天窗口，支持自动模型路由、会话记录、PDF/图片上传入口和 Token 账本。
- 教学工作流：写教案、做课件、出题组卷、读长文档、网页动画、看图分析。
- 工作流可在后台新增、导入、导出、编辑提示词、维护输入/输出/质检规范、单个或批量测试路由、查看最近测试状态、调整模型、发布、停用、删除和恢复版本。
- 每个教学工作流都包含输入字段、输出结构和质量检查清单，模型调用时会随提示词一起进入服务端路由，便于真实教学成果验收。
- 超级管理员可导出教学工作流质量 CSV 台账，核对路由、发布状态、测试状态、输入输出规范和质检清单缺口。
- 工作流标题、摘要、模型路由、成果类型或提示词变化后，平台会自动清除旧测试状态并要求重新测试。
- 教学工作流从草稿或下架状态发布前，必须通过路由测试。
- 管理后台可按关键词检索教学工作流，按测试状态和流程质量筛选，按名称、模型路由、成果类型、发布状态和测试状态排序，显示当前范围治理概览，并对当前筛选范围执行批量测试、模型调整或导出。
- 成果库：工作流生成的教案、课件、题目、长文档摘要和网页动画会保存为受权限保护的成果文件，支持关键词/类型/工作流筛选、当前范围资产治理概览、当前筛选范围全选、批量删除、后续下载、超级管理员导出资产清单、按保留期批量清理和审计追踪。
- 自动路由策略：长文本/PDF 到 Kimi，教案到 DeepSeek，PPT/HTML 演示到 ChatGPT，网页动画到 Coze，图片理解到 Gemini，中文通用任务到通义/豆包等。
- 校友认证：人工审核、校友会联合认证接口、认证记录 CSV 导出、100 万国产模型 Token 发放、30 天有效期、防重复领取、消费扣减、失败释放、权益运营概览和超级管理员人工额度调整。
- 管理后台：账号角色筛选、账号治理概览、账号台账 CSV 导出、模型状态筛选、配置覆盖概览与批量测试、上线自检按状态/责任方筛选、责任方标注与导出、品牌素材配置、校友审核筛选与权益预估、7/30/90 天运行统计、模型调用台账筛选、当前范围治理概览与导出、Token 消费 CSV 导出、审计日志检索、风险概览与 CSV 导出、反馈队列筛选、治理概览与 CSV 导出、备份恢复。
- 备份恢复：平台备份不包含密码哈希、会话和密钥字段，恢复时会拒绝未来版本和含敏感字段的备份。
- 登录安全：HttpOnly 会话 Cookie、首次登录强制改密、管理员初始/重置密码至少 8 位、最后超级管理员保护、失败登录限流和审计记录。
- 学校统一身份认证：支持可选 OIDC 登录，回调后自动创建或更新本地授权账号，并进入统一审计日志。
- 权限边界：应用管理员可维护智能体和工作流；品牌授权、Token 总账、备份恢复、默认目录重置和账号角色仅限超级管理员。
- 文件安全：PDF、图片和校友证明上传在服务端校验真实文件头，不只依赖浏览器声明的类型。
- 所有 API Key 只在服务端读取，不写入浏览器、localStorage、智能体导出文件或前端响应。
- GitHub Actions 自动执行语法、目录、服务端、浏览器、Pages 构建验证，并构建可交付的 Node 服务端容器镜像。

## 本地运行

需要 Node.js 24 或更高版本，因为服务端使用 `node:sqlite`。

```powershell
npm install
npm start
```

访问：

```text
http://localhost:8080
```

首次启动会创建开发管理员账号。默认账号为 `xz2026`，生产环境必须在 `.env` 中设置强密码，并尽快接入学校统一身份认证。

Linux 服务器不使用 Docker 时，可使用 `deploy/systemd/xiaozhuang-platform.service` 托管 Node 服务端，并把生产密钥放入 `/etc/xiaozhuang-platform.env`，数据目录放入 `/var/lib/xiaozhuang-platform`。`deploy/systemd/xiaozhuang-platform-backup.timer` 可每天归档该数据目录到 `/var/backups/xiaozhuang-platform`，并生成 SHA-256 校验文件。

## 环境配置

本地开发可复制 `.env.example` 为 `.env`，生产部署建议复制 `.env.production.example`：

```powershell
Copy-Item .env.example .env
Copy-Item .env.production.example .env
```

关键配置包括：

- `DEMO_MODE`：本地 demo 验收可设为 `true`，正式上线必须保持 `false`。
- `DEV_ADMIN_PASSWORD`：生产环境必须设置强密码。
- `SESSION_SECRET`：生产环境必须设置 32 位以上随机密钥，用于服务端会话摘要和强制失效。
- `DEEPSEEK_API_KEY`：教案、课程设计、教学评价。
- `MOONSHOT_API_KEY`：Kimi 长文本、PDF、长上下文。
- `OPENAI_API_KEY`：ChatGPT PPT、讲稿、HTML 演示。
- `COZE_API_KEY` 和 `COZE_WORKFLOW_ID`：网页动画工作流。
- `GEMINI_API_KEY`：图片理解。
- `ALUMNI_ASSOCIATION_VERIFY_URL`：校友会联合认证接口，未配置时回退人工审核。
- `SSO_ENABLED`、`SSO_AUTHORIZATION_URL`、`SSO_TOKEN_URL`、`SSO_USERINFO_URL`、`SSO_CLIENT_ID`、`SSO_CLIENT_SECRET`：学校统一身份认证 OIDC 接入，未配置时继续使用平台本地账号。

完整生产部署步骤见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。
教学工作流、模型路由、环境变量和验收责任方的对应关系见 [docs/WORKFLOW_ENVIRONMENT.md](docs/WORKFLOW_ENVIRONMENT.md)。

## 验收命令

```powershell
npm run check
npm run acceptance
npm run test:server
npm run test:e2e
npm run build:pages
npm run check:env
npm run check:env:report
npm run check:workflow-env
npm run check:workflow-env:report
npm run check:deploy
npm run check:deploy:report
npm run check:deploy:strict
npm run operations:schedule
npm run operations:schedule:report
npm run launch:package
npm run launch:package:report
npm run release:rehearsal
npm run scan:browser-secrets
npm run smoke:post-deploy:report
```

`npm run check` 会验证 Node 版本、100 个智能体目录、模型路由、脚本语法等。
`npm run acceptance` 会生成 `docs/ACCEPTANCE.md`，汇总平台关键交付要求和当前代码证据。
`npm test` 会运行服务端集成测试和 Playwright 浏览器验证。
GitHub Actions 会上传 `acceptance-report` 和 `verification-screenshots` 作为验收附件。
`npm run check:env:report` 会生成 `docs/ENVIRONMENT.md`，用于交接生产环境变量、模型 Key、Coze Workflow 和校友会接口配置。
`npm run check:workflow-env:report` 会生成 `docs/WORKFLOW_ENVIRONMENT.md`，用于交接每个教学工作流的首选模型、必要环境变量、备用链路、测试动作和责任方。
`npm run check:deploy:report` 会生成 `docs/DEPLOYMENT_CHECK.md`，用于上线前交接生产配置缺口，并校验 GitHub Actions 是否包含检查、验收、测试、截图和 Pages 发布链路。
`npm run check:deploy:strict` 适合正式上线前使用，会在关键生产配置缺失时失败。
`npm run operations:schedule:report` 会生成 `docs/OPERATIONS_SCHEDULE.md`，把每日、每周、每月、每季度运营任务和责任方固化下来。
`npm run launch:package:report` 会生成 `docs/LAUNCH_PACKAGE.md`，把验收、部署自检、环境变量、工作流环境、责任分派和上线前必办事项汇总为一份交接包。
`npm run release:rehearsal` 会按发布前顺序刷新关键报告、运行目录校验、服务端集成测试和 Pages 构建，并生成 `docs/RELEASE_REHEARSAL.md`。
`npm run scan:browser-secrets` 会扫描前端源码和 `pages-dist/`，防止模型 Key、SSO Secret、校友会密钥或明文密钥进入浏览器产物。
`npm run smoke:post-deploy:report` 会生成 `docs/POST_DEPLOY_SMOKE.md`；设置 `DEPLOY_BASE_URL` 后可检查线上 GitHub Pages 或 Node 服务端地址。

## GitHub Pages 静态预览

静态预览构建命令：

```powershell
npm run build:pages
```

产物输出到 `pages-dist/`。GitHub Pages 可以作为静态前端；登录会话、模型网关、上传、校友审核、Token 扣减、工作流执行和审计日志仍需要部署 Node 服务端。

如果静态前端和 Node 服务端不在同一域名，复制 `config.example.js` 为 `config.js`，填写公开服务地址：

```js
window.XZ_PLATFORM_CONFIG = {
  apiBase: "https://ai.njxzc.edu.cn"
};
```

同时在 Node 服务端 `.env` 中设置 `FRONTEND_ORIGINS=https://你的账号.github.io`、`PUBLIC_FRONTEND_URL=https://你的账号.github.io/仓库名/`，并在 HTTPS 环境下设置 `COOKIE_SAMESITE=None`，这样 GitHub Pages 前端可以使用真实登录、智能体编辑、工作流和校友认证接口，学校统一身份认证完成后也会回到静态前端。

## Docker 部署

```powershell
docker compose up -d --build
```

生产环境建议在前面配置 HTTPS 反向代理，并对数据目录做加密备份。

`deploy/nginx/xiaozhuang-platform.conf` 提供 Nginx HTTPS 反向代理模板，包含 HTTP 跳转 HTTPS、`/api/health` 透传、上传大小限制、长连接代理和基础安全响应头。上线时替换正式域名、证书路径和 upstream 地址后，先执行 `nginx -t`，再运行部署后烟测。

`deploy/monitoring/` 提供 Prometheus + blackbox_exporter 健康监控和告警模板，可对 `/api/health`、响应时间、HTTPS 证书到期和探测指标缺失进行告警。

推送到 `main` 或手动触发 GitHub Actions 时，`.github/workflows/container.yml` 会校验 `docker compose config`、构建服务端镜像，并把非 PR 构建发布到 GitHub Container Registry；交付附件同时包含 Docker、Nginx 和 systemd 模板：

```text
ghcr.io/<组织或账号>/<仓库>/century-xiaozhuang-server
```

镜像只包含 Node 服务端和静态资源，不包含任何模型 API Key、SSO Secret 或校友会接口密钥；生产密钥仍通过 `.env`、云平台 Secret 或容器运行环境注入。

## 品牌素材

后台“品牌素材配置”可以维护：

- 平台名称
- 学校名称
- 官方校徽地址
- 主视觉地址
- 晓庄红与校庆金
- 素材授权状态
- 授权说明

当前 `assets/school-mark.svg` 和 `assets/xiaozhuang-century.png` 是开发资源位。正式上线前必须替换为学校提供或授权的官方校徽、百年校庆标志、校园/校史/陶行知/师生活动图片，并在后台将素材状态标记为“校方授权正式素材”。

## 后台运维

管理员可在应用管理后台完成：

- 智能体目录维护和接入测试
- 教学工作流维护
- 模型提供方状态查看和连接测试
- 校友认证审核
- 用户账号与角色维护
- 品牌素材配置
- Token 发放与模型消费账本导出
- 上线自检
- 平台备份与恢复
- 反馈处理和审计追踪

上线自检会检查生产密码、关键模型 Key、Coze Workflow、校友会接口、官方素材、GitHub Pages 产物、Docker/Compose 文件等，并支持按关键词和“阻断 / 提醒 / 通过”状态筛选及导出当前清单。

## 文件结构

```text
.
├── .github/workflows/pages.yml
├── assets/
├── docs/
├── pages-dist/
├── scripts/
│   ├── build-pages.mjs
│   ├── catalog-check.mjs
│   ├── deploy-check.mjs
│   ├── runtime-check.mjs
│   ├── server-test.mjs
│   ├── verify.mjs
│   └── workflow-env-report.mjs
├── server/
│   ├── auth.mjs
│   ├── catalog.mjs
│   ├── index.mjs
│   ├── models.mjs
│   ├── store.mjs
│   └── workflows.mjs
├── app.js
├── index.html
├── styles.css
├── Dockerfile
├── compose.yml
└── package.json
```

## 上线前仍需学校提供

- 官方校徽 SVG 或透明 PNG。
- 百年校庆标志和标准色值。
- 授权校园、校史、陶行知和师生活动照片。
- 生产 API Key 与 Coze Workflow ID。
- 校友会联合认证接口协议。
- 学校统一身份认证方案。

这些属于外部生产条件；代码已提供接入位置、后台配置、验收脚本和上线自检。
