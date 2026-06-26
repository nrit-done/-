"use client";

import * as React from "react";
import {
  ArrowUpRight,
  BookOpenCheck,
  BrainCircuit,
  ClipboardCheck,
  FilterX,
  Search,
  Sparkles,
  Target,
  TrendingUp,
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
  projectMatches,
  skillCategories,
  skillRequirements,
  targetRoles,
} from "@/lib/skill-analysis-data";
import { cn } from "@/lib/utils";
import type {
  SkillCategory,
  SkillRequirement,
  TargetRole,
} from "@/types/skill-analysis";

type FilterValue = "all";

const categoryMeta = Object.fromEntries(
  skillCategories.map((category) => [category.id, category]),
) as Record<SkillCategory, (typeof skillCategories)[number]>;

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getFitScore(skills: SkillRequirement[]) {
  if (!skills.length) {
    return 0;
  }

  const score =
    skills.reduce((sum, skill) => {
      const fit = Math.min(skill.current, skill.target) / skill.target;
      return sum + fit;
    }, 0) / skills.length;

  return Math.round(score * 100);
}

function getGap(skill: SkillRequirement) {
  return Math.max(0, skill.target - skill.current);
}

function getGapTone(gap: number) {
  if (gap >= 20) {
    return "red" as const;
  }

  if (gap >= 10) {
    return "orange" as const;
  }

  return "green" as const;
}

function getRoleSkills(role: TargetRole) {
  const keywords = role.keywords.map((keyword) => keyword.toLowerCase());

  return skillRequirements.filter((skill) =>
    keywords.some((keyword) => skill.name.toLowerCase().includes(keyword)),
  );
}

export function SkillAnalysisPage() {
  const [query, setQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<
    SkillCategory | FilterValue
  >("all");
  const [selectedRoleId, setSelectedRoleId] = React.useState(targetRoles[0].id);
  const [gapOnly, setGapOnly] = React.useState(false);
  const [selectedSkill, setSelectedSkill] =
    React.useState<SkillRequirement | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [feedback, setFeedback] = React.useState("");

  const selectedRole =
    targetRoles.find((role) => role.id === selectedRoleId) ?? targetRoles[0];

  const filteredSkills = React.useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return skillRequirements.filter((skill) => {
      const matchKeyword =
        !keyword ||
        [
          skill.name,
          categoryMeta[skill.category].label,
          skill.relatedJobs.join(" "),
          skill.matchedProjects.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      const matchCategory =
        categoryFilter === "all" || skill.category === categoryFilter;
      const matchGap = !gapOnly || getGap(skill) >= 10;

      return matchKeyword && matchCategory && matchGap;
    });
  }, [categoryFilter, gapOnly, query]);

  const roleSkills = getRoleSkills(selectedRole);
  const fitScore = getFitScore(skillRequirements);
  const roleFitScore = getFitScore(roleSkills.length ? roleSkills : skillRequirements);
  const strongCount = skillRequirements.filter(
    (skill) => skill.current >= skill.target || skill.current >= 80,
  ).length;
  const gapCount = skillRequirements.filter((skill) => getGap(skill) >= 15).length;
  const highDemandCount = skillRequirements.filter((skill) => skill.demand >= 75).length;

  const categoryStats = skillCategories.map((category) => {
    const skills = skillRequirements.filter((skill) => skill.category === category.id);

    return {
      ...category,
      demand: average(skills.map((skill) => skill.demand)),
      current: average(skills.map((skill) => skill.current)),
      gapCount: skills.filter((skill) => getGap(skill) >= 10).length,
    };
  });

  const priorityGaps = [...skillRequirements]
    .sort((left, right) => {
      const leftScore = getGap(left) * 2 + left.demand;
      const rightScore = getGap(right) * 2 + right.demand;
      return rightScore - leftScore;
    })
    .slice(0, 4);

  const resetFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setGapOnly(false);
  };

  const openSkillDetail = (skill: SkillRequirement) => {
    setSelectedSkill(skill);
    setDetailOpen(true);
  };

  return (
    <AppShell activeItem="skills">
      <div className="space-y-4">
        <header className="rounded-[10px] border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <Badge tone="blue">技术栈分析</Badge>
              <h1 className="mt-3 text-2xl font-semibold tracking-normal">
                岗位技能匹配分析
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                将目标岗位要求、个人能力证据和作品集项目放在同一张分析面板里，明确短板和下一步优化动作。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MetricTile label="综合匹配" value={`${fitScore}%`} />
              <MetricTile label="目标岗位" value={`${roleFitScore}%`} />
              <MetricTile label="强项技能" value={strongCount} />
              <MetricTile label="关键缺口" value={gapCount} />
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-4 text-primary" />
                目标岗位画像
              </CardTitle>
              <CardDescription>
                选择目标岗位后，系统会突出当前最相关的技能表达重点。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                aria-label="目标岗位"
                value={selectedRoleId}
                onChange={(event) => setSelectedRoleId(event.target.value)}
              >
                {targetRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </Select>
              <div className="rounded-[8px] border border-border bg-muted/45 p-4">
                <h2 className="text-sm font-semibold">{selectedRole.label}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {selectedRole.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedRole.keywords.map((keyword) => (
                    <Badge key={keyword} tone="blue">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {categoryStats.map((category) => (
                  <CategoryScoreCard key={category.id} category={category} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                缺口优先级
              </CardTitle>
              <CardDescription>
                按岗位需求强度和当前差距综合排序，优先补最影响面试表达的能力。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {priorityGaps.map((skill, index) => (
                <button
                  key={skill.id}
                  className="w-full rounded-[8px] border border-border bg-card p-3 text-left transition hover:border-[#c9d4e5] hover:bg-muted/45"
                  type="button"
                  onClick={() => openSkillDetail(skill)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="grid size-6 place-items-center rounded bg-info-soft text-xs font-semibold text-info">
                          {index + 1}
                        </span>
                        <span className="font-semibold">{skill.name}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {skill.recommendation}
                      </p>
                    </div>
                    <Badge tone={getGapTone(getGap(skill))}>
                      差距 {getGap(skill)}
                    </Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </section>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="size-4 text-primary" />
                  技能匹配矩阵
                </CardTitle>
                <CardDescription>
                  当前展示 {filteredSkills.length} 项技能，高需求技能 {highDemandCount} 项。
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setGapOnly(true);
                  setFeedback("已切换为关键缺口视图");
                }}
              >
                <ClipboardCheck />
                只看缺口
              </Button>
            </div>
            {feedback ? (
              <div className="mt-4 rounded-[8px] border border-blue-100 bg-info-soft px-3 py-2 text-sm text-info">
                {feedback}
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_190px_auto_auto]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  aria-label="搜索技能"
                  className="pl-9"
                  placeholder="搜索技能、岗位、项目或分类"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <Select
                aria-label="技能分类"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value as SkillCategory | FilterValue)
                }
              >
                <option value="all">全部分类</option>
                {skillCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                variant={gapOnly ? "default" : "outline"}
                onClick={() => setGapOnly((current) => !current)}
              >
                关键缺口
              </Button>
              <Button type="button" variant="outline" onClick={resetFilters}>
                <FilterX />
                重置
              </Button>
            </div>

            <div className="grid gap-3">
              {filteredSkills.map((skill) => (
                <SkillRequirementRow
                  key={skill.id}
                  roleFocused={selectedRole.keywords.some((keyword) =>
                    skill.name.toLowerCase().includes(keyword.toLowerCase()),
                  )}
                  skill={skill}
                  onOpen={() => openSkillDetail(skill)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                作品集匹配建议
              </CardTitle>
              <CardDescription>
                用作品集证明技能，而不是只在简历里罗列关键词。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {projectMatches.map((project) => (
                <ProjectMatchCard key={project.id} project={project} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenCheck className="size-4 text-primary" />
                下一步学习计划
              </CardTitle>
              <CardDescription>
                以 2 周为周期补关键短板，所有动作都能回填到作品集中。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {priorityGaps.slice(0, 3).map((skill, index) => (
                <div
                  key={skill.id}
                  className="rounded-[8px] border border-border bg-muted/35 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        第 {index + 1} 周重点：{skill.name}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {skill.learningPlan[0]}
                      </p>
                    </div>
                    <Badge tone={getGapTone(getGap(skill))}>
                      差距 {getGap(skill)}
                    </Badge>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {skill.learningPlan.slice(1).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>

      <SkillDetailModal
        open={detailOpen}
        skill={selectedSkill}
        onClose={() => setDetailOpen(false)}
        onPlan={() => {
          if (selectedSkill) {
            setFeedback(`已将 ${selectedSkill.name} 加入本周学习计划`);
          }
          setDetailOpen(false);
        }}
      />
    </AppShell>
  );
}

function SkillRequirementRow({
  roleFocused,
  skill,
  onOpen,
}: {
  roleFocused: boolean;
  skill: SkillRequirement;
  onOpen: () => void;
}) {
  const gap = getGap(skill);

  return (
    <article
      className={cn(
        "rounded-[8px] border border-border bg-card p-4",
        roleFocused && "border-blue-200 bg-info-soft/35",
      )}
    >
      <div className="grid gap-4 xl:grid-cols-[220px_1fr_auto] xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{skill.name}</h3>
            <Badge tone="gray">{categoryMeta[skill.category].label}</Badge>
            {roleFocused ? <Badge tone="blue">目标相关</Badge> : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {skill.recommendation}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <ProgressMetric label="岗位需求" value={skill.demand} tone="blue" />
          <ProgressMetric label="当前水平" value={skill.current} tone="green" />
          <ProgressMetric
            label="目标差距"
            value={gap}
            max={40}
            tone={gap >= 20 ? "red" : gap >= 10 ? "orange" : "green"}
          />
        </div>

        <Button type="button" variant="outline" onClick={onOpen}>
          查看详情
          <ArrowUpRight />
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {skill.relatedJobs.slice(0, 4).map((job) => (
          <span
            key={job}
            className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
          >
            {job}
          </span>
        ))}
      </div>
    </article>
  );
}

function ProgressMetric({
  label,
  max = 100,
  tone,
  value,
}: {
  label: string;
  max?: number;
  tone: "blue" | "green" | "orange" | "red";
  value: number;
}) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  const color =
    tone === "blue"
      ? "bg-primary"
      : tone === "green"
        ? "bg-success"
        : tone === "orange"
          ? "bg-warning"
          : "bg-danger";

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-muted">
        <div
          className={cn("h-2 rounded-full", color)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function CategoryScoreCard({
  category,
}: {
  category: (typeof skillCategories)[number] & {
    demand: number;
    current: number;
    gapCount: number;
  };
}) {
  return (
    <div className="rounded-[8px] border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{category.label}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {category.description}
          </p>
        </div>
        <Badge tone={category.gapCount ? "orange" : "green"}>
          {category.gapCount ? `${category.gapCount} 个缺口` : "稳定"}
        </Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <ProgressMetric label="需求" value={category.demand} tone="blue" />
        <ProgressMetric label="水平" value={category.current} tone="green" />
      </div>
    </div>
  );
}

function ProjectMatchCard({
  project,
}: {
  project: (typeof projectMatches)[number];
}) {
  return (
    <article className="rounded-[8px] border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{project.name}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {project.description}
          </p>
        </div>
        <Badge tone={project.score >= 85 ? "green" : "blue"}>{project.score}%</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.skills.map((skill) => (
          <span
            key={skill}
            className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
          >
            {skill}
          </span>
        ))}
      </div>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {project.nextImprovements.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function SkillDetailModal({
  open,
  skill,
  onClose,
  onPlan,
}: {
  open: boolean;
  skill: SkillRequirement | null;
  onClose: () => void;
  onPlan: () => void;
}) {
  if (!skill) {
    return null;
  }

  const gap = getGap(skill);

  return (
    <Modal
      className="max-w-4xl"
      description={`${categoryMeta[skill.category].label} · 需求 ${skill.demand}`}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            关闭
          </Button>
          <Button type="button" onClick={onPlan}>
            加入学习计划
          </Button>
        </>
      }
      open={open}
      title={`${skill.name} 技能详情`}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-3 rounded-[8px] border border-border bg-muted/35 p-4 sm:grid-cols-3">
            <ProgressMetric label="岗位需求" value={skill.demand} tone="blue" />
            <ProgressMetric label="当前水平" value={skill.current} tone="green" />
            <ProgressMetric
              label="目标差距"
              max={40}
              tone={gap >= 20 ? "red" : gap >= 10 ? "orange" : "green"}
              value={gap}
            />
          </div>

          <section>
            <h3 className="text-sm font-semibold">作品证据</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {skill.evidence.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold">相关岗位</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skill.relatedJobs.map((job) => (
                <Badge key={job} tone="blue">
                  {job}
                </Badge>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section>
            <h3 className="text-sm font-semibold">学习计划</h3>
            <div className="mt-3 space-y-3">
              {skill.learningPlan.map((item, index) => (
                <div
                  key={item}
                  className="rounded-[8px] border border-border bg-card p-3"
                >
                  <div className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded bg-info-soft text-xs font-semibold text-info">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold">匹配作品</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skill.matchedProjects.map((project) => (
                <Badge key={project} tone="green">
                  {project}
                </Badge>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Modal>
  );
}

function MetricTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-24 rounded-[8px] border border-border bg-muted/60 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
