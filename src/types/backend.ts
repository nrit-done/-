import type { JobPilotSettings } from "@/types/settings";
import type { Job } from "@/types/job";
import type { InterviewCard } from "@/types/interview";
import type { ResumeData, ResumeTemplate } from "@/types/resume";

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

export type ServerSettingsRecord = {
  userId: string;
  settings: JobPilotSettings;
  updatedAt: string;
};

export type UserJobsRecord = {
  userId: string;
  jobs: Job[];
  updatedAt: string;
};

export type UserInterviewsRecord = {
  userId: string;
  interviews: InterviewCard[];
  updatedAt: string;
};

export type UserResumeRecord = {
  userId: string;
  resume: ResumeData;
  template: ResumeTemplate;
  updatedAt: string;
};

export type JobPilotDatabase = {
  version: 1;
  users: StoredUser[];
  settings: ServerSettingsRecord[];
  jobs: UserJobsRecord[];
  interviews: UserInterviewsRecord[];
  resumes: UserResumeRecord[];
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export type HealthResponse = {
  status: "ok";
  service: "jobpilot-api";
  timestamp: string;
  database: {
    driver: "json-file";
    writable: boolean;
  };
};
