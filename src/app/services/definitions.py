from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Definitions, CommitteeDesignation
import logging


class DefinitionService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def _base_select(self):
        return select(Definitions, CommitteeDesignation).outerjoin(
            CommitteeDesignation,
            Definitions.letter_tag == func.lower(CommitteeDesignation.letter_tag),
        )

    def _apply_filters(self, stmt, q: str | None, letter_tag: str | None):
        conditions = []
        if q and q.strip():
            qq = f"%{q.strip()}%"
            conditions.append(
                or_(
                    Definitions.term.ilike(qq),
                    Definitions.definition.ilike(qq),
                    CommitteeDesignation.description.ilike(qq),
                )
            )
        if letter_tag and letter_tag.strip():
            lt = f"%{letter_tag.strip()}%"
            conditions.append(
                or_(
                    Definitions.letter_tag.ilike(lt),
                    CommitteeDesignation.letter_tag.ilike(lt),
                )
            )
        if conditions:
            return stmt.where(and_(*conditions))
        return stmt

    def row_to_dict(self, definition: Definitions, committee_designation):
        return {
            "definition": definition.definition or "",
            "term": definition.term or "",
            "letter_tag": definition.letter_tag or "",
            "committee_designation": committee_designation.description
            if committee_designation
            else "No committee designation",
        }

    async def count_definitions(
        self,
        session: AsyncSession,
        q: str | None = None,
        letter_tag: str | None = None,
    ) -> int:
        stmt = self._apply_filters(self._base_select(), q, letter_tag)
        sub = stmt.subquery()
        count_stmt = select(func.count()).select_from(sub)
        result = await session.execute(count_stmt)
        return int(result.scalar_one() or 0)

    async def get_definitions_page(
        self,
        session: AsyncSession,
        page: int,
        page_size: int,
        q: str | None = None,
        letter_tag: str | None = None,
    ):
        stmt = self._apply_filters(self._base_select(), q, letter_tag)
        stmt = stmt.order_by(Definitions.term.asc()).offset(
            (page - 1) * page_size
        ).limit(page_size)
        result = await session.execute(stmt)
        return result.all()

    async def get_definitions_for_export(
        self,
        session: AsyncSession,
        q: str | None = None,
        letter_tag: str | None = None,
        max_rows: int = 50_000,
    ):
        stmt = self._apply_filters(self._base_select(), q, letter_tag)
        stmt = stmt.order_by(Definitions.term.asc()).limit(max_rows)
        result = await session.execute(stmt)
        return result.all()

    async def get_definitions(self, session: AsyncSession, limit: int):
        """Legacy: first N definitions ordered by term."""
        return await self.get_definitions_page(session, 1, limit, None, None)

    async def search_definition(self, session: AsyncSession, term: str):
        return await self.get_definitions_page(
            session, 1, 10_000, q=term, letter_tag=None
        )


definition_service = DefinitionService()
