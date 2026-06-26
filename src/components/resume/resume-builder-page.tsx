"use client";

import * as React from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  FileText,
  Gauge,
  GraduationCap,
  LayoutTemplate,
  RotateCcw,
  Save,
  Sparkles,
  Target,
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
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { defaultResumeData } from "@/lib/resume-data";
import { cn } from "@/lib/utils";
import type {
  ResumeData,
  ResumeEducationData,
  ResumeExperienceData,
  ResumeProfileData,
  ResumeProjectData,
  ResumeTargetJobData,
  ResumeTemplate,
} from "@/types/resume";

const storageKey = "jobpilot-resume-draft";

const templateOptions: {
  value: ResumeTemplate;
  label: string;
  description: string;
}[] = [
  { value: "professional", label: "专业", description: "适合中后台和业务前端岗位" },
  { value: "minimal", label: "简洁", description: "强调内容密度和 ATS 识别" },
  { value: "technical", label: "技术", description: "突出技术栈和项目证据" },
];

function cloneDefaultResume() {
  return JSON.parse(JSON.stringify(defaultResumeData)) as ResumeData;
}

function parseKeywords(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,，、\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function ResumeBuilderPage() {
  const [resume, setResume] = React.useState<ResumeData>(cloneDefaultResume);
  const [template, setTemplate] =
    React.useState<ResumeTemplate>("professional");
  const [feedback, setFeedback] = React.useState("");
  const [lastSaved, setLastSaved] = React.useState("尚未保存");
  const [serverConnected, setServerConnected] = React.useState(false);

  React.useEffect(() => {
    const restoreTimer = window.setTimeout(async () => {
      const savedDraft = window.localStorage.getItem(storageKey);

      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft) as {
            resume: ResumeData;
            template: ResumeTemplate;
            savedAt: string;
          };
          setResume(parsed.resume);
          setTemplate(parsed.template);
          setLastSaved(parsed.savedAt);
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }

      try {
        const response = await fetch("/api/resume", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as {
          record: {
            resume: ResumeData;
            template: ResumeTemplate;
            updatedAt: string;
          } | null;
        };
        setServerConnected(true);

        if (result.record) {
          setResume(result.record.resume);
          setTemplate(result.record.template);
          setLastSaved(
            new Date(result.record.updatedAt).toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          );
          setFeedback("已加载当前账号的简历草稿");
        }
      } catch {
        setFeedback("服务端暂不可用，当前使用本地简历草稿");
      }
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  const selectedProjects = resume.projects.filter((project) => project.selected);
  const targetKeywords = React.useMemo(
    () => parseKeywords(resume.targetJob.keywords),
    [resume.targetJob.keywords],
  );

  const searchableResumeText = React.useMemo(
    () =>
      [
        resume.profile.title,
        resume.profile.summary,
        resume.skills.join(" "),
        resume.experience
          .map((item) => `${item.role} ${item.description}`)
          .join(" "),
        selectedProjects
          .map(
            (project) =>
              `${project.name} ${project.summary} ${project.highlights.join(" ")} ${project.techStack.join(" ")}`,
          )
          .join(" "),
      ]
        .join(" ")
        .toLowerCase(),
    [resume, selectedProjects],
  );

  const matchedKeywords = targetKeywords.filter((keyword) =>
    searchableResumeText.includes(keyword.toLowerCase()),
  );
  const missingKeywords = targetKeywords.filter(
    (keyword) => !matchedKeywords.includes(keyword),
  );

  const completedFields = [
    resume.profile.name,
    resume.profile.title,
    resume.profile.email,
    resume.profile.phone,
    resume.profile.summary,
    resume.skills.length >= 4,
    resume.experience[0]?.company,
    resume.education.school,
    selectedProjects.length > 0,
  ].filter(Boolean).length;
  const completionScore = Math.round((completedFields / 9) * 55);
  const keywordScore = targetKeywords.length
    ? Math.round((matchedKeywords.length / targetKeywords.length) * 30)
    : 20;
  const projectScore = Math.min(15, selectedProjects.length * 5);
  const atsScore = Math.min(100, completionScore + keywordScore + projectScore);

  const updateProfile = (
    field: keyof ResumeProfileData,
    value: string,
  ) => {
    setResume((current) => ({
      ...current,
      profile: { ...current.profile, [field]: value },
    }));
  };

  const updateExperience = (
    field: keyof ResumeExperienceData,
    value: string,
  ) => {
    setResume((current) => ({
      ...current,
      experience: current.experience.map((item, index) =>
        index === 0 ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const updateEducation = (
    field: keyof ResumeEducationData,
    value: string,
  ) => {
    setResume((current) => ({
      ...current,
      education: { ...current.education, [field]: value },
    }));
  };

  const updateTargetJob = (
    field: keyof ResumeTargetJobData,
    value: string,
  ) => {
    setResume((current) => ({
      ...current,
      targetJob: { ...current.targetJob, [field]: value },
    }));
  };

  const toggleProject = (projectId: string, selected: boolean) => {
    if (selected && selectedProjects.length >= 3) {
      setFeedback("一份简历最多选择 3 个项目，建议保留与岗位最相关的项目。");
      return;
    }

    setResume((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId ? { ...project, selected } : project,
      ),
    }));
    setFeedback("");
  };

  const optimizeForTarget = () => {
    setResume((current) => ({
      ...current,
      skills: Array.from(new Set([...current.skills, ...missingKeywords])),
    }));
    setFeedback(
      missingKeywords.length
        ? `已将 ${missingKeywords.length} 个岗位关键词补充到技能列表，请保留真实掌握的内容。`
        : "当前岗位关键词已全部覆盖。",
    );
  };

  const saveDraft = async () => {
    const savedAt = new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ resume, template, savedAt }),
    );
    setLastSaved(savedAt);
    setFeedback(`简历版本已保存，保存时间 ${savedAt}`);

    if (serverConnected) {
      try {
        const response = await fetch("/api/resume", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume, template }),
        });

        if (response.ok) {
          setFeedback(`简历已保存到本地和当前账号，保存时间 ${savedAt}`);
        } else {
          setFeedback(`本地保存成功，但服务端同步失败`);
        }
      } catch {
        setFeedback(`本地保存成功，但服务端同步失败`);
      }
    }
  };

  const resetDraft = () => {
    window.localStorage.removeItem(storageKey);
    setResume(cloneDefaultResume());
    setTemplate("professional");
    setLastSaved("尚未保存");
    setFeedback("已恢复默认简历内容。");

    if (serverConnected) {
      void fetch("/api/resume", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: cloneDefaultResume(),
          template: "professional",
        }),
      });
    }
  };

  const printResume = () => {
    setFeedback("已打开打印预览，可选择“另存为 PDF”。");
    window.setTimeout(() => window.print(), 80);
  };

  return (
    <AppShell activeItem="resume">
      <div className="space-y-4">
        <header className="no-print rounded-[10px] border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">简历生成器</Badge>
                <Badge tone={serverConnected ? "green" : "gray"}>
                  {serverConnected ? "账号草稿" : "本地草稿"}
                </Badge>
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-normal">
                岗位定制简历
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                复用作品集项目和技能证据，按目标岗位调整关键词，并实时生成一页式前端简历。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MetricTile label="ATS 评分" value={`${atsScore}%`} />
              <MetricTile
                label="关键词"
                value={`${matchedKeywords.length}/${targetKeywords.length}`}
              />
              <MetricTile label="项目" value={selectedProjects.length} />
              <MetricTile label="上次保存" value={lastSaved} compact />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <LayoutTemplate className="size-4 text-primary" />
                简历模板
              </div>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="简历模板">
                {templateOptions.map((option) => (
                  <button
                    key={option.value}
                    aria-pressed={template === option.value}
                    className={cn(
                      "rounded-[8px] border px-3 py-2 text-left transition",
                      template === option.value
                        ? "border-primary bg-info-soft text-primary"
                        : "border-border bg-card hover:bg-muted",
                    )}
                    title={option.description}
                    type="button"
                    onClick={() => setTemplate(option.value)}
                  >
                    <span className="text-sm font-semibold">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={resetDraft}>
                <RotateCcw />
                恢复默认
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void saveDraft()}
              >
                <Save />
                保存版本
              </Button>
              <Button type="button" onClick={printResume}>
                <Download />
                打印 / 导出 PDF
              </Button>
            </div>
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

        <div className="grid gap-4 xl:grid-cols-[440px_minmax(0,1fr)] xl:items-start">
          <Card className="no-print xl:sticky xl:top-6">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                简历内容
              </CardTitle>
              <CardDescription>
                编辑内容会实时同步到右侧预览，项目最多选择 3 个。
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs
                defaultValue="basic"
                items={[
                  {
                    value: "basic",
                    label: "内容编辑",
                    content: (
                      <BasicEditor
                        education={resume.education}
                        experience={resume.experience[0]}
                        profile={resume.profile}
                        skills={resume.skills}
                        onEducationChange={updateEducation}
                        onExperienceChange={updateExperience}
                        onProfileChange={updateProfile}
                        onSkillsChange={(skills) =>
                          setResume((current) => ({ ...current, skills }))
                        }
                      />
                    ),
                  },
                  {
                    value: "projects",
                    label: "项目选择",
                    content: (
                      <ProjectSelector
                        projects={resume.projects}
                        selectedCount={selectedProjects.length}
                        onToggle={toggleProject}
                      />
                    ),
                  },
                  {
                    value: "target",
                    label: "岗位适配",
                    content: (
                      <TargetJobEditor
                        atsScore={atsScore}
                        matchedKeywords={matchedKeywords}
                        missingKeywords={missingKeywords}
                        targetJob={resume.targetJob}
                        onOptimize={optimizeForTarget}
                        onTargetJobChange={updateTargetJob}
                      />
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>

          <section>
            <div className="no-print mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">实时预览</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  A4 单页预览，打印时只输出简历区域。
                </p>
              </div>
              <Badge tone={atsScore >= 85 ? "green" : atsScore >= 70 ? "blue" : "orange"}>
                ATS {atsScore}%
              </Badge>
            </div>
            <ResumePreview
              data={resume}
              matchedKeywords={matchedKeywords}
              template={template}
            />
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function BasicEditor({
  education,
  experience,
  profile,
  skills,
  onEducationChange,
  onExperienceChange,
  onProfileChange,
  onSkillsChange,
}: {
  education: ResumeEducationData;
  experience: ResumeExperienceData;
  profile: ResumeProfileData;
  skills: string[];
  onEducationChange: (
    field: keyof ResumeEducationData,
    value: string,
  ) => void;
  onExperienceChange: (
    field: keyof ResumeExperienceData,
    value: string,
  ) => void;
  onProfileChange: (field: keyof ResumeProfileData, value: string) => void;
  onSkillsChange: (skills: string[]) => void;
}) {
  return (
    <div className="space-y-5">
      <EditorSection icon={UserRound} title="个人信息">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="姓名">
            <Input
              aria-label="姓名"
              value={profile.name}
              onChange={(event) => onProfileChange("name", event.target.value)}
            />
          </Field>
          <Field label="求职方向">
            <Input
              aria-label="求职方向"
              value={profile.title}
              onChange={(event) => onProfileChange("title", event.target.value)}
            />
          </Field>
          <Field label="邮箱">
            <Input
              aria-label="邮箱地址"
              type="email"
              value={profile.email}
              onChange={(event) => onProfileChange("email", event.target.value)}
            />
          </Field>
          <Field label="电话">
            <Input
              aria-label="联系电话"
              value={profile.phone}
              onChange={(event) => onProfileChange("phone", event.target.value)}
            />
          </Field>
          <Field label="所在地">
            <Input
              aria-label="所在地"
              value={profile.location}
              onChange={(event) =>
                onProfileChange("location", event.target.value)
              }
            />
          </Field>
          <Field label="个人主页">
            <Input
              aria-label="个人主页"
              value={profile.website}
              onChange={(event) =>
                onProfileChange("website", event.target.value)
              }
            />
          </Field>
        </div>
        <Field label="个人简介">
          <Textarea
            aria-label="个人简介"
            className="min-h-28"
            value={profile.summary}
            onChange={(event) =>
              onProfileChange("summary", event.target.value)
            }
          />
        </Field>
      </EditorSection>

      <EditorSection icon={Gauge} title="核心技能">
        <Field label="技能关键词">
          <Textarea
            aria-label="技能关键词"
            className="min-h-24"
            value={skills.join(", ")}
            onChange={(event) =>
              onSkillsChange(parseKeywords(event.target.value))
            }
          />
        </Field>
        <p className="text-xs leading-5 text-muted-foreground">
          使用逗号分隔，建议保留 8 至 12 个与目标岗位相关且能够举证的技能。
        </p>
      </EditorSection>

      <EditorSection icon={BriefcaseBusiness} title="工作经历">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="公司 / 团队">
            <Input
              aria-label="公司或团队"
              value={experience.company}
              onChange={(event) =>
                onExperienceChange("company", event.target.value)
              }
            />
          </Field>
          <Field label="职位">
            <Input
              aria-label="工作职位"
              value={experience.role}
              onChange={(event) =>
                onExperienceChange("role", event.target.value)
              }
            />
          </Field>
        </div>
        <Field label="时间">
          <Input
            aria-label="工作时间"
            value={experience.period}
            onChange={(event) =>
              onExperienceChange("period", event.target.value)
            }
          />
        </Field>
        <Field label="职责与成果">
          <Textarea
            aria-label="职责与成果"
            className="min-h-28"
            value={experience.description}
            onChange={(event) =>
              onExperienceChange("description", event.target.value)
            }
          />
        </Field>
      </EditorSection>

      <EditorSection icon={GraduationCap} title="教育经历">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="学校">
            <Input
              aria-label="学校"
              value={education.school}
              onChange={(event) =>
                onEducationChange("school", event.target.value)
              }
            />
          </Field>
          <Field label="专业">
            <Input
              aria-label="专业"
              value={education.major}
              onChange={(event) =>
                onEducationChange("major", event.target.value)
              }
            />
          </Field>
          <Field label="学历">
            <Input
              aria-label="学历"
              value={education.degree}
              onChange={(event) =>
                onEducationChange("degree", event.target.value)
              }
            />
          </Field>
          <Field label="时间">
            <Input
              aria-label="教育时间"
              value={education.period}
              onChange={(event) =>
                onEducationChange("period", event.target.value)
              }
            />
          </Field>
        </div>
      </EditorSection>
    </div>
  );
}

function ProjectSelector({
  projects,
  selectedCount,
  onToggle,
}: {
  projects: ResumeProjectData[];
  selectedCount: number;
  onToggle: (projectId: string, selected: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          已选择 {selectedCount}/3 个项目
        </p>
        <Badge tone={selectedCount >= 2 ? "green" : "orange"}>
          {selectedCount >= 2 ? "内容充足" : "建议至少 2 个"}
        </Badge>
      </div>
      {projects.map((project) => (
        <label
          key={project.id}
          className={cn(
            "block cursor-pointer rounded-[8px] border p-4 transition",
            project.selected
              ? "border-blue-200 bg-info-soft/45"
              : "border-border bg-card hover:bg-muted/45",
          )}
        >
          <div className="flex items-start gap-3">
            <input
              aria-label={`选择 ${project.name}`}
              checked={project.selected}
              className="mt-1 size-4 accent-blue-600"
              type="checkbox"
              onChange={(event) => onToggle(project.id, event.target.checked)}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{project.name}</h3>
                {project.selected ? <Badge tone="blue">已加入</Badge> : null}
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {project.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}

function TargetJobEditor({
  atsScore,
  matchedKeywords,
  missingKeywords,
  targetJob,
  onOptimize,
  onTargetJobChange,
}: {
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  targetJob: ResumeTargetJobData;
  onOptimize: () => void;
  onTargetJobChange: (
    field: keyof ResumeTargetJobData,
    value: string,
  ) => void;
}) {
  return (
    <div className="space-y-5">
      <EditorSection icon={Target} title="目标岗位">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="岗位名称">
            <Input
              aria-label="目标岗位"
              value={targetJob.role}
              onChange={(event) =>
                onTargetJobChange("role", event.target.value)
              }
            />
          </Field>
          <Field label="目标公司">
            <Input
              aria-label="目标公司"
              value={targetJob.company}
              onChange={(event) =>
                onTargetJobChange("company", event.target.value)
              }
            />
          </Field>
        </div>
        <Field label="岗位关键词">
          <Textarea
            aria-label="岗位关键词"
            className="min-h-28"
            value={targetJob.keywords}
            onChange={(event) =>
              onTargetJobChange("keywords", event.target.value)
            }
          />
        </Field>
      </EditorSection>

      <div className="rounded-[8px] border border-border bg-muted/35 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">岗位匹配分析</p>
            <p className="mt-1 text-xs text-muted-foreground">
              根据关键词覆盖、内容完整度和项目数量计算。
            </p>
          </div>
          <span
            className={cn(
              "text-2xl font-semibold",
              atsScore >= 85
                ? "text-success"
                : atsScore >= 70
                  ? "text-info"
                  : "text-warning",
            )}
          >
            {atsScore}%
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-muted">
          <div
            className={cn(
              "h-2 rounded-full",
              atsScore >= 85
                ? "bg-success"
                : atsScore >= 70
                  ? "bg-primary"
                  : "bg-warning",
            )}
            style={{ width: `${atsScore}%` }}
          />
        </div>
      </div>

      <KeywordGroup
        emptyText="尚未匹配岗位关键词"
        keywords={matchedKeywords}
        title="已覆盖关键词"
        tone="green"
      />
      <KeywordGroup
        emptyText="当前关键词已全部覆盖"
        keywords={missingKeywords}
        title="待补充关键词"
        tone="orange"
      />

      <Button className="w-full" type="button" onClick={onOptimize}>
        <Sparkles />
        补充岗位关键词
      </Button>
      <p className="text-xs leading-5 text-muted-foreground">
        自动补充只用于内容整理。投递前应删除没有真实经验支撑的技能。
      </p>
    </div>
  );
}

function KeywordGroup({
  emptyText,
  keywords,
  title,
  tone,
}: {
  emptyText: string;
  keywords: string[];
  title: string;
  tone: "green" | "orange";
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {keywords.length ? (
          keywords.map((keyword) => (
            <Badge key={keyword} tone={tone}>
              {tone === "green" ? <CheckCircle2 /> : null}
              {keyword}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">{emptyText}</span>
        )}
      </div>
    </section>
  );
}

function EditorSection({
  children,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  icon: typeof UserRound;
  title: string;
}) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 border-b border-border pb-2 text-sm font-semibold">
        <Icon className="size-4 text-primary" />
        {title}
      </h3>
      {children}
    </section>
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

function ResumePreview({
  data,
  matchedKeywords,
  template,
}: {
  data: ResumeData;
  matchedKeywords: string[];
  template: ResumeTemplate;
}) {
  const selectedProjects = data.projects.filter((project) => project.selected);
  const isMinimal = template === "minimal";
  const isTechnical = template === "technical";

  return (
    <article
      className={cn(
        "resume-print-root mx-auto min-h-[920px] w-full max-w-[794px] overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-[0_20px_55px_rgba(16,24,40,0.12)] lg:min-h-[1123px]",
        isMinimal ? "p-7 sm:p-10" : "p-0",
      )}
      data-testid="resume-preview"
    >
      <header
        className={cn(
          isMinimal
            ? "border-b border-slate-300 pb-5"
            : isTechnical
              ? "bg-slate-900 px-6 py-7 text-white sm:px-10"
              : "border-b-4 border-blue-600 bg-slate-50 px-6 py-7 sm:px-10",
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-normal">
              {data.profile.name || "你的姓名"}
            </h2>
            <p
              className={cn(
                "mt-1 text-base font-medium",
                isTechnical
                  ? "text-emerald-300"
                  : isMinimal
                    ? "text-slate-600"
                    : "text-blue-700",
              )}
            >
              {data.profile.title || "前端开发工程师"}
            </p>
          </div>
          <div
            className={cn(
              "text-xs leading-5 sm:text-right",
              isTechnical ? "text-slate-300" : "text-slate-600",
            )}
          >
            <p>{data.profile.phone}</p>
            <p>{data.profile.email}</p>
            <p>{data.profile.location}</p>
            <p className="break-all">{data.profile.website}</p>
          </div>
        </div>
        <p
          className={cn(
            "mt-5 text-sm leading-6",
            isTechnical ? "text-slate-200" : "text-slate-700",
          )}
        >
          {data.profile.summary}
        </p>
      </header>

      <div className={cn("space-y-6", isMinimal ? "pt-6" : "px-6 py-7 sm:px-10")}>
        {isTechnical ? (
          <ResumeSkills skills={data.skills} technical />
        ) : null}

        <ResumeSection title="工作经历" template={template}>
          {data.experience.map((experience) => (
            <div key={experience.id}>
              <ResumeItemHeader
                meta={experience.period}
                subtitle={experience.company}
                title={experience.role}
              />
              <BulletList
                items={experience.description
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean)}
              />
            </div>
          ))}
        </ResumeSection>

        <ResumeSection title="项目经历" template={template}>
          <div className="space-y-5">
            {selectedProjects.map((project) => (
              <div key={project.id}>
                <ResumeItemHeader
                  meta={project.period}
                  subtitle={project.role}
                  title={project.name}
                />
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {project.summary}
                </p>
                <BulletList items={project.highlights.slice(0, 2)} />
                <p className="mt-2 text-[11px] font-medium text-slate-500">
                  技术栈：{project.techStack.join(" / ")}
                </p>
              </div>
            ))}
          </div>
        </ResumeSection>

        {!isTechnical ? <ResumeSkills skills={data.skills} /> : null}

        <ResumeSection title="教育经历" template={template}>
          <ResumeItemHeader
            meta={data.education.period}
            subtitle={`${data.education.major} · ${data.education.degree}`}
            title={data.education.school}
          />
        </ResumeSection>

        {matchedKeywords.length ? (
          <div className="border-t border-slate-200 pt-3 text-[10px] leading-5 text-slate-400">
            岗位关键词：{matchedKeywords.join(" / ")}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ResumeSkills({
  skills,
  technical = false,
}: {
  skills: string[];
  technical?: boolean;
}) {
  return (
    <ResumeSection
      template={technical ? "technical" : "professional"}
      title="核心技能"
    >
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs leading-5 text-slate-700">
        {skills.map((skill) => (
          <span key={skill} className="font-medium">
            {skill}
          </span>
        ))}
      </div>
    </ResumeSection>
  );
}

function ResumeSection({
  children,
  template,
  title,
}: {
  children: React.ReactNode;
  template: ResumeTemplate;
  title: string;
}) {
  return (
    <section>
      <h3
        className={cn(
          "mb-3 text-sm font-bold tracking-normal",
          template === "professional"
            ? "border-l-4 border-blue-600 pl-2 text-slate-900"
            : template === "technical"
              ? "border-b border-emerald-500 pb-1 text-slate-900"
              : "border-b border-slate-300 pb-1 text-slate-800",
        )}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function ResumeItemHeader({
  meta,
  subtitle,
  title,
}: {
  meta: string;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h4 className="text-sm font-bold">{title}</h4>
        <p className="mt-0.5 text-xs text-slate-600">{subtitle}</p>
      </div>
      <span className="shrink-0 text-[11px] font-medium text-slate-500">
        {meta}
      </span>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-700">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 size-1 shrink-0 rounded-full bg-slate-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function MetricTile({
  compact = false,
  label,
  value,
}: {
  compact?: boolean;
  label: string;
  value: number | string;
}) {
  return (
    <div className="min-w-24 rounded-[8px] border border-border bg-muted/60 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-semibold", compact ? "text-sm" : "text-xl")}>
        {value}
      </div>
    </div>
  );
}
