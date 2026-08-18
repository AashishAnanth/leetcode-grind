import api from "@/lib/api";
import type { WhiteboardMessage } from "@/types";

export const whiteboardApi = {
  getMessages: async (problemId: number): Promise<WhiteboardMessage[]> => {
    const { data } = await api.get(`/whiteboard/${problemId}/messages`);
    return data;
  },

  sendMessage: async (
    problemId: number,
    content: string,
    mode: "hint" | "explain"
  ): Promise<WhiteboardMessage> => {
    const { data } = await api.post(`/whiteboard/${problemId}/message`, { content, mode });
    return data;
  },

  clearMessages: async (problemId: number): Promise<void> => {
    await api.delete(`/whiteboard/${problemId}/messages`);
  },

  analyzeCode: async (problemId: number): Promise<WhiteboardMessage> => {
    const { data } = await api.post(`/whiteboard/${problemId}/analyze`);
    return data;
  },
};
