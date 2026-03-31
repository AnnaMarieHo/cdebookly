import json
import logging
import os
from typing import Any

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.schemas import (
    ChatbotRequest,
    CommitteeDesignation,
    EnrichedCode,
    IndexReference,
)
from app.services.enrichment import enrichment_service

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b:free"

SYSTEM_PROMPT = """You are a study assistant for the international plumbing codebook.

The user message includes a section CODE CONTEXT: a JSON object with an "entries" array. Each entry is either full enriched codebook data (fields like code, chapter_info, standards, committee_designations, index_terms) or an object with "found": false and "requested_code" if that id was not in the database. Use that context when it helps answer. If "entries" is empty or no usable code text is present, still answer tasks that do not require code text; for code-specific tasks, briefly ask the user to select codes in the app first.

When the user asks for a multiple-choice quiz based on the codes:
- Use clear Markdown: a short intro line, then for each question use a #### heading (e.g. #### Question 1), the stem, options labeled A–D on separate lines, then a line **Answer:** with the letter and a one-line rationale.

When the user asks to paraphrase or rewrite "this code" with context:
- Paraphrase the regulatory / technical meaning in plain language without changing requirements or dropping mandatory conditions. Keep defined terms recognizable.

Otherwise respond helpfully and concisely in Markdown when structure helps (headings, lists, bold for key terms)."""


async def _enrichment_entry_for_code(session: AsyncSession, code: str) -> dict[str, Any]:
    code_row, chapter_info, standards, committee_designations, index_terms = (
        await enrichment_service.enrich_code(session, code)
    )
    if not code_row:
        return {"found": False, "requested_code": code}

    standards_list = [
        {
            "agency": standard.agency,
            "standard_id": standard.standard_id,
            "definition": standard.definition,
        }
        for standard in standards
    ]
    enriched = EnrichedCode.model_validate(
        {
            "code": code_row,
            "chapter_info": chapter_info,
            "standards": standards_list,
            "committee_designations": [
                CommitteeDesignation.model_validate(row) for row in committee_designations
            ],
            "index_terms": [IndexReference.model_validate(row) for row in index_terms],
        }
    )
    out: dict[str, Any] = {"found": True, **enriched.model_dump(mode="json")}
    return out


def _build_user_content(message: str, context_block: str) -> str:
    return (
        f"{message.strip()}\n\n---\n\nCODE CONTEXT:\n{context_block}"
    )


def _extract_message_content(data: dict[str, Any]) -> str | None:
    choices = data.get("choices")
    if not isinstance(choices, list) or not choices:
        return None
    first = choices[0]
    if not isinstance(first, dict):
        return None
    msg = first.get("message")
    if not isinstance(msg, dict):
        return None
    content = msg.get("content")
    if isinstance(content, str) and content.strip():
        return content.strip()
    return None


class ChatbotService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def handle(self, request: ChatbotRequest, session: AsyncSession) -> str:
        api_key = (os.getenv("OPENROUTER_API_KEY") or "").strip()
        if not api_key:
            return (
                "The chat assistant is not configured: set OPENROUTER_API_KEY in the "
                "server environment (OpenRouter API key)."
            )

        model = (os.getenv("OPENROUTER_MODEL") or DEFAULT_MODEL).strip()
        code_strings = list(dict.fromkeys(request.selected_code_ids))

        if not code_strings:
            context_obj: dict[str, Any] = {
                "entries": [],
                "note": "No codes selected — no code text provided.",
            }
        else:
            entries: list[dict[str, Any]] = []
            for code in code_strings:
                entries.append(await _enrichment_entry_for_code(session, code))
            context_obj = {"entries": entries}

        context_block = json.dumps(context_obj, indent=2, ensure_ascii=False)

        user_content = _build_user_content(request.message, context_block)

        self.logger.debug(
            "chat model=%s message_chars=%s codes=%s",
            model,
            len(user_content),
            code_strings,
        )

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        referer = os.getenv("OPENROUTER_HTTP_REFERER")
        if referer:
            headers["HTTP-Referer"] = referer
        title = os.getenv("OPENROUTER_APP_TITLE", "Codebookly")
        headers["X-OpenRouter-Title"] = title

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    OPENROUTER_URL, headers=headers, json=payload
                )
        except httpx.TimeoutException:
            self.logger.warning("OpenRouter request timed out")
            return "The model took too long to respond. Try a shorter message or fewer selected codes."
        except httpx.RequestError as e:
            self.logger.warning("OpenRouter request failed: %s", e)
            return "Could not reach the language model service. Check your network and try again."

        if response.status_code >= 400:
            self.logger.warning(
                "OpenRouter HTTP %s: %s",
                response.status_code,
                response.text[:500],
            )
            return (
                "The model returned an error. Verify OPENROUTER_API_KEY and quota, "
                "then try again."
            )

        try:
            data = response.json()
        except ValueError:
            self.logger.warning("OpenRouter non-JSON body")
            return "Received an invalid response from the model. Please try again."

        text = _extract_message_content(data)
        if text:
            return text

        self.logger.warning("OpenRouter missing message content: %s", str(data)[:300])
        return "The model did not return usable text. Try rephrasing your request."


chatbot_svc = ChatbotService()
