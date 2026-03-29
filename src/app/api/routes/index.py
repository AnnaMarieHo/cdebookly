from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

# from app.schemas.schemas import IndexReference, IndexTerm, IndexReference
from app.schemas.schemas import IndexReference, EnrichedCode, CommitteeDesignation, Code
from app.database.db import get_async_session

import logging
from app.services.index import index_service
from app.services.enrichment import enrichment_service

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["index"])


@router.get("/mapped-index-terms")
async def get_mapped_index_terms(
    limit: int = 10,
    session: AsyncSession = Depends(get_async_session)
):
    mapped_index_references = await index_service.map_index_references(session, limit)
    return [IndexReference.model_validate(mapped_index_reference) for mapped_index_reference in mapped_index_references]

@router.get("/get-terms-by-code/{code}")
async def get_terms_by_code(
    code: str,
    session: AsyncSession = Depends(get_async_session)
):

    references = await index_service.get_terms_by_code(session, code)
    return [IndexReference.model_validate(row) for row in references]

@router.get("/get-codes-by-term/{term}")
async def get_codes_by_term(
    term: str,
    session: AsyncSession = Depends(get_async_session)
):
    codes = await index_service.get_codes_by_term(session, term)
    return [Code.model_validate(code) for code in codes]
# @router.get("/get-codes-by-term/{term}")
# async def get_codes_by_term(
#     term: str,
#     session: AsyncSession = Depends(get_async_session)
# ):
#     codes = await index_service.get_codes_by_term(session, term)
#     codes_list = []
    
#     for code in codes:
#         code_row, chapter_info, standards, committee_designations, index_terms = await enrichment_service.enrich_code(session, code.code)
#         standards_list = []
#         for standard in standards:
#             standards_list.append({
#                 "agency": standard.agency,
#                 "standard_id": standard.standard_id,
#                 "definition": standard.definition,
#             })
#         codes_list.append({
#             "code": code_row,
#             "chapter_info": chapter_info,
#             "standards": standards_list,
#             "committee_designations": [CommitteeDesignation.model_validate(row) for row in committee_designations],
#             "index_terms": [IndexReference.model_validate(row) for row in index_terms]
#         })
#     return [EnrichedCode.model_validate(code) for code in codes_list]