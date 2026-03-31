from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.db import get_async_session
from app.schemas.schemas import ChatbotRequest, ChatbotResponse
from app.services.chatbot import chatbot_svc

router = APIRouter(prefix="/api", tags=["chatbot"])


@router.post("/chatbot")
async def chatbot_endpoint(
    body: ChatbotRequest,
    session: AsyncSession = Depends(get_async_session),
) -> ChatbotResponse:
    reply = await chatbot_svc.handle(body, session)
    return ChatbotResponse(message=reply)
