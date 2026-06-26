export type ResumeTemplate = "professional" | "minimal" | "technical";

export type ResumeProfileData = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
};

export type ResumeExperienceData = {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
};

export type ResumeProjectData = {
  id: string;
  name: string;
  role: string;
  period: string;
  summary: string;
  highlights: string[];
  techStack: string[];
  selected: boolean;
};

export type ResumeEducationData = {
  school: string;
  major: string;
  degree: string;
  period: string;
};

export type ResumeTargetJobData = {
  role: string;
  company: string;
  keywords: string;
};

export type ResumeData = {
  profile: ResumeProfileData;
  skills: string[];
  experience: ResumeExperienceData[];
  projects: ResumeProjectData[];
  education: ResumeEducationData;
  targetJob: ResumeTargetJobData;
};
