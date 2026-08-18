import { useQuery } from "@tanstack/react-query";
import { problemsApi } from "@/services/problems.api";
import type { ProblemFilters } from "@/types";

export function useProblems(filters?: ProblemFilters) {
  return useQuery({
    queryKey: ["problems", filters],
    queryFn: () => problemsApi.list(filters),
  });
}

export function useProblem(id: number) {
  return useQuery({
    queryKey: ["problem", id],
    queryFn: () => problemsApi.get(id),
    enabled: !!id,
  });
}

export function usePatterns() {
  return useQuery({
    queryKey: ["patterns"],
    queryFn: () => problemsApi.patterns(),
    staleTime: Infinity,
  });
}
