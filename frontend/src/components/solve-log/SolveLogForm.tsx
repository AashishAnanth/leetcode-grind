import { useState } from "react";
import { useSubmitLog } from "@/hooks/useSolveLogs";
import type { Difficulty, Language, Problem, SolveLogCreate, Status } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  problem: Problem;
  onSuccess: () => void;
}

const statuses: Status[] = ["attempted", "solved", "needs-review"];
const difficulties: Difficulty[] = ["easy", "medium", "hard"];
const languages: Language[] = ["python", "java", "cpp", "javascript", "typescript", "go", "rust", "other"];

export function SolveLogForm({ problem, onSuccess }: Props) {
  const [form, setForm] = useState<SolveLogCreate>({
    status: "attempted",
    language: "python",
  });
  const { mutate, isPending, error } = useSubmitLog(problem.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(form, { onSuccess });
  };

  const labelClass = "block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide";
  const inputClass =
    "w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Status */}
      <div>
        <label className={labelClass}>Status</label>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm((f) => ({ ...f, status: s }))}
              className={cn(
                "flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors",
                form.status === s
                  ? "bg-zinc-700 border-zinc-500 text-zinc-100"
                  : "bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-600"
              )}
            >
              {s === "needs-review" ? "Needs Review" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Perceived difficulty */}
      <div>
        <label className={labelClass}>Felt like...</label>
        <div className="flex gap-2">
          {difficulties.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  perceived_difficulty: f.perceived_difficulty === d ? undefined : d,
                }))
              }
              className={cn(
                "flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors",
                form.perceived_difficulty === d
                  ? d === "easy"
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : d === "medium"
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                    : "bg-red-500/20 border-red-500/50 text-red-400"
                  : "bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-600"
              )}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Time */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className={labelClass}>Time (minutes)</label>
          <input
            type="number"
            min={1}
            placeholder="30"
            value={form.time_minutes ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                time_minutes: e.target.value ? parseInt(e.target.value) : undefined,
              }))
            }
            className={inputClass}
          />
        </div>
        <div className="flex-1">
          <label className={labelClass}>Language</label>
          <select
            value={form.language ?? "python"}
            onChange={(e) => setForm((f) => ({ ...f, language: e.target.value as Language }))}
            className={inputClass}
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Code */}
      <div>
        <label className={labelClass}>Your solution (paste after solving)</label>
        <textarea
          value={form.code ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          placeholder="Paste your solution here..."
          rows={8}
          className={cn(inputClass, "font-mono text-xs resize-none")}
        />
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Key insight, what tripped you up, etc."
          rows={3}
          className={cn(inputClass, "resize-none")}
        />
      </div>

      {error && (
        <p className="text-sm text-red-400">Failed to save. Try again.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 rounded-md bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save log"}
      </button>
    </form>
  );
}
