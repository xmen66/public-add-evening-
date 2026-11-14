export type TopicId =
  | "mental"
  | "virtues"
  | "codes"
  | "complexity"
  | "judgment"
  | "education"
  | "islamic"
  | "session1"
  | "publicinterest"
  | "wakefield"
  | "distinct";

export type Difficulty = "easy" | "medium" | "hard" | null;
export type Letter = "A" | "B" | "C" | "D";
export type Quad = [string, string, string, string];

/** A question exactly as provided in the question bank (answer as a letter). */
export interface Question {
  id: number;
  topic: TopicId;
  difficulty: Difficulty;
  highProb: boolean;
  text: string;
  options: Quad;
  answer: Letter;
}

/** Unified shape used by the app for bank questions and personal MCQs. */
export interface Item {
  key: string;
  topic: TopicId | "custom";
  difficulty: Difficulty;
  highProb: boolean;
  text: string;
  options: string[];
  correct: number;
  custom: boolean;
}

/** A personal MCQ created by the user. */
export interface CustomMCQ {
  key: string;
  text: string;
  options: string[];
  correct: number;
  createdAt: number;
  updatedAt: number;
}

export type ThemeSetting = "light" | "dark" | "system";

export type ModeId = "all" | "topic" | "exam" | "missed" | "wrong" | "saved" | "custom";

export interface Settings {
  theme: ThemeSetting;
  timer: boolean;
}

export interface LatestAnswer {
  choice: number;
  correct: boolean;
  at: number;
}

/** A session that is in progress (persisted so it can be resumed). */
export interface ActiveSession {
  id: string;
  title: string;
  mode: ModeId;
  topic: TopicId | null;
  startedAt: number;
  keys: string[];
  index: number;
  answers: Record<string, number | null>;
  timed: boolean;
  questionDeadline: number | null;
  examEndsAt: number | null;
}

/** A completed session kept in history. */
export interface SessionRecord {
  id: string;
  title: string;
  mode: ModeId;
  topic: TopicId | null;
  startedAt: number;
  endedAt: number;
  timed: boolean;
  keys: string[];
  answers: Record<string, number | null>;
  total: number;
  answered: number;
  correct: number;
  percent: number;
}

export interface Persisted {
  version: 1;
  settings: Settings;
  latest: Record<string, LatestAnswer>;
  bookmarks: string[];
  history: SessionRecord[];
  custom: CustomMCQ[];
  creatorUnlocked: boolean;
  active: ActiveSession | null;
}

/** Screens of the app (the app uses in-memory navigation, no URL router). */
export type View =
  | { name: "home" }
  | { name: "topics" }
  | { name: "saved" }
  | { name: "progress" }
  | { name: "creator" }
  | { name: "settings" }
  | { name: "session" }
  | { name: "results"; id: string };

export type Go = (view: View) => void;
