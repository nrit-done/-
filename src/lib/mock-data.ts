import type { Job } from "@/types/job";

export const demoJobs: Job[] = [
  {
    id: "job-1",
    title: "前端开发工程师",
    company: "字节跳动",
    channel: "Boss直聘",
    location: "北京",
    status: "first_interview",
    appliedAt: "2024-05-26",
    skills: ["React", "TypeScript", "Next.js"],
  },
  {
    id: "job-2",
    title: "高级前端工程师",
    company: "腾讯",
    channel: "内推",
    location: "深圳",
    status: "written_test",
    appliedAt: "2024-05-25",
    skills: ["Vue", "Vite", "Node.js"],
  },
  {
    id: "job-3",
    title: "Web 前端开发",
    company: "京东",
    channel: "招聘",
    location: "北京",
    status: "applied",
    appliedAt: "2024-05-21",
    skills: ["React", "Webpack", "性能优化"],
  },
];
