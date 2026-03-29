export interface DefinitionEntry {
  definition: string;
  term: string;
  letter_tag: string;
  committee_designation: string;
}

export interface DefinitionPageResponse {
  items: DefinitionEntry[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
