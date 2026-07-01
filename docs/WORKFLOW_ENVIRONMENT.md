# 百年晓庄智慧教育平台工作流环境清单

生成时间：2026-06-20T11:16:11.691Z

本清单由 `npm run check:workflow-env:report` 生成，用于把教学工作流、自动模型路由、服务端环境变量、备用链路和上线验收责任方对应起来。所有 API Key、Workflow ID 和 SSO/校友会密钥只能配置在服务端 `.env`、容器环境或云平台 Secret 中，不进入浏览器、GitHub Pages 静态产物或智能体导出文件。

## 工作流与模型环境

| 工作流 ID | 工作流 | 首选模型/平台 | 成果类型 | 必要环境变量 | 默认模型 | 备用链路 | 输出结构 | 质检清单 | 责任方 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lesson | 写教案 | DeepSeek | lesson-plan | `DEEPSEEK_API_KEY`<br>`DEEPSEEK_API_URL`<br>`DEEPSEEK_MODEL` | deepseek-chat | 通义千问、腾讯混元 | 学情分析、教学目标、重点难点、教学过程、评价设计、板书建议、课后反思 | 目标、活动和评价保持一致；活动可在真实课堂执行；评价方式包含形成性证据；不编造学校政策或课程数据 | 教务处/教师教育学院工作流负责人 |
| ppt | 做课件 | ChatGPT | html-slides | `OPENAI_API_KEY`<br>`OPENAI_API_URL`<br>`OPENAI_MODEL` | gpt-5 | Gemini、通义千问、腾讯混元 | 封面页、目录与学习目标、逐页大纲、讲稿提示、课堂互动、HTML 演示结构 | 每页只承载一个核心观点；讲稿与页面要点对应；包含课堂提问或互动；HTML 结构可复制并适合演示 | 智慧教学与资源建设负责人 |
| quiz | 出题组卷 | 通义千问 | question-set | `QWEN_API_KEY`<br>`QWEN_API_URL`<br>`QWEN_MODEL` | qwen-plus | 腾讯混元 | 命题目标、题目清单、答案、解析、评分标准、易错点 | 题目覆盖目标知识点；难度分层清晰；答案和解析一致；评分标准可操作 | 教学质量与测评负责人 |
| document | 读长文档 | Kimi | document-brief | `MOONSHOT_API_KEY`<br>`MOONSHOT_API_URL`<br>`MOONSHOT_MODEL` | moonshot-v1-32k | 通义千问、腾讯混元 | 核心摘要、证据链、可引用观点、教学使用建议、待核验事实、后续追问 | 区分原文事实与推断；保留关键出处线索；标记不确定内容；给出可用于课堂或研究的下一步 | 图书馆/档案与长文本应用负责人 |
| animation | 网页动画 | Coze Workflow | html-animation | `COZE_API_KEY`<br>`COZE_API_URL`<br>`COZE_WORKFLOW_ID` | 按服务端配置 | 通义千问、腾讯混元 | 学习目标、交互步骤、HTML 结构、CSS 动效、JS 逻辑、ZIP 文件清单、安全注意事项 | 动效服务教学目标；交互步骤清楚可测；避免外链脚本和敏感数据；输出可预览并可打包下载 | 数字资源与 Coze 工作流负责人 |
| image | 看图分析 | Gemini | image-analysis | `GEMINI_API_KEY`<br>`GEMINI_API_URL`<br>`GEMINI_MODEL` | gemini-2.5-flash | 通义千问、腾讯混元 | 可见元素、关系与趋势、教学价值、课堂追问、活动建议、不确定细节 | 只描述可见或可推断内容；不确定视觉细节必须说明；问题设计有层次；活动建议适合真实课堂 | 教育技术与多模态应用负责人 |

## 上线验收动作

| 工作流 | 操作 | 通过标准 | 责任方 |
| --- | --- | --- | --- |
| 写教案 | 后台执行“测试工作流” | 测试状态为“已测试”，上线自检中 Workflow route tests 为 OK | 教务处/教师教育学院工作流负责人 |
| 做课件 | 后台执行“测试工作流” | 测试状态为“已测试”，上线自检中 Workflow route tests 为 OK | 智慧教学与资源建设负责人 |
| 出题组卷 | 后台执行“测试工作流” | 测试状态为“已测试”，上线自检中 Workflow route tests 为 OK | 教学质量与测评负责人 |
| 读长文档 | 后台执行“测试工作流” | 测试状态为“已测试”，上线自检中 Workflow route tests 为 OK | 图书馆/档案与长文本应用负责人 |
| 网页动画 | 后台执行“测试工作流” | 测试状态为“已测试”，上线自检中 Workflow route tests 为 OK | 数字资源与 Coze 工作流负责人 |
| 看图分析 | 后台执行“测试工作流” | 测试状态为“已测试”，上线自检中 Workflow route tests 为 OK | 教育技术与多模态应用负责人 |

## 部署顺序

1. 复制 `.env.production.example` 为生产环境变量模板。
2. 先配置 DeepSeek、Kimi、ChatGPT、Gemini、Coze 的 Key、URL 和模型/Workflow ID。
3. 配置通义千问、豆包、智谱 GLM、文心一言、腾讯混元作为中文通用与备用链路。
4. 启动 Node 服务端后登录后台，逐个执行工作流测试。
5. 测试通过后发布工作流，并运行 `npm run check:deploy:strict` 做正式上线门禁。

## 安全边界

- 前端只展示路由结果、模型名称和测试状态，不保存 API Key。
- 工作流导入/导出只包含提示词、路由和发布状态，不包含任何密钥。
- Coze 网页动画必须通过服务端 `COZE_API_KEY` 与 `COZE_WORKFLOW_ID` 调用，浏览器只接收平台生成的预览和下载文件。
- 校友 Token 扣减以服务端模型调用台账和 Token 账本为准，失败调用会释放预留额度。
