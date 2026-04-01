import { apiClient } from "./apiClient";

export type ChatbotApiResponse = {
  message: string;
};

export const chatService = {
  sendMessage: async (
    message: string,
    selectedCodeIds: readonly string[],
    mode: "general" | "quiz" | "paraphrase",
  ): Promise<ChatbotApiResponse> => {
    const payload = {
      message,
      selected_code_ids: [...selectedCodeIds],
      mode,
    };
    console.log("payload", payload);
    const response = await apiClient.post<ChatbotApiResponse>(
      "/api/chatbot",
      payload,
    );
    return response.data;
  },
};
