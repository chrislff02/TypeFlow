import type { Difficulty } from "./generateWords";
import type { TestMode } from "../types/typing";

export type Theme = "dark" | "light";

export interface UserPreferences {
  theme: Theme;
  testMode: TestMode;
  duration: number;
  wordCount: number;
  difficulty: Difficulty;
}

const STORAGE_KEY = "typeflow-preferences";

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "dark",
  testMode: "time",
  duration: 30,
  wordCount: 25,
  difficulty: "medium",
};

const VALID_DURATIONS = [15, 30, 60, 120];
const VALID_WORD_COUNTS = [10, 25, 50, 100];

// Load and validate previously saved preferences.
export function loadPreferences(): UserPreferences {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return { ...DEFAULT_PREFERENCES };
    }

    const parsed: unknown = JSON.parse(saved);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return { ...DEFAULT_PREFERENCES };
    }

    const data = parsed as Record<string, unknown>;

    return {
      theme: data.theme === "light" ? "light" : "dark",

      testMode: data.testMode === "words" ? "words" : "time",

      duration:
        typeof data.duration === "number" &&
        VALID_DURATIONS.includes(data.duration)
          ? data.duration
          : DEFAULT_PREFERENCES.duration,

      wordCount:
        typeof data.wordCount === "number" &&
        VALID_WORD_COUNTS.includes(data.wordCount)
          ? data.wordCount
          : DEFAULT_PREFERENCES.wordCount,

      difficulty:
        data.difficulty === "easy" ||
        data.difficulty === "medium" ||
        data.difficulty === "hard"
          ? data.difficulty
          : DEFAULT_PREFERENCES.difficulty,
    };
  } catch (error) {
    console.error("Unable to load preferences:", error);
    return { ...DEFAULT_PREFERENCES };
  }
}

// Save preferences to browser storage.
export function savePreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error("Unable to save preferences:", error);
  }
}
