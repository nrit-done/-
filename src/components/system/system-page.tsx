"use client";

import * as React from "react";
import {
  CheckCircle2,
  Database,
  KeyRound,
  LogIn,
  LogOut,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  UserRound,
  UserPlus,
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
import type { HealthResponse, SessionUser } from "@/types/backend";

export function SystemPage() {
  const [health, setHealth] = React.useState<HealthResponse | null>(null);
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [email, setEmail] = React.useState("demo@jobpilot.local");
  const [password, setPassword] = React.useState("jobpilot123");
  const [name, setName] = React.useState("");
  const [authMode, setAuthMode] = React.useState<"login" | "register">("login");
  const [loading, setLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState("");

  const refreshStatus = React.useCallback(async () => {
    setLoading(true);

    try {
      const [healthResponse, sessionResponse] = await Promise.all([
        fetch("/api/health", { cache: "no-store" }),
        fetch("/api/auth/session", { cache: "no-store" }),
      ]);
      const healthData = (await healthResponse.json()) as HealthResponse;
      const sessionData = (await sessionResponse.json()) as {
        user: SessionUser | null;
      };
      setHealth(healthData);
      setUser(sessionData.user);
    } catch {
      setFeedback("无法连接 JobPilot 服务端，请确认本地服务正在运行。");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const refreshTimer = window.setTimeout(() => {
      void refreshStatus();
    }, 0);

    return () => window.clearTimeout(refreshTimer);
  }, [refreshStatus]);

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFeedback("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as {
        message?: string;
        user?: SessionUser;
      };

      if (!response.ok || !result.user) {
        setFeedback(result.message ?? "登录失败。");
        return;
      }

      setUser(result.user);
      setFeedback(`已登录 ${result.user.email}`);
    } catch {
      setFeedback("登录请求失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
    setFeedback("已退出账号。");
    setLoading(false);
  };

  const register = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFeedback("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = (await response.json()) as {
        message?: string;
        user?: SessionUser;
      };

      if (!response.ok || !result.user) {
        setFeedback(result.message ?? "注册失败。");
        return;
      }

      setUser(result.user);
      setFeedback(`账号创建成功，已登录 ${result.user.email}`);
    } catch {
      setFeedback("注册请求失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell activeItem="system">
      <div className="space-y-4">
        <header className="rounded-[10px] border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <Badge tone="blue">服务端</Badge>
              <h1 className="mt-3 text-2xl font-semibold tracking-normal">
                账号与服务状态
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                验证 API、文件数据库和登录会话，登录后可在设置页进行服务端同步。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MetricTile
                label="API"
                value={health?.status === "ok" ? "在线" : "检查中"}
              />
              <MetricTile
                label="数据库"
                value={health?.database.writable ? "可写" : "未知"}
              />
              <MetricTile label="会话" value={user ? "已登录" : "未登录"} />
              <MetricTile label="驱动" value="JSON 文件" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
            <Button
              loading={loading}
              type="button"
              variant="outline"
              onClick={() => void refreshStatus()}
            >
              <RefreshCw />
              刷新状态
            </Button>
            {user ? (
              <Button type="button" variant="outline" onClick={logout}>
                <LogOut />
                退出登录
              </Button>
            ) : null}
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

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-4 text-primary" />
                {user
                  ? "当前账号"
                  : authMode === "login"
                    ? "账号登录"
                    : "创建账号"}
              </CardTitle>
              <CardDescription>
                使用 HttpOnly 签名 Cookie 保存会话，密码不会写入浏览器存储。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-4">
                  <div className="rounded-[8px] border border-green-100 bg-success-soft p-4">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="size-5" />
                      <span className="font-semibold">登录会话有效</span>
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <InfoItem label="姓名" value={user.name} />
                      <InfoItem label="邮箱" value={user.email} />
                      <InfoItem label="用户 ID" value={user.id} />
                      <InfoItem label="有效期" value="7 天" />
                    </dl>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    现在可以进入设置页，将个人配置保存到服务端文件数据库。
                  </p>
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={authMode === "login" ? login : register}
                >
                  <div className="grid grid-cols-2 gap-2 rounded-[8px] bg-muted p-1">
                    <button
                      aria-pressed={authMode === "login"}
                      className={`h-8 rounded-[6px] text-sm font-medium ${
                        authMode === "login"
                          ? "bg-card text-primary shadow-sm"
                          : "text-muted-foreground"
                      }`}
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        setEmail("demo@jobpilot.local");
                        setPassword("jobpilot123");
                        setFeedback("");
                      }}
                    >
                      登录
                    </button>
                    <button
                      aria-pressed={authMode === "register"}
                      className={`h-8 rounded-[6px] text-sm font-medium ${
                        authMode === "register"
                          ? "bg-card text-primary shadow-sm"
                          : "text-muted-foreground"
                      }`}
                      type="button"
                      onClick={() => {
                        setAuthMode("register");
                        setEmail("");
                        setPassword("");
                        setFeedback("");
                      }}
                    >
                      注册
                    </button>
                  </div>
                  {authMode === "register" ? (
                    <Field label="姓名">
                      <Input
                        aria-label="注册姓名"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                      />
                    </Field>
                  ) : null}
                  <Field label="邮箱">
                    <Input
                      aria-label={authMode === "login" ? "登录邮箱" : "注册邮箱"}
                      autoComplete="username"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </Field>
                  <Field label="密码">
                    <Input
                      aria-label={authMode === "login" ? "登录密码" : "注册密码"}
                      autoComplete={
                        authMode === "login"
                          ? "current-password"
                          : "new-password"
                      }
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </Field>
                  <Button className="w-full" loading={loading} type="submit">
                    {authMode === "login" ? <LogIn /> : <UserPlus />}
                    {authMode === "login" ? "登录演示账号" : "创建并登录"}
                  </Button>
                  {authMode === "login" ? (
                    <div className="rounded-[8px] border border-border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                      演示邮箱：demo@jobpilot.local
                      <br />
                      演示密码：jobpilot123
                    </div>
                  ) : (
                    <p className="text-xs leading-5 text-muted-foreground">
                      密码至少 8 位。注册后自动登录，并创建独立的数据空间。
                    </p>
                  )}
                </form>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatusCard
              description="Route Handlers 提供健康检查、登录会话和设置同步接口。"
              icon={ServerCog}
              status={health?.status === "ok" ? "运行正常" : "等待检查"}
              title="Next.js API"
            />
            <StatusCard
              description="数据写入 .jobpilot/jobpilot-db.json，Docker 可挂载数据卷。"
              icon={Database}
              status={health?.database.writable ? "读写正常" : "等待检查"}
              title="文件数据库"
            />
            <StatusCard
              description="会话签名防止篡改，Cookie 使用 HttpOnly 与 SameSite。"
              icon={ShieldCheck}
              status={user ? "会话有效" : "等待登录"}
              title="认证会话"
            />
            <StatusCard
              description="生产环境通过环境变量设置会话密钥和持久化目录。"
              icon={KeyRound}
              status="配置就绪"
              title="部署配置"
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatusCard({
  description,
  icon: Icon,
  status,
  title,
}: {
  description: string;
  icon: typeof ServerCog;
  status: string;
  title: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <span className="grid size-10 place-items-center rounded-[8px] bg-info-soft text-info">
          <Icon className="size-5" />
        </span>
        <h2 className="mt-4 font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <Badge className="mt-4" tone="green">
          {status}
        </Badge>
      </CardContent>
    </Card>
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
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
