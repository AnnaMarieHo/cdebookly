from fastapi import APIRouter, HTTPException, Form, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.schemas import EnrichedCode, Code, TableOfContents, AgencyStandards, CommitteeDesignation, IndexTerm, IndexReference
from app.database.db import get_async_session
import logging
import app.services.codes as code_service
from app.services.enrichment import enrichment_service
log = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["codes"])

code_service = code_service.CodeService()

@router.get("/codes")
async def root(
    limit: int = 10, 
    session: AsyncSession = Depends(get_async_session)
):
    codes = await code_service.get_codes(session, limit)
    return [Code.model_validate(code) for code in codes]


@router.get("/code/{code}")
async def get_code_with_ch_metadata(
    code: str,
    session: AsyncSession = Depends(get_async_session)
):
    code_row, chapter_info = await code_service.get_code(session, code)
    if not code_row:
        raise HTTPException(status_code=404, detail="Code not found")
    return {
        "chapter_metadata": {
            "title": chapter_info.title if chapter_info else "Appendix/Other",
            "description": chapter_info.description if chapter_info else ""
        },
        "code": Code.model_validate(code_row)
    }


@router.get("/get-codes-by-chapter/{chapter}")
async def get_codes_by_chapter(
    chapter: str,
    session: AsyncSession = Depends(get_async_session)
):
    codes = await code_service.get_codes_by_chapter(session, chapter)
    return [Code.model_validate(code) for code in codes]

@router.get("/codes-full-context/{code}")
async def get_full_code_context(
    code: str, 
    session: AsyncSession = Depends(get_async_session)
):

    code_row, chapter_info, standards, committee_designations, index_terms = await enrichment_service.enrich_code(session, code)

    standards_list = []
    for standard in standards:
        standards_list.append({
            "agency": standard.agency,
            "standard_id": standard.standard_id,
            "definition": standard.definition,
        })

    return EnrichedCode.model_validate({
        "code": code_row,
        "chapter_info": chapter_info,
        "standards": standards_list,
        "committee_designations": [CommitteeDesignation.model_validate(row) for row in committee_designations],
        "index_terms": [IndexReference.model_validate(row) for row in index_terms]
    })



