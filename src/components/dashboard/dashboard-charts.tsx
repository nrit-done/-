"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  DashboardDistributionItem,
  DashboardStatusItem,
  DashboardTrendPoint,
} from "@/types/dashboard";

const axisStyle = {
  fontSize: 12,
  fill: "#667085",
};

const emptySubscribe = () => () => {};

function useHasMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-full min-h-52 items-center justify-center rounded-[8px] border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
      图表加载中...
    </div>
  );
}

export function ApplicationTrendChart({
  data,
}: {
  data: DashboardTrendPoint[];
}) {
  const mounted = useHasMounted();

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>近 7 天投递趋势</CardTitle>
        <CardDescription>展示最近一周每天新增投递数量。</CardDescription>
      </CardHeader>
      <CardContent className="h-72 pt-4">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#e9eef7"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                cursor={{ stroke: "#cfe0ff", strokeWidth: 1 }}
                contentStyle={{
                  border: "1px solid #e4e9f2",
                  borderRadius: 8,
                  boxShadow: "0 12px 30px rgba(16, 24, 40, 0.08)",
                }}
                formatter={(value) => [`${value} 个岗位`, "投递数"]}
                labelFormatter={(label) => `日期 ${label}`}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0f6bff"
                strokeWidth={3}
                isAnimationActive={false}
                dot={{
                  r: 3,
                  strokeWidth: 2,
                  fill: "#ffffff",
                  stroke: "#0f6bff",
                }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ChartSkeleton />
        )}
      </CardContent>
    </Card>
  );
}

export function ChannelDonutChart({
  data,
}: {
  data: DashboardDistributionItem[];
}) {
  const mounted = useHasMounted();

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>投递渠道占比</CardTitle>
        <CardDescription>用于判断目前最有效的岗位来源。</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4 md:grid-cols-[1fr_0.9fr]">
        <div className="h-64">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={3}
                isAnimationActive={false}
              >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e4e9f2",
                    borderRadius: 8,
                    boxShadow: "0 12px 30px rgba(16, 24, 40, 0.08)",
                  }}
                  formatter={(value) => [`${value}%`, "占比"]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartSkeleton />
          )}
        </div>
        <div className="flex flex-col justify-center gap-3">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-semibold">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusDistributionChart({
  data,
}: {
  data: DashboardStatusItem[];
}) {
  const mounted = useHasMounted();

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>状态分布</CardTitle>
        <CardDescription>快速查看岗位集中在哪些流程阶段。</CardDescription>
      </CardHeader>
      <CardContent className="h-80 pt-4">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 22, left: 6, bottom: 0 }}
            >
              <CartesianGrid stroke="#eef2f8" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="status"
                type="category"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                width={58}
              />
              <Tooltip
                cursor={{ fill: "#f3f6fb" }}
                contentStyle={{
                  border: "1px solid #e4e9f2",
                  borderRadius: 8,
                  boxShadow: "0 12px 30px rgba(16, 24, 40, 0.08)",
                }}
                formatter={(value) => [`${value} 个岗位`, "数量"]}
              />
              <Bar
                dataKey="count"
                fill="#7aa7ff"
                radius={[0, 8, 8, 0]}
                barSize={12}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartSkeleton />
        )}
      </CardContent>
    </Card>
  );
}
