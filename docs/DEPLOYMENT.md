# 百年晓庄智慧教育平台生产部署说明

本项目可以生成 GitHub Pages 静态预览，但完整平台需要运行 Node 服务端。校友认证、模型调用、Token 账本、智能体编辑、文件上传、工作流产物和审计日志都依赖服务端。

## 部署形态

### GitHub Pages 静态预览

适合公开展示页面视觉、100 个智能体目录、品牌风格和基础交互。

```powershell
npm run build:pages
```

产物目录为 `pages-dist/`。Pages 环境不保存 API Key，不提供真实模型调用、校友认证审核、后台持久化和上传文件处理。

### Node 服务端部署

适合学校服务器、云主机、阿里云 ECS、Docker 或内网服务。

```powershell
Copy-Item .env.production.example .env
npm run check
npm run check:deploy
npm start
```

生产上线前必须执行：

```powershell
npm run check:deploy:strict
```

严格检查通过后，再开放给师生和校友使用。

### Linux systemd 部署

不使用 Docker 的学校服务器或云主机可以使用 `deploy/systemd/xiaozhuang-platform.service` 常驻运行 Node 服务端。建议目录约定如下：

```text
/opt/xiaozhuang-platform        # 项目代码
/var/lib/xiaozhuang-platform    # SQLite、上传证明和工作流成果
/etc/xiaozhuang-platform.env    # 生产环境变量和密钥
```

首次部署示例：

```bash
sudo useradd --system --home /opt/xiaozhuang-platform --shell /usr/sbin/nologin xiaozhuang
sudo mkdir -p /opt/xiaozhuang-platform /var/lib/xiaozhuang-platform
sudo chown -R xiaozhuang:xiaozhuang /opt/xiaozhuang-platform /var/lib/xiaozhuang-platform
sudo install -m 600 .env.production.example /etc/xiaozhuang-platform.env
sudo install -m 644 deploy/systemd/xiaozhuang-platform.service /etc/systemd/system/xiaozhuang-platform.service
sudo install -m 644 deploy/systemd/xiaozhuang-platform-backup.service /etc/systemd/system/xiaozhuang-platform-backup.service
sudo install -m 644 deploy/systemd/xiaozhuang-platform-backup.timer /etc/systemd/system/xiaozhuang-platform-backup.timer
sudo systemctl daemon-reload
sudo systemctl enable --now xiaozhuang-platform
sudo systemctl enable --now xiaozhuang-platform-backup.timer
sudo systemctl status xiaozhuang-platform
systemctl list-timers xiaozhuang-platform-backup.timer
```

更新配置后执行：

```bash
sudo systemctl restart xiaozhuang-platform
journalctl -u xiaozhuang-platform -f
```

`/etc/xiaozhuang-platform.env` 中的模型 Key、SSO Secret 和校友会接口密钥只由服务端读取，不写入前端或平台 JSON 备份。

`deploy/systemd/xiaozhuang-platform-backup.timer` 会每天 02:20 左右运行 `xiaozhuang-platform-backup.service`，把 `/var/lib/xiaozhuang-platform` 打包到 `/var/backups/xiaozhuang-platform`，生成 `.tar.gz` 和 `.sha256`，并清理 30 天前的归档。该文件级备份用于 SQLite、上传证明和工作流成果；后台“平台备份”导出的 JSON 用于配置和运营元数据，二者需要一起归档。

灾备恢复演练按 `docs/DISASTER_RECOVERY.md` 执行：先校验 DATA_DIR 归档 SHA-256，再恢复到隔离目录，启动临时服务，导入平台备份 JSON，最后运行部署后烟测并留存 `platform.restore` 审计证据。

### 监控与告警

`deploy/monitoring/prometheus.yml` 和 `deploy/monitoring/xiaozhuang-platform-alerts.yml` 提供 Prometheus + blackbox_exporter 模板。上线前替换：

- `https://ai-xiaozhuang.example.edu.cn/api/health` 为正式域名。
- `blackbox-exporter:9115` 为实际 blackbox exporter 地址。
- 告警通知路由由学校现有 Alertmanager、短信、企业微信或云监控平台接管。

模板会探测 `/api/health`，并提供服务不可用、健康检查变慢、HTTPS 证书 14 天内到期、探测指标缺失等告警。若学校使用阿里云监控或其他平台，可按同样指标语义配置：HTTP 2xx、响应时间、TLS 到期和连续探测失败。

### Docker Compose 部署

```powershell
Copy-Item .env.production.example .env
docker compose up --build -d
docker compose logs -f xiaozhuang-platform
```

`compose.yml` 会把平台数据保存到 `xiaozhuang-data` 卷。正式运维时建议把 `/data` 映射到学校可备份的持久化目录，并纳入每日备份。

容器内置健康检查会访问：

```text
http://127.0.0.1:8080/api/health
```

`/api/health` 面向负载均衡、Docker 和云监控，返回服务、数据目录、目录规模、工作流规模和模型配置数量摘要，不返回任何 API Key。后台“上线自检”面向管理员，继续用于检查生产密码、模型 Key、授权素材、智能体目录质量和工作流质量。

### HTTPS 反向代理

`deploy/nginx/xiaozhuang-platform.conf` 提供 Nginx 反向代理模板，适合放在学校网关、阿里云 ECS 或内网 Nginx 前置节点。上线前需要替换：

- `server_name`：正式域名，例如 `ai-xiaozhuang.njxzc.edu.cn`。
- `ssl_certificate` 和 `ssl_certificate_key`：学校或云平台签发的证书路径。
- `upstream xiaozhuang_platform_node`：Node 服务端地址，默认指向 `127.0.0.1:8080`。

模板已经包含 HTTP 到 HTTPS 跳转、`/api/health` 透传、上传大小限制、长连接超时、WebSocket/流式响应代理头和基础安全响应头。部署后可执行：

```powershell
nginx -t
$env:DEPLOY_BASE_URL="https://你的域名"
npm run smoke:post-deploy:report
```

### GitHub Actions 服务端镜像

`.github/workflows/container.yml` 会在 PR、推送到 `main` 和手动触发时执行服务端容器链路：

```text
npm run check:env
npm run check:workflow-env
npm run check:deploy
docker compose config
docker/build-push-action
```

PR 只构建并检查镜像；推送到 `main` 或手动触发时，会发布到 GitHub Container Registry：

```text
ghcr.io/<组织或账号>/<仓库>/century-xiaozhuang-server
```

工作流会上传 `server-container-handoff` 附件，包含 `Dockerfile`、`compose.yml`、`.env.production.example`、Nginx 反向代理模板、systemd 服务模板和部署说明，便于交给学校服务器、阿里云 ECS 或内网运维团队。镜像不包含任何模型密钥、SSO Secret 或校友会接口密钥，生产环境仍通过 `.env`、云平台 Secret 或容器运行环境注入。

## 必填生产配置

从 `.env.production.example` 复制 `.env` 后，至少设置：

- `NODE_ENV=production`
- `DEMO_MODE=false`
- `DEV_ADMIN_USERNAME`
- `DEV_ADMIN_PASSWORD`
- `SESSION_SECRET`
- `DEEPSEEK_API_KEY`
- `MOONSHOT_API_KEY`
- `OPENAI_API_KEY`
- `COZE_API_KEY`
- `COZE_WORKFLOW_ID`
- `GEMINI_API_KEY`

建议同时配置：

- `QWEN_API_KEY`
- `DOUBAO_API_KEY`
- `GLM_API_KEY`
- `ERNIE_API_KEY`
- `HUNYUAN_API_KEY`
- `ALUMNI_ASSOCIATION_VERIFY_URL`
- `ALUMNI_ASSOCIATION_API_KEY`
- `SSO_ENABLED`
- `SSO_AUTHORIZATION_URL`
- `SSO_TOKEN_URL`
- `SSO_USERINFO_URL`
- `SSO_CLIENT_ID`
- `SSO_CLIENT_SECRET`
- `FRONTEND_ORIGINS`
- `PUBLIC_FRONTEND_URL`
- `COOKIE_SAMESITE`

所有模型密钥只放在服务端 `.env`、云平台 Secret 或容器运行环境中，不能写入 `index.html`、`app.js`、浏览器存储或 GitHub Pages 静态产物。

## GitHub Pages 前端连接 Node 服务

如果使用 GitHub Pages 承载静态前端、学校服务器或云主机承载 Node 服务：

1. 将 `config.example.js` 复制为 `config.js`。
2. 在 `config.js` 中设置 `window.XZ_PLATFORM_CONFIG.apiBase` 为 Node 服务的 HTTPS 根地址，例如 `https://ai.njxzc.edu.cn`。
3. 在 Node 服务端 `.env` 中设置 `FRONTEND_ORIGINS` 为允许访问的静态前端来源，多个来源用英文逗号分隔。
4. 设置 `PUBLIC_FRONTEND_URL` 为公开前端根地址，学校统一身份认证完成后会跳回该地址。
5. 当前端与 Node 服务不属于同一站点时，将 `COOKIE_SAMESITE=None`，并确保 Node 服务通过 HTTPS 暴露；服务端会自动给会话 Cookie 加 `Secure`。
6. 运行 `npm run build:pages` 后发布 `pages-dist/`，再使用 `DEPLOY_BASE_URL` 运行部署后烟测。

`config.js` 只能包含公开服务地址，不能写入模型密钥、SSO Secret、校友会密钥或任何服务端凭据。

## 学校统一身份认证

平台支持 OIDC 授权码登录。取得学校统一身份认证系统的应用登记信息后，在 `.env` 中配置：

```env
SSO_ENABLED=true
SSO_AUTHORIZATION_URL=
SSO_TOKEN_URL=
SSO_USERINFO_URL=
SSO_CLIENT_ID=
SSO_CLIENT_SECRET=
SSO_REDIRECT_URI=https://你的域名/api/auth/sso/callback
SSO_USERNAME_CLAIM=preferred_username
SSO_DISPLAY_NAME_CLAIM=name
SSO_DEPARTMENT_CLAIM=department
SSO_DEFAULT_ROLE=teacher
```

首次通过 SSO 登录的用户会自动创建为本地授权账号，默认角色为 `teacher`。超级管理员可在后台调整为应用管理员或校友审核员。SSO 的 access token 只用于服务端读取 userinfo，不进入数据库、前端页面或浏览器存储。

## 模型与工作流路由

平台默认按教育任务自动路由：

| 任务 | 默认路由 |
| --- | --- |
| 长文本、PDF、长上下文 | Kimi |
| 教案、课程设计、教学评价 | DeepSeek |
| PPT 大纲、讲稿、HTML 演示 | ChatGPT |
| HTML 网页与交互动画 | Coze Workflow |
| 图片理解 | Gemini |
| 中文通用任务 | 通义千问、豆包 |
| 教育政策与知识任务 | 文心一言、智谱 GLM |
| 服务故障备用 | 腾讯混元 |

管理员可以在后台编辑 100 个智能体的 Logo、提示词、模型路由、发布状态和接入方式，也可以维护教学工作流的提示词、路由和版本。

## 校友认证与权益

首期可以使用人工审核。管理员审核通过后，系统会一次性发放 `1,000,000` 国产模型 Token，有效期为审核通过后连续 30 天，同一校友只能领取一次。

取得校友会接口后，配置：

```env
ALUMNI_ASSOCIATION_VERIFY_URL=
ALUMNI_ASSOCIATION_API_KEY=
```

平台会优先调用联合认证接口，失败或未配置时继续保留人工审核流程。

## 官方素材替换

上线前必须替换开发占位素材：

- `assets/school-mark.svg`
- `assets/xiaozhuang-century.png`

替换后进入后台“平台运营”区域，把素材状态设为“校方授权正式素材”。未取得授权的官网或专题站图片只能作为风格参考，不能直接复制上线。

## 上线前验收

建议每次发布前执行：

```powershell
npm run acceptance
npm run check
npm test
npm run build:pages
npm run check:env:report
npm run operations:schedule:report
npm run check:deploy
npm run check:deploy:report
npm run launch:package:report
npm run release:rehearsal
npm run scan:browser-secrets
npm run smoke:post-deploy:report
```

`npm run check:deploy:report` 会生成 `docs/DEPLOYMENT_CHECK.md`，便于给学校信息化部门、云平台运维或项目组交接上线缺口。
该部署自检也会检查 GitHub Actions Pages 工作流是否包含 `npm run check`、`npm run acceptance`、`npm test`、截图上传和 Pages 发布步骤，并检查服务端容器工作流是否包含 Compose 校验、Docker 镜像构建、GHCR 发布和容器交付附件，避免静态预览或服务端镜像绕过自动验收。
`npm run check:env:report` 会生成 `docs/ENVIRONMENT.md`，用于核对服务端实际使用的环境变量、`.env` 模板和生产密钥交接范围。
`npm run operations:schedule:report` 会生成 `docs/OPERATIONS_SCHEDULE.md`，用于固化上线后的每日、每周、每月和每季度运营动作。
`npm run launch:package:report` 会生成 `docs/LAUNCH_PACKAGE.md`，把验收、部署自检、环境变量、工作流环境和责任分派汇总为上线交接包。
`npm run release:rehearsal` 会生成 `docs/RELEASE_REHEARSAL.md`，按发布前顺序演练报告刷新、目录校验、服务端集成测试和 Pages 构建。
`npm run scan:browser-secrets` 会扫描浏览器源码和 GitHub Pages 产物，防止服务端密钥名称或疑似明文密钥进入前端。
`npm run smoke:post-deploy:report` 会生成 `docs/POST_DEPLOY_SMOKE.md`；设置 `DEPLOY_BASE_URL` 后可检查线上首页、GitHub Pages 静态说明和 Node `/api/health`。

GitHub Actions 会自动上传 `acceptance-report`、`deployment-check-report`、`environment-config-guide`、`workflow-environment-guide`、`operations-schedule`、`launch-handoff-package`、`release-rehearsal-report`、`post-deploy-smoke-report`、`verification-screenshots` 和 `server-container-handoff`，用于核对 100 个智能体、工作流路由、校友权益、后台编辑、品牌配置、响应式界面和服务端容器交付。
