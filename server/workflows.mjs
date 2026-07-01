export const teachingWorkflows = [
  {
    id: "lesson",
    title: "写教案",
    routeHint: "deepseek",
    artifactType: "lesson-plan",
    summary: "学情分析、目标、活动、评价与反思一体生成",
    status: "published",
    inputFields: ["学科/主题", "学段/年级", "课时/时长", "教材或知识点", "学生基础", "补充要求"],
    outputSections: ["学情分析", "教学目标", "重点难点", "教学过程", "评价设计", "板书建议", "课后反思"],
    qualityChecklist: ["目标、活动和评价保持一致", "活动可在真实课堂执行", "评价方式包含形成性证据", "不编造学校政策或课程数据"],
    systemPrompt: "你是南京晓庄学院智慧教育平台的教案工作流。请输出结构化教案，必须包含学情分析、教学目标、重难点、教学过程、评价设计、板书建议和课后反思。"
  },
  {
    id: "ppt",
    title: "做课件",
    routeHint: "chatgpt",
    artifactType: "html-slides",
    summary: "生成逐页 PPT 大纲、讲稿与 HTML 演示结构",
    status: "published",
    inputFields: ["主题", "受众/年级", "页数", "授课时长", "视觉风格", "补充素材"],
    outputSections: ["封面页", "目录与学习目标", "逐页大纲", "讲稿提示", "课堂互动", "HTML 演示结构"],
    qualityChecklist: ["每页只承载一个核心观点", "讲稿与页面要点对应", "包含课堂提问或互动", "HTML 结构可复制并适合演示"],
    systemPrompt: "你是课堂课件工作流。请输出可直接制作 PPT 的逐页结构，每页包含标题、要点、讲稿、视觉建议和课堂提问；需要 HTML 演示时给出可复制的页面结构。"
  },
  {
    id: "quiz",
    title: "出题组卷",
    routeHint: "qwen",
    artifactType: "question-set",
    summary: "按学段、知识点和难度生成题目、答案与解析",
    status: "published",
    inputFields: ["学科/主题", "学段/年级", "知识点", "题量", "难度比例", "题型要求"],
    outputSections: ["命题目标", "题目清单", "答案", "解析", "评分标准", "易错点"],
    qualityChecklist: ["题目覆盖目标知识点", "难度分层清晰", "答案和解析一致", "评分标准可操作"],
    systemPrompt: "你是教育测评工作流。请根据课程目标生成分层题目，包含题型、难度、答案、解析、评分标准和易错点提醒。"
  },
  {
    id: "document",
    title: "读长文档",
    routeHint: "kimi",
    artifactType: "document-brief",
    summary: "提炼 PDF 或长文档的核心观点、证据与可引用内容",
    status: "published",
    inputFields: ["文档主题", "文档类型", "阅读目标", "重点关注问题", "引用格式", "补充要求"],
    outputSections: ["核心摘要", "证据链", "可引用观点", "教学使用建议", "待核验事实", "后续追问"],
    qualityChecklist: ["区分原文事实与推断", "保留关键出处线索", "标记不确定内容", "给出可用于课堂或研究的下一步"],
    systemPrompt: "你是长文本阅读工作流。请围绕用户上传或描述的材料，输出核心摘要、证据链、可引用观点、教学使用建议和待核验事实。"
  },
  {
    id: "animation",
    title: "网页动画",
    routeHint: "coze",
    artifactType: "html-animation",
    summary: "生成课堂互动 HTML 动画方案与可下载结构",
    status: "published",
    inputFields: ["教学主题", "互动目标", "适用年级", "动画对象", "交互方式", "下载需求"],
    outputSections: ["学习目标", "交互步骤", "HTML 结构", "CSS 动效", "JS 逻辑", "ZIP 文件清单", "安全注意事项"],
    qualityChecklist: ["动效服务教学目标", "交互步骤清楚可测", "避免外链脚本和敏感数据", "输出可预览并可打包下载"],
    systemPrompt: "你是 HTML 教学动画工作流。请输出适合课堂展示的交互动画方案，包含学习目标、交互步骤、HTML/CSS/JS 结构、安全注意事项和 ZIP 文件清单。"
  },
  {
    id: "image",
    title: "看图分析",
    routeHint: "gemini",
    artifactType: "image-analysis",
    summary: "理解图片、图表和教学素材并转化为课堂问题",
    status: "published",
    inputFields: ["图片/图表", "学科场景", "学生年级", "分析目标", "提问层级", "补充要求"],
    outputSections: ["可见元素", "关系与趋势", "教学价值", "课堂追问", "活动建议", "不确定细节"],
    qualityChecklist: ["只描述可见或可推断内容", "不确定视觉细节必须说明", "问题设计有层次", "活动建议适合真实课堂"],
    systemPrompt: "你是图片理解工作流。请分析图片或图表中的关键元素、关系、教学价值、可追问问题和课堂活动建议；不确定的视觉细节必须说明。"
  }
];

export function workflowById(id) {
  return teachingWorkflows.find(item => item.id === id) || null;
}

export function buildWorkflowMessage(workflow, body = {}) {
  const prompt = String(body.prompt || body.message || "").trim();
  const subject = String(body.subject || "").trim();
  const grade = String(body.grade || "").trim();
  const duration = String(body.duration || "").trim();
  const requirements = String(body.requirements || "").trim();
  return [
    `工作流：${workflow.title}`,
    subject && `学科/主题：${subject}`,
    grade && `学段/年级：${grade}`,
    duration && `课时/时长：${duration}`,
    requirements && `补充要求：${requirements}`,
    prompt && `用户任务：${prompt}`,
    workflow.inputFields?.length && `建议输入字段：${workflow.inputFields.join("、")}`,
    workflow.outputSections?.length && `输出必须包含：${workflow.outputSections.join("、")}`,
    workflow.qualityChecklist?.length && `质量检查清单：${workflow.qualityChecklist.join("；")}`,
    "请按该工作流的标准结构输出。"
  ].filter(Boolean).join("\n");
}

export function workflowArtifact(workflow, prompt) {
  if (workflow.artifactType === "html-slides") {
    return {
      type: "slides",
      title: `${workflow.title}成果预览`,
      html: `<div class="slide-deck"><section><small>百年晓庄智慧教育平台</small><h1>${escapeArtifact(prompt).slice(0, 34)}</h1><p>${workflow.summary}</p></section><section><h2>页面结构</h2><ol><li>导入情境</li><li>核心概念</li><li>活动探究</li><li>课堂评价</li></ol></section></div>`
    };
  }
  if (workflow.artifactType === "html-animation") {
    return {
      type: "html",
      title: `${workflow.title}预览`,
      html: `<div class="code-preview"><div class="orbit-demo"><span></span><b>互动教学动画</b></div><p>${workflow.summary}</p></div>`
    };
  }
  return {
    type: workflow.artifactType,
    title: `${workflow.title}成果`,
    html: `<div class="workflow-artifact"><strong>${workflow.title}</strong><p>${workflow.summary}</p><small>成果由服务端工作流生成，并进入模型路由与审计链路。</small></div>`
  };
}

function escapeArtifact(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}
