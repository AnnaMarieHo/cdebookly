import type { DefinitionPageResponse } from "../../../types/definitions";
import {
  definitionsService,
  type DefinitionsPageParams,
} from "../../../services/definitionsApi";

export const definitionsBrowse = {
  fetchPage(
    params: DefinitionsPageParams,
    signal?: AbortSignal
  ): Promise<DefinitionPageResponse> {
    return definitionsService.getPage(params, { signal });
  },

  downloadExport(params: { q?: string; letter_tag?: string }): Promise<void> {
    return definitionsService.downloadExport(params);
  },
};
