# 百年晓庄智慧教育平台上线交接包

生成时间：2026-06-20T11:16:12.669Z

本交接包由 `npm run launch:package:report` 生成，汇总正式上线前需要给学校信息化部门、云平台运维、模型服务负责人、校友会接口负责人和项目组确认的证据。它不包含任何 API Key、密码、用户上传文件或模型生成正文。

## 交付范围

- 平台名称：百年晓庄智慧教育平台
- 智能体目录：100 个带 Logo 标识的教育智能体
- 教学工作流：6 条，可在后台编辑、测试、发布、停用、导入和导出
- 部署形态：Node 服务端完整平台、systemd 常驻服务、Docker Compose、GHCR 服务端镜像、GitHub Pages 静态预览
- 核心权益：校友认证通过后一次性发放 1,000,000 国产模型 Token，有效期 30 天
- 运维节奏：每日、每周、每月、每季度周期运营任务清单

## 自动模型路由

| 教育任务 | 默认模型/平台 | 服务端环境变量 |
| --- | --- | --- |
| 长文本、PDF、长上下文 | Kimi | MOONSHOT_API_KEY、MOONSHOT_API_URL、MOONSHOT_MODEL |
| 教案、课程设计、教学评价 | DeepSeek | DEEPSEEK_API_KEY、DEEPSEEK_API_URL、DEEPSEEK_MODEL |
| PPT 大纲、讲稿、HTML 演示 | ChatGPT | OPENAI_API_KEY、OPENAI_API_URL、OPENAI_MODEL |
| HTML 网页与交互动画 | Coze Workflow | COZE_API_KEY、COZE_API_URL、COZE_WORKFLOW_ID |
| 图片理解 | Gemini | GEMINI_API_KEY、GEMINI_API_URL、GEMINI_MODEL |
| 中文通用任务 | 通义千问 | QWEN_API_KEY、QWEN_API_URL、QWEN_MODEL |
| 服务故障备用 | 腾讯混元 | HUNYUAN_API_KEY、HUNYUAN_API_URL、HUNYUAN_MODEL |

## 教学工作流交接

| 工作流 | 默认模型/平台 | 成果类型 | 必要环境变量 | 输入/输出/质检数量 |
| --- | --- | --- | --- | --- |
| 写教案 | DeepSeek | lesson-plan | DEEPSEEK_API_KEY、DEEPSEEK_API_URL、DEEPSEEK_MODEL | 6/7/4 |
| 做课件 | ChatGPT | html-slides | OPENAI_API_KEY、OPENAI_API_URL、OPENAI_MODEL | 6/6/4 |
| 出题组卷 | 通义千问 | question-set | QWEN_API_KEY、QWEN_API_URL、QWEN_MODEL | 6/6/4 |
| 读长文档 | Kimi | document-brief | MOONSHOT_API_KEY、MOONSHOT_API_URL、MOONSHOT_MODEL | 6/6/4 |
| 网页动画 | Coze Workflow | html-animation | COZE_API_KEY、COZE_API_URL、COZE_WORKFLOW_ID | 6/7/4 |
| 看图分析 | Gemini | image-analysis | GEMINI_API_KEY、GEMINI_API_URL、GEMINI_MODEL | 6/6/4 |

## 生成报告

| 报告 | 用途 |
| --- | --- |
| docs/ACCEPTANCE.md | 验收报告 |
| docs/DEPLOYMENT_CHECK.md | 部署自检报告 |
| docs/ENVIRONMENT.md | 环境变量清单 |
| docs/WORKFLOW_ENVIRONMENT.md | 工作流环境清单 |
| docs/COZE_LINKS.md | Coze 智能体发布页回填模板 |
| docs/OPERATIONS_SCHEDULE.md | 周期运营清单 |
| docs/PERMISSIONS.md | 权限矩阵 |
| docs/DISASTER_RECOVERY.md | 灾备恢复演练清单 |

## 验收摘要

详见 docs/ACCEPTANCE.md

## 部署自检摘要

- 通过：16
- 提醒：10
- 阻断：10

## 上线前必须完成

1. 将 `.env.production.example` 配置为生产环境变量，所有密钥只进入服务端、容器环境或云平台 Secret。
2. 配置 DeepSeek、Kimi、ChatGPT、Gemini、Coze Workflow 以及必要的国产模型备用链路。
3. 使用 `docs/coze-links-template.csv` 回填 100 个 Coze 智能体发布页，后台导入后导出质量台账确认无占位链接。
4. 替换官方校徽、百年校庆标志、校园/校史/陶行知/师生活动授权照片，并在后台标记为校方授权素材。
5. 接入或确认校友会联合认证接口；未接入前保留人工审核和防重复领取。
6. 接入学校统一身份认证 OIDC；未接入前必须使用强生产管理员密码。
7. 后台逐项执行模型连接测试、100 个智能体连接测试和教学工作流测试。
8. 替换 `deploy/nginx/xiaozhuang-platform.conf` 中的正式域名、证书路径和 upstream 地址，并执行 `nginx -t`。
9. 非 Docker 服务器部署时，替换 `deploy/systemd/xiaozhuang-platform.service` 中的代码目录、数据目录和环境文件路径，并执行 `systemctl enable --now xiaozhuang-platform`。
10. 启用 `deploy/systemd/xiaozhuang-platform-backup.timer` 或云平台等效任务，确认 DATA_DIR 归档和 SHA-256 校验文件能按日生成。
11. 按 `deploy/monitoring/` 模板接入 /api/health 探测、HTTPS 证书到期和服务不可用告警。
12. 在 GitHub Actions 中确认 Pages 验证、服务端容器镜像构建和 `server-container-handoff` 附件均已生成。
13. 按 `docs/DISASTER_RECOVERY.md` 在隔离环境完成一次恢复演练，留存校验、烟测和 `platform.restore` 审计证据。
14. 运行 `npm run check:deploy:strict`，确认阻断项已清零后再开放给师生和校友使用。

## 责任分派

| 范围 | 责任方 |
| --- | --- |
| 模型 Key、API URL、备用链路 | 国产模型服务负责人、国际模型服务负责人、工作流平台负责人 |
| 官方品牌素材和授权照片 | 品牌与宣传素材负责人 |
| 校友联合认证接口和人工审核规则 | 校友会接口负责人、校友审核负责人 |
| SSO/OIDC 与账号策略 | 学校统一身份认证管理员、平台安全管理员 |
| systemd、Docker、GHCR 镜像、Nginx 反向代理、数据目录、定时备份、监控告警、HTTPS | 云平台运维负责人 |
| 100 个智能体和教学工作流质量治理 | 智能体应用管理员、教学工作流管理员 |
