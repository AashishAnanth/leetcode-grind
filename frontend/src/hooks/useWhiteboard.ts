import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { whiteboardApi } from "@/services/whiteboard.api";

export function useWhiteboardMessages(problemId: number) {
  return useQuery({
    queryKey: ["whiteboard", problemId],
    queryFn: () => whiteboardApi.getMessages(problemId),
    enabled: !!problemId,
  });
}

export function useSendMessage(problemId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ content, mode }: { content: string; mode: "hint" | "explain" }) =>
      whiteboardApi.sendMessage(problemId, content, mode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whiteboard", problemId] });
    },
  });
}

export function useClearWhiteboard(problemId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => whiteboardApi.clearMessages(problemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whiteboard", problemId] });
    },
  });
}

export function useAnalyzeCode(problemId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => whiteboardApi.analyzeCode(problemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whiteboard", problemId] });
    },
  });
}
