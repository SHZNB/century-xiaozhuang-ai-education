# 百年晓庄智慧教育平台环境变量清单

生成时间：2026-06-20T11:16:11.534Z

本清单由 `npm run check:env:report` 生成，用于学校信息化部门、云平台运维或项目组交接生产配置。所有密钥只允许配置在服务端 `.env`、容器运行环境或云平台 Secret 中，不得写入浏览器、GitHub Pages 静态产物、智能体导出文件或前端源码。

## 使用方式

```powershell
Copy-Item .env.production.example .env
npm run check:env
npm run check:deploy
```

生产上线前，`NODE_ENV` 必须为 `production`，`DEV_ADMIN_PASSWORD` 必须替换为强密码，且关键模型 Key、Coze Workflow ID、授权素材和校友会接口需完成配置或在上线自检报告中登记为待办。

## 变量表

| 变量 | 分组 | 级别 | 用途 |
| --- | --- | --- | --- |
| `PORT` | runtime | 必填 | Node 服务监听端口，默认 8080。 |
| `NODE_ENV` | runtime | 必填 | 生产环境必须为 production，确保 Cookie Secure 等安全策略生效。 |
| `DEMO_MODE` | runtime | 建议 | Demo 验收模式；仅用于本地或演示环境，允许健康检查忽略真实模型 Key 和官方素材缺口。 |
| `DATA_DIR` | runtime | 必填 | SQLite、上传证明和工作流成果的持久化目录。 |
| `MODEL_MAX_OUTPUT_TOKENS` | models | 必填 | 单次模型调用最大输出 Token 数。 |
| `FRONTEND_ORIGINS` | runtime | 建议 | 允许跨域访问 Node 服务端的前端来源，多个来源用逗号分隔，例如 GitHub Pages 域名。 |
| `PUBLIC_FRONTEND_URL` | runtime | 建议 | 公开前端根地址，用于学校统一身份认证回调后跳回 GitHub Pages 或正式门户。 |
| `COOKIE_SAMESITE` | security | 建议 | 会话 Cookie SameSite 策略；前端与 Node 服务不同站点时需配合 HTTPS 设置为 None。 |
| `DEV_ADMIN_USERNAME` | security | 必填 | 首次启动的超级管理员账号名，生产环境应替换默认值。 |
| `DEV_ADMIN_PASSWORD` | security | 必填 | 首次启动的超级管理员强密码，生产环境不得使用 xz2026 或 change-me。 |
| `SESSION_SECRET` | security | 必填 | 服务端会话签名密钥，用于 Cookie token HMAC 摘要和强制会话失效；生产环境必须随机生成并安全保管。 |
| `SSO_ENABLED` | sso | 建议 | 是否启用学校统一身份认证 OIDC 登录。 |
| `SSO_LOGIN_LABEL` | sso | 建议 | 登录页统一身份认证按钮文案。 |
| `SSO_ISSUER` | sso | 建议 | 学校统一身份认证服务商标识或 issuer。 |
| `SSO_AUTHORIZATION_URL` | sso | 建议 | OIDC authorization endpoint。 |
| `SSO_TOKEN_URL` | sso | 建议 | OIDC token endpoint。 |
| `SSO_USERINFO_URL` | sso | 建议 | OIDC userinfo endpoint。 |
| `SSO_CLIENT_ID` | sso | 建议 | 平台在学校统一身份认证系统登记的 Client ID。 |
| `SSO_CLIENT_SECRET` | sso | 建议 | 平台在学校统一身份认证系统登记的 Client Secret，只能放服务端。 |
| `SSO_REDIRECT_URI` | sso | 建议 | OIDC 回调地址，通常为 https://域名/api/auth/sso/callback。 |
| `SSO_SCOPE` | sso | 建议 | OIDC 授权范围，默认 openid profile email。 |
| `SSO_USERNAME_CLAIM` | sso | 建议 | 映射到平台 username 的 userinfo claim。 |
| `SSO_DISPLAY_NAME_CLAIM` | sso | 建议 | 映射到平台显示姓名的 userinfo claim。 |
| `SSO_DEPARTMENT_CLAIM` | sso | 建议 | 映射到平台部门的 userinfo claim。 |
| `SSO_DEFAULT_ROLE` | sso | 建议 | SSO 首次登录自动创建账号时的默认角色，默认 teacher。 |
| `ALUMNI_ASSOCIATION_VERIFY_URL` | alumni | 建议 | 校友会联合认证接口；未配置时进入人工审核。 |
| `ALUMNI_ASSOCIATION_API_KEY` | alumni | 建议 | 调用校友会联合认证接口的服务端密钥。 |
| `MOONSHOT_API_KEY` | models | 必填 | Kimi / Moonshot，用于长文本、PDF 和长上下文。 |
| `MOONSHOT_API_URL` | models | 必填 | Kimi / Moonshot OpenAI 兼容接口地址。 |
| `MOONSHOT_MODEL` | models | 必填 | Kimi / Moonshot 模型名称。 |
| `DEEPSEEK_API_KEY` | models | 必填 | DeepSeek，用于教案、课程设计和教学评价。 |
| `DEEPSEEK_API_URL` | models | 必填 | DeepSeek OpenAI 兼容接口地址。 |
| `DEEPSEEK_MODEL` | models | 必填 | DeepSeek 模型名称。 |
| `QWEN_API_KEY` | models | 建议 | 通义千问，用于中文通用教育任务。 |
| `QWEN_API_URL` | models | 建议 | 通义千问 OpenAI 兼容接口地址。 |
| `QWEN_MODEL` | models | 建议 | 通义千问模型名称。 |
| `OPENAI_API_KEY` | models | 必填 | ChatGPT，用于 PPT 大纲、讲稿和 HTML 演示。 |
| `OPENAI_API_URL` | models | 必填 | OpenAI Responses API 地址。 |
| `OPENAI_MODEL` | models | 必填 | OpenAI / ChatGPT 模型名称。 |
| `GEMINI_API_KEY` | models | 必填 | Gemini，用于图片理解和多模态任务。 |
| `GEMINI_API_URL` | models | 必填 | Gemini API 基础地址。 |
| `GEMINI_MODEL` | models | 必填 | Gemini 模型名称。 |
| `COZE_API_KEY` | models | 必填 | Coze Workflow 服务端密钥，用于网页动画工作流。 |
| `COZE_API_URL` | models | 必填 | Coze Workflow 调用地址。 |
| `COZE_WORKFLOW_ID` | models | 必填 | Coze 网页动画工作流 ID。 |
| `DOUBAO_API_KEY` | models | 建议 | 豆包模型密钥，作为中文通用或备用模型。 |
| `DOUBAO_API_URL` | models | 建议 | 豆包 OpenAI 兼容接口地址。 |
| `DOUBAO_MODEL` | models | 建议 | 豆包模型名称。 |
| `GLM_API_KEY` | models | 建议 | 智谱 GLM 密钥，用于知识任务备用。 |
| `GLM_API_URL` | models | 建议 | 智谱 GLM OpenAI 兼容接口地址。 |
| `GLM_MODEL` | models | 建议 | 智谱 GLM 模型名称。 |
| `ERNIE_API_KEY` | models | 建议 | 文心一言密钥，用于教育政策和知识任务。 |
| `ERNIE_API_URL` | models | 建议 | 文心一言 OpenAI 兼容接口地址。 |
| `ERNIE_MODEL` | models | 建议 | 文心一言模型名称。 |
| `HUNYUAN_API_KEY` | models | 建议 | 腾讯混元密钥，作为服务故障备用。 |
| `HUNYUAN_API_URL` | models | 建议 | 腾讯混元 OpenAI 兼容接口地址。 |
| `HUNYUAN_MODEL` | models | 建议 | 腾讯混元模型名称。 |
