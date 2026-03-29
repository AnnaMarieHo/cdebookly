from fastapi import APIRouter, Depends 
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.schemas import Section, TableOfContents
from app.database.db import get_async_session
from app.services.sections import section_service

import logging
log = logging.getLogger(__name__)


router = APIRouter(prefix="/api", tags=["sections"])

@router.get("/sections/{section}")
async def get_section_data(section: str, session: AsyncSession = Depends(get_async_session)):
    codes, chapter = await section_service.get_section_with_header(session, section)
    
    return {
        "chapter_metadata": {
            "title": chapter.title if chapter else "Section",
            "description": chapter.description if chapter else ""
        },
        "codes": [Section.model_validate(c) for c in codes]
    }

@router.get("/list-sections")
async def get_table_of_contents(
    session: AsyncSession = Depends(get_async_session)
):
    sections = await section_service.list_sections(session)
    return [TableOfContents.model_validate(section) for section in sections]

