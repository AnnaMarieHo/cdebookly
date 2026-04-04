/** Rows returned by the paraphrase batch API (`json.dumps` on the server). */
export type ParaphraseStandard = {
  agency?: string | null;
  standard_id?: string | null;
  definition?: string | null;
};

export type ParaphraseRow = {
  code: string;
  chapter: string;
  section_title?: string | null;
  body: string;
  simplified_body: string;
  standards: ParaphraseStandard[];
  found?: boolean;
};
