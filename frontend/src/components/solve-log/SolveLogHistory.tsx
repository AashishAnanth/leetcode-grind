import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { SolveLog } from "@/types";
import { DifficultyBadge } from "@/components/problems/DifficultyBadge";
import { StatusBadge } from "@/components/problems/StatusBadge";
import { useDeleteLog } from "@/hooks/useSolveLogs";
import type { Difficulty, Status } from "@/types";

interface Props {
  logs: SolveLog[];
  problemId: number;
}

export function SolveLogHistory({ logs, problemId }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const deleteLog = useDeleteLog(problemId);

  if (logs.length === 0) {
    return (
      <p className="text-sm text-zinc-600 italic">No attempts yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div key={log.id} className="border border-zinc-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/30 transition-colors"
          >
            <StatusBadge status={log.status as Status} />
            {log.perceived_difficulty && (
              <DifficultyBadge difficulty={log.perceived_difficulty as Difficulty} />
            )}
            {log.time_minutes && (
              <span className="text-xs text-zinc-500">{log.time_minutes}m</span>
            )}
            {log.language && (
              <span className="text-xs text-zinc-600">{log.language}</span>
            )}
            <span className="ml-auto text-xs text-zinc-600">
              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
            </span>
            {expandedId === log.id ? (
              <ChevronUp size={14} className="text-zinc-600" />
            ) : (
              <ChevronDown size={14} className="text-zinc-600" />
            )}
          </button>

          {expandedId === log.id && (
            <div className="px-4 pb-4 space-y-3 border-t border-zinc-800">
              {log.notes && (
                <p className="text-sm text-zinc-400 pt-3">{log.notes}</p>
              )}
              {log.code && (
                <pre className="text-xs font-mono bg-zinc-950 text-zinc-300 p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                  {log.code}
                </pre>
              )}
              <div className="flex items-center justify-between pt-1">
                {log.next_review_at ? (
                  <p className="text-xs text-zinc-600">
                    Review due:{" "}
                    {formatDistanceToNow(new Date(log.next_review_at), { addSuffix: true })}
                  </p>
                ) : <span />}
                <button
                  onClick={() => deleteLog.mutate(log.id)}
                  disabled={deleteLog.isPending}
                  className="flex items-center gap-1 text-xs text-zinc-600 hover:text-red-400 disabled:opacity-40 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
