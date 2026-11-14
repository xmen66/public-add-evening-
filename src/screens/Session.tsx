import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../lib/store";
import { DIFFICULTY_LABEL, formatClock, getItem, LETTERS, TIMER_SECONDS, topicShort } from "../lib/quiz";
import { Button, Card, Chip, Icon, IconButton, ProgressBar, Ring, Sheet } from "../components/ui";
import { cn } from "../utils/cn";
import type { Go, Item } from "../types";

interface QuestionViewProps {
  item: Item;
  number: number;
  total: number;
  deadline: number | null;
  timed: boolean;
  bookmarked: boolean;
  isLast: boolean;
  onCommit: (choice: number | null) => void;
  onToggleBookmark: () => void;
}

/**
 * One question on screen. Remounted for every question (keyed by index), so local
 * selection and the per-question timer reset cleanly. Correct answers are never shown here.
 */
function QuestionView({
  item,
  number,
  total,
  deadline,
  timed,
  bookmarked,
  isLast,
  onCommit,
  onToggleBookmark,
}: QuestionViewProps) {
  const [sel, setSel] = useState<number | null>(null);
  const selRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const [left, setLeft] = useState(TIMER_SECONDS);
  const cbRef = useRef(onCommit);

  useEffect(() => {
    cbRef.current = onCommit;
  });

  const commit = useCallback((choice: number | null) => {
    if (doneRef.current) return;
    doneRef.current = true;
    cbRef.current(choice);
  }, []);

  const pick = useCallback((i: number) => {
    if (doneRef.current) return;
    selRef.current = i;
    setSel(i);
    navigator.vibrate?.(8);
  }, []);

  // Per-question countdown based on an absolute deadline (survives reloads and background tabs).
  useEffect(() => {
    if (!timed || deadline == null) return;
    const tick = () => {
      const ms = deadline - Date.now();
      setLeft(Math.max(0, ms / 1000));
      if (ms <= 0) commit(selRef.current);
    };
    tick();
    const t = window.setInterval(tick, 200);
    return () => window.clearInterval(t);
  }, [timed, deadline, commit]);

  // Keyboard: 1–4 or A–D to choose, Enter to continue.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const letterIdx = ["a", "b", "c", "d"].indexOf(k);
      const numIdx = ["1", "2", "3", "4"].indexOf(k);
      const i = letterIdx >= 0 ? letterIdx : numIdx;
      if (i >= 0 && i < item.options.length) pick(i);
      if (e.key === "Enter" && selRef.current !== null) commit(selRef.current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item.options.length, pick, commit]);

  const warn = timed && left <= 10;
  const diffTone = item.difficulty === "hard" ? "rose" : item.difficulty === "medium" ? "amber" : "emerald";

  return (
    <div className="animate-slide-in">
      <Card className="space-y-6 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Chip tone="indigo">
              {number} / {total}
            </Chip>
            {item.custom ? <Chip tone="violet">My MCQ</Chip> : <Chip tone="sky">{topicShort(item.topic)}</Chip>}
            {item.difficulty && <Chip tone={diffTone}>{DIFFICULTY_LABEL[item.difficulty]}</Chip>}
            {item.highProb && (
              <Chip tone="amber">
                <Icon name="star" className="h-3 w-3" />
                High probability
              </Chip>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {timed && deadline != null && (
              <Ring
                fraction={left / TIMER_SECONDS}
                size={52}
                stroke={5}
                colorClass={warn ? "text-rose-500" : "text-indigo-500"}
              >
                <span
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    warn ? "text-rose-600 dark:text-rose-300" : "text-slate-800 dark:text-white",
                  )}
                  aria-live="off"
                >
                  {Math.ceil(left)}
                </span>
              </Ring>
            )}
            <IconButton
              label={bookmarked ? "Remove bookmark" : "Bookmark question"}
              onClick={onToggleBookmark}
              className={bookmarked ? "text-amber-500 dark:text-amber-300" : undefined}
            >
              <Icon name="bookmark" className={cn(bookmarked && "fill-current")} />
            </IconButton>
          </div>
        </div>

        <p className="text-lg font-medium leading-relaxed text-slate-900 sm:text-xl dark:text-slate-50">{item.text}</p>

        <div role="radiogroup" aria-label="Answer options" className="grid gap-3">
          {item.options.map((opt, i) => {
            const on = sel === i;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => pick(i)}
                className={cn(
                  "group flex min-h-14 w-full items-start gap-3.5 rounded-2xl border-2 p-3.5 text-left text-[0.95rem] leading-relaxed transition duration-200 active:scale-[0.99]",
                  on
                    ? "border-indigo-500 bg-indigo-50 text-indigo-950 shadow-md shadow-indigo-500/10 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-white"
                    : "border-slate-200 bg-white/70 text-slate-800 hover:border-indigo-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100 dark:hover:border-indigo-400/50 dark:hover:bg-white/[0.06]",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition duration-200",
                    on
                      ? "scale-105 bg-indigo-600 text-white"
                      : "bg-slate-900/[0.06] text-slate-600 group-hover:bg-indigo-100 dark:bg-white/10 dark:text-slate-300",
                  )}
                >
                  {LETTERS[i]}
                </span>
                <span className="pt-1">{opt}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button variant="secondary" className="shrink-0" onClick={() => commit(null)}>
            <Icon name="skip" className="h-4 w-4" />
            Skip
          </Button>
          <Button className="flex-1" disabled={sel === null} onClick={() => commit(sel)}>
            {isLast ? "Finish session" : "Next question"}
            <Icon name="arrowRight" className="h-4 w-4" />
          </Button>
        </div>
      </Card>
      <p className="mt-3 hidden text-center text-xs text-slate-400 sm:block">
        Keys: 1–4 or A–D to choose · Enter to continue
      </p>
    </div>
  );
}

export default function Session({ go }: { go: Go }) {
  const { state, commitAnswer, finishSession, toggleBookmark } = useStore();
  const a = state.active;
  const [confirm, setConfirm] = useState<"exit" | "end" | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const examEndsAt = a?.examEndsAt ?? null;
  const sessionId = a?.id ?? null;

  const finishAndView = useCallback(() => {
    if (!sessionId) return;
    finishSession();
    go({ name: "results", id: sessionId });
  }, [sessionId, finishSession, go]);

  const finishRef = useRef(finishAndView);
  useEffect(() => {
    finishRef.current = finishAndView;
  });

  // Overall exam clock: when it runs out, the session is submitted automatically.
  useEffect(() => {
    if (examEndsAt == null) return;
    const tick = () => {
      const n = Date.now();
      setNow(n);
      if (n >= examEndsAt) finishRef.current();
    };
    tick();
    const t = window.setInterval(tick, 500);
    return () => window.clearInterval(t);
  }, [examEndsAt]);

  if (!a) {
    return (
      <Card className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="font-semibold text-slate-900 dark:text-white">No session in progress</p>
        <Button onClick={() => go({ name: "home" })}>Back to home</Button>
      </Card>
    );
  }

  const total = a.keys.length;
  const key = a.keys[a.index];
  const item = getItem(key, state.custom);
  const isLast = a.index === total - 1;
  const remainingSec = examEndsAt != null ? Math.max(0, (examEndsAt - now) / 1000) : 0;
  const examWarn = examEndsAt != null && remainingSec <= 300;

  const handleCommit = (choice: number | null) => {
    commitAnswer(choice, key);
    if (isLast) go({ name: "results", id: a.id });
  };

  return (
    <div className="flex min-h-dvh flex-col pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <div className="sticky top-0 z-20 border-b border-slate-200/60 bg-slate-50/85 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-xl dark:border-white/[0.06] dark:bg-slate-950/80">
      <div className="mx-auto max-w-3xl px-4 pb-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <IconButton label="Pause and exit" onClick={() => setConfirm("exit")}>
            <Icon name="x" />
          </IconButton>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{a.title}</p>
            <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
              {a.index + 1} <span className="font-medium text-slate-400">of {total}</span>
            </p>
          </div>
          {examEndsAt != null && (
            <Chip tone={examWarn ? "rose" : "indigo"} className="tabular-nums">
              <Icon name="clock" className="h-3.5 w-3.5" />
              {formatClock(remainingSec)}
            </Chip>
          )}
          <Button size="sm" variant="ghost" onClick={() => setConfirm("end")}>
            End
          </Button>
        </div>
        <ProgressBar className="mt-3" value={a.index} max={total} />
      </div>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pt-3 sm:px-6">
        {item ? (
          <QuestionView
            key={`${a.id}-${a.index}`}
            item={item}
            number={a.index + 1}
            total={total}
            deadline={a.questionDeadline}
            timed={a.timed}
            bookmarked={state.bookmarks.includes(key)}
            isLast={isLast}
            onCommit={handleCommit}
            onToggleBookmark={() => toggleBookmark(key)}
          />
        ) : (
          <Card className="space-y-4 text-center">
            <p className="font-semibold text-slate-900 dark:text-white">This personal question is no longer available.</p>
            <Button onClick={() => handleCommit(null)}>Continue</Button>
          </Card>
        )}
      </div>

      <Sheet open={confirm === "exit"} onClose={() => setConfirm(null)} title="Pause this session?">
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Your answers so far are saved. You can resume this session from the home screen at any time.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" size="lg" onClick={() => setConfirm(null)}>
              Keep practising
            </Button>
            <Button
              size="lg"
              onClick={() => {
                setConfirm(null);
                go({ name: "home" });
              }}
            >
              Pause &amp; exit
            </Button>
          </div>
        </div>
      </Sheet>

      <Sheet open={confirm === "end"} onClose={() => setConfirm(null)} title="End and submit?">
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Questions you have not answered will count as incorrect. You will then see your score and the full answer review.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" size="lg" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setConfirm(null);
                finishAndView();
              }}
            >
              End &amp; view results
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
