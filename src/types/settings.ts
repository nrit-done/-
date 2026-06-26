export type ThemePreference = "light" | "dark" | "system";
export type DensityPreference = "comfortable" | "compact";

export type UserProfileSettings = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  github: string;
};

export type AppearanceSettings = {
  theme: ThemePreference;
  density: DensityPreference;
};

export type NotificationSettings = {
  interviewReminder: boolean;
  applicationReminder: boolean;
  weeklySummary: boolean;
  browserNotification: boolean;
};

export type PrivacySettings = {
  showEmailInPortfolio: boolean;
  includeAtsKeywords: boolean;
  rememberFilters: boolean;
};

export type JobPilotSettings = {
  profile: UserProfileSettings;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
};

export type JobPilotBackup = {
  app: "JobPilot";
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
};
