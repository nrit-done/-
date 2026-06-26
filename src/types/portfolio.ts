export type PortfolioProjectStatus = "online" | "building" | "case-study";

export type PortfolioProjectImpact = {
  label: string;
  value: string;
};

export type PortfolioProjectDetail = {
  id: string;
  name: string;
  role: string;
  status: PortfolioProjectStatus;
  category: string;
  summary: string;
  problem: string;
  solution: string;
  highlights: string[];
  techStack: string[];
  evidence: string[];
  impact: PortfolioProjectImpact[];
  demoUrl: string;
  githubUrl: string;
  updatedAt: string;
};

export type PortfolioProfile = {
  name: string;
  title: string;
  location: string;
  summary: string;
  email: string;
  github: string;
  website: string;
  focus: string[];
  stats: PortfolioProjectImpact[];
};

export type SkillEvidence = {
  id: string;
  skill: string;
  level: string;
  description: string;
  projects: string[];
  proofPoints: string[];
};
