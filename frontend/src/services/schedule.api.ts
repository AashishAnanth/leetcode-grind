import api from "@/lib/api";
import type { ScheduleConfig, ScheduleStats, TodayQueue } from "@/types";

export const scheduleApi = {
  getConfig: async (): Promise<ScheduleConfig> => {
    const { data } = await api.get("/schedule/config");
    return data;
  },

  updateConfig: async (payload: Partial<ScheduleConfig>): Promise<ScheduleConfig> => {
    const { data } = await api.put("/schedule/config", payload);
    return data;
  },

  getToday: async (): Promise<TodayQueue> => {
    const { data } = await api.get("/schedule/today");
    return data;
  },

  getStats: async (days = 90): Promise<ScheduleStats> => {
    const { data } = await api.get("/schedule/stats", { params: { days } });
    return data;
  },

  resetToday: async (): Promise<void> => {
    await api.delete("/schedule/today");
  },
};
