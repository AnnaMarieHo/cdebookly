from datetime import datetime, timezone
from math import ceil

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.schemas import Definition, DefinitionPage
from app.database.db import get_async_session

import logging
from app.services.definitions import definition_service

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["definitions"])

MAX_PAGE_SIZE = 100
DEFAULT_PAGE_SIZE = 24
MAX_EXPORT_ROWS = 50_000


@router.get("/definitions", response_model=DefinitionPage)
async def list_definitions_paginated(
    page: int = Query(1, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
    q: str | None = Query(
        None,
        description="Search term, definition text, or committee description (ilike)",
    ),
    letter_tag: str | None = Query(
        None,
        description="Filter by letter tag / designation (ilike)",
    ),
    session: AsyncSession = Depends(get_async_session),
):
    total = await definition_service.count_definitions(session, q, letter_tag)
    total_pages = ceil(total / page_size) if total > 0 else 0

    rows = await definition_service.get_definitions_page(
        session, page, page_size, q, letter_tag
    )
    items = [
        Definition.model_validate(definition_service.row_to_dict(d, c))
        for d, c in rows
    ]
    return DefinitionPage(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/definitions/export")
async def export_definitions_json(
    q: str | None = Query(None),
    letter_tag: str | None = Query(None),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Download definitions matching the same filters as the list (cap 50k rows).
    Prefer this over paging through /definitions in the client for large exports.
    """
    rows = await definition_service.get_definitions_for_export(
        session, q, letter_tag, max_rows=MAX_EXPORT_ROWS
    )
    payload = {
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "count": len(rows),
        "maxRowsCap": MAX_EXPORT_ROWS,
        "filters": {"q": q, "letter_tag": letter_tag},
        "definitions": [
            definition_service.row_to_dict(d, c) for d, c in rows
        ],
    }
    return JSONResponse(
        content=payload,
        headers={
            "Content-Disposition": 'attachment; filename="definitions-export.json"'
        },
    )


@router.get("/definition/{term}")
async def get_definition(
    term: str,
    session: AsyncSession = Depends(get_async_session),
):
    definitions = await definition_service.search_definition(session, term)
    definitions_list = []
    for definition, committee_designation in definitions:
        definitions_list.append(
            Definition.model_validate(
                definition_service.row_to_dict(
                    definition, committee_designation
                )
            )
        )
    return definitions_list
