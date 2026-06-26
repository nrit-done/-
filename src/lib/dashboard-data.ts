import {
  BriefcaseBusiness,
  CircleCheckBig,
  CircleX,
  MessageCircleMore,
} from "lucide-react";

export const dashboardStats = [
  {
    label: "全部投递",
    value: 32,
    change: "+12%",
    trend: "较上周",
    tone: "success",
    icon: BriefcaseBusiness,
  },
  {
    label: "面试中",
    value: 8,
    change: "+33%",
    trend: "较上周",
    tone: "success",
    icon: MessageCircleMore,
  },
  {
    label: "已获得 Offer",
    value: 2,
    change: "+100%",
    trend: "较上周",
    tone: "success",
    icon: CircleCheckBig,
  },
  {
    label: "被拒绝",
    value: 7,
    change: "-13%",
    trend: "较上周",
    tone: "danger",
    icon: CircleX,
  },
] as const;

export const weeklyApplications = [
  { date: "05-20", count: 4 },
  { date: "05-21", count: 6 },
  { date: "05-22", count: 5 },
  { date: "05-23", count: 8 },
  { date: "05-24", count: 6 },
  { date: "05-25", count: 8 },
  { date: "05-26", count: 12 },
];

export const channelDistribution = [
  { name: "Boss直聘", value: 40, color: "#0f6bff" },
  { name: "拉勾网", value: 25, color: "#ff6b4a" },
  { name: "猎聘", value: 15, color: "#16a34a" },
  { name: "公司官网", value: 10, color: "#22c55e" },
  { name: "内推", value: 10, color: "#f59e0b" },
];

export const statusDistribution = [
  { status: "待投递", count: 5 },
  { status: "已投递", count: 12 },
  { status: "笔试", count: 3 },
  { status: "一面", count: 4 },
  { status: "二面", count: 3 },
  { status: "HR 面", count: 2 },
  { status: "Offer", count: 2 },
  { status: "拒绝", count: 7 },
];

export const recentActivities = [
  {
    id: "activity-1",
    company: "字节跳动",
    title: "前端开发工程师",
    action: "一面安排",
    time: "05-26 14:30",
    tone: "blue",
  },
  {
    id: "activity-2",
    company: "阿里巴巴",
    title: "前端开发工程师",
    action: "二面完成",
    time: "05-25 16:20",
    tone: "green",
  },
  {
    id: "activity-3",
    company: "腾讯",
    title: "前端开发工程师",
    action: "收到笔试",
    time: "05-24 10:15",
    tone: "orange",
  },
  {
    id: "activity-4",
    company: "美团",
    title: "前端开发工程师",
    action: "被拒绝",
    time: "05-23 09:40",
    tone: "red",
  },
] as const;
