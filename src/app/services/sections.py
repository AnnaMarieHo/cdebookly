from sqlalchemy import select, cast, Integer
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import CodesTableOfContents, CodesTable
from app.services.chapter_lookup import resolve_chapter_row

import logging

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
        query = select(CodesTableOfContents).order_by(cast(CodesTableOfContents.section, Integer).asc())
        result = await session.execute(query)
        return result.scalars().all()


section_service = SectionService()