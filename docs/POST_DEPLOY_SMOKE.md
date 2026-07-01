# 百年晓庄智慧教育平台部署后烟测

生成时间：2026-06-20T11:16:17.796Z

本报告由 `npm run smoke:post-deploy:report` 生成。设置 `DEPLOY_BASE_URL` 后可检查 GitHub Pages 静态预览或 Node 服务端线上地址；不设置时只生成待执行报告，便于交接给云平台运维。

## 汇总

- 通过：0
- 提醒：0
- 待执行：1
- 失败：0

## 检查项

| 状态 | 项目 | 地址 | 结果 |
| --- | --- | --- | --- |
| PENDING | DEPLOY_BASE_URL | 线上地址 | 未设置 DEPLOY_BASE_URL；部署后使用 DEPLOY_BASE_URL=https://你的域名 npm run smoke:post-deploy:report 执行线上烟测。 |

## 使用方式

```powershell
$env:DEPLOY_BASE_URL="https://你的域名"
npm run smoke:post-deploy:report
```

GitHub Pages 静态预览至少应通过首页检查；完整 Node 服务端还应通过 `/api/health` 检查。
