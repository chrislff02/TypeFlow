import { useEffect, useState } from "react";
import { Keyboard, RotateCcw, GitBranch } from "lucide-react";
import TypingText from "./components/TypingText";

const TEST_DURATIONS = [15, 30, 60, 120];

const SAMPLE_TEXT =
  "the quick brown fox jumps over the lazy dog while the sun shines brightly across the peaceful valley";

function App() {
  const [duration, setDuration] = useState(30);
  const [typedText, setTypedText] = useState("");
  const [resetKey, setResetKey] = useState(0);

  // Timer state
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Determine whether the test is running.
  const isRunning = startTime !== null && !isFinished;

  // Countdown timer
  useEffect(() => {
    if (!isRunning || startTime === null) return;

    const interval = window.setInterval(() => {
      const elapsed = Math.min(Date.now() - startTime, duration * 1000);

      setElapsedMs(elapsed);

      // Automatically finish when time expires.
      if (elapsed >= duration * 1000) {
        setIsFinished(true);
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [isRunning, startTime, duration]);

  // Handle typing and start the timer.
  const handleTyping = (value: string) => {
    if (isFinished) return;

    // Begin timing on the first character.
    if (startTime === null && value.length > 0) {
      setStartTime(Date.now());
    }

    setTypedText(value);

    // Finish if the user completes all available text.
    if (value.length === SAMPLE_TEXT.length) {
      setIsFinished(true);
    }
  };

  // Count correct characters.
  const correctCharacters = typedText
    .split("")
    .filter((character, index) => character === SAMPLE_TEXT[index]).length;

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

  // Reset the entire test.
  const resetTest = () => {
    setTypedText("");
    setStartTime(null);
    setElapsedMs(0);
    setIsFinished(false);
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
            <span className="font-semibold text-emerald-400">{timeLeft}</span>
          </div>

          <div>
            <span className="text-gray-500">wpm </span>
            <span className="font-semibold text-emerald-400">{wpm}</span>
          </div>

          <div>
            <span className="text-gray-500">accuracy </span>
            <span className="font-semibold text-emerald-400">{accuracy}%</span>
          </div>
        </div>

        {/* Typing Interface */}
        <TypingText
          text={SAMPLE_TEXT}
          typedText={typedText}
          onTyping={handleTyping}
          resetKey={resetKey}
          disabled={isFinished}
        />

        {/* Test Status */}
        <div className="mt-8 text-center">
          {isFinished ? (
            <div>
              <h3 className="mb-2 text-2xl font-semibold text-emerald-400">
                Test Complete!
              </h3>

              <p className="text-gray-400">
                WPM: {wpm} | Accuracy: {accuracy}% | Errors:{" "}
                {incorrectCharacters}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {isRunning ? "Keep typing!" : "Start typing to begin the test"}
            </p>
          )}
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
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500">
        TypeFlow — Built with React & TypeScript
      </footer>
    </div>
  );
}

export default App;
