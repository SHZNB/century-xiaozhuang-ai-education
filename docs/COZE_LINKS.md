# Coze 智能体发布页回填模板

本文件配套 `docs/coze-links-template.csv` 使用，用于把 100 个教育智能体在 Coze 上发布后的公开页面批量回填到平台。

## 使用步骤

1. 将 `docs/coze-links-template.csv` 发给 Coze 智能体发布负责人。
2. 不修改 `id`、`name`、`category`、`currentCozeUrl`、`owner` 列。
3. 在 `cozeUrl` 列填写正式发布页，例如 `https://www.coze.cn/store/agent/...`。
4. 登录平台后台，进入“应用管理”，点击“Coze 链接”，上传填好的 CSV。
5. 上传后导出“质量台账”，确认不再出现“缺Coze链接”或“Coze占位链接”。

## 字段说明

| 字段 | 说明 |
| --- | --- |
| id | 平台智能体 ID，必须保留。 |
| name | 智能体名称，用于人工核对。 |
| category | 教育应用分类，用于分派发布责任。 |
| currentCozeUrl | 当前平台内保存的链接，多数为占位链接。 |
| cozeUrl | 需要回填的正式 Coze 发布页。 |
| owner | 默认责任部门或岗位。 |
| note | 填写提醒，可删除但不建议改动。 |

## 安全规则

- 只接受 `https://coze.cn`、`https://www.coze.cn`、`https://coze.com`、`https://www.coze.com` 域名。
- 不要在 CSV 中填写 API Key、Workflow ID、Cookie、Token 或任何密钥。
- Coze Workflow 服务端调用仍通过 `COZE_API_KEY`、`COZE_API_URL`、`COZE_WORKFLOW_ID` 配置，不进入浏览器。
- 每次批量回填会写入版本历史和 `agent.coze-links` 审计日志。

## 模板状态

- 智能体数量：100
- 默认占位链接数量：100
- 生成命令：`npm run coze:template:report`
