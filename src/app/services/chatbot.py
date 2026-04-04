import asyncio
import json
import logging
import os
import re
from typing import Any

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.schemas import (
    ChatbotRequest,
    CommitteeDesignation,
    ChatbotEnrichedCode,
    IndexReference,
)
from app.services.enrichment import enrichment_service
from app.services.chapter import chapter_service

# HF_URL = "https://router.huggingface.co/v1/chat/completions"

# HF_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Llama-8B"
# HF_MODEL = "meta-llama/Llama-3.3-70B-Instruct"
# HF_API_KEY = env.get("HF_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
# DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b:free"
DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b:free"

QUIZ_PROMPT = """You are a study assistant for the international plumbing codebook.

The user message includes a section CODE CONTEXT: a JSON object with an "entries" array. Each entry is either full enriched codebook data (fields like code, chapter_info, standards, committee_designations, index_terms) or an object with "found": false and "requested_code" if that id was not in the database. Use that context when it helps answer. If "entries" is empty or no usable code text is present, briefly ask the user to select codes in the app first.

When the user asks for a multiple-choice quiz based on the codes:
- Use clear Markdown: a short intro line, then for each question use a #### heading (e.g. #### Question 1), the stem, options labeled A–D on separate lines, then a line **Answer:** with the letter and a one-line rationale.

respond helpfully and concisely in Markdown when structure helps (headings, lists, bold for key terms)."""



PARAPHRASE_PROMPT = """
## ✏️ REWRITE MODE RULES

### Copyright-Safe Rephrasing Rule
The rewritten text must be structurally transformed. Do not mirror the original wording. Do not lightly paraphrase. Do not reuse distinctive sentence structure. You must:
- Change sentence flow
- Reorganize clause structure where possible
- Break compound sentences into clearer segments when appropriate
- Rephrase governing verbs
- Alter grammatical construction
- Avoid matching rhythm or phrasing of the source

However: You must preserve 100 percent of the technical meaning and all enforceable requirements. If the rewrite is too close to the original, regenerate with different structure.

### Structural Integrity Rule
Maintain the original logical relationships. Do not change hierarchy of requirements. Do not alter conditional relationships. Do not reinterpret intent. Do not explain rationale. You may rewrite wording but not restructure meaning.

### Simplified Version Rule
The simplified_body must:
- Be materially shorter than the rewritten body
- Preserve all enforceable meaning
- Preserve all numbers and standards
- Use direct regulatory verbs (Require, Prohibit, Provide, Limit)
- No incomplete sentences
- Do not simply rephrase the body again

RULES:
- Return a JSON object with a single key "rewrites" containing an array of objects.
- Each object in the array MUST include: "id", "body", and "simplified_body".
- "body": Structurally transformed, copyright-safe paraphrase using <br> for line breaks.
- "simplified_body": Shorter, direct version using regulatory verbs.

Example Output Format:
{
  "rewrites": [
    {"id": "xxx.x...", "body": "...", "simplified_body": "..."},
    ...
  ]
}
"""


GENERAL_PROMPT = """You are a study assistant for the international plumbing codebook.

The user message includes a section CODE CONTEXT: a JSON object with an "entries" array. Each entry is either full enriched codebook data (fields like code, chapter_info, standards, committee_designations, index_terms) or an object with "found": false and "requested_code" if that id was not in the database. Use that context when it helps answer. If "entries" is empty or no usable code text is present, briefly ask the user to select codes in the app first.

respond helpfully and concisely in Markdown when structure helps (headings, lists, bold for key terms)."""


async def _enrichment_entry_for_code(session: AsyncSession, code: str) -> dict[str, Any]:
    code_row, chapter_info, standards, committee_designations, index_terms = (
        await enrichment_service.enrich_code(session, code)
    )
    if not code_row:
        return {"found": False, "requested_code": code}

    code_info_list = {
        "content": code_row.content,
        "section_title": code_row.section_title,
        "section_code": code_row.section_code,
        "code": code_row.code,
        "parent_code": code_row.parent_code,
    }

    standards_list = [
        {
            "agency": standard.agency,
            "standard_id": standard.standard_id,
            "definition": standard.definition,
        }
        for standard in standards if standard
    ]
    enriched = ChatbotEnrichedCode.model_validate(
        {
            "code": code_info_list,
            "standards": standards_list,
            "committee_designations": [
                CommitteeDesignation.model_validate(row) for row in committee_designations
            ],
            "index_terms": [IndexReference.model_validate(row) for row in index_terms],
        }
    )

    cleaned_data = enriched.model_dump(mode="json", exclude_none=True, exclude_unset=True, exclude_defaults=True)
    # out: dict[str, Any] = {"found": True, **enriched.model_dump(mode="json", exclude_none=True)}
    return cleaned_data


def _build_user_content(message: str, context_block: str) -> str:
    return (
        f"CODE CONTEXT:\n{context_block}\n\n---\n\n{message.strip()}"
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
        # Remove everything between <think> and </think> inclusive
        clean_content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)
        return clean_content.strip()
    return None


def get_prompt(mode: str) -> str:
    if mode == "quiz":
        return QUIZ_PROMPT
    elif mode == "paraphrase":
        return PARAPHRASE_PROMPT
    else:
        return GENERAL_PROMPT


def _chapter_display_label(chapter_info: dict[str, Any] | None) -> str:
    if not chapter_info:
        return "Unknown"
    return (
        # chapter_info.get("description")
        chapter_info.get("title")
        or chapter_info.get("about")
        or "Unknown"
    )


class ChatbotService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def _process_batch(
        self,
        client: httpx.AsyncClient,
        chunk: list[dict[str, Any]],
        chapter_info: dict[str, Any] | None,
        prompt: str,
        api_key: str,
        model: str,
    ) -> list[dict[str, Any]]:
        """Worker: processes up to 6 codes with optional chapter context."""
        chapter_context = ""
        if chapter_info:
            # desc = (chapter_info.get("description") or "").strip()
            desc = (chapter_info.get("title") or "").strip()
            # about = (chapter_info.get("about") or "").strip()
            # line = " — ".join(p for p in (desc, about) if p)
            line = desc
            chapter_context = f"CHAPTER CONTEXT: {line}\n\n" if line else ""

        batch_input: list[dict[str, Any]] = []
        for e in chunk:
            if "code" not in e:
                continue
            standards_str = ", ".join(
                f"{s['standard_id']}: {s['definition']}"
                for s in e.get("standards", [])
                if isinstance(s, dict) and s.get("standard_id") is not None
            )
            batch_input.append(
                {
                    "id": e["code"]["code"],
                    "title": e["code"]["section_title"],
                    "content": e["code"]["content"],
                    "referenced_standards": standards_str,
                }
            )

        if not batch_input:
            return []

        full_system_prompt = f"{prompt}\n\n{chapter_context}".rstrip()

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": full_system_prompt},
                {"role": "user", "content": f"PROCESS THESE ENTRIES:\n{json.dumps(batch_input)}"},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.5,
        }

        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

        try:
            response = await client.post(OPENROUTER_URL, headers=headers, json=payload)
            response.raise_for_status()
            raw_text = _extract_message_content(response.json())
            if not raw_text:
                return []
            parsed = json.loads(raw_text)
            return parsed.get("rewrites", []) if isinstance(parsed, dict) else []
        except Exception as e:
            self.logger.error("Batch failed: %s", e)
            return []

    async def _handle_paraphrase(
        self,
        request: ChatbotRequest,
        session: AsyncSession,
        api_key: str,
        model: str,
    ) -> str:
        code_ids = list(dict.fromkeys(request.selected_code_ids))
        chapter_info: dict[str, Any] | None = None
        if code_ids:
            chapter_info = await chapter_service.get_chapter_by_code(session, code_ids[0])

        all_enriched_entries: list[dict[str, Any]] = []
        for cid in code_ids:
            all_enriched_entries.append(await _enrichment_entry_for_code(session, cid))

        batch_size = 6
        chunks = [
            all_enriched_entries[i : i + batch_size]
            for i in range(0, len(all_enriched_entries), batch_size)
        ]
        prompt = get_prompt("paraphrase")
        chapter_label = _chapter_display_label(chapter_info)

        async with httpx.AsyncClient(timeout=120.0) as client:
            tasks = [
                self._process_batch(client, chunk, chapter_info, prompt, api_key, model)
                for chunk in chunks
            ]
            nested_results = await asyncio.gather(*tasks)

        llm_rewrites = [item for sublist in nested_results for item in sublist]
        rewrite_map: dict[str, Any] = {str(item["id"]): item for item in llm_rewrites if isinstance(item, dict) and "id" in item}

        final_ui_data: list[dict[str, Any]] = []
        for entry in all_enriched_entries:
            if entry.get("found") is False:
                cid = str(entry.get("requested_code", ""))
                final_ui_data.append(
                    {
                        "code": cid,
                        "chapter": chapter_label,
                        "section_title": "Not found",
                        "body": "",
                        "simplified_body": "N/A",
                        "standards": [],
                        "found": False,
                    }
                )
                continue

            cid = str(entry["code"]["code"])
            rw = rewrite_map.get(cid, {})
            final_ui_data.append(
                {
                    "code": cid,
                    "chapter": chapter_label,
                    "section_title": entry["code"]["section_title"],
                    "body": rw.get("body", entry["code"]["content"]),
                    "simplified_body": rw.get("simplified_body", "Not required"),
                    "standards": entry.get("standards", []),
                    "found": True,
                }
            )

        return json.dumps(final_ui_data)

    async def _handle_chat_modes(
        self,
        request: ChatbotRequest,
        session: AsyncSession,
        api_key: str,
        model: str,
    ) -> str:
        code_strings = list(dict.fromkeys(request.selected_code_ids))
        chapter_info = None
        if code_strings:
            chapter_info = await chapter_service.get_chapter_by_code(session, code_strings[0])

        entries: list[dict[str, Any]] = []
        for code in code_strings:
            entries.append(await _enrichment_entry_for_code(session, code))

        context_obj: dict[str, Any] = {
            "entries": entries,
            "chapter_info": chapter_info,
        }
        if not code_strings:
            context_obj["note"] = "No codes selected — no code text provided."

        context_block = json.dumps(context_obj, default=str)
        user_content = _build_user_content(request.message, context_block)
        prompt = get_prompt(request.mode)

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_content},
            ],
            "temperature": 0.5,
        }
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(OPENROUTER_URL, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
            raw = _extract_message_content(data)
            return (raw or "").strip() or "No response from the model."
        except Exception as e:
            self.logger.error("Chat completion failed: %s", e)
            return "The assistant could not complete this request. Try again later."

    async def handle(self, request: ChatbotRequest, session: AsyncSession) -> str:
        api_key = (os.getenv("OPENROUTER_API_KEY") or "").strip()
        if not api_key:
            return (
                "The chat assistant is not configured: set KEY in the "
                "server environment."
            )
        model = (os.getenv("OPENROUTER_MODEL") or DEFAULT_MODEL).strip()

        if request.mode == "paraphrase":
            return await self._handle_paraphrase(request, session, api_key, model)
        return await self._handle_chat_modes(request, session, api_key, model)


chatbot_svc = ChatbotService()
