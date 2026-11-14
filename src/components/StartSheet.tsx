import { useMemo, useState } from "react";
import { Button, Segmented, Sheet } from "./ui";
import { useStore } from "../lib/store";
import { EXAM_MINUTES, EXAM_QUESTIONS, MODE_LABEL, shuffle, TIMER_SECONDS } from "../lib/quiz";
import type { Go, ModeId, TopicId } from "../types";

/** A practice request: which pool of questions to draw from, and how. */
export interface PracticeRequest {
  mode: ModeId;
  title: string;
  topic: TopicId | null;
  pool: string[];
  /** Exam mode: fixed size, shuffled, 90-minute overall timer. */
  exam?: boolean;
}

/** Returns a function that starts a session from a request, confirming before replacing one in progress. */
export function useBegin(go: Go) {
  const { state, startSession } = useStore();
  return (req: PracticeRequest, count: number, shuffled: boolean) => {
    if (state.active && !window.confirm("A session is already in progress. Starting a new one will discard it. Continue?")) {
      return;
    }
    const ordered = shuffled ? shuffle(req.pool) : req.pool;
    const keys = ordered.slice(0, Math.max(1, Math.min(count, ordered.length)));
    startSession({
      mode: req.mode,
      title: req.title,
      keys,
      topic: req.topic,
      timed: !!req.exam || state.settings.timer,
      examMinutes: req.exam ? EXAM_MINUTES : null,
    });
    go({ name: "session" });
  };
}

export function StartSheet({
  request,
  onClose,
  go,
}: {
  request: PracticeRequest | null;
  onClose: () => void;
  go: Go;
}) {
  const { state } = useStore();
  const begin = useBegin(go);
  const total = request?.pool.length ?? 0;

  const counts = useMemo(() => {
    const base = [10, 20, 50, 100].filter((n) => n < total);
    return [...base, total];
  }, [total]);

  const [count, setCount] = useState<number>(total);
  const [order, setOrder] = useState<"shuffle" | "ordered">("shuffle");

  // Keep the chosen count valid when the pool changes.
  const effectiveCount = counts.includes(count) ? count : total;

  if (!request) return null;
  const isExam = !!request.exam;
  const size = isExam ? Math.min(EXAM_QUESTIONS, total) : effectiveCount;

  const start = () => {
    begin(request, size, isExam ? true : order === "shuffle");
    onClose();
  };

  return (
    <Sheet open={!!request} onClose={onClose} title={request.title}>
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {isExam
            ? `${EXAM_QUESTIONS} questions drawn at random from the full bank. You have ${EXAM_MINUTES} minutes overall, and each question has a ${TIMER_SECONDS}-second timer. Answers are only revealed after you submit.`
            : `${MODE_LABEL[request.mode]} · ${total} question${total === 1 ? "" : "s"} available. Answers are only revealed after you finish the session.`}
        </p>

        {!isExam && (
          <>
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">How many questions?</p>
              <div className="flex flex-wrap gap-2">
                {counts.map((n) => {
                  const on = effectiveCount === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(n)}
                      className={
                        "min-h-11 rounded-2xl px-4 text-sm font-semibold transition duration-200 active:scale-95 " +
                        (on
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                          : "bg-slate-900/[0.06] text-slate-700 hover:bg-slate-900/10 dark:bg-white/10 dark:text-slate-200")
                      }
                    >
                      {n === total ? `All (${n})` : n}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Order</p>
              <Segmented
                value={order}
                onChange={setOrder}
                options={[
                  { value: "shuffle", label: "Shuffled", icon: "shuffle" },
                  { value: "ordered", label: "In order", icon: "list" },
                ]}
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-2.5 rounded-2xl bg-slate-900/[0.04] p-4 text-sm dark:bg-white/[0.05]">
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Questions this session</span>
            <span className="font-semibold text-slate-900 dark:text-white">{size}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Per-question timer</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {isExam || state.settings.timer ? `${TIMER_SECONDS} seconds` : "Off"}
            </span>
          </div>
          {isExam && (
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Overall time limit</span>
              <span className="font-semibold text-slate-900 dark:text-white">{EXAM_MINUTES} minutes</span>
            </div>
          )}
        </div>

        <Button block size="lg" onClick={start} disabled={total === 0}>
          Start session
        </Button>
      </div>
    </Sheet>
  );
}
