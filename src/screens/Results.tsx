import { useMemo, useState } from "react";
import { useStore } from "../lib/store";
import {
  bankNumber,
  DIFFICULTY_LABEL,
  formatDate,
  formatDuration,
  getItem,
  LETTERS,
  MODE_LABEL,
  missedKeysFromRecord,
  topicShort,
} from "../lib/quiz";
import { TOPICS } from "../data/topics";
import { Button, Card, Chip, EmptyState, Icon, PageHeader, ProgressBar, Ring, Segmented } from "../components/ui";
import { useBegin } from "../components/StartSheet";
import { cn } from "../utils/cn";
import type { Go, Item } from "../types";

type Status = "correct" | "wrong" | "unanswered";
type Filter = "all" | Status;

interface Row {
  key: string;
  item: Item | undefined;
  choice: number | null;
  status: Status;
}

function StatusChip({ status }: { status: Status }) {
  if (status === "correct") return <Chip tone="emerald"><Icon name="check" className="h-3 w-3" />Correct</Chip>;
  if (status === "wrong") return <Chip tone="rose"><Icon name="x" className="h-3 w-3" />Incorrect</Chip>;
  return <Chip tone="slate">Unanswered</Chip>;
}

export default function Results({ id, go }: { id: string; go: Go }) {
  const { state } = useStore();
  const begin = useBegin(go);
  const [filter, setFilter] = useState<Filter>("all");

  const rec = state.history.find((r) => r.id === id);

  const rows = useMemo<Row[]>(() => {
    if (!rec) return [];
    return rec.keys.map((k) => {
      const item = getItem(k, state.custom);
      const choice = rec.answers[k] ?? null;
      const status: Status =
        choice === null ? "unanswered" : item && item.correct === choice ? "correct" : "wrong";
      return { key: k, item, choice, status };
    });
  }, [rec, state.custom]);

  if (!rec) {
    return (
      <EmptyState
        icon="alert"
        title="Results not found"
        text="This session is no longer in your history."
        action={<Button onClick={() => go({ name: "home" })}>Back to home</Button>}
      />
    );
  }

  const counts = {
    all: rows.length,
    correct: rows.filter((r) => r.status === "correct").length,
    wrong: rows.filter((r) => r.status === "wrong").length,
    unanswered: rows.filter((r) => r.status === "unanswered").length,
  };
  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const topicStats = TOPICS.map((t) => {
    const rs = rows.filter((r) => r.item && r.item.topic === t.id);
    return { t, total: rs.length, correct: rs.filter((r) => r.status === "correct").length };
  }).filter((x) => x.total > 0);
  const missed = missedKeysFromRecord(rec, state.custom);
  const percent = rec.total ? Math.round((counts.correct / rec.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={MODE_LABEL[rec.mode]}
        title={rec.title}
        subtitle={`Completed ${formatDate(rec.endedAt)} · ${rec.total} question${rec.total === 1 ? "" : "s"}${rec.timed ? " · timed" : ""}`}
      />

      <Card className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center gap-4">
          <Ring fraction={percent / 100} size={176} stroke={14} colorClass={percent >= 90 ? "text-emerald-500" : "text-indigo-500"}>
            <span className="text-4xl font-extrabold tabular-nums text-slate-900 dark:text-white">{percent}%</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {counts.correct} of {rec.total} correct
            </span>
          </Ring>
          <div className="flex flex-wrap justify-center gap-2">
            {percent >= 90 ? (
              <Chip tone="emerald">Excellent — 90%+</Chip>
            ) : (
              <Chip tone="indigo">Keep going</Chip>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Correct" value={counts.correct} tone="text-emerald-600 dark:text-emerald-300" />
            <Metric label="Incorrect" value={counts.wrong} tone="text-rose-600 dark:text-rose-300" />
            <Metric label="Unanswered" value={counts.unanswered} tone="text-slate-600 dark:text-slate-300" />
            <Metric
              label="Time taken"
              value={formatDuration(rec.endedAt - rec.startedAt)}
              tone="text-indigo-600 dark:text-indigo-300"
              small
            />
          </div>

          {topicStats.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Topic breakdown</p>
              {topicStats.map(({ t, total, correct }) => (
                <div key={t.id}>
                  <div className="mb-1.5 flex justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span className="truncate">{t.short}</span>
                    <span className="shrink-0 tabular-nums">
                      {correct}/{total}
                    </span>
                  </div>
                  <ProgressBar value={correct} max={total} barClassName={`bg-gradient-to-r ${t.accent}`} />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1"
              disabled={missed.length === 0}
              onClick={() =>
                begin({ mode: "missed", title: "Missed Questions", topic: null, pool: missed }, missed.length, true)
              }
            >
              <Icon name="refresh" className="h-4 w-4" />
              Practise missed ({missed.length})
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => go({ name: "progress" })}>
              View progress
            </Button>
            <Button variant="ghost" onClick={() => go({ name: "home" })}>
              Home
            </Button>
          </div>
        </div>
      </Card>

      {/* Answer review — only available after submission */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Answer review</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Correct answers are shown now that the session is submitted.</p>
          </div>
        </div>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: `All ${counts.all}` },
            { value: "correct", label: `Right ${counts.correct}` },
            { value: "wrong", label: `Wrong ${counts.wrong}` },
            { value: "unanswered", label: `Skipped ${counts.unanswered}` },
          ]}
        />

        <div className="space-y-4">
          {visible.length === 0 && (
            <Card className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Nothing in this filter.</Card>
          )}
          {visible.map((row, idx) => (
            <ReviewCard key={`${row.key}-${idx}`} row={row} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, tone, small }: { label: string; value: number | string; tone: string; small?: boolean }) {
  return (
    <div className="rounded-2xl bg-slate-900/[0.04] p-4 dark:bg-white/[0.05]">
      <p className={cn("font-extrabold tabular-nums", small ? "text-lg" : "text-2xl", tone)}>{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function ReviewCard({ row }: { row: Row }) {
  const { item, choice, status, key } = row;
  if (!item) {
    return (
      <Card className="text-sm text-slate-500 dark:text-slate-400">This personal question has been deleted.</Card>
    );
  }
  const num = bankNumber(key);
  return (
    <Card className="space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="slate">{num !== null ? `Q${num}` : "My MCQ"}</Chip>
        <Chip tone="sky">{topicShort(item.topic)}</Chip>
        {item.difficulty && <Chip tone="slate">{DIFFICULTY_LABEL[item.difficulty]}</Chip>}
        <StatusChip status={status} />
      </div>
      <p className="font-medium leading-relaxed text-slate-900 dark:text-slate-50">{item.text}</p>
      <div className="grid gap-2.5">
        {item.options.map((opt, i) => {
          const isCorrect = i === item.correct;
          const isChoice = i === choice;
          return (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 rounded-2xl border-2 p-3 text-sm leading-relaxed transition",
                isCorrect
                  ? "border-emerald-500 bg-emerald-50 text-emerald-950 dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-50"
                  : isChoice
                    ? "border-rose-400 bg-rose-50 text-rose-950 dark:border-rose-400 dark:bg-rose-500/10 dark:text-rose-50"
                    : "border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  isCorrect
                    ? "bg-emerald-600 text-white"
                    : isChoice
                      ? "bg-rose-500 text-white"
                      : "bg-slate-900/[0.06] text-slate-600 dark:bg-white/10 dark:text-slate-300",
                )}
              >
                {LETTERS[i]}
              </span>
              <span className="min-w-0 flex-1 pt-0.5">{opt}</span>
              <span className="flex shrink-0 flex-wrap justify-end gap-1.5 pt-0.5">
                {isCorrect && (
                  <Chip tone="emerald">
                    <Icon name="check" className="h-3 w-3" />
                    Correct answer
                  </Chip>
                )}
                {isChoice && (
                  <Chip tone={isCorrect ? "emerald" : "rose"}>Your answer</Chip>
                )}
              </span>
            </div>
          );
        })}
      </div>
      {choice === null && <p className="text-sm text-slate-500 dark:text-slate-400">You did not answer this question.</p>}
    </Card>
  );
}
