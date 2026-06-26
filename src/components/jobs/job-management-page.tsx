"use client";

import * as React from "react";
import {
  BriefcaseBusiness,
  Copy,
  Download,
  FilterX,
  Link2,
  Pencil,
  Plus,
  Search,
  Trash2,
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
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { initialJobs, jobChannels, jobLocations } from "@/lib/jobs-data";
import { jobStatusMeta, jobStatusOptions } from "@/lib/job-status";
import { downloadTextFile, escapeCsvCell } from "@/lib/download";
import { cn } from "@/lib/utils";
import type { Job, JobStatus } from "@/types/job";

type FilterValue = "all";

type JobFormState = {
  title: string;
  company: string;
  channel: string;
  location: string;
  salary: string;
  url: string;
  status: JobStatus;
  appliedAt: string;
  description: string;
  skillsText: string;
};

const pageSize = 8;

const createEmptyForm = (): JobFormState => ({
  title: "",
  company: "",
  channel: "",
  location: "",
  salary: "",
  url: "",
  status: "pending",
  appliedAt: new Date().toISOString().slice(0, 10),
  description: "",
  skillsText: "",
});

function toFormState(job: Job): JobFormState {
  return {
    title: job.title,
    company: job.company,
    channel: job.channel,
    location: job.location,
    salary: job.salary ?? "",
    url: job.url ?? "",
    status: job.status,
    appliedAt: job.appliedAt,
    description: job.description ?? "",
    skillsText: job.skills.join("、"),
  };
}

function parseSkills(value: string) {
  return value
    .split(/[,\n，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getFormError(form: JobFormState) {
  if (!form.title.trim()) {
    return "请填写职位名称";
  }

  if (!form.company.trim()) {
    return "请填写公司名称";
  }

  if (!form.channel.trim()) {
    return "请填写投递渠道";
  }

  if (!form.appliedAt.trim()) {
    return "请选择投递时间";
  }

  if (form.url.trim() && !/^https?:\/\/.+/i.test(form.url.trim())) {
    return "岗位链接需要以 http:// 或 https:// 开头";
  }

  if (form.description.length > 2000) {
    return "备注不能超过 2000 个字符";
  }

  return "";
}

function toJob(form: JobFormState, id?: string): Job {
  return {
    id: id ?? `job-${Date.now()}`,
    title: form.title.trim(),
    company: form.company.trim(),
    channel: form.channel.trim(),
    location: form.location.trim() || "远程",
    salary: form.salary.trim() || undefined,
    url: form.url.trim() || undefined,
    status: form.status,
    appliedAt: form.appliedAt,
    description: form.description.trim() || undefined,
    skills: parseSkills(form.skillsText),
  };
}

export function JobManagementPage() {
  const [jobs, setJobs] = React.useState<Job[]>(initialJobs);
  const [serverConnected, setServerConnected] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<JobStatus | FilterValue>(
    "all",
  );
  const [channelFilter, setChannelFilter] = React.useState<string | FilterValue>(
    "all",
  );
  const [locationFilter, setLocationFilter] = React.useState<string | FilterValue>(
    "all",
  );
  const [page, setPage] = React.useState(1);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingJob, setEditingJob] = React.useState<Job | null>(null);
  const [form, setForm] = React.useState<JobFormState>(createEmptyForm);
  const [formError, setFormError] = React.useState("");
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    const loadTimer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/jobs", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as {
          record: { jobs: Job[] } | null;
        };
        setServerConnected(true);

        if (result.record) {
          setJobs(result.record.jobs);
          setFeedback("已加载当前账号的岗位数据");
        } else {
          await fetch("/api/jobs", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobs: initialJobs }),
          });
          setFeedback("已为当前账号初始化岗位数据");
        }
      } catch {
        setFeedback("服务端暂不可用，当前使用页面演示数据");
      }
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  const persistJobs = async (nextJobs: Job[], message: string) => {
    setJobs(nextJobs);
    setFeedback(message);

    if (!serverConnected) {
      return;
    }

    try {
      const response = await fetch("/api/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: nextJobs }),
      });

      if (!response.ok) {
        setFeedback(`${message}，但服务端同步失败`);
      }
    } catch {
      setFeedback(`${message}，但服务端同步失败`);
    }
  };

  const filteredJobs = React.useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchKeyword =
        !keyword ||
        [
          job.title,
          job.company,
          job.channel,
          job.location,
          job.salary ?? "",
          job.skills.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const matchStatus =
        statusFilter === "all" || job.status === statusFilter;
      const matchChannel =
        channelFilter === "all" || job.channel === channelFilter;
      const matchLocation =
        locationFilter === "all" || job.location === locationFilter;

      return matchKeyword && matchStatus && matchChannel && matchLocation;
    });
  }, [channelFilter, jobs, locationFilter, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedJobs = filteredJobs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const activeJobs = jobs.filter((job) => job.status !== "rejected").length;
  const interviewJobs = jobs.filter((job) =>
    ["written_test", "first_interview", "second_interview", "hr_interview"].includes(
      job.status,
    ),
  ).length;
  const offerJobs = jobs.filter((job) => job.status === "offer").length;

  const updateFormField = <Key extends keyof JobFormState>(
    key: Key,
    value: JobFormState[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError("");
  };

  const openCreateModal = () => {
    setEditingJob(null);
    setForm(createEmptyForm());
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setForm(toFormState(job));
    setFormError("");
    setModalOpen(true);
  };

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setChannelFilter("all");
    setLocationFilter("all");
    setPage(1);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const error = getFormError(form);
    if (error) {
      setFormError(error);
      return;
    }

    const nextJob = toJob(form, editingJob?.id);
    const nextJobs = editingJob
      ? jobs.map((job) => (job.id === editingJob.id ? nextJob : job))
      : [nextJob, ...jobs];
    void persistJobs(
      nextJobs,
      editingJob
        ? `已更新 ${nextJob.company} 的岗位记录`
        : `已新增 ${nextJob.company} 的岗位记录`,
    );
    if (!editingJob) {
      setPage(1);
    }
    setModalOpen(false);
  };

  const handleDelete = (job: Job) => {
    void persistJobs(
      jobs.filter((item) => item.id !== job.id),
      `已删除 ${job.company} 的岗位记录`,
    );
  };

  const handleCopyUrl = async (job: Job) => {
    if (!job.url) {
      setFeedback(`${job.company} 暂无岗位链接`);
      return;
    }

    try {
      await navigator.clipboard?.writeText(job.url);
      setFeedback(`已复制 ${job.company} 的岗位链接`);
    } catch {
      setFeedback(`岗位链接：${job.url}`);
    }
  };

  const handleExport = () => {
    const headers = [
      "职位",
      "公司",
      "渠道",
      "地点",
      "薪资",
      "状态",
      "投递时间",
      "链接",
      "技能",
      "岗位描述",
    ];
    const rows = filteredJobs.map((job) => [
      job.title,
      job.company,
      job.channel,
      job.location,
      job.salary,
      jobStatusMeta[job.status].label,
      job.appliedAt,
      job.url,
      job.skills.join("、"),
      job.description,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvCell).join(","))
      .join("\r\n");
    const date = new Date().toISOString().slice(0, 10);

    downloadTextFile(
      `jobpilot-jobs-${date}.csv`,
      `\uFEFF${csv}`,
      "text/csv;charset=utf-8",
    );
    setFeedback(`已导出 ${filteredJobs.length} 条岗位数据`);
  };

  return (
    <AppShell activeItem="jobs">
      <div className="space-y-4">
        <header className="rounded-[10px] border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <Badge tone="blue">岗位管理</Badge>
              <h1 className="mt-3 text-2xl font-semibold tracking-normal">
                求职岗位追踪
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                集中维护投递岗位、面试阶段、渠道来源和岗位链接，让每一次跟进都有记录。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
              <StatusMiniCard label="有效岗位" value={activeJobs} />
              <StatusMiniCard label="面试中" value={interviewJobs} />
              <StatusMiniCard label="Offer" value={offerJobs} />
            </div>
          </div>
        </header>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BriefcaseBusiness className="size-4 text-primary" />
                  岗位列表
                  <Badge tone={serverConnected ? "green" : "gray"}>
                    {serverConnected ? "账号数据" : "演示数据"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  当前共 {jobs.length} 条岗位记录，筛选结果 {filteredJobs.length} 条。
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={handleExport}>
                  <Download />
                  导出
                </Button>
                <Button type="button" onClick={openCreateModal}>
                  <Plus />
                  新增岗位
                </Button>
              </div>
            </div>
            {feedback ? (
              <div className="mt-4 rounded-[8px] border border-blue-100 bg-info-soft px-3 py-2 text-sm text-info">
                {feedback}
              </div>
            ) : null}
          </CardHeader>

          <CardContent className="space-y-4 p-5">
            <div className="grid gap-3 xl:grid-cols-[1.4fr_160px_160px_160px_auto]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  aria-label="搜索岗位"
                  className="pl-9"
                  placeholder="搜索职位、公司、技能或渠道"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Select
                aria-label="状态筛选"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as JobStatus | FilterValue);
                  setPage(1);
                }}
              >
                <option value="all">全部状态</option>
                {jobStatusOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
              <Select
                aria-label="渠道筛选"
                value={channelFilter}
                onChange={(event) => {
                  setChannelFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">全部渠道</option>
                {jobChannels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </Select>
              <Select
                aria-label="地点筛选"
                value={locationFilter}
                onChange={(event) => {
                  setLocationFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">全部地点</option>
                {jobLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </Select>
              <Button type="button" variant="outline" onClick={resetFilters}>
                <FilterX />
                重置
              </Button>
            </div>

            <div className="space-y-3 md:hidden">
              {pagedJobs.length ? (
                pagedJobs.map((job) => {
                  const statusMeta = jobStatusMeta[job.status];

                  return (
                    <article
                      key={job.id}
                      className="rounded-[8px] border border-border bg-card p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold">
                            {job.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {job.company} · {job.location}
                          </p>
                        </div>
                        <DropdownMenu label={`${job.company} 操作`}>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => openEditModal(job)}
                          >
                            <Pencil className="size-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => handleCopyUrl(job)}
                          >
                            <Copy className="size-4" />
                            复制链接
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-danger hover:bg-danger-soft"
                            onClick={() => handleDelete(job)}
                          >
                            <Trash2 className="size-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenu>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {job.channel}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {job.appliedAt}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {job.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </article>
                  );
                })
              ) : (
                <EmptyState
                  title="没有匹配的岗位"
                  description="调整搜索关键词或筛选条件后再查看。"
                />
              )}
            </div>

            <div className="hidden overflow-hidden rounded-[8px] border border-border md:block">
              <Table className="min-w-[920px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>职位</TableHead>
                    <TableHead>公司</TableHead>
                    <TableHead>投递渠道</TableHead>
                    <TableHead>地点</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>投递时间</TableHead>
                    <TableHead className="w-16 text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedJobs.length ? (
                    pagedJobs.map((job) => {
                      const statusMeta = jobStatusMeta[job.status];

                      return (
                        <TableRow key={job.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">
                              {job.title}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {job.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {job.company}
                          </TableCell>
                          <TableCell>{job.channel}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>
                            <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {job.appliedAt}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu label={`${job.company} 操作`}>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => openEditModal(job)}
                              >
                                <Pencil className="size-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleCopyUrl(job)}
                              >
                                <Copy className="size-4" />
                                复制链接
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-danger hover:bg-danger-soft"
                                onClick={() => handleDelete(job)}
                              >
                                <Trash2 className="size-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <EmptyState
                          title="没有匹配的岗位"
                          description="调整搜索关键词或筛选条件后再查看。"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                第 {currentPage} / {totalPages} 页，共 {filteredJobs.length} 条
              </p>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        description="维护岗位名称、公司、投递渠道、当前状态和后续跟进备注。"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              取消
            </Button>
            <Button form="job-form" type="submit">
              {editingJob ? "保存修改" : "保存岗位"}
            </Button>
          </>
        }
        open={modalOpen}
        title={editingJob ? "编辑岗位" : "新增岗位"}
        onOpenChange={setModalOpen}
      >
        <form className="space-y-4" id="job-form" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="职位名称" required>
              <Input
                value={form.title}
                onChange={(event) => updateFormField("title", event.target.value)}
              />
            </FormField>
            <FormField label="公司名称" required>
              <Input
                value={form.company}
                onChange={(event) =>
                  updateFormField("company", event.target.value)
                }
              />
            </FormField>
            <FormField label="投递渠道" required>
              <Input
                placeholder="Boss直聘 / 内推 / 官网"
                value={form.channel}
                onChange={(event) =>
                  updateFormField("channel", event.target.value)
                }
              />
            </FormField>
            <FormField label="工作地点">
              <Input
                placeholder="北京 / 上海 / 远程"
                value={form.location}
                onChange={(event) =>
                  updateFormField("location", event.target.value)
                }
              />
            </FormField>
            <FormField label="薪资范围">
              <Input
                placeholder="20k-35k"
                value={form.salary}
                onChange={(event) => updateFormField("salary", event.target.value)}
              />
            </FormField>
            <FormField label="当前状态" required>
              <Select
                value={form.status}
                onChange={(event) =>
                  updateFormField("status", event.target.value as JobStatus)
                }
              >
                {jobStatusOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="投递时间" required>
              <Input
                type="date"
                value={form.appliedAt}
                onChange={(event) =>
                  updateFormField("appliedAt", event.target.value)
                }
              />
            </FormField>
            <FormField label="岗位链接">
              <div className="relative">
                <Link2
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  className="pl-9"
                  placeholder="https://..."
                  value={form.url}
                  onChange={(event) => updateFormField("url", event.target.value)}
                />
              </div>
            </FormField>
          </div>

          <FormField label="技术关键词">
            <Input
              placeholder="React、TypeScript、Next.js"
              value={form.skillsText}
              onChange={(event) =>
                updateFormField("skillsText", event.target.value)
              }
            />
          </FormField>

          <FormField label="岗位备注">
            <Textarea
              maxLength={2000}
              placeholder="记录岗位要求、面试反馈或下一步动作"
              value={form.description}
              onChange={(event) =>
                updateFormField("description", event.target.value)
              }
            />
            <div className="mt-1 text-right text-xs text-muted-foreground">
              {form.description.length}/2000
            </div>
          </FormField>

          {formError ? (
            <p className="rounded-[8px] bg-danger-soft px-3 py-2 text-sm text-danger">
              {formError}
            </p>
          ) : null}
        </form>
      </Modal>
    </AppShell>
  );
}

function StatusMiniCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-[8px] border border-border bg-muted/60 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}
