import type { JobStatus } from "@/types/job";

export const jobStatusMeta: Record<
  JobStatus,
  {
    label: string;
    tone: "default" | "blue" | "green" | "orange" | "red" | "gray";
  }
> = {
  pending: { label: "待投递", tone: "gray" },
  applied: { label: "已投递", tone: "blue" },
  written_test: { label: "笔试", tone: "orange" },
  first_interview: { label: "一面", tone: "green" },
  second_interview: { label: "二面", tone: "green" },
  hr_interview: { label: "HR 面", tone: "blue" },
  offer: { label: "Offer", tone: "green" },
  rejected: { label: "拒绝", tone: "red" },
};

export const jobStatusOptions = Object.entries(jobStatusMeta).map(
  ([value, meta]) => ({
    value,
    label: meta.label,
  }),
);
