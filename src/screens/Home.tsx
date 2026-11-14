import { useState } from "react";
import { useStore } from "../lib/store";
import {
  BANK_KEYS,
  creatorStatus,
  EXAM_MINUTES,
  EXAM_QUESTIONS,
  formatDate,
  pct,
  progressFor,
  TIMER_SECONDS,
  wrongKeys,
} from "../lib/quiz";
import { BANK_SIZE } from "../data";
import { Button, Card, Chip, Icon, Ring, type IconName } from "../components/ui";
import { StartSheet, type PracticeRequest } from "../components/StartSheet";
import { cn } from "../utils/cn";
import type { Go } from "../types";

interface ModeCardProps {
  icon: IconName;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  disabled?: boolean;
  gradient: string;
  badge?: string;
}

function ModeCard({ icon, title, description, action, onClick, disabled, gradient, badge }: ModeCardProps) {
  return (
    <Card interactive className={cn("flex flex-col gap-4", disabled && "opacity-60")}>
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", gradient)}>
          <Icon name={icon} className="h-6 w-6" />
        </div>
        {badge && <Chip tone="indigo">{badge}</Chip>}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <Button variant="soft" block onClick={onClick} disabled={disabled}>
        {action}
        <Icon name="arrowRight" className="h-4 w-4" />
      </Button>
    </Card>
  );
}

export default function Home({ go }: { go: Go }) {
  const { state, discardSession } = useStore();
  const [request, setRequest] = useState<PracticeRequest | null>(null);

  const progress = progressFor(state.latest, BANK_KEYS);
  const wrong = wrongKeys(state.latest, state.custom);
  const creator = creatorStatus(state.latest);
  const accuracy = progress.accuracy;
  const sessions = state.history.length;
  const active = state.active;
  const customCount = state.custom.length;

  const resumeIndex = active ? active.index + 1 : 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-2xl shadow-indigo-600/25 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">Practice dashboard</p>
            <h1 className="mt-2 text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Build judgement, one question at a time.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
              {BANK_SIZE} MCQs on Bailey's attitudes and virtues, codes of ethics, Wakefield's thesis, the public interest,
              and Islamic values in administration. Answers are only revealed after you submit a session.
            </p>
            <div className="mt-6 grid max-w-md grid-cols-3 gap-3">
              <HeroStat label="Attempted" value={`${progress.attempted}/${BANK_SIZE}`} />
              <HeroStat label="Accuracy" value={progress.attempted ? `${accuracy}%` : "—"} />
              <HeroStat label="Sessions" value={String(sessions)} />
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-end">
            <Ring fraction={progress.attempted / BANK_SIZE} size={150} stroke={12} colorClass="text-white">
              <span className="text-3xl font-extrabold tabular-nums">{pct(progress.attempted, BANK_SIZE)}%</span>
              <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/75">Covered</span>
            </Ring>
          </div>
        </div>
      </section>

      {/* Resume */}
      {active && (
        <Card className="flex flex-col gap-4 border-indigo-300/60 sm:flex-row sm:items-center sm:justify-between dark:border-indigo-400/30">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/12 text-indigo-600 dark:text-indigo-300">
              <Icon name="play" className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Session in progress</p>
              <p className="truncate font-bold text-slate-900 dark:text-white">{active.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Question {Math.min(resumeIndex, active.keys.length)} of {active.keys.length}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => {
              if (window.confirm("Discard this session? Its answers will not be saved.")) discardSession();
            }}>
              Discard
            </Button>
            <Button onClick={() => go({ name: "session" })}>
              Resume
              <Icon name="arrowRight" className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Modes */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Practice modes</h2>
          <span className="text-xs font-semibold text-slate-500">{TIMER_SECONDS}s per question when timer is on</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ModeCard
            icon="play"
            title="Practice All"
            description={`All ${BANK_SIZE} questions. Choose how many, and whether they are shuffled or in order.`}
            action="Start practice"
            gradient="from-indigo-500 to-violet-600"
            onClick={() => setRequest({ mode: "all", title: "Practice All", topic: null, pool: BANK_KEYS })}
          />
          <ModeCard
            icon="layers"
            title="Topic Practice"
            description="Focus on one section of the bank — from Mental Attitudes to Public Service ethics."
            action="Choose a topic"
            gradient="from-sky-500 to-blue-600"
            onClick={() => go({ name: "topics" })}
          />
          <ModeCard
            icon="clock"
            title="Exam Mode"
            description={`${EXAM_QUESTIONS} random questions, ${EXAM_MINUTES} minutes overall, ${TIMER_SECONDS}-second timer on each question.`}
            action="Start exam"
            gradient="from-rose-500 to-orange-500"
            badge={`${EXAM_MINUTES} min`}
            onClick={() => setRequest({ mode: "exam", title: "Exam Mode", topic: null, pool: BANK_KEYS, exam: true })}
          />
          <ModeCard
            icon="xcircle"
            title="Wrong-Answer Practice"
            description={
              wrong.length
                ? `${wrong.length} question${wrong.length === 1 ? "" : "s"} where your latest answer was incorrect.`
                : "No wrong answers yet. Questions you miss will appear here automatically."
            }
            action="Practise mistakes"
            gradient="from-amber-500 to-red-500"
            badge={wrong.length ? `${wrong.length} to review` : undefined}
            disabled={wrong.length === 0}
            onClick={() => setRequest({ mode: "wrong", title: "Wrong-Answer Practice", topic: null, pool: wrong })}
          />
          <ModeCard
            icon="bookmark"
            title="Bookmarks"
            description={
              state.bookmarks.length
                ? `${state.bookmarks.length} saved question${state.bookmarks.length === 1 ? "" : "s"} to revisit.`
                : "Bookmark questions during a session to build a focused review set."
            }
            action="Open bookmarks"
            gradient="from-emerald-500 to-teal-600"
            onClick={() => go({ name: "saved" })}
          />
          <ModeCard
            icon={creator.eligible || state.creatorUnlocked ? "pen" : "lock"}
            title="Personal MCQ Creator"
            description={
              state.creatorUnlocked
                ? `Write your own MCQs. You have ${customCount} saved.`
                : `Unlocks after attempting all ${BANK_SIZE} questions with at least 90% correct.`
            }
            action={state.creatorUnlocked ? "Open creator" : "View requirements"}
            gradient="from-fuchsia-500 to-purple-600"
            badge={state.creatorUnlocked ? "Unlocked" : `${creator.correct}/${creator.required}`}
            onClick={() => go({ name: "creator" })}
          />
        </div>
      </section>

      {/* Recent sessions */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent sessions</h2>
          {sessions > 0 && (
            <button type="button" onClick={() => go({ name: "progress" })} className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
              View all
            </button>
          )}
        </div>
        {sessions === 0 ? (
          <Card className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
              <Icon name="target" className="h-6 w-6" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white">No sessions yet</p>
            <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
              Finish a practice session to see your score, answer review and topic breakdown here.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {state.history.slice(0, 6).map((rec) => (
              <button
                key={rec.id}
                type="button"
                onClick={() => go({ name: "results", id: rec.id })}
                className="group flex items-center gap-4 rounded-3xl border border-white/70 bg-white/80 p-4 text-left shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/[0.08] dark:bg-slate-900/70"
              >
                <Ring fraction={rec.percent / 100} size={52} stroke={6} colorClass={rec.percent >= 90 ? "text-emerald-500" : "text-indigo-500"}>
                  <span className="text-xs font-bold tabular-nums text-slate-800 dark:text-white">{rec.percent}%</span>
                </Ring>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">{rec.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {rec.correct}/{rec.total} correct · {formatDate(rec.endedAt)}
                  </p>
                </div>
                <Icon name="arrowRight" className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        )}
      </section>

      <StartSheet request={request} onClose={() => setRequest(null)} go={go} />
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/12 px-3.5 py-3 backdrop-blur-md">
      <p className="text-lg font-extrabold tabular-nums sm:text-xl">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">{label}</p>
    </div>
  );
}
