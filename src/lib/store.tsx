import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ActiveSession, CustomMCQ, Persisted, SessionRecord, Settings, ModeId, TopicId } from "../types";
import { creatorStatus, getItem, pct, TIMER_SECONDS } from "./quiz";

const STORAGE_KEY = "admin-ethics-mcq:v1";
const HISTORY_LIMIT = 60;

export const DEFAULT_STATE: Persisted = {
  version: 1,
  settings: { theme: "system", timer: true },
  latest: {},
  bookmarks: [],
  history: [],
  custom: [],
  creatorUnlocked: false,
  active: null,
};

function loadState(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const p = JSON.parse(raw) as Partial<Persisted>;
    const latest = p.latest && typeof p.latest === "object" ? p.latest : {};
    return {
      ...DEFAULT_STATE,
      ...p,
      settings: { ...DEFAULT_STATE.settings, ...(p.settings ?? {}) },
      latest,
      bookmarks: Array.isArray(p.bookmarks) ? p.bookmarks : [],
      history: Array.isArray(p.history) ? p.history : [],
      custom: Array.isArray(p.custom) ? p.custom : [],
      active: p.active ?? null,
      // The creator stays unlocked once the 230-question / 90% requirement is met.
      creatorUnlocked: !!p.creatorUnlocked || creatorStatus(latest).eligible,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export interface StartConfig {
  mode: ModeId;
  title: string;
  keys: string[];
  topic: TopicId | null;
  timed: boolean;
  examMinutes?: number | null;
}

export interface StoreValue {
  state: Persisted;
  setSettings: (p: Partial<Settings>) => void;
  toggleBookmark: (key: string) => void;
  startSession: (cfg: StartConfig) => string;
  commitAnswer: (choice: number | null, expectedKey: string) => void;
  finishSession: () => void;
  discardSession: () => void;
  addCustom: (text: string, options: string[], correct: number) => string;
  updateCustom: (key: string, text: string, options: string[], correct: number) => void;
  deleteCustom: (key: string) => void;
  resetProgress: () => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** Turns an in-progress session into a finished record and updates per-question progress. */
function finalize(s: Persisted, a: ActiveSession): Persisted {
  const now = Date.now();
  const answers: Record<string, number | null> = {};
  const latest = { ...s.latest };
  let answered = 0;
  let correct = 0;

  for (const k of a.keys) {
    const choice = a.answers[k] ?? null;
    answers[k] = choice;
    if (choice === null) continue;
    answered++;
    const item = getItem(k, s.custom);
    const ok = !!item && item.correct === choice;
    if (ok) correct++;
    latest[k] = { choice, correct: ok, at: now };
  }

  const record: SessionRecord = {
    id: a.id,
    title: a.title,
    mode: a.mode,
    topic: a.topic,
    startedAt: a.startedAt,
    endedAt: now,
    timed: a.timed,
    keys: a.keys,
    answers,
    total: a.keys.length,
    answered,
    correct,
    percent: pct(correct, a.keys.length),
  };

  const creator = creatorStatus(latest);
  return {
    ...s,
    latest,
    active: null,
    history: [record, ...s.history].slice(0, HISTORY_LIMIT),
    creatorUnlocked: s.creatorUnlocked || creator.eligible,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable or full — the app keeps working in memory */
    }
  }, [state]);

  const setSettings = useCallback((p: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...p } }));
  }, []);

  const toggleBookmark = useCallback((key: string) => {
    setState((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(key)
        ? s.bookmarks.filter((k) => k !== key)
        : [key, ...s.bookmarks],
    }));
  }, []);

  const startSession = useCallback((cfg: StartConfig) => {
    const now = Date.now();
    const id = newId();
    const active: ActiveSession = {
      id,
      title: cfg.title,
      mode: cfg.mode,
      topic: cfg.topic,
      startedAt: now,
      keys: cfg.keys,
      index: 0,
      answers: {},
      timed: cfg.timed,
      questionDeadline: cfg.timed ? now + TIMER_SECONDS * 1000 : null,
      examEndsAt: cfg.examMinutes ? now + cfg.examMinutes * 60_000 : null,
    };
    setState((s) => ({ ...s, active }));
    return id;
  }, []);

  const commitAnswer = useCallback((choice: number | null, expectedKey: string) => {
    setState((s) => {
      const a = s.active;
      if (!a || a.keys[a.index] !== expectedKey) return s;
      const answers = { ...a.answers, [expectedKey]: choice };
      const next = a.index + 1;
      if (next >= a.keys.length) return finalize(s, { ...a, answers });
      return {
        ...s,
        active: {
          ...a,
          answers,
          index: next,
          questionDeadline: a.timed ? Date.now() + TIMER_SECONDS * 1000 : null,
        },
      };
    });
  }, []);

  const finishSession = useCallback(() => {
    setState((s) => (s.active ? finalize(s, s.active) : s));
  }, []);

  const discardSession = useCallback(() => {
    setState((s) => ({ ...s, active: null }));
  }, []);

  const addCustom = useCallback((text: string, options: string[], correct: number) => {
    const now = Date.now();
    const key = `c-${newId()}`;
    const item: CustomMCQ = { key, text, options, correct, createdAt: now, updatedAt: now };
    setState((s) => ({ ...s, custom: [...s.custom, item] }));
    return key;
  }, []);

  const updateCustom = useCallback((key: string, text: string, options: string[], correct: number) => {
    setState((s) => ({
      ...s,
      custom: s.custom.map((c) =>
        c.key === key ? { ...c, text, options, correct, updatedAt: Date.now() } : c,
      ),
    }));
  }, []);

  const deleteCustom = useCallback((key: string) => {
    setState((s) => ({
      ...s,
      custom: s.custom.filter((c) => c.key !== key),
      bookmarks: s.bookmarks.filter((k) => k !== key),
      latest: Object.fromEntries(Object.entries(s.latest).filter(([k]) => k !== key)),
      active: s.active && s.active.keys.includes(key) ? null : s.active,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setState((s) => ({
      ...s,
      latest: {},
      history: [],
      bookmarks: [],
      active: null,
      creatorUnlocked: false,
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      setSettings,
      toggleBookmark,
      startSession,
      commitAnswer,
      finishSession,
      discardSession,
      addCustom,
      updateCustom,
      deleteCustom,
      resetProgress,
      resetAll,
    }),
    [
      state,
      setSettings,
      toggleBookmark,
      startSession,
      commitAnswer,
      finishSession,
      discardSession,
      addCustom,
      updateCustom,
      deleteCustom,
      resetProgress,
      resetAll,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
