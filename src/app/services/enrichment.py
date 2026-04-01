from sqlalchemy import select, cast, Integer
from sqlalchemy import select, or_

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Agencies, AgencyStandards, MapCodeStandard, CodesTable
from app.services.codes import code_service
from app.services.agencies import agency_service
from app.services.committee_designation import committee_designation_service
from app.services.index import index_service
import logging

class EnrichmentService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def enrich_code(self, session: AsyncSession, code: str):
        code_row, chapter_info = await code_service.get_code_with_ch_metadata(session, code)
        standards = await agency_service.get_standards_by_code(session, code)
        committee_designations = await committee_designation_service.get_committee_designations_by_code(session, code)
        index_terms = await index_service.get_terms_by_code(session, code)
        return code_row, chapter_info, standards, committee_designations, index_terms

enrichment_service = EnrichmentService()