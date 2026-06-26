"use client";

import * as React from "react";
import {
  BellRing,
  Check,
  CloudDownload,
  CloudUpload,
  Database,
  Download,
  FileJson,
  HardDrive,
  Import,
  Laptop,
  Moon,
  Palette,
  RotateCcw,
  Save,
  ServerCog,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import {
  cloneDefaultSettings,
  settingsChangedEvent,
  settingsStorageKey,
} from "@/lib/settings-data";
import { cn } from "@/lib/utils";
import type {
  DensityPreference,
  JobPilotBackup,
  JobPilotSettings,
  NotificationSettings,
  PrivacySettings,
  ThemePreference,
  UserProfileSettings,
} from "@/types/settings";
import type { ServerSettingsRecord, SessionUser } from "@/types/backend";

type StorageStats = {
  itemCount: number;
  bytes: number;
  labels: string[];
};

const themeOptions: {
  value: ThemePreference;
  label: string;
  description: string;
  icon: typeof Sun;
}[] = [
  { value: "light", label: "浅色", description: "适合明亮办公环境", icon: Sun },
  { value: "dark", label: "深色", description: "降低夜间界面亮度", icon: Moon },
  { value: "system", label: "跟随系统", description: "自动匹配系统外观", icon: Laptop },
];

const densityOptions: {
  value: DensityPreference;
  label: string;
  description: string;
}[] = [
  { value: "comfortable", label: "舒适", description: "更宽松的间距和阅读密度" },
  { value: "compact", label: "紧凑", description: "适合高频浏览和大屏操作" },
];

function getStorageStats(): StorageStats {
  const labels: string[] = [];
  let bytes = 0;

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key?.startsWith("jobpilot-")) {
      continue;
    }

    const value = window.localStorage.getItem(key) ?? "";
    labels.push(key);
    bytes += new Blob([key, value]).size;
  }

  return {
    itemCount: labels.length,
    bytes,
    labels: labels.sort(),
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}

function resolveTheme(preference: ThemePreference) {
  if (preference !== "system") {
    return preference;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyAppearance(settings: JobPilotSettings) {
  document.documentElement.dataset.theme = resolveTheme(
    settings.appearance.theme,
  );
  document.documentElement.dataset.density = settings.appearance.density;
}

function loadStoredSettings() {
  const stored = window.localStorage.getItem(settingsStorageKey);

  if (!stored) {
    return cloneDefaultSettings();
  }

  try {
    return JSON.parse(stored) as JobPilotSettings;
  } catch {
    window.localStorage.removeItem(settingsStorageKey);
    return cloneDefaultSettings();
  }
}

export function SettingsPage() {
  const [settings, setSettings] =
    React.useState<JobPilotSettings>(cloneDefaultSettings);
  const [feedback, setFeedback] = React.useState("");
  const [lastSaved, setLastSaved] = React.useState("尚未保存");
  const [storageStats, setStorageStats] = React.useState<StorageStats>({
    itemCount: 0,
    bytes: 0,
    labels: [],
  });
  const [resetOpen, setResetOpen] = React.useState(false);
  const [cloudUser, setCloudUser] = React.useState<SessionUser | null>(null);
  const [cloudUpdatedAt, setCloudUpdatedAt] = React.useState("");
  const [cloudLoading, setCloudLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const restoreTimer = window.setTimeout(async () => {
      const nextSettings = loadStoredSettings();
      setSettings(nextSettings);
      setStorageStats(getStorageStats());
      applyAppearance(nextSettings);

      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const result = (await response.json()) as {
          user: SessionUser | null;
        };
        setCloudUser(result.user);
      } catch {
        setCloudUser(null);
      }
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  const updateProfile = (
    field: keyof UserProfileSettings,
    value: string,
  ) => {
    setSettings((current) => ({
      ...current,
      profile: { ...current.profile, [field]: value },
    }));
  };

  const updateNotification = (
    field: keyof NotificationSettings,
    value: boolean,
  ) => {
    setSettings((current) => ({
      ...current,
      notifications: { ...current.notifications, [field]: value },
    }));
  };

  const updatePrivacy = (
    field: keyof PrivacySettings,
    value: boolean,
  ) => {
    setSettings((current) => ({
      ...current,
      privacy: { ...current.privacy, [field]: value },
    }));
  };

  const saveSettings = () => {
    const savedAt = new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    window.localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
    applyAppearance(settings);
    window.dispatchEvent(new Event(settingsChangedEvent));
    setLastSaved(savedAt);
    setStorageStats(getStorageStats());
    setFeedback(`设置已保存，保存时间 ${savedAt}`);
  };

  const restoreDefaults = () => {
    const defaults = cloneDefaultSettings();
    setSettings(defaults);
    applyAppearance(defaults);
    setFeedback("已恢复默认设置，点击“保存设置”后永久生效。");
  };

  const exportBackup = () => {
    const data: Record<string, string> = {};

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);

      if (!key?.startsWith("jobpilot-")) {
        continue;
      }

      data[key] = window.localStorage.getItem(key) ?? "";
    }

    const backup: JobPilotBackup = {
      app: "JobPilot",
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jobpilot-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setFeedback(`已导出 ${Object.keys(data).length} 项本地数据。`);
  };

  const importBackup = async (file: File) => {
    try {
      const backup = JSON.parse(await file.text()) as JobPilotBackup;

      if (
        backup.app !== "JobPilot" ||
        backup.version !== 1 ||
        !backup.data ||
        typeof backup.data !== "object"
      ) {
        throw new Error("invalid backup");
      }

      Object.entries(backup.data).forEach(([key, value]) => {
        if (key.startsWith("jobpilot-") && typeof value === "string") {
          window.localStorage.setItem(key, value);
        }
      });

      const restoredSettings = loadStoredSettings();
      setSettings(restoredSettings);
      applyAppearance(restoredSettings);
      window.dispatchEvent(new Event(settingsChangedEvent));
      setStorageStats(getStorageStats());
      setFeedback(
        `已从 ${file.name} 恢复 ${Object.keys(backup.data).length} 项数据。`,
      );
    } catch {
      setFeedback("导入失败：请选择由 JobPilot 导出的 JSON 备份文件。");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearAllData = () => {
    const keysToRemove: string[] = [];

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);

      if (key?.startsWith("jobpilot-")) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    const defaults = cloneDefaultSettings();
    setSettings(defaults);
    setLastSaved("尚未保存");
    setStorageStats(getStorageStats());
    setResetOpen(false);
    applyAppearance(defaults);
    window.dispatchEvent(new Event(settingsChangedEvent));
    setFeedback(`已清除 ${keysToRemove.length} 项本地数据。`);
  };

  const uploadToServer = async () => {
    setCloudLoading(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = (await response.json()) as {
        message?: string;
        record?: ServerSettingsRecord;
      };

      if (!response.ok || !result.record) {
        setFeedback(result.message ?? "服务端同步失败。");
        return;
      }

      setCloudUpdatedAt(result.record.updatedAt);
      setFeedback("当前设置已保存到服务端数据库。");
    } catch {
      setFeedback("无法连接服务端，请确认服务正在运行。");
    } finally {
      setCloudLoading(false);
    }
  };

  const downloadFromServer = async () => {
    setCloudLoading(true);

    try {
      const response = await fetch("/api/settings", { cache: "no-store" });
      const result = (await response.json()) as {
        message?: string;
        record?: ServerSettingsRecord | null;
      };

      if (!response.ok) {
        setFeedback(result.message ?? "服务端读取失败。");
        return;
      }

      if (!result.record) {
        setFeedback("服务端还没有保存设置，请先上传当前配置。");
        return;
      }

      setSettings(result.record.settings);
      window.localStorage.setItem(
        settingsStorageKey,
        JSON.stringify(result.record.settings),
      );
      applyAppearance(result.record.settings);
      window.dispatchEvent(new Event(settingsChangedEvent));
      setCloudUpdatedAt(result.record.updatedAt);
      setStorageStats(getStorageStats());
      setFeedback("已从服务端恢复设置并写入本地。");
    } catch {
      setFeedback("无法连接服务端，请确认服务正在运行。");
    } finally {
      setCloudLoading(false);
    }
  };

  return (
    <AppShell activeItem="settings">
      <div className="space-y-4">
        <header className="rounded-[10px] border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <Badge tone="blue">设置</Badge>
              <h1 className="mt-3 text-2xl font-semibold tracking-normal">
                个人设置与数据管理
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                管理个人资料、界面偏好和提醒方式，并备份本机保存的简历草稿与设置。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MetricTile label="本地数据" value={storageStats.itemCount} />
              <MetricTile label="占用空间" value={formatBytes(storageStats.bytes)} />
              <MetricTile
                label="当前主题"
                value={
                  settings.appearance.theme === "light"
                    ? "浅色"
                    : settings.appearance.theme === "dark"
                      ? "深色"
                      : "系统"
                }
              />
              <MetricTile label="上次保存" value={lastSaved} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
            <Button type="button" onClick={saveSettings}>
              <Save />
              保存设置
            </Button>
            <Button type="button" variant="outline" onClick={restoreDefaults}>
              <RotateCcw />
              恢复默认
            </Button>
          </div>

          {feedback ? (
            <div
              className="mt-4 rounded-[8px] border border-blue-100 bg-info-soft px-3 py-2 text-sm text-info"
              role="status"
            >
              {feedback}
            </div>
          ) : null}
        </header>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ServerCog className="size-4 text-primary" />
                  服务端同步
                </CardTitle>
                <CardDescription>
                  登录后可将当前设置写入服务端文件数据库。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[8px] border border-border bg-muted/35 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {cloudUser ? cloudUser.email : "尚未登录"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {cloudUser
                          ? cloudUpdatedAt
                            ? `服务端更新时间 ${new Date(cloudUpdatedAt).toLocaleString("zh-CN")}`
                            : "已登录，可以同步设置"
                          : "请先进入“账号与服务”登录演示账号"}
                      </p>
                    </div>
                    <Badge tone={cloudUser ? "green" : "orange"}>
                      {cloudUser ? "会话有效" : "需要登录"}
                    </Badge>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    disabled={!cloudUser}
                    loading={cloudLoading}
                    type="button"
                    onClick={() => void uploadToServer()}
                  >
                    <CloudUpload />
                    上传当前设置
                  </Button>
                  <Button
                    disabled={!cloudUser}
                    loading={cloudLoading}
                    type="button"
                    variant="outline"
                    onClick={() => void downloadFromServer()}
                  >
                    <CloudDownload />
                    从服务端恢复
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRound className="size-4 text-primary" />
                  个人资料
                </CardTitle>
                <CardDescription>
                  姓名和职位保存后会同步到全站侧边栏。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="姓名">
                    <Input
                      aria-label="设置姓名"
                      value={settings.profile.name}
                      onChange={(event) =>
                        updateProfile("name", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="职位">
                    <Input
                      aria-label="设置职位"
                      value={settings.profile.title}
                      onChange={(event) =>
                        updateProfile("title", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="邮箱">
                    <Input
                      aria-label="设置邮箱"
                      type="email"
                      value={settings.profile.email}
                      onChange={(event) =>
                        updateProfile("email", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="电话">
                    <Input
                      aria-label="设置电话"
                      value={settings.profile.phone}
                      onChange={(event) =>
                        updateProfile("phone", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="所在地">
                    <Input
                      aria-label="设置所在地"
                      value={settings.profile.location}
                      onChange={(event) =>
                        updateProfile("location", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="GitHub">
                    <Input
                      aria-label="设置 GitHub"
                      value={settings.profile.github}
                      onChange={(event) =>
                        updateProfile("github", event.target.value)
                      }
                    />
                  </Field>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="size-4 text-primary" />
                  界面外观
                </CardTitle>
                <CardDescription>
                  选择主题后点击保存，刷新页面仍会保留。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <section>
                  <h2 className="text-sm font-semibold">主题</h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {themeOptions.map((option) => (
                      <ThemeOption
                        key={option.value}
                        active={settings.appearance.theme === option.value}
                        option={option}
                        onSelect={() =>
                          setSettings((current) => ({
                            ...current,
                            appearance: {
                              ...current.appearance,
                              theme: option.value,
                            },
                          }))
                        }
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-sm font-semibold">信息密度</h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {densityOptions.map((option) => (
                      <button
                        key={option.value}
                        aria-pressed={
                          settings.appearance.density === option.value
                        }
                        className={cn(
                          "rounded-[8px] border p-3 text-left transition",
                          settings.appearance.density === option.value
                            ? "border-primary bg-info-soft"
                            : "border-border bg-card hover:bg-muted",
                        )}
                        type="button"
                        onClick={() =>
                          setSettings((current) => ({
                            ...current,
                            appearance: {
                              ...current.appearance,
                              density: option.value,
                            },
                          }))
                        }
                      >
                        <span className="text-sm font-semibold">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          {option.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellRing className="size-4 text-primary" />
                  提醒与通知
                </CardTitle>
                <CardDescription>
                  配置求职流程中的提醒偏好，本阶段仅保存配置。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <SettingSwitch
                  checked={settings.notifications.interviewReminder}
                  description="面试开始前一天提醒准备材料和问题"
                  label="面试提醒"
                  onChange={(checked) =>
                    updateNotification("interviewReminder", checked)
                  }
                />
                <SettingSwitch
                  checked={settings.notifications.applicationReminder}
                  description="岗位超过 7 天没有更新时提示跟进"
                  label="投递跟进提醒"
                  onChange={(checked) =>
                    updateNotification("applicationReminder", checked)
                  }
                />
                <SettingSwitch
                  checked={settings.notifications.weeklySummary}
                  description="每周汇总投递数量、面试进展和技能计划"
                  label="每周总结"
                  onChange={(checked) =>
                    updateNotification("weeklySummary", checked)
                  }
                />
                <SettingSwitch
                  checked={settings.notifications.browserNotification}
                  description="允许后续接入浏览器系统通知"
                  label="浏览器通知"
                  onChange={(checked) =>
                    updateNotification("browserNotification", checked)
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  隐私与展示
                </CardTitle>
                <CardDescription>
                  控制作品集和简历中默认展示的个人信息。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <SettingSwitch
                  checked={settings.privacy.showEmailInPortfolio}
                  description="在公开作品集个人资料区域显示邮箱"
                  label="作品集显示邮箱"
                  onChange={(checked) =>
                    updatePrivacy("showEmailInPortfolio", checked)
                  }
                />
                <SettingSwitch
                  checked={settings.privacy.includeAtsKeywords}
                  description="导出的简历底部保留岗位关键词摘要"
                  label="简历保留 ATS 关键词"
                  onChange={(checked) =>
                    updatePrivacy("includeAtsKeywords", checked)
                  }
                />
                <SettingSwitch
                  checked={settings.privacy.rememberFilters}
                  description="后续保存岗位和技能页面的筛选条件"
                  label="记住页面筛选"
                  onChange={(checked) =>
                    updatePrivacy("rememberFilters", checked)
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="size-4 text-primary" />
                  数据管理
                </CardTitle>
                <CardDescription>
                  备份文件只包含浏览器中以 jobpilot- 开头的本地数据。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <DataMetric
                    icon={HardDrive}
                    label="本地项目"
                    value={`${storageStats.itemCount} 项`}
                  />
                  <DataMetric
                    icon={FileJson}
                    label="占用空间"
                    value={formatBytes(storageStats.bytes)}
                  />
                </div>

                <div className="rounded-[8px] border border-border bg-muted/35 p-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    当前数据键
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {storageStats.labels.length ? (
                      storageStats.labels.map((label) => (
                        <Badge key={label} tone="gray">
                          {label}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        暂无本地数据
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button type="button" variant="outline" onClick={exportBackup}>
                    <Download />
                    导出 JSON 备份
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Import />
                    导入备份
                  </Button>
                  <input
                    ref={fileInputRef}
                    accept="application/json,.json"
                    aria-label="选择备份文件"
                    className="hidden"
                    type="file"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void importBackup(file);
                      }
                    }}
                  />
                </div>

                <div className="border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setResetOpen(true)}
                  >
                    <Trash2 />
                    清空所有本地数据
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        description="此操作会删除简历草稿、设置和其他以 jobpilot- 开头的数据，且无法撤销。"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setResetOpen(false)}
            >
              取消
            </Button>
            <Button type="button" variant="destructive" onClick={clearAllData}>
              确认清空
            </Button>
          </>
        }
        open={resetOpen}
        title="清空本地数据？"
        onOpenChange={setResetOpen}
      >
        <div className="rounded-[8px] border border-red-100 bg-danger-soft p-4 text-sm leading-6 text-danger">
          建议先导出 JSON 备份。清空后，所有页面将恢复为默认演示数据。
        </div>
      </Modal>
    </AppShell>
  );
}

function ThemeOption({
  active,
  option,
  onSelect,
}: {
  active: boolean;
  option: (typeof themeOptions)[number];
  onSelect: () => void;
}) {
  const Icon = option.icon;

  return (
    <button
      aria-pressed={active}
      className={cn(
        "relative rounded-[8px] border p-3 text-left transition",
        active
          ? "border-primary bg-info-soft"
          : "border-border bg-card hover:bg-muted",
      )}
      type="button"
      onClick={onSelect}
    >
      {active ? (
        <span className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-primary text-white">
          <Check className="size-3" />
        </span>
      ) : null}
      <Icon className="size-5 text-primary" />
      <span className="mt-3 block text-sm font-semibold">{option.label}</span>
      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
        {option.description}
      </span>
    </button>
  );
}

function SettingSwitch({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[8px] border border-border p-3">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <button
        aria-checked={checked}
        aria-label={label}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-primary" : "bg-slate-300",
        )}
        role="switch"
        type="button"
        onClick={() => onChange(!checked)}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition",
            checked ? "left-5.5" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

function DataMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Database;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-border bg-muted/35 p-3">
      <span className="grid size-9 place-items-center rounded-[8px] bg-info-soft text-info">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function MetricTile({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="min-w-24 rounded-[8px] border border-border bg-muted/60 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  );
}
