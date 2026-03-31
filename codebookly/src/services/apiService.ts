/**
 * Barrel re-exports — import from `codeService` / `definitionsApi` for clearer boundaries.
 */
export { apiClient } from "./apiClient";
export {
  codeService,
  CODES_BY_AGENCY_LIMIT,
  CODES_BY_DESIGNATION_LIMIT,
  type ChapterAppendixLookup,
  type ChapterListItem,
  type SectionListItem,
} from "./codeService";
export { definitionsService, type DefinitionsPageParams } from "./definitionsApi";
