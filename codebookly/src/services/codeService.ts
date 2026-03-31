import type {
  Agency,
  CodeRecord,
  CommitteeDesignation,
  EnrichedCode,
  SectionDataResponse,
  SingleCodeResponse,
} from "../types/codebook";
import { apiClient } from "./apiClient";

/** Server default is 10; use a higher cap until the API paginates. */
export const CODES_BY_DESIGNATION_LIMIT = 2000;

/**
 * get-codes-by-agency runs full enrichment per row on the server — keep moderate
 * until the API returns plain codes or paginates.
 */
export const CODES_BY_AGENCY_LIMIT = 150;

export type SectionListItem = { section: string; title: string };
export type ChapterListItem = { chapter: string; title: string };

/** GET /api/search-chapter-or-appendix/{search} */
export type ChapterAppendixLookup = {
  chapter?: string | number | null;
  appendix?: string | number | null;
};

export const codeService = {
  getCodes: async (): Promise<CodeRecord[]> => {
    const response = await apiClient.get<CodeRecord[]>("/api/codes");
    return response.data;
  },

  getChapters: async (): Promise<ChapterListItem[]> => {
    const response = await apiClient.get<ChapterListItem[]>("/api/chapters");
    return response.data;
  },

  getSections: async (): Promise<SectionListItem[]> => {
    const response = await apiClient.get<SectionListItem[]>(
      "/api/list-sections",
    );
    return response.data;
  },

  getSectionData: async (
    section: string,
  ): Promise<SectionDataResponse> => {
    const response = await apiClient.get<SectionDataResponse>(
      `/api/sections/${encodeURIComponent(section)}`,
    );
    return response.data;
  },

  searchChapterOrAppendix: async (
    search: string,
  ): Promise<ChapterAppendixLookup> => {
    const response = await apiClient.get<ChapterAppendixLookup>(
      `/api/search-chapter-or-appendix/${encodeURIComponent(search)}`,
    );
    return response.data;
  },

  getCodesByChapter: async (chapter: string): Promise<CodeRecord[]> => {
    const response = await apiClient.get<CodeRecord[]>(
      `/api/get-codes-by-chapter/${encodeURIComponent(chapter)}`,
    );
    return response.data;
  },

  getCommitteeDesignations: async (): Promise<CommitteeDesignation[]> => {
    const response = await apiClient.get<CommitteeDesignation[]>(
      "/api/committee-designations",
    );
    return response.data;
  },

  getCodesByDesignation: async (
    designation: string,
    limit = CODES_BY_DESIGNATION_LIMIT,
  ): Promise<CodeRecord[]> => {
    const response = await apiClient.get<CodeRecord[]>(
      `/api/get-codes-by-designation/${encodeURIComponent(designation)}`,
      { params: { limit } },
    );
    return response.data;
  },

  getAgencies: async (): Promise<Agency[]> => {
    const response = await apiClient.get<Agency[]>("/api/agencies");
    return response.data;
  },

  getCodesByAgency: async (
    agency: string,
    limit = CODES_BY_AGENCY_LIMIT,
  ): Promise<EnrichedCode[]> => {
    const response = await apiClient.get<EnrichedCode[]>(
      `/api/get-codes-by-agency/${encodeURIComponent(agency)}`,
      { params: { limit } },
    );
    return response.data;
  },

  getCode: async (code: string): Promise<SingleCodeResponse> => {
    const response = await apiClient.get<SingleCodeResponse>(
      `/api/code/${encodeURIComponent(code)}`,
    );
    return response.data;
  },

  getFullCodeContext: async (code: string): Promise<EnrichedCode> => {
    const response = await apiClient.get<EnrichedCode>(
      `/api/codes-full-context/${encodeURIComponent(code)}`,
    );
    return response.data;
  },
};
