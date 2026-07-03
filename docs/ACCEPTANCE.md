# 百年晓庄智慧教育平台验收清单

生成时间：2026-07-03T01:24:22.463Z

结果：240 项通过，0 项失败。

> 本清单由 `npm run acceptance` 生成，用于证明平台关键交付要求仍被当前代码满足。生产上线前仍需完成真实 API Key、官方素材、校友会接口和统一身份认证配置。

| 状态 | 模块 | 验收项 | 证据 |
|---|---|---|---|
| PASS | 智能体目录 | 默认目录严格包含 100 个智能体 | 100 agents |
| PASS | 智能体目录 | 10 个领域各 10 个智能体 | 校史文化:10, 教学支持:10, 学生发展:10, 科研创新:10, 校园服务:10, 教师发展:10, 师范教育:10, 数字创作:10, 专业学习:10, 治理决策:10 |
| PASS | 智能体目录 | 每个智能体都有 Logo 标识 | logoText/logoImage present |
| PASS | 智能体目录 | 默认 100 个智能体绑定独立 SVG Logo 资产并纳入校验工作流 | assets/agents/*.svg |
| PASS | 智能体目录 | 100 个教育智能体都预留 Coze 发布页链接且图标可跳转 | cozeUrl link |
| PASS | 智能体目录 | 点击智能体 Logo 可打开对应 Coze 发布智能体页面并进入上线自检 | agent logo Coze link |
| PASS | 智能体目录 | 每个智能体默认模型路由有效 | routeById(routeHint) |
| PASS | 智能体目录 | 每个智能体包含生产级系统提示词 | systemPrompt >= 40 chars |
| PASS | 智能体编辑 | 支持 local 接入模式 | index.html mode=local |
| PASS | 智能体编辑 | 支持 external 接入模式 | index.html mode=external |
| PASS | 智能体编辑 | 支持 embed 接入模式 | index.html mode=embed |
| PASS | 智能体编辑 | 支持 api 接入模式 | index.html mode=api |
| PASS | 智能体编辑 | 管理端包含 data-edit-agent | data-edit-agent |
| PASS | 智能体编辑 | 管理端包含 data-test-agent | data-test-agent |
| PASS | 智能体编辑 | 管理端包含 data-duplicate-agent | data-duplicate-agent |
| PASS | 智能体编辑 | 管理端包含 data-bulk-agent-status | data-bulk-agent-status |
| PASS | 智能体编辑 | 管理端包含 bulkRouteButton | bulkRouteButton |
| PASS | 智能体编辑 | 管理端包含 bulkAgentTestButton | bulkAgentTestButton |
| PASS | 智能体编辑 | 管理端包含 logoUpload | logoUpload |
| PASS | 智能体编辑 | 管理端包含 agentForm | agentForm |
| PASS | 智能体编辑 | 管理端包含 importAgents | importAgents |
| PASS | 智能体编辑 | 管理端包含 exportAgents | exportAgents |
| PASS | 智能体编辑 | 管理员可批量导入 100 个 Coze 发布页链接并写入版本审计 | Coze link bulk import |
| PASS | 智能体编辑 | Coze 发布页限制为官方公开域名且占位链接进入质量台账 | Coze URL governance |
| PASS | 智能体编辑 | 后台可导出 100 个 Coze 发布页回填模板 | Coze link template export |
| PASS | 智能体编辑 | 智能体支持按勾选或筛选范围导出 | selected/filtered export |
| PASS | 智能体编辑 | 智能体支持显式导出当前可见范围 | visible agent export |
| PASS | 智能体编辑 | 智能体导入支持合并或替换策略 | merge/replace import |
| PASS | 智能体接入 | 外部网页/API 智能体可服务端检测 | server/index.mjs testAgentConnection |
| PASS | 智能体编辑 | 服务端支持复制智能体为草稿副本 | agent duplicate endpoint |
| PASS | 智能体编辑 | 支持批量调整智能体模型路由 | bulk route |
| PASS | 智能体接入 | 智能体连接测试结果持久化并进入上线自检 | lastTestStatus readiness |
| PASS | 智能体接入 | 智能体关键配置变更后自动要求重新测试 | agent test invalidation |
| PASS | 智能体接入 | 外部/API 智能体发布前必须通过连接测试 | agent publish test gate |
| PASS | 智能体接入 | 管理端显示智能体发布前测试门禁提示 | agent publish gate UI |
| PASS | 智能体编辑 | 管理员可查看智能体版本差异摘要用于审核和恢复 | agent version diff |
| PASS | 智能体接入 | 管理员可批量测试选中智能体并同步测试状态 | bulk agent tests |
| PASS | 智能体接入 | 管理端可按测试状态筛选智能体 | agent test status filter |
| PASS | 智能体编辑 | 管理端可按目录质量筛选智能体 | agent quality filter |
| PASS | 智能体编辑 | 管理端可按名称、分类、状态、路由和测试状态排序智能体 | agent management sort |
| PASS | 智能体编辑 | 管理端显示当前筛选范围的智能体治理概览 | agent governance overview |
| PASS | 智能体编辑 | 管理端显示智能体目录质量缺口 | agent quality governance |
| PASS | 智能体编辑 | 智能体导出包含目录质量台账字段 | agent quality export |
| PASS | 智能体编辑 | 超级管理员可导出智能体质量 CSV 台账 | agent quality CSV export |
| PASS | 智能体编辑 | 智能体质量 CSV 包含模型路由配置、缺失环境变量和备用路线字段 | agent route env CSV |
| PASS | 智能体编辑 | 超级管理员可导出智能体与工作流版本历史 CSV 台账 | version history CSV export |
| PASS | 智能体接入 | 前端测试按钮接入连接检测结果 | app.js Checking agent connection |
| PASS | 教学工作流 | 内置至少 6 个教学工作流 | 6 workflows |
| PASS | 教学工作流 | 包含 lesson 工作流 | 写教案 |
| PASS | 自动模型路由 | lesson 默认路由到 deepseek | deepseek |
| PASS | 教学工作流 | 包含 ppt 工作流 | 做课件 |
| PASS | 自动模型路由 | ppt 默认路由到 chatgpt | chatgpt |
| PASS | 教学工作流 | 包含 document 工作流 | 读长文档 |
| PASS | 自动模型路由 | document 默认路由到 kimi | kimi |
| PASS | 教学工作流 | 包含 animation 工作流 | 网页动画 |
| PASS | 自动模型路由 | animation 默认路由到 coze | coze |
| PASS | 教学工作流 | 包含 image 工作流 | 看图分析 |
| PASS | 自动模型路由 | image 默认路由到 gemini | gemini |
| PASS | 教学工作流 | 后台包含 api("/api/admin/workflows" | api("/api/admin/workflows" |
| PASS | 教学工作流 | 后台包含 createWorkflow | createWorkflow |
| PASS | 教学工作流 | 后台包含 testWorkflow | testWorkflow |
| PASS | 教学工作流 | 后台包含 bulkTestWorkflows | bulkTestWorkflows |
| PASS | 教学工作流 | 后台包含 duplicateWorkflow | duplicateWorkflow |
| PASS | 教学工作流 | 后台包含 importWorkflows | importWorkflows |
| PASS | 教学工作流 | 后台包含 exportWorkflows | exportWorkflows |
| PASS | 教学工作流 | 后台包含 workflowVersions | workflowVersions |
| PASS | 教学工作流 | 后台包含 bulkWorkflowRouteButton | bulkWorkflowRouteButton |
| PASS | 教学工作流 | 后台包含 bulkWorkflowTestButton | bulkWorkflowTestButton |
| PASS | 教学工作流 | 工作流导入支持合并或替换策略 | merge/replace workflow import |
| PASS | 教学工作流 | 工作流支持导出当前筛选范围并保持导入兼容格式 | visible workflow export |
| PASS | 教学工作流 | 支持批量调整工作流模型路由 | workflow bulk route |
| PASS | 教学工作流 | 管理员可测试工作流路由且不沉淀普通成果 | workflow.test |
| PASS | 教学工作流 | 管理员可批量测试选中工作流并同步测试状态 | bulk workflow tests |
| PASS | 教学工作流 | 工作流测试结果持久化并进入上线自检 | workflow lastTestStatus readiness |
| PASS | 教学工作流 | 工作流关键配置变更后自动要求重新测试 | workflow test invalidation |
| PASS | 教学工作流 | 工作流发布前必须通过路由测试 | workflow publish test gate |
| PASS | 教学工作流 | 管理端显示工作流发布前测试门禁提示 | workflow publish gate UI |
| PASS | 教学工作流 | 管理员可查看工作流版本差异摘要用于审核结构化配置变更 | workflow version diff |
| PASS | 教学工作流 | 管理端可按测试状态筛选工作流 | workflow test status filter |
| PASS | 教学工作流 | 管理端可按质量筛选工作流 | workflow quality filter |
| PASS | 教学工作流 | 管理端可按关键词检索并按名称、路由、成果类型、状态和测试状态排序工作流 | workflow search and sort |
| PASS | 教学工作流 | 管理端显示当前筛选范围的工作流治理概览 | workflow governance overview |
| PASS | 教学工作流 | 包含工作流模型环境交接清单和校验脚本 | workflow environment guide |
| PASS | 教学工作流 | 内置工作流包含输入字段、输出结构和质量检查清单 | workflow structured specs |
| PASS | 教学工作流 | 服务端保存并校验工作流结构化规范 | workflow spec normalization |
| PASS | 教学工作流 | 管理端展示并检索工作流结构化规范和质量状态 | workflow spec UI |
| PASS | 教学工作流 | 工作流管理显示每条流程的模型路由配置状态和缺失环境变量 | workflow route env status |
| PASS | 教学工作流 | 管理员可编辑工作流输入输出和质量规范 | workflow spec editor |
| PASS | 教学工作流 | 超级管理员可导出工作流质量 CSV 台账 | workflow quality CSV export |
| PASS | 教学工作流 | 工作流质量 CSV 包含模型路由配置、缺失环境变量和备用路线字段 | workflow route env CSV |
| PASS | 服务端 API | 实现 /api/auth/login | /api/auth/login |
| PASS | 服务端 API | 实现 /api/auth/sso/config | /api/auth/sso/config |
| PASS | 服务端 API | 实现 /api/auth/sso | /api/auth/sso |
| PASS | 服务端 API | 实现 /api/auth/sso/callback | /api/auth/sso/callback |
| PASS | 服务端 API | 实现 /api/health | /api/health |
| PASS | 服务端 API | 实现 /api/admin/agents | /api/admin/agents |
| PASS | 服务端 API | 实现 /api/admin/agents/coze-links | /api/admin/agents/coze-links |
| PASS | 服务端 API | 实现 /api/admin/agents/bulk | /api/admin/agents/bulk |
| PASS | 服务端 API | 实现 /api/admin/workflows | /api/admin/workflows |
| PASS | 服务端 API | 实现 /api/admin/workflows/bulk | /api/admin/workflows/bulk |
| PASS | 服务端 API | 实现 /api/admin/workflows-quality.csv | /api/admin/workflows-quality.csv |
| PASS | 服务端 API | 实现 /api/admin/providers.csv | /api/admin/providers.csv |
| PASS | 服务端 API | 实现 /api/admin/model-runs | /api/admin/model-runs |
| PASS | 服务端 API | 实现 /api/admin/model-runs.csv | /api/admin/model-runs.csv |
| PASS | 服务端 API | 实现 /api/admin/artifacts/cleanup | /api/admin/artifacts/cleanup |
| PASS | 服务端 API | 实现 /api/admin/artifacts.csv | /api/admin/artifacts.csv |
| PASS | 服务端 API | 实现 /api/admin/users.csv | /api/admin/users.csv |
| PASS | 服务端 API | 实现 /api/admin/agents-quality.csv | /api/admin/agents-quality.csv |
| PASS | 服务端 API | 实现 /api/admin/version-history.csv | /api/admin/version-history.csv |
| PASS | 服务端 API | 实现 /api/admin/token-adjustments | /api/admin/token-adjustments |
| PASS | 服务端 API | 实现 /api/admin/token-ledger.csv | /api/admin/token-ledger.csv |
| PASS | 服务端 API | 实现 /api/admin/audit-logs.csv | /api/admin/audit-logs.csv |
| PASS | 服务端 API | 实现 /api/admin/feedback.csv | /api/admin/feedback.csv |
| PASS | 服务端 API | 实现 /api/admin/alumni/applications.csv | /api/admin/alumni/applications.csv |
| PASS | 服务端 API | 实现 /api/chat/stream | /api/chat/stream |
| PASS | 服务端 API | 实现 /api/artifacts | /api/artifacts |
| PASS | 服务端 API | 实现 /api/alumni/applications | /api/alumni/applications |
| PASS | 服务端 API | 实现 /api/admin/readiness | /api/admin/readiness |
| PASS | 服务端 API | 实现 /api/admin/branding | /api/admin/branding |
| PASS | 服务端 API | 实现 /api/admin/backup | /api/admin/backup |
| PASS | 服务端 API | 实现 /api/admin/restore | /api/admin/restore |
| PASS | 服务端 API | 实现 /api/admin/catalog/reset | /api/admin/catalog/reset |
| PASS | 服务端 API | 实现 /api/admin/maintenance | /api/admin/maintenance |
| PASS | 教学工作流 | 服务端支持复制工作流模板 | workflow duplicate endpoint |
| PASS | 校友权益 | 校友认证发放 1,000,000 Token | server/index.mjs 1000000 |
| PASS | 校友权益 | 校友权益有效期 30 天 | 30 days expression |
| PASS | 校友权益 | 支持校友会联合认证接口 | ALUMNI_ASSOCIATION_VERIFY_URL |
| PASS | 校友权益 | 运行统计展示校友 Token 权益运营概览 | quota metrics |
| PASS | Token 账本 | 国产模型额度预留、结算和失败释放 | reserve/release |
| PASS | Token 账本 | 超级管理员可人工补发或扣减活跃校友 Token 并写入审计 | manual token adjustment |
| PASS | Token 账本 | 管理员可导出模型消费 CSV 账本 | token ledger CSV export |
| PASS | 审计日志 | 超级管理员可导出脱敏审计 CSV | audit log CSV export |
| PASS | 审计日志 | 管理后台可按关键词和动作筛选审计日志 | audit filters |
| PASS | 审计日志 | 审计日志显示当前筛选范围治理概览 | audit governance |
| PASS | 安全边界 | 超级管理员可导出脱敏账号台账 CSV 并写入审计 | user CSV export |
| PASS | 安全边界 | 账号管理支持按关键词、角色和状态筛选 | user filters |
| PASS | 安全边界 | 账号管理显示当前筛选范围治理概览 | user governance |
| PASS | 用户反馈 | 超级管理员可导出反馈 CSV 并写入审计 | feedback CSV export |
| PASS | 用户反馈 | 反馈队列支持按关键词、状态和类型筛选 | feedback filters |
| PASS | 用户反馈 | 反馈队列显示当前筛选范围治理概览 | feedback governance |
| PASS | 校友权益 | 超级管理员可导出校友认证 CSV 并写入审计 | alumni CSV export |
| PASS | 校友权益 | 校友认证审核支持按关键词和状态筛选 | alumni review filters |
| PASS | 校友权益 | 校友认证审核显示当前筛选范围治理概览 | alumni review governance |
| PASS | 教学工作流 | 工作流成果沉淀到用户成果库并可下载 | artifact library |
| PASS | 教学工作流 | 成果库支持按关键词、类型和工作流筛选 | artifact filters |
| PASS | 教学工作流 | 成果库显示当前筛选范围资产治理概览 | artifact governance |
| PASS | 教学工作流 | 成果库支持权限校验的成果删除和审计 | artifact.delete |
| PASS | 教学工作流 | 成果库支持当前筛选范围全选和批量删除 | artifact bulk delete |
| PASS | 教学工作流 | 超级管理员可按保留天数清理旧成果文件 | artifact.cleanup |
| PASS | 教学工作流 | 超级管理员可导出成果资产清单 CSV | artifact CSV export |
| PASS | 模型网关 | 后台查看模型状态并测试连接 | providers API |
| PASS | 模型网关 | 超级管理员可导出脱敏模型供应商配置状态 CSV 台账 | provider status CSV export |
| PASS | 模型网关 | 后台模型路由状态支持按关键词、配置状态和模型类型筛选 | provider filters |
| PASS | 模型网关 | 后台模型路由状态显示缺失的服务端环境变量且不泄露密钥值 | provider missing env |
| PASS | 模型网关 | 后台可批量测试已配置模型供应商连接 | bulk provider tests |
| PASS | 模型网关 | 后台模型路由状态显示供应商配置覆盖治理概览 | provider governance |
| PASS | 模型网关 | 自动路由支持备用模型链路和审计证据 | fallbackUsed/attempts |
| PASS | 模型网关 | 后台记录并展示脱敏模型调用台账 | model run ledger |
| PASS | 模型网关 | 模型调用台账支持按关键词、状态和路由筛选 | model run filters |
| PASS | 模型网关 | 模型调用台账显示当前筛选范围治理概览 | model run governance |
| PASS | 模型网关 | 超级管理员可导出模型调用台账 CSV | model run CSV export |
| PASS | 运营统计 | 后台运行统计支持 7/30/90 天周期切换 | metrics window |
| PASS | 运营统计 | 包含周期运营清单生成器 | scripts/operations-schedule.mjs |
| PASS | 运营统计 | 生成上线后周期运营清单 | docs/OPERATIONS_SCHEDULE.md |
| PASS | 安全边界 | 包含角色权限矩阵生成器 | scripts/permissions-matrix.mjs |
| PASS | 安全边界 | 生成上线交接权限矩阵 | docs/PERMISSIONS.md |
| PASS | 安全边界 | 上线演练覆盖权限矩阵报告 | release rehearsal permissions matrix |
| PASS | 模型网关 | 存在 kimi 路由 | kimi |
| PASS | 模型网关 | 存在 deepseek 路由 | deepseek |
| PASS | 模型网关 | 存在 chatgpt 路由 | chatgpt |
| PASS | 模型网关 | 存在 coze 路由 | coze |
| PASS | 模型网关 | 存在 gemini 路由 | gemini |
| PASS | 模型网关 | 存在 qwen 路由 | qwen |
| PASS | 安全边界 | 前端不包含模型 API Key 名称或密钥配置 | app.js secret scan |
| PASS | 安全边界 | 包含浏览器产物密钥扫描脚本 | scripts/browser-secret-scan.mjs |
| PASS | 安全边界 | 上线演练覆盖浏览器产物密钥扫描 | release rehearsal secret scan |
| PASS | 安全边界 | 服务端会话 token 以 SESSION_SECRET HMAC 摘要形式持久化并进入生产门禁 | SESSION_SECRET session HMAC |
| PASS | 安全边界 | 服务启动和维护任务会清理旧结构原始会话 token | legacy session cleanup |
| PASS | 安全边界 | 登录失败节流和审计记录 | login throttle |
| PASS | 安全边界 | 账号管理保护最后一个可用超级管理员并统一 8 位初始密码 | super admin safety |
| PASS | 部署 | 备份恢复拒绝未来版本和敏感字段 | backup restore guard |
| PASS | 部署 | 平台备份包含 manifest 计数和 SHA-256 校验并在恢复前校验完整性 | backup manifest checksum |
| PASS | 部署 | 超级管理员可运行平台维护清理过期会话、SSO 状态和 Token 预占并写入审计 | platform maintenance |
| PASS | 部署 | 上线自检按审计记录核查最近备份和维护节奏 | operations cadence readiness |
| PASS | 安全边界 | 支持学校统一身份认证 OIDC 登录并自动映射本地账号 | SSO OIDC login |
| PASS | 部署 | 统一身份认证配置进入上线自检和环境清单 | SSO env/readiness |
| PASS | 部署 | Coze 工作流 URL、Key 和 Workflow ID 进入生产门禁 | COZE_API_URL/COZE_WORKFLOW_ID |
| PASS | 部署 | 部署自检覆盖 100 个 Coze 发布页回填模板交接 | Coze links deploy handoff |
| PASS | 安全边界 | 高风险后台操作仅超级管理员可见和可调用 | super admin only controls |
| PASS | 安全边界 | 服务端校验上传文件真实类型并审计拒绝记录 | upload signature validation |
| PASS | 品牌与上线 | 品牌配置持久化 | store branding |
| PASS | 品牌与上线 | 后台可维护品牌素材 | brandingForm/API |
| PASS | 品牌与上线 | 后台上线自检面板 | readiness |
| PASS | 品牌与上线 | 上线自检覆盖 Coze Workflow URL 与 100 个 Coze 发布页回填状态 | Coze readiness gates |
| PASS | 品牌与上线 | 上线自检支持按关键词、状态和责任方筛选 | readiness filters |
| PASS | 品牌与上线 | 上线自检支持导出当前筛选清单 CSV | readiness CSV export |
| PASS | 品牌与上线 | 上线自检与部署报告标注责任方便于分派 | readiness owner |
| PASS | 品牌与上线 | 上线自检覆盖智能体目录和工作流质量 | catalog/workflow readiness |
| PASS | 品牌与上线 | 上线自检覆盖智能体和工作流质量治理缺口 | quality governance readiness |
| PASS | 品牌与上线 | 上线自检覆盖智能体和工作流版本治理状态 | version governance readiness |
| PASS | 智能体编辑 | 管理员可恢复默认 100 智能体和教学工作流目录 | catalog reset |
| PASS | 部署 | 包含容器部署文件 | Dockerfile + compose.yml |
| PASS | 部署 | 包含服务端容器镜像构建、Compose 校验和 GHCR 发布工作流 | container.yml server image CI |
| PASS | 部署 | 包含公开健康检查和容器健康检查 | /api/health + HEALTHCHECK |
| PASS | 部署 | Demo 验收模式可放宽真实外部依赖但保留生产上线门禁 | DEMO_MODE readiness |
| PASS | 部署 | 包含 HTTPS Nginx 反向代理模板并进入部署自检 | deploy/nginx/xiaozhuang-platform.conf |
| PASS | 部署 | 包含非容器 Linux 服务器 systemd 常驻运行模板并进入部署自检 | deploy/systemd/xiaozhuang-platform.service |
| PASS | 部署 | 包含 DATA_DIR 服务器级定时备份模板并进入部署自检 | deploy/systemd/xiaozhuang-platform-backup.timer |
| PASS | 部署 | 包含季度灾备恢复演练 runbook 并进入部署自检 | docs/DISASTER_RECOVERY.md |
| PASS | 部署 | 包含 Prometheus/blackbox 健康监控和告警模板并进入部署自检 | deploy/monitoring |
| PASS | 部署 | 包含生产环境模板和部署手册 | .env.production.example + docs/DEPLOYMENT.md |
| PASS | 部署 | GitHub Pages 静态前端可配置远端 Node API、SSO 回跳和跨域 Cookie 登录 | config.js apiBase + CORS |
| PASS | 部署 | 前端运行时配置纳入 Pages 构建、部署说明和浏览器密钥扫描 | runtime config scan |
| PASS | 部署 | 包含生产环境变量清单生成与校验门禁 | scripts/env-check.mjs + docs/ENVIRONMENT.md |
| PASS | 部署 | 包含工作流环境清单生成与校验门禁 | scripts/workflow-env-report.mjs + docs/WORKFLOW_ENVIRONMENT.md |
| PASS | 部署 | 包含上线交接包生成器 | scripts/launch-package.mjs |
| PASS | 部署 | 生成上线交接包报告 | docs/LAUNCH_PACKAGE.md |
| PASS | 部署 | 包含 100 个 Coze 智能体发布页回填模板生成器 | Coze links template |
| PASS | 部署 | 上线交接包纳入权限矩阵来源报告 | launch package permissions source |
| PASS | 部署 | 包含上线演练命令 | scripts/release-rehearsal.mjs |
| PASS | 部署 | 生成上线演练报告 | docs/RELEASE_REHEARSAL.md |
| PASS | 部署 | 包含部署后线上烟测脚本 | scripts/post-deploy-smoke.mjs |
| PASS | 部署 | 生成部署后烟测报告 | docs/POST_DEPLOY_SMOKE.md |
| PASS | 部署 | 包含 GitHub Actions Pages 工作流 | .github/workflows/pages.yml |
| PASS | 部署 | CI 使用 Node 24 | node-version: 24 |
| PASS | 自动验收 | CI 生成验收报告 | npm run acceptance |
| PASS | 自动验收 | CI 上传验收报告 artifact | acceptance-report |
| PASS | 自动验收 | CI 上传部署自检报告 artifact | deployment-check-report |
| PASS | 自动验收 | CI 上传生产环境变量配置清单 artifact | environment-config-guide |
| PASS | 自动验收 | CI 上传教学工作流环境清单 artifact | workflow-environment-guide |
| PASS | 自动验收 | CI 上传周期运营清单 artifact | operations-schedule |
| PASS | 自动验收 | CI 上传权限矩阵 artifact | permission-matrix |
| PASS | 自动验收 | CI 生成并上传 Coze 发布页回填模板 | coze-links-template |
| PASS | 自动验收 | CI 上传上线交接包 artifact | launch-handoff-package |
| PASS | 自动验收 | CI 上传上线演练报告 artifact | release-rehearsal-report |
| PASS | 自动验收 | CI 执行浏览器产物密钥扫描 | scan:browser-secrets |
| PASS | 自动验收 | CI 上传部署后烟测报告 artifact | post-deploy-smoke-report |
| PASS | 自动验收 | 部署自检会校验 GitHub Actions 全量验证链路 | CI verification gate |
| PASS | 部署 | 已生成 GitHub Pages 静态产物 | pages-dist/index.html |
| PASS | 自动验收 | package.json 暴露检查与测试脚本 | check/test scripts |
