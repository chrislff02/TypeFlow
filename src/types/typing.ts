export type TestMode = "time" | "words";

export interface PerformancePoint {
  second: number;
  wpm: number;
  accuracy: number;
}

export interface TestResult {
  wpm: number;
  accuracy: number;
  correctCharacters: number;
  incorrectCharacters: number;
  duration: number;
  performance: PerformancePoint[];

  // Optional for compatibility with previously saved tests.
  mode?: TestMode;
  wordCount?: number;
}

export interface SavedTest extends TestResult {
  id: string;
  date: string;
}
