"""Vision API providers with automatic fallback: Gemini (primary) → Groq (fallback)."""

import asyncio
import json
import logging
import time

import google.generativeai as genai
from groq import Groq

from app.config import settings
from app.models import AnalysisResult, DailyIntake, UserProfile
from app.prompt import build_prompt

logger = logging.getLogger(__name__)

GEMINI_TIMEOUT = 15
GROQ_TIMEOUT = 15


async def analyze_with_gemini(
    image_b64: str, mime_type: str, prompt: str
) -> dict:
    """Analyze food image using Google Gemini 2.0 Flash."""
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")

    image_part = {"inline_data": {"mime_type": mime_type, "data": image_b64}}

    def _call() -> str:
        response = model.generate_content(
            [prompt, image_part],
            generation_config=genai.GenerationConfig(
                temperature=0.3,
                max_output_tokens=2048,
                response_mime_type="application/json",
            ),
        )
        return response.text

    text = await asyncio.wait_for(
        asyncio.get_event_loop().run_in_executor(None, _call),
        timeout=GEMINI_TIMEOUT,
    )
    return json.loads(text)


async def analyze_with_groq(
    image_b64: str, mime_type: str, prompt: str
) -> dict:
    """Analyze food image using Groq Llama 4 Scout Vision (fallback)."""
    client = Groq(api_key=settings.groq_api_key)
    data_url = f"data:{mime_type};base64,{image_b64}"

    def _call() -> str:
        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": data_url},
                        },
                    ],
                }
            ],
            temperature=0.3,
            max_tokens=2048,
            response_format={"type": "json_object"},
        )
        return response.choices[0].message.content

    text = await asyncio.wait_for(
        asyncio.get_event_loop().run_in_executor(None, _call),
        timeout=GROQ_TIMEOUT,
    )
    return json.loads(text)


async def analyze_food(
    image_b64: str,
    mime_type: str,
    profile: UserProfile | None,
    daily_intake: DailyIntake | None = None,
) -> tuple[AnalysisResult, str]:
    """Run food analysis with automatic fallback. Returns (result, provider)."""
    prompt = build_prompt(profile, daily_intake)
    start = time.monotonic()

    # Primary: Gemini
    try:
        raw = await analyze_with_gemini(image_b64, mime_type, prompt)
        elapsed = time.monotonic() - start
        logger.info("Gemini analysis completed in %.2fs", elapsed)
        return AnalysisResult(**raw), "gemini"
    except Exception as e:
        logger.warning("Gemini failed: %s. Falling back to Groq.", str(e))

    # Fallback: Groq
    try:
        raw = await analyze_with_groq(image_b64, mime_type, prompt)
        elapsed = time.monotonic() - start
        logger.info("Groq analysis completed in %.2fs", elapsed)
        return AnalysisResult(**raw), "groq"
    except Exception as e:
        logger.error("Both vision providers failed. Groq error: %s", str(e))
        raise RuntimeError(
            "Food analysis unavailable — both Gemini and Groq failed"
        ) from e
