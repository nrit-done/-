import { portfolioProfile, portfolioProjects } from "@/lib/portfolio-data";
import type { ResumeData } from "@/types/resume";

export const defaultResumeData: ResumeData = {
  profile: {
    name: portfolioProfile.name,
    title: portfolioProfile.title,
    email: portfolioProfile.email,
    phone: "138-0000-0000",
    location: portfolioProfile.location,
    website: portfolioProfile.website,
    summary:
      "具备 React、TypeScript 和 Next.js 项目经验，能够独立完成中后台页面、复杂表单、数据可视化和响应式适配，并使用真实浏览器验证关键业务流程。",
  },
  skills: [
    "React",
    "TypeScript",
    "Next.js",
    "Tailwind CSS",
    "状态管理",
    "数据可视化",
    "响应式布局",
    "浏览器自动化测试",
  ],
  experience: [
    {
      id: "experience-jobpilot",
      company: "个人产品实验室",
      role: "前端开发工程师",
      period: "2025.09 - 至今",
      description:
        "负责求职管理平台的产品拆解、前端架构和页面开发。\n沉淀 Button、Modal、Table、Pagination 等可复用组件。\n建立类型检查、生产构建和浏览器截图验证流程。",
    },
  ],
  projects: portfolioProjects.map((project, index) => ({
    id: project.id,
    name: project.name,
    role: project.role,
    period: project.updatedAt.slice(0, 7),
    summary: project.summary,
    highlights: project.highlights,
    techStack: project.techStack,
    selected: index < 2,
  })),
  education: {
    school: "示例大学",
    major: "计算机科学与技术",
    degree: "本科",
    period: "2021.09 - 2025.06",
  },
  targetJob: {
    role: "前端开发工程师",
    company: "目标公司",
    keywords:
      "React, TypeScript, Next.js, 组件化, 性能优化, 工程化, CI/CD",
  },
};
