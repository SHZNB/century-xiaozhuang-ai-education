import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shouldWrite = process.argv.includes("--write");

const roles = [
  ["super_admin", "超级管理员", "平台安全与上线总负责人"],
  ["agent_admin", "应用管理员", "智能体与教学工作流维护负责人"],
  ["alumni_reviewer", "校友审核员", "校友认证与证明材料复核负责人"],
  ["teacher", "教师用户", "日常教学使用者"]
];

const permissions = [
  ["登录与改密", "使用本地账号或 SSO 登录，首次登录修改初始密码", ["super_admin", "agent_admin", "alumni_reviewer", "teacher"]],
  ["使用已发布智能体", "检索和运行已发布智能体应用", ["super_admin", "agent_admin", "alumni_reviewer", "teacher"]],
  ["运行教学工作流", "运行已发布教学工作流并生成成果文件", ["super_admin", "agent_admin", "alumni_reviewer", "teacher"]],
  ["上传 PDF/图片", "上传 PDF、PNG、JPG、WebP 文件供会话或校友证明使用", ["super_admin", "agent_admin", "alumni_reviewer", "teacher"]],
  ["查看个人额度", "查看自己的校友 Token 额度和账本", ["super_admin", "agent_admin", "alumni_reviewer", "teacher"]],
  ["维护智能体目录", "新增、编辑、复制、导入、导出、测试、发布、下架和恢复智能体", ["super_admin", "agent_admin"]],
  ["维护教学工作流", "新增、编辑、复制、导入、导出、测试、发布、停用和恢复工作流", ["super_admin", "agent_admin"]],
  ["查看运行统计", "查看模型、智能体、工作流、Token 和成果统计", ["super_admin", "agent_admin"]],
  ["查看模型路由状态", "查看模型供应商配置状态并执行连接测试", ["super_admin", "agent_admin"]],
  ["查看上线自检", "查看并筛选上线自检项目", ["super_admin", "agent_admin"]],
  ["导出当前上线自检", "导出当前筛选范围的上线自检 CSV", ["super_admin", "agent_admin"]],
  ["查看审计日志", "查看近期脱敏审计日志", ["super_admin", "agent_admin", "alumni_reviewer"]],
  ["处理用户反馈", "查看、筛选和更新反馈处理状态", ["super_admin", "agent_admin"]],
  ["审核校友认证", "查看校友申请、证明文件、通过或退回认证", ["super_admin", "alumni_reviewer"]],
  ["查看校友证明文件", "通过受权限保护的接口查看证明材料", ["super_admin", "alumni_reviewer"]],
  ["账号与角色管理", "创建、停用、改角色、重置密码和导出账号台账", ["super_admin"]],
  ["品牌授权配置", "维护平台名称、Logo、主视觉和官方素材状态", ["super_admin"]],
  ["Token 人工调整", "对活跃校友权益补发或扣减 Token", ["super_admin"]],
  ["导出敏感运营台账", "导出 Token、模型调用、审计、反馈、校友认证、成果、版本历史等 CSV", ["super_admin"]],
  ["平台备份恢复", "导出平台备份、恢复备份和重置默认目录", ["super_admin"]],
  ["平台维护任务", "清理过期会话、OIDC state 和 Token 预占", ["super_admin"]],
  ["成果资产治理", "导出成果清单、按保留期批量清理旧成果", ["super_admin"]],
  ["成果访问与删除", "下载和删除自己的成果；管理员可治理全平台近期成果", ["super_admin", "agent_admin", "teacher"]]
];

const report = renderReport();

if (shouldWrite) {
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(path.join(root, "docs", "PERMISSIONS.md"), report, "utf8");
  console.log("Permission matrix written to docs/PERMISSIONS.md");
}

console.log(`Permission matrix check passed: ${roles.length} roles, ${permissions.length} permission rows`);

function renderReport() {
  const generatedAt = new Date().toISOString();
  const roleRows = roles.map(([id, label, owner]) => `| \`${id}\` | ${label} | ${owner} |`).join("\n");
  const matrixHeader = ["权限项", "说明", ...roles.map(([, label]) => label)];
  const matrixDivider = ["---", "---", ...roles.map(() => ":---:")];
  const matrixRows = permissions.map(([name, detail, allowed]) => {
    const marks = roles.map(([id]) => allowed.includes(id) ? "是" : "");
    return `| ${[name, detail, ...marks].join(" | ")} |`;
  }).join("\n");

  return `# 百年晓庄智慧教育平台权限矩阵

生成时间：${generatedAt}

本报告由 \`npm run permissions:report\` 生成，用于上线交接、角色复核和权限审计。矩阵只描述平台本地授权层；学校统一身份认证接入后，SSO 负责身份确认，本平台继续负责角色授权。

## 角色

| 角色 ID | 显示名称 | 责任定位 |
| --- | --- | --- |
${roleRows}

## 权限矩阵

| ${matrixHeader.join(" | ")} |
| ${matrixDivider.join(" | ")} |
${matrixRows}

## 上线复核要点

1. 至少保留 1 个启用状态的 \`super_admin\`，服务端会拒绝停用或降权最后一个超级管理员。
2. \`agent_admin\` 可以维护智能体和教学工作流，但不能导出敏感台账、调整 Token、恢复备份或修改品牌授权。
3. \`alumni_reviewer\` 只处理校友认证和证明材料，不维护智能体、模型、账号或 Token 总账。
4. \`teacher\` 只使用已发布能力、提交反馈和查看个人权益，不进入后台管理。
5. 正式接入 SSO 后，建议每月导出账号台账并复核 \`super_admin\`、\`agent_admin\`、\`alumni_reviewer\` 三类角色。
`;
}
