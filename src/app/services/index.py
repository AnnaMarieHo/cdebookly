from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

# from app.models.models import IndexReferences, IndexTerms, MapIndexReferences
from app.models.models import IndexTerms, MapIndexReferences, CodesTable
import logging

class IndexService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)


    async def map_index_references(self, session: AsyncSession, limit: int):
        query = select(MapIndexReferences).join(IndexTerms, MapIndexReferences.id == IndexTerms.term_id).order_by(IndexTerms.term_id.asc()).limit(limit)
        result = await session.execute(query)
        return result.scalars().all()

    async def get_terms_by_code(self, session: AsyncSession, code: str):
        query = (
            select(MapIndexReferences)
            .join(IndexTerms, MapIndexReferences.id == IndexTerms.term_id)
            .where(MapIndexReferences.ref_id == code)
            .order_by(IndexTerms.term_id.asc())
        )
        result = await session.execute(query)
        return result.scalars().all()


    async def get_codes_by_term(self, session: AsyncSession, term: str):
        search_term = term.lower().strip()
        term_match = func.lower(MapIndexReferences.term) == search_term
        query = (
            select(CodesTable)
            .join(MapIndexReferences, CodesTable.code == MapIndexReferences.ref_id)
            .outerjoin(IndexTerms, MapIndexReferences.id == IndexTerms.term_id)
            .where(
                or_(
                    term_match,
                    func.lower(IndexTerms.term) == search_term,
                    func.lower(MapIndexReferences.label) == search_term,
                    func.lower(MapIndexReferences.breadcrumb).like(f"%{search_term}%"),
                )
            )
            .distinct()
            .order_by(CodesTable.sort_index.asc())
        )
        
        result = await session.execute(query)
        return result.scalars().all()

index_service = IndexService()