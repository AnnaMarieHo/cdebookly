from typing import Optional

from pydantic import BaseModel, ConfigDict

# Code Schemas

class Code(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    entry_type: str
    letter_tag: str
    code: str
    chapter: str
    parent_code: str
    root_code: str
    title: str
    figure: Optional[str] = None
    table: Optional[str] = None
    content: str
    section_code: str
    section_title: str
    sort_index: int

class TableOfContents(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str
    section: str

class EnrichedCode(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# Study Content Schemas. aka Chapters and Appendices

class StudyContentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title: str
    description: str
    about: str


class Chapter(StudyContentBase):
    chapter: str

class Appendix(StudyContentBase):
    appendix: str

# Agency Schemas

class Agency(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    agency: str
    agency_info: str

class AgencyStandards(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    agency: str
    standard_id: str
    definition: str
    codes: str
    tables: str
    images: str
    raw_references: str


class CommitteeDesignation(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    letter_tag: str
    description: str

class Definition(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    definition: str
    term: str
    letter_tag: str
    committee_designation: str


class DefinitionPage(BaseModel):
    """Paginated definitions list (server-side filter + count)."""

    items: list[Definition]
    total: int
    page: int
    page_size: int
    total_pages: int

class IndexTerm(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    term_id: int
    term: str

class IndexReference(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    term: str
    label: str
    ref_id: str
    ref_type: str
    breadcrumb: str

class Section(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title: str
    section_code: str
    section_title: Optional[str] = None
    code: str
    parent_code: str
    chapter: str
    letter_tag: str
    content: str
    figure: Optional[str] = None
    table: Optional[str] = None


class EnrichedCode(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    code: Code
    chapter_info: Chapter
    standards: list[dict]
    committee_designations: list[CommitteeDesignation]
    index_terms: list[IndexReference]