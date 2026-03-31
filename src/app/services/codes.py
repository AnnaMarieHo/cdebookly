from sqlalchemy import select, or_, cast, Float
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.schemas import Code
from app.models.models import CodesTable, CodesTableOfContents, Chapters, CommitteeDesignation
from app.services.chapter_lookup import resolve_chapter_row

import logging

class CodeService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def get_codes(self, session: AsyncSession, limit: int ):
        query = select(CodesTable).order_by(CodesTable.sort_index.asc()).limit(limit)
        result = await session.execute(query)
        return result.scalars().all()

    async def get_code(self, session: AsyncSession, code: str):
        query = select(CodesTable).where(CodesTable.code == code)
        result = await session.execute(query)

        code_row = result.scalar_one_or_none()
        chapter_info = None
        if code_row:
            chapter_info = await resolve_chapter_row(session, code_row)
        return code_row, chapter_info



    async def get_codes_by_chapter(self, session: AsyncSession, chapter: str):
        query = (
            select(CodesTable)
            .where(CodesTable.chapter == chapter)
            .order_by(CodesTable.sort_index.asc())
        )

        result = await session.execute(query)
        return result.scalars().all()


code_service = CodeService()