# 服务端接口契约

仓库内 `server/` 已实现该契约的可运行版本。API Key、模型调用、用户认证、文件保存和 Token 账本均由学校或阿里云服务端处理。

## AI 模型网关

`POST /api/chat/stream`

```json
{
  "conversationId": "conv_xxx",
  "message": "请编写一份教案",
  "attachments": [],
  "routeHint": "deepseek"
}
```

服务端应重新校验路由，不直接信任 `routeHint`。响应可先返回普通 JSON，生产环境建议升级为 SSE：

```json
{
  "answer": "模型回答",
  "route": {
    "provider": "deepseek",
    "reason": "教案与教学设计"
  },
  "model": "由管理员配置",
  "usage": {
    "inputTokens": 320,
    "outputTokens": 1180,
    "chargedTokens": 1500
  }
}
```

模型密钥不得通过任何前端接口返回。

登录会话 token 仅以服务端 `SESSION_SECRET` 派生的 HMAC 摘要形式持久化；轮换该密钥会使既有会话失效，浏览器和备份文件不得获得可复用的原始会话 token。服务启动和 `/api/admin/maintenance` 会清理旧结构中的原始会话 token，并在维护结果中返回 `legacySessionsRemoved`。

管理员运维接口：

- `GET /api/admin/providers`：查看模型提供方配置状态和服务端模型名，不返回密钥。
- `GET /api/admin/providers.csv`：超级管理员导出脱敏模型供应商配置状态 CSV，包含环境变量名、缺失项、默认值标记和备用路线，不包含任何密钥值。
- `POST /api/admin/providers/:id/test`：测试指定模型提供方连接，不走备用模型、不扣用户额度，结果写入审计日志。

## 校友认证

- `POST /api/alumni/applications`
- `GET /api/alumni/status`
- `POST /api/admin/alumni/applications/:id/approve`
- `POST /api/admin/alumni/applications/:id/reject`
- `GET /api/admin/files/:proofFileId`（仅校友审核角色，可查看已被申请引用的证明）
- `GET /api/admin/alumni/applications.csv`：超级管理员导出校友认证申请、审核状态、联合认证状态和权益发放结果 CSV，导出行为写入 `alumni.export` 审计日志。
- `GET /api/alumni/quota`
- `GET /api/alumni/ledger`

当服务端配置 `ALUMNI_ASSOCIATION_VERIFY_URL` 时，提交申请后会先调用校友会联合认证接口。接口返回 `verified: true`、`valid: true`，或 `status/result` 为 `verified`、`approved`、`matched`、`valid` 时，平台会自动通过认证并发放权益；未配置或核验未通过时继续进入人工审核。

审核通过时服务端必须在同一数据库事务中完成：

1. 写入认证状态。
2. 检查校友唯一标识是否领取过权益。
3. 写入一次性 1,000,000 Token 发放记录。
4. 设置批准时间与 30 天到期时间。
5. 写入管理员审计日志。

## 安全要求

- 使用 HttpOnly、Secure、SameSite Cookie 保存会话。
- `GET /api/auth/sso/config`：返回统一身份认证是否启用及登录按钮文案，不返回 Client Secret。
- `GET /api/auth/sso`：发起学校统一身份认证 OIDC 授权码流程，服务端生成一次性 state/nonce 并重定向到 IdP。
- `GET /api/auth/sso/callback`：接收 OIDC code，服务端换取 access token、读取 userinfo、自动创建或更新本地用户，并写入 `auth.sso.login` / `auth.sso.failed` 审计日志。IdP token 不写入数据库或前端。
- 登录接口按用户名和来源 IP 记录失败次数，短时间连续失败会返回 `429` 与 `Retry-After`，并写入 `auth.login.failed` / `auth.login.locked` 审计日志。
- 当前单机版将证明材料存入服务端私有目录，通过受角色保护的接口查看并记录审计；生产集群应迁移到私有 OSS 短时签名 URL。
- 上传接口只接受 PDF、PNG、JPEG 和 WebP，服务端会校验文件头魔数与声明类型一致；伪装类型或空文件会被拒绝并写入 `file.upload.rejected` 审计日志。
- 国产模型免费额度只扣 Kimi、DeepSeek、通义、豆包、智谱、文心和混元。
- ChatGPT、Gemini 使用独立钱包。
- 模型调用先预占额度，成功后按厂商 usage 结算，失败则释放预占。
- 对话 HTML 成果必须通过 sandbox iframe 展示。

## 智能体工作流

- `GET /api/agents`：管理员返回完整目录，普通用户仅返回已发布智能体。
- `POST /api/admin/agents`：创建智能体草稿或发布应用。
- `POST /api/admin/agents/import`：批量导入智能体目录，支持 `replace` 或 `merge`。
- `PATCH /api/admin/agents/coze-links`：批量更新智能体 Coze 发布页，输入 `links: [{ id, cozeUrl }]`，仅接受 Coze 官方公开域名，写入版本历史和 `agent.coze-links` 审计日志。
- `PUT /api/admin/agents/:id`：编辑配置、发布或下架。
- `DELETE /api/admin/agents/:id`：删除智能体。
- `POST /api/admin/agents/:id/test`：管理员测试平台对话型智能体，支持草稿和下架状态；测试走统一模型网关、写入审计日志，但不写入普通会话或扣减校友免费额度。
- `GET /api/admin/agents/:id/versions`：查看创建、更新、发布和下架版本快照。
- `POST /api/admin/agents/:id/versions/:version/restore`：恢复某个智能体历史版本，恢复后生成新的版本快照和审计日志。

发布门禁：

1. 基础信息、负责人、简介和 Logo 必须完整。
2. 平台对话型智能体必须配置不少于 20 字的系统提示词和有效首选模型路由。
3. 外部网页、嵌入页和 API 型智能体发布前必须填写有效 URL。
4. 平台对话型智能体发布前可通过后台测试入口验证提示词和路由。
5. 平台对话型智能体运行时向 `POST /api/chat/stream` 传入 `agentId`，由服务端加载该智能体系统提示词和首选路由；前端不得保存模型密钥。

批量导入会逐条校验智能体配置并剥离 `apiToken`、`secret`、`key` 等敏感字段；服务端会写入版本快照和审计日志。

智能体名称、Logo、接入方式、外部地址、API 地址、服务端别名、模型路由或系统提示词发生变化后，服务端会自动将最近测试状态重置为 `untested`，上线自检会重新要求管理员测试通过。外部网页、嵌入页和 API 型智能体从草稿或下架状态发布前，必须已有一次通过的连接测试。

## 教学任务工作流

- `GET /api/workflows`：返回服务端可用工作流模板。
- `POST /api/workflows/:id/run`：执行指定教学工作流。
- `GET /api/admin/workflows`：管理员查看全部工作流，包括停用项。
- `POST /api/admin/workflows`：管理员新建工作流草稿或发布工作流。
- `POST /api/admin/workflows/import`：批量导入工作流，支持 `replace` 或 `merge`。
- `PATCH /api/admin/workflows/bulk`：管理员按 `ids` 批量调整教学工作流的 `routeHint`，并写入版本记录和审计日志。
- `POST /api/admin/workflows/:id/test`：管理员测试指定教学工作流的提示词和模型路由，写入 `workflow.test` 审计、模型调用台账和工作流最近测试状态；测试不扣校友额度、不写普通会话、不生成成果文件。
- `PUT /api/admin/workflows/:id`：管理员更新标题、摘要、首选模型、成果类型、系统提示词和发布状态。

工作流的标题、摘要、首选模型、成果类型或系统提示词发生变化后，服务端会自动将最近测试状态重置为 `untested`，上线自检会重新要求管理员测试通过。
工作流从草稿或下架状态发布前，必须已有一次通过的工作流路由测试。
- `DELETE /api/admin/workflows/:id`：管理员删除工作流。
- `GET /api/admin/workflows/:id/versions`：查看工作流创建、更新、导入、发布和删除版本快照。
- `POST /api/admin/workflows/:id/versions/:version/restore`：恢复某个工作流历史版本，恢复后生成新的版本快照和审计日志。

请求示例：

```json
{
  "prompt": "为五年级语文设计一节完整教案",
  "subject": "语文",
  "grade": "五年级",
  "duration": "40分钟",
  "requirements": "突出小组合作"
}
```

服务端会加载工作流系统提示词、首选模型路由和成果类型，复用统一模型网关、Token 预留结算、失败释放和审计日志。响应除普通模型回答外，会包含：

```json
{
  "workflow": { "id": "lesson", "title": "写教案", "artifactType": "lesson-plan" },
  "artifact": {
    "id": "artifact_xxx",
    "type": "lesson-plan",
    "title": "写教案成果",
    "html": "...",
    "downloadUrl": "/api/artifacts/artifact_xxx/download"
  }
}
```

停用状态的工作流不会对普通执行入口开放。导入、新建、更新、发布、停用和删除都会写入版本快照与审计日志；发布状态的工作流必须包含标题、摘要、有效模型路由和不少于 30 字的系统提示词。

## 成果资产

- `GET /api/artifacts`：列出当前用户通过教学工作流生成的成果文件；应用管理员可查看全平台最近成果，用于运维核验。
- `GET /api/artifacts/:id/download`：下载当前用户拥有的工作流成果文件；管理员可访问用于运维核验。
- `DELETE /api/artifacts/:id`：删除当前用户拥有的工作流成果文件；应用管理员可删除全平台成果用于运维清理，删除会同步移除服务端文件和元数据，并写入 `artifact.delete` 审计日志。
- `POST /api/admin/artifacts/cleanup`：超级管理员按 `olderThanDays` 清理旧成果文件，可选 `workflowId` 和 `type` 进一步限定范围；删除会同步移除服务端文件和元数据，并写入 `artifact.cleanup` 审计日志。
- `GET /api/admin/artifacts.csv`：超级管理员导出成果资产元数据清单 CSV，包含用户、工作流、成果类型和下载地址，不包含模型生成正文；导出写入 `artifact.export` 审计日志。

工作流成功执行后，服务端会生成 HTML 成果文件并写入 SQLite 元数据。前端成果面板优先使用服务端下载链接，静态离线模式才退回浏览器本地 Blob。

`html-animation` 类型工作流下载为 ZIP 包，至少包含 `index.html`、`README.txt` 和 `model-output.txt`；其他工作流默认下载为 HTML 文件。

## 用户反馈

- `POST /api/feedback`：登录用户提交反馈，写入运营队列和审计日志。
- `GET /api/admin/feedback`：应用管理员查看反馈队列。
- `PUT /api/admin/feedback/:id`：应用管理员更新反馈状态、处理人和备注。
- `GET /api/admin/feedback.csv`：超级管理员导出反馈队列 CSV，用于项目复盘和运营留档，导出行为写入 `feedback.export` 审计日志。

反馈状态包括 `open`、`triaged` 和 `closed`；反馈进入平台备份，便于迁移和复盘。

## 运营统计

- `GET /api/admin/metrics`：管理员查看近 7 天智能体运行、工作流运行、Token 消耗、成果文件、热门智能体、热门工作流和最近运行记录。
- `GET /api/admin/model-runs`：管理员查看最近模型调用台账，包含状态、路由、实际模型、耗时、Token、备用链路和关联智能体/工作流，不返回用户提示词、模型回答或密钥。
- `GET /api/admin/model-runs.csv`：超级管理员导出脱敏模型调用台账 CSV，用于排查供应商故障、备用模型切换和 Token 结算。
- `GET /api/admin/token-ledger.csv`：超级管理员导出 Token 发放与模型消费 CSV 账本，包含用户、金额、类型、模型、智能体、工作流、发放记录和说明字段。
- `POST /api/admin/token-adjustments`：超级管理员对已有活跃校友权益进行人工补发或扣减，字段为 `userId` 或 `username`、`amount`、`reason`；正数增加当前 grant 总额，负数写入消费账本且不能扣成负数，操作写入 `token.adjust` 审计日志。
- `GET /api/admin/audit-logs`：管理员查看最近 80 条平台审计日志；校友审核员仅可查看与校友审核和证明材料相关的日志。
- `GET /api/admin/audit-logs.csv`：超级管理员导出完整脱敏审计 CSV，用于上线交接、运维留档和安全复盘。

统计来自服务端审计日志、Token 账本和成果资产元数据，不依赖浏览器本地记录。

审计日志返回动作、对象、操作者、时间和脱敏元数据；`password`、`token`、`secret`、`key` 等字段不会进入响应。

## 账号与角色

- `GET /api/admin/users`：超级管理员查看账号列表。
- `GET /api/admin/users.csv`：超级管理员导出脱敏账号台账 CSV，包含账号、角色、部门、状态、SSO 绑定和首次改密状态，不包含密码哈希、会话或密钥；导出行为写入 `user.export` 审计日志。
- `POST /api/admin/users`：超级管理员创建本地账号并设置初始密码，初始密码至少 8 位。
- `PUT /api/admin/users/:id`：超级管理员修改显示名、部门、角色、启停状态或重置密码；重置密码至少 8 位。

角色：

- `super_admin`：平台超级管理员，可维护账号、智能体、工作流、校友审核和统计。
- `agent_admin`：应用管理员，可维护智能体、工作流和运营统计。
- `alumni_reviewer`：校友审核员，可查看校友认证申请和证明材料。
- `teacher`：普通教师用户，可使用已发布智能体和工作流。

停用账号不能登录；停用时服务端会清理该账号现有会话。服务端不允许停用或降权最后一个处于启用状态的 `super_admin`，避免平台失去账号管理入口。
品牌授权配置、Token 总账导出、平台备份恢复、默认目录重置和账号角色维护仅限 `super_admin`。

## 平台备份恢复

- `GET /api/admin/backup`：超级管理员导出平台配置和运营元数据，包含 `manifest` 计数和 SHA-256 校验，不包含密码哈希、会话、Token 预占或密钥。
- `POST /api/admin/restore`：超级管理员恢复备份中的智能体、工作流、校友认证、Token 账本、成果元数据、版本和审计记录；若备份 manifest 校验不一致、版本过新或含敏感字段则拒绝恢复。

备份不包含 `passwordHash`、会话 token 或浏览器端密钥字段。恢复时服务端会拒绝高于当前支持版本的备份，以及包含 `passwordHash`、`sessions`、`tokenReservations`、`apiToken`、`secret`、`key` 等敏感字段的备份。上传文件和成果文件的二进制内容仍需通过 `/data` 或 OSS 文件备份保存。
