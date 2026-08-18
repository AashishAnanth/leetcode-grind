import api from "@/lib/api";
import type { SolveLog, SolveLogCreate } from "@/types";

export const solveLogsApi = {
  submit: async (problemId: number, payload: SolveLogCreate): Promise<SolveLog> => {
    const { data } = await api.post(`/problems/${problemId}/log`, payload);
    return data;
  },

  history: async (problemId: number): Promise<SolveLog[]> => {
    const { data } = await api.get(`/problems/${problemId}/history`);
    return data;
  },

  delete: async (logId: number): Promise<void> => {
    await api.delete(`/problems/log/${logId}`);
  },
};
