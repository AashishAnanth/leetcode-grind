import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import type { Problem } from "@/types";
import { DifficultyBadge } from "./DifficultyBadge";
import { StatusBadge } from "./StatusBadge";

interface Props {
  problems: Problem[];
  onLogClick: (problem: Problem) => void;
}

export function ProblemTable({ problems, onLogClick }: Props) {
  const navigate = useNavigate();

  if (problems.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
        No problems match your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
            <th className="text-left px-6 py-3 w-10">#</th>
            <th className="text-left px-3 py-3">Problem</th>
            <th className="text-left px-3 py-3">Pattern</th>
            <th className="text-left px-3 py-3">Difficulty</th>
            <th className="text-left px-3 py-3">Status</th>
            <th className="text-left px-3 py-3">Last Attempt</th>
            <th className="px-3 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {problems.map((problem) => (
            <tr
              key={problem.id}
              onClick={() => navigate(`/problems/${problem.id}`)}
              className="hover:bg-zinc-800/30 cursor-pointer transition-colors group"
            >
              <td className="px-6 py-3 text-zinc-600 tabular-nums">
                {problem.neetcode_order}
              </td>
              <td className="px-3 py-3">
                <span className="text-zinc-200 group-hover:text-white transition-colors">
                  {problem.title}
                </span>
              </td>
              <td className="px-3 py-3 text-zinc-500">{problem.pattern}</td>
              <td className="px-3 py-3">
                <DifficultyBadge difficulty={problem.difficulty} />
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={problem.status} />
              </td>
              <td className="px-3 py-3 text-zinc-600 text-xs">—</td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogClick(problem);
                    }}
                    className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500 transition-colors"
                  >
                    Log
                  </button>
                  <a
                    href={`https://leetcode.com/problems/${problem.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
