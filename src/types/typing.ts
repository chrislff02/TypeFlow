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
}
