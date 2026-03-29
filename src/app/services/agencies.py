from sqlalchemy import select, cast, Integer
from sqlalchemy import select, or_

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Agencies, AgencyStandards, MapCodeStandard, CodesTable
import logging


class AgencyService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def get_agencies(self, session: AsyncSession):
        query = select(Agencies).order_by(Agencies.agency.asc())
        result = await session.execute(query)
        return result.scalars().all()

    async def get_agency_standards(self, session: AsyncSession):
        query = select(AgencyStandards).order_by(AgencyStandards.agency.asc())
        result = await session.execute(query)
        return result.scalars().all()

    async def list_codes_with_standards(self, session: AsyncSession, limit: int):
        query = (
            select(Agencies, AgencyStandards, MapCodeStandard)
            .join(AgencyStandards, MapCodeStandard.standard_id == AgencyStandards.standard_id)
            .join(Agencies, AgencyStandards.agency == Agencies.agency)
            .limit(limit)
        )
        result = await session.execute(query)
        return result.all()

    async def get_codes_by_agency(self, session: AsyncSession, agency_name: str, limit: int):
        query = (
            select(CodesTable) 
            .join(MapCodeStandard, CodesTable.code == MapCodeStandard.code)
            .join(AgencyStandards, MapCodeStandard.standard_id == AgencyStandards.standard_id)
            .where(AgencyStandards.agency == agency_name.upper()) 
            .distinct()
            .order_by(CodesTable.sort_index.asc())
            .limit(limit)
        )
        
        result = await session.execute(query)
        return result.scalars().all()

    async def get_standards_by_code(self, session: AsyncSession, code: str):
        query = (
            select(
                MapCodeStandard.standard_id,
                AgencyStandards.agency,
                AgencyStandards.definition,
                AgencyStandards.codes,
                AgencyStandards.tables,
                AgencyStandards.images,
                AgencyStandards.raw_references,
                Agencies.agency_info
            )
            .distinct()
            .join(AgencyStandards, AgencyStandards.standard_id == MapCodeStandard.standard_id)
            .outerjoin(Agencies, Agencies.agency == AgencyStandards.agency)
            .where(MapCodeStandard.code == code)
            .order_by(MapCodeStandard.standard_id.asc())
        )
        
        result = await session.execute(query)
        return result.mappings().all()

agency_service = AgencyService()