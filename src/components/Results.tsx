import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { RotateCcw, Trophy, Target, Clock, XCircle } from "lucide-react";
import type { TestResult } from "../types/typing";

interface ResultsProps {
  result: TestResult;
  onRestart: () => void;
}

function Results({ result, onRestart }: ResultsProps) {
  return (
    <div className="space-y-8">
      {/* Results Header */}
      <div className="text-center">
        <Trophy className="mx-auto mb-4 h-10 w-10 text-app-accent" />
        <h2 className="text-3xl font-bold">Test Complete!</h2>
        <p className="mt-2 text-app-muted">Here's how you performed.</p>
        <p className="mt-3 text-sm text-app-accent">
          {result.mode === "words"
            ? `Word Count Test — ${result.wordCount} words`
            : `Timed Test — ${result.duration} seconds`}
        </p>
      </div>

      {/* Results Statistics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-app-surface p-5">
          <Trophy className="mb-3 text-app-accent" />
          <p className="text-sm text-app-muted">WPM</p>
          <p className="mt-1 text-3xl font-bold text-app-accent">
            {result.wpm}
          </p>
        </div>

        <div className="rounded-xl bg-app-surface p-5">
          <Target className="mb-3 text-app-accent" />
          <p className="text-sm text-app-muted">Accuracy</p>
          <p className="mt-1 text-3xl font-bold">{result.accuracy}%</p>
        </div>

        <div className="rounded-xl bg-app-surface p-5">
          <XCircle className="mb-3 text-app-error" />
          <p className="text-sm text-app-muted">Errors</p>
          <p className="mt-1 text-3xl font-bold">
            {result.incorrectCharacters}
          </p>
        </div>

        <div className="rounded-xl bg-app-surface p-5">
          <Clock className="mb-3 text-app-accent" />
          <p className="text-sm text-app-muted">Duration</p>
          <p className="mt-1 text-3xl font-bold">{result.duration}s</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="rounded-xl bg-app-surface p-6">
        <h3 className="mb-2 text-xl font-semibold">Typing Performance</h3>
        <p className="mb-6 text-sm text-app-muted">
          Your typing speed throughout the test.
        </p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={result.performance}
              margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
            >
              <CartesianGrid stroke="var(--app-border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="second"
                stroke="var(--app-muted)"
                tick={{ fontSize: 12 }}
                label={{
                  value: "Time (seconds)",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                stroke="var(--app-muted)"
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--app-surface)",
                  border: "1px solid var(--app-border)",
                  borderRadius: "8px",
                  color: "var(--app-text)",
                }}
                labelStyle={{ color: "var(--app-text)" }}
                itemStyle={{ color: "var(--app-accent)" }}
                labelFormatter={(value) => `${value}s`}
                formatter={(value) => [`${value} WPM`, "Speed"]}
              />
              <Line
                type="monotone"
                dataKey="wpm"
                stroke="var(--app-accent)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-app-surface p-5">
          <p className="text-sm text-app-muted">Correct Characters</p>
          <p className="mt-2 text-2xl font-semibold">
            {result.correctCharacters}
          </p>
        </div>
        <div className="rounded-xl bg-app-surface p-5">
          <p className="text-sm text-app-muted">Incorrect Characters</p>
          <p className="mt-2 text-2xl font-semibold">
            {result.incorrectCharacters}
          </p>
        </div>
      </div>

      {/* Restart Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onRestart}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-app-accent px-6 py-3 font-semibold text-app-button-text transition hover:bg-app-accent-hover"
        >
          <RotateCcw size={18} />
          Try Again
        </button>
      </div>
    </div>
  );
}

export default Results;
