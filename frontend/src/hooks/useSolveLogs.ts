import { useMutation, useQueryClient } from "@tanstack/react-query";
import { solveLogsApi } from "@/services/solveLogs.api";
import type { SolveLogCreate } from "@/types";

function invalidateAfterLog(queryClient: ReturnType<typeof useQueryClient>, problemId: number) {
  queryClient.invalidateQueries({ queryKey: ["problem", problemId] });
  queryClient.refetchQueries({ queryKey: ["problems"] });
  queryClient.refetchQueries({ queryKey: ["schedule"] });
}

export function useSubmitLog(problemId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SolveLogCreate) => solveLogsApi.submit(problemId, payload),
    onSuccess: () => invalidateAfterLog(queryClient, problemId),
  });
}

export function useDeleteLog(problemId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: number) => solveLogsApi.delete(logId),
    onSuccess: () => invalidateAfterLog(queryClient, problemId),
  });
}
