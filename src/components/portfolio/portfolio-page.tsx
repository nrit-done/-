"use client";

import * as React from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  Globe2,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  GitBranch,
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
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import {
  portfolioProfile,
  portfolioProjects,
  skillEvidence,
} from "@/lib/portfolio-data";
import type {
  PortfolioProjectDetail,
  PortfolioProjectStatus,
} from "@/types/portfolio";

type FilterValue = "all";

const statusMeta: Record<
  PortfolioProjectStatus,
  {
    label: string;
    tone: "blue" | "green" | "orange";
  }
> = {
  online: { label: "已上线", tone: "green" },
  building: { label: "建设中", tone: "orange" },
  "case-study": { label: "案例复盘", tone: "blue" },
};

const projectCategories = Array.from(
  new Set(portfolioProjects.map((project) => project.category)),
);

export function PortfolioPage() {
  const [query, setQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string | FilterValue>(
    "all",
  );
  const [statusFilter, setStatusFilter] = React.useState<
    PortfolioProjectStatus | FilterValue
  >("all");
  const [selectedProject, setSelectedProject] =
    React.useState<PortfolioProjectDetail | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [feedback, setFeedback] = React.useState("");

  const filteredProjects = React.useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const hasNameMatch =
      Boolean(keyword) &&
      portfolioProjects.some((project) =>
        project.name.toLowerCase().includes(keyword),
      );

    return portfolioProjects.filter((project) => {
      const matchKeyword =
        !keyword ||
        (hasNameMatch
          ? project.name.toLowerCase().includes(keyword)
          : [
              project.name,
              project.summary,
              project.category,
              project.techStack.join(" "),
              project.highlights.join(" "),
            ]
              .join(" ")
              .toLowerCase()
              .includes(keyword));
      const matchCategory =
        categoryFilter === "all" || project.category === categoryFilter;
      const matchStatus =
        statusFilter === "all" || project.status === statusFilter;

      return matchKeyword && matchCategory && matchStatus;
    });
  }, [categoryFilter, query, statusFilter]);

  const openProjectDetail = (project: PortfolioProjectDetail) => {
    setSelectedProject(project);
    setDetailOpen(true);
  };

  const resetFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setFeedback("");
  };

  return (
    <AppShell activeItem="portfolio">
      <div className="space-y-4">
        <header className="rounded-[10px] border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div>
              <Badge tone="blue">作品集</Badge>
              <div className="mt-4 flex items-start gap-4">
                <div className="grid size-16 shrink-0 place-items-center rounded-[10px] bg-info-soft text-primary">
                  <UserRound className="size-8" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold tracking-normal">
                    {portfolioProfile.name}
                  </h1>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    {portfolioProfile.title}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {portfolioProfile.summary}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {portfolioProfile.focus.map((item) => (
                  <Badge key={item} tone="blue">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {portfolioProfile.stats.map((stat) => (
                  <MetricTile
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                  />
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <ContactButton icon={Mail} label="邮箱" value={portfolioProfile.email} />
                <ContactButton
                  icon={GitBranch}
                  label="GitHub"
                  value={portfolioProfile.github}
                />
                <ContactButton
                  icon={Globe2}
                  label="主页"
                  value={portfolioProfile.website}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4" aria-hidden="true" />
                {portfolioProfile.location}
              </div>
            </div>
          </div>
        </header>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BriefcaseBusiness className="size-4 text-primary" />
                  精选项目
                </CardTitle>
                <CardDescription>
                  当前展示 {filteredProjects.length} 个项目，用项目证明技能和业务理解。
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFeedback("已复制作品集主页链接，可用于投递简历")}
              >
                <ExternalLink />
                分享主页
              </Button>
            </div>
            {feedback ? (
              <div className="mt-4 rounded-[8px] border border-blue-100 bg-info-soft px-3 py-2 text-sm text-info">
                {feedback}
              </div>
            ) : null}
          </CardHeader>

          <CardContent className="space-y-4 p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_160px_auto]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  aria-label="搜索项目"
                  className="pl-9"
                  placeholder="搜索项目、技术栈或亮点"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <Select
                aria-label="项目分类"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">全部分类</option>
                {projectCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
              <Select
                aria-label="项目状态"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as PortfolioProjectStatus | FilterValue,
                  )
                }
              >
                <option value="all">全部状态</option>
                {Object.entries(statusMeta).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </Select>
              <Button type="button" variant="outline" onClick={resetFilters}>
                重置
              </Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() => openProjectDetail(project)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                技能证据
              </CardTitle>
              <CardDescription>
                用项目中的可验证事实支撑技能标签，让简历描述更可信。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {skillEvidence.map((item) => (
                <SkillEvidenceCard key={item.id} item={item} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                面试展示脚本
              </CardTitle>
              <CardDescription>
                面试中可以按问题、方案、结果和反思的顺序讲项目。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  title: "1. 项目背景",
                  text: "求职数据分散，岗位、面试、技能和作品集没有统一闭环。",
                },
                {
                  title: "2. 技术决策",
                  text: "使用 Next.js、TypeScript、Tailwind 和 Recharts，先完成可演示业务流。",
                },
                {
                  title: "3. 工程质量",
                  text: "每阶段都跑类型检查、规范检查、生产构建和浏览器截图验证。",
                },
                {
                  title: "4. 后续扩展",
                  text: "继续扩展权限角色、云数据库、运行监控和更多 E2E 场景。",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[8px] border border-border bg-muted/35 p-4"
                >
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>

      <ProjectDetailModal
        open={detailOpen}
        project={selectedProject}
        onClose={() => setDetailOpen(false)}
        onCopy={() => {
          if (selectedProject) {
            setFeedback(`已复制 ${selectedProject.name} 的项目链接`);
          }
          setDetailOpen(false);
        }}
      />
    </AppShell>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: PortfolioProjectDetail;
  onOpen: () => void;
}) {
  const meta = statusMeta[project.status];

  return (
    <article className="rounded-[8px] border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{project.name}</h2>
            <Badge tone={meta.tone}>{meta.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{project.role}</p>
        </div>
        <Badge tone="gray">{project.category}</Badge>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {project.summary}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {project.impact.map((item) => (
          <div
            key={item.label}
            className="rounded-[8px] border border-border bg-muted/40 p-2"
          >
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-sm font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        <Button type="button" onClick={onOpen}>
          查看详情
          <ArrowUpRight />
        </Button>
        <Button type="button" variant="outline" onClick={onOpen}>
          <GitBranch />
          GitHub
        </Button>
        <Button type="button" variant="outline" onClick={onOpen}>
          <ExternalLink />
          Demo
        </Button>
      </div>
    </article>
  );
}

function ProjectDetailModal({
  open,
  project,
  onClose,
  onCopy,
}: {
  open: boolean;
  project: PortfolioProjectDetail | null;
  onClose: () => void;
  onCopy: () => void;
}) {
  if (!project) {
    return null;
  }

  const meta = statusMeta[project.status];

  return (
    <Modal
      className="max-w-5xl"
      description={`${project.category} · ${project.updatedAt}`}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            关闭
          </Button>
          <Button type="button" variant="outline" onClick={onCopy}>
            <GitBranch />
            复制 GitHub
          </Button>
          <Button type="button" onClick={onCopy}>
            <ExternalLink />
            复制 Demo
          </Button>
        </>
      }
      open={open}
      title={project.name}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            <Badge tone="gray">{project.role}</Badge>
          </div>

          <section className="rounded-[8px] border border-border bg-muted/35 p-4">
            <h3 className="text-sm font-semibold">问题</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {project.problem}
            </p>
            <h3 className="mt-4 text-sm font-semibold">方案</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {project.solution}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold">项目亮点</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {project.highlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-4">
          <section className="grid grid-cols-3 gap-2">
            {project.impact.map((item) => (
              <MetricTile key={item.label} label={item.label} value={item.value} />
            ))}
          </section>

          <section>
            <h3 className="text-sm font-semibold">技术栈</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <Badge key={tech} tone="blue">
                  {tech}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold">证据</h3>
            <div className="mt-3 space-y-3">
              {project.evidence.map((item) => (
                <div
                  key={item}
                  className="rounded-[8px] border border-border bg-card p-3 text-sm text-muted-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Modal>
  );
}

function SkillEvidenceCard({ item }: { item: (typeof skillEvidence)[number] }) {
  return (
    <article className="rounded-[8px] border border-border bg-card p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Code2 className="size-4 text-primary" aria-hidden="true" />
            <h3 className="font-semibold">{item.skill}</h3>
            <Badge tone="green">{item.level}</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {item.projects.map((project) => (
            <Badge key={project} tone="blue">
              {project}
            </Badge>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.proofPoints.map((point) => (
          <span
            key={point}
            className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
          >
            {point}
          </span>
        ))}
      </div>
    </article>
  );
}

function ContactButton({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <button
      className="flex min-w-0 items-center gap-2 rounded-[8px] border border-border bg-card px-3 py-2 text-left transition hover:bg-muted"
      title={value}
      type="button"
    >
      <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="truncate text-sm">{label}</span>
    </button>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-border bg-muted/60 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
