/** Shipped with GET /api/sections/{section} as `chapter_metadata` */
export interface SectionChapterMetadata {
  title: string;
  description: string;
}

/** Mirrors backend `schemas.Code` */
export interface CodeRecord {
  entry_type: string;
  letter_tag: string;
  code: string;
  chapter: string;
  parent_code: string;
  root_code: string;
  title: string;
  figure: string;
  table: string;
  content: string;
  section_code: string;
  section_title: string;
  sort_index: number;
}

/** GET /api/sections/{section} */
export interface SectionDataResponse {
  chapter_metadata: SectionChapterMetadata;
  codes: CodeRecord[];
}

/** GET /api/code/{code} */
export interface SingleCodeResponse {
  chapter_metadata: SectionChapterMetadata;
  code: CodeRecord;
}

export interface ChapterInfo {
  title: string;
  description: string;
  about: string;
  chapter: string;
}

/** Subset returned by full-context endpoint (agency, standard_id, definition). */
export interface StandardRef {
  agency: string;
  standard_id: string;
  definition: string;
}

export interface Agency {
  agency: string;
  agency_info: string;
}

export interface CommitteeDesignation {
  letter_tag: string;
  description: string;
}

export interface IndexReference {
  id: number;
  term: string;
  label: string;
  ref_id: string;
  ref_type: string;
  breadcrumb: string;
}

export interface EnrichedCode {
  code: CodeRecord;
  chapter_info: ChapterInfo;
  standards: StandardRef[];
  committee_designations: CommitteeDesignation[];
  index_terms: IndexReference[];
}
