from fastapi import APIRouter, HTTPException, Form, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.schemas.schemas import Agency, AgencyStandards, Code, EnrichedCode, CommitteeDesignation, IndexReference
from app.database.db import get_async_session
from app.services.enrichment import enrichment_service

import logging
from app.services.agencies import agency_service

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["agencies"])


@router.get("/agencies")
async def get_agencies(
    session: AsyncSession = Depends(get_async_session)
):
    agencies = await agency_service.get_agencies(session)
    return [Agency.model_validate(agency) for agency in agencies]


@router.get("/agency-standards")
async def get_agency_standards(
    session: AsyncSession = Depends(get_async_session)
):
    agency_standards = await agency_service.get_agency_standards(session)
    return [AgencyStandards.model_validate(agency_standard) for agency_standard in agency_standards]

@router.get("/codes-with-agency-standards")
async def get_codes_with_agency_standards( limit: int=10, session: AsyncSession = Depends(get_async_session)):
    results = await agency_service.list_codes_with_standards(session, limit)
    
    response_data = []
    for agency_obj, standard_obj, map_obj in results:
        response_data.append({
            "code": map_obj.code,
            "agency": Agency.model_validate(agency_obj) if agency_obj else None,
            "standard": {
                "id": standard_obj.standard_id,
                "definition": standard_obj.definition,
                "references": standard_obj.raw_references
            }
        })
    
    return response_data


@router.get("/get-codes-by-agency/{agency}")
async def get_codes_by_agency(
    limit: int=10,
    agency: str=None,
    session: AsyncSession = Depends(get_async_session)
):
    codes_list = []
    codes = await agency_service.get_codes_by_agency(session, agency, limit)
    for code in codes:
        code_row, chapter_info, standards, committee_designations, index_terms = await enrichment_service.enrich_code(session, code.code)
        standards_list = []
        for standard in standards:
            standards_list.append({
                "agency": standard.agency,
                "standard_id": standard.standard_id,
                "definition": standard.definition,
            })
        codes_list.append({
            "code": code_row,
            "chapter_info": chapter_info,
            "standards": standards_list,
            "committee_designations": [CommitteeDesignation.model_validate(row) for row in committee_designations],
            "index_terms": [IndexReference.model_validate(row) for row in index_terms]
        })
    return [EnrichedCode.model_validate(code) for code in codes_list]
