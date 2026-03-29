"""Shared SQL conditions for resolving a CodesTable row to a Chapters row."""

from typing import Any

from sqlalchemy import cast, Float, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Chapters, CodesTable


def build_chapter_lookup_parts(code_row: CodesTable) -> list[Any]:
    parts: list[Any] = []

    def add_appendix_match(value: object) -> None:
        if value is None:
            return
        s = str(value).strip()
        if not s:
            return
        parts.append(Chapters.appendix == s)
        if s != s.upper():
            parts.append(Chapters.appendix == s.upper())

    raw_chapter_val = code_row.chapter
    if raw_chapter_val is not None and str(raw_chapter_val).strip() != "":
        rc = str(raw_chapter_val).strip()
        parts.append(Chapters.chapter == rc)
        add_appendix_match(rc)

    else:
        for key in (
            code_row.section_code,
            code_row.parent_code,
            code_row.root_code,
        ):
            add_appendix_match(key)

    return parts


async def resolve_chapter_row(
    session: AsyncSession, code_row: CodesTable
):
    parts = build_chapter_lookup_parts(code_row)
    if not parts:
        return None
    chap_query = select(Chapters).where(or_(*parts))
    chap_result = await session.execute(chap_query)
    return chap_result.scalar_one_or_none()
