import { usePatterns } from "@/hooks/useProblems";
import type { Difficulty, ProblemFilters, Status } from "@/types";

interface Props {
  filters: ProblemFilters;
  onChange: (filters: ProblemFilters) => void;
}

const difficulties: Array<{ value: Difficulty | ""; label: string }> = [
  { value: "", label: "All difficulties" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const statuses: Array<{ value: Status | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "todo", label: "Todo" },
  { value: "attempted", label: "Attempted" },
  { value: "solved", label: "Solved" },
  { value: "needs-review", label: "Needs Review" },
];

export function ProblemFilters({ filters, onChange }: Props) {
  const { data: patterns = [] } = usePatterns();

  const selectClass =
    "bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-500";

  return (
    <div className="flex flex-wrap gap-3 px-6 py-3 border-b border-zinc-800">
      <input
        type="text"
        placeholder="Search problems..."
        value={filters.search ?? ""}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-500 w-52"
      />

      <select
        value={filters.difficulty ?? ""}
        onChange={(e) => onChange({ ...filters, difficulty: e.target.value as Difficulty | "" })}
        className={selectClass}
      >
        {difficulties.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>

      <select
        value={filters.status ?? ""}
        onChange={(e) => onChange({ ...filters, status: e.target.value as Status | "" })}
        className={selectClass}
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        value={filters.pattern ?? ""}
        onChange={(e) => onChange({ ...filters, pattern: e.target.value })}
        className={selectClass}
      >
        <option value="">All patterns</option>
        {patterns.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {(filters.search || filters.difficulty || filters.status || filters.pattern) && (
        <button
          onClick={() => onChange({})}
          className="text-xs text-zinc-500 hover:text-zinc-300 px-2"
        >
          Clear
        </button>
      )}
    </div>
  );
}
