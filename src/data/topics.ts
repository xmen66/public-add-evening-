import type { Difficulty, Letter, Question, Quad, TopicId } from "../types";

export interface TopicInfo {
  id: TopicId;
  name: string;
  short: string;
  range: [number, number];
  accent: string;
}

/** Topic sections of the question bank, with the question-number ranges they cover. */
export const TOPICS: TopicInfo[] = [
  { id: "mental", name: "Bailey's Mental Attitudes", short: "Mental Attitudes", range: [1, 19], accent: "from-violet-500 to-indigo-600" },
  { id: "virtues", name: "Bailey's Operating Virtues", short: "Operating Virtues", range: [20, 34], accent: "from-sky-500 to-blue-600" },
  { id: "codes", name: "Codes of Ethics and Their Limits", short: "Codes & Limits", range: [35, 44], accent: "from-teal-500 to-emerald-600" },
  { id: "complexity", name: "Complexity and Institutional Trends", short: "Complexity", range: [45, 57], accent: "from-amber-500 to-orange-600" },
  { id: "judgment", name: "Ethical Judgment and Decision Frameworks", short: "Judgment & Frameworks", range: [58, 89], accent: "from-rose-500 to-pink-600" },
  { id: "education", name: "Ethics Education", short: "Ethics Education", range: [90, 115], accent: "from-fuchsia-500 to-purple-600" },
  { id: "islamic", name: "Islamic Values in Administration", short: "Islamic Values", range: [116, 159], accent: "from-emerald-500 to-green-600" },
  { id: "session1", name: "Session 1: Foundations of Ethical Judgment", short: "Foundations", range: [160, 179], accent: "from-cyan-500 to-sky-600" },
  { id: "publicinterest", name: "The Public Interest", short: "Public Interest", range: [180, 189], accent: "from-lime-500 to-green-700" },
  { id: "wakefield", name: "Wakefield's Thesis: Individual Responsibility", short: "Individual Responsibility", range: [190, 218], accent: "from-indigo-500 to-blue-700" },
  { id: "distinct", name: "Why Public Service Is Ethically Distinct", short: "Public Service", range: [219, 230], accent: "from-orange-500 to-red-600" },
];

export const TOPIC_BY_ID: Record<TopicId, TopicInfo> = TOPICS.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<TopicId, TopicInfo>,
);

/** Compact constructor used by the question bank files. */
export function q(
  id: number,
  topic: TopicId,
  difficulty: Difficulty,
  highProb: boolean,
  text: string,
  options: Quad,
  answer: Letter,
): Question {
  return { id, topic, difficulty, highProb, text, options, answer };
}
