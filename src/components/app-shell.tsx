"use client";

import type { ReactNode } from "react";
import * as React from "react";
import Link from "next/link";
import {
  BarChart3,
  BriefcaseBusiness,
  FileText,
  KanbanSquare,
  ServerCog,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { BrandLogo } from "@/components/brand-logo";
import {
  defaultSettings,
  settingsChangedEvent,
  settingsStorageKey,
} from "@/lib/settings-data";
import { cn } from "@/lib/utils";
import type { JobPilotSettings } from "@/types/settings";

export type AppShellItemKey =
  | "dashboard"
  | "jobs"
  | "interviews"
  | "skills"
  | "portfolio"
  | "resume"
  | "settings"
  | "system";

type AppShellProps = {
  children: ReactNode;
  activeItem?: AppShellItemKey;
};

const navItems: {
  key: AppShellItemKey;
  label: string;
  href: string;
  icon: typeof BarChart3;
}[] = [
  { key: "dashboard", label: "仪表盘", href: "/", icon: BarChart3 },
  { key: "jobs", label: "岗位管理", href: "/jobs", icon: BriefcaseBusiness },
  {
    key: "interviews",
    label: "面试流程",
    href: "/interviews",
    icon: KanbanSquare,
  },
  { key: "skills", label: "技术栈分析", href: "/skills", icon: Sparkles },
  { key: "portfolio", label: "作品集", href: "/portfolio", icon: UserRound },
  { key: "resume", label: "简历生成器", href: "/resume", icon: FileText },
  { key: "settings", label: "设置", href: "/settings", icon: Settings },
  { key: "system", label: "账号与服务", href: "/system", icon: ServerCog },
];

export function AppShell({ children, activeItem = "dashboard" }: AppShellProps) {
  const [profile, setProfile] = React.useState(defaultSettings.profile);

  React.useEffect(() => {
    const loadProfile = () => {
      const stored = window.localStorage.getItem(settingsStorageKey);

      if (!stored) {
        setProfile(defaultSettings.profile);
        return;
      }

      try {
        const parsed = JSON.parse(stored) as JobPilotSettings;
        setProfile(parsed.profile);
      } catch {
        setProfile(defaultSettings.profile);
      }
    };

    const restoreTimer = window.setTimeout(loadProfile, 0);
    window.addEventListener(settingsChangedEvent, loadProfile);
    window.addEventListener("storage", loadProfile);

    return () => {
      window.clearTimeout(restoreTimer);
      window.removeEventListener(settingsChangedEvent, loadProfile);
      window.removeEventListener("storage", loadProfile);
    };
  }, []);

  return (
    <div className="app-shell-root min-h-screen bg-background p-4 text-foreground md:p-6">
      <div className="app-shell-layout mx-auto grid max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        <header className="rounded-[10px] border border-border bg-card p-4 shadow-[var(--shadow-soft)] lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <BrandLogo />
            <Avatar fallback={profile.name} />
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <ShellLink
                key={item.key}
                active={item.key === activeItem}
                compact
                href={item.href}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </nav>
        </header>

        <aside className="hidden rounded-[10px] border border-border bg-card p-4 shadow-[var(--shadow-soft)] lg:flex lg:min-h-[calc(100vh-48px)] lg:flex-col">
          <BrandLogo />
          <nav className="mt-8 space-y-1">
            {navItems.map((item) => (
              <ShellLink
                key={item.key}
                active={item.key === activeItem}
                href={item.href}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </nav>
          <div className="mt-auto flex items-center gap-3 border-t border-border pt-4">
            <Avatar fallback={profile.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{profile.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {profile.title}
              </p>
            </div>
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

function ShellLink({
  active,
  compact = false,
  href,
  icon: Icon,
  label,
}: {
  active: boolean;
  compact?: boolean;
  href: string;
  icon: typeof BarChart3;
  label: string;
}) {
  const className = cn(
    "flex h-9 shrink-0 items-center gap-3 rounded-[8px] px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
    compact && "min-w-fit",
    active && "bg-info-soft text-primary",
  );

  if (href === "#") {
    return (
      <span aria-current={active ? "page" : undefined} className={className}>
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </span>
    );
  }

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={className}
      href={href}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
