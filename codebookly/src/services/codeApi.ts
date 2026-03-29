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

export const codeService = {
  getCodes: () => apiClient.get<CodeRecord[]>("/api/codes").then((res) => res.data),
  getChapters: () => apiClient.get("/api/chapters").then((res) => res.data),
  getSections: () =>
    apiClient.get("/api/list-sections").then((res) => res.data),
  getSectionData: (section: string) =>
    apiClient
      .get<SectionDataResponse>(
        `/api/sections/${encodeURIComponent(section)}`
      )
      .then((res) => res.data),
  searchChapterOrAppendix: (search: string) =>
    apiClient
      .get(`/api/search-chapter-or-appendix/${encodeURIComponent(search)}`)
      .then((res) => res.data),
  getCodesByChapter: (chapter: string) =>
    apiClient
      .get<CodeRecord[]>(
        `/api/get-codes-by-chapter/${encodeURIComponent(chapter)}`
      )
      .then((res) => res.data),
  getCommitteeDesignations: () =>
    apiClient
      .get<CommitteeDesignation[]>("/api/committee-designations")
      .then((res) => res.data),
  getCodesByDesignation: (
    designation: string,
    limit = CODES_BY_DESIGNATION_LIMIT
  ) =>
    apiClient
      .get<CodeRecord[]>(
        `/api/get-codes-by-designation/${encodeURIComponent(designation)}`,
        { params: { limit } }
      )
      .then((res) => res.data),
  getAgencies: () =>
    apiClient.get<Agency[]>("/api/agencies").then((res) => res.data),
  getCodesByAgency: (agency: string, limit = CODES_BY_AGENCY_LIMIT) =>
    apiClient
      .get<EnrichedCode[]>(
        `/api/get-codes-by-agency/${encodeURIComponent(agency)}`,
        { params: { limit } }
      )
      .then((res) => res.data),
  getCode: (code: string) =>
    apiClient
      .get<SingleCodeResponse>(`/api/code/${encodeURIComponent(code)}`)
      .then((res) => res.data),
  getFullCodeContext: (code: string) =>
    apiClient
      .get<EnrichedCode>(
        `/api/codes-full-context/${encodeURIComponent(code)}`
      )
      .then((res) => res.data),
};
