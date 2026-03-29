from sqlalchemy import select, cast, Integer, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import CommitteeDesignation, CodesTable, Definitions
import logging


class CommitteeDesignationService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def get_committee_designations(self, session: AsyncSession):
        query = select(CommitteeDesignation).order_by(CommitteeDesignation.letter_tag.asc())
        result = await session.execute(query)
        return result.scalars().all()

    async def get_committee_designations_by_code(self, session: AsyncSession, code: str):
        query = (
            select(CommitteeDesignation)
            .join(CodesTable, CommitteeDesignation.letter_tag == CodesTable.letter_tag)
            .where(CodesTable.code == code)
            .order_by(CommitteeDesignation.letter_tag.asc())
        )
        result = await session.execute(query)
        return result.scalars().all()

    async def get_codes_by_designation(self, session: AsyncSession, designation: str, limit: int):
        query = (
            select(CodesTable)
            .join(CommitteeDesignation, CodesTable.letter_tag == CommitteeDesignation.letter_tag)
            .where(func.lower(CommitteeDesignation.letter_tag) == func.lower(designation))
            .order_by(CodesTable.sort_index.asc())
            .limit(limit)
        )
        result = await session.execute(query)
        return result.scalars().all()
        

    async def get_definitions_by_designation(self, session: AsyncSession, designation: str, limit: int):
        query = (
            select(Definitions)
            .join(CommitteeDesignation, Definitions.letter_tag == CommitteeDesignation.letter_tag)
            .where(func.lower(CommitteeDesignation.letter_tag) == func.lower(designation))
            .order_by(Definitions.term.asc())
            .limit(limit)
        )
        result = await session.execute(query)
        return result.all()
committee_designation_service = CommitteeDesignationService()