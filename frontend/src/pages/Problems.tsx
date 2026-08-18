import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProblemFilters } from "@/components/problems/ProblemFilters";
import { ProblemTable } from "@/components/problems/ProblemTable";
import { SolveLogModal } from "@/components/solve-log/SolveLogModal";
import { useProblems } from "@/hooks/useProblems";
import type { Problem, ProblemFilters as Filters } from "@/types";

export function Problems() {
  const [filters, setFilters] = useState<Filters>({});
  const [logTarget, setLogTarget] = useState<Problem | null>(null);
  const { data: problems = [], isLoading } = useProblems(filters);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Problems"
        subtitle={`${problems.length} problems`}
      />
      <ProblemFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
          Loading...
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <ProblemTable problems={problems} onLogClick={setLogTarget} />
        </div>
      )}

      <SolveLogModal problem={logTarget} onClose={() => setLogTarget(null)} />
    </div>
  );
}
