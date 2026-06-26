import type {
  PortfolioProfile,
  PortfolioProjectDetail,
  SkillEvidence,
} from "@/types/portfolio";

export const portfolioProfile: PortfolioProfile = {
  name: "Kimi",
  title: "前端开发工程师",
  location: "北京 / 远程",
  summary:
    "专注中后台、数据看板和求职效率工具，擅长把复杂业务拆成清晰的页面结构、可维护组件和可验证交互。",
  email: "kimi@example.com",
  github: "https://github.com/kimi-jobpilot",
  website: "https://jobpilot.example.com",
  focus: ["React", "TypeScript", "Next.js", "中后台系统", "数据可视化"],
  stats: [
    { label: "精选项目", value: "4" },
    { label: "核心技能", value: "12" },
    { label: "验证截图", value: "10+" },
    { label: "求职匹配", value: "84%" },
  ],
};

export const portfolioProjects: PortfolioProjectDetail[] = [
  {
    id: "jobpilot",
    name: "JobPilot 求职管理平台",
    role: "产品设计 / 前端开发 / 浏览器验证",
    status: "online",
    category: "SaaS 工具",
    summary:
      "面向前端求职者的求职管理平台，覆盖仪表盘、岗位管理、面试看板、技能匹配和作品集展示。",
    problem:
      "求职过程中的岗位信息、面试记录、技能短板和作品集证据分散在不同工具里，难以形成持续跟进闭环。",
    solution:
      "以 App Router 页面为骨架，拆分业务模块和基础 UI 组件，用本地数据模拟真实工作流，并通过浏览器脚本验证关键交互和响应式效果。",
    highlights: [
      "完成仪表盘、岗位管理、面试看板、技术栈分析四个核心业务模块",
      "支持岗位筛选、新增编辑、面试阶段拖拽、技能缺口排序和学习计划反馈",
      "为桌面和手机分别做截图验证，保证真实展示效果",
    ],
    techStack: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Recharts"],
    evidence: [
      "类型检查、代码规范和生产构建全部通过",
      "关键页面均生成桌面与手机验证截图",
      "项目文档按阶段记录开发范围和后续规划",
    ],
    impact: [
      { label: "业务页面", value: "5" },
      { label: "可复用组件", value: "14+" },
      { label: "验证脚本", value: "4" },
    ],
    demoUrl: "https://jobpilot.example.com",
    githubUrl: "https://github.com/kimi-jobpilot/jobpilot",
    updatedAt: "2026-06-23",
  },
  {
    id: "chatflow",
    name: "ChatFlow AI 聊天应用",
    role: "前端开发 / 状态设计",
    status: "case-study",
    category: "AI 应用",
    summary:
      "多会话 AI 聊天界面，重点展示流式响应、会话管理、消息状态和异常恢复。",
    problem:
      "聊天类应用需要处理消息流、加载态、失败重试和多会话切换，状态边界容易混乱。",
    solution:
      "把会话、消息、输入状态和请求状态拆分管理，前端提供清晰反馈，并保留失败恢复入口。",
    highlights: [
      "支持多会话切换和消息状态区分",
      "设计流式输出、停止生成和重试入口",
      "适合作为全栈前端岗位的接口协作案例",
    ],
    techStack: ["React", "TypeScript", "Node.js", "状态管理"],
    evidence: [
      "有明确的状态模型和错误恢复流程",
      "可扩展到消息持久化和服务端接口",
    ],
    impact: [
      { label: "会话模型", value: "3 层" },
      { label: "关键状态", value: "8" },
      { label: "改进项", value: "3" },
    ],
    demoUrl: "https://chatflow.example.com",
    githubUrl: "https://github.com/kimi-jobpilot/chatflow",
    updatedAt: "2026-05-18",
  },
  {
    id: "explore",
    name: "Explore 发现社区",
    role: "移动端页面 / 交互实现",
    status: "building",
    category: "内容社区",
    summary:
      "面向移动端的信息流与发现页面，展示内容卡片、筛选推荐、移动端适配和视觉还原能力。",
    problem:
      "内容类页面需要兼顾视觉表达、列表扫描效率、筛选体验和移动端文本适配。",
    solution:
      "使用卡片列表、紧凑标签和固定操作区组织内容，控制字体层级和组件尺寸。",
    highlights: [
      "适合展示移动端响应式和视觉还原",
      "可扩展搜索、排序、虚拟列表和推荐策略",
      "与 JobPilot 的后台风格形成互补",
    ],
    techStack: ["Vue", "TypeScript", "Tailwind CSS", "移动端适配"],
    evidence: [
      "具备内容卡片、筛选和移动端布局设计",
      "计划补充列表性能优化和首屏加载优化",
    ],
    impact: [
      { label: "移动页面", value: "6" },
      { label: "内容卡片", value: "20+" },
      { label: "适配断点", value: "3" },
    ],
    demoUrl: "https://explore.example.com",
    githubUrl: "https://github.com/kimi-jobpilot/explore",
    updatedAt: "2026-04-26",
  },
  {
    id: "resume-kit",
    name: "Resume Kit 简历生成器",
    role: "产品规划 / 表单系统",
    status: "building",
    category: "效率工具",
    summary:
      "把个人经历、项目亮点和岗位关键词组合成可投递简历，支持浏览器打印导出 PDF。",
    problem:
      "求职者针对不同岗位改简历时容易遗漏关键词，也难以把项目亮点转成简洁表达。",
    solution:
      "用结构化表单收集项目、技能和经历，按目标岗位生成版本化简历内容。",
    highlights: [
      "将与技术栈分析页联动，把技能证据回填到简历",
      "计划支持简历多版本管理和版本对比",
      "适合展示复杂表单、模板预览和数据组织能力",
    ],
    techStack: ["Next.js", "TypeScript", "表单校验", "PDF"],
    evidence: [
      "已完成产品功能拆分和数据模型规划",
      "下一阶段会作为简历生成器页面落地",
    ],
    impact: [
      { label: "简历版本", value: "规划中" },
      { label: "模板", value: "3" },
      { label: "联动模块", value: "2" },
    ],
    demoUrl: "https://resume-kit.example.com",
    githubUrl: "https://github.com/kimi-jobpilot/resume-kit",
    updatedAt: "2026-06-01",
  },
];

export const skillEvidence: SkillEvidence[] = [
  {
    id: "react",
    skill: "React 组件设计",
    level: "高级",
    description:
      "能够把业务页面拆成稳定组件，处理弹窗、表格、筛选、看板和详情页等常见后台交互。",
    projects: ["JobPilot", "ChatFlow"],
    proofPoints: ["Button / Modal / Table / Pagination 组件", "面试看板拖拽和详情弹窗", "岗位表单校验"],
  },
  {
    id: "typescript",
    skill: "TypeScript 数据建模",
    level: "进阶",
    description:
      "使用联合类型和业务模型约束页面状态，让页面逻辑更容易维护和扩展。",
    projects: ["JobPilot"],
    proofPoints: ["JobStatus", "InterviewStage", "SkillRequirement", "PortfolioProjectDetail"],
  },
  {
    id: "responsive",
    skill: "响应式后台布局",
    level: "进阶",
    description:
      "根据桌面和手机场景分别处理表格、看板和卡片列表，避免简单横向压缩导致阅读困难。",
    projects: ["JobPilot", "Explore"],
    proofPoints: ["岗位页手机卡片化", "面试看板手机纵向列表", "技术栈页长内容纵向排布"],
  },
  {
    id: "verification",
    skill: "浏览器验证流程",
    level: "进阶",
    description:
      "用真实浏览器验证关键页面和交互，输出截图作为作品集证据，而不是只依赖肉眼检查。",
    projects: ["JobPilot"],
    proofPoints: ["桌面截图", "手机截图", "拖拽验证", "弹窗保存验证"],
  },
];
