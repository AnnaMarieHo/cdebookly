from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import CodesTableOfContents, CodesTable
from app.services.chapter_lookup import resolve_chapter_row

import logging


def _toc_section_sort_key(section: Optional[str]) -> tuple:
    """
    Sort table-of-contents section ids: numeric chapters first (2 before 10),
    then letter-prefixed appendices (A before B; A1 before A10). SQLite
    CAST(section AS INTEGER) is unsafe here — non-numeric values become 0.
    """
    if not section or not str(section).strip():
        return (99, "", 0, "")
    s = str(section).strip()
    if s.isdigit():
        return (0, "", int(s), s)
    i = 0
    while i < len(s) and s[i].isalpha():
        i += 1
    if i > 0:
        letters = s[:i].upper()
        tail = s[i:]
        num = int(tail) if tail.isdigit() else 0
        return (1, letters, num, s)
    return (2, s.upper(), 0, s)


class SectionService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def get_section_with_header(self, session: AsyncSession, section_code: str):
        code_query = (
            select(CodesTable)
            .where(CodesTable.root_code == section_code)
            .order_by(CodesTable.sort_index.asc())
        )
        codes_result = await session.execute(code_query)
        codes = codes_result.scalars().all()

        chapter_info = None
        for code_row in codes:
            chapter_info = await resolve_chapter_row(session, code_row)
            if chapter_info is not None:
                break

        return codes, chapter_info

    async def list_sections(self, session: AsyncSession):
        query = select(CodesTableOfContents)
        result = await session.execute(query)
        rows = list(result.scalars().all())
        rows.sort(key=lambda r: _toc_section_sort_key(r.section))
        return rows


section_service = SectionService()