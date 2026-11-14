import type { Question } from "../types";
import { BANK_1 } from "./bank-1";
import { BANK_2 } from "./bank-2";
import { BANK_3 } from "./bank-3";

/** The complete 230-question bank, in sheet order (Q1–Q230). */
export const BANK: Question[] = [...BANK_1, ...BANK_2, ...BANK_3].sort((a, b) => a.id - b.id);

/** Total number of questions in the official bank. */
export const BANK_SIZE = BANK.length;

/** Required score (fraction) to unlock the personal MCQ creator. */
export const CREATOR_THRESHOLD = 0.9;
