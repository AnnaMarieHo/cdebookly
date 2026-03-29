from typing import Optional

from sqlalchemy import Integer, LargeBinary, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass


class Agencies(Base):
    __tablename__ = 'agencies'

    agency: Mapped[Optional[str]] = mapped_column(Text, primary_key=True)
    agency_info: Mapped[Optional[str]] = mapped_column(Text)


class AgencyStandards(Base):
    __tablename__ = 'agency_standards'

    agency: Mapped[Optional[str]] = mapped_column(Text)
    standard_id: Mapped[Optional[str]] = mapped_column(Text, primary_key=True)
    definition: Mapped[Optional[str]] = mapped_column(Text)
    codes: Mapped[Optional[str]] = mapped_column(Text)
    tables: Mapped[Optional[str]] = mapped_column(Text)
    images: Mapped[Optional[str]] = mapped_column(Text)
    raw_references: Mapped[Optional[str]] = mapped_column(Text)


class MapCodeStandard(Base):
    __tablename__ = 'map_code_standard'

    id: Mapped[Optional[int]] = mapped_column(Integer, primary_key=True)
    standard_id: Mapped[Optional[str]] = mapped_column(Text)
    code: Mapped[Optional[str]] = mapped_column(Text)



class Chapters(Base):
    __tablename__ = 'chapters'

    chapter: Mapped[Optional[str]] = mapped_column(Text)
    appendix: Mapped[Optional[str]] = mapped_column(Text)
    resource: Mapped[Optional[str]] = mapped_column(Text)
    title: Mapped[Optional[str]] = mapped_column(Text, primary_key=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    about: Mapped[Optional[str]] = mapped_column(Text)


class CodesImages(Base):
    __tablename__ = 'codes_images'

    id: Mapped[Optional[int]] = mapped_column(Integer, primary_key=True)
    kind: Mapped[Optional[str]] = mapped_column(Text)
    key: Mapped[Optional[str]] = mapped_column(Text)
    full_reference: Mapped[Optional[str]] = mapped_column(Text)
    image: Mapped[Optional[bytes]] = mapped_column(LargeBinary)


class CodesTable(Base):
    __tablename__ = 'codes_table'

    entry_type: Mapped[Optional[str]] = mapped_column(Text)
    letter_tag: Mapped[Optional[str]] = mapped_column(Text)
    code: Mapped[Optional[str]] = mapped_column(Text, primary_key=True)
    chapter: Mapped[Optional[str]] = mapped_column(Text)
    parent_code: Mapped[Optional[str]] = mapped_column(Text)
    root_code: Mapped[Optional[str]] = mapped_column(Text)
    title: Mapped[Optional[str]] = mapped_column(Text)
    figure: Mapped[Optional[str]] = mapped_column(Text)
    table: Mapped[Optional[str]] = mapped_column(Text)
    content: Mapped[Optional[str]] = mapped_column(Text)
    section_code: Mapped[Optional[str]] = mapped_column(Text)
    section_title: Mapped[Optional[str]] = mapped_column(Text)
    sort_index: Mapped[Optional[int]] = mapped_column(Integer)


class CodesTableOfContents(Base):
    __tablename__ = 'codes_table_of_contents'

    title: Mapped[Optional[str]] = mapped_column(Text)
    section: Mapped[Optional[str]] = mapped_column(Text, primary_key=True)


class CommitteeDesignation(Base):
    __tablename__ = 'committee_designation'

    letter_tag: Mapped[Optional[str]] = mapped_column(Text, primary_key=True)
    description: Mapped[Optional[str]] = mapped_column(Text)


class Definitions(Base):
    __tablename__ = 'definitions'

    letter_tag: Mapped[Optional[str]] = mapped_column(Text)
    term: Mapped[Optional[str]] = mapped_column(Text, primary_key=True)
    definition: Mapped[Optional[str]] = mapped_column(Text)


class IndexReferences(Base):
    __tablename__ = 'index_references'

    term: Mapped[Optional[str]] = mapped_column(Text)
    label: Mapped[Optional[str]] = mapped_column(Text, primary_key=True)
    section_id: Mapped[Optional[str]] = mapped_column(Text)
    table_id: Mapped[Optional[str]] = mapped_column(Text)


class IndexTerms(Base):
    __tablename__ = 'index_terms'

    term_id: Mapped[Optional[int]] = mapped_column(Integer)
    term: Mapped[Optional[str]] = mapped_column(Text, primary_key=True)



class MapIndexReferences(Base):
    __tablename__ = 'map_index_references'

    id: Mapped[Optional[int]] = mapped_column(Integer, primary_key=True)
    term: Mapped[Optional[str]] = mapped_column(Text)
    label: Mapped[Optional[str]] = mapped_column(Text)
    ref_id: Mapped[Optional[str]] = mapped_column(Text)
    ref_type: Mapped[Optional[str]] = mapped_column(Text)
    breadcrumb: Mapped[Optional[str]] = mapped_column(Text)


class MapTableStandard(Base):
    __tablename__ = 'map_table_standard'

    id: Mapped[Optional[int]] = mapped_column(Integer, primary_key=True)
    standard_id: Mapped[Optional[str]] = mapped_column(Text)
    table: Mapped[Optional[str]] = mapped_column(Text)


class ResourceChapters(Base):
    __tablename__ = 'resource_chapters'

    chapter: Mapped[Optional[str]] = mapped_column(Text, primary_key=True)
    title: Mapped[Optional[str]] = mapped_column(Text)


class ResourceCodesTable(Base):
    __tablename__ = 'resource_codes_table'

    entry_type: Mapped[Optional[str]] = mapped_column(Text)
    letter_tag: Mapped[Optional[str]] = mapped_column(Text)
    code: Mapped[Optional[str]] = mapped_column(Text, primary_key=True)
    chapter: Mapped[Optional[str]] = mapped_column(Text)
    parent_code: Mapped[Optional[str]] = mapped_column(Text)
    root_code: Mapped[Optional[str]] = mapped_column(Text)
    title: Mapped[Optional[str]] = mapped_column(Text)
    figure: Mapped[Optional[str]] = mapped_column(Text)
    table: Mapped[Optional[str]] = mapped_column(Text)
    content: Mapped[Optional[str]] = mapped_column(Text)
    section_code: Mapped[Optional[str]] = mapped_column(Text)
    section_title: Mapped[Optional[str]] = mapped_column(Text)
    sort_index: Mapped[Optional[int]] = mapped_column(Integer)


class ResourceCodesTableOfContents(Base):
    __tablename__ = 'resource_codes_table_of_contents'

    title: Mapped[Optional[str]] = mapped_column(Text)
    section: Mapped[Optional[str]] = mapped_column(Text, primary_key=True)


class ResourceTerms(Base):
    __tablename__ = 'resource_terms'

    term: Mapped[Optional[str]] = mapped_column(Text, primary_key=True)
    definition: Mapped[Optional[str]] = mapped_column(Text)
