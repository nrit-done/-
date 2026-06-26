"use client";

import * as React from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CircleCheckBig,
  CircleX,
  Download,
  MessageCircleMore,
  Plus,
  RefreshCw,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import {
  ApplicationTrendChart,
  ChannelDonutChart,
  StatusDistributionChart,
} from "@/components/dashboard/dashboard-charts";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  channelDistribution,
  dashboardStats,
  recentActivities,
  statusDistribution,
  weeklyApplications,
} from "@/lib/dashboard-data";
import { downloadTextFile } from "@/lib/download";
import type {
  DashboardData,
  DashboardStatKey,
} from "@/types/dashboard";

const statKeys: DashboardStatKey[] = [
  "applications",
  "interviews",
  "offers",
  "rejected",
];

const statIcons = {
  applications: BriefcaseBusiness,
  interviews: MessageCircleMore,
  offers: CircleCheckBig,
  rejected: CircleX,
} satisfies Record<DashboardStatKey, typeof BriefcaseBusiness>;

const demoDashboard: DashboardData = {
  source: "demo",
  periodLabel: "2024-05-20 至 2024-05-26",
  stats: dashboardStats.map((stat, index) => ({
    key: statKeys[index],
    label: stat.label,
    value: stat.value,
    change: stat.change,
    trend: stat.trend,
    tone: stat.tone,
  })),
  trend: weeklyApplications,
  channels: channelDistribution,
  statuses: statusDistribution,
  activities: recentActivities.map((activity) => ({ ...activity })),
};

export function DashboardPage() {
  const [dashboard, setDashboard] =
    React.useState<DashboardData>(demoDashboard);
  const [loading, setLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState("");

  const loadDashboard = React.useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("dashboard request failed");
      }

      const result = (await response.json()) as { dashboard: DashboardData };
      setDashboard(result.dashboard);
      setFeedback("仪表盘数据已更新");
    } catch {
      setDashboard(demoDashboard);
      setFeedback("服务端数据暂不可用，当前展示演示数据");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      `jobpilot-dashboard-${date}.json`,
      JSON.stringify(dashboard, null, 2),
      "application/json;charset=utf-8",
    );
    setFeedback("仪表盘数据已导出为 JSON");
  };

  return (
    <AppShell activeItem="dashboard">
      <div className="space-y-4">
        <header className="rounded-[10px] border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="blue">仪表盘</Badge>
                <Badge tone={dashboard.source === "account" ? "green" : "gray"}>
                  {dashboard.source === "account" ? "账号数据" : "演示数据"}
                </Badge>
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-normal">
                求职进展总览
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                统计周期：{dashboard.periodLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                loading={loading}
                onClick={() => void loadDashboard()}
              >
                <RefreshCw />
                刷新
              </Button>
              <Button type="button" variant="outline" onClick={handleExport}>
                <Download />
                导出数据
              </Button>
              <Button asChild>
                <Link href="/jobs">
                  <Plus />
                  新增岗位
                </Link>
              </Button>
            </div>
          </div>
          {feedback ? (
            <p className="mt-4 rounded-[8px] border border-blue-100 bg-info-soft px-3 py-2 text-sm text-info">
              {feedback}
            </p>
          ) : null}
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboard.stats.map((stat) => (
            <StatCard
              key={stat.key}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              tone={stat.tone}
              icon={statIcons[stat.key]}
            />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <ApplicationTrendChart data={dashboard.trend} />
          <ChannelDonutChart data={dashboard.channels} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
          <StatusDistributionChart data={dashboard.statuses} />
          <RecentActivity activities={dashboard.activities} />
        </section>
      </div>
    </AppShell>
  );
}
