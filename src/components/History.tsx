import { useState } from "react";
import {
  Trophy,
  Target,
  Keyboard,
  Activity,
  Trash2,
  History as HistoryIcon,
} from "lucide-react";
import type { SavedTest } from "../types/typing";

interface HistoryProps {
  history: SavedTest[];
  onClearHistory: () => void;
}

function History({ history, onClearHistory }: HistoryProps) {
  const [showAll, setShowAll] = useState(false);

  const totalTests = history.length;
  const bestWpm =
    totalTests > 0 ? Math.max(...history.map((test) => test.wpm)) : 0;
  const averageWpm =
    totalTests > 0
      ? Math.round(
          history.reduce((total, test) => total + test.wpm, 0) / totalTests,
        )
      : 0;
  const averageAccuracy =
    totalTests > 0
      ? Math.round(
          history.reduce((total, test) => total + test.accuracy, 0) /
            totalTests,
        )
      : 0;
  const visibleHistory = showAll ? history : history.slice(0, 5);

  const handleClearHistory = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all typing history? This cannot be undone.",
    );
    if (confirmed) {
      onClearHistory();
      setShowAll(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <HistoryIcon className="mx-auto mb-4 h-10 w-10 text-app-accent" />
        <h2 className="text-3xl font-bold">Typing History</h2>
        <p className="mt-2 text-app-muted">
          Track your progress and improve your typing skills.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-app-surface p-5">
          <Trophy className="mb-3 text-app-accent" />
          <p className="text-sm text-app-muted">Personal Best</p>
          <p className="mt-1 text-3xl font-bold text-app-accent">
            {bestWpm}
            <span className="ml-1 text-sm text-app-muted">WPM</span>
          </p>
        </div>
        <div className="rounded-xl bg-app-surface p-5">
          <Activity className="mb-3 text-app-accent" />
          <p className="text-sm text-app-muted">Average WPM</p>
          <p className="mt-1 text-3xl font-bold">{averageWpm}</p>
        </div>
        <div className="rounded-xl bg-app-surface p-5">
          <Target className="mb-3 text-app-accent" />
          <p className="text-sm text-app-muted">Average Accuracy</p>
          <p className="mt-1 text-3xl font-bold">{averageAccuracy}%</p>
        </div>
        <div className="rounded-xl bg-app-surface p-5">
          <Keyboard className="mb-3 text-app-accent" />
          <p className="text-sm text-app-muted">Tests Completed</p>
          <p className="mt-1 text-3xl font-bold">{totalTests}</p>
        </div>
      </div>

      {/* Test History */}
      <div className="rounded-xl bg-app-surface p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold">Recent Tests</h3>
          {totalTests > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="flex cursor-pointer items-center gap-2 text-sm text-app-error transition hover:opacity-80"
            >
              <Trash2 size={16} />
              Clear History
            </button>
          )}
        </div>

        {totalTests === 0 ? (
          <div className="py-12 text-center">
            <HistoryIcon size={40} className="mx-auto mb-4 text-app-subtle" />
            <p className="text-lg text-app-text">No typing history yet</p>
            <p className="mt-2 text-sm text-app-subtle">
              Complete a typing test to see your results here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px] text-left">
                <thead>
                  <tr className="border-b border-app-border text-sm text-app-muted">
                    <th className="pb-4 font-medium">Date</th>
                    <th className="pb-4 font-medium">WPM</th>
                    <th className="pb-4 font-medium">Accuracy</th>
                    <th className="pb-4 font-medium">Errors</th>
                    <th className="pb-4 font-medium">Duration</th>
                    <th className="pb-4 font-medium">Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleHistory.map((test) => (
                    <tr
                      key={test.id}
                      className="border-b border-app-border/50 text-sm last:border-0"
                    >
                      <td className="py-4 text-app-text">
                        {new Date(test.date).toLocaleString()}
                      </td>
                      <td className="py-4 font-semibold text-app-accent">
                        {test.wpm}
                      </td>
                      <td className="py-4">{test.accuracy}%</td>
                      <td className="py-4">{test.incorrectCharacters}</td>
                      <td className="py-4">{test.duration}s</td>
                      <td className="py-4 text-app-text">
                        {test.mode === "words"
                          ? `${test.wordCount} Words`
                          : "Timed"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalTests > 5 && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="cursor-pointer text-sm font-medium text-app-accent transition hover:text-app-accent-hover"
                >
                  {showAll ? "Show Less" : "Show All Tests"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default History;
