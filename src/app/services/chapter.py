from sqlalchemy import select, cast, Integer
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Chapters, CodesTable
import logging

class ChapterService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def get_chapters(self, session: AsyncSession):
        query = select(Chapters).where(Chapters.chapter != '').order_by(cast(Chapters.chapter, Integer).asc())
        result = await session.execute(query)
        return result.scalars().all()

    async def get_appendix(self, session: AsyncSession):
        query = select(Chapters).where(Chapters.appendix != '').order_by(Chapters.appendix.asc())
        result = await session.execute(query)
        return result.scalars().all()

    async def get_chapter_appendix(self, session: AsyncSession, chapter: str):
        query = select(Chapters).where(Chapters.chapter == chapter)
        result = await session.execute(query)
        return result.scalar_one_or_none()

    async def get_chapter_appendix_by_search(self, session: AsyncSession, search: str):
        if search.isdigit():
            query = select(Chapters).where(Chapters.chapter == search)
            result = await session.execute(query)
            return result.scalar_one_or_none(), "chapter"
        else:
            query = select(Chapters).where(Chapters.appendix == search.upper())
            result = await session.execute(query)
            return result.scalar_one_or_none(), "appendix"

    async def get_chapter_by_code(self, session: AsyncSession, code: str):
        query = select(Chapters, CodesTable).join(CodesTable, Chapters.chapter == CodesTable.chapter).where(CodesTable.code == code)
        result = await session.execute(query)
        chapter_row = result.scalar_one_or_none()
        return_val = {"about": chapter_row.about, "description": chapter_row.description}
        return return_val

chapter_service = ChapterService()