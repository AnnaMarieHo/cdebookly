import type { EnrichedCode, SingleCodeResponse } from "../../../types/codebook";

/** Builds an EnrichedCode-shaped payload for the modal when only GET /api/code is available. */
export function singleCodeResponseToEnriched(res: SingleCodeResponse): EnrichedCode {
  const { code, chapter_metadata } = res;
  return {
    code,
    chapter_info: {
      title: chapter_metadata.title,
      description: chapter_metadata.description,
      about: "",
      chapter: code.chapter ?? "",
    },
    standards: [],
    committee_designations: [],
    index_terms: [],
  };
}
