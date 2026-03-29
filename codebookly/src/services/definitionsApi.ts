import type { DefinitionPageResponse } from "../types/definitions";
import { apiClient } from "./apiClient";

export type DefinitionsPageParams = {
  page?: number;
  page_size?: number;
  q?: string;
  letter_tag?: string;
};

export const definitionsService = {
  getPage: (params: DefinitionsPageParams, config?: { signal?: AbortSignal }) =>
    apiClient
      .get<DefinitionPageResponse>("/api/definitions", {
        params: {
          page: params.page ?? 1,
          page_size: params.page_size ?? 24,
          q: params.q,
          letter_tag: params.letter_tag,
        },
        signal: config?.signal,
      })
      .then((res) => res.data),

  downloadExport: async (params: { q?: string; letter_tag?: string }) => {
    const res = await apiClient.get<Blob>("/api/definitions/export", {
      params: {
        q: params.q,
        letter_tag: params.letter_tag,
      },
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `definitions-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
