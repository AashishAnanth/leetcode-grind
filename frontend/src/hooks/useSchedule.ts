import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { scheduleApi } from "@/services/schedule.api";
import type { ScheduleConfig } from "@/types";

export function useTodayQueue() {
  return useQuery({
    queryKey: ["schedule", "today"],
    queryFn: scheduleApi.getToday,
  });
}

export function useScheduleStats(days = 90) {
  return useQuery({
    queryKey: ["schedule", "stats", days],
    queryFn: () => scheduleApi.getStats(days),
  });
}

export function useScheduleConfig() {
  return useQuery({
    queryKey: ["schedule", "config"],
    queryFn: scheduleApi.getConfig,
  });
}

export function useUpdateScheduleConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ScheduleConfig>) => scheduleApi.updateConfig(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
}

export function useResetTodayQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: scheduleApi.resetToday,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedule", "today"] });
    },
  });
}
