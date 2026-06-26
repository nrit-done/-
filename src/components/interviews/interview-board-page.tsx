"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Download,
  GripVertical,
  MapPin,
  MessageSquareText,
  Search,
  TimerReset,
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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  initialInterviewCards,
  interviewFormatMeta,
  interviewPriorityMeta,
  interviewStages,
} from "@/lib/interview-data";
import { downloadTextFile } from "@/lib/download";
import { cn } from "@/lib/utils";
import type {
  InterviewCard,
  InterviewFormat,
  InterviewPriority,
  InterviewStageId,
} from "@/types/interview";

type FilterValue = "all";

type DetailDraft = {
  stage: InterviewStageId;
  nextAction: string;
  notes: string;
};

const getStageIndex = (stage: InterviewStageId) =>
  interviewStages.findIndex((item) => item.id === stage);

const getStageLabel = (stage: InterviewStageId) =>
  interviewStages.find((item) => item.id === stage)?.label ?? stage;

const escapeCalendarText = (value: string) =>
  value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");

const toCalendarDate = (value: string) =>
  value.replaceAll("-", "").replace(" ", "T").replace(":", "") + "00";

const addOneHour = (value: string) => {
  const date = new Date(value.replace(" ", "T"));
  date.setHours(date.getHours() + 1);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    "T",
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    "00",
  ].join("");
};

export function InterviewBoardPage() {
  const [cards, setCards] = React.useState<InterviewCard[]>(initialInterviewCards);
  const [serverConnected, setServerConnected] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState<
    InterviewPriority | FilterValue
  >("all");
  const [formatFilter, setFormatFilter] = React.useState<
    InterviewFormat | FilterValue
  >("all");
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [selectedCard, setSelectedCard] = React.useState<InterviewCard | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailDraft, setDetailDraft] = React.useState<DetailDraft>({
    stage: "screening",
    nextAction: "",
    notes: "",
  });
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    const loadTimer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/interviews", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as {
          record: { interviews: InterviewCard[] } | null;
        };
        setServerConnected(true);

        if (result.record) {
          setCards(result.record.interviews);
          setFeedback("已加载当前账号的面试数据");
        } else {
          await fetch("/api/interviews", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ interviews: initialInterviewCards }),
          });
          setFeedback("已为当前账号初始化面试数据");
        }
      } catch {
        setFeedback("服务端暂不可用，当前使用页面演示数据");
      }
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  const persistCards = async (
    nextCards: InterviewCard[],
    message: string,
  ) => {
    setCards(nextCards);
    setFeedback(message);

    if (!serverConnected) {
      return;
    }

    try {
      const response = await fetch("/api/interviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviews: nextCards }),
      });

      if (!response.ok) {
        setFeedback(`${message}，但服务端同步失败`);
      }
    } catch {
      setFeedback(`${message}，但服务端同步失败`);
    }
  };

  const filteredCards = React.useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return cards.filter((card) => {
      const matchKeyword =
        !keyword ||
        [
          card.jobTitle,
          card.company,
          card.channel,
          card.location,
          card.interviewer,
          card.skills.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      const matchPriority =
        priorityFilter === "all" || card.priority === priorityFilter;
      const matchFormat = formatFilter === "all" || card.format === formatFilter;

      return matchKeyword && matchPriority && matchFormat;
    });
  }, [cards, formatFilter, priorityFilter, query]);

  const cardsByStage = React.useMemo(
    () =>
      interviewStages.map((stage) => ({
        ...stage,
        cards: filteredCards.filter((card) => card.stage === stage.id),
      })),
    [filteredCards],
  );

  const activeCount = cards.filter((card) => card.stage !== "offer").length;
  const highPriorityCount = cards.filter((card) => card.priority === "high").length;
  const offerCount = cards.filter((card) => card.stage === "offer").length;
  const soonCount = cards.filter((card) => card.interviewAt <= "2026-06-25").length;

  const moveCardToStage = (cardId: string, stage: InterviewStageId) => {
    const currentCard = cards.find((card) => card.id === cardId);
    if (!currentCard || currentCard.stage === stage) {
      return;
    }

    const nextCards = cards.map((card) =>
      card.id === cardId ? { ...card, stage } : card,
    );
    void persistCards(
      nextCards,
      `${currentCard.company} 已移动到「${getStageLabel(stage)}」阶段`,
    );

    if (selectedCard?.id === cardId) {
      const updatedCard = { ...currentCard, stage };
      setSelectedCard(updatedCard);
      setDetailDraft((current) => ({ ...current, stage }));
    }
  };

  const moveCardByOffset = (card: InterviewCard, offset: -1 | 1) => {
    const nextIndex = getStageIndex(card.stage) + offset;
    const nextStage = interviewStages[nextIndex];

    if (nextStage) {
      moveCardToStage(card.id, nextStage.id);
    }
  };

  const openDetail = (card: InterviewCard) => {
    setSelectedCard(card);
    setDetailDraft({
      stage: card.stage,
      nextAction: card.nextAction,
      notes: card.notes,
    });
    setDetailOpen(true);
  };

  const saveDetail = () => {
    if (!selectedCard) {
      return;
    }

    const updatedCard = {
      ...selectedCard,
      stage: detailDraft.stage,
      nextAction: detailDraft.nextAction.trim(),
      notes: detailDraft.notes.trim(),
    };

    const nextCards = cards.map((card) =>
      card.id === selectedCard.id ? updatedCard : card,
    );
    void persistCards(nextCards, `${selectedCard.company} 的面试记录已更新`);
    setSelectedCard(updatedCard);
  };

  const resetFilters = () => {
    setQuery("");
    setPriorityFilter("all");
    setFormatFilter("all");
  };

  const handleDrop = (
    event: React.DragEvent<HTMLElement>,
    stage: InterviewStageId,
  ) => {
    event.preventDefault();
    const droppedId = event.dataTransfer.getData("text/plain") || draggingId;

    if (droppedId) {
      moveCardToStage(droppedId, stage);
    }

    setDraggingId(null);
  };

  const handleCalendarExport = () => {
    const events = filteredCards.map((card) =>
      [
        "BEGIN:VEVENT",
        `UID:${card.id}@jobpilot.local`,
        `DTSTAMP:${new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z")}`,
        `DTSTART:${toCalendarDate(card.interviewAt)}`,
        `DTEND:${addOneHour(card.interviewAt)}`,
        `SUMMARY:${escapeCalendarText(`${card.company} - ${card.jobTitle}`)}`,
        `LOCATION:${escapeCalendarText(card.location)}`,
        `DESCRIPTION:${escapeCalendarText(`${card.nextAction}\n${card.notes}`)}`,
        "END:VEVENT",
      ].join("\r\n"),
    );
    const calendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//JobPilot//Interview Calendar//ZH-CN",
      "CALSCALE:GREGORIAN",
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");
    const date = new Date().toISOString().slice(0, 10);

    downloadTextFile(
      `jobpilot-interviews-${date}.ics`,
      calendar,
      "text/calendar;charset=utf-8",
    );
    setFeedback(`已生成 ${filteredCards.length} 条日历提醒`);
  };

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      `jobpilot-interviews-${date}.json`,
      JSON.stringify(filteredCards, null, 2),
      "application/json;charset=utf-8",
    );
    setFeedback(`已导出 ${filteredCards.length} 条面试记录`);
  };

  return (
    <AppShell activeItem="interviews">
      <div className="space-y-4">
        <header className="rounded-[10px] border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <Badge tone="blue">面试流程</Badge>
              <h1 className="mt-3 text-2xl font-semibold tracking-normal">
                面试推进看板
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                把每个岗位的面试阶段、下一步动作和复盘记录集中管理，减少遗漏和重复沟通。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MetricTile label="推进中" value={activeCount} />
              <MetricTile label="近期待办" value={soonCount} />
              <MetricTile label="高优先级" value={highPriorityCount} />
              <MetricTile label="Offer" value={offerCount} />
            </div>
          </div>
        </header>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-primary" />
                  流程看板
                  <Badge tone={serverConnected ? "green" : "gray"}>
                    {serverConnected ? "账号数据" : "演示数据"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  当前共 {cards.length} 条面试记录，筛选结果 {filteredCards.length} 条。
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCalendarExport}
                >
                  <TimerReset />
                  新建提醒
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExport}
                >
                  <Download />
                  导出
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
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  aria-label="搜索面试"
                  className="pl-9"
                  placeholder="搜索岗位、公司、技能或面试官"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <Select
                aria-label="优先级筛选"
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value as InterviewPriority | FilterValue,
                  )
                }
              >
                <option value="all">全部优先级</option>
                {Object.entries(interviewPriorityMeta).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </Select>
              <Select
                aria-label="面试形式筛选"
                value={formatFilter}
                onChange={(event) =>
                  setFormatFilter(event.target.value as InterviewFormat | FilterValue)
                }
              >
                <option value="all">全部形式</option>
                {Object.entries(interviewFormatMeta).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <Button type="button" variant="outline" onClick={resetFilters}>
                重置
              </Button>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="grid grid-cols-1 gap-3 md:min-w-[1720px] md:grid-cols-6">
                {cardsByStage.map((stage) => (
                  <section
                    key={stage.id}
                    className="rounded-[8px] border border-border bg-muted/45 p-3"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(event, stage.id)}
                  >
                    <div className="mb-3">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold">{stage.label}</h2>
                        <Badge tone="gray">{stage.cards.length}</Badge>
                      </div>
                      <p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">
                        {stage.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {stage.cards.length ? (
                        stage.cards.map((card) => (
                          <InterviewKanbanCard
                            key={card.id}
                            card={card}
                            dragging={draggingId === card.id}
                            onDragEnd={() => setDraggingId(null)}
                            onDragStart={(event) => {
                              event.dataTransfer.setData("text/plain", card.id);
                              event.dataTransfer.effectAllowed = "move";
                              setDraggingId(card.id);
                            }}
                            onMoveBackward={() => moveCardByOffset(card, -1)}
                            onMoveForward={() => moveCardByOffset(card, 1)}
                            onOpen={() => openDetail(card)}
                          />
                        ))
                      ) : (
                        <div className="rounded-[8px] border border-dashed border-border bg-card/60 px-3 py-6 text-center text-xs text-muted-foreground">
                          暂无记录
                        </div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <InterviewDetailModal
        card={selectedCard}
        draft={detailDraft}
        open={detailOpen}
        onDraftChange={setDetailDraft}
        onOpenChange={setDetailOpen}
        onSave={saveDetail}
      />
    </AppShell>
  );
}

function InterviewKanbanCard({
  card,
  dragging,
  onDragEnd,
  onDragStart,
  onMoveBackward,
  onMoveForward,
  onOpen,
}: {
  card: InterviewCard;
  dragging: boolean;
  onDragEnd: () => void;
  onDragStart: (event: React.DragEvent<HTMLElement>) => void;
  onMoveBackward: () => void;
  onMoveForward: () => void;
  onOpen: () => void;
}) {
  const priorityMeta = interviewPriorityMeta[card.priority];
  const stageIndex = getStageIndex(card.stage);
  const canMoveBackward = stageIndex > 0;
  const canMoveForward = stageIndex < interviewStages.length - 1;

  return (
    <article
      aria-label={`${card.company} ${card.jobTitle}`}
      className={cn(
        "cursor-pointer rounded-[8px] border border-border bg-card p-3 shadow-sm transition hover:border-[#c9d4e5] hover:shadow-[var(--shadow-soft)]",
        dragging && "opacity-50",
      )}
      draggable
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-5">{card.jobTitle}</h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {card.company}
          </p>
        </div>
        <GripVertical className="size-4 shrink-0 text-muted-foreground" />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone={priorityMeta.tone}>{priorityMeta.label}</Badge>
        <Badge tone="blue">{interviewFormatMeta[card.format]}</Badge>
      </div>

      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-3.5" aria-hidden="true" />
          <span>{card.interviewAt}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-3.5" aria-hidden="true" />
          <span>{card.location}</span>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
        {card.nextAction}
      </p>

      <div className="mt-3 flex flex-wrap gap-1">
        {card.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <Button
          disabled={!canMoveBackward}
          size="sm"
          type="button"
          variant="outline"
          onClick={(event) => {
            event.stopPropagation();
            onMoveBackward();
          }}
        >
          <ArrowLeft />
          回退
        </Button>
        <Button
          disabled={!canMoveForward}
          size="sm"
          type="button"
          variant="outline"
          onClick={(event) => {
            event.stopPropagation();
            onMoveForward();
          }}
        >
          推进
          <ArrowRight />
        </Button>
      </div>
    </article>
  );
}

function InterviewDetailModal({
  card,
  draft,
  open,
  onDraftChange,
  onOpenChange,
  onSave,
}: {
  card: InterviewCard | null;
  draft: DetailDraft;
  open: boolean;
  onDraftChange: React.Dispatch<React.SetStateAction<DetailDraft>>;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
  if (!card) {
    return null;
  }

  const priorityMeta = interviewPriorityMeta[card.priority];

  return (
    <Modal
      className="max-w-4xl"
      description={`${card.company} · ${card.jobTitle}`}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button type="button" onClick={onSave}>
            保存记录
          </Button>
        </>
      }
      open={open}
      title="面试详情"
      onOpenChange={onOpenChange}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <div className="grid gap-3 rounded-[8px] border border-border bg-muted/40 p-4 sm:grid-cols-2">
            <InfoItem label="当前阶段" value={getStageLabel(card.stage)} />
            <InfoItem label="面试时间" value={card.interviewAt} />
            <InfoItem label="面试形式" value={interviewFormatMeta[card.format]} />
            <InfoItem label="面试官" value={card.interviewer} />
            <InfoItem label="渠道" value={card.channel} />
            <InfoItem label="地点" value={card.location} />
          </div>

          <div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              <Badge tone={priorityMeta.tone}>{priorityMeta.label}</Badge>
              {card.skills.map((skill) => (
                <Badge key={skill} tone="gray">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>调整阶段</Label>
            <Select
              value={draft.stage}
              onChange={(event) =>
                onDraftChange((current) => ({
                  ...current,
                  stage: event.target.value as InterviewStageId,
                }))
              }
            >
              {interviewStages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>下一步动作</Label>
            <Textarea
              value={draft.nextAction}
              onChange={(event) =>
                onDraftChange((current) => ({
                  ...current,
                  nextAction: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>复盘备注</Label>
            <Textarea
              value={draft.notes}
              onChange={(event) =>
                onDraftChange((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquareText className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">跟进记录</h3>
          </div>
          <div className="space-y-3">
            {card.timeline.map((item) => (
              <div
                key={item.id}
                className="rounded-[8px] border border-border bg-card p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{item.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-[8px] border border-border bg-muted/60 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
