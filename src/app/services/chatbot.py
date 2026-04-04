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
DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b:free"

QUIZ_PROMPT = """You are a study assistant for the international plumbing codebook.

The user message includes a section CODE CONTEXT: a JSON object with an "entries" array. Each entry is either full enriched codebook data (fields like code, chapter_info, standards, committee_designations, index_terms) or an object with "found": false and "requested_code" if that id was not in the database. Use that context when it helps answer. If "entries" is empty or no usable code text is present, briefly ask the user to select codes in the app first.

When the user asks for a multiple-choice quiz based on the codes:
- Use clear Markdown: a short intro line, then for each question use a #### heading (e.g. #### Question 1), the stem, options labeled A–D on separate lines, then a line **Answer:** with the letter and a one-line rationale.

respond helpfully and concisely in Markdown when structure helps (headings, lists, bold for key terms)."""



PARAPHRASE_PROMPT = """You are a study assistant for the international plumbing codebook.

The user message includes a section CODE CONTEXT: a JSON object with an "entries" array. Each entry is either full enriched codebook data (fields like code, chapter_info, standards, committee_designations, index_terms) or an object with "found": false and "requested_code" if that id was not in the database. Use that context when it helps answer. If "entries" is empty or no usable code text is present, briefly ask the user to select codes in the app first.

When the user asks to paraphrase or rewrite "this code" with context:
- Paraphrase the regulatory / technical meaning in plain language without changing requirements or dropping mandatory conditions. Keep defined terms recognizable.

respond helpfully and concisely in Markdown (headings, lists, bold for key terms).
You are a plumbing code expert. 
For each code provided, provide a natural-language paraphrase.

STYLE RULE: Use 'Simplified Technical English.' Break complex regulatory sentences into two or more short, direct sentences. Use active verbs (e.g., 'The official issues' instead of 'An annual permit can be issued'). Avoid preamble.

FORMATTING RULES:
1. Use a Markdown table with two columns: 'Code' and 'Natural-Language Summary'.
2. Use bold text for the code numbers.
3. Ensure each row is distinct so the UI renders clear lines between them.
"""


GENERAL_PROMPT = """You are a study assistant for the international plumbing codebook.

The user message includes a section CODE CONTEXT: a JSON object with an "entries" array. Each entry is either full enriched codebook data (fields like code, chapter_info, standards, committee_designations, index_terms) or an object with "found": false and "requested_code" if that id was not in the database. Use that context when it helps answer. If "entries" is empty or no usable code text is present, briefly ask the user to select codes in the app first.

respond helpfully and concisely in Markdown when structure helps (headings, lists, bold for key terms)."""


async def _enrichment_entry_for_code(session: AsyncSession, code: str) -> dict[str, Any]:
    # print(f"Enriching code: {code}")
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
    # if isinstance(content, str) and content.strip():
    #     return content.strip()
    if isinstance(content, str) and content.strip():
        # Remove everything between <think> and </think> inclusive
        clean_content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)
        return clean_content.strip()
    return None


def get_prompt(mode: str) -> str:
    if mode == "quiz":
        print(QUIZ_PROMPT)
        return QUIZ_PROMPT
    elif mode == "paraphrase":
        print(PARAPHRASE_PROMPT)
        return PARAPHRASE_PROMPT
    else:
        return GENERAL_PROMPT

class ChatbotService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def handle(self, request: ChatbotRequest, session: AsyncSession) -> str:
        api_key = (os.getenv("OPENROUTER_API_KEY") or "").strip()
        # api_key = (os.getenv("HF_TOKEN") or "").strip()
        if not api_key:
            return (
                "The chat assistant is not configured: set KEY in the "
                "server environment."
            )
        model = (os.getenv("OPENROUTER_MODEL") or DEFAULT_MODEL).strip()
        # model = (os.getenv("HF_MODEL") or HF_MODEL).strip()        
        # model = "deepseek-ai/DeepSeek-R1-Distill-Llama-8B:nscale"     
        code_strings = list(dict.fromkeys(request.selected_code_ids))
        
        if code_strings:
            chapter_info = await chapter_service.get_chapter_by_code(session, code_strings[0])
        else:
            chapter_info = None

        if not code_strings:
            context_obj: dict[str, Any] = {
                "entries": [],
                "note": "No codes selected — no code text provided.",
            }
        else:
            entries: list[dict[str, Any]] = []
            for code in code_strings:
                entries.append(await _enrichment_entry_for_code(session, code))
            context_obj = {"entries": entries, "chapter_info": chapter_info}

        context_block = json.dumps(context_obj, indent=2, ensure_ascii=False)
        print(json.dumps(context_obj, indent=2, ensure_ascii=False))
        user_content = _build_user_content(request.message, context_block)        
        prompt = get_prompt(request.mode)

        # payload = {
        #     "model": model,
        #     "messages": [
        #         {"role": "system", "content": prompt},
        #         {"role": "user", "content": user_content},
        #     ],
        # }
        payload = {
            "model": model,
            "messages": [
                # NOTE: DeepSeek-R1 performs better with instructions in the User role
                {"role": "user", "content": f"{prompt}\n\n{user_content}"},
            ],
            "temperature": 0.6, # Recommended for DeepSeek-R1 to prevent repetition
            "max_tokens": 2048,
            "stream": False
        }
        print(json.dumps(payload, indent=2, ensure_ascii=False))

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        # referer = os.getenv("OPENROUTER_HTTP_REFERER")
        # if referer:
        #     headers["HTTP-Referer"] = referer
        # title = os.getenv("OPENROUTER_APP_TITLE", "Codebookly")
        # headers["X-OpenRouter-Title"] = title

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                # response = await client.post(
                #     HF_URL,
                #     headers=headers, 
                #     json=payload
                # )
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
        return f"DEBUG_RAW_DATA: {json.dumps(data, indent=2, ensure_ascii=False)}"


chatbot_svc = ChatbotService()
