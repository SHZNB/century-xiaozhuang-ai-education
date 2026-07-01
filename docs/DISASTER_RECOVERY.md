# 百年晓庄智慧教育平台灾备恢复演练

本清单用于季度灾备恢复演练。演练目标是在隔离测试环境中证明平台备份 JSON、DATA_DIR 文件级归档、服务端部署模板和上线烟测可以协同恢复平台，不使用生产模型密钥、不覆盖生产数据。

## 备份物料

每次演练至少准备：

- 后台导出的平台备份 JSON，包含 `manifest.schema`、`manifest.counts` 和 `manifest.sha256`。
- `DATA_DIR` 文件级归档，例如 `xiaozhuang-data-20260620T022000Z.tar.gz`。
- 同名 `.sha256` 校验文件。
- 与备份时间匹配的 `docs/DEPLOYMENT_CHECK.md`、`docs/LAUNCH_PACKAGE.md` 和 `docs/WORKFLOW_ENVIRONMENT.md`。
- 测试环境 `.env`，只使用测试模型 Key 或禁用外部模型调用，不复用生产密钥。

## 隔离恢复步骤

1. 准备临时主机或容器，确认 Node.js 24 可用。
2. 创建隔离数据目录：

```bash
sudo mkdir -p /tmp/xiaozhuang-restore-data
sudo chown "$USER":"$USER" /tmp/xiaozhuang-restore-data
```

3. 校验 DATA_DIR 归档：

```bash
sha256sum -c xiaozhuang-data-YYYYMMDDTHHMMSSZ.tar.gz.sha256
tar -tzf xiaozhuang-data-YYYYMMDDTHHMMSSZ.tar.gz > /tmp/xiaozhuang-restore-file-list.txt
```

4. 解压 DATA_DIR 归档：

```bash
tar -xzf xiaozhuang-data-YYYYMMDDTHHMMSSZ.tar.gz -C /tmp/xiaozhuang-restore-data
```

5. 启动隔离服务：

```bash
DATA_DIR=/tmp/xiaozhuang-restore-data PORT=18080 DEV_ADMIN_PASSWORD=restore-test node --env-file-if-exists=.env server/index.mjs
```

6. 登录隔离后台，使用“恢复”导入平台备份 JSON。若提示 manifest 校验不一致、未来版本或敏感字段，演练失败并停止。
7. 运行基础烟测：

```bash
DEPLOY_BASE_URL=http://127.0.0.1:18080 npm run smoke:post-deploy:report
npm run check:deploy
```

8. 在后台核对：

- 100 个智能体仍存在且 Logo 可显示。
- 教学工作流至少 6 条，教案、PPT、长文档和网页动画路由仍存在。
- 校友认证、Token 账本、模型调用台账、反馈、审计日志和成果库元数据可查询。
- 成果下载链接对已恢复文件可用；缺失文件需要记录为 DATA_DIR 备份缺口。

## 演练证据

演练完成后归档：

- `sha256sum -c` 输出。
- `/tmp/xiaozhuang-restore-file-list.txt`。
- `docs/POST_DEPLOY_SMOKE.md`。
- 后台恢复操作对应的 `platform.restore` 审计日志截图或 CSV。
- 发现的问题、责任人和修复期限。

## 失败处理

- JSON manifest 校验失败：不要强制恢复，重新导出平台备份或追查备份传输链路。
- DATA_DIR 校验失败：不要解压覆盖测试目录，重新从备份介质取回归档。
- 服务无法启动：先检查 Node 版本、`DATA_DIR` 权限和 `.env` 是否含生产默认密码。
- 成果元数据存在但文件缺失：说明文件级备份不完整，应检查 `deploy/systemd/xiaozhuang-platform-backup.timer` 或云平台备份策略。

## 正式恢复原则

正式事故恢复前先冻结生产写入并导出现状备份。恢复顺序为：先恢复 DATA_DIR 文件级归档，再启动服务，最后通过后台恢复平台备份 JSON。恢复后必须运行部署后烟测、核对上线自检、重新测试关键模型供应商和教学工作流。
