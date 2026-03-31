import { apiClient } from "./apiClient";

export type ChatbotApiResponse = {
  message: string;
};

export const chatService = {
  sendMessage: async (
    message: string,
    selectedCodeIds: readonly string[],
  ): Promise<ChatbotApiResponse> => {
    const response = await apiClient.post<ChatbotApiResponse>("/api/chatbot", {
      message,
      selected_code_ids: [...selectedCodeIds],
    });
    return response.data;
  },
};
