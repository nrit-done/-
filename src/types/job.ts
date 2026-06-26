export type JobStatus =
  | "pending"
  | "applied"
  | "written_test"
  | "first_interview"
  | "second_interview"
  | "hr_interview"
  | "offer"
  | "rejected";

export type Job = {
  id: string;
  title: string;
  company: string;
  channel: string;
  location: string;
  salary?: string;
  url?: string;
  status: JobStatus;
  appliedAt: string;
  description?: string;
  skills: string[];
};

export type UserSkill = {
  id: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced";
  category: "frontend" | "backend" | "tooling" | "engineering";
};

export type PortfolioProject = {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  demoUrl?: string;
  githubUrl?: string;
  stars?: number;
  views?: number;
};
