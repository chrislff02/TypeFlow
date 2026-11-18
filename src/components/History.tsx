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

  // Total number of completed tests.
  const totalTests = history.length;

  // Calculate the user's personal best.
  const bestWpm =
    totalTests > 0 ? Math.max(...history.map((test) => test.wpm)) : 0;

  // Calculate average typing speed.
  const averageWpm =
    totalTests > 0
      ? Math.round(
          history.reduce((total, test) => total + test.wpm, 0) / totalTests,
        )
      : 0;

  // Calculate average accuracy.
  const averageAccuracy =
    totalTests > 0
      ? Math.round(
          history.reduce((total, test) => total + test.accuracy, 0) /
            totalTests,
        )
      : 0;

  // Display the latest five tests by default.
  const visibleHistory = showAll ? history : history.slice(0, 5);

  // Confirm before deleting all test history.
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
        <HistoryIcon className="mx-auto mb-4 h-10 w-10 text-emerald-400" />

        <h2 className="text-3xl font-bold">Typing History</h2>

        <p className="mt-2 text-gray-400">
          Track your progress and improve your typing skills.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-[#1f2937] p-5">
          <Trophy className="mb-3 text-emerald-400" />

          <p className="text-sm text-gray-400">Personal Best</p>

          <p className="mt-1 text-3xl font-bold text-emerald-400">
            {bestWpm}
            <span className="ml-1 text-sm text-gray-400">WPM</span>
          </p>
        </div>

        <div className="rounded-xl bg-[#1f2937] p-5">
          <Activity className="mb-3 text-emerald-400" />

          <p className="text-sm text-gray-400">Average WPM</p>

          <p className="mt-1 text-3xl font-bold">{averageWpm}</p>
        </div>

        <div className="rounded-xl bg-[#1f2937] p-5">
          <Target className="mb-3 text-emerald-400" />

          <p className="text-sm text-gray-400">Average Accuracy</p>

          <p className="mt-1 text-3xl font-bold">{averageAccuracy}%</p>
        </div>

        <div className="rounded-xl bg-[#1f2937] p-5">
          <Keyboard className="mb-3 text-emerald-400" />

          <p className="text-sm text-gray-400">Tests Completed</p>

          <p className="mt-1 text-3xl font-bold">{totalTests}</p>
        </div>
      </div>

      {/* Test History */}
      <div className="rounded-xl bg-[#1f2937] p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold">Recent Tests</h3>

          {totalTests > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="flex cursor-pointer items-center gap-2 text-sm text-red-400 transition hover:text-red-300"
            >
              <Trash2 size={16} />
              Clear History
            </button>
          )}
        </div>

        {totalTests === 0 ? (
          // Empty history state.
          <div className="py-12 text-center">
            <HistoryIcon size={40} className="mx-auto mb-4 text-gray-500" />

            <p className="text-lg text-gray-300">No typing history yet</p>

            <p className="mt-2 text-sm text-gray-500">
              Complete a typing test to see your results here.
            </p>
          </div>
        ) : (
          <>
            {/* Scrollable table for smaller screens */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px] text-left">
                <thead>
                  <tr className="border-b border-gray-700 text-sm text-gray-400">
                    <th className="pb-4 font-medium">Date</th>
                    <th className="pb-4 font-medium">WPM</th>
                    <th className="pb-4 font-medium">Accuracy</th>
                    <th className="pb-4 font-medium">Errors</th>
                    <th className="pb-4 font-medium">Duration</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleHistory.map((test) => (
                    <tr
                      key={test.id}
                      className="border-b border-gray-700/50 text-sm last:border-0"
                    >
                      <td className="py-4 text-gray-300">
                        {new Date(test.date).toLocaleString()}
                      </td>

                      <td className="py-4 font-semibold text-emerald-400">
                        {test.wpm}
                      </td>

                      <td className="py-4">{test.accuracy}%</td>

                      <td className="py-4">{test.incorrectCharacters}</td>

                      <td className="py-4">{test.duration}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Show All / Show Less */}
            {totalTests > 5 && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="cursor-pointer text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
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
