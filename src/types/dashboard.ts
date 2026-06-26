export type DashboardStatKey =
  | "applications"
  | "interviews"
  | "offers"
  | "rejected";

export type DashboardStat = {
  key: DashboardStatKey;
  label: string;
  value: number;
  change: string;
  trend: string;
  tone: "success" | "danger";
};

export type DashboardTrendPoint = {
  date: string;
  count: number;
};

export type DashboardDistributionItem = {
  name: string;
  value: number;
  color: string;
};

export type DashboardStatusItem = {
  status: string;
  count: number;
};

export type DashboardActivity = {
  id: string;
  company: string;
  title: string;
  action: string;
  time: string;
  tone: "blue" | "green" | "orange" | "red";
};

export type DashboardData = {
  source: "account" | "demo";
  periodLabel: string;
  stats: DashboardStat[];
  trend: DashboardTrendPoint[];
  channels: DashboardDistributionItem[];
  statuses: DashboardStatusItem[];
  activities: DashboardActivity[];
};
