import api from "@/lib/api";
import type { Problem, VaultEntry } from "@/types";

export const vaultApi = {
  list: async (): Promise<VaultEntry[]> => {
    const { data } = await api.get("/vault");
    return data;
  },

  get: async (pattern: string): Promise<VaultEntry> => {
    const { data } = await api.get(`/vault/${encodeURIComponent(pattern)}`);
    return data;
  },

  update: async (pattern: string, content: string): Promise<VaultEntry> => {
    const { data } = await api.put(`/vault/${encodeURIComponent(pattern)}`, { content });
    return data;
  },

  getLinkedProblems: async (pattern: string): Promise<Problem[]> => {
    const { data } = await api.get(`/vault/${encodeURIComponent(pattern)}/problems`);
    return data;
  },

  draft: async (pattern: string): Promise<{ pattern: string; content: string }> => {
    const { data } = await api.post(`/vault/${encodeURIComponent(pattern)}/draft`);
    return data;
  },
};
