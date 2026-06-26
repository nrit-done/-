import type { JobPilotSettings } from "@/types/settings";

export const settingsStorageKey = "jobpilot-settings";
export const settingsChangedEvent = "jobpilot-settings-changed";

export const defaultSettings: JobPilotSettings = {
  profile: {
    name: "Kimi",
    title: "前端开发工程师",
    email: "kimi@example.com",
    phone: "138-0000-0000",
    location: "北京 / 远程",
    github: "https://github.com/kimi-jobpilot",
  },
  appearance: {
    theme: "light",
    density: "comfortable",
  },
  notifications: {
    interviewReminder: true,
    applicationReminder: true,
    weeklySummary: true,
    browserNotification: false,
  },
  privacy: {
    showEmailInPortfolio: true,
    includeAtsKeywords: true,
    rememberFilters: true,
  },
};

export function cloneDefaultSettings() {
  return JSON.parse(JSON.stringify(defaultSettings)) as JobPilotSettings;
}
