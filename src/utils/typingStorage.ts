import type { SavedTest } from "../types/typing";

const STORAGE_KEY = "typeflow-typing-history";

// Load saved typing history from localStorage.
export function loadTypingHistory(): SavedTest[] {
  try {
    const storedHistory = localStorage.getItem(STORAGE_KEY);

    if (!storedHistory) {
      return [];
    }

    const parsed: unknown = JSON.parse(storedHistory);

    // Prevent unexpected data from crashing the app.
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is SavedTest => {
      if (typeof item !== "object" || item === null) {
        return false;
      }

      const test = item as Record<string, unknown>;

      return (
        typeof test.id === "string" &&
        typeof test.date === "string" &&
        typeof test.wpm === "number" &&
        Number.isFinite(test.wpm) &&
        typeof test.accuracy === "number" &&
        Number.isFinite(test.accuracy) &&
        typeof test.duration === "number" &&
        Number.isFinite(test.duration) &&
        typeof test.correctCharacters === "number" &&
        typeof test.incorrectCharacters === "number" &&
        Array.isArray(test.performance)
      );
    });
  } catch (error) {
    console.error("Unable to load typing history:", error);
    return [];
  }
}

// Save the full typing history to localStorage.
export function saveTypingHistory(history: SavedTest[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    return true;
  } catch (error) {
    console.error("Unable to save typing history:", error);
    return false;
  }
}
