"""Tests for vision provider fallback logic."""

from unittest.mock import AsyncMock, patch

import pytest

from app.models import DailyIntake, UserProfile
from app.vision import analyze_food
from tests.conftest import MOCK_ANALYSIS_RESULT


@pytest.mark.anyio
async def test_gemini_success():
    """When Gemini succeeds, result comes from gemini provider."""
    with patch("app.vision.analyze_with_gemini", new_callable=AsyncMock) as mock_gem:
        mock_gem.return_value = MOCK_ANALYSIS_RESULT
        result, provider = await analyze_food("dGVzdA==", "image/jpeg", None)
        assert provider == "gemini"
        assert result.food_name == "Masala Dosa"
        assert result.general_health_score == 65
        assert result.personal_health_score == 40
        mock_gem.assert_called_once()


@pytest.mark.anyio
async def test_gemini_fails_groq_succeeds():
    """When Gemini fails, Groq is used as fallback."""
    with (
        patch("app.vision.analyze_with_gemini", new_callable=AsyncMock) as mock_gem,
        patch("app.vision.analyze_with_groq", new_callable=AsyncMock) as mock_groq,
    ):
        mock_gem.side_effect = RuntimeError("Gemini down")
        mock_groq.return_value = MOCK_ANALYSIS_RESULT
        result, provider = await analyze_food("dGVzdA==", "image/jpeg", None)
        assert provider == "groq"
        assert result.food_name == "Masala Dosa"


@pytest.mark.anyio
async def test_both_providers_fail():
    """When both providers fail, a RuntimeError is raised."""
    with (
        patch("app.vision.analyze_with_gemini", new_callable=AsyncMock) as mock_gem,
        patch("app.vision.analyze_with_groq", new_callable=AsyncMock) as mock_groq,
    ):
        mock_gem.side_effect = RuntimeError("Gemini down")
        mock_groq.side_effect = RuntimeError("Groq down")
        with pytest.raises(RuntimeError, match="both Gemini and Groq failed"):
            await analyze_food("dGVzdA==", "image/jpeg", None)


@pytest.mark.anyio
async def test_profile_passed_to_prompt():
    """Profile is correctly forwarded through the analysis chain."""
    profile = UserProfile(conditions=["diabetic"], goals=["reduce_sugar"], allergies=[])
    with patch("app.vision.analyze_with_gemini", new_callable=AsyncMock) as mock_gem:
        mock_gem.return_value = MOCK_ANALYSIS_RESULT
        await analyze_food("dGVzdA==", "image/jpeg", profile)
        prompt = mock_gem.call_args[0][2]
        assert "diabetic" in prompt
        assert "reduce_sugar" in prompt


@pytest.mark.anyio
async def test_daily_intake_passed_to_prompt():
    """Daily intake context is forwarded to the prompt."""
    intake = DailyIntake(
        total_calories=800, total_sugar_g=30, meals_logged=1, items=["idli"]
    )
    with patch("app.vision.analyze_with_gemini", new_callable=AsyncMock) as mock_gem:
        mock_gem.return_value = MOCK_ANALYSIS_RESULT
        await analyze_food("dGVzdA==", "image/jpeg", None, daily_intake=intake)
        prompt = mock_gem.call_args[0][2]
        assert "800" in prompt
        assert "idli" in prompt


@pytest.mark.anyio
async def test_meal_items_in_result():
    """Result includes meal_items breakdown."""
    with patch("app.vision.analyze_with_gemini", new_callable=AsyncMock) as mock_gem:
        mock_gem.return_value = MOCK_ANALYSIS_RESULT
        result, _ = await analyze_food("dGVzdA==", "image/jpeg", None)
        assert len(result.meal_items) == 2
        assert result.meal_items[0].name == "Dosa crepe"
        assert result.meal_items[1].name == "Potato masala"
