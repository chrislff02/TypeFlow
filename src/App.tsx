import { useEffect, useState } from "react";
import { Keyboard, RotateCcw, GitBranch } from "lucide-react";
import TypingText from "./components/TypingText";
import Results from "./components/Results";
import { generateWords } from "./utils/generateWords";
import type { PerformancePoint, TestResult } from "./types/typing";

const TEST_DURATIONS = [15, 30, 60, 120];

function App() {
  const [duration, setDuration] = useState(30);

  // Randomly generated typing text.
  const [text, setText] = useState(() => generateWords(80));

  // User input and reset state.
  const [typedText, setTypedText] = useState("");
  const [resetKey, setResetKey] = useState(0);

  // Timer state.
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Store typing speed and accuracy throughout the test.
  const [performance, setPerformance] = useState<PerformancePoint[]>([]);

  const isRunning = startTime !== null && !isFinished;

  // Countdown timer and performance sampling.
  useEffect(() => {
    if (!isRunning || startTime === null) return;

    const interval = window.setInterval(() => {
      const elapsed = Math.min(Date.now() - startTime, duration * 1000);

      setElapsedMs(elapsed);

      const currentSecond = Math.floor(elapsed / 1000);

      // Record statistics every completed second.
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

          // Prevent duplicate measurements.
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

      // Automatically finish when the time expires.
      if (elapsed >= duration * 1000) {
        setIsFinished(true);
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [isRunning, startTime, duration, typedText, text]);

  // Handle typing and generate additional words.
  const handleTyping = (value: string) => {
    if (isFinished) return;

    // Prevent accepting input after the deadline.
    if (startTime !== null && Date.now() - startTime >= duration * 1000) {
      setElapsedMs(duration * 1000);
      setIsFinished(true);
      return;
    }

    // Start the timer on the first character.
    if (startTime === null && value.length > 0) {
      setStartTime(Date.now());
    }

    setTypedText(value);

    // Add more words when approaching the end.
    const remainingCharacters = text.length - value.length;

    if (remainingCharacters < 150) {
      setText((previous) => {
        return `${previous} ${generateWords(50)}`;
      });
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

  // Prepare the completed test results.
  const result: TestResult = {
    wpm,
    accuracy,
    correctCharacters,
    incorrectCharacters,
    duration,
    performance,
  };

  // Reset the entire test and generate new words.
  const resetTest = () => {
    setText(generateWords(80));
    setTypedText("");
    setStartTime(null);
    setElapsedMs(0);
    setIsFinished(false);
    setPerformance([]);
    setResetKey((previous) => previous + 1);
  };

  // Change duration and restart.
  const changeDuration = (newDuration: number) => {
    setDuration(newDuration);
    resetTest();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#111827] text-[#e5e7eb]">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <Keyboard className="h-8 w-8 text-emerald-400" />

          <h1 className="text-2xl font-bold tracking-tight">
            Type<span className="text-emerald-400">Flow</span>
          </h1>
        </div>

        <div className="flex items-center gap-5 text-gray-400">
          <span className="text-sm">Typing Speed Test</span>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="transition hover:text-emerald-400"
          >
            <GitBranch size={20} />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-20">
        {isFinished ? (
          // Display results when the test finishes.
          <Results result={result} onRestart={resetTest} />
        ) : (
          <>
            {/* Introduction */}
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-3xl font-semibold">
                Test your typing speed
              </h2>

              <p className="text-gray-400">
                Improve your speed and accuracy, one keystroke at a time.
              </p>
            </div>

            {/* Test Settings */}
            <div className="mb-12 flex justify-center">
              <div className="flex items-center gap-5 rounded-xl bg-[#1f2937] px-6 py-4">
                <span className="text-sm text-gray-400">Time</span>

                <div className="flex gap-4">
                  {TEST_DURATIONS.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => changeDuration(time)}
                      className={`cursor-pointer text-sm font-medium transition ${
                        duration === time
                          ? "text-emerald-400"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Statistics */}
            <div className="mb-8 flex justify-between text-lg">
              <div>
                <span className="text-gray-500">time </span>
                <span className="font-semibold text-emerald-400">
                  {timeLeft}
                </span>
              </div>

              <div>
                <span className="text-gray-500">wpm </span>
                <span className="font-semibold text-emerald-400">{wpm}</span>
              </div>

              <div>
                <span className="text-gray-500">accuracy </span>
                <span className="font-semibold text-emerald-400">
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

            {/* Test Status */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                {isRunning ? "Keep typing!" : "Start typing to begin the test"}
              </p>
            </div>

            {/* Restart Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={resetTest}
                aria-label="Restart test"
                title="Restart test"
                className="cursor-pointer rounded-lg p-3 text-gray-400 transition hover:bg-[#1f2937] hover:text-emerald-400"
              >
                <RotateCcw size={22} />
              </button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500">
        TypeFlow — Built with React & TypeScript
      </footer>
    </div>
  );
}

export default App;
