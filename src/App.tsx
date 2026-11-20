import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  RotateCcw,
  History as HistoryIcon,
  Moon,
  Sun,
} from "lucide-react";
import TypingText from "./components/TypingText";
import Results from "./components/Results";
import { generateWords, type Difficulty } from "./utils/generateWords";
import type { PerformancePoint, TestResult, TestMode } from "./types/typing";
import History from "./components/History";
import { loadTypingHistory, saveTypingHistory } from "./utils/typingStorage";

import type { SavedTest } from "./types/typing";

import { loadPreferences, savePreferences } from "./utils/preferencesStorage";

const TEST_DURATIONS = [15, 30, 60, 120];

const WORD_COUNTS = [10, 25, 50, 100];

// Generate text based on the selected test mode.
function createTestText(
  mode: TestMode,
  count: number,
  difficulty: Difficulty,
): string {
  if (mode === "words") {
    return generateWords(count, difficulty);
  }

  // Timed tests begin with 80 words.
  return generateWords(80, difficulty);
}

function App() {
  // Load saved settings when TypeFlow starts.
  const [preferences, setPreferences] = useState(loadPreferences);

  // Read the selected preferences.
  const { theme, testMode, duration, wordCount, difficulty } = preferences;

  // Generate text using the saved test settings.
  const [text, setText] = useState(() =>
    createTestText(
      preferences.testMode,
      preferences.wordCount,
      preferences.difficulty,
    ),
  );

  // User input and reset state.
  const [typedText, setTypedText] = useState("");
  const [resetKey, setResetKey] = useState(0);

  // Timer state.
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Store typing speed and accuracy throughout the test.
  const [performance, setPerformance] = useState<PerformancePoint[]>([]);

  // Saved typing history, loaded when the app starts.
  const [history, setHistory] = useState<SavedTest[]>(loadTypingHistory);

  // Current page: typing test or history.
  const [currentPage, setCurrentPage] = useState<"test" | "history">("test");

  // Prevent saving the same test more than once.
  const hasSavedResult = useRef(false);

  // Track whether Tab is being held for keyboard shortcuts.
  const tabHeld = useRef(false);

  // Track whether browser storage is available.
  const [storageError, setStorageError] = useState(false);

  const isRunning = startTime !== null && !isFinished;

  // Update React state and persist typing history.
  const updateHistory = (updatedHistory: SavedTest[]) => {
    const saved = saveTypingHistory(updatedHistory);

    setHistory(updatedHistory);
    setStorageError(!saved);
  };

  // Timer and performance sampling for both test modes.
  useEffect(() => {
    if (!isRunning || startTime === null) return;

    const interval = window.setInterval(() => {
      const rawElapsed = Date.now() - startTime;

      // Timed tests stop at the selected duration.
      // Word-count tests continue until all words are typed.
      const elapsed =
        testMode === "time"
          ? Math.min(rawElapsed, duration * 1000)
          : rawElapsed;

      setElapsedMs(elapsed);

      const currentSecond = Math.floor(elapsed / 1000);

      // Record typing performance every completed second.
      if (currentSecond >= 1) {
        const correct = typedText
          .split("")
          .filter((character, index) => character === text[index]).length;

        const currentWpm = Math.round((correct / 5 / currentSecond) * 60);

        const currentAccuracy =
          typedText.length > 0
            ? Math.round((correct / typedText.length) * 100)
            : 100;

        setPerformance((previous) => {
          const lastSecond = previous[previous.length - 1]?.second ?? 0;

          if (currentSecond <= lastSecond) {
            return previous;
          }

          return [
            ...previous,
            {
              second: currentSecond,
              wpm: currentWpm,
              accuracy: currentAccuracy,
            },
          ];
        });
      }

      // Only timed tests finish when the countdown expires.
      if (testMode === "time" && elapsed >= duration * 1000) {
        setIsFinished(true);
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [isRunning, startTime, duration, testMode, typedText, text]);

  // Persist user preferences to localStorage.
  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  // Handle typing for timed and word-count tests.
  const handleTyping = (value: string) => {
    if (isFinished) return;

    // Prevent input after a timed-test deadline.
    if (
      testMode === "time" &&
      startTime !== null &&
      Date.now() - startTime >= duration * 1000
    ) {
      setElapsedMs(duration * 1000);
      setIsFinished(true);
      return;
    }

    // Start the timer on the first character.
    const now = Date.now();

    if (startTime === null && value.length > 0) {
      setStartTime(now);
    }

    setTypedText(value);

    // WORD-COUNT MODE:
    // Finish when the final character has been entered.
    if (testMode === "words" && value.length === text.length) {
      const elapsed = now - (startTime ?? now);

      setElapsedMs(Math.max(elapsed, 1));
      setIsFinished(true);
      return;
    }

    // TIMED MODE:
    // Generate additional words when running low.
    if (testMode === "time") {
      const remainingCharacters = text.length - value.length;

      if (remainingCharacters < 150) {
        setText((previous) => `${previous} ${generateWords(50, difficulty)}`);
      }
    }
  };

  // Count correct characters.
  const correctCharacters = typedText
    .split("")
    .filter((character, index) => character === text[index]).length;

  // Count incorrect characters.
  const incorrectCharacters = typedText.length - correctCharacters;

  // Calculate accuracy.
  const accuracy =
    typedText.length > 0
      ? Math.round((correctCharacters / typedText.length) * 100)
      : 100;

  // Calculate WPM.
  const elapsedMinutes = Math.max(elapsedMs, 1000) / 60000;

  const wpm =
    startTime !== null ? Math.round(correctCharacters / 5 / elapsedMinutes) : 0;

  // Calculate remaining time.
  const timeLeft = Math.max(0, Math.ceil((duration * 1000 - elapsedMs) / 1000));

  // Display elapsed seconds for word-count tests.
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  // Track how many words have been reached.
  const wordsCompleted =
    typedText.length === 0 ? 0 : typedText.trim().split(/\s+/).length;

  // Show completed words without exceeding the target.
  const wordProgress = Math.min(wordsCompleted, wordCount);

  // Prepare the completed test results.
  const result: TestResult = {
    wpm,
    accuracy,
    correctCharacters,
    incorrectCharacters,

    // Timed tests use the selected duration.
    // Word tests use their actual completion time.
    duration: testMode === "time" ? duration : Math.ceil(elapsedMs / 1000),

    performance,
    mode: testMode,
    wordCount: testMode === "words" ? wordCount : undefined,
  };

  // Save each completed test only once.
  useEffect(() => {
    if (!isFinished || hasSavedResult.current) {
      return;
    }

    hasSavedResult.current = true;

    const savedTest: SavedTest = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      wpm,
      accuracy,
      correctCharacters,
      incorrectCharacters,
      duration: testMode === "time" ? duration : Math.ceil(elapsedMs / 1000),
      performance,
      mode: testMode,
      wordCount: testMode === "words" ? wordCount : undefined,
    };

    // Add the completed test to typing history.
    const updatedHistory = [savedTest, ...history];

    updateHistory(updatedHistory);
  }, [
    isFinished,
    wpm,
    accuracy,
    correctCharacters,
    incorrectCharacters,
    duration,
    elapsedMs,
    testMode,
    wordCount,
    performance,
    history,
  ]);

  // Reset the typing test using the selected settings.
  const resetTest = useCallback(
    (
      nextDifficulty: Difficulty = difficulty,
      nextMode: TestMode = testMode,
      nextWordCount: number = wordCount,
    ) => {
      // Generate new words for the selected mode.
      setText(createTestText(nextMode, nextWordCount, nextDifficulty));

      // Reset typing and timer state.
      setTypedText("");
      setStartTime(null);
      setElapsedMs(0);
      setIsFinished(false);
      setPerformance([]);
      setResetKey((previous) => previous + 1);

      // Allow the next result to be saved.
      hasSavedResult.current = false;

      // Return to the typing test.
      setCurrentPage("test");
    },
    [difficulty, testMode, wordCount],
  );

  // Clear saved typing history.
  const clearHistory = () => {
    updateHistory([]);
  };

  // Change duration and restart.
  const changeDuration = (newDuration: number) => {
    if (newDuration === duration) return;

    setPreferences((previous) => ({
      ...previous,
      duration: newDuration,
    }));

    resetTest();
  };

  // Change difficulty and restart.
  const changeDifficulty = (newDifficulty: Difficulty) => {
    if (newDifficulty === difficulty) return;

    setPreferences((previous) => ({
      ...previous,
      difficulty: newDifficulty,
    }));

    resetTest(newDifficulty);
  };

  // Change between timed and word-count tests.
  const changeTestMode = useCallback(
    (newMode: TestMode) => {
      if (newMode === testMode) return;

      setPreferences((previous) => ({
        ...previous,
        testMode: newMode,
      }));

      resetTest(difficulty, newMode, wordCount);
    },
    [testMode, difficulty, wordCount, resetTest],
  );

  // Change the selected word count.
  const changeWordCount = (newCount: number) => {
    if (newCount === wordCount) return;

    setPreferences((previous) => ({
      ...previous,
      wordCount: newCount,
    }));

    resetTest(difficulty, testMode, newCount);
  };

  // Toggle between dark and light themes.
  const toggleTheme = () => {
    setPreferences((previous) => ({
      ...previous,
      theme: previous.theme === "dark" ? "light" : "dark",
    }));
  };

  // Handle keyboard shortcuts for the typing test.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only use shortcuts on the typing test screen.
      if (currentPage !== "test") return;

      // Track Tab without blocking normal Tab navigation.
      if (
        event.key === "Tab" &&
        !event.shiftKey &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        tabHeld.current = true;
        return;
      }

      // Tab + Enter: Restart the current test.
      if (
        event.key === "Enter" &&
        tabHeld.current &&
        !event.repeat &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        event.preventDefault();
        event.stopPropagation();

        tabHeld.current = false;
        resetTest();
        return;
      }

      // Escape: Return focus to the typing input.
      if (event.key === "Escape" && !isFinished) {
        event.preventDefault();

        const typingInput = document.querySelector<HTMLInputElement>(
          'input[aria-label="Typing test input"]',
        );

        typingInput?.focus();
        return;
      }

      // Alt + 1 / Alt + 2: Change test mode.
      if (
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        !event.repeat
      ) {
        if (event.code === "Digit1") {
          event.preventDefault();
          changeTestMode("time");
        } else if (event.code === "Digit2") {
          event.preventDefault();
          changeTestMode("words");
        }
      }
    };

    // Stop tracking Tab when the key is released.
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        tabHeld.current = false;
      }
    };

    // Reset the shortcut if the browser loses focus.
    const handleBlur = () => {
      tabHeld.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    // Clean up listeners when dependencies change.
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [currentPage, isFinished, resetTest, changeTestMode]);

  return (
    <div
      data-theme={theme}
      className="flex min-h-screen flex-col bg-app-bg text-app-text"
    >
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <Keyboard className="h-8 w-8 text-app-accent" />

          <h1 className="text-2xl font-bold tracking-tight">
            Type<span className="text-app-accent">Flow</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 text-app-muted">
          {/* Typing Test Navigation */}

          <button
            type="button"
            onClick={() => setCurrentPage("test")}
            disabled={isRunning}
            title={
              isRunning
                ? "Finish or restart the current test first"
                : "Start typing test"
            }
            className={`text-sm transition ${
              isRunning
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer hover:text-app-accent"
            } ${currentPage === "test" ? "text-app-accent" : "text-app-muted"}`}
          >
            Test
          </button>

          {/* Typing History Navigation */}
          <button
            type="button"
            onClick={() => setCurrentPage("history")}
            disabled={isRunning}
            title={
              isRunning
                ? "Finish or restart the current test first"
                : "View typing history"
            }
            className={`flex items-center gap-2 text-sm transition ${
              isRunning
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer hover:text-app-accent"
            } ${
              currentPage === "history" ? "text-app-accent" : "text-app-muted"
            }`}
          >
            <HistoryIcon size={18} />
            <span>History</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="cursor-pointer rounded-lg p-2 text-app-muted transition hover:bg-app-surface hover:text-app-accent"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-20">
        {currentPage === "history" ? (
          <History history={history} onClearHistory={clearHistory} />
        ) : isFinished ? (
          <Results result={result} onRestart={() => resetTest()} />
        ) : (
          <>
            {/* Introduction */}
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-semibold">Test Your Typing Speed</h2>
            </div>

            {/* Test Settings */}
            <div className="mb-10 flex flex-col items-center gap-4">
              {/* First Row: Test Mode */}
              <div className="flex items-center gap-5 rounded-xl bg-app-surface px-6 py-4">
                <span className="text-sm text-app-muted">Mode</span>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => changeTestMode("time")}
                    className={`cursor-pointer text-sm font-medium transition ${
                      testMode === "time"
                        ? "text-app-accent"
                        : "text-app-muted hover:text-app-text"
                    }`}
                  >
                    Time
                  </button>

                  <button
                    type="button"
                    onClick={() => changeTestMode("words")}
                    className={`cursor-pointer text-sm font-medium transition ${
                      testMode === "words"
                        ? "text-app-accent"
                        : "text-app-muted hover:text-app-text"
                    }`}
                  >
                    Words
                  </button>
                </div>
              </div>

              {/* Second Row: Time/Words and Difficulty */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {/* Time or Word Count */}
                <div className="flex flex-wrap items-center justify-center gap-5 rounded-xl bg-app-surface px-6 py-4">
                  <span className="text-sm text-app-muted">
                    {testMode === "time" ? "Time" : "Words"}
                  </span>

                  <div className="flex gap-4">
                    {testMode === "time"
                      ? TEST_DURATIONS.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => changeDuration(time)}
                            className={`cursor-pointer text-sm font-medium transition ${
                              duration === time
                                ? "text-app-accent"
                                : "text-app-muted hover:text-app-text"
                            }`}
                          >
                            {time}
                          </button>
                        ))
                      : WORD_COUNTS.map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => changeWordCount(count)}
                            className={`cursor-pointer text-sm font-medium transition ${
                              wordCount === count
                                ? "text-app-accent"
                                : "text-app-muted hover:text-app-text"
                            }`}
                          >
                            {count}
                          </button>
                        ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex flex-wrap items-center justify-center gap-5 rounded-xl bg-app-surface px-6 py-4">
                  <span className="text-sm text-app-muted">Difficulty</span>

                  <div className="flex gap-4">
                    {(["easy", "medium", "hard"] as Difficulty[]).map(
                      (level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => changeDifficulty(level)}
                          className={`cursor-pointer text-sm font-medium capitalize transition ${
                            difficulty === level
                              ? "text-app-accent"
                              : "text-app-muted hover:text-app-text"
                          }`}
                        >
                          {level}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Statistics */}
            <div className="mb-8 flex justify-between gap-4 text-lg">
              <div>
                <span className="text-app-subtle">
                  {testMode === "time" ? "time " : "elapsed "}
                </span>

                <span className="font-semibold text-app-accent">
                  {testMode === "time" ? timeLeft : `${elapsedSeconds}s`}
                </span>
              </div>

              <div>
                <span className="text-app-subtle">wpm </span>
                <span className="font-semibold text-app-accent">{wpm}</span>
              </div>

              <div>
                <span className="text-app-subtle">accuracy </span>
                <span className="font-semibold text-app-accent">
                  {accuracy}%
                </span>
              </div>
            </div>

            {/* Typing Interface */}
            <TypingText
              text={text}
              typedText={typedText}
              onTyping={handleTyping}
              resetKey={resetKey}
              disabled={isFinished}
            />

            {/* Word-Count Progress */}
            {testMode === "words" && (
              <div className="mt-6 text-center text-sm text-app-muted">
                Words reached:{" "}
                <span className="font-semibold text-app-accent">
                  {wordProgress} / {wordCount}
                </span>
              </div>
            )}

            {/* Test Status */}
            <div className="mt-5 text-center">
              <p className="text-sm text-app-subtle">
                {isRunning ? "Keep typing!" : "Start typing to begin the test"}
              </p>
            </div>

            {/* Restart Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => resetTest()}
                aria-label="Restart test"
                title="Restart test"
                className="cursor-pointer rounded-lg p-3 text-app-muted transition hover:bg-app-surface hover:text-app-accent"
              >
                <RotateCcw size={22} />
              </button>
            </div>

            {/* Keyboard Shortcut Hints */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-app-subtle">
              <span>
                <kbd className="rounded bg-app-surface px-2 py-1">
                  Tab + Enter
                </kbd>{" "}
                Restart
              </span>

              <span>
                <kbd className="rounded bg-app-surface px-2 py-1">Esc</kbd>{" "}
                Focus
              </span>

              <span>
                <kbd className="rounded bg-app-surface px-2 py-1">Alt + 1</kbd>{" "}
                Time
              </span>

              <span>
                <kbd className="rounded bg-app-surface px-2 py-1">Alt + 2</kbd>{" "}
                Words
              </span>
            </div>
          </>
        )}

        {storageError && (
          <p role="alert" className="mt-6 text-center text-sm text-amber-400">
            Unable to save typing history in this browser. Your results may not
            persist after refreshing.
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
