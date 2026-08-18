import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { useProblem } from "@/hooks/useProblems";
import { DifficultyBadge } from "@/components/problems/DifficultyBadge";
import { SolveLogHistory } from "@/components/solve-log/SolveLogHistory";
import { SolveLogModal } from "@/components/solve-log/SolveLogModal";
import { Whiteboard } from "@/components/whiteboard/Whiteboard";
import type { Difficulty } from "@/types";

export function ProblemDetail() {
  const { id } = useParams<{ id: string }>();
  const problemId = Number(id);
  const { data: problem, isLoading } = useProblem(problemId);
  const [showLog, setShowLog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
        Loading...
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
        Problem not found.
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-80 shrink-0 border-r border-zinc-800 flex flex-col overflow-y-auto">
        <div className="px-5 py-4 border-b border-zinc-800">
          <Link
            to="/problems"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-4 transition-colors"
          >
            <ArrowLeft size={12} />
            Problems
          </Link>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-base font-semibold text-zinc-100 leading-tight">
                {problem.title}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">{problem.pattern}</p>
            </div>
            <DifficultyBadge difficulty={problem.difficulty as Difficulty} />
          </div>

          {problem.concepts?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {problem.concepts.map((c) => (
                <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {c}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <a
              href={`https://leetcode.com/problems/${problem.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ExternalLink size={12} />
              Open on LeetCode
            </a>
          </div>
        </div>

        <div className="px-5 py-4 flex-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              History
            </h2>
            <button
              onClick={() => setShowLog(true)}
              className="text-xs px-3 py-1 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
            >
              + Log attempt
            </button>
          </div>
          <SolveLogHistory logs={problem.solve_history} problemId={problemId} />
        </div>
      </div>

      {/* Right panel — Whiteboard */}
      <div className="flex-1 min-w-0">
        <Whiteboard problemId={problemId} />
      </div>

      <SolveLogModal
        problem={showLog ? problem : null}
        onClose={() => setShowLog(false)}
      />
    </div>
  );
}
