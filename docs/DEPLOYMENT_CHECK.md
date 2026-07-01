# 百年晓庄智慧教育平台部署自检

> 本报告由 `npm run check:deploy:report` 生成，用于生产部署前交接。FAIL 项需要在正式上线前处理；WARN 项可带说明上线或列入运维待办。

## 汇总

- 通过：17
- 提醒：10
- 阻断：9

## 检查项

| 状态 | 项目 | 责任方 | 证据 |
| --- | --- | --- | --- |
| OK | Node runtime | 云平台运维负责人 | v24.14.0 |
| WARN | .env | 云平台运维负责人 | Copy .env.production.example to .env before production deployment |
| WARN | NODE_ENV | 云平台运维负责人 | Current NODE_ENV is not set |
| FAIL | Admin password | 平台安全管理员 | Set DEV_ADMIN_PASSWORD to a strong production value |
| FAIL | Session secret | 平台安全管理员 | Set SESSION_SECRET to a random value of at least 32 characters |
| OK | DATA_DIR | 云平台运维负责人 | ./server/data |
| FAIL | DeepSeek for lesson plans | 国产模型服务负责人 | DEEPSEEK_API_KEY is missing |
| FAIL | Kimi for long context | 国产模型服务负责人 | MOONSHOT_API_KEY is missing |
| FAIL | ChatGPT for PPT and HTML presentations | 国际模型服务负责人 | OPENAI_API_KEY is missing |
| FAIL | Coze for web animation | 工作流平台负责人 | COZE_API_KEY is missing |
| FAIL | Coze workflow endpoint | 工作流平台负责人 | COZE_API_URL is missing |
| FAIL | Coze workflow id | 工作流平台负责人 | COZE_WORKFLOW_ID is missing |
| FAIL | Gemini for image understanding | 国际模型服务负责人 | GEMINI_API_KEY is missing |
| WARN | Qwen general Chinese tasks | 国产模型服务负责人 | QWEN_API_KEY is not configured |
| WARN | Doubao general fallback | 国产模型服务负责人 | DOUBAO_API_KEY is not configured |
| WARN | GLM knowledge fallback | 国产模型服务负责人 | GLM_API_KEY is not configured |
| WARN | Ernie policy tasks | 国产模型服务负责人 | ERNIE_API_KEY is not configured |
| WARN | Hunyuan service fallback | 国产模型服务负责人 | HUNYUAN_API_KEY is not configured |
| WARN | Alumni association joint verification | 校友会接口负责人 | ALUMNI_ASSOCIATION_VERIFY_URL is not configured |
| WARN | School SSO | 学校统一身份认证管理员 | SSO_ENABLED is not true; local platform accounts remain the login path |
| OK | Official school mark | 品牌与宣传素材负责人 | School mark placeholder appears to be replaced |
| WARN | Hero image authorization | 品牌与宣传素材负责人 | Replace concept image with school-authorized real photography before production |
| OK | GitHub Pages artifact | 云平台运维负责人 | pages-dist exists |
| OK | GitHub Actions verification | 云平台运维负责人 | CI covers checks, reports, tests, screenshots and Pages deployment |
| OK | Server container workflow | 云平台运维负责人 | CI builds the Node server image, validates Compose and publishes GHCR images outside pull requests |
| OK | Container deployment | 云平台运维负责人 | Dockerfile and compose.yml exist |
| OK | HTTPS reverse proxy template | 云平台运维负责人 | Nginx template covers TLS, health checks, upload limits and security headers |
| OK | Systemd service template | 云平台运维负责人 | systemd template covers env injection, persistent data directory, restart policy and hardening |
| OK | Systemd data backup timer | 云平台运维负责人 | Daily data-directory backup timer archives DATA_DIR, writes SHA-256 checksums and prunes old archives |
| OK | Disaster recovery rehearsal | 云平台运维负责人 | Runbook covers backup checksum, DATA_DIR restore, JSON restore, smoke test and evidence capture |
| OK | Monitoring and alerting templates | 云平台运维负责人 | Prometheus blackbox templates cover /api/health availability, latency and TLS expiry alerts |
| OK | Environment handoff | 云平台运维负责人 | Environment and workflow configuration guides exist |
| OK | Launch handoff package | 云平台运维负责人 | Launch package generator and report exist |
| OK | Coze links handoff | 工作流平台负责人 | 100-agent Coze published-page template exists |
| OK | Operations schedule | 云平台运维负责人 | Recurring operations schedule exists |
| OK | Post-deploy smoke | 云平台运维负责人 | Post-deploy smoke script and report exist |
