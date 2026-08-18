import api from "@/lib/api";
import type { Problem, ProblemDetail, ProblemFilters } from "@/types";

export const problemsApi = {
  list: async (filters?: ProblemFilters): Promise<Problem[]> => {
    const params = new URLSearchParams();
    if (filters?.pattern) params.set("pattern", filters.pattern);
    if (filters?.difficulty) params.set("difficulty", filters.difficulty);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.search) params.set("search", filters.search);
    const { data } = await api.get(`/problems?${params.toString()}`);
    return data;
  },

  get: async (id: number): Promise<ProblemDetail> => {
    const { data } = await api.get(`/problems/${id}`);
    return data;
  },

  patterns: async (): Promise<string[]> => {
    const { data } = await api.get("/problems/patterns");
    return data;
  },
};
