export type InterviewStageId =
  | "screening"
  | "written_test"
  | "first_interview"
  | "second_interview"
  | "hr_interview"
  | "offer";

export type InterviewPriority = "high" | "medium" | "low";

export type InterviewFormat = "online" | "onsite" | "phone";

export type InterviewTimelineItem = {
  id: string;
  time: string;
  title: string;
  content: string;
};

export type InterviewCard = {
  id: string;
  jobTitle: string;
  company: string;
  stage: InterviewStageId;
  priority: InterviewPriority;
  format: InterviewFormat;
  location: string;
  interviewAt: string;
  interviewer: string;
  channel: string;
  nextAction: string;
  notes: string;
  skills: string[];
  timeline: InterviewTimelineItem[];
};
