export type SkillCategory =
  | "core"
  | "framework"
  | "engineering"
  | "tooling"
  | "backend";

export type SkillTrend = "up" | "stable" | "down";

export type SkillRequirement = {
  id: string;
  name: string;
  category: SkillCategory;
  demand: number;
  current: number;
  target: number;
  trend: SkillTrend;
  relatedJobs: string[];
  evidence: string[];
  recommendation: string;
  learningPlan: string[];
  matchedProjects: string[];
};

export type TargetRole = {
  id: string;
  label: string;
  description: string;
  keywords: string[];
};

export type ProjectMatch = {
  id: string;
  name: string;
  description: string;
  score: number;
  skills: string[];
  nextImprovements: string[];
};
