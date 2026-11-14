import { useStore } from "../lib/store";
import { BANK_KEYS, creatorStatus, formatDate, keysForTopic, progressFor } from "../lib/quiz";
import { BANK_SIZE } from "../data";
import { TOPICS } from "../data/topics";
import { Card, Chip, EmptyState, Icon, PageHeader, ProgressBar, Ring } from "../components/ui";
import { cn } from "../utils/cn";
import type { Go } from "../types";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-900/[0.04] p-4 dark:bg-white/[0.05]">
      <p className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export default function Progress({ go }: { go: Go }) {
  const { state } = useStore();
  const p = progressFor(state.latest, BANK_KEYS);
  const cs = creatorStatus(state.latest);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your progress"
        title="Progress & history"
        subtitle="Based on your most recent answer to each question. Everything is stored privately on this device."
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:justify-around sm:p-8">
          <Ring fraction={p.attempted / BANK_SIZE} size={164} stroke={13}>
            <span className="text-4xl font-extrabold tabular-nums text-slate-900 dark:text-white">{p.attempted}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">of {BANK_SIZE} attempted</span>
          </Ring>
          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            <Stat label="Correct (latest)" value={p.correct} />
            <Stat label="Accuracy" value={p.attempted ? `${p.accuracy}%` : "—"} />
            <Stat label="Not yet attempted" value={BANK_SIZE - p.attempted} />
            <Stat label="Sessions" value={state.history.length} />
          </div>
        </Card>

        <Card className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                state.creatorUnlocked
                  ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300"
                  : "bg-slate-900/[0.06] text-slate-500 dark:bg-white/10 dark:text-slate-300",
              )}
            >
              <Icon name={state.creatorUnlocked ? "check" : "lock"} className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 dark:text-white">Personal MCQ creator</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {state.creatorUnlocked
                  ? "Unlocked. You can write and practise your own questions."
                  : "Attempt all 230 questions and score at least 90%."}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Attempted</span>
              <span className="tabular-nums">
                {cs.attempted} / {cs.total}
              </span>
            </div>
            <ProgressBar value={cs.attempted} max={cs.total} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Correct (need {cs.required}, i.e. 90%)</span>
              <span className="tabular-nums">
                {cs.correct} / {cs.total} · {cs.percent}%
              </span>
            </div>
            <div className="relative">
              <ProgressBar
                value={cs.correct}
                max={cs.total}
                barClassName={cs.correct >= cs.required ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-indigo-500 to-violet-500"}
              />
              <span
                className="pointer-events-none absolute -top-1 bottom-[-4px] w-0.5 rounded bg-slate-700/60 dark:bg-white/70"
                style={{ left: `${(cs.required / cs.total) * 100}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => go({ name: "creator" })}
            className="self-start text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
          >
            {state.creatorUnlocked ? "Open my MCQs →" : "View requirements →"}
          </button>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Progress by topic</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {TOPICS.map((t) => {
            const tp = progressFor(state.latest, keysForTopic(t.id));
            return (
              <Card key={t.id} className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold leading-snug text-slate-900 dark:text-white">{t.name}</p>
                  <Chip tone={tp.attempted === 0 ? "slate" : tp.accuracy >= 90 ? "emerald" : "indigo"} className="shrink-0 tabular-nums">
                    {tp.attempted ? `${tp.accuracy}%` : "New"}
                  </Chip>
                </div>
                <ProgressBar value={tp.attempted} max={tp.total} barClassName={`bg-gradient-to-r ${t.accent}`} />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {tp.attempted} of {tp.total} attempted · {tp.correct} correct
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Session history</h2>
        {state.history.length === 0 ? (
          <EmptyState
            icon="chart"
            title="No completed sessions"
            text="Your scores and answer reviews will appear here after you finish a session."
          />
        ) : (
          <ul className="space-y-3">
            {state.history.map((rec) => (
              <li key={rec.id}>
                <button
                  type="button"
                  onClick={() => go({ name: "results", id: rec.id })}
                  className="group flex w-full items-center gap-4 rounded-3xl border border-white/70 bg-white/80 p-4 text-left shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-5 dark:border-white/[0.08] dark:bg-slate-900/70"
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold tabular-nums",
                      rec.percent >= 90
                        ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                        : "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
                    )}
                  >
                    {rec.percent}%
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">{rec.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {rec.correct} correct of {rec.total} · {rec.answered} answered · {formatDate(rec.endedAt)}
                    </p>
                  </div>
                  <Icon name="arrowRight" className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
