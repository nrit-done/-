import "server-only";

import { jobStatusMeta } from "@/lib/job-status";
import type {
  DashboardActivity,
  DashboardData,
  DashboardDistributionItem,
  DashboardStat,
  DashboardTrendPoint,
} from "@/types/dashboard";
import type { InterviewCard } from "@/types/interview";
import type { Job, JobStatus } from "@/types/job";

const channelColors = [
  "#0f6bff",
  "#ff6b4a",
  "#16a34a",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
];

const interviewStatuses: JobStatus[] = [
  "written_test",
  "first_interview",
  "second_interview",
  "hr_interview",
];

export function buildDashboardData(
  jobs: Job[],
  interviews: InterviewCard[],
  source: DashboardData["source"],
): DashboardData {
  const sortedJobs = [...jobs].sort((left, right) =>
    right.appliedAt.localeCompare(left.appliedAt),
  );
  const latestDate = sortedJobs[0]?.appliedAt ?? new Date().toISOString().slice(0, 10);
  const earliestDate =
    sortedJobs.at(-1)?.appliedAt ?? latestDate;

  return {
    source,
    periodLabel: `${earliestDate} 至 ${latestDate}`,
    stats: buildStats(jobs),
    trend: buildTrend(jobs, latestDate),
    channels: buildChannels(jobs),
    statuses: buildStatuses(jobs),
    activities: buildActivities(jobs, interviews),
  };
}

function buildStats(jobs: Job[]): DashboardStat[] {
  const counts = {
    applications: jobs.length,
    interviews: jobs.filter((job) => interviewStatuses.includes(job.status)).length,
    offers: jobs.filter((job) => job.status === "offer").length,
    rejected: jobs.filter((job) => job.status === "rejected").length,
  };

  return [
    {
      key: "applications",
      label: "全部投递",
      value: counts.applications,
      change: `${counts.applications} 条`,
      trend: "账号内",
      tone: "success",
    },
    {
      key: "interviews",
      label: "面试中",
      value: counts.interviews,
      change: `${counts.interviews} 条`,
      trend: "当前",
      tone: "success",
    },
    {
      key: "offers",
      label: "已获得 Offer",
      value: counts.offers,
      change: `${counts.offers} 条`,
      trend: "累计",
      tone: "success",
    },
    {
      key: "rejected",
      label: "被拒绝",
      value: counts.rejected,
      change: `${counts.rejected} 条`,
      trend: "累计",
      tone: "danger",
    },
  ];
}

function buildTrend(jobs: Job[], latestDate: string): DashboardTrendPoint[] {
  const latest = new Date(`${latestDate}T00:00:00Z`);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(latest);
    date.setUTCDate(latest.getUTCDate() - (6 - index));
    const isoDate = date.toISOString().slice(0, 10);

    return {
      date: isoDate.slice(5),
      count: jobs.filter((job) => job.appliedAt === isoDate).length,
    };
  });
}

function buildChannels(jobs: Job[]): DashboardDistributionItem[] {
  const counts = new Map<string, number>();
  jobs.forEach((job) => counts.set(job.channel, (counts.get(job.channel) ?? 0) + 1));
  const total = Math.max(1, jobs.length);

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([name, count], index) => ({
      name,
      value: Math.round((count / total) * 100),
      color: channelColors[index % channelColors.length],
    }));
}

function buildStatuses(jobs: Job[]) {
  const statusOrder: JobStatus[] = [
    "pending",
    "applied",
    "written_test",
    "first_interview",
    "second_interview",
    "hr_interview",
    "offer",
    "rejected",
  ];

  return statusOrder.map((status) => ({
    status: jobStatusMeta[status].label,
    count: jobs.filter((job) => job.status === status).length,
  }));
}

function buildActivities(
  jobs: Job[],
  interviews: InterviewCard[],
): DashboardActivity[] {
  const jobActivities: DashboardActivity[] = [...jobs]
    .sort((left, right) => right.appliedAt.localeCompare(left.appliedAt))
    .slice(0, 4)
    .map((job) => ({
      id: `job-${job.id}`,
      company: job.company,
      title: job.title,
      action: jobStatusMeta[job.status].label,
      time: job.appliedAt,
      tone:
        job.status === "rejected"
          ? "red"
          : job.status === "offer"
            ? "green"
            : job.status === "pending"
              ? "orange"
              : "blue",
    }));
  const interviewActivities: DashboardActivity[] = [...interviews]
    .sort((left, right) => right.interviewAt.localeCompare(left.interviewAt))
    .slice(0, 4)
    .map((interview) => ({
      id: `interview-${interview.id}`,
      company: interview.company,
      title: interview.jobTitle,
      action: interview.nextAction,
      time: interview.interviewAt,
      tone: interview.stage === "offer" ? "green" : "blue",
    }));

  return [...jobActivities, ...interviewActivities]
    .sort((left, right) => right.time.localeCompare(left.time))
    .slice(0, 5);
}
