import { useState } from "react";
import TypingText from "./components/TypingText";
import { Keyboard, RotateCcw, GitBranch } from "lucide-react";
const TEST_DURATIONS = [15, 30, 60, 120];

const SAMPLE_TEXT =
  "the quick brown fox jumps over the lazy dog while the sun shines brightly across the peaceful valley";

function App() {
  const [duration, setDuration] = useState(30);
  const [resetKey, setResetKey] = useState(0);

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
                  onClick={() => setDuration(time)}
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

        {/* Test Information */}
        <div className="mb-8 flex justify-between text-lg">
          <div>
            <span className="text-gray-500">time </span>
            <span className="font-semibold text-emerald-400">{duration}</span>
          </div>

          <div>
            <span className="text-gray-500">wpm </span>
            <span className="font-semibold text-emerald-400">0</span>
          </div>

          <div>
            <span className="text-gray-500">accuracy </span>
            <span className="font-semibold text-emerald-400">100%</span>
          </div>
        </div>

        {/* Typing Text */}
        <TypingText text={SAMPLE_TEXT} resetKey={resetKey} />

        {/* Restart Button */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setResetKey((previous) => previous + 1)}
            aria-label="Restart test"
            title="Restart test"
            className="cursor-pointer rounded-lg p-3 text-gray-400 transition hover:bg-[#1f2937] hover:text-emerald-400"
          >
            <RotateCcw size={22} />
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          Start typing to begin the test
        </p>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500">
        TypeFlow — Built with React & TypeScript
      </footer>
    </div>
  );
}

export default App;
