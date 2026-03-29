from fastapi import APIRouter, HTTPException, Form, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.schemas.schemas import Chapter, Appendix
from app.database.db import get_async_session

import logging
import app.services.chapter as chapter_service

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chapters"])

chapter_service = chapter_service.ChapterService()


@router.get("/chapters")
async def root(
    session: AsyncSession = Depends(get_async_session)
):

    chapters = await chapter_service.get_chapters(session)
    return [Chapter.model_validate(chapter) for chapter in chapters]

@router.get("/appendix")
async def get_appendix(
    session: AsyncSession = Depends(get_async_session)
):
    appendix = await chapter_service.get_appendix(session)
    return [Appendix.model_validate(appendix) for appendix in appendix]


@router.get("/search-chapter-or-appendix/{search}")
async def get_chapter_appendix(
    search: str,
    session: AsyncSession = Depends(get_async_session)
):
    data_row, content_type = await chapter_service.get_chapter_appendix_by_search(session, search)
    
    if not data_row:
        raise HTTPException(status_code=404, detail="Chapter appendix not found")
    
    if content_type == "chapter":
        return Chapter.model_validate(data_row)
    return Appendix.model_validate(data_row)
