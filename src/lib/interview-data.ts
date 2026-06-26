import type {
  InterviewCard,
  InterviewFormat,
  InterviewPriority,
  InterviewStageId,
} from "@/types/interview";

export const interviewStages: {
  id: InterviewStageId;
  label: string;
  description: string;
}[] = [
  {
    id: "screening",
    label: "初筛",
    description: "简历筛选、电话沟通和基础信息确认",
  },
  {
    id: "written_test",
    label: "笔试",
    description: "算法题、业务题或限时项目",
  },
  {
    id: "first_interview",
    label: "一面",
    description: "技术基础、项目深挖和编码能力",
  },
  {
    id: "second_interview",
    label: "二面",
    description: "工程设计、协作方式和业务理解",
  },
  {
    id: "hr_interview",
    label: "HR 面",
    description: "薪资、稳定性、入职时间和团队匹配",
  },
  {
    id: "offer",
    label: "Offer",
    description: "薪资包、入职流程和最终选择",
  },
];

export const interviewPriorityMeta: Record<
  InterviewPriority,
  {
    label: string;
    tone: "blue" | "green" | "orange" | "red" | "gray";
  }
> = {
  high: { label: "高优先级", tone: "red" },
  medium: { label: "正常", tone: "orange" },
  low: { label: "观察", tone: "gray" },
};

export const interviewFormatMeta: Record<InterviewFormat, string> = {
  online: "线上",
  onsite: "现场",
  phone: "电话",
};

export const initialInterviewCards: InterviewCard[] = [
  {
    id: "interview-001",
    jobTitle: "前端开发工程师",
    company: "字节跳动",
    stage: "first_interview",
    priority: "high",
    format: "online",
    location: "飞书会议",
    interviewAt: "2026-06-24 14:30",
    interviewer: "增长平台前端负责人",
    channel: "Boss直聘",
    nextAction: "复盘 JobPilot 仪表盘实现，准备性能优化案例。",
    notes: "重点说明图表 SSR 处理、组件抽象和响应式验证流程。",
    skills: ["React", "TypeScript", "Next.js", "Recharts"],
    timeline: [
      {
        id: "t-001-1",
        time: "2026-06-21 10:12",
        title: "收到面试邀约",
        content: "HR 确认一面时间，需要准备项目讲解和手写题。",
      },
      {
        id: "t-001-2",
        time: "2026-06-22 20:40",
        title: "完成项目复盘",
        content: "整理了仪表盘、岗位管理和表单校验的实现亮点。",
      },
    ],
  },
  {
    id: "interview-002",
    jobTitle: "高级前端工程师",
    company: "腾讯",
    stage: "written_test",
    priority: "medium",
    format: "online",
    location: "腾讯会议",
    interviewAt: "2026-06-24 19:00",
    interviewer: "招聘系统",
    channel: "内推",
    nextAction: "准备数组、树、Promise 和节流防抖题。",
    notes: "笔试时长 90 分钟，要求使用 TypeScript。",
    skills: ["TypeScript", "算法", "工程化", "Webpack"],
    timeline: [
      {
        id: "t-002-1",
        time: "2026-06-20 15:30",
        title: "内推通过",
        content: "岗位侧重组件体系和构建优化。",
      },
    ],
  },
  {
    id: "interview-003",
    jobTitle: "前端工程师",
    company: "美团",
    stage: "hr_interview",
    priority: "high",
    format: "phone",
    location: "电话沟通",
    interviewAt: "2026-06-25 11:00",
    interviewer: "HRBP",
    channel: "拉勾网",
    nextAction: "准备期望薪资、到岗时间和项目贡献数据。",
    notes: "技术面反馈较好，HR 会重点问稳定性和团队协作。",
    skills: ["React", "Zustand", "Tailwind CSS", "数据看板"],
    timeline: [
      {
        id: "t-003-1",
        time: "2026-06-18 16:00",
        title: "二面完成",
        content: "讨论了权限系统、图表性能和异常处理。",
      },
      {
        id: "t-003-2",
        time: "2026-06-22 09:15",
        title: "进入 HR 面",
        content: "HR 预计 6 月 25 日电话沟通。",
      },
    ],
  },
  {
    id: "interview-004",
    jobTitle: "前端开发工程师",
    company: "阿里巴巴",
    stage: "second_interview",
    priority: "medium",
    format: "online",
    location: "钉钉会议",
    interviewAt: "2026-06-26 16:00",
    interviewer: "商家后台技术专家",
    channel: "官网",
    nextAction: "补充复杂表单、权限控制和跨端适配案例。",
    notes: "二面更关注架构设计和业务抽象能力。",
    skills: ["Vue", "TypeScript", "Sass", "E2E"],
    timeline: [
      {
        id: "t-004-1",
        time: "2026-06-19 14:20",
        title: "一面通过",
        content: "项目深挖表现稳定，建议准备系统设计题。",
      },
    ],
  },
  {
    id: "interview-005",
    jobTitle: "React 前端工程师",
    company: "快手",
    stage: "screening",
    priority: "low",
    format: "phone",
    location: "电话沟通",
    interviewAt: "2026-06-27 10:00",
    interviewer: "招聘 HR",
    channel: "猎聘",
    nextAction: "确认岗位方向和团队业务范围。",
    notes: "可作为备选机会，先了解业务和薪资范围。",
    skills: ["React", "TypeScript", "SWR", "监控"],
    timeline: [
      {
        id: "t-005-1",
        time: "2026-06-22 18:30",
        title: "HR 初次联系",
        content: "岗位负责内容创作者工具和数据分析系统。",
      },
    ],
  },
  {
    id: "interview-006",
    jobTitle: "前端开发工程师",
    company: "百度",
    stage: "offer",
    priority: "high",
    format: "online",
    location: "邮件确认",
    interviewAt: "2026-06-28 18:00",
    interviewer: "招聘 HR",
    channel: "官网",
    nextAction: "对比薪资包、成长空间和入职时间。",
    notes: "Offer 已进入审批流程，需要和其他机会做横向比较。",
    skills: ["React", "TypeScript", "ECharts", "Node.js"],
    timeline: [
      {
        id: "t-006-1",
        time: "2026-06-16 17:45",
        title: "终面通过",
        content: "负责人认可项目完整度和工程习惯。",
      },
      {
        id: "t-006-2",
        time: "2026-06-21 13:20",
        title: "进入 Offer 审批",
        content: "HR 预计本周内反馈薪资包。",
      },
    ],
  },
  {
    id: "interview-007",
    jobTitle: "Web 前端开发",
    company: "京东",
    stage: "first_interview",
    priority: "medium",
    format: "onsite",
    location: "北京亦庄",
    interviewAt: "2026-06-29 15:00",
    interviewer: "供应链前端负责人",
    channel: "招聘",
    nextAction: "准备中后台表格、筛选和审批流实现细节。",
    notes: "现场面试，需要提前 30 分钟到达。",
    skills: ["Vue", "Element Plus", "Vite", "低代码"],
    timeline: [
      {
        id: "t-007-1",
        time: "2026-06-23 09:30",
        title: "确认现场面试",
        content: "需要携带身份证，现场可能有上机题。",
      },
    ],
  },
];
