from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

# Code Schemas


class Code(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    entry_type: Optional[str] = None
    letter_tag: Optional[str] = None
    code: Optional[str] = None
    chapter: Optional[str] = None
    parent_code: Optional[str] = None
    root_code: Optional[str] = None
    title: Optional[str] = None
    figure: Optional[str] = None
    table: Optional[str] = None
    content: Optional[str] = None
    section_code: Optional[str] = None
    section_title: Optional[str] = None
    sort_index: Optional[int] = None


class TableOfContents(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: Optional[str] = None
    section: Optional[str] = None


# Study Content Schemas. aka Chapters and Appendices


class StudyContentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title: Optional[str] = None
    description: Optional[str] = None
    about: Optional[str] = None


class Chapter(StudyContentBase):
    chapter: Optional[str] = None


class Appendix(StudyContentBase):
    appendix: Optional[str] = None


# Agency Schemas


class Agency(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    agency: Optional[str] = None
    agency_info: Optional[str] = None


class AgencyStandards(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    agency: Optional[str] = None
    standard_id: Optional[str] = None
    definition: Optional[str] = None
    codes: Optional[str] = None
    tables: Optional[str] = None
    images: Optional[str] = None
    raw_references: Optional[str] = None


class CommitteeDesignation(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    letter_tag: Optional[str] = None
    description: Optional[str] = None


class Definition(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    definition: Optional[str] = None
    term: Optional[str] = None
    letter_tag: Optional[str] = None
    committee_designation: Optional[str] = None


class DefinitionPage(BaseModel):
    """Paginated definitions list (server-side filter + count)."""

    items: list[Definition]
    total: int
    page: int
    page_size: int
    total_pages: int


class IndexTerm(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    term_id: Optional[int] = None
    term: Optional[str] = None


class IndexReference(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[int] = None
    term: Optional[str] = None
    label: Optional[str] = None
    ref_id: Optional[str] = None
    ref_type: Optional[str] = None
    breadcrumb: Optional[str] = None


class Section(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title: Optional[str] = None
    section_code: Optional[str] = None
    section_title: Optional[str] = None
    code: Optional[str] = None
    parent_code: Optional[str] = None
    chapter: Optional[str] = None
    letter_tag: Optional[str] = None
    content: Optional[str] = None
    figure: Optional[str] = None
    table: Optional[str] = None


class EnrichedCode(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    code: Optional[dict] = None
    parent_code: Optional[str] = None
    section_title: Optional[str] = None
    content: Optional[str] = None
    chapter_info: Optional[Chapter] = None
    standards: list[dict]
    committee_designations: list[CommitteeDesignation]
    index_terms: list[IndexReference]

class ChatbotRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    message: str
    selected_code_ids: list[str] = Field(default_factory=list)
    mode: Literal["general", "quiz", "paraphrase"] = "general"


class ChatbotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    message: str