/**
 * Barrel re-exports — import from `codeApi` / `definitionsApi` for clearer boundaries.
 */
export { apiClient } from "./apiClient";
export {
  codeService,
  CODES_BY_AGENCY_LIMIT,
  CODES_BY_DESIGNATION_LIMIT,
} from "./codeApi";
export { definitionsService, type DefinitionsPageParams } from "./definitionsApi";
