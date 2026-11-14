import { BANK, BANK_SIZE, CREATOR_THRESHOLD } from "../data";
import { TOPICS } from "../data/topics";
import type { CustomMCQ, Item, LatestAnswer, ModeId, SessionRecord, TopicId } from "../types";

export const TIMER_SECONDS = 30;
export const EXAM_MINUTES = 90;
export const EXAM_QUESTIONS = 90;
export const LETTERS = ["A", "B", "C", "D"] as const;

/** Bank questions converted to the unified Item shape. Keys look like "q12". */
export const BANK_ITEMS: Item[] = BANK.map((qn) => ({
  key: `q${qn.id}`,
  topic: qn.topic,
  difficulty: qn.difficulty,
  highProb: qn.highProb,
  text: qn.text,
  options: [...qn.options],
  correct: LETTERS.indexOf(qn.answer),
  custom: false,
}));

export const BANK_KEYS: string[] = BANK_ITEMS.map((i) => i.key);
const BANK_MAP = new Map<string, Item>(BANK_ITEMS.map((i) => [i.key, i]));

export function bankNumber(key: string): number | null {
  return key.startsWith("q") ? Number(key.slice(1)) : null;
}

export function isBankKey(key: string): boolean {
  return BANK_MAP.has(key);
}

export function customToItem(c: CustomMCQ): Item {
  return {
    key: c.key,
    topic: "custom",
    difficulty: null,
    highProb: false,
    text: c.text,
    options: c.options,
    correct: c.correct,
    custom: true,
  };
}

export function getItem(key: string, custom: CustomMCQ[]): Item | undefined {
  const bank = BANK_MAP.get(key);
  if (bank) return bank;
  const mine = custom.find((c) => c.key === key);
  return mine ? customToItem(mine) : undefined;
}

export function keysForTopic(topic: TopicId): string[] {
  return BANK_ITEMS.filter((i) => i.topic === topic).map((i) => i.key);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pct(n: number, d: number): number {
  return d > 0 ? Math.round((n / d) * 100) : 0;
}

export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${r}s`;
  return `${r}s`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Progress over a set of keys, based on each question's latest recorded answer. */
export function progressFor(latest: Record<string, LatestAnswer>, keys: string[]) {
  let attempted = 0;
  let correct = 0;
  for (const k of keys) {
    const l = latest[k];
    if (l) {
      attempted++;
      if (l.correct) correct++;
    }
  }
  return { total: keys.length, attempted, correct, accuracy: pct(correct, attempted) };
}

/** Personal MCQ creator gate: all 230 bank questions attempted and >= 90% correct (latest answers). */
export function creatorStatus(latest: Record<string, LatestAnswer>) {
  const p = progressFor(latest, BANK_KEYS);
  const required = Math.ceil(BANK_SIZE * CREATOR_THRESHOLD);
  const eligible = p.attempted === BANK_SIZE && p.correct >= required;
  return {
    attempted: p.attempted,
    correct: p.correct,
    required,
    total: BANK_SIZE,
    eligible,
    percent: pct(p.correct, BANK_SIZE),
  };
}

/** Keys whose most recent answer was incorrect (bank and personal MCQs). */
export function wrongKeys(latest: Record<string, LatestAnswer>, custom: CustomMCQ[]): string[] {
  const bank = BANK_KEYS.filter((k) => latest[k] && !latest[k].correct);
  const mine = custom.map((c) => c.key).filter((k) => latest[k] && !latest[k].correct);
  return [...bank, ...mine];
}

/** Questions a finished session got wrong or left unanswered. */
export function missedKeysFromRecord(rec: SessionRecord, custom: CustomMCQ[]): string[] {
  return rec.keys.filter((k) => {
    const choice = rec.answers[k];
    const item = getItem(k, custom);
    return !item || choice === null || choice === undefined || choice !== item.correct;
  });
}

export const MODE_LABEL: Record<ModeId, string> = {
  all: "Practice All",
  topic: "Topic Practice",
  exam: "Exam Mode",
  missed: "Missed Questions",
  wrong: "Wrong-Answer Practice",
  saved: "Bookmarks",
  custom: "My MCQs",
};

export function topicName(topic: TopicId | "custom" | null): string {
  if (!topic) return "";
  if (topic === "custom") return "My MCQs";
  return TOPICS.find((t) => t.id === topic)?.name ?? "";
}

export function topicShort(topic: TopicId | "custom"): string {
  if (topic === "custom") return "My MCQs";
  return TOPICS.find((t) => t.id === topic)?.short ?? "";
}

export const DIFFICULTY_LABEL = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
} as const;
