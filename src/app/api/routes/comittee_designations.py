from fastapi import APIRouter, HTTPException, Form, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.schemas.schemas import CommitteeDesignation, Code
from app.database.db import get_async_session

import logging
from app.services.committee_designation import committee_designation_service

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["committee_designations"])


@router.get("/committee-designations")
async def get_committee_designations(
    session: AsyncSession = Depends(get_async_session)
):
    committee_designations = await committee_designation_service.get_committee_designations(session)
    return [CommitteeDesignation.model_validate(committee_designation) for committee_designation in committee_designations]

@router.get("/get-codes-by-designation/{designation}")
async def get_codes_by_designation(
    limit: int=10,
    designation: str=None,
    session: AsyncSession = Depends(get_async_session)
):
    codes = await committee_designation_service.get_codes_by_designation(session, designation, limit)
    return [Code.model_validate(code) for code in codes]

@router.get("/get-definitions-by-designation/{designation}")
async def get_definitions_by_designation(
    limit: int=10,
    designation: str=None,
    session: AsyncSession = Depends(get_async_session)
):
    definitions = await committee_designation_service.get_definitions_by_designation(session, designation, limit)
    definitions_list = []
    for definition, committee_designation in definitions:
        definitions_list.append(Definition.model_validate({
            "definition": definition.definition,
            "term": definition.term,
            "letter_tag": definition.letter_tag,
            "committee_designation": committee_designation.description if committee_designation else "No committee designation",
        }))
    return definitions_list