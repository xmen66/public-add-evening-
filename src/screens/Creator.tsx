import { useState } from "react";
import { useStore } from "../lib/store";
import { BANK_KEYS, creatorStatus, LETTERS } from "../lib/quiz";
import { BANK_SIZE } from "../data";
import { Button, Card, Chip, EmptyState, Icon, IconButton, PageHeader, ProgressBar } from "../components/ui";
import { StartSheet, type PracticeRequest } from "../components/StartSheet";
import { cn } from "../utils/cn";
import type { CustomMCQ, Go } from "../types";

interface Draft {
  text: string;
  options: string[];
  correct: number | null;
}

const emptyDraft = (): Draft => ({ text: "", options: ["", "", "", ""], correct: null });

function validate(d: Draft): string[] {
  const errs: string[] = [];
  if (d.text.trim().length < 8) errs.push("Write a question of at least 8 characters.");
  const opts = d.options.map((o) => o.trim());
  if (opts.some((o) => !o)) errs.push("Fill in all four options.");
  if (new Set(opts.map((o) => o.toLowerCase())).size !== opts.length) errs.push("Options must be different from one another.");
  if (d.correct === null) errs.push("Mark which option is the correct answer.");
  return errs;
}

function Requirement({
  label,
  value,
  total,
  ok,
  threshold,
}: {
  label: string;
  value: number;
  total: number;
  ok: boolean;
  threshold?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        <span className={cn("flex items-center gap-1.5 font-bold tabular-nums", ok ? "text-emerald-600 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400")}>
          {ok && <Icon name="check" className="h-4 w-4" />}
          {value} / {total}
        </span>
      </div>
      <div className="relative">
        <ProgressBar value={value} max={total} barClassName={ok ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-indigo-500 to-violet-500"} />
        {threshold !== undefined && (
          <span
            className="pointer-events-none absolute -top-1 bottom-[-4px] w-0.5 rounded bg-slate-700/60 dark:bg-white/70"
            style={{ left: `${(threshold / total) * 100}%` }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

export default function Creator({ go }: { go: Go }) {
  const { state, addCustom, updateCustom, deleteCustom } = useStore();
  const status = creatorStatus(state.latest);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null); // "new" or an existing key
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<string[]>([]);
  const [request, setRequest] = useState<PracticeRequest | null>(null);

  if (!state.creatorUnlocked) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Locked"
          title="Personal MCQ Creator"
          subtitle="Write and practise your own questions. The creator unlocks once you have shown mastery of the official bank."
        />
        <Card className="space-y-7 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900/[0.06] text-slate-500 dark:bg-white/10 dark:text-slate-300">
              <Icon name="lock" className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Requirements</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Attempt all {BANK_SIZE} questions and score at least 90% ({status.required} correct), judged by your most recent
                answer to each question.
              </p>
            </div>
          </div>

          <Requirement label="Questions attempted" value={status.attempted} total={BANK_SIZE} ok={status.attempted === BANK_SIZE} />
          <Requirement
            label="Correct answers (90% required)"
            value={status.correct}
            total={BANK_SIZE}
            ok={status.correct >= status.required}
            threshold={status.required}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={() => setRequest({ mode: "all", title: "Practice All", topic: null, pool: BANK_KEYS })}>
              Practise all {BANK_SIZE} questions
            </Button>
            <Button variant="secondary" onClick={() => go({ name: "topics" })}>
              Topic practice
            </Button>
          </div>
        </Card>
        <StartSheet request={request} onClose={() => setRequest(null)} go={go} />
      </div>
    );
  }

  const openNew = () => {
    setDraft(emptyDraft());
    setErrors([]);
    setEditing("new");
    setShowForm(true);
  };

  const openEdit = (c: CustomMCQ) => {
    setDraft({ text: c.text, options: [...c.options], correct: c.correct });
    setErrors([]);
    setEditing(c.key);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setErrors([]);
  };

  const save = () => {
    const errs = validate(draft);
    setErrors(errs);
    if (errs.length || draft.correct === null) return;
    const payload = {
      text: draft.text.trim(),
      options: draft.options.map((o) => o.trim()),
      correct: draft.correct,
    };
    if (editing === "new" || editing === null) addCustom(payload.text, payload.options, payload.correct);
    else updateCustom(editing, payload.text, payload.options, payload.correct);
    closeForm();
  };

  const remove = (c: CustomMCQ) => {
    if (window.confirm("Delete this MCQ? This cannot be undone.")) deleteCustom(c.key);
  };

  const setOption = (i: number, value: string) =>
    setDraft((d) => ({ ...d, options: d.options.map((o, idx) => (idx === i ? value : o)) }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Unlocked"
        title="Personal MCQ Creator"
        subtitle="Write your own multiple-choice questions, mark the correct option, and practise them alongside the official bank."
        action={
          !showForm ? (
            <Button onClick={openNew}>
              <Icon name="plus" className="h-4 w-4" />
              New MCQ
            </Button>
          ) : undefined
        }
      />

      {showForm && (
        <Card className="animate-fade-up space-y-6 p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editing === "new" ? "New question" : "Edit question"}</h2>
            <IconButton label="Cancel" onClick={closeForm}>
              <Icon name="x" />
            </IconButton>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Question</span>
            <textarea
              value={draft.text}
              onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
              rows={3}
              maxLength={600}
              placeholder="Type the question stem…"
              className="w-full resize-y rounded-2xl border border-slate-200 bg-white/80 p-4 text-[0.95rem] leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Options</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Tap the letter to mark the correct answer</span>
            </div>
            {draft.options.map((opt, i) => {
              const isCorrect = draft.correct === i;
              return (
                <div key={i} className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-pressed={isCorrect}
                    aria-label={`Mark option ${LETTERS[i]} as correct`}
                    onClick={() => setDraft((d) => ({ ...d, correct: i }))}
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold transition duration-200 active:scale-95",
                      isCorrect
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-slate-900/[0.06] text-slate-600 hover:bg-slate-900/10 dark:bg-white/10 dark:text-slate-300",
                    )}
                  >
                    {LETTERS[i]}
                  </button>
                  <input
                    value={opt}
                    maxLength={300}
                    onChange={(e) => setOption(i, e.target.value)}
                    placeholder={`Option ${LETTERS[i]}`}
                    className="min-h-11 flex-1 rounded-2xl border border-slate-200 bg-white/80 px-4 text-[0.95rem] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
                  />
                </div>
              );
            })}
          </div>

          {errors.length > 0 && (
            <ul className="space-y-1 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
              {errors.map((e) => (
                <li key={e} className="flex items-start gap-2">
                  <Icon name="alert" className="mt-0.5 h-4 w-4" />
                  {e}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
            <Button onClick={save}>{editing === "new" ? "Save question" : "Save changes"}</Button>
          </div>
        </Card>
      )}

      {state.custom.length === 0 && !showForm ? (
        <EmptyState
          icon="pen"
          title="No personal MCQs yet"
          text="Create your first question. Saved questions appear in Topics and can be practised in their own session."
          action={<Button onClick={openNew}>Create a question</Button>}
        />
      ) : (
        <div className="space-y-4">
          {state.custom.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {state.custom.length} personal question{state.custom.length === 1 ? "" : "s"}
              </p>
              <Button
                variant="soft"
                onClick={() =>
                  setRequest({
                    mode: "custom",
                    title: "My MCQs",
                    topic: null,
                    pool: state.custom.map((c) => c.key),
                  })
                }
              >
                <Icon name="play" className="h-4 w-4" />
                Practise my MCQs
              </Button>
            </div>
          )}
          {state.custom.map((c, idx) => (
            <Card key={c.key} className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="violet">MCQ {idx + 1}</Chip>
                  <Chip tone="emerald">Answer: {LETTERS[c.correct]}</Chip>
                </div>
                <div className="flex shrink-0 gap-1">
                  <IconButton label="Edit question" onClick={() => openEdit(c)}>
                    <Icon name="edit" />
                  </IconButton>
                  <IconButton label="Delete question" onClick={() => remove(c)} className="text-rose-600 hover:bg-rose-500/10 dark:text-rose-300">
                    <Icon name="trash" />
                  </IconButton>
                </div>
              </div>
              <p className="font-medium leading-relaxed text-slate-900 dark:text-slate-50">{c.text}</p>
              <ol className="grid gap-2 sm:grid-cols-2">
                {c.options.map((o, i) => (
                  <li
                    key={i}
                    className={cn(
                      "flex items-start gap-2.5 rounded-xl border px-3 py-2 text-sm",
                      i === c.correct
                        ? "border-emerald-400/60 bg-emerald-50/70 text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-100"
                        : "border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300",
                    )}
                  >
                    <span className="font-bold">{LETTERS[i]}.</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </div>
      )}

      <StartSheet request={request} onClose={() => setRequest(null)} go={go} />
    </div>
  );
}
